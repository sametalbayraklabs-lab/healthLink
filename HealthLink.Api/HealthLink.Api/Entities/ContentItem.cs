using System;

using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ContentItem
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
        public User AuthorUser { get; set; } = null!;

        public DateTime? PublishedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
