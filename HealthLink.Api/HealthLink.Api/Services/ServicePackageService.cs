using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Package;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class ServicePackageService : IServicePackageService
{
    private readonly AppDbContext _db;

    public ServicePackageService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ServicePackageDto>> GetAllPackagesAsync(string? expertType = null)
    {
        var query = _db.ServicePackages.Where(x => x.IsActive);

        if (!string.IsNullOrWhiteSpace(expertType))
        {
            var parsedType = EnumExtensions.ParseExpertType(expertType);
            query = query.Where(x => x.ExpertType == parsedType || x.ExpertType == ExpertType.All);
        }

        var packages = await query.ToListAsync();

        return packages.Select(p => new ServicePackageDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            ExpertType = p.ExpertType.ToApiString(),
            SessionCount = p.SessionCount,
            Price = p.Price,
            Currency = p.Currency,
            IsActive = p.IsActive
        }).ToList();
    }

    public async Task<ServicePackageDto> GetPackageByIdAsync(long id)
    {
        var package = await _db.ServicePackages.FindAsync(id);

        if (package == null)
        {
            throw new BusinessException(
                "PACKAGE_NOT_FOUND",
                "Paket bulunamadı.",
                404
            );
        }

        return new ServicePackageDto
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            ExpertType = package.ExpertType.ToApiString(),
            SessionCount = package.SessionCount,
            Price = package.Price,
            Currency = package.Currency,
            IsActive = package.IsActive
        };
    }

    public async Task<ServicePackageDto> CreatePackageAsync(CreateServicePackageRequest request)
    {
        var expertType = EnumExtensions.ParseExpertType(request.ExpertType);

        var package = new ServicePackage
        {
            Name = request.Name,
            Description = request.Description,
            ExpertType = expertType,
            SessionCount = request.SessionCount,
            Price = request.Price,
            Currency = request.Currency,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.ServicePackages.Add(package);
        await _db.SaveChangesAsync();

        return new ServicePackageDto
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            ExpertType = package.ExpertType.ToApiString(),
            SessionCount = package.SessionCount,
            Price = package.Price,
            Currency = package.Currency,
            IsActive = package.IsActive
        };
    }

    public async Task<ServicePackageDto> UpdatePackageAsync(long id, UpdateServicePackageRequest request)
    {
        var package = await _db.ServicePackages.FindAsync(id);

        if (package == null)
        {
            throw new BusinessException(
                "PACKAGE_NOT_FOUND",
                "Paket bulunamadı.",
                404
            );
        }

        if (request.Name != null) package.Name = request.Name;
        if (request.Description != null) package.Description = request.Description;
        if (request.ExpertType != null) package.ExpertType = EnumExtensions.ParseExpertType(request.ExpertType);
        if (request.SessionCount.HasValue) package.SessionCount = request.SessionCount.Value;
        if (request.Price.HasValue) package.Price = request.Price.Value;
        if (request.Currency != null) package.Currency = request.Currency;
        if (request.IsActive.HasValue) package.IsActive = request.IsActive.Value;

        package.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new ServicePackageDto
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            ExpertType = package.ExpertType.ToApiString(),
            SessionCount = package.SessionCount,
            Price = package.Price,
            Currency = package.Currency,
            IsActive = package.IsActive
        };
    }

    public async Task DeletePackageAsync(long id)
    {
        var package = await _db.ServicePackages.FindAsync(id);

        if (package == null)
        {
            throw new BusinessException(
                "PACKAGE_NOT_FOUND",
                "Paket bulunamadı.",
                404
            );
        }

        // Soft delete
        package.IsActive = false;
        package.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }
}
