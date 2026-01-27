namespace HealthLink.Api.Entities
{
    public class Conversation
    {
        public long Id { get; set; }

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? LastMessageAt { get; set; }

        public bool IsFrozen { get; set; } = false;
    }
}
