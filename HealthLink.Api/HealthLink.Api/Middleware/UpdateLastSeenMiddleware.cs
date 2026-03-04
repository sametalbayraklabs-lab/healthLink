using HealthLink.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HealthLink.Api.Middleware;

public class UpdateLastSeenMiddleware
{
    private readonly RequestDelegate _next;

    public UpdateLastSeenMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        // Only update for authenticated users on non-auth endpoints
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? context.User.FindFirst("sub")?.Value;

            if (long.TryParse(userIdClaim, out var userId))
            {
                var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user != null)
                {
                    // Only update if last seen was more than 1 minute ago to avoid excessive DB writes
                    var now = DateTime.UtcNow;
                    if (user.LastSeenAt == null || (now - user.LastSeenAt.Value).TotalMinutes > 1)
                    {
                        user.LastSeenAt = now;
                        await db.SaveChangesAsync();
                    }
                }
            }
        }

        await _next(context);
    }
}
