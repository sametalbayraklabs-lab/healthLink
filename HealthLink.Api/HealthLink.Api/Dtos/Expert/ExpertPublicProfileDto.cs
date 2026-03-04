namespace HealthLink.Api.Dtos.Expert;

public class ExpertPublicProfileDto
{
    public long Id { get; set; }
    public string ExpertType { get; set; } = null!;
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? ProfileDescription { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public string? IntroVideoUrl { get; set; }
    public string? City { get; set; }
    public string? Education { get; set; }
    public string? Certificates { get; set; }
    public string? WorkType { get; set; }
    public DateOnly? ExperienceStartDate { get; set; }
    public decimal? AverageRating { get; set; }
    public int TotalReviewCount { get; set; }
    public List<SpecializationItemDto> Specializations { get; set; } = new();
}

public class SpecializationItemDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
}
