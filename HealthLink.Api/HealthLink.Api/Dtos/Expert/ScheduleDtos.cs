using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Expert;

public class ScheduleTemplateDto
{
    public int DayOfWeek { get; set; } // 0-6 (Sunday-Saturday)
    public bool IsOpen { get; set; }
    public bool AutoMarkAvailable { get; set; } = true;
    public List<TimeSlotDto> TimeSlots { get; set; } = new();
}

public class UpdateScheduleTemplatesDto
{
    public List<ScheduleTemplateDto> Templates { get; set; } = new();
}

public class ScheduleExceptionDto
{
    public long Id { get; set; }
    public DateOnly Date { get; set; }
    public ScheduleExceptionType Type { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateScheduleExceptionDto
{
    public DateOnly Date { get; set; }
    public ScheduleExceptionType Type { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Reason { get; set; }
}

public class UpdateScheduleExceptionDto
{
    public DateOnly? Date { get; set; }
    public ScheduleExceptionType? Type { get; set; }
    public TimeOnly? StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Reason { get; set; }
}
