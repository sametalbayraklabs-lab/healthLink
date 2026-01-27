using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ExpertScheduleException
    {
        public long Id { get; set; }

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public DateOnly Date { get; set; }

        public ScheduleExceptionType Type { get; set; }  // Enum (stored as int)

        public TimeOnly? StartTime { get; set; }

        public TimeOnly? EndTime { get; set; }

        public string? Reason { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
