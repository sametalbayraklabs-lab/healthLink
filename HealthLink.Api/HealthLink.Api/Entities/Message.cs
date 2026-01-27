namespace HealthLink.Api.Entities
{
    public class Message
    {
        public long Id { get; set; }

        public long ConversationId { get; set; }
        public Conversation Conversation { get; set; } = null!;

        public long SenderUserId { get; set; }
        public User SenderUser { get; set; } = null!;

        public string MessageText { get; set; } = null!;

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
