using HealthLink.Api.Common;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/content-items")]
[Authorize(Roles = "Admin")]
public class AdminContentItemsController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminContentItemsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ContentItemDto>>> GetAll([FromQuery] string? type, [FromQuery] string? status)
    {
        var query = _db.ContentItems.Include(x => x.AuthorUser).AsQueryable();

        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(x => x.Type.ToString() == type);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(x => x.Status.ToString() == status);
        }

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var dtos = items.Select(i => new ContentItemDto
        {
            Id = i.Id,
            Title = i.Title,
            SubTitle = i.SubTitle,
            Slug = i.Slug,
            Type = i.Type,
            Category = i.Category,
            CoverImageUrl = i.CoverImageUrl,
            BodyHtml = i.BodyHtml,
            SeoTitle = i.SeoTitle,
            SeoDescription = i.SeoDescription,
            Status = i.Status,
            AuthorUserId = i.AuthorUserId,
            AuthorName = i.AuthorUser.Email,
            PublishedAt = i.PublishedAt,
            CreatedAt = i.CreatedAt,
            UpdatedAt = i.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ContentItemDto>> GetById(long id)
    {
        var item = await _db.ContentItems
            .Include(x => x.AuthorUser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        var dto = new ContentItemDto
        {
            Id = item.Id,
            Title = item.Title,
            SubTitle = item.SubTitle,
            Slug = item.Slug,
            Type = item.Type,
            Category = item.Category,
            CoverImageUrl = item.CoverImageUrl,
            BodyHtml = item.BodyHtml,
            SeoTitle = item.SeoTitle,
            SeoDescription = item.SeoDescription,
            Status = item.Status,
            AuthorUserId = item.AuthorUserId,
            AuthorName = item.AuthorUser.Email,
            PublishedAt = item.PublishedAt,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ContentItemDto>> Create(CreateContentItemDto request)
    {
        var userId = User.GetUserId();

        // Check if slug already exists
        var exists = await _db.ContentItems.AnyAsync(x => x.Slug == request.Slug);
        if (exists)
        {
            return BadRequest(new { message = "Bu slug zaten kullanımda." });
        }

        var item = new ContentItem
        {
            Title = request.Title,
            SubTitle = request.SubTitle,
            Slug = request.Slug,
            Type = request.Type,
            Category = request.Category,
            CoverImageUrl = request.CoverImageUrl,
            BodyHtml = request.BodyHtml,
            SeoTitle = request.SeoTitle,
            SeoDescription = request.SeoDescription,
            Status = request.Status,
            AuthorUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _db.ContentItems.Add(item);
        await _db.SaveChangesAsync();

        // Reload with author
        await _db.Entry(item).Reference(x => x.AuthorUser).LoadAsync();

        var dto = new ContentItemDto
        {
            Id = item.Id,
            Title = item.Title,
            SubTitle = item.SubTitle,
            Slug = item.Slug,
            Type = item.Type,
            Category = item.Category,
            CoverImageUrl = item.CoverImageUrl,
            BodyHtml = item.BodyHtml,
            SeoTitle = item.SeoTitle,
            SeoDescription = item.SeoDescription,
            Status = item.Status,
            AuthorUserId = item.AuthorUserId,
            AuthorName = item.AuthorUser.Email,
            PublishedAt = item.PublishedAt,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ContentItemDto>> Update(long id, UpdateContentItemDto request)
    {
        var item = await _db.ContentItems
            .Include(x => x.AuthorUser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        if (request.Title != null) item.Title = request.Title;
        if (request.SubTitle != null) item.SubTitle = request.SubTitle;
        if (request.Slug != null)
        {
            // Check if new slug already exists
            var exists = await _db.ContentItems.AnyAsync(x => x.Slug == request.Slug && x.Id != id);
            if (exists)
            {
                return BadRequest(new { message = "Bu slug zaten kullanımda." });
            }
            item.Slug = request.Slug;
        }
        if (request.Type.HasValue) item.Type = request.Type.Value;
        if (request.Category != null) item.Category = request.Category;
        if (request.CoverImageUrl != null) item.CoverImageUrl = request.CoverImageUrl;
        if (request.BodyHtml != null) item.BodyHtml = request.BodyHtml;
        if (request.SeoTitle != null) item.SeoTitle = request.SeoTitle;
        if (request.SeoDescription != null) item.SeoDescription = request.SeoDescription;
        if (request.Status.HasValue) item.Status = request.Status.Value;

        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new ContentItemDto
        {
            Id = item.Id,
            Title = item.Title,
            SubTitle = item.SubTitle,
            Slug = item.Slug,
            Type = item.Type,
            Category = item.Category,
            CoverImageUrl = item.CoverImageUrl,
            BodyHtml = item.BodyHtml,
            SeoTitle = item.SeoTitle,
            SeoDescription = item.SeoDescription,
            Status = item.Status,
            AuthorUserId = item.AuthorUserId,
            AuthorName = item.AuthorUser.Email,
            PublishedAt = item.PublishedAt,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var item = await _db.ContentItems.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _db.ContentItems.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
