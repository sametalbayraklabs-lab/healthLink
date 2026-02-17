namespace HealthLink.Api.Entities
{
    public class TimeSlotTemplate
    {
        public int Id { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public int SortOrder { get; set; }
    }
}
