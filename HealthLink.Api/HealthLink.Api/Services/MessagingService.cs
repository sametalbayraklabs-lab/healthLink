using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Messaging;
using HealthLink.Api.Entities;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class MessagingService : IMessagingService
{
    private readonly AppDbContext _db;

    public MessagingService(AppDbContext db) => _db = db;

    public async Task<List<ConversationDto>> GetMyConversationsAsync(long userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == userId);

        var conversations = await _db.Conversations
            .Include(c => c.Client)
            .Include(c => c.Expert)
            .Where(x => x.Client.UserId == userId || x.Expert.UserId == userId)
            .OrderByDescending(x => x.LastMessageAt ?? x.CreatedAt)
            .ToListAsync();

        var result = new List<ConversationDto>();

        foreach (var conv in conversations)
        {
            var lastMsg = await _db.Messages
                .Where(m => m.ConversationId == conv.Id)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            var unreadCount = await _db.Messages.CountAsync(m =>
                m.ConversationId == conv.Id &&
                m.SenderUserId != userId &&
                !m.IsRead);

            string otherName;
            if (client != null && conv.ClientId == client.Id)
            {
                otherName = conv.Expert?.DisplayName ?? "Uzman";
            }
            else
            {
                otherName = $"{conv.Client.FirstName} {conv.Client.LastName}";
            }

            result.Add(new ConversationDto
            {
                Id = conv.Id,
                ClientId = conv.ClientId,
                ExpertId = conv.ExpertId,
                OtherPartyName = otherName,
                LastMessage = lastMsg?.MessageText,
                LastMessageAt = lastMsg?.CreatedAt ?? conv.CreatedAt,
                UnreadCount = unreadCount
            });
        }

        return result;
    }

    public async Task<List<MessageDto>> GetConversationMessagesAsync(long userId, long conversationId)
    {
        var conversation = await _db.Conversations
            .Include(x => x.Client)
            .Include(x => x.Expert)
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null || (conversation.Client.UserId != userId && conversation.Expert.UserId != userId))
        {
            throw new BusinessException(ErrorCodes.CONVERSATION_NOT_FOUND, "Konuşma bulunamadı.", 404);
        }

        var messages = await _db.Messages
            .Where(x => x.ConversationId == conversationId)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new MessageDto
            {
                Id = x.Id,
                ConversationId = x.ConversationId,
                SenderUserId = x.SenderUserId,
                MessageText = x.MessageText,
                IsRead = x.IsRead,
                CreatedAt = x.CreatedAt,
                IsMine = x.SenderUserId == userId
            })
            .ToListAsync();

        return messages;
    }

    public async Task<MessageDto> SendMessageAsync(long userId, SendMessageRequest request)
    {
        var conversation = await _db.Conversations
            .Include(x => x.Client)
            .Include(x => x.Expert)
            .FirstOrDefaultAsync(x => x.Id == request.ConversationId);

        if (conversation == null || (conversation.Client.UserId != userId && conversation.Expert.UserId != userId))
        {
            throw new BusinessException(ErrorCodes.CONVERSATION_NOT_FOUND, "Konuşma bulunamadı.", 404);
        }

        var message = new Message
        {
            ConversationId = request.ConversationId,
            SenderUserId = userId,
            MessageText = request.MessageText,
            IsRead = false,
            CreatedAt = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)
        };

        _db.Messages.Add(message);
        conversation.LastMessageAt = message.CreatedAt;
        await _db.SaveChangesAsync();

        return new MessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderUserId = message.SenderUserId,
            MessageText = message.MessageText,
            IsRead = message.IsRead,
            CreatedAt = message.CreatedAt,
            IsMine = true
        };
    }

    public async Task MarkAsReadAsync(long userId, long conversationId)
    {
        var conversation = await _db.Conversations
            .Include(x => x.Client)
            .Include(x => x.Expert)
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null || (conversation.Client.UserId != userId && conversation.Expert.UserId != userId))
        {
            throw new BusinessException(ErrorCodes.CONVERSATION_NOT_FOUND, "Konuşma bulunamadı.", 404);
        }

        var messages = await _db.Messages
            .Where(x => x.ConversationId == conversationId && x.SenderUserId != userId && !x.IsRead)
            .ToListAsync();

        foreach (var msg in messages)
        {
            msg.IsRead = true;
            msg.ReadAt = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
        }

        await _db.SaveChangesAsync();
    }

    public async Task<ConversationDto> GetOrCreateConversationAsync(long clientUserId, long expertId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == clientUserId);
        if (client == null)
            throw new BusinessException(ErrorCodes.CLIENT_NOT_FOUND, "Client not found", 404);

        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.Id == expertId);
        if (expert == null)
            throw new BusinessException(ErrorCodes.EXPERT_NOT_FOUND, "Expert not found", 404);

        var existing = await _db.Conversations
            .FirstOrDefaultAsync(c => c.ClientId == client.Id && c.ExpertId == expertId);

        if (existing != null)
        {
            var lastMsg = await _db.Messages
                .Where(m => m.ConversationId == existing.Id)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            return new ConversationDto
            {
                Id = existing.Id,
                ClientId = existing.ClientId,
                ExpertId = existing.ExpertId,
                OtherPartyName = expert.DisplayName ?? "Uzman",
                LastMessage = lastMsg?.MessageText,
                LastMessageAt = existing.LastMessageAt ?? existing.CreatedAt,
                UnreadCount = 0
            };
        }

        var conv = new Conversation
        {
            ClientId = client.Id,
            ExpertId = expertId,
            CreatedAt = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc),
            IsFrozen = false
        };

        _db.Conversations.Add(conv);
        await _db.SaveChangesAsync();

        return new ConversationDto
        {
            Id = conv.Id,
            ClientId = conv.ClientId,
            ExpertId = conv.ExpertId,
            OtherPartyName = expert.DisplayName ?? "Uzman",
            LastMessageAt = conv.CreatedAt,
            UnreadCount = 0
        };
    }
    public async Task<ConversationDto> GetOrCreateConversationForExpertAsync(long expertUserId, long clientId)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId);
        if (expert == null)
            throw new BusinessException(ErrorCodes.EXPERT_NOT_FOUND, "Expert not found", 404);

        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == clientId);
        if (client == null)
            throw new BusinessException(ErrorCodes.CLIENT_NOT_FOUND, "Client not found", 404);

        var existing = await _db.Conversations
            .FirstOrDefaultAsync(c => c.ClientId == clientId && c.ExpertId == expert.Id);

        if (existing != null)
        {
            var lastMsg = await _db.Messages
                .Where(m => m.ConversationId == existing.Id)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            return new ConversationDto
            {
                Id = existing.Id,
                ClientId = existing.ClientId,
                ExpertId = existing.ExpertId,
                OtherPartyName = $"{client.FirstName} {client.LastName}",
                LastMessage = lastMsg?.MessageText,
                LastMessageAt = existing.LastMessageAt ?? existing.CreatedAt,
                UnreadCount = 0
            };
        }

        var conv = new Conversation
        {
            ClientId = clientId,
            ExpertId = expert.Id,
            CreatedAt = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc),
            IsFrozen = false
        };

        _db.Conversations.Add(conv);
        await _db.SaveChangesAsync();

        return new ConversationDto
        {
            Id = conv.Id,
            ClientId = conv.ClientId,
            ExpertId = conv.ExpertId,
            OtherPartyName = $"{client.FirstName} {client.LastName}",
            LastMessageAt = conv.CreatedAt,
            UnreadCount = 0
        };
    }
}
