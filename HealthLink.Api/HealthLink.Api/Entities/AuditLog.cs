namespace HealthLink.Api.Entities
{
    public class AuditLog
    {
        public long Id { get; set; }

        public long? UserId { get; set; }
        public User? User { get; set; }

        public string ActionType { get; set; } = null!;

        public string? TargetType { get; set; }

        public long? TargetId { get; set; }

        public string? IpAddress { get; set; }

        public string? MetaJson { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
