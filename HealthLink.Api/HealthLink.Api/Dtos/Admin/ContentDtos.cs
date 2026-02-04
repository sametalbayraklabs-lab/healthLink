using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class AdminContentListDto
{
    public long Id { get; set; }
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string Slug { get; set; } = null!;
    public ContentItemType Type { get; set; }
    public string? Category { get; set; }
    public ContentItemStatus Status { get; set; }
    public string AuthorName { get; set; } = null!;
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    // Engagement stats (admin only)
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
}

public class AdminContentDetailDto
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
    public string AuthorName { get; set; } = null!;
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    // Engagement stats (admin only)
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
}

public class CreateContentDto
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
}

public class UpdateContentDto
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
}

public class ContentStatusDto
{
    public ContentItemStatus Status { get; set; }
}
