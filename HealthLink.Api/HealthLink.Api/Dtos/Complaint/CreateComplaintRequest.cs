namespace HealthLink.Api.Dtos.Complaint;

public class CreateComplaintRequest
{
    public long? AppointmentId { get; set; }
    public string Category { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
}
