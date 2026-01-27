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
        var conversations = await _db.Conversations
            .Where(x => x.Client.UserId == userId || x.Expert.UserId == userId)
            .OrderByDescending(x => x.LastMessageAt ?? x.CreatedAt)
            .Select(x => new ConversationDto
            {
                Id = x.Id,
                ClientId = x.ClientId,
                ExpertId = x.ExpertId,
                AppointmentId = null, // Not in entity
                CreatedAt = x.CreatedAt,
                LastMessageAt = x.LastMessageAt
            })
            .ToListAsync();

        return conversations;
    }

    public async Task<List<MessageDto>> GetConversationMessagesAsync(long userId, long conversationId)
    {
        var conversation = await _db.Conversations
            .Include(x => x.Client)
            .Include(x => x.Expert)
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null || (conversation.Client.UserId != userId && conversation.Expert.UserId != userId))
        {
            throw new BusinessException("CONVERSATION_NOT_FOUND", "Konuşma bulunamadı.", 404);
        }

        var messages = await _db.Messages
            .Where(x => x.ConversationId == conversationId)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new MessageDto
            {
                Id = x.Id,
                ConversationId = x.ConversationId,
                SenderId = x.SenderUserId,
                Content = x.MessageText,
                IsRead = x.IsRead,
                SentAt = x.CreatedAt
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
            throw new BusinessException("CONVERSATION_NOT_FOUND", "Konuşma bulunamadı.", 404);
        }

        var message = new Message
        {
            ConversationId = request.ConversationId,
            SenderUserId = userId,
            MessageText = request.Content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);
        conversation.LastMessageAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new MessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderUserId,
            Content = message.MessageText,
            IsRead = message.IsRead,
            SentAt = message.CreatedAt
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
            throw new BusinessException("CONVERSATION_NOT_FOUND", "Konuşma bulunamadı.", 404);
        }

        var messages = await _db.Messages
            .Where(x => x.ConversationId == conversationId && x.SenderUserId != userId && !x.IsRead)
            .ToListAsync();

        foreach (var msg in messages)
        {
            msg.IsRead = true;
        }

        await _db.SaveChangesAsync();
    }
}
