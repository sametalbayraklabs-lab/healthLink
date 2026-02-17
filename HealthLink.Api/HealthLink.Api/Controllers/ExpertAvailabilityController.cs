using HealthLink.Api.Services;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/expert/availability")]
[Authorize(Roles = "Expert")]
public class ExpertAvailabilityController : BaseAuthenticatedController
{
    private readonly IExpertAvailabilityService _availabilityService;

    public ExpertAvailabilityController(IExpertAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    /// <summary>
    /// Get all time slot templates (48 slots, 30-min intervals)
    /// </summary>
    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        var templates = await _availabilityService.GetAllTemplatesAsync();
        return Ok(templates);
    }

    /// <summary>
    /// Get daily availability slots for the expert
    /// </summary>
    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyAvailability([FromQuery] DateOnly date)
    {
        if (!ExpertId.HasValue)
        {
            return Unauthorized(new { message = "Expert ID bulunamadı" });
        }

        var slots = await _availabilityService.GetDailyAvailabilityAsync(ExpertId.Value, date);
        return Ok(slots);
    }

    /// <summary>
    /// Save daily availability slots for the expert
    /// </summary>
    [HttpPost("daily")]
    public async Task<IActionResult> SaveDailyAvailability([FromBody] SaveDailyAvailabilityRequest request)
    {
        if (!ExpertId.HasValue)
        {
            return Unauthorized(new { message = "Expert ID bulunamadı" });
        }

        await _availabilityService.SaveDailyAvailabilityAsync(ExpertId.Value, request.Date, request.Slots);

        // Return updated slots
        var slots = await _availabilityService.GetDailyAvailabilityAsync(ExpertId.Value, request.Date);
        return Ok(slots);
    }
}
