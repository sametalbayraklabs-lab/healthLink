namespace HealthLink.Api.Dtos.Discount;

public class ValidateDiscountResponse
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? FinalAmount { get; set; }
}
