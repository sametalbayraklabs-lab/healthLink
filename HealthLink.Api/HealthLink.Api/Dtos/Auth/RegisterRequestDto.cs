namespace HealthLink.Api.Dtos.Auth;

public class RegisterRequestDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? Phone { get; set; }
    
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
}
