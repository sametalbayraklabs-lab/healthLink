using System.Security.Claims;

namespace HealthLink.Api.Common;

public static class ClaimsPrincipalExtensions
{
    public static long GetUserId(this ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier) 
                          ?? principal.FindFirst("sub");
        
        if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        return userId;
    }

    public static long? GetClientId(this ClaimsPrincipal principal)
    {
        var clientIdClaim = principal.FindFirst("clientId");
        if (clientIdClaim != null && long.TryParse(clientIdClaim.Value, out var clientId))
        {
            return clientId;
        }
        return null;
    }

    public static long? GetExpertId(this ClaimsPrincipal principal)
    {
        var expertIdClaim = principal.FindFirst("expertId");
        if (expertIdClaim != null && long.TryParse(expertIdClaim.Value, out var expertId))
        {
            return expertId;
        }
        return null;
    }

    public static bool IsInRole(this ClaimsPrincipal principal, string role)
    {
        return principal.HasClaim(ClaimTypes.Role, role);
    }
}
