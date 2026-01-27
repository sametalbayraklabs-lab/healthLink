using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("claims")]
    public IActionResult GetClaims()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        var userId = User.FindFirstValue("sub");
        var userIdFromClaimTypes = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        return Ok(new
        {
            IsAuthenticated = User.Identity?.IsAuthenticated,
            Name = User.Identity?.Name,
            AllClaims = claims,
            UserIdFromSub = userId,
            UserIdFromClaimTypes = userIdFromClaimTypes
        });
    }
}
