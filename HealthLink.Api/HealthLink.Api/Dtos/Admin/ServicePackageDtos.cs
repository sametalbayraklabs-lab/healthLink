using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class ServicePackageDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public ExpertType ExpertType { get; set; }
    public int SessionCount { get; set; }
    public int ValidityDays { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateServicePackageDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public ExpertType ExpertType { get; set; }
    public int SessionCount { get; set; }
    public int ValidityDays { get; set; } = 30;
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateServicePackageDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public ExpertType? ExpertType { get; set; }
    public int? SessionCount { get; set; }
    public int? ValidityDays { get; set; }
    public decimal? Price { get; set; }
    public bool? IsActive { get; set; }
}
