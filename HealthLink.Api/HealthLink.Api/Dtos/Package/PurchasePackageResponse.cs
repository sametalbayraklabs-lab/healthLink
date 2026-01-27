namespace HealthLink.Api.Dtos.Package;

public class PurchasePackageResponse
{
    public long ClientPackageId { get; set; }
    public long PaymentId { get; set; }
    public string PaymentUrl { get; set; } = null!;
    public decimal FinalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
}
