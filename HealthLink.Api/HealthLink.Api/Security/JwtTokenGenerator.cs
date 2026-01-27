using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;


namespace HealthLink.Api.Security;

public class JwtTokenGenerator
{
    private readonly IConfiguration _config;

    public JwtTokenGenerator(IConfiguration config)
    {
        _config = config;
    }

    public (string token, DateTime expiresAt) GenerateToken(
        long userId, 
        string email, 
        List<string> roles, 
        long? clientId = null, 
        long? expertId = null)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddMinutes(60);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email)
        };

        // Add role claims (use short claim type for better compatibility)
        foreach (var role in roles)
        {
            claims.Add(new Claim("role", role));
        }

        // Add clientId if present
        if (clientId.HasValue)
        {
            claims.Add(new Claim("clientId", clientId.Value.ToString()));
        }

        // Add expertId if present
        if (expertId.HasValue)
        {
            claims.Add(new Claim("expertId", expertId.Value.ToString()));
        }

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return (
            new JwtSecurityTokenHandler().WriteToken(token),
            expires
        );
    }
}
