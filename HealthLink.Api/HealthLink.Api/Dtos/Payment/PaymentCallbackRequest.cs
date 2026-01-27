namespace HealthLink.Api.Dtos.Payment;

public class PaymentCallbackRequest
{
    public string? Token { get; set; }
    public string? Status { get; set; }
    public string? PaymentId { get; set; }
    public string? ConversationId { get; set; }
    // Gateway-specific fields can be added here
}
