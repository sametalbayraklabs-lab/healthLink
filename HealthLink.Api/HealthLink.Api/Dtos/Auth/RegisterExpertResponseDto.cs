namespace HealthLink.Api.Dtos.Auth;

public class RegisterExpertResponseDto
{
    public long UserId { get; set; }
    public long ExpertId { get; set; }
    public string Status { get; set; } = null!; // "Pending"
}
