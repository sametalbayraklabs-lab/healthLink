using HealthLink.Api.Dtos.Measurement;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/expert/measurements")]
[Authorize(Roles = "Expert")]
public class MeasurementsController : BaseAuthenticatedController
{
    private readonly IMeasurementService _service;

    public MeasurementsController(IMeasurementService service)
    {
        _service = service;
    }

    /// <summary>Get all measurements for a client</summary>
    [HttpGet("{clientId:long}")]
    public async Task<ActionResult<List<MeasurementDto>>> GetMeasurements(long clientId)
    {
        var measurements = await _service.GetMeasurementsAsync(UserId, clientId);
        return Ok(measurements);
    }

    /// <summary>Create a new measurement</summary>
    [HttpPost]
    public async Task<ActionResult<MeasurementDto>> CreateMeasurement([FromBody] CreateMeasurementDto dto)
    {
        try
        {
            var measurement = await _service.CreateMeasurementAsync(UserId, dto);
            return Ok(measurement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Update a measurement</summary>
    [HttpPut("{id:long}")]
    public async Task<ActionResult<MeasurementDto>> UpdateMeasurement(long id, [FromBody] UpdateMeasurementDto dto)
    {
        try
        {
            var measurement = await _service.UpdateMeasurementAsync(UserId, id, dto);
            return Ok(measurement);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>Delete a measurement</summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteMeasurement(long id)
    {
        try
        {
            await _service.DeleteMeasurementAsync(UserId, id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
