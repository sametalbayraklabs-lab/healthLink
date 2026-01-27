namespace HealthLink.Api.Entities
{
    public class ExpertScheduleTemplate
    {
        public long Id { get; set; }

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public int DayOfWeek { get; set; } // 0–6

        public bool IsOpen { get; set; }

        public TimeOnly? WorkStartTime { get; set; }

        public TimeOnly? WorkEndTime { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
