namespace HealthLink.Api.Dtos.Package;

public class ServicePackageDto
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string ExpertType { get; set; } = null!;
    public int SessionCount { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "TRY";
    public bool IsActive { get; set; }
}
