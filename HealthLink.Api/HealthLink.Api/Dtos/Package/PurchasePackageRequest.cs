namespace HealthLink.Api.Dtos.Package;

public class PurchasePackageRequest
{
    public long ServicePackageId { get; set; }
    public string? DiscountCode { get; set; }
}
