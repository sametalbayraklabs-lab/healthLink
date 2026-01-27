using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Package;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/client-packages")]
// [Authorize] // Temporarily disabled
public class ClientPackagesController : ControllerBase
{
    private readonly IClientPackageService _clientPackageService;

    public ClientPackagesController(IClientPackageService clientPackageService)
    {
        _clientPackageService = clientPackageService;
    }

    /// <summary>
    /// Get my packages
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<List<ClientPackageDto>>> GetMyPackages()
    {
        var userId = User.GetUserId();
        var packages = await _clientPackageService.GetMyPackagesAsync(userId);
        return Ok(packages);
    }

    /// <summary>
    /// Purchase a package
    /// </summary>
    [HttpPost("purchase")]
    public async Task<ActionResult<PurchasePackageResponse>> Purchase([FromBody] PurchasePackageRequest request)
    {
        var userId = User.GetUserId();
        var response = await _clientPackageService.PurchasePackageAsync(userId, request);
        return Ok(response);
    }

    /// <summary>
    /// Get package by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ClientPackageDto>> GetById(long id)
    {
        var userId = User.GetUserId();
        var package = await _clientPackageService.GetPackageByIdAsync(userId, id);
        return Ok(package);
    }
}

