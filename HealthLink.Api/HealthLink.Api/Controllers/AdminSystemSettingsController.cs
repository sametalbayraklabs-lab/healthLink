using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/system-settings")]
// [Authorize(Roles = "Admin")] // TEMP: Disabled for testing
public class AdminSystemSettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminSystemSettingsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SystemSettingDto>>> GetAll()
    {
        var settings = await _db.SystemSettings
            .OrderBy(x => x.Key)
            .ToListAsync();

        var dtos = settings.Select(s => new SystemSettingDto
        {
            Id = s.Id,
            Key = s.Key,
            Value = s.Value,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<SystemSettingDto>> GetByKey(string key)
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(x => x.Key == key);
        if (setting == null)
        {
            return NotFound();
        }

        var dto = new SystemSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            CreatedAt = setting.CreatedAt,
            UpdatedAt = setting.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<SystemSettingDto>> Create(CreateSystemSettingDto request)
    {
        // Check if key already exists
        var exists = await _db.SystemSettings.AnyAsync(x => x.Key == request.Key);
        if (exists)
        {
            return BadRequest(new { message = "Bu anahtar zaten mevcut." });
        }

        var setting = new SystemSetting
        {
            Key = request.Key,
            Value = request.Value,
            CreatedAt = DateTime.UtcNow
        };

        _db.SystemSettings.Add(setting);
        await _db.SaveChangesAsync();

        var dto = new SystemSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            CreatedAt = setting.CreatedAt,
            UpdatedAt = setting.UpdatedAt
        };

        return CreatedAtAction(nameof(GetByKey), new { key = setting.Key }, dto);
    }

    [HttpPut("{key}")]
    public async Task<ActionResult<SystemSettingDto>> Update(string key, UpdateSystemSettingDto request)
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(x => x.Key == key);
        if (setting == null)
        {
            return NotFound();
        }

        setting.Value = request.Value;
        setting.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new SystemSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            CreatedAt = setting.CreatedAt,
            UpdatedAt = setting.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpDelete("{key}")]
    public async Task<ActionResult> Delete(string key)
    {
        var setting = await _db.SystemSettings.FirstOrDefaultAsync(x => x.Key == key);
        if (setting == null)
        {
            return NotFound();
        }

        _db.SystemSettings.Remove(setting);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
