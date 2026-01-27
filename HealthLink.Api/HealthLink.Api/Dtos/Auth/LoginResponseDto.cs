namespace HealthLink.Api.Dtos.Auth;

public class LoginResponseDto
{
    public string AccessToken { get; set; } = null!;
    public int ExpiresIn { get; set; } // seconds
    public UserInfoDto User { get; set; } = null!;
}

public class UserInfoDto
{
    public long Id { get; set; }
    public string Email { get; set; } = null!;
    public List<string> Roles { get; set; } = new();
    public long? ClientId { get; set; }
    public long? ExpertId { get; set; }
}
