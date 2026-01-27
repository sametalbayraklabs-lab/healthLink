namespace HealthLink.Api.Dtos.Messaging;

public class ConversationDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public long ExpertId { get; set; }
    public long? AppointmentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }
}

public class MessageDto
{
    public long Id { get; set; }
    public long ConversationId { get; set; }
    public long SenderId { get; set; }
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
}

public class SendMessageRequest
{
    public long ConversationId { get; set; }
    public string Content { get; set; } = null!;
}
