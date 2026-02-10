using System.Security.Claims;

namespace HealthLink.Api.Common;

/// <summary>
/// Helper class for extracting user information from authenticated claims.
/// </summary>
public static class UserHelper
{
    /// <summary>
    /// Extracts userId from authenticated user's claims.
    /// Throws UnauthorizedAccessException if user is not authenticated or userId claim is missing.
    /// </summary>
    /// <param name="user">ClaimsPrincipal from controller</param>
    /// <returns>User ID</returns>
    /// <exception cref="UnauthorizedAccessException">When user is not authenticated or userId claim is invalid</exception>
    public static long GetUserId(ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        var userIdClaim = user.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("userId claim not found in token");
        }

        if (!long.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid userId claim format");
        }

        return userId;
    }

    /// <summary>
    /// Tries to extract userId. Returns null if not authenticated or claim missing.
    /// Use this for optional authentication scenarios.
    /// </summary>
    /// <param name="user">ClaimsPrincipal from controller</param>
    /// <returns>User ID or null</returns>
    public static long? TryGetUserId(ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return null;

        var userIdClaim = user.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return null;

        return long.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Gets clientId from claims if user is a client.
    /// </summary>
    /// <param name="user">ClaimsPrincipal from controller</param>
    /// <returns>Client ID or null</returns>
    public static long? GetClientId(ClaimsPrincipal user)
    {
        var clientIdClaim = user.FindFirst("clientId")?.Value;
        return long.TryParse(clientIdClaim, out var clientId) ? clientId : null;
    }

    /// <summary>
    /// Gets expertId from claims if user is an expert.
    /// </summary>
    /// <param name="user">ClaimsPrincipal from controller</param>
    /// <returns>Expert ID or null</returns>
    public static long? GetExpertId(ClaimsPrincipal user)
    {
        var expertIdClaim = user.FindFirst("expertId")?.Value;
        return long.TryParse(expertIdClaim, out var expertId) ? expertId : null;
    }

    /// <summary>
    /// Checks if user has a specific role.
    /// </summary>
    /// <param name="user">ClaimsPrincipal from controller</param>
    /// <param name="role">Role name to check</param>
    /// <returns>True if user has the role</returns>
    public static bool HasRole(ClaimsPrincipal user, string role)
    {
        return user?.IsInRole(role) ?? false;
    }
}
