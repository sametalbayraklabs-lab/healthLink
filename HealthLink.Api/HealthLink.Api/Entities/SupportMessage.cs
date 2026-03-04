using System;

namespace HealthLink.Api.Entities
{
    public class SupportMessage
    {
        public long Id { get; set; }

        public long SupportRequestId { get; set; }
        public SupportRequest SupportRequest { get; set; } = null!;

        public long SenderUserId { get; set; }
        public User Sender { get; set; } = null!;

        public string MessageText { get; set; } = null!;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; }
    }
}
