using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Expert
{
    public class ExpertAvailabilitySlotResponse
    {
        public int TimeSlotTemplateId { get; set; }
        public string StartTime { get; set; } = string.Empty;  // "09:00"
        public string EndTime { get; set; } = string.Empty;    // "09:30"
        public SlotStatus Status { get; set; }
    }
}
