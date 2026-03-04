using HealthLink.Api.Data;
using HealthLink.Api.Dtos.ClientNote;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class ClientNoteService : IClientNoteService
{
    private readonly AppDbContext _db;

    public ClientNoteService(AppDbContext db) => _db = db;

    public async Task<List<ClientNoteDto>> GetNotesForClientAsync(long expertUserId, long clientId)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var notes = await _db.ClientNotes
            .Where(n => n.ExpertId == expert.Id && n.ClientId == clientId)
            .OrderByDescending(n => n.CreatedAt)
            .Include(n => n.Appointment)
            .ToListAsync();

        return notes.Select(MapToDto).ToList();
    }

    public async Task<List<ClientNoteDto>> GetNotesForAppointmentAsync(long expertUserId, long appointmentId)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var notes = await _db.ClientNotes
            .Where(n => n.ExpertId == expert.Id && n.AppointmentId == appointmentId)
            .OrderByDescending(n => n.CreatedAt)
            .Include(n => n.Appointment)
            .ToListAsync();

        return notes.Select(MapToDto).ToList();
    }

    public async Task<ClientNoteDto> CreateNoteAsync(long expertUserId, CreateClientNoteDto dto)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        // Validate client exists and has relationship with this expert
        var hasRelation = await _db.Appointments
            .AnyAsync(a => a.ExpertId == expert.Id && a.ClientId == dto.ClientId);

        if (!hasRelation)
            throw new InvalidOperationException("You don't have any appointments with this client");

        // Enforce single General note per expert-client pair
        if (dto.NoteType == Entities.Enums.ClientNoteType.General)
        {
            var existingGeneral = await _db.ClientNotes
                .AnyAsync(n => n.ExpertId == expert.Id
                    && n.ClientId == dto.ClientId
                    && n.NoteType == Entities.Enums.ClientNoteType.General);

            if (existingGeneral)
                throw new InvalidOperationException("A general note already exists for this client. Please edit the existing one.");
        }

        // If appointment note, validate appointment belongs to this expert+client
        if (dto.AppointmentId.HasValue)
        {
            var appointment = await _db.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId.Value
                    && a.ExpertId == expert.Id
                    && a.ClientId == dto.ClientId);

            if (appointment == null)
                throw new InvalidOperationException("Appointment not found or doesn't belong to this expert-client pair");
        }

        var note = new Entities.ClientNote
        {
            ClientId = dto.ClientId,
            ExpertId = expert.Id,
            AppointmentId = dto.AppointmentId,
            NoteType = dto.NoteType,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        _db.ClientNotes.Add(note);
        await _db.SaveChangesAsync();

        // Reload with appointment
        if (note.AppointmentId.HasValue)
        {
            await _db.Entry(note).Reference(n => n.Appointment).LoadAsync();
        }

        return MapToDto(note);
    }

    public async Task<ClientNoteDto> UpdateNoteAsync(long expertUserId, long noteId, UpdateClientNoteDto dto)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var note = await _db.ClientNotes
            .Include(n => n.Appointment)
            .FirstOrDefaultAsync(n => n.Id == noteId && n.ExpertId == expert.Id)
            ?? throw new KeyNotFoundException("Note not found");

        note.Content = dto.Content;
        if (dto.NoteType.HasValue)
            note.NoteType = dto.NoteType.Value;
        note.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(note);
    }

    public async Task DeleteNoteAsync(long expertUserId, long noteId)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var note = await _db.ClientNotes
            .FirstOrDefaultAsync(n => n.Id == noteId && n.ExpertId == expert.Id)
            ?? throw new KeyNotFoundException("Note not found");

        if (note.NoteType == Entities.Enums.ClientNoteType.General)
            throw new InvalidOperationException("General notes cannot be deleted. You can only edit their content.");

        _db.ClientNotes.Remove(note);
        await _db.SaveChangesAsync();
    }

    private static ClientNoteDto MapToDto(Entities.ClientNote note)
    {
        return new ClientNoteDto
        {
            Id = note.Id,
            ClientId = note.ClientId,
            ExpertId = note.ExpertId,
            AppointmentId = note.AppointmentId,
            AppointmentDate = note.Appointment?.StartDateTime,
            NoteType = note.NoteType.ToString(),
            NoteTypeLabel = note.NoteType switch
            {
                ClientNoteType.General => "Genel Not",
                ClientNoteType.Session => "Seans Notu",
                ClientNoteType.Private => "Özel Not",
                _ => "Not"
            },
            Content = note.Content,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }
}
