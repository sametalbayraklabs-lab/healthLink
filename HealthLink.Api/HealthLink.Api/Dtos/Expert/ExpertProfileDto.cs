namespace HealthLink.Api.Dtos.Expert;

public class ExpertProfileDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string ExpertType { get; set; } = null!; // Enum as string
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? ProfileDescription { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public string? IntroVideoUrl { get; set; }
    public string? City { get; set; }
    public string? Education { get; set; }
    public string? Certificates { get; set; }
    public string? WorkType { get; set; } // Enum as string
    public DateOnly? ExperienceStartDate { get; set; }
    public string Status { get; set; } = null!; // Enum as string
    public decimal? AverageRating { get; set; }
    public int TotalReviewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsManuallyOffline { get; set; }
    public List<long> SpecializationIds { get; set; } = new();
}
