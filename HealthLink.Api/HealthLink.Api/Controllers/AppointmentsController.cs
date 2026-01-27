using HealthLink.Api.Dtos.Appointments;
using HealthLink.Api.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/appointments")]
// [Authorize] // Temporarily disabled
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _service;

    public AppointmentsController(IAppointmentService service)
    {
        _service = service;
    }

    [HttpPost("{id}/create")]
    public async Task<IActionResult> Create(
        [FromBody] CreateAppointmentRequest request)
    {
        var userId = long.Parse(User.FindFirst("userId")!.Value);

        var result = await _service.CreateAsync(userId, request);
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(long id)
    {
        var userId = long.Parse(User.FindFirst("userId")!.Value);
        await _service.CancelAsync(userId, id);
        return NoContent();
    }

    [HttpPost("{id}/incomplete")]
    public async Task<IActionResult> Incomplete(long id)
    {
        var userId = long.Parse(User.FindFirst("userId")!.Value);
        await _service.MarkIncompleteAsync(userId, id);
        return NoContent();
    }


}

