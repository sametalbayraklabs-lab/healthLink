namespace HealthLink.Api.Dtos.Expert;

public class ExpertDetailDto
{
    public long Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string ExpertType { get; set; } = null!;
    public string? DisplayName { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public string? Bio { get; set; }
    public string? IntroVideoUrl { get; set; }
    public List<string> Specialties { get; set; } = new();
    public List<CertificateDto> Certificates { get; set; } = new();
    public decimal? AverageRating { get; set; }
    public int TotalReviewCount { get; set; }
    public int? ExperienceYears { get; set; }
}

public class CertificateDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Issuer { get; set; }
    public int? Year { get; set; }
}
