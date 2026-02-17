using HealthLink.Api.Dtos.Package;

namespace HealthLink.Api.Services.Interfaces;

public interface IClientPackageService
{
    Task<List<ClientPackageDto>> GetMyPackagesAsync(long userId);
    Task<ClientPackageDto> GetPackageByIdAsync(long userId, long packageId);
    Task<PurchasePackageResponse> PurchasePackageAsync(long userId, PurchasePackageRequest request, string? buyerIp = null);
}
