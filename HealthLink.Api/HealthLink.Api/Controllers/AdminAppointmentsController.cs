using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/appointments")]
[Authorize(Roles = "Admin")]
public class AdminAppointmentsController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminAppointmentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminAppointmentListDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? expertType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Appointments
            .Include(a => a.Client)
            .Include(a => a.Expert)
            .AsQueryable();

        // Status filter
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<Entities.Enums.AppointmentStatus>(status, out var appointmentStatus))
        {
            query = query.Where(a => a.Status == appointmentStatus);
        }

        // Expert type filter
        if (!string.IsNullOrWhiteSpace(expertType) && Enum.TryParse<Entities.Enums.ExpertType>(expertType, out var expType))
        {
            query = query.Where(a => a.Expert.ExpertType == expType);
        }

        var appointments = await query
            .OrderByDescending(a => a.StartDateTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AdminAppointmentListDto
            {
                Id = a.Id,
                ClientId = a.ClientId,
                ClientName = a.Client.FirstName + " " + a.Client.LastName,
                ExpertId = a.ExpertId,
                ExpertName = a.Expert.DisplayName ?? "Uzman",
                ExpertType = a.Expert.ExpertType.ToString(),
                ServiceType = a.ServiceType,
                StartDateTime = a.StartDateTime,
                EndDateTime = a.EndDateTime,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(appointments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminAppointmentDetailDto>> GetById(long id)
    {
        var appointment = await _db.Appointments
            .Include(a => a.Client)
                .ThenInclude(c => c.User)
            .Include(a => a.Expert)
                .ThenInclude(e => e.User)
            .Include(a => a.ClientPackage)
                .ThenInclude(cp => cp!.ServicePackage)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
        {
            return NotFound();
        }

        var dto = new AdminAppointmentDetailDto
        {
            Id = appointment.Id,
            ClientId = appointment.ClientId,
            ClientName = appointment.Client.FirstName + " " + appointment.Client.LastName,
            ClientEmail = appointment.Client.User.Email,
            ExpertId = appointment.ExpertId,
            ExpertName = appointment.Expert.DisplayName ?? "Uzman",
            ExpertEmail = appointment.Expert.User.Email,
            ExpertType = appointment.Expert.ExpertType.ToString(),
            ClientPackageId = appointment.ClientPackageId,
            PackageName = appointment.ClientPackage?.ServicePackage?.Name,
            ServiceType = appointment.ServiceType,
            StartDateTime = appointment.StartDateTime,
            EndDateTime = appointment.EndDateTime,
            MeetingUrl = appointment.MeetingUrl,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt,
            UpdatedAt = appointment.UpdatedAt
        };

        return Ok(dto);
    }
}
