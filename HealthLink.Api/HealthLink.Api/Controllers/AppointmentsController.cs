using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Appointments;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentsController : BaseAuthenticatedController
{
    private readonly IAppointmentService _service;
    private readonly IDailyService _dailyService;
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public AppointmentsController(
        IAppointmentService service,
        IDailyService dailyService,
        AppDbContext db,
        IConfiguration configuration)
    {
        _service = service;
        _dailyService = dailyService;
        _db = db;
        _configuration = configuration;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var result = await _service.GetClientAppointmentsAsync(UserId);
        return Ok(result);
    }

    [HttpPost("{id}/create")]
    public async Task<IActionResult> Create(
        [FromBody] CreateAppointmentRequest request)
    {
        var result = await _service.CreateAsync(UserId, request);
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(long id)
    {
        await _service.CancelAsync(UserId, id);
        return NoContent();
    }

    [HttpPost("{id}/incomplete")]
    public async Task<IActionResult> Incomplete(long id)
    {
        await _service.MarkIncompleteAsync(UserId, id);
        return NoContent();
    }

    [HttpGet("expert")]
    public async Task<IActionResult> GetExpertAppointments()
    {
        var result = await _service.GetExpertAppointmentsAsync(UserId);
        return Ok(result);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(long id)
    {
        await _service.CompleteAsync(UserId, id);
        return NoContent();
    }

    [HttpGet("my-experts")]
    public async Task<IActionResult> GetMyExperts()
    {
        var result = await _service.GetMyExpertsAsync(UserId);
        return Ok(result);
    }

    // ───────── Daily.co Video Session Endpoints ─────────

    /// <summary>
    /// Expert starts a video session for the appointment.
    /// Creates a Daily.co room and returns meeting URL + token.
    /// </summary>
    [HttpPost("{id}/start-session")]
    public async Task<IActionResult> StartSession(long id)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Expert)
                .ThenInclude(e => e.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
            return NotFound(new { error = "Appointment not found." });

        // Only the expert of this appointment can start the session
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == UserId);
        if (expert == null || expert.Id != appointment.ExpertId)
            return Forbid();

        // Must be Scheduled or InProgress (expert can rejoin)
        if (appointment.Status != AppointmentStatus.Scheduled && appointment.Status != AppointmentStatus.InProgress)
            return BadRequest(new { error = "Appointment is not in a startable state." });

        // Can start at most 10 minutes before StartDateTime
        // Note: StartDateTime is stored in local time, so we use DateTime.Now
        var minutesBefore = (appointment.StartDateTime - DateTime.Now).TotalMinutes;
        if (minutesBefore > 10)
            return BadRequest(new { error = "Görüşme henüz başlatılamaz. En erken 10 dakika önce başlatabilirsiniz." });

        // Calculate room expiry
        var bufferMinutes = _configuration.GetValue<int>("Daily:RoomExpireBufferMinutes", 15);
        var roomExpiry = appointment.EndDateTime.AddMinutes(bufferMinutes);

        string roomName;
        string roomUrl;

        if (!string.IsNullOrEmpty(appointment.DailyRoomName))
        {
            // Room already exists — reuse it
            roomName = appointment.DailyRoomName;
            roomUrl = appointment.MeetingUrl!;
        }
        else
        {
            // Create a new Daily.co room
            (roomName, roomUrl) = await _dailyService.CreateRoomAsync(id, roomExpiry);

            // Update appointment
            appointment.DailyRoomName = roomName;
            appointment.MeetingUrl = roomUrl;
            appointment.Status = AppointmentStatus.InProgress;
            appointment.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        // Generate expert token
        var expertName = appointment.Expert.DisplayName ?? "Uzman";
        var token = await _dailyService.GetMeetingTokenAsync(
            roomName, UserId, expertName, isOwner: true, roomExpiry);

        return Ok(new MeetingSessionResponse
        {
            MeetingUrl = roomUrl,
            Token = token
        });
    }

    /// <summary>
    /// Client or Expert joins an active video session.
    /// Returns meeting URL + token for the authenticated participant.
    /// </summary>
    [HttpGet("{id}/join")]
    public async Task<IActionResult> JoinSession(long id)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Client)
            .Include(a => a.Expert)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
            return NotFound(new { error = "Appointment not found." });

        // Session must be InProgress
        if (appointment.Status != AppointmentStatus.InProgress || string.IsNullOrEmpty(appointment.DailyRoomName))
            return BadRequest(new { error = "Uzmanınız henüz görüşmeyi başlatmamış. Lütfen bekleyiniz." });

        // Verify participant
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == UserId);
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == UserId);

        bool isClient = client != null && client.Id == appointment.ClientId;
        bool isExpert = expert != null && expert.Id == appointment.ExpertId;

        if (!isClient && !isExpert)
            return Forbid();

        var bufferMinutes = _configuration.GetValue<int>("Daily:RoomExpireBufferMinutes", 15);
        var tokenExpiry = appointment.EndDateTime.AddMinutes(bufferMinutes);

        var displayName = isExpert
            ? (appointment.Expert.DisplayName ?? "Uzman")
            : $"{appointment.Client.FirstName} {appointment.Client.LastName}";

        var token = await _dailyService.GetMeetingTokenAsync(
            appointment.DailyRoomName, UserId, displayName, isOwner: isExpert, tokenExpiry);

        return Ok(new MeetingSessionResponse
        {
            MeetingUrl = appointment.MeetingUrl!,
            Token = token
        });
    }

    /// <summary>
    /// Complete a video session. Called by frontend when both participants leave.
    /// </summary>
    [HttpPost("{id}/complete-session")]
    public async Task<IActionResult> CompleteSession(long id)
    {
        var appointment = await _db.Appointments
            .Include(a => a.ClientPackage)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
            return NotFound(new { error = "Appointment not found." });

        // Verify participant
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == UserId);
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == UserId);

        bool isClient = client != null && client.Id == appointment.ClientId;
        bool isExpert = expert != null && expert.Id == appointment.ExpertId;

        if (!isClient && !isExpert)
            return Forbid();

        // Only complete if InProgress
        if (appointment.Status != AppointmentStatus.InProgress)
            return BadRequest(new { error = "Appointment is not in progress." });

        appointment.Status = AppointmentStatus.Completed;
        appointment.UpdatedAt = DateTime.UtcNow;

        // Increase used session count
        if (appointment.ClientPackage != null)
        {
            appointment.ClientPackage.UsedSessions++;
        }

        await _db.SaveChangesAsync();

        return NoContent();
    }
}
