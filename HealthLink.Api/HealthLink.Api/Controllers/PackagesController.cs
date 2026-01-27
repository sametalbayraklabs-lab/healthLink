using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Package;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/packages")]
public class PackagesController : ControllerBase
{
    private readonly IServicePackageService _packageService;

    public PackagesController(IServicePackageService packageService)
    {
        _packageService = packageService;
    }

    /// <summary>
    /// Get all active packages
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ServicePackageDto>>> GetAll([FromQuery] string? expertType = null)
    {
        var packages = await _packageService.GetAllPackagesAsync(expertType);
        return Ok(packages);
    }

    /// <summary>
    /// Get package by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServicePackageDto>> GetById(long id)
    {
        var package = await _packageService.GetPackageByIdAsync(id);
        return Ok(package);
    }

    /// <summary>
    /// Create new package (Admin only)
    /// </summary>
    [HttpPost]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ServicePackageDto>> Create([FromBody] CreateServicePackageRequest request)
    {
        var package = await _packageService.CreatePackageAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = package.Id }, package);
    }

    /// <summary>
    /// Update package (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ServicePackageDto>> Update(long id, [FromBody] UpdateServicePackageRequest request)
    {
        var package = await _packageService.UpdatePackageAsync(id, request);
        return Ok(package);
    }

    /// <summary>
    /// Delete package (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<IActionResult> Delete(long id)
    {
        await _packageService.DeletePackageAsync(id);
        return NoContent();
    }
}

