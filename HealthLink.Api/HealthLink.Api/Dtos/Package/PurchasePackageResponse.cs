namespace HealthLink.Api.Dtos.Package;

public class PurchasePackageResponse
{
    public long ClientPackageId { get; set; }
    public long PaymentId { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    
    /// <summary>
    /// Iyzico Checkout Form HTML content (rendered in frontend iframe/div)
    /// </summary>
    public string? CheckoutFormContent { get; set; }
    
    /// <summary>
    /// Iyzico payment token for tracking
    /// </summary>
    public string? PaymentToken { get; set; }
}
