namespace HealthLink.Api.Dtos.Content;

public class ContentItemDto
{
    public long Id { get; set; }
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? SubTitle { get; set; }
    public string? Slug { get; set; }
    public string? Category { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? BodyHtml { get; set; }
    public string? Content { get; set; } // Legacy field
    public string? Summary { get; set; }
    public string? ThumbnailUrl { get; set; } // Legacy field
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class CreateContentRequest
{
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Content { get; set; }
    public string? Summary { get; set; }
    public string? ThumbnailUrl { get; set; }
}
