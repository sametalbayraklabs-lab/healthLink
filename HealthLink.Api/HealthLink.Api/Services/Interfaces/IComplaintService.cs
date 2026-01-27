using HealthLink.Api.Dtos.Complaint;

namespace HealthLink.Api.Services.Interfaces;

public interface IComplaintService
{
    Task<ComplaintDto> CreateComplaintAsync(long userId, CreateComplaintRequest request);
    Task<List<ComplaintDto>> GetMyComplaintsAsync(long userId);
    Task<List<ComplaintDto>> GetAllComplaintsAsync();
    Task<ComplaintDto> UpdateComplaintAsync(long complaintId, UpdateComplaintRequest request);
}
