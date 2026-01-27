using HealthLink.Api.Dtos.Payment;

namespace HealthLink.Api.Services.Interfaces;

public interface IPaymentService
{
    Task<InitiatePaymentResponse> InitiatePaymentAsync(long userId, InitiatePaymentRequest request);
    Task<PaymentDto> HandleCallbackAsync(PaymentCallbackRequest request);
    Task<List<PaymentDto>> GetMyPaymentsAsync(long userId);
    Task<PaymentDto> GetPaymentByIdAsync(long userId, long paymentId);
}
