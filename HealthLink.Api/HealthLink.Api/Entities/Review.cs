using System;

using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class Review
    {
        public long Id { get; set; }

        public long AppointmentId { get; set; }
        public Appointment Appointment { get; set; } = null!;

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public int Rating { get; set; } // 1–5

        public string? Comment { get; set; }

        public ReviewStatus Status { get; set; }

        public string? AdminNote { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public long? ReviewedByAdminId { get; set; }
        public User? ReviewedByAdmin { get; set; }
    }
}
