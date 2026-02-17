namespace HealthLink.Api.Dtos.Appointments;

public class MyExpertDto
{
    public long ExpertId { get; set; }
    public string? DisplayName { get; set; }
    public string? ExpertType { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public decimal? AverageRating { get; set; }
    public int TotalReviewCount { get; set; }
    public int TotalSessions { get; set; }
    public DateTime LastSessionDate { get; set; }
    public bool IsFavorite { get; set; }
}
