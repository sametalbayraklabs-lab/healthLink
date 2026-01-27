namespace HealthLink.Api.Entities
{
    public class AppointmentNote
    {
        public long Id { get; set; }

        public long AppointmentId { get; set; }
        public Appointment Appointment { get; set; } = null!;

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public string NoteText { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
