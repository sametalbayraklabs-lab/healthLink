using Microsoft.AspNetCore.SignalR;

namespace HealthLink.Api.Hubs;

/// <summary>
/// Custom UserIdProvider for SignalR.
/// Maps the JWT "userId" claim to SignalR's UserIdentifier.
/// This is needed because the project uses a custom "userId" claim
/// instead of the standard ClaimTypes.NameIdentifier.
/// </summary>
public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst("userId")?.Value;
    }
}
