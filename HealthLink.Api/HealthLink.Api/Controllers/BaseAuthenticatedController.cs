using HealthLink.Api.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

/// <summary>
/// Base controller for authenticated endpoints.
/// Provides UserId, ClientId, and ExpertId properties from JWT claims.
/// </summary>
[ApiController]
[Authorize] // All inheriting controllers require authentication by default
public abstract class BaseAuthenticatedController : ControllerBase
{
    /// <summary>
    /// Gets the authenticated user's ID from JWT claims.
    /// Throws UnauthorizedAccessException if not authenticated.
    /// </summary>
    protected long UserId => UserHelper.GetUserId(User);

    /// <summary>
    /// Gets the client ID if user is a client, otherwise null.
    /// </summary>
    protected long? ClientId => UserHelper.GetClientId(User);

    /// <summary>
    /// Gets the expert ID if user is an expert, otherwise null.
    /// </summary>
    protected long? ExpertId => UserHelper.GetExpertId(User);
}
