using HealthLink.Api.Dtos.Discount;

namespace HealthLink.Api.Services.Interfaces;

public interface IDiscountCodeService
{
    Task<ValidateDiscountResponse> ValidateDiscountAsync(ValidateDiscountRequest request);
    Task<DiscountCodeDto> CreateDiscountCodeAsync(CreateDiscountCodeRequest request);
    Task<List<DiscountCodeDto>> GetAllDiscountCodesAsync();
    Task<DiscountCodeDto> UpdateDiscountCodeAsync(long id, CreateDiscountCodeRequest request);
}
