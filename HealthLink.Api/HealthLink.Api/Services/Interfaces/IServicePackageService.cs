using HealthLink.Api.Dtos.Package;

namespace HealthLink.Api.Services.Interfaces;

public interface IServicePackageService
{
    Task<List<ServicePackageDto>> GetAllPackagesAsync(string? expertType = null);
    Task<ServicePackageDto> GetPackageByIdAsync(long id);
    Task<ServicePackageDto> CreatePackageAsync(CreateServicePackageRequest request);
    Task<ServicePackageDto> UpdatePackageAsync(long id, UpdateServicePackageRequest request);
    Task DeletePackageAsync(long id);
}
