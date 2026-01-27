namespace HealthLink.Api.Dtos.Complaint;

public class ComplaintDto
{
    public long Id { get; set; }
    public long? ClientId { get; set; }
    public long? ExpertId { get; set; }
    public long? AppointmentId { get; set; }
    public string Category { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
}
