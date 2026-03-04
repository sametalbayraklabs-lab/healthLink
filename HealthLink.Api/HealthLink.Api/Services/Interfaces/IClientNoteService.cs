using HealthLink.Api.Dtos.ClientNote;

namespace HealthLink.Api.Services.Interfaces;

public interface IClientNoteService
{
    Task<List<ClientNoteDto>> GetNotesForClientAsync(long expertUserId, long clientId);
    Task<List<ClientNoteDto>> GetNotesForAppointmentAsync(long expertUserId, long appointmentId);
    Task<ClientNoteDto> CreateNoteAsync(long expertUserId, CreateClientNoteDto dto);
    Task<ClientNoteDto> UpdateNoteAsync(long expertUserId, long noteId, UpdateClientNoteDto dto);
    Task DeleteNoteAsync(long expertUserId, long noteId);
}
