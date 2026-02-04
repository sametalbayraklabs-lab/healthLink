using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class ContentItemDto
{
    public long Id { get; set; }
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Slug { get; set; } = null!;
    public ContentItemType Type { get; set; }
    public string? Category { get; set; }
    public string? CoverImageUrl { get; set; }
    public string BodyHtml { get; set; } = null!;
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public ContentItemStatus Status { get; set; }
    public long AuthorUserId { get; set; }
    public string? AuthorName { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateContentItemDto
{
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Slug { get; set; } = null!;
    public ContentItemType Type { get; set; }
    public string? Category { get; set; }
    public string? CoverImageUrl { get; set; }
    public string BodyHtml { get; set; } = null!;
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public ContentItemStatus Status { get; set; }
}

public class UpdateContentItemDto
{
    public string? Title { get; set; }
    public string? SubTitle { get; set; }
    public string? Slug { get; set; }
    public ContentItemType? Type { get; set; }
    public string? Category { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? BodyHtml { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public ContentItemStatus? Status { get; set; }
}
