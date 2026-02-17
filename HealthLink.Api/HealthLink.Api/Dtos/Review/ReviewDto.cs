namespace HealthLink.Api.Dtos.Review;

public class ReviewDto
{
    public long Id { get; set; }
    public long AppointmentId { get; set; }
    public long ClientId { get; set; }
    public string? ClientName { get; set; }
    public long ExpertId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string Status { get; set; } = null!;
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
