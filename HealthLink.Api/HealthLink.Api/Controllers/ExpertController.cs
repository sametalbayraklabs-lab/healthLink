using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/expert")]
public class ExpertController : ControllerBase
{
    private readonly IExpertService _service;

    public ExpertController(IExpertService service)
    {
        _service = service;
    }

    private long UserId => long.Parse(User.FindFirst("userId")?.Value ?? "18"); // Fallback to test expert

    /// <summary>
    /// Get current expert's profile
    /// </summary>
    [HttpGet("profile")]
    // [Authorize(Roles = "Expert")] // TODO: Re-enable after auth is fixed
    public async Task<ActionResult<ExpertProfileDto>> GetProfile()
    {
        var profile = await _service.GetExpertProfileAsync(UserId);
        return Ok(profile);
    }

    /// <summary>
    /// Update current expert's profile
    /// </summary>
    [HttpPut("profile")]
    // [Authorize(Roles = "Expert")] // TODO: Re-enable after auth is fixed
    public async Task<ActionResult<ExpertProfileDto>> UpdateProfile([FromBody] UpdateExpertRequestDto request)
    {
        var profile = await _service.UpdateExpertProfileAsync(UserId, request);
        return Ok(profile);
    }

    /// <summary>
    /// Get expert's availability for a specific date
    /// </summary>
    [HttpGet("{id:long}/availability")]
    public async Task<ActionResult<AvailabilityDto>> GetAvailability(long id, [FromQuery] DateOnly date)
    {
        var result = await _service.GetAvailabilityAsync(id, date);
        return Ok(result);
    }
}
