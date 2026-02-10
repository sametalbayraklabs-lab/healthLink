using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Content;
using HealthLink.Api.Entities;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private readonly IContentService _contentService;
    private readonly AppDbContext _db;

    public ContentController(IContentService contentService, AppDbContext db)
    {
        _contentService = contentService;
        _db = db;
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
    [Authorize(Roles = "Admin")] // Only admins can create content
    public async Task<ActionResult<ContentItemDto>> Create([FromBody] CreateContentRequest request)
    {
        var item = await _contentService.CreateContentAsync(request);
        return CreatedAtAction(nameof(GetBySlug), new { slug = item.Slug }, item);
    }

    [HttpPost("{id}/publish")]
    [Authorize(Roles = "Admin")] // Only admins can publish
    public async Task<ActionResult<ContentItemDto>> Publish(long id)
    {
        var item = await _contentService.PublishContentAsync(id);
        return Ok(item);
    }

    /// <summary>
    /// Record a view for a content item
    /// </summary>
    [HttpPost("{id:long}/view")]
    public async Task<ActionResult> RecordView(long id)
    {
        var content = await _db.ContentItems.FindAsync(id);
        if (content == null) return NotFound();

        content.ViewCount++;
        await _db.SaveChangesAsync();
        return Ok();
    }

    /// <summary>
    /// Like or dislike a content item
    /// </summary>
    [HttpPost("{id:long}/react")]
    [Authorize] // Requires authentication
    public async Task<ActionResult> React(long id, [FromBody] ContentReactionDto request)
    {
        var content = await _db.ContentItems.FindAsync(id);
        if (content == null) return NotFound();

        var userId = Common.UserHelper.GetUserId(User);

        var existingReaction = await _db.ContentItemReactions
            .FirstOrDefaultAsync(r => r.ContentItemId == id && r.UserId == userId);

        if (existingReaction != null)
        {
            if (existingReaction.IsLike == request.IsLike)
            {
                // Toggle off
                if (existingReaction.IsLike)
                    content.LikeCount = Math.Max(0, content.LikeCount - 1);
                else
                    content.DislikeCount = Math.Max(0, content.DislikeCount - 1);
                _db.ContentItemReactions.Remove(existingReaction);
            }
            else
            {
                // Change reaction
                if (existingReaction.IsLike)
                {
                    content.LikeCount = Math.Max(0, content.LikeCount - 1);
                    content.DislikeCount++;
                }
                else
                {
                    content.DislikeCount = Math.Max(0, content.DislikeCount - 1);
                    content.LikeCount++;
                }
                existingReaction.IsLike = request.IsLike;
            }
        }
        else
        {
            _db.ContentItemReactions.Add(new ContentItemReaction
            {
                ContentItemId = id,
                UserId = userId,
                IsLike = request.IsLike,
                CreatedAt = DateTime.UtcNow
            });

            if (request.IsLike) content.LikeCount++;
            else content.DislikeCount++;
        }

        await _db.SaveChangesAsync();

        var userReaction = await _db.ContentItemReactions
            .FirstOrDefaultAsync(r => r.ContentItemId == id && r.UserId == userId);

        return Ok(new { hasReacted = userReaction != null, isLike = userReaction?.IsLike });
    }

    /// <summary>
    /// Get user's reaction status (no counts - admin only)
    /// </summary>
    [HttpGet("{id:long}/my-reaction")]
    [Authorize]
    public async Task<ActionResult> GetMyReaction(long id)
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        if (!long.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var reaction = await _db.ContentItemReactions
            .FirstOrDefaultAsync(r => r.ContentItemId == id && r.UserId == userId);

        return Ok(new { hasReacted = reaction != null, isLike = reaction?.IsLike });
    }
}

public class ContentReactionDto
{
    public bool IsLike { get; set; }
}


