using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Auth;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register-client")]
    public async Task<ActionResult<RegisterClientResponseDto>> RegisterClient(RegisterClientRequestDto request)
    {
        var result = await _auth.RegisterClientAsync(request);
        return CreatedAtAction(nameof(RegisterClient), result);
    }

    [HttpPost("register-expert")]
    public async Task<ActionResult<RegisterExpertResponseDto>> RegisterExpert(RegisterExpertRequestDto request)
    {
        var result = await _auth.RegisterExpertAsync(request);
        return CreatedAtAction(nameof(RegisterExpert), result);
    }

    [HttpPost("register-admin")]
    public async Task<ActionResult> RegisterAdmin(RegisterAdminRequestDto request)
    {
        var result = await _auth.RegisterAdminAsync(request);
        return CreatedAtAction(nameof(RegisterAdmin), result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
    {
        var result = await _auth.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequestDto request)
    {
        var userId = UserHelper.GetUserId(User);
        await _auth.ChangePasswordAsync(userId, request);
        return Ok(new { success = true });
    }
}

