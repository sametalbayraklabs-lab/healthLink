using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ExpertAvailabilitySlot
    {
        public long Id { get; set; }
        public long ExpertId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public SlotStatus Status { get; set; } = SlotStatus.Available;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Expert Expert { get; set; } = null!;
    }
}
