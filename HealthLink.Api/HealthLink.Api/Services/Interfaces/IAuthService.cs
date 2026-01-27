using HealthLink.Api.Dtos.Auth;

namespace HealthLink.Api.Services.Interfaces;

public interface IAuthService
{
    Task<RegisterClientResponseDto> RegisterClientAsync(RegisterClientRequestDto request);
    Task<RegisterExpertResponseDto> RegisterExpertAsync(RegisterExpertRequestDto request);
    Task<RegisterAdminResponseDto> RegisterAdminAsync(RegisterAdminRequestDto request);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task ChangePasswordAsync(long userId, ChangePasswordRequestDto request);
}
