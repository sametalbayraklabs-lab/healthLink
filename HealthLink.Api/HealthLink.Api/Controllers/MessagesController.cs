using HealthLink.Api.Dtos.Messaging;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessagesController : BaseAuthenticatedController
{
    private readonly IMessagingService _service;

    public MessagesController(IMessagingService service)
    {
        _service = service;
    }

    /// <summary>Get all conversations for current user</summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var result = await _service.GetMyConversationsAsync(UserId);
        return Ok(result);
    }

    /// <summary>Get messages in a conversation</summary>
    [HttpGet("conversations/{id}")]
    public async Task<IActionResult> GetMessages(long id)
    {
        var result = await _service.GetConversationMessagesAsync(UserId, id);
        return Ok(result);
    }

    /// <summary>Send a message</summary>
    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var result = await _service.SendMessageAsync(UserId, request);
        return Ok(result);
    }

    /// <summary>Mark messages in conversation as read</summary>
    [HttpPost("conversations/{id}/read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        await _service.MarkAsReadAsync(UserId, id);
        return NoContent();
    }

    /// <summary>Start or get conversation with an expert (client only)</summary>
    [HttpPost("start/{expertId}")]
    public async Task<IActionResult> StartConversation(long expertId)
    {
        var result = await _service.GetOrCreateConversationAsync(UserId, expertId);
        return Ok(result);
    }

    /// <summary>Start or get conversation with a client (expert only)</summary>
    [HttpPost("start-with-client/{clientId}")]
    public async Task<IActionResult> StartConversationWithClient(long clientId)
    {
        var result = await _service.GetOrCreateConversationForExpertAsync(UserId, clientId);
        return Ok(result);
    }
}
