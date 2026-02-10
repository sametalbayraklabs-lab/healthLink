using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Appointments;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentsController : BaseAuthenticatedController
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
        var result = await _service.CreateAsync(UserId, request);
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(long id)
    {
        await _service.CancelAsync(UserId, id);
        return NoContent();
    }

    [HttpPost("{id}/incomplete")]
    public async Task<IActionResult> Incomplete(long id)
    {
        await _service.MarkIncompleteAsync(UserId, id);
        return NoContent();
    }


}

