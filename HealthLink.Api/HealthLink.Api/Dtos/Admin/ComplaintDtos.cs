using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class AdminComplaintListDto
{
    public long Id { get; set; }
    public long? ClientId { get; set; }
    public string? ClientName { get; set; }
    public long? ExpertId { get; set; }
    public string? ExpertName { get; set; }
    public ComplaintCategory Category { get; set; }
    public ComplaintType Type { get; set; }
    public string Title { get; set; } = null!;
    public ComplaintStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminComplaintDetailDto
{
    public long Id { get; set; }
    public long? ClientId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public long? ExpertId { get; set; }
    public string? ExpertName { get; set; }
    public string? ExpertEmail { get; set; }
    public long? AppointmentId { get; set; }
    public DateTime? AppointmentDate { get; set; }
    public ComplaintCategory Category { get; set; }
    public ComplaintType Type { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public ComplaintStatus Status { get; set; }
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
}

public class ComplaintActionDto
{
    public ComplaintStatus Status { get; set; }
    public string? AdminNote { get; set; }
}
