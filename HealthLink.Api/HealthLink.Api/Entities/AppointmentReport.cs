namespace HealthLink.Api.Entities
{
    public class AppointmentReport
    {
        public long Id { get; set; }

        public long AppointmentId { get; set; }
        public Appointment Appointment { get; set; } = null!;

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public string ReportText { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
