using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Content;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class ContentService : IContentService
{
    private readonly AppDbContext _db;

    public ContentService(AppDbContext db) => _db = db;

    public async Task<List<ContentItemDto>> GetPublishedContentAsync(string? type = null)
    {
        var query = _db.ContentItems.Where(x => x.Status == ContentItemStatus.Published);

        if (!string.IsNullOrWhiteSpace(type))
        {
            var contentType = EnumExtensions.ParseContentItemType(type);
            query = query.Where(x => x.Type == contentType);
        }

        var items = await query
            .OrderByDescending(x => x.PublishedAt)
            .ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    public async Task<ContentItemDto> GetContentBySlugAsync(string slug)
    {
        var item = await _db.ContentItems
            .FirstOrDefaultAsync(x => x.Slug == slug && x.Status == ContentItemStatus.Published);

        if (item == null)
        {
            throw new BusinessException("CONTENT_NOT_FOUND", "İçerik bulunamadı.", 404);
        }

        return MapToDto(item);
    }

    public async Task<ContentItemDto> CreateContentAsync(CreateContentRequest request)
    {
        var type = EnumExtensions.ParseContentItemType(request.Type);
        var slug = GenerateSlug(request.Title);

        var item = new ContentItem
        {
            Type = type,
            Title = request.Title,
            Slug = slug,
            BodyHtml = request.Content ?? "",
            CoverImageUrl = request.ThumbnailUrl,
            Status = ContentItemStatus.Draft,
            AuthorUserId = 1, // TODO: Get from context
            CreatedAt = DateTime.UtcNow
        };

        _db.ContentItems.Add(item);
        await _db.SaveChangesAsync();

        return MapToDto(item);
    }

    public async Task<ContentItemDto> PublishContentAsync(long id)
    {
        var item = await _db.ContentItems.FindAsync(id);
        if (item == null)
        {
            throw new BusinessException("CONTENT_NOT_FOUND", "İçerik bulunamadı.", 404);
        }

        item.Status = ContentItemStatus.Published;
        item.PublishedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToDto(item);
    }

    private ContentItemDto MapToDto(ContentItem item)
    {
        return new ContentItemDto
        {
            Id = item.Id,
            Type = item.Type.ToApiString(),
            Title = item.Title,
            SubTitle = item.SubTitle,
            Slug = item.Slug,
            Category = item.Category,
            CoverImageUrl = item.CoverImageUrl,
            BodyHtml = item.BodyHtml,
            Content = item.BodyHtml, // Legacy field
            Summary = item.SubTitle, // Legacy field
            ThumbnailUrl = item.CoverImageUrl, // Legacy field
            Status = item.Status.ToApiString(),
            CreatedAt = item.CreatedAt,
            PublishedAt = item.PublishedAt
        };
    }

    private string GenerateSlug(string title)
    {
        return title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("ı", "i")
            .Replace("ğ", "g")
            .Replace("ü", "u")
            .Replace("ş", "s")
            .Replace("ö", "o")
            .Replace("ç", "c");
    }
}
