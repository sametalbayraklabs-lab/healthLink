namespace HealthLink.Api.Services.Interfaces;

/// <summary>
/// Service for interacting with the Daily.co video API.
/// </summary>
public interface IDailyService
{
    /// <summary>
    /// Creates a private Daily.co room for an appointment.
    /// Room name format: "hl-appt-{appointmentId}"
    /// Room expires at the given expiry time.
    /// </summary>
    Task<(string RoomName, string RoomUrl)> CreateRoomAsync(long appointmentId, DateTime expiry);

    /// <summary>
    /// Generates a meeting token for a participant.
    /// </summary>
    /// <param name="roomName">Daily.co room name</param>
    /// <param name="userId">User ID for identification</param>
    /// <param name="userName">Display name in the call</param>
    /// <param name="isOwner">True for Expert (owner privileges)</param>
    /// <param name="expiry">Token expiration time</param>
    Task<string> GetMeetingTokenAsync(string roomName, long userId, string userName, bool isOwner, DateTime expiry);

    /// <summary>
    /// Deletes a Daily.co room for cleanup. Optional — rooms auto-expire.
    /// </summary>
    Task DeleteRoomAsync(string roomName);
}
