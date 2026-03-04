using HealthLink.Api.Common;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HealthLink.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IMessagingService _messagingService;

    public ChatHub(IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    /// <summary>
    /// Send a message. Hub only calls the service and returns the result to the caller.
    /// The service itself handles broadcasting ReceiveMessage to the receiver via IHubContext.
    /// This prevents double-broadcast.
    /// </summary>
    public async Task<object> SendMessage(long conversationId, string messageText)
    {
        var userId = GetUserId();
        var request = new Dtos.Messaging.SendMessageRequest
        {
            ConversationId = conversationId,
            MessageText = messageText
        };

        // Service saves to DB + broadcasts to receiver via IHubContext
        var messageDto = await _messagingService.SendMessageAsync(userId, request);
        return messageDto;
    }

    /// <summary>
    /// Mark messages as read. Service handles broadcasting MessageRead to the sender.
    /// </summary>
    public async Task MarkAsRead(long conversationId)
    {
        var userId = GetUserId();
        await _messagingService.MarkAsReadAsync(userId, conversationId);
    }

    /// <summary>
    /// Notify the other party that this user is typing.
    /// Frontend should debounce this call (1.5-2s).
    /// </summary>
    public async Task SendTyping(long conversationId, long receiverUserId)
    {
        var userId = GetUserId();
        await Clients.User(receiverUserId.ToString())
            .SendAsync("UserTyping", new { conversationId, userId });
    }

    private long GetUserId()
    {
        return UserHelper.GetUserId(Context.User!);
    }
}
