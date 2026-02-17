using HealthLink.Api.Dtos.Messaging;

namespace HealthLink.Api.Services.Interfaces;

public interface IMessagingService
{
    Task<List<ConversationDto>> GetMyConversationsAsync(long userId);
    Task<List<MessageDto>> GetConversationMessagesAsync(long userId, long conversationId);
    Task<MessageDto> SendMessageAsync(long userId, SendMessageRequest request);
    Task MarkAsReadAsync(long userId, long conversationId);
    Task<ConversationDto> GetOrCreateConversationAsync(long clientUserId, long expertId);
    Task<ConversationDto> GetOrCreateConversationForExpertAsync(long expertUserId, long clientId);
}
