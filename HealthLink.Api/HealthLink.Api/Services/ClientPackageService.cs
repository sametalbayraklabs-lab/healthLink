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

    public ClientPackageService(
        AppDbContext db,
        IPaymentService paymentService,
        IDiscountCodeService discountService)
    {
        _db = db;
        _paymentService = paymentService;
        _discountService = discountService;
    }

    public async Task<List<ClientPackageDto>> GetMyPackagesAsync(long userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
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
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
        }

        var package = await _db.ClientPackages
            .Include(x => x.ServicePackage)
            .FirstOrDefaultAsync(x => x.Id == packageId && x.ClientId == client.Id);

        if (package == null)
        {
            throw new BusinessException("CLIENT_PACKAGE_NOT_FOUND", "Paket bulunamadÄ±.", 404);
        }

        return MapToDto(package);
    }

    public async Task<PurchasePackageResponse> PurchasePackageAsync(long userId, PurchasePackageRequest request)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
        }

        var servicePackage = await _db.ServicePackages.FindAsync(request.ServicePackageId);
        if (servicePackage == null || !servicePackage.IsActive)
        {
            throw new BusinessException("PACKAGE_NOT_FOUND", "Paket bulunamadÄ± veya aktif deÄŸil.", 404);
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

        // Create ClientPackage
        var clientPackage = new ClientPackage
        {
            ClientId = client.Id,
            ServicePackageId = servicePackage.Id,
            TotalSessions = servicePackage.SessionCount,
            UsedSessions = 0,
            Status = ClientPackageStatus.Active,
            PurchaseDate = DateTime.UtcNow,
            ExpireDate = DateTime.UtcNow.AddMonths(12), // 1 year validity
            CreatedAt = DateTime.UtcNow
        };

        _db.ClientPackages.Add(clientPackage);
        await _db.SaveChangesAsync();

        // Create Payment
        var payment = new Payment
        {
            ClientId = client.Id,
            ClientPackageId = clientPackage.Id,
            Amount = finalAmount,
            Currency = servicePackage.Currency,
            PaymentMethod = "CreditCard", // Default
            Status = PaymentStatus.Pending,
            Gateway = PaymentGateway.Iyzico,
            CreatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        // Generate payment URL (mock for now)
        var paymentUrl = $"https://payment-gateway.com/pay/{payment.Id}";

        return new PurchasePackageResponse
        {
            ClientPackageId = clientPackage.Id,
            PaymentId = payment.Id,
            PaymentUrl = paymentUrl,
            FinalAmount = finalAmount,
            DiscountAmount = discountAmount
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

