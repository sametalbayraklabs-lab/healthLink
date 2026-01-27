using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Client;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class ClientService : IClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ClientProfileResponse> GetProfileAsync(long userId)
    {
        var client = await _db.Clients
            .Include(x => x.User)
            .FirstAsync(x => x.UserId == userId);

        return new ClientProfileResponse
        {
            Email = client.User.Email,
            Phone = client.User.Phone,
            Gender = client.Gender.ToApiString(),
            BirthDate = client.BirthDate
        };
    }

    public async Task UpdateProfileAsync(long userId, UpdateClientProfileRequest request)
    {
        var client = await _db.Clients
            .Include(x => x.User)
            .FirstAsync(x => x.UserId == userId);

        client.User.Phone = request.Phone;
        client.Gender = string.IsNullOrWhiteSpace(request.Gender) 
            ? null 
            : Enum.Parse<Gender>(request.Gender, true);
        client.BirthDate = request.BirthDate;

        _db.AuditLogs.Add(new AuditLog
        {
            UserId = client.UserId,
            ActionType = "UpdateClientProfile",
            TargetType = "Client",
            TargetId = client.Id,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
    }

    public async Task<ClientDashboardResponse> GetDashboardAsync(long userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        
        if (client == null)
        {
            throw new BusinessException(
                ErrorCodes.CLIENT_NOT_FOUND,
                "Client not found",
                404
            );
        }

        var upcomingAppointmentsCount = await _db.Appointments.CountAsync(x =>
            x.ClientId == client.Id &&
            x.Status == AppointmentStatus.Scheduled &&
            x.StartDateTime > DateTime.UtcNow);

        var completedAppointmentsCount = await _db.Appointments.CountAsync(x =>
            x.ClientId == client.Id &&
            x.Status == AppointmentStatus.Completed);

        var activePackagesCount = await _db.ClientPackages.CountAsync(x =>
            x.ClientId == client.Id &&
            x.Status == ClientPackageStatus.Active);

        // Simplified unread messages query
        var unreadMessagesCount = await (
            from msg in _db.Messages
            join conv in _db.Conversations on msg.ConversationId equals conv.Id
            where msg.IsRead == false && conv.ClientId == client.Id
            select msg
        ).CountAsync();

        return new ClientDashboardResponse
        {
            UpcomingAppointmentsCount = upcomingAppointmentsCount,
            CompletedAppointmentsCount = completedAppointmentsCount,
            ActivePackagesCount = activePackagesCount,
            UnreadMessagesCount = unreadMessagesCount
        };
    }

    public async Task<IReadOnlyList<ClientListItemResponse>> GetAllAsync()
    {
        return await _db.Clients
            .Where(x => x.IsActive)
            .Select(x => new ClientListItemResponse
            {
                ClientId = x.Id,
                Email = x.User.Email,
                IsActive = x.IsActive
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<ClientListItemResponse>> GetByExpertAsync(long expertUserId)
    {
        var expertId = await _db.Experts
            .Where(x => x.UserId == expertUserId)
            .Select(x => x.Id)
            .FirstOrDefaultAsync();

        if (expertId == 0)
            throw new InvalidOperationException("Expert not found");

        return await _db.Appointments
            .Where(a => a.ExpertId == expertId)
            .Select(a => a.Client)
            .Distinct()
            .Select(c => new ClientListItemResponse
            {
                ClientId = c.Id,
                Email = c.User.Email,
                IsActive = c.IsActive
            })
            .ToListAsync();
    }

    // API-1 Methods
    public async Task<ClientProfileDto> GetClientProfileAsync(long userId)
    {
        var client = await _db.Clients
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (client == null)
        {
            throw new Common.BusinessException(
                ErrorCodes.CLIENT_NOT_FOUND,
                "Danışan bulunamadı.",
                404
            );
        }

        return new ClientProfileDto
        {
            Id = client.Id,
            UserId = client.UserId,
            FirstName = client.FirstName,
            LastName = client.LastName,
            Email = client.User.Email,
            Phone = client.User.Phone,
            BirthDate = client.BirthDate,
            Gender = client.Gender.ToApiString(),
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt
        };
    }

    public async Task<ClientProfileDto> UpdateClientProfileAsync(long userId, UpdateClientRequestDto request)
    {
        var client = await _db.Clients
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (client == null)
        {
            throw new Common.BusinessException(
                ErrorCodes.CLIENT_NOT_FOUND,
                "Danışan bulunamadı.",
                404
            );
        }

        client.FirstName = request.FirstName;
        client.LastName = request.LastName;
        client.BirthDate = request.BirthDate;
        client.Gender = Common.EnumExtensions.ParseGender(request.Gender);
        client.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return await GetClientProfileAsync(userId);
    }

    public async Task<ClientProfileDto> GetClientByIdAsync(long clientId)
    {
        var client = await _db.Clients.FindAsync(clientId);

        if (client == null)
        {
            throw new Common.BusinessException(
                ErrorCodes.CLIENT_NOT_FOUND,
                "Danışan bulunamadı.",
                404
            );
        }

        return new ClientProfileDto
        {
            Id = client.Id,
            UserId = client.UserId,
            FirstName = client.FirstName,
            LastName = client.LastName,
            BirthDate = client.BirthDate,
            Gender = client.Gender.ToApiString(),
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt
        };
    }

}


