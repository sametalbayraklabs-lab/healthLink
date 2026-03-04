using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Measurement;
using HealthLink.Api.Entities;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class MeasurementService : IMeasurementService
{
    private readonly AppDbContext _db;

    public MeasurementService(AppDbContext db) => _db = db;

    public async Task<List<MeasurementDto>> GetMeasurementsAsync(long expertUserId, long clientId)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var measurements = await _db.ClientMeasurements
            .Where(m => m.ExpertId == expert.Id && m.ClientId == clientId)
            .OrderByDescending(m => m.Date)
            .ToListAsync();

        return measurements.Select(MapToDto).ToList();
    }

    public async Task<MeasurementDto> CreateMeasurementAsync(long expertUserId, CreateMeasurementDto dto)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var hasRelation = await _db.Appointments
            .AnyAsync(a => a.ExpertId == expert.Id && a.ClientId == dto.ClientId);

        if (!hasRelation)
            throw new InvalidOperationException("You don't have any appointments with this client");

        var bmi = CalculateBmi(dto.WeightKg, dto.HeightCm);

        var measurement = new ClientMeasurement
        {
            ClientId = dto.ClientId,
            ExpertId = expert.Id,
            Date = dto.Date.Kind == DateTimeKind.Utc ? dto.Date : DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
            HeightCm = dto.HeightCm,
            WeightKg = dto.WeightKg,
            BodyFatPercentage = dto.BodyFatPercentage,
            Bmi = bmi,
            CreatedAt = DateTime.UtcNow
        };

        _db.ClientMeasurements.Add(measurement);
        await _db.SaveChangesAsync();
        return MapToDto(measurement);
    }

    public async Task<MeasurementDto> UpdateMeasurementAsync(long expertUserId, long measurementId, UpdateMeasurementDto dto)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var measurement = await _db.ClientMeasurements
            .FirstOrDefaultAsync(m => m.Id == measurementId && m.ExpertId == expert.Id)
            ?? throw new KeyNotFoundException("Measurement not found");

        if (dto.Date.HasValue)
            measurement.Date = dto.Date.Value.Kind == DateTimeKind.Utc ? dto.Date.Value : DateTime.SpecifyKind(dto.Date.Value, DateTimeKind.Utc);
        if (dto.HeightCm.HasValue)
            measurement.HeightCm = dto.HeightCm.Value;
        if (dto.WeightKg.HasValue)
            measurement.WeightKg = dto.WeightKg.Value;
        
        // BodyFatPercentage can be explicitly set to null
        measurement.BodyFatPercentage = dto.BodyFatPercentage;

        // Recalculate BMI
        measurement.Bmi = CalculateBmi(measurement.WeightKg, measurement.HeightCm);
        measurement.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToDto(measurement);
    }

    public async Task DeleteMeasurementAsync(long expertUserId, long measurementId)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId)
            ?? throw new UnauthorizedAccessException("Expert not found");

        var measurement = await _db.ClientMeasurements
            .FirstOrDefaultAsync(m => m.Id == measurementId && m.ExpertId == expert.Id)
            ?? throw new KeyNotFoundException("Measurement not found");

        _db.ClientMeasurements.Remove(measurement);
        await _db.SaveChangesAsync();
    }

    // ─── Helpers ───

    private static decimal CalculateBmi(decimal weightKg, int heightCm)
    {
        if (heightCm <= 0) return 0;
        var heightM = (decimal)heightCm / 100m;
        return Math.Round(weightKg / (heightM * heightM), 1);
    }

    private static string GetBmiCategory(decimal bmi)
    {
        return bmi switch
        {
            < 18.5m => "Zayıf",
            < 25m   => "Normal",
            < 30m   => "Fazla Kilolu",
            < 35m   => "Obez (Sınıf I)",
            < 40m   => "Obez (Sınıf II)",
            _       => "Obez (Sınıf III)"
        };
    }

    private static MeasurementDto MapToDto(ClientMeasurement m)
    {
        return new MeasurementDto
        {
            Id = m.Id,
            ClientId = m.ClientId,
            ExpertId = m.ExpertId,
            Date = m.Date,
            HeightCm = m.HeightCm,
            WeightKg = m.WeightKg,
            BodyFatPercentage = m.BodyFatPercentage,
            Bmi = m.Bmi,
            BmiCategory = GetBmiCategory(m.Bmi),
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt
        };
    }
}
