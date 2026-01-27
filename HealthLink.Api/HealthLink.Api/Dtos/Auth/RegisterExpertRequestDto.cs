namespace HealthLink.Api.Dtos.Auth;

public class RegisterExpertRequestDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? Phone { get; set; }
    public string ExpertType { get; set; } = null!; // "Dietitian", "Psychologist", etc.
    public string? City { get; set; }
    public string? WorkType { get; set; } // "Online", "InPerson", "Hybrid"
    public DateOnly? ExperienceStartDate { get; set; }
}
