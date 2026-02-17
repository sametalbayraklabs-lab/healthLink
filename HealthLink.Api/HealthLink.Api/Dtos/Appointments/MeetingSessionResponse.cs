namespace HealthLink.Api.Dtos.Appointments;

/// <summary>
/// Response returned when starting or joining a video meeting session.
/// </summary>
public class MeetingSessionResponse
{
    /// <summary>Daily.co room URL</summary>
    public string MeetingUrl { get; set; } = null!;

    /// <summary>Daily.co meeting token for authentication</summary>
    public string Token { get; set; } = null!;
}
