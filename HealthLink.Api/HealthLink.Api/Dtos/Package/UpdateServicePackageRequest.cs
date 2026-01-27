namespace HealthLink.Api.Dtos.Package;

public class UpdateServicePackageRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? ExpertType { get; set; }
    public int? SessionCount { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public bool? IsActive { get; set; }
}
