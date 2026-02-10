using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/content")]
[Authorize(Roles = "Admin")]
public class AdminContentController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminContentController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminContentListDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.ContentItems
            .Include(c => c.AuthorUser)
            .AsQueryable();

        // Status filter
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ContentItemStatus>(status, out var contentStatus))
        {
            query = query.Where(c => c.Status == contentStatus);
        }

        // Type filter
        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<ContentItemType>(type, out var contentType))
        {
            query = query.Where(c => c.Type == contentType);
        }

        // Search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(search) || 
                                     (c.SubTitle != null && c.SubTitle.ToLower().Contains(search)));
        }

        var contents = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminContentListDto
            {
                Id = c.Id,
                Title = c.Title,
                SubTitle = c.SubTitle,
                Slug = c.Slug,
                Type = c.Type,
                Category = c.Category,
                Status = c.Status,
                AuthorName = c.AuthorUser.Email,
                PublishedAt = c.PublishedAt,
                CreatedAt = c.CreatedAt,
                ViewCount = c.ViewCount,
                LikeCount = c.LikeCount,
                DislikeCount = c.DislikeCount
            })
            .ToListAsync();

        return Ok(contents);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminContentDetailDto>> GetById(long id)
    {
        var content = await _db.ContentItems
            .Include(c => c.AuthorUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (content == null)
        {
            return NotFound();
        }

        var dto = new AdminContentDetailDto
        {
            Id = content.Id,
            Title = content.Title,
            SubTitle = content.SubTitle,
            Slug = content.Slug,
            Type = content.Type,
            Category = content.Category,
            CoverImageUrl = content.CoverImageUrl,
            BodyHtml = content.BodyHtml,
            SeoTitle = content.SeoTitle,
            SeoDescription = content.SeoDescription,
            Status = content.Status,
            AuthorUserId = content.AuthorUserId,
            AuthorName = content.AuthorUser.Email,
            PublishedAt = content.PublishedAt,
            CreatedAt = content.CreatedAt,
            UpdatedAt = content.UpdatedAt,
            ViewCount = content.ViewCount,
            LikeCount = content.LikeCount,
            DislikeCount = content.DislikeCount
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<AdminContentDetailDto>> Create(CreateContentDto request)
    {
        // Check slug uniqueness
        if (await _db.ContentItems.AnyAsync(c => c.Slug == request.Slug))
        {
            return BadRequest("Bu slug zaten kullanımda");
        }

        var content = new ContentItem
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
            Status = ContentItemStatus.Draft,
            AuthorUserId = 1, // TODO: Get from authenticated user
            CreatedAt = DateTime.UtcNow
        };

        _db.ContentItems.Add(content);
        await _db.SaveChangesAsync();

        return await GetById(content.Id);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AdminContentDetailDto>> Update(long id, UpdateContentDto request)
    {
        var content = await _db.ContentItems.FindAsync(id);

        if (content == null)
        {
            return NotFound();
        }

        // Check slug uniqueness (excluding current)
        if (await _db.ContentItems.AnyAsync(c => c.Slug == request.Slug && c.Id != id))
        {
            return BadRequest("Bu slug zaten kullanımda");
        }

        content.Title = request.Title;
        content.SubTitle = request.SubTitle;
        content.Slug = request.Slug;
        content.Type = request.Type;
        content.Category = request.Category;
        content.CoverImageUrl = request.CoverImageUrl;
        content.BodyHtml = request.BodyHtml;
        content.SeoTitle = request.SeoTitle;
        content.SeoDescription = request.SeoDescription;
        content.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return await GetById(id);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<AdminContentDetailDto>> UpdateStatus(long id, ContentStatusDto request)
    {
        var content = await _db.ContentItems.FindAsync(id);

        if (content == null)
        {
            return NotFound();
        }

        content.Status = request.Status;
        content.UpdatedAt = DateTime.UtcNow;

        if (request.Status == ContentItemStatus.Published && content.PublishedAt == null)
        {
            content.PublishedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return await GetById(id);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(long id)
    {
        var content = await _db.ContentItems.FindAsync(id);

        if (content == null)
        {
            return NotFound();
        }

        // Delete reactions first
        var reactions = await _db.ContentItemReactions.Where(r => r.ContentItemId == id).ToListAsync();
        _db.ContentItemReactions.RemoveRange(reactions);

        _db.ContentItems.Remove(content);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
