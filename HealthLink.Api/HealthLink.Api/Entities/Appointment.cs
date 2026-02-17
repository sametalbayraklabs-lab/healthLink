using System.ComponentModel.DataAnnotations;
using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class Appointment
    {
        public long Id { get; set; }

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public long? ClientPackageId { get; set; }
        public ClientPackage? ClientPackage { get; set; }

        public ServiceType ServiceType { get; set; }  // Enum (stored as int)

        public DateTime StartDateTime { get; set; }

        public DateTime EndDateTime { get; set; }

        // Daily.co video fields
        [MaxLength(100)]
        public string? DailyRoomName { get; set; }     // Daily.co room name (e.g. "hl-appt-42")

        [MaxLength(500)]
        public string? MeetingUrl { get; set; }        // Daily.co full URL

        [MaxLength(500)]
        public string? RecordingUrl { get; set; }      // Recording URL (future use)

        [MaxLength(30)]
        public string? RecordingStatus { get; set; }   // Recording status (future use)

        public AppointmentStatus Status { get; set; }  // Enum (stored as int)

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}