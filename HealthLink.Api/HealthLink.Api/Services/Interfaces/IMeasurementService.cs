using HealthLink.Api.Dtos.Measurement;

namespace HealthLink.Api.Services.Interfaces;

public interface IMeasurementService
{
    Task<List<MeasurementDto>> GetMeasurementsAsync(long expertUserId, long clientId);
    Task<MeasurementDto> CreateMeasurementAsync(long expertUserId, CreateMeasurementDto dto);
    Task<MeasurementDto> UpdateMeasurementAsync(long expertUserId, long measurementId, UpdateMeasurementDto dto);
    Task DeleteMeasurementAsync(long expertUserId, long measurementId);
}
