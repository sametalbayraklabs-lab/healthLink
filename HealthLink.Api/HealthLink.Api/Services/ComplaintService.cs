using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Complaint;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class ComplaintService : IComplaintService
{
    private readonly AppDbContext _db;

    public ComplaintService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ComplaintDto> CreateComplaintAsync(long userId, CreateComplaintRequest request)
    {
        // Determine if user is client or expert
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        var expert = await _db.Experts.FirstOrDefaultAsync(x => x.UserId == userId);

        if (client == null && expert == null)
        {
            throw new BusinessException("USER_NOT_FOUND", "KullanÄ±cÄ± bulunamadÄ±.", 404);
        }

        var category = EnumExtensions.ParseComplaintCategory(request.Category);
        var type = EnumExtensions.ParseComplaintType(request.Type);

        var complaint = new Complaint
        {
            ClientId = client?.Id,
            ExpertId = expert?.Id,
            AppointmentId = request.AppointmentId,
            Category = category,
            Type = type,
            Title = request.Title,
            Description = request.Description,
            Status = ComplaintStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _db.Complaints.Add(complaint);
        await _db.SaveChangesAsync();

        return MapToDto(complaint);
    }

    public async Task<List<ComplaintDto>> GetMyComplaintsAsync(long userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        var expert = await _db.Experts.FirstOrDefaultAsync(x => x.UserId == userId);

        var complaints = await _db.Complaints
            .Where(x => (client != null && x.ClientId == client.Id) || 
                       (expert != null && x.ExpertId == expert.Id))
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return complaints.Select(MapToDto).ToList();
    }

    public async Task<List<ComplaintDto>> GetAllComplaintsAsync()
    {
        var complaints = await _db.Complaints
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return complaints.Select(MapToDto).ToList();
    }

    public async Task<ComplaintDto> UpdateComplaintAsync(long complaintId, UpdateComplaintRequest request)
    {
        var complaint = await _db.Complaints.FindAsync(complaintId);
        if (complaint == null)
        {
            throw new BusinessException("COMPLAINT_NOT_FOUND", "Åžikayet bulunamadÄ±.", 404);
        }

        if (request.Status != null)
        {
            complaint.Status = EnumExtensions.ParseComplaintStatus(request.Status);
            if (complaint.Status == ComplaintStatus.Resolved)
            {
                complaint.ClosedAt = DateTime.UtcNow;
            }
        }

        if (request.AdminNote != null)
        {
            complaint.AdminNote = request.AdminNote;
        }

        complaint.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(complaint);
    }

    private ComplaintDto MapToDto(Complaint complaint)
    {
        return new ComplaintDto
        {
            Id = complaint.Id,
            ClientId = complaint.ClientId,
            ExpertId = complaint.ExpertId,
            AppointmentId = complaint.AppointmentId,
            Category = complaint.Category.ToApiString(),
            Type = complaint.Type.ToApiString(),
            Title = complaint.Title,
            Description = complaint.Description,
            Status = complaint.Status.ToApiString(),
            AdminNote = complaint.AdminNote,
            CreatedAt = complaint.CreatedAt,
            UpdatedAt = complaint.UpdatedAt,
            ClosedAt = complaint.ClosedAt
        };
    }
}

