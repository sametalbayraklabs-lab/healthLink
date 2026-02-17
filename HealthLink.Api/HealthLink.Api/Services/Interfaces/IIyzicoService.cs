namespace HealthLink.Api.Services.Interfaces;

public interface IIyzicoService
{
    /// <summary>
    /// Initialize Iyzico Checkout Form and return the HTML content + token
    /// </summary>
    Task<(string CheckoutFormContent, string Token)> InitializeCheckoutFormAsync(
        long paymentId,
        decimal amount,
        string currency,
        string buyerName,
        string buyerSurname,
        string buyerEmail,
        string? buyerPhone,
        string buyerIp,
        string itemName,
        string callbackUrl);

    /// <summary>
    /// Retrieve checkout form result after Iyzico callback
    /// </summary>
    Task<IyzicoPaymentResult> RetrieveCheckoutFormResultAsync(string token);
}

public class IyzicoPaymentResult
{
    public bool IsSuccess { get; set; }
    public string? PaymentId { get; set; }
    public string? ConversationId { get; set; }
    public string? ErrorMessage { get; set; }
    public string? RawResponse { get; set; }
}
