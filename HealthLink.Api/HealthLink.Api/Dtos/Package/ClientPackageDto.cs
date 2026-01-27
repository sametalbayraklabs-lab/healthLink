namespace HealthLink.Api.Dtos.Package;

public class ClientPackageDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public ServicePackageDto ServicePackage { get; set; } = null!;
    public int TotalSessions { get; set; }
    public int UsedSessions { get; set; }
    public int RemainingSessions => TotalSessions - UsedSessions;
    public string Status { get; set; } = null!;
    public DateTime PurchaseDate { get; set; }
    public DateTime? ExpireDate { get; set; }
}
