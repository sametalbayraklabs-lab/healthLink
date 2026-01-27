namespace HealthLink.Api.Dtos.Discount;

public class ValidateDiscountRequest
{
    public string Code { get; set; } = null!;
    public long ServicePackageId { get; set; }
}
