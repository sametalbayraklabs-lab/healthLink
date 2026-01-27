using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using HealthLink.Api.Data;
using HealthLink.Api.Common;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Filters;

/// <summary>
/// Custom authorization filter that checks if user is admin from database
/// </summary>
public class RequireAdminAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        
        // Get userId from JWT claims
        var userIdClaim = context.HttpContext.User.FindFirst("sub");
        if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Check if user is admin in database
        var isAdmin = await db.Admins.AnyAsync(a => a.UserId == userId && a.IsActive);
        
        if (!isAdmin)
        {
            context.Result = new ForbidResult();
            return;
        }
    }
}

/// <summary>
/// Custom authorization filter that checks if user is expert from database
/// </summary>
public class RequireExpertAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        
        var userIdClaim = context.HttpContext.User.FindFirst("sub");
        if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var isExpert = await db.Experts.AnyAsync(e => e.UserId == userId && e.IsActive);
        
        if (!isExpert)
        {
            context.Result = new ForbidResult();
            return;
        }
    }
}

/// <summary>
/// Custom authorization filter that checks if user is client from database
/// </summary>
public class RequireClientAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        
        var userIdClaim = context.HttpContext.User.FindFirst("sub");
        if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var isClient = await db.Clients.AnyAsync(c => c.UserId == userId && c.IsActive);
        
        if (!isClient)
        {
            context.Result = new ForbidResult();
            return;
        }
    }
}
