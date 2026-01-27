using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.User;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserProfileDto> GetCurrentUserProfileAsync(long userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            throw new BusinessException(
                ErrorCodes.USER_NOT_FOUND,
                "Kullanıcı bulunamadı.",
                404
            );
        }

        // Determine roles and IDs
        var roles = new List<string>();
        long? clientId = null;
        long? expertId = null;

        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
        if (client != null)
        {
            roles.Add("Client");
            clientId = client.Id;
        }

        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == userId);
        if (expert != null)
        {
            roles.Add("Expert");
            expertId = expert.Id;
        }

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            Phone = user.Phone,
            Roles = roles,
            ClientId = clientId,
            ExpertId = expertId,
            IsActive = user.IsActive
        };
    }

    public async Task<UserProfileDto> UpdateUserProfileAsync(long userId, UpdateUserRequestDto request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            throw new BusinessException(
                ErrorCodes.USER_NOT_FOUND,
                "Kullanıcı bulunamadı.",
                404
            );
        }

        user.Phone = request.Phone;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return await GetCurrentUserProfileAsync(userId);
    }
}
