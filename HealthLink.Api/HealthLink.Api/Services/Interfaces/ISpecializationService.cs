using HealthLink.Api.Dtos.Specialization;

namespace HealthLink.Api.Services.Interfaces;

public interface ISpecializationService
{
    Task<List<SpecializationDto>> GetSpecializationsAsync(string? expertType);
}
