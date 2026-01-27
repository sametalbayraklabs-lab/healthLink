using HealthLink.Api.Common;
using HealthLink.Api.Dtos.User;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/users")]
// [Authorize] // Temporarily disabled
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMe()
    {
        var userId = User.GetUserId();
        var result = await _userService.GetCurrentUserProfileAsync(userId);
        return Ok(result);
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateMe(UpdateUserRequestDto request)
    {
        var userId = User.GetUserId();
        var result = await _userService.UpdateUserProfileAsync(userId, request);
        return Ok(result);
    }
}

