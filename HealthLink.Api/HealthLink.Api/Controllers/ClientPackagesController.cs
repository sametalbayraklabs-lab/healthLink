using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Package;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/client-packages")]
[Authorize(Roles = "Client")]
public class ClientPackagesController : BaseAuthenticatedController
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
        var packages = await _clientPackageService.GetMyPackagesAsync(UserId);
        return Ok(packages);
    }

    /// <summary>
    /// Purchase a package (initiates Iyzico checkout form)
    /// </summary>
    [HttpPost("purchase")]
    public async Task<ActionResult<PurchasePackageResponse>> Purchase([FromBody] PurchasePackageRequest request)
    {
        var buyerIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var response = await _clientPackageService.PurchasePackageAsync(UserId, request, buyerIp);
        return Ok(response);
    }

    /// <summary>
    /// Get package by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ClientPackageDto>> GetById(long id)
    {
        var package = await _clientPackageService.GetPackageByIdAsync(UserId, id);
        return Ok(package);
    }
}

