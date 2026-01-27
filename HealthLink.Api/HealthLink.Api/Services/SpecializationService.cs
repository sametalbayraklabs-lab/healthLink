using HealthLink.Api.Common;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Specialization;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class SpecializationService : ISpecializationService
{
    private readonly AppDbContext _db;

    public SpecializationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<SpecializationDto>> GetSpecializationsAsync(string? expertType)
    {
        var query = _db.Specializations.Where(s => s.IsActive);

        if (!string.IsNullOrWhiteSpace(expertType))
        {
            var parsedType = EnumExtensions.ParseExpertType(expertType);
            query = query.Where(s => s.ExpertType == parsedType);
        }

        return await query
            .Select(s => new SpecializationDto
            {
                Id = s.Id,
                Name = s.Name,
                ExpertType = s.ExpertType.ToApiString(),
                Category = s.Category.ToApiString()
            })
            .ToListAsync();
    }
}
