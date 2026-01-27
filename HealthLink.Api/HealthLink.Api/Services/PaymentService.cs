using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Payment;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<InitiatePaymentResponse> InitiatePaymentAsync(long userId, InitiatePaymentRequest request)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
        }

        var clientPackage = await _db.ClientPackages
            .Include(x => x.ServicePackage)
            .FirstOrDefaultAsync(x => x.Id == request.ClientPackageId && x.ClientId == client.Id);

        if (clientPackage == null)
        {
            throw new BusinessException("CLIENT_PACKAGE_NOT_FOUND", "Paket bulunamadÄ±.", 404);
        }

        // Check if payment already exists
        var existingPayment = await _db.Payments
            .FirstOrDefaultAsync(x => x.ClientPackageId == clientPackage.Id && x.Status == PaymentStatus.Success);

        if (existingPayment != null)
        {
            throw new BusinessException("PAYMENT_ALREADY_COMPLETED", "Bu paket iÃ§in Ã¶deme zaten tamamlanmÄ±ÅŸ.", 400);
        }

        var payment = new Payment
        {
            ClientId = client.Id,
            ClientPackageId = clientPackage.Id,
            Amount = clientPackage.ServicePackage.Price,
            Currency = clientPackage.ServicePackage.Currency,
            PaymentMethod = request.PaymentMethod,
            Status = PaymentStatus.Pending,
            Gateway = PaymentGateway.Iyzico,
            CreatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        // Mock payment URL
        var paymentUrl = $"https://payment-gateway.com/pay/{payment.Id}";

        return new InitiatePaymentResponse
        {
            PaymentId = payment.Id,
            PaymentUrl = paymentUrl,
            Token = Guid.NewGuid().ToString()
        };
    }

    public async Task<PaymentDto> HandleCallbackAsync(PaymentCallbackRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PaymentId))
        {
            throw new BusinessException("INVALID_CALLBACK", "GeÃ§ersiz callback verisi.", 400);
        }

        var paymentId = long.Parse(request.PaymentId);
        var payment = await _db.Payments
            .Include(x => x.ClientPackage)
            .FirstOrDefaultAsync(x => x.Id == paymentId);

        if (payment == null)
        {
            throw new BusinessException("PAYMENT_NOT_FOUND", "Ã–deme bulunamadÄ±.", 404);
        }

        // Update payment status based on callback
        if (request.Status == "success")
        {
            payment.Status = PaymentStatus.Success;
            payment.ConfirmedAt = DateTime.UtcNow;
            payment.GatewayPaymentId = request.ConversationId;

            // Activate client package
            payment.ClientPackage.Status = ClientPackageStatus.Active;
        }
        else
        {
            payment.Status = PaymentStatus.Failed;
        }

        payment.ProviderRawResponse = System.Text.Json.JsonSerializer.Serialize(request);
        payment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(payment);
    }

    public async Task<List<PaymentDto>> GetMyPaymentsAsync(long userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
        }

        var payments = await _db.Payments
            .Where(x => x.ClientId == client.Id)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return payments.Select(MapToDto).ToList();
    }

    public async Task<PaymentDto> GetPaymentByIdAsync(long userId, long paymentId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
        }

        var payment = await _db.Payments
            .FirstOrDefaultAsync(x => x.Id == paymentId && x.ClientId == client.Id);

        if (payment == null)
        {
            throw new BusinessException("PAYMENT_NOT_FOUND", "Ã–deme bulunamadÄ±.", 404);
        }

        return MapToDto(payment);
    }

    private PaymentDto MapToDto(Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            ClientId = payment.ClientId,
            ClientPackageId = payment.ClientPackageId,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentMethod = payment.PaymentMethod,
            Status = payment.Status.ToApiString(),
            Gateway = payment.Gateway.ToApiString(),
            ConfirmedAt = payment.ConfirmedAt,
            CreatedAt = payment.CreatedAt
        };
    }
}

