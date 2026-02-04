using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/discount-codes")]
// [Authorize(Roles = "Admin")] // TEMP: Removed for testing
public class AdminDiscountCodesController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminDiscountCodesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<DiscountCodeDto>>> GetAll([FromQuery] bool? isActive)
    {
        var query = _db.DiscountCodes.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        var codes = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var dtos = codes.Select(c => new DiscountCodeDto
        {
            Id = c.Id,
            Code = c.Code,
            Description = c.Description,
            DiscountType = c.DiscountType,
            DiscountValue = c.DiscountValue,
            MaxUsageCount = c.MaxUsageCount,
            UsedCount = c.UsedCount,
            ValidFrom = c.ValidFrom,
            ValidTo = c.ValidTo,
            ApplicableExpertType = c.ApplicableExpertType,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DiscountCodeDto>> GetById(long id)
    {
        var code = await _db.DiscountCodes.FindAsync(id);
        if (code == null)
        {
            return NotFound();
        }

        var dto = new DiscountCodeDto
        {
            Id = code.Id,
            Code = code.Code,
            Description = code.Description,
            DiscountType = code.DiscountType,
            DiscountValue = code.DiscountValue,
            MaxUsageCount = code.MaxUsageCount,
            UsedCount = code.UsedCount,
            ValidFrom = code.ValidFrom,
            ValidTo = code.ValidTo,
            ApplicableExpertType = code.ApplicableExpertType,
            IsActive = code.IsActive,
            CreatedAt = code.CreatedAt,
            UpdatedAt = code.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<DiscountCodeDto>> Create(CreateDiscountCodeDto request)
    {
        try
        {
            Console.WriteLine($"[DISCOUNT] Creating code: {request.Code}, Type: {request.DiscountType}, ExpertType: {request.ApplicableExpertType}");
            
            // Check ModelState
            if (!ModelState.IsValid)
            {
                Console.WriteLine("[DISCOUNT] ModelState is invalid!");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"[DISCOUNT] Field: {error.Key}, Errors: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }
            
            // Check if code already exists
            var exists = await _db.DiscountCodes.AnyAsync(x => x.Code == request.Code);
            if (exists)
            {
                return BadRequest(new { message = "Bu kod zaten mevcut." });
            }

            var code = new DiscountCode
            {
                Code = request.Code,
                Description = request.Description,
                DiscountType = request.DiscountType,
                DiscountValue = request.DiscountValue,
                MaxUsageCount = request.MaxUsageCount,
                ValidFrom = DateTime.SpecifyKind(request.ValidFrom, DateTimeKind.Utc),
                ValidTo = request.ValidTo.HasValue ? DateTime.SpecifyKind(request.ValidTo.Value, DateTimeKind.Utc) : null,
                ApplicableExpertType = request.ApplicableExpertType,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            Console.WriteLine($"[DISCOUNT] Saving to database...");
            _db.DiscountCodes.Add(code);
            await _db.SaveChangesAsync();

            var dto = new DiscountCodeDto
            {
                Id = code.Id,
                Code = code.Code,
                Description = code.Description,
                DiscountType = code.DiscountType,
                DiscountValue = code.DiscountValue,
                MaxUsageCount = code.MaxUsageCount,
                UsedCount = code.UsedCount,
                ValidFrom = code.ValidFrom,
                ValidTo = code.ValidTo,
                ApplicableExpertType = code.ApplicableExpertType,
                IsActive = code.IsActive,
                CreatedAt = code.CreatedAt,
                UpdatedAt = code.UpdatedAt
            };

            Console.WriteLine($"[DISCOUNT] Success! Created code ID: {code.Id}");
            return CreatedAtAction(nameof(GetById), new { id = code.Id }, dto);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DISCOUNT] ERROR: {ex.Message}");
            Console.WriteLine($"[DISCOUNT] Stack: {ex.StackTrace}");
            throw;
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DiscountCodeDto>> Update(long id, UpdateDiscountCodeDto request)
    {
        var code = await _db.DiscountCodes.FindAsync(id);
        if (code == null)
        {
            return NotFound();
        }

        if (request.Description != null) code.Description = request.Description;
        if (request.DiscountValue.HasValue) code.DiscountValue = request.DiscountValue.Value;
        if (request.MaxUsageCount.HasValue) code.MaxUsageCount = request.MaxUsageCount;
        if (request.ValidFrom.HasValue) code.ValidFrom = DateTime.SpecifyKind(request.ValidFrom.Value, DateTimeKind.Utc);
        if (request.ValidTo.HasValue) code.ValidTo = request.ValidTo.HasValue ? DateTime.SpecifyKind(request.ValidTo.Value, DateTimeKind.Utc) : null;
        if (request.IsActive.HasValue) code.IsActive = request.IsActive.Value;

        code.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new DiscountCodeDto
        {
            Id = code.Id,
            Code = code.Code,
            Description = code.Description,
            DiscountType = code.DiscountType,
            DiscountValue = code.DiscountValue,
            MaxUsageCount = code.MaxUsageCount,
            UsedCount = code.UsedCount,
            ValidFrom = code.ValidFrom,
            ValidTo = code.ValidTo,
            ApplicableExpertType = code.ApplicableExpertType,
            IsActive = code.IsActive,
            CreatedAt = code.CreatedAt,
            UpdatedAt = code.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var code = await _db.DiscountCodes.FindAsync(id);
        if (code == null)
        {
            return NotFound();
        }

        // Check if code has been used
        if (code.UsedCount > 0)
        {
            return BadRequest(new { message = "Kullanılmış indirim kodları silinemez. Pasif hale getirebilirsiniz." });
        }

        _db.DiscountCodes.Remove(code);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
