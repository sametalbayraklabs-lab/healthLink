namespace HealthLink.Api.Dtos.Expert;

public class ExpertDashboardResponse
{
    public int TodayAppointmentsCount { get; set; }
    public int TotalClientsCount { get; set; }
    public int CompletedSessionsCount { get; set; }
    public int UnreadMessagesCount { get; set; }
}
