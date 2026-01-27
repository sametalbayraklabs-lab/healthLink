using HealthLink.Api.Dtos.Content;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private readonly IContentService _contentService;

    public ContentController(IContentService contentService)
    {
        _contentService = contentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ContentItemDto>>> GetPublished([FromQuery] string? type = null)
    {
        var items = await _contentService.GetPublishedContentAsync(type);
        return Ok(items);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ContentItemDto>> GetBySlug(string slug)
    {
        var item = await _contentService.GetContentBySlugAsync(slug);
        return Ok(item);
    }

    [HttpPost]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ContentItemDto>> Create([FromBody] CreateContentRequest request)
    {
        var item = await _contentService.CreateContentAsync(request);
        return CreatedAtAction(nameof(GetBySlug), new { slug = item.Slug }, item);
    }

    [HttpPost("{id}/publish")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ContentItemDto>> Publish(long id)
    {
        var item = await _contentService.PublishContentAsync(id);
        return Ok(item);
    }
}

