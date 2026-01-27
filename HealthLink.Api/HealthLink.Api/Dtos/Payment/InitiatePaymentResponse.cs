namespace HealthLink.Api.Dtos.Payment;

public class InitiatePaymentResponse
{
    public long PaymentId { get; set; }
    public string PaymentUrl { get; set; } = null!;
    public string? Token { get; set; }
}
