using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Client;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/clients")]
// [Authorize] // Temporarily disabled
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet("me")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ClientProfileDto>> GetMe()
    {
        var userId = User.GetUserId();
        var result = await _clientService.GetClientProfileAsync(userId);
        return Ok(result);
    }

    [HttpPut("me")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ClientProfileDto>> UpdateMe(UpdateClientRequestDto request)
    {
        var userId = User.GetUserId();
        var result = await _clientService.UpdateClientProfileAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ClientProfileDto>> GetById(long id)
    {
        var result = await _clientService.GetClientByIdAsync(id);
        return Ok(result);
    }
}

