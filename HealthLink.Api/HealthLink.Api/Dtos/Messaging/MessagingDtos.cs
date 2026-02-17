namespace HealthLink.Api.Dtos.Messaging;

public class ConversationDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public long ExpertId { get; set; }
    public string OtherPartyName { get; set; } = null!;
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}

public class MessageDto
{
    public long Id { get; set; }
    public long ConversationId { get; set; }
    public long SenderUserId { get; set; }
    public string MessageText { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsMine { get; set; }
}

public class SendMessageRequest
{
    public long ConversationId { get; set; }
    public string MessageText { get; set; } = null!;
}
