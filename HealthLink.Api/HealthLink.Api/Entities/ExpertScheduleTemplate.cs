namespace HealthLink.Api.Entities
{
    public class ExpertScheduleTemplate
    {
        public long Id { get; set; }

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public int DayOfWeek { get; set; } // 0–6

        public bool IsOpen { get; set; }

        public bool AutoMarkAvailable { get; set; } = true; // Default: auto-mark slots as available

        public ICollection<ExpertScheduleTimeSlot> TimeSlots { get; set; } = new List<ExpertScheduleTimeSlot>();

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
