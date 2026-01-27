using HealthLink.Api.Dtos.Client;

namespace HealthLink.Api.Services.Interfaces;

public interface IClientService
{
    // API-1 methods
    Task<ClientProfileDto> GetClientProfileAsync(long userId);
    Task<ClientProfileDto> UpdateClientProfileAsync(long userId, UpdateClientRequestDto request);
    Task<ClientProfileDto> GetClientByIdAsync(long clientId); // Admin only
    
    // Existing methods (keep for compatibility)
    Task<ClientProfileResponse> GetProfileAsync(long userId);
    Task UpdateProfileAsync(long userId, UpdateClientProfileRequest request);
    Task<ClientDashboardResponse> GetDashboardAsync(long userId);
    Task<IReadOnlyList<ClientListItemResponse>> GetAllAsync();
    Task<IReadOnlyList<ClientListItemResponse>> GetByExpertAsync(long expertUserId);
}
