using HealthLink.Api.Dtos.ClientNote;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/expert/client-notes")]
[Authorize(Roles = "Expert")]
public class ClientNotesController : BaseAuthenticatedController
{
    private readonly IClientNoteService _service;

    public ClientNotesController(IClientNoteService service)
    {
        _service = service;
    }

    /// <summary>Get all notes for a client</summary>
    [HttpGet("{clientId:long}")]
    public async Task<ActionResult<List<ClientNoteDto>>> GetNotes(long clientId)
    {
        var notes = await _service.GetNotesForClientAsync(UserId, clientId);
        return Ok(notes);
    }

    /// <summary>Get notes for a specific appointment</summary>
    [HttpGet("appointment/{appointmentId:long}")]
    public async Task<ActionResult<List<ClientNoteDto>>> GetAppointmentNotes(long appointmentId)
    {
        var notes = await _service.GetNotesForAppointmentAsync(UserId, appointmentId);
        return Ok(notes);
    }

    /// <summary>Create a new note</summary>
    [HttpPost]
    public async Task<ActionResult<ClientNoteDto>> CreateNote([FromBody] CreateClientNoteDto dto)
    {
        try
        {
            var note = await _service.CreateNoteAsync(UserId, dto);
            return Ok(note);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Update a note</summary>
    [HttpPut("{id:long}")]
    public async Task<ActionResult<ClientNoteDto>> UpdateNote(long id, [FromBody] UpdateClientNoteDto dto)
    {
        try
        {
            var note = await _service.UpdateNoteAsync(UserId, id, dto);
            return Ok(note);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>Delete a note</summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteNote(long id)
    {
        try
        {
            await _service.DeleteNoteAsync(UserId, id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
