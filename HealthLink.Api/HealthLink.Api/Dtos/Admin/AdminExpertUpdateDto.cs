using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class AdminExpertUpdateDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? City { get; set; }
    public int? ExpertType { get; set; }
    public int? WorkType { get; set; }
    public int? Status { get; set; }
    public DateOnly? ExperienceStartDate { get; set; }
    public bool? IsActive { get; set; }
}
