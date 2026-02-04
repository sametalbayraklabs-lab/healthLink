namespace HealthLink.Api.Entities
{
    public class ContentItemReaction
    {
        public long Id { get; set; }

        public long ContentItemId { get; set; }
        public ContentItem ContentItem { get; set; } = null!;

        public long UserId { get; set; }
        public User User { get; set; } = null!;

        public bool IsLike { get; set; } // true = like, false = dislike

        public DateTime CreatedAt { get; set; }
    }
}
