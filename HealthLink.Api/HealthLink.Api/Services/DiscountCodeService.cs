using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Discount;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class DiscountCodeService : IDiscountCodeService
{
    private readonly AppDbContext _db;

    public DiscountCodeService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ValidateDiscountResponse> ValidateDiscountAsync(ValidateDiscountRequest request)
    {
        var discount = await _db.DiscountCodes
            .FirstOrDefaultAsync(x => x.Code == request.Code && x.IsActive);

        if (discount == null)
        {
            return new ValidateDiscountResponse
            {
                IsValid = false,
                ErrorMessage = "İndirim kodu bulunamadı veya aktif değil."
            };
        }

        var now = DateTime.UtcNow;
        if (now < discount.ValidFrom || (discount.ValidTo.HasValue && now > discount.ValidTo.Value))
        {
            return new ValidateDiscountResponse
            {
                IsValid = false,
                ErrorMessage = "İndirim kodu geçerlilik süresi dışında."
            };
        }

        if (discount.MaxUsageCount.HasValue && discount.UsedCount >= discount.MaxUsageCount.Value)
        {
            return new ValidateDiscountResponse
            {
                IsValid = false,
                ErrorMessage = "İndirim kodu kullanım limitine ulaşmış."
            };
        }

        var package = await _db.ServicePackages.FindAsync(request.ServicePackageId);
        if (package == null)
        {
            return new ValidateDiscountResponse
            {
                IsValid = false,
                ErrorMessage = "Paket bulunamadı."
            };
        }

        // Check if discount applies to package expert type
        if (discount.ApplicableExpertType != ExpertType.All && 
            discount.ApplicableExpertType != package.ExpertType)
        {
            return new ValidateDiscountResponse
            {
                IsValid = false,
                ErrorMessage = "İndirim kodu bu paket türü için geçerli değil."
            };
        }

        decimal discountAmount = 0;
        if (discount.DiscountType == DiscountType.Percentage)
        {
            discountAmount = package.Price * (discount.DiscountValue / 100);
        }
        else // Fixed
        {
            discountAmount = discount.DiscountValue;
        }

        var finalAmount = Math.Max(0, package.Price - discountAmount);

        return new ValidateDiscountResponse
        {
            IsValid = true,
            DiscountAmount = discountAmount,
            FinalAmount = finalAmount
        };
    }

    public async Task<DiscountCodeDto> CreateDiscountCodeAsync(CreateDiscountCodeRequest request)
    {
        var existingCode = await _db.DiscountCodes
            .FirstOrDefaultAsync(x => x.Code == request.Code);

        if (existingCode != null)
        {
            throw new BusinessException("DISCOUNT_CODE_EXISTS", "Bu kod zaten mevcut.", 400);
        }

        var discountType = Enum.Parse<DiscountType>(request.DiscountType, true);
        var expertType = EnumExtensions.ParseExpertType(request.ApplicableExpertType);

        var discount = new DiscountCode
        {
            Code = request.Code,
            Description = request.Description,
            DiscountType = discountType,
            DiscountValue = request.DiscountValue,
            MaxUsageCount = request.MaxUsageCount,
            UsedCount = 0,
            ValidFrom = request.ValidFrom,
            ValidTo = request.ValidTo,
            ApplicableExpertType = expertType,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.DiscountCodes.Add(discount);
        await _db.SaveChangesAsync();

        return MapToDto(discount);
    }

    public async Task<List<DiscountCodeDto>> GetAllDiscountCodesAsync()
    {
        var discounts = await _db.DiscountCodes
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return discounts.Select(MapToDto).ToList();
    }

    public async Task<DiscountCodeDto> UpdateDiscountCodeAsync(long id, CreateDiscountCodeRequest request)
    {
        var discount = await _db.DiscountCodes.FindAsync(id);
        if (discount == null)
        {
            throw new BusinessException("DISCOUNT_CODE_NOT_FOUND", "İndirim kodu bulunamadı.", 404);
        }

        discount.Code = request.Code;
        discount.Description = request.Description;
        discount.DiscountType = Enum.Parse<DiscountType>(request.DiscountType, true);
        discount.DiscountValue = request.DiscountValue;
        discount.MaxUsageCount = request.MaxUsageCount;
        discount.ValidFrom = request.ValidFrom;
        discount.ValidTo = request.ValidTo;
        discount.ApplicableExpertType = EnumExtensions.ParseExpertType(request.ApplicableExpertType);
        discount.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(discount);
    }

    private DiscountCodeDto MapToDto(DiscountCode discount)
    {
        return new DiscountCodeDto
        {
            Id = discount.Id,
            Code = discount.Code,
            Description = discount.Description,
            DiscountType = discount.DiscountType.ToString(),
            DiscountValue = discount.DiscountValue,
            MaxUsageCount = discount.MaxUsageCount,
            UsedCount = discount.UsedCount,
            ValidFrom = discount.ValidFrom,
            ValidTo = discount.ValidTo,
            ApplicableExpertType = discount.ApplicableExpertType.ToApiString(),
            IsActive = discount.IsActive
        };
    }
}
