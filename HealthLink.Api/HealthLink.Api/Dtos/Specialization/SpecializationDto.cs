namespace HealthLink.Api.Dtos.Specialization;

public class SpecializationDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string ExpertType { get; set; } = null!; // Enum as string
    public string Category { get; set; } = null!; // Enum as string
}
