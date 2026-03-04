using HealthLink.Api.Data;
using HealthLink.Api.Entities;
using HealthLink.Api.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/support-requests")]
[Authorize]
public class SupportRequestsController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;
    private readonly IHubContext<ChatHub> _hub;

    public SupportRequestsController(AppDbContext db, IHubContext<ChatHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    /// <summary>Client or Expert creates a support request</summary>
    [HttpPost]
    [Authorize(Roles = "Client,Expert")]
    public async Task<IActionResult> Create([FromBody] CreateSupportRequestDto dto)
    {
        var request = new SupportRequest
        {
            CreatedByUserId = UserId,
            Subject = dto.Subject,
            Description = dto.Description,
            Status = "Open",
            OperatorUserId = null, // starts in the pool
            CreatedAt = DateTime.UtcNow,
        };

        _db.SupportRequests.Add(request);
        await _db.SaveChangesAsync();

        return Ok(new { request.Id, request.Subject, request.Status, request.CreatedAt });
    }

    /// <summary>Client or Expert gets their own support requests</summary>
    [HttpGet("my")]
    [Authorize(Roles = "Client,Expert")]
    public async Task<IActionResult> GetMy()
    {
        var requests = await _db.SupportRequests
            .Where(r => r.CreatedByUserId == UserId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Subject,
                r.Description,
                r.Status,
                r.CreatedAt,
                r.UpdatedAt,
                r.OperatorUserId,
                UnreadCount = _db.SupportMessages
                    .Count(m => m.SupportRequestId == r.Id && m.SenderUserId != UserId && !m.IsRead),
            })
            .ToListAsync();

        return Ok(requests);
    }

    /// <summary>Admin gets all support requests</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var query = _db.SupportRequests
            .Include(r => r.CreatedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Subject,
                r.Description,
                r.Status,
                r.CreatedAt,
                r.UpdatedAt,
                r.CreatedByUserId,
                r.OperatorUserId,
                OperatorName = r.OperatorUserId != null
                    ? _db.Admins.Where(a => a.UserId == r.OperatorUserId).Select(a => a.FirstName + " " + a.LastName).FirstOrDefault()
                    : null,
                RequesterName = _db.Clients.Where(c => c.UserId == r.CreatedByUserId).Select(c => c.FirstName + " " + c.LastName).FirstOrDefault()
                             ?? _db.Experts.Where(e => e.UserId == r.CreatedByUserId).Select(e => e.DisplayName).FirstOrDefault()
                             ?? r.CreatedByUser.Email,
                RequesterEmail = r.CreatedByUser.Email,
                RequesterRole = _db.Clients.Any(c => c.UserId == r.CreatedByUserId) ? "Client"
                              : _db.Experts.Any(e => e.UserId == r.CreatedByUserId) ? "Expert"
                              : "Unknown",
                UnreadCount = _db.SupportMessages
                    .Count(m => m.SupportRequestId == r.Id && m.SenderUserId != UserId && !m.IsRead),
            })
            .ToListAsync();

        return Ok(requests);
    }

    /// <summary>List all admins that can be assigned as operators</summary>
    [HttpGet("operators")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOperators()
    {
        var admins = await _db.Admins
            .Select(a => new
            {
                a.UserId,
                Name = a.FirstName + " " + a.LastName,
            })
            .ToListAsync();

        return Ok(admins);
    }

    /// <summary>Admin assigns (or unassigns) an operator to a support request</summary>
    [HttpPost("{id}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Assign(long id, [FromBody] AssignOperatorDto dto)
    {
        var request = await _db.SupportRequests.FindAsync(id);
        if (request == null) return NotFound();

        if (dto.OperatorUserId != null)
        {
            // Verify the operator exists in the Admin table
            var adminExists = await _db.Admins.AnyAsync(a => a.UserId == dto.OperatorUserId);
            if (!adminExists)
                return BadRequest(new { error = "Geçersiz operatör." });
        }

        request.OperatorUserId = dto.OperatorUserId;
        request.Status = dto.OperatorUserId != null ? "InProgress" : "Open";
        request.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        string? operatorName = null;
        if (dto.OperatorUserId != null)
        {
            operatorName = await _db.Admins
                .Where(a => a.UserId == dto.OperatorUserId)
                .Select(a => a.FirstName + " " + a.LastName)
                .FirstOrDefaultAsync();
        }

        return Ok(new { request.Id, request.Status, request.OperatorUserId, OperatorName = operatorName });
    }

    /// <summary>Admin updates the status of a support request</summary>
    [HttpPost("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateStatusDto dto)
    {
        var request = await _db.SupportRequests.FindAsync(id);
        if (request == null) return NotFound();

        var allowed = new[] { "Open", "InProgress", "Closed" };
        if (!allowed.Contains(dto.Status))
            return BadRequest("Geçersiz durum. İzin verilenler: Open, InProgress, Closed");

        request.Status = dto.Status;
        request.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { request.Id, request.Status });
    }

    // ─── Support Messages ───────────────────────────────────────

    /// <summary>Get messages for a support request</summary>
    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(long id)
    {
        var request = await _db.SupportRequests.FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return NotFound();

        // Check access: creator or assigned operator
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && request.CreatedByUserId != UserId)
            return Forbid();

        // Mark messages as read
        var unread = await _db.SupportMessages
            .Where(m => m.SupportRequestId == id && m.SenderUserId != UserId && !m.IsRead)
            .ToListAsync();
        foreach (var m in unread) m.IsRead = true;
        if (unread.Any()) await _db.SaveChangesAsync();

        // Return messages
        var messages = await _db.SupportMessages
            .Where(m => m.SupportRequestId == id)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id,
                m.SenderUserId,
                SenderName = _db.Admins.Where(a => a.UserId == m.SenderUserId).Select(a => a.FirstName + " " + a.LastName).FirstOrDefault()
                          ?? _db.Clients.Where(c => c.UserId == m.SenderUserId).Select(c => c.FirstName + " " + c.LastName).FirstOrDefault()
                          ?? _db.Experts.Where(e => e.UserId == m.SenderUserId).Select(e => e.DisplayName).FirstOrDefault()
                          ?? "Bilinmeyen",
                SenderRole = _db.Admins.Any(a => a.UserId == m.SenderUserId) ? "Admin"
                           : _db.Clients.Any(c => c.UserId == m.SenderUserId) ? "Client"
                           : _db.Experts.Any(e => e.UserId == m.SenderUserId) ? "Expert"
                           : "Unknown",
                m.MessageText,
                m.IsRead,
                m.CreatedAt,
                IsMine = m.SenderUserId == UserId,
            })
            .ToListAsync();

        return Ok(messages);
    }

    /// <summary>Send a message on a support request</summary>
    [HttpPost("{id}/messages")]
    public async Task<IActionResult> SendMessage(long id, [FromBody] SendSupportMessageDto dto)
    {
        var request = await _db.SupportRequests.FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return NotFound();

        var isAdmin = User.IsInRole("Admin");

        // Access control
        if (isAdmin)
        {
            // Admin can only send messages if they are the assigned operator
            if (request.OperatorUserId != UserId)
                return BadRequest(new { error = "Bu talebin operatörü değilsiniz. Önce talebi üstlenmelisiniz." });
        }
        else
        {
            // Creator can only send if an operator is assigned
            if (request.CreatedByUserId != UserId)
                return Forbid();
            if (request.OperatorUserId == null)
                return BadRequest(new { error = "Henüz bir operatör atanmadı. Lütfen bekleyin." });
        }

        var message = new SupportMessage
        {
            SupportRequestId = id,
            SenderUserId = UserId,
            MessageText = dto.MessageText,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };

        _db.SupportMessages.Add(message);
        await _db.SaveChangesAsync();

        // Determine sender name for the broadcast
        var senderName = isAdmin
            ? await _db.Admins.Where(a => a.UserId == UserId).Select(a => a.FirstName + " " + a.LastName).FirstOrDefaultAsync() ?? "Destek"
            : await _db.Clients.Where(c => c.UserId == UserId).Select(c => c.FirstName + " " + c.LastName).FirstOrDefaultAsync()
              ?? await _db.Experts.Where(e => e.UserId == UserId).Select(e => e.DisplayName).FirstOrDefaultAsync()
              ?? "Kullanıcı";

        var broadcastPayload = new
        {
            message.Id,
            SupportRequestId = id,
            message.SenderUserId,
            SenderName = senderName,
            SenderRole = isAdmin ? "Admin" : User.IsInRole("Expert") ? "Expert" : "Client",
            message.MessageText,
            message.CreatedAt,
            IsMine = false,
        };

        if (isAdmin)
        {
            // Admin (operator) sent → notify the request creator
            await _hub.Clients.User(request.CreatedByUserId.ToString())
                .SendAsync("ReceiveSupportMessage", broadcastPayload);
        }
        else
        {
            // User sent → notify the assigned operator
            if (request.OperatorUserId != null)
            {
                await _hub.Clients.User(request.OperatorUserId.Value.ToString())
                    .SendAsync("ReceiveSupportMessage", broadcastPayload);
            }
        }

        return Ok(new
        {
            message.Id,
            message.SenderUserId,
            message.MessageText,
            message.CreatedAt,
            IsMine = true,
        });
    }
}

public record CreateSupportRequestDto(string Subject, string Description);
public record UpdateStatusDto(string Status);
public record SendSupportMessageDto(string MessageText);
public record AssignOperatorDto(long? OperatorUserId);
