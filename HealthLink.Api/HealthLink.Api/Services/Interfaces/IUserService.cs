using HealthLink.Api.Dtos.User;

namespace HealthLink.Api.Services.Interfaces;

public interface IUserService
{
    Task<UserProfileDto> GetCurrentUserProfileAsync(long userId);
    Task<UserProfileDto> UpdateUserProfileAsync(long userId, UpdateUserRequestDto request);
}
