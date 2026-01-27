using HealthLink.Api.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers
{
    [ApiController]
    [Route("api/expert")]
    public class ExpertController : ControllerBase
    {
        // Public erisim mi, auth mu? Simdilik güvenli olsun diye authorize ekledim.
        // Public istiyorsan bu attribute'u kaldirabilirsin.
        // [Authorize] // Temporarily disabled
        [HttpGet("{id:long}/availability")]
        public async Task<IActionResult> GetAvailability(
            long id,
            [FromQuery] DateOnly date,
            [FromServices] IExpertAvailabilityService service)
        {
            var result = await service.GetDailyAvailabilityAsync(id, date);
            return Ok(result);
        }
    }
}

