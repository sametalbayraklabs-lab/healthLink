using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Messaging;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/conversations")]
// [Authorize] // Temporarily disabled
public class ConversationsController : ControllerBase
{
    private readonly IMessagingService _messagingService;

    public ConversationsController(IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ConversationDto>>> GetMyConversations()
    {
        var userId = User.GetUserId();
        var conversations = await _messagingService.GetMyConversationsAsync(userId);
        return Ok(conversations);
    }

    [HttpGet("{id}/messages")]
    public async Task<ActionResult<List<MessageDto>>> GetMessages(long id)
    {
        var userId = User.GetUserId();
        var messages = await _messagingService.GetConversationMessagesAsync(userId, id);
        return Ok(messages);
    }

    [HttpPost("messages")]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] SendMessageRequest request)
    {
        var userId = User.GetUserId();
        var message = await _messagingService.SendMessageAsync(userId, request);
        return Ok(message);
    }

    [HttpPost("{id}/mark-read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        var userId = User.GetUserId();
        await _messagingService.MarkAsReadAsync(userId, id);
        return NoContent();
    }
}

