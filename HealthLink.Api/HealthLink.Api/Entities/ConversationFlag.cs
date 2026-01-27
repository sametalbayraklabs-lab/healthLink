using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ConversationFlag
    {
        public long Id { get; set; }

        public long ConversationId { get; set; }
        public Conversation Conversation { get; set; } = null!;

        public long ReportedByUserId { get; set; }
        public User ReportedByUser { get; set; } = null!;

        public string Reason { get; set; } = null!;

        public ConversationFlagStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
