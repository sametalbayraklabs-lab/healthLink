namespace HealthLink.Api.Dtos.Auth;

public class RegisterAdminRequestDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Phone { get; set; } = null!;
}

public class RegisterAdminResponseDto
{
    public long UserId { get; set; }
    public long AdminId { get; set; }
    public string Email { get; set; } = null!;
}
