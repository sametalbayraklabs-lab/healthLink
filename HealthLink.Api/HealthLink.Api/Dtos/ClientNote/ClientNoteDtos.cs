using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.ClientNote;

public class CreateClientNoteDto
{
    public long ClientId { get; set; }
    public long? AppointmentId { get; set; }
    public ClientNoteType NoteType { get; set; } = ClientNoteType.General;
    public string Content { get; set; } = null!;
}

public class UpdateClientNoteDto
{
    public string Content { get; set; } = null!;
    public ClientNoteType? NoteType { get; set; }
}

public class ClientNoteDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public long ExpertId { get; set; }
    public long? AppointmentId { get; set; }
    public DateTime? AppointmentDate { get; set; }
    public string NoteType { get; set; } = null!;
    public string NoteTypeLabel { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
