using HealthLink.Api.Dtos.Auth;

namespace HealthLink.Api.Services.Interfaces;

public interface IAuthService
{
    Task<RegisterClientResponseDto> RegisterClientAsync(RegisterClientRequestDto request);
    Task<RegisterExpertResponseDto> RegisterExpertAsync(RegisterExpertRequestDto request);
    Task<RegisterAdminResponseDto> RegisterAdminAsync(RegisterAdminRequestDto request);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task ChangePasswordAsync(long userId, ChangePasswordRequestDto request);
    Task VerifyEmailAsync(VerifyEmailRequestDto request);
    Task ResendVerificationCodeAsync(ResendVerificationRequestDto request);
    Task ForgotPasswordAsync(ForgotPasswordRequestDto request);
    Task ResetPasswordAsync(ResetPasswordRequestDto request);
}
