namespace HealthLink.Api.Dtos.Expert;

public class UpdateExpertRequestDto
{
    public string DisplayName { get; set; } = null!;
    public string? Bio { get; set; }
    public string? ProfileDescription { get; set; }
    public string? City { get; set; }
    public string? Education { get; set; }
    public string? Certificates { get; set; }
    public string? WorkType { get; set; } // "Online", "InPerson", "Hybrid"
    public string? IntroVideoUrl { get; set; }
    public DateOnly? ExperienceStartDate { get; set; }
}
