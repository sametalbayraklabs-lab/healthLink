using HealthLink.Api.Dtos.Expert;

namespace HealthLink.Api.Services.Interfaces
{
    public interface IExpertAvailabilityService
    {
        Task<IReadOnlyList<ExpertAvailabilitySlotResponse>> GetDailyAvailabilityAsync(
            long expertId,
            DateOnly date);
    }
}
