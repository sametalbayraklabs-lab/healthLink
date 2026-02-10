namespace HealthLink.Api.Entities
{
    public class ExpertScheduleTimeSlot
    {
        public long Id { get; set; }

        public long TemplateId { get; set; }
        public ExpertScheduleTemplate Template { get; set; } = null!;

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
