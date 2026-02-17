using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Package;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class ClientPackageService : IClientPackageService
{
    private readonly AppDbContext _db;
    private readonly IPaymentService _paymentService;
    private readonly IDiscountCodeService _discountService;
    private readonly IIyzicoService _iyzicoService;
    private readonly IConfiguration _configuration;

    public ClientPackageService(
        AppDbContext db,
        IPaymentService paymentService,
        IDiscountCodeService discountService,
        IIyzicoService iyzicoService,
        IConfiguration configuration)
    {
        _db = db;
        _paymentService = paymentService;
        _discountService = discountService;
        _iyzicoService = iyzicoService;
        _configuration = configuration;
    }

    public async Task<List<ClientPackageDto>> GetMyPackagesAsync(long userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "Kullanıcı client değil.", 403);
        }

        var packages = await _db.ClientPackages
            .Include(x => x.ServicePackage)
            .Where(x => x.ClientId == client.Id)
            .OrderByDescending(x => x.PurchaseDate)
            .ToListAsync();

        return packages.Select(MapToDto).ToList();
    }

    public async Task<ClientPackageDto> GetPackageByIdAsync(long userId, long packageId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "Kullanıcı client değil.", 403);
        }

        var package = await _db.ClientPackages
            .Include(x => x.ServicePackage)
            .FirstOrDefaultAsync(x => x.Id == packageId && x.ClientId == client.Id);

        if (package == null)
        {
            throw new BusinessException("CLIENT_PACKAGE_NOT_FOUND", "Paket bulunamadı.", 404);
        }

        return MapToDto(package);
    }

    public async Task<PurchasePackageResponse> PurchasePackageAsync(long userId, PurchasePackageRequest request, string? buyerIp = null)
    {
        var client = await _db.Clients
            .Include(c => c.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "Kullanıcı client değil.", 403);
        }

        var servicePackage = await _db.ServicePackages.FindAsync(request.ServicePackageId);
        if (servicePackage == null || !servicePackage.IsActive)
        {
            throw new BusinessException("PACKAGE_NOT_FOUND", "Paket bulunamadı veya aktif değil.", 404);
        }

        decimal finalAmount = servicePackage.Price;
        decimal? discountAmount = null;

        // Validate discount code if provided
        if (!string.IsNullOrWhiteSpace(request.DiscountCode))
        {
            var discountValidation = await _discountService.ValidateDiscountAsync(new Dtos.Discount.ValidateDiscountRequest
            {
                Code = request.DiscountCode,
                ServicePackageId = request.ServicePackageId
            });

            if (discountValidation.IsValid)
            {
                discountAmount = discountValidation.DiscountAmount;
                finalAmount = discountValidation.FinalAmount ?? finalAmount;
            }
        }

        // Create ClientPackage with PendingPayment status
        var clientPackage = new ClientPackage
        {
            ClientId = client.Id,
            ServicePackageId = servicePackage.Id,
            TotalSessions = servicePackage.SessionCount,
            UsedSessions = 0,
            Status = ClientPackageStatus.PendingPayment,
            PurchaseDate = DateTime.UtcNow,
            ExpireDate = DateTime.UtcNow.AddDays(servicePackage.ValidityDays),
            CreatedAt = DateTime.UtcNow
        };

        _db.ClientPackages.Add(clientPackage);
        await _db.SaveChangesAsync();

        // Create Payment with Pending status
        var payment = new Payment
        {
            ClientId = client.Id,
            ClientPackageId = clientPackage.Id,
            Amount = finalAmount,
            Currency = servicePackage.Currency,
            PaymentMethod = "CreditCard",
            Status = PaymentStatus.Pending,
            Gateway = PaymentGateway.Iyzico,
            CreatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        // Initialize Iyzico Checkout Form
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var callbackUrl = _configuration["BackendUrl"] ?? "http://localhost:5254";
        callbackUrl = $"{callbackUrl}/api/payments/iyzico-callback";

        var (checkoutFormContent, token) = await _iyzicoService.InitializeCheckoutFormAsync(
            paymentId: payment.Id,
            amount: finalAmount,
            currency: servicePackage.Currency,
            buyerName: client.FirstName,
            buyerSurname: client.LastName,
            buyerEmail: client.User.Email,
            buyerPhone: client.User.Phone,
            buyerIp: buyerIp ?? "127.0.0.1",
            itemName: servicePackage.Name,
            callbackUrl: callbackUrl);

        // Save Iyzico token to payment
        payment.IyzicoToken = token;
        payment.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new PurchasePackageResponse
        {
            ClientPackageId = clientPackage.Id,
            PaymentId = payment.Id,
            FinalAmount = finalAmount,
            DiscountAmount = discountAmount,
            CheckoutFormContent = checkoutFormContent,
            PaymentToken = token
        };
    }

    private ClientPackageDto MapToDto(ClientPackage package)
    {
        return new ClientPackageDto
        {
            Id = package.Id,
            ClientId = package.ClientId,
            ServicePackage = new ServicePackageDto
            {
                Id = package.ServicePackage.Id,
                Name = package.ServicePackage.Name,
                Description = package.ServicePackage.Description,
                ExpertType = package.ServicePackage.ExpertType.ToApiString(),
                SessionCount = package.ServicePackage.SessionCount,
                ValidityDays = package.ServicePackage.ValidityDays,
                Price = package.ServicePackage.Price,
                Currency = package.ServicePackage.Currency,
                IsActive = package.ServicePackage.IsActive
            },
            TotalSessions = package.TotalSessions,
            UsedSessions = package.UsedSessions,
            Status = package.Status.ToApiString(),
            PurchaseDate = package.PurchaseDate,
            ExpireDate = package.ExpireDate
        };
    }
}
