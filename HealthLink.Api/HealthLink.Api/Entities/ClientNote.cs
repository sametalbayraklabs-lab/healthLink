using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ClientNote
    {
        public long Id { get; set; }

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public long? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public ClientNoteType NoteType { get; set; } = ClientNoteType.General;

        public string Content { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
