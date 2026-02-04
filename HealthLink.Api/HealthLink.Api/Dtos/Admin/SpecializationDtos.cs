using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class SpecializationDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public SpecializationCategory Category { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateSpecializationDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public SpecializationCategory Category { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateSpecializationDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public SpecializationCategory? Category { get; set; }
    public bool? IsActive { get; set; }
}
