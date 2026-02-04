using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Entities.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/reviews")]
// [Authorize(Roles = "Admin")] // TEMP: Disabled for testing
public class AdminReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminReviewsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminReviewListDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? rating,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Reviews
            .Include(r => r.Client)
            .Include(r => r.Expert)
            .AsQueryable();

        // Status filter
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReviewStatus>(status, out var reviewStatus))
        {
            query = query.Where(r => r.Status == reviewStatus);
        }

        // Rating filter
        if (rating.HasValue && rating >= 1 && rating <= 5)
        {
            query = query.Where(r => r.Rating == rating.Value);
        }

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new AdminReviewListDto
            {
                Id = r.Id,
                AppointmentId = r.AppointmentId,
                ClientId = r.ClientId,
                ClientName = r.Client.FirstName + " " + r.Client.LastName,
                ExpertId = r.ExpertId,
                ExpertName = r.Expert.DisplayName ?? "Uzman",
                ExpertType = r.Expert.ExpertType.ToString(),
                Rating = r.Rating,
                Comment = r.Comment,
                Status = r.Status,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminReviewDetailDto>> GetById(long id)
    {
        var review = await _db.Reviews
            .Include(r => r.Client)
                .ThenInclude(c => c.User)
            .Include(r => r.Expert)
                .ThenInclude(e => e.User)
            .Include(r => r.Appointment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null)
        {
            return NotFound();
        }

        var dto = new AdminReviewDetailDto
        {
            Id = review.Id,
            AppointmentId = review.AppointmentId,
            AppointmentDate = review.Appointment.StartDateTime,
            ClientId = review.ClientId,
            ClientName = review.Client.FirstName + " " + review.Client.LastName,
            ClientEmail = review.Client.User.Email,
            ExpertId = review.ExpertId,
            ExpertName = review.Expert.DisplayName ?? "Uzman",
            ExpertEmail = review.Expert.User.Email,
            ExpertType = review.Expert.ExpertType.ToString(),
            Rating = review.Rating,
            Comment = review.Comment,
            Status = review.Status,
            AdminNote = review.AdminNote,
            CreatedAt = review.CreatedAt,
            ReviewedAt = review.ReviewedAt
        };

        return Ok(dto);
    }

    [HttpPut("{id}/action")]
    public async Task<ActionResult<AdminReviewDetailDto>> UpdateStatus(long id, ReviewActionDto request)
    {
        var review = await _db.Reviews.FindAsync(id);

        if (review == null)
        {
            return NotFound();
        }

        review.Status = request.Status;
        review.AdminNote = request.AdminNote;
        review.ReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Update expert average rating if approved
        if (request.Status == ReviewStatus.Approved)
        {
            var expert = await _db.Experts.FindAsync(review.ExpertId);
            if (expert != null)
            {
                var approvedReviews = await _db.Reviews
                    .Where(r => r.ExpertId == review.ExpertId && r.Status == ReviewStatus.Approved)
                    .ToListAsync();

                expert.AverageRating = approvedReviews.Any() 
                    ? (decimal)approvedReviews.Average(r => r.Rating) 
                    : null;
                expert.TotalReviewCount = approvedReviews.Count;

                await _db.SaveChangesAsync();
            }
        }

        return await GetById(id);
    }
}
