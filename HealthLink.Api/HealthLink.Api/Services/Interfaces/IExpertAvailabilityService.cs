using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Entities;
using HealthLink.Api.Services;

namespace HealthLink.Api.Services.Interfaces
{
    public interface IExpertAvailabilityService
    {
        Task<IReadOnlyList<TimeSlotTemplate>> GetAllTemplatesAsync();
        Task<IReadOnlyList<ExpertAvailabilitySlotResponse>> GetDailyAvailabilityAsync(
            long expertId,
            DateOnly date);
        Task SaveDailyAvailabilityAsync(
            long expertId,
            DateOnly date,
            List<SaveSlotRequest> slots);
    }
}
