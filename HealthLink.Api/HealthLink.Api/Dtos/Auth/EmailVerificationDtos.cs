namespace HealthLink.Api.Dtos.Auth;

public class VerifyEmailRequestDto
{
    public string Email { get; set; } = null!;
    public string Code { get; set; } = null!;
}

public class ResendVerificationRequestDto
{
    public string Email { get; set; } = null!;
}

public class ForgotPasswordRequestDto
{
    public string Email { get; set; } = null!;
}

public class ResetPasswordRequestDto
{
    public string Token { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}
