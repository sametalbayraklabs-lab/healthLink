namespace HealthLink.Api.Dtos.Payment;

public class InitiatePaymentRequest
{
    public long ClientPackageId { get; set; }
    public string PaymentMethod { get; set; } = null!;
    public string? CallbackUrl { get; set; }
}
