using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ExpertAvailabilitySlot
    {
        public long Id { get; set; }
        public long ExpertId { get; set; }
        public DateOnly Date { get; set; }
        public int TimeSlotTemplateId { get; set; }
        public string SlotTime { get; set; } = string.Empty; // "09:00" — bilgi amaçlı
        public SlotStatus Status { get; set; } = SlotStatus.Available;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Expert Expert { get; set; } = null!;
        public TimeSlotTemplate TimeSlotTemplate { get; set; } = null!;
    }
}
