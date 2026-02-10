using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Messaging;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/conversations")]
[Authorize]
public class ConversationsController : BaseAuthenticatedController
{
    private readonly IMessagingService _messagingService;

    public ConversationsController(IMessagingService messagingService)
    {
        _messagingService = messagingService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ConversationDto>>> GetMyConversations()
    {
        var conversations = await _messagingService.GetMyConversationsAsync(UserId);
        return Ok(conversations);
    }

    [HttpGet("{id}/messages")]
    public async Task<ActionResult<List<MessageDto>>> GetMessages(long id)
    {
        var messages = await _messagingService.GetConversationMessagesAsync(UserId, id);
        return Ok(messages);
    }

    [HttpPost("messages")]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] SendMessageRequest request)
    {
        var message = await _messagingService.SendMessageAsync(UserId, request);
        return Ok(message);
    }

    [HttpPost("{id}/mark-read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        await _messagingService.MarkAsReadAsync(UserId, id);
        return NoContent();
    }
}

