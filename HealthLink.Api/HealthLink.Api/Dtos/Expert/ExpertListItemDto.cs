namespace HealthLink.Api.Dtos.Expert;

public class ExpertListItemDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string? Email { get; set; }
    public string ExpertType { get; set; } = null!;
    public string? DisplayName { get; set; }
    public string? City { get; set; }
    public string? WorkType { get; set; }
    public bool IsApproved { get; set; }
    public string? Status { get; set; }
    public DateOnly? ExperienceStartDate { get; set; }
    public decimal? AverageRating { get; set; }
    public int TotalReviewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Specializations { get; set; } = new(); // Just names
}

