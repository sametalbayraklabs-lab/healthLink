namespace HealthLink.Api.Dtos.Auth;

public class AuthResponseDto
{
    public long UserId { get; set; }
    public string Email { get; set; } = null!;
    public string AccessToken { get; set; } = null!;
    public DateTime ExpiresAtUtc { get; set; }
}
