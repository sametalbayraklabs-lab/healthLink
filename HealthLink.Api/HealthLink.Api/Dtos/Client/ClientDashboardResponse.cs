namespace HealthLink.Api.Dtos.Client;

public class ClientDashboardResponse
{
    public int UpcomingAppointmentsCount { get; set; }
    public int CompletedAppointmentsCount { get; set; }
    public int ActivePackagesCount { get; set; }
    public int UnreadMessagesCount { get; set; }
}
