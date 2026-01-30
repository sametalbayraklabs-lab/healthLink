using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace HealthLink.Api.Middleware;

public class SimpleJwtMiddleware
{
    private readonly RequestDelegate _next;

    public SimpleJwtMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
        
        if (!string.IsNullOrEmpty(token))
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                
                var claims = jwtToken.Claims.ToList();
                var identity = new ClaimsIdentity(claims, "jwt");
                context.User = new ClaimsPrincipal(identity);
                
                Console.WriteLine($"[SimpleJWT] Token parsed successfully. Claims: {claims.Count}");
                foreach (var claim in claims)
                {
                    Console.WriteLine($"  {claim.Type} = {claim.Value}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SimpleJWT] Failed to parse token: {ex.Message}");
            }
        }

        await _next(context);
    }
}
