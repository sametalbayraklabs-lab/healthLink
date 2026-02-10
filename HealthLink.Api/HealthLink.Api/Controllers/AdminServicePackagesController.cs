using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/service-packages")]
[Authorize(Roles = "Admin")]
public class AdminServicePackagesController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminServicePackagesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ServicePackageDto>>> GetAll([FromQuery] string? expertType, [FromQuery] bool? isActive)
    {
        var query = _db.ServicePackages.AsQueryable();

        if (!string.IsNullOrEmpty(expertType))
        {
            query = query.Where(x => x.ExpertType.ToString() == expertType);
        }

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        var packages = await query
            .OrderBy(x => x.ExpertType)
            .ThenBy(x => x.Price)
            .ToListAsync();

        var dtos = packages.Select(p => new ServicePackageDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            ExpertType = p.ExpertType,
            SessionCount = p.SessionCount,
            Price = p.Price,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServicePackageDto>> GetById(long id)
    {
        var package = await _db.ServicePackages.FindAsync(id);
        if (package == null)
        {
            return NotFound();
        }

        var dto = new ServicePackageDto
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            ExpertType = package.ExpertType,
            SessionCount = package.SessionCount,
            Price = package.Price,
            IsActive = package.IsActive,
            CreatedAt = package.CreatedAt,
            UpdatedAt = package.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ServicePackageDto>> Create(CreateServicePackageDto request)
    {
        var package = new ServicePackage
        {
            Name = request.Name,
            Description = request.Description,
            ExpertType = request.ExpertType,
            SessionCount = request.SessionCount,
            Price = request.Price,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.ServicePackages.Add(package);
        await _db.SaveChangesAsync();

        var dto = new ServicePackageDto
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            ExpertType = package.ExpertType,
            SessionCount = package.SessionCount,
            Price = package.Price,
            IsActive = package.IsActive,
            CreatedAt = package.CreatedAt,
            UpdatedAt = package.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = package.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ServicePackageDto>> Update(long id, UpdateServicePackageDto request)
    {
        var package = await _db.ServicePackages.FindAsync(id);
        if (package == null)
        {
            return NotFound();
        }

        if (request.Name != null) package.Name = request.Name;
        if (request.Description != null) package.Description = request.Description;
        if (request.ExpertType.HasValue) package.ExpertType = request.ExpertType.Value;
        if (request.SessionCount.HasValue) package.SessionCount = request.SessionCount.Value;
        if (request.Price.HasValue) package.Price = request.Price.Value;
        if (request.IsActive.HasValue) package.IsActive = request.IsActive.Value;

        package.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new ServicePackageDto
        {
            Id = package.Id,
            Name = package.Name,
            Description = package.Description,
            ExpertType = package.ExpertType,
            SessionCount = package.SessionCount,
            Price = package.Price,
            IsActive = package.IsActive,
            CreatedAt = package.CreatedAt,
            UpdatedAt = package.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var package = await _db.ServicePackages.FindAsync(id);
        if (package == null)
        {
            return NotFound();
        }

        // Check if package is in use
        var inUse = await _db.ClientPackages.AnyAsync(x => x.ServicePackageId == id);
        if (inUse)
        {
            return BadRequest(new { message = "Bu paket kullanımda. Pasif hale getirebilirsiniz." });
        }

        _db.ServicePackages.Remove(package);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
