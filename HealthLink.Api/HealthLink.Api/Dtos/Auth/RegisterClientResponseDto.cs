namespace HealthLink.Api.Dtos.Auth;

public class RegisterClientResponseDto
{
    public long UserId { get; set; }
    public long ClientId { get; set; }
    public string Email { get; set; } = null!;
}
