using HealthLink.Api.Dtos.Client;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientController : ControllerBase
{
    private readonly IClientService _service;

    public ClientController(IClientService service)
    {
        _service = service;
    }

    // Temporary solution: Parse userId from JWT token manually
    // TODO: Properly implement JWT authentication middleware
    private long UserId
    {
        get
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                throw new UnauthorizedAccessException("No valid authorization header");
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub");
            
            if (subClaim == null || !long.TryParse(subClaim.Value, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid token: missing or invalid 'sub' claim");
            }

            return userId;
        }
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
