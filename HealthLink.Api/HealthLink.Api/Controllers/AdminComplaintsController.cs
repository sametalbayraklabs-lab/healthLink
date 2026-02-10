using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/complaints")]
[Authorize(Roles = "Admin")]
public class AdminComplaintsController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminComplaintsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminComplaintListDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Complaints
            .Include(c => c.Client)
            .Include(c => c.Expert)
            .AsQueryable();

        // Status filter
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ComplaintStatus>(status, out var complaintStatus))
        {
            query = query.Where(c => c.Status == complaintStatus);
        }

        // Category filter
        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<ComplaintCategory>(category, out var complaintCategory))
        {
            query = query.Where(c => c.Category == complaintCategory);
        }

        var complaints = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminComplaintListDto
            {
                Id = c.Id,
                ClientId = c.ClientId,
                ClientName = c.Client != null ? c.Client.FirstName + " " + c.Client.LastName : null,
                ExpertId = c.ExpertId,
                ExpertName = c.Expert != null ? c.Expert.DisplayName : null,
                Category = c.Category,
                Type = c.Type,
                Title = c.Title,
                Status = c.Status,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(complaints);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminComplaintDetailDto>> GetById(long id)
    {
        var complaint = await _db.Complaints
            .Include(c => c.Client)
                .ThenInclude(cl => cl!.User)
            .Include(c => c.Expert)
                .ThenInclude(e => e!.User)
            .Include(c => c.Appointment)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (complaint == null)
        {
            return NotFound();
        }

        var dto = new AdminComplaintDetailDto
        {
            Id = complaint.Id,
            ClientId = complaint.ClientId,
            ClientName = complaint.Client != null ? complaint.Client.FirstName + " " + complaint.Client.LastName : null,
            ClientEmail = complaint.Client?.User?.Email,
            ExpertId = complaint.ExpertId,
            ExpertName = complaint.Expert?.DisplayName,
            ExpertEmail = complaint.Expert?.User?.Email,
            AppointmentId = complaint.AppointmentId,
            AppointmentDate = complaint.Appointment?.StartDateTime,
            Category = complaint.Category,
            Type = complaint.Type,
            Title = complaint.Title,
            Description = complaint.Description,
            Status = complaint.Status,
            AdminNote = complaint.AdminNote,
            CreatedAt = complaint.CreatedAt,
            UpdatedAt = complaint.UpdatedAt,
            ClosedAt = complaint.ClosedAt
        };

        return Ok(dto);
    }

    [HttpPut("{id}/action")]
    public async Task<ActionResult<AdminComplaintDetailDto>> UpdateStatus(long id, ComplaintActionDto request)
    {
        var complaint = await _db.Complaints.FindAsync(id);

        if (complaint == null)
        {
            return NotFound();
        }

        complaint.Status = request.Status;
        complaint.AdminNote = request.AdminNote;
        complaint.UpdatedAt = DateTime.UtcNow;

        if (request.Status == ComplaintStatus.Resolved || request.Status == ComplaintStatus.Rejected)
        {
            complaint.ClosedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return await GetById(id);
    }
}
