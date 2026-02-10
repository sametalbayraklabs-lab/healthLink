using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Expert;

namespace HealthLink.Api.Services.Interfaces;

public interface IExpertService
{
    // API-1 methods
    Task<ExpertProfileDto> GetExpertProfileAsync(long userId);
    Task<ExpertProfileDto> UpdateExpertProfileAsync(long userId, UpdateExpertRequestDto request);
    Task<ExpertPublicProfileDto> GetExpertByIdAsync(long expertId);
    Task<PagedResult<ExpertListItemDto>> GetExpertsAsync(
        string? expertType,
        string? city,
        long? specializationId,
        string? sort,
        int page = 1,
        int pageSize = 20);
    Task SetSpecializationsAsync(long userId, List<long> specializationIds);
    Task<ExpertProfileDto> ApproveExpertAsync(long expertId, string? adminNote);
    Task<ExpertProfileDto> RejectExpertAsync(long expertId, string? adminNote);
    Task<PagedResult<ExpertListItemDto>> GetAllExpertsForAdminAsync(
        string? search,
        string? expertType,
        string? city,
        bool? isActive,
        int page = 1,
        int pageSize = 50);
    
    // Existing methods
    Task<IReadOnlyList<ExpertListItemResponse>> GetActiveExpertsAsync();
    Task<ExpertDetailResponse> GetByIdAsync(long expertId);
    
    // Appointment booking methods
    Task<AvailabilityDto> GetAvailabilityAsync(long expertId, DateOnly date);
}
