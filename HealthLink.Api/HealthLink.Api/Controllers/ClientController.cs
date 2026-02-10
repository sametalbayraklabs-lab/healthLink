using HealthLink.Api.Dtos.Client;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Client")]
public class ClientController : BaseAuthenticatedController
{
    private readonly IClientService _service;

    public ClientController(IClientService service)
    {
        _service = service;
    }



    [HttpGet("profile")]
    public async Task<ActionResult<ClientProfileResponse>> GetProfile()
        => Ok(await _service.GetProfileAsync(UserId));

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateClientProfileRequest request)
    {
        await _service.UpdateProfileAsync(UserId, request);
        return NoContent();
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ClientDashboardResponse>> GetDashboard()
        => Ok(await _service.GetDashboardAsync(UserId));

    // API-1 Endpoints
    [HttpGet("my")]
    public async Task<ActionResult<ClientProfileDto>> GetMyProfile()
        => Ok(await _service.GetClientProfileAsync(UserId));

    [HttpPut("my")]
    public async Task<ActionResult<ClientProfileDto>> UpdateMyProfile([FromBody] UpdateClientRequestDto request)
        => Ok(await _service.UpdateClientProfileAsync(UserId, request));

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClientListItemResponse>>> GetAllClients()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("by-expert")]
    public async Task<ActionResult<IReadOnlyList<ClientListItemResponse>>> GetClientsByExpert()
    {
        var result = await _service.GetByExpertAsync(UserId);
        return Ok(result);
    }
}
