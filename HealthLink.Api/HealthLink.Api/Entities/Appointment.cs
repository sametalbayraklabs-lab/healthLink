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

        public string? ZoomLink { get; set; }

        public AppointmentStatus Status { get; set; }  // Enum (stored as int)

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}