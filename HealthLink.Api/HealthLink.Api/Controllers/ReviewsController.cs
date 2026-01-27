using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Review;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>
    /// Create a review for a completed appointment
    /// </summary>
    [HttpPost]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewRequest request)
    {
        var userId = User.GetUserId();
        var review = await _reviewService.CreateReviewAsync(userId, request);
        return CreatedAtAction(nameof(GetExpertReviews), new { expertId = review.ExpertId }, review);
    }

    /// <summary>
    /// Get approved reviews for an expert
    /// </summary>
    [HttpGet("expert/{expertId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetExpertReviews(long expertId)
    {
        var reviews = await _reviewService.GetExpertReviewsAsync(expertId);
        return Ok(reviews);
    }

    /// <summary>
    /// Get my reviews
    /// </summary>
    [HttpGet("me")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<List<ReviewDto>>> GetMyReviews()
    {
        var userId = User.GetUserId();
        var reviews = await _reviewService.GetMyReviewsAsync(userId);
        return Ok(reviews);
    }

    /// <summary>
    /// Approve a review (Admin only)
    /// </summary>
    [HttpPost("{id}/approve")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ReviewDto>> Approve(long id, [FromBody] string? adminNote = null)
    {
        var review = await _reviewService.ApproveReviewAsync(id, adminNote);
        return Ok(review);
    }

    /// <summary>
    /// Reject a review (Admin only)
    /// </summary>
    [HttpPost("{id}/reject")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ReviewDto>> Reject(long id, [FromBody] string? adminNote = null)
    {
        var review = await _reviewService.RejectReviewAsync(id, adminNote);
        return Ok(review);
    }
}

