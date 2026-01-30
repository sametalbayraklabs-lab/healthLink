namespace HealthLink.Api.Dtos.Expert;

public class AvailabilityDto
{
    public long ExpertId { get; set; }
    public DateOnly Date { get; set; }
    public List<TimeSlotDto> AvailableSlots { get; set; } = new();
}

public class TimeSlotDto
{
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int DurationMinutes { get; set; }
}
