using System;

namespace HealthLink.Api.Entities
{
    public class SupportRequest
    {
        public long Id { get; set; }

        /// <summary>The UserId of whoever created this request (Client or Expert)</summary>
        public long CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; } = null!;

        public string Subject { get; set; } = null!;

        public string Description { get; set; } = null!;

        /// <summary>Open, InProgress, Closed</summary>
        public string Status { get; set; } = "Open";

        /// <summary>The admin/operator who claimed this request. Null = in the pool.</summary>
        public long? OperatorUserId { get; set; }
        public User? OperatorUser { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
