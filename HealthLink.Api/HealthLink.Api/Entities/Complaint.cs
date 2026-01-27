using System;

using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class Complaint
    {
        public long Id { get; set; }

        public long? ClientId { get; set; }
        public Client? Client { get; set; }

        public long? ExpertId { get; set; }
        public Expert? Expert { get; set; }

        public long? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public ComplaintCategory Category { get; set; }

        public ComplaintType Type { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public ComplaintStatus Status { get; set; }

        public string? AdminNote { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? ClosedAt { get; set; }
    }
}
