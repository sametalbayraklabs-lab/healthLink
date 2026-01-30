namespace HealthLink.Api.Dtos.Expert;

public class ExpertDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string ExpertType { get; set; } = null!;
    public string? DisplayName { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public List<string> Specialties { get; set; } = new();
    public decimal? AverageRating { get; set; }
    public int TotalReviewCount { get; set; }
}
