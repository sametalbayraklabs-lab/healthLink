using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/specializations")]
[Authorize(Roles = "Admin")]
public class AdminSpecializationsController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminSpecializationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SpecializationDto>>> GetAll([FromQuery] string? category, [FromQuery] bool? isActive)
    {
        var query = _db.Specializations.AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(x => x.Category.ToString() == category);
        }

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        var specializations = await query
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Name)
            .ToListAsync();

        var dtos = specializations.Select(s => new SpecializationDto
        {
            Id = s.Id,
            Name = s.Name,
            Description = s.Description,
            ExpertType = s.ExpertType,
            Category = s.Category,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SpecializationDto>> GetById(long id)
    {
        var specialization = await _db.Specializations.FindAsync(id);
        if (specialization == null)
        {
            return NotFound();
        }

        var dto = new SpecializationDto
        {
            Id = specialization.Id,
            Name = specialization.Name,
            Description = specialization.Description,
            ExpertType = specialization.ExpertType,
            Category = specialization.Category,
            IsActive = specialization.IsActive,
            CreatedAt = specialization.CreatedAt,
            UpdatedAt = specialization.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<SpecializationDto>> Create(CreateSpecializationDto request)
    {
        Console.WriteLine($"[CREATE] Received request: Name={request?.Name}, Category={request?.Category}, IsActive={request?.IsActive}");
        
        if (request == null)
        {
            Console.WriteLine("[CREATE] Request is NULL!");
            return BadRequest("Request body is required");
        }
        
        var specialization = new Specialization
        {
            Name = request.Name,
            Description = request.Description,
            ExpertType = request.ExpertType,
            Category = request.Category,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.Specializations.Add(specialization);
        await _db.SaveChangesAsync();

        var dto = new SpecializationDto
        {
            Id = specialization.Id,
            Name = specialization.Name,
            Description = specialization.Description,
            ExpertType = specialization.ExpertType,
            Category = specialization.Category,
            IsActive = specialization.IsActive,
            CreatedAt = specialization.CreatedAt,
            UpdatedAt = specialization.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = specialization.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SpecializationDto>> Update(long id, UpdateSpecializationDto request)
    {
        var specialization = await _db.Specializations.FindAsync(id);
        if (specialization == null)
        {
            return NotFound();
        }

        if (request.Name != null) specialization.Name = request.Name;
        if (request.Description != null) specialization.Description = request.Description;
        if (request.ExpertType.HasValue) specialization.ExpertType = request.ExpertType.Value;
        if (request.Category.HasValue) specialization.Category = request.Category.Value;
        if (request.IsActive.HasValue) specialization.IsActive = request.IsActive.Value;

        specialization.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new SpecializationDto
        {
            Id = specialization.Id,
            Name = specialization.Name,
            Description = specialization.Description,
            ExpertType = specialization.ExpertType,
            Category = specialization.Category,
            IsActive = specialization.IsActive,
            CreatedAt = specialization.CreatedAt,
            UpdatedAt = specialization.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var specialization = await _db.Specializations.FindAsync(id);
        if (specialization == null)
        {
            return NotFound();
        }

        // Check if specialization is in use
        var inUse = await _db.ExpertSpecializations.AnyAsync(x => x.SpecializationId == id);
        if (inUse)
        {
            return BadRequest(new { message = "Bu uzmanlık alanı kullanımda. Pasif hale getirebilirsiniz." });
        }

        _db.Specializations.Remove(specialization);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
