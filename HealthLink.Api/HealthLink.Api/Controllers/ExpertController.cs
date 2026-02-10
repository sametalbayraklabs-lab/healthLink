using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/expert")]
[Authorize(Roles = "Expert")] // Only experts can access these endpoints
public class ExpertController : BaseAuthenticatedController
{
    private readonly IExpertService _service;

    public ExpertController(IExpertService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get current expert's profile
    /// </summary>
    [HttpGet("profile")]
    public async Task<ActionResult<ExpertProfileDto>> GetProfile()
    {
        var profile = await _service.GetExpertProfileAsync(UserId);
        return Ok(profile);
    }

    /// <summary>
    /// Update current expert's profile
    /// </summary>
    [HttpPut("profile")]
    public async Task<ActionResult<ExpertProfileDto>> UpdateProfile([FromBody] UpdateExpertRequestDto request)
    {
        var profile = await _service.UpdateExpertProfileAsync(UserId, request);
        return Ok(profile);
    }

    /// <summary>
    /// Get expert's availability for a specific date
    /// </summary>
    [HttpGet("{id:long}/availability")]
    [AllowAnonymous] // Public endpoint
    public async Task<ActionResult<AvailabilityDto>> GetAvailability(long id, [FromQuery] DateOnly date)
    {
        var result = await _service.GetAvailabilityAsync(id, date);
        return Ok(result);
    }
}
