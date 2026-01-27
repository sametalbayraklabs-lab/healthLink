using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Review;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewDto> CreateReviewAsync(long userId, CreateReviewRequest request)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
        }

        var appointment = await _db.Appointments
            .FirstOrDefaultAsync(x => x.Id == request.AppointmentId && x.ClientId == client.Id);

        if (appointment == null)
        {
            throw new BusinessException("APPOINTMENT_NOT_FOUND", "Randevu bulunamadÄ±.", 404);
        }

        if (appointment.Status != AppointmentStatus.Completed)
        {
            throw new BusinessException("APPOINTMENT_NOT_COMPLETED", "Sadece tamamlanmÄ±ÅŸ randevular iÃ§in deÄŸerlendirme yapÄ±labilir.", 400);
        }

        var existingReview = await _db.Reviews.FirstOrDefaultAsync(x => x.AppointmentId == request.AppointmentId);
        if (existingReview != null)
        {
            throw new BusinessException("REVIEW_ALREADY_EXISTS", "Bu randevu iÃ§in zaten deÄŸerlendirme yapÄ±lmÄ±ÅŸ.", 400);
        }

        if (request.Rating < 1 || request.Rating > 5)
        {
            throw new BusinessException("INVALID_RATING", "Puan 1-5 arasÄ±nda olmalÄ±dÄ±r.", 400);
        }

        var review = new Review
        {
            AppointmentId = request.AppointmentId,
            ClientId = client.Id,
            ExpertId = appointment.ExpertId,
            Rating = request.Rating,
            Comment = request.Comment,
            Status = ReviewStatus.PendingApproval,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return MapToDto(review);
    }

    public async Task<List<ReviewDto>> GetExpertReviewsAsync(long expertId)
    {
        var reviews = await _db.Reviews
            .Where(x => x.ExpertId == expertId && x.Status == ReviewStatus.Approved)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return reviews.Select(MapToDto).ToList();
    }

    public async Task<List<ReviewDto>> GetMyReviewsAsync(long userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(x => x.UserId == userId);
        if (client == null)
        {
            throw new BusinessException(ErrorCodes.NOT_A_CLIENT, "KullanÄ±cÄ± client deÄŸil.", 403);
        }

        var reviews = await _db.Reviews
            .Where(x => x.ClientId == client.Id)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return reviews.Select(MapToDto).ToList();
    }

    public async Task<ReviewDto> ApproveReviewAsync(long reviewId, string? adminNote)
    {
        var review = await _db.Reviews.FindAsync(reviewId);
        if (review == null)
        {
            throw new BusinessException("REVIEW_NOT_FOUND", "DeÄŸerlendirme bulunamadÄ±.", 404);
        }

        review.Status = ReviewStatus.Approved;
        review.AdminNote = adminNote;
        review.ReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(review);
    }

    public async Task<ReviewDto> RejectReviewAsync(long reviewId, string? adminNote)
    {
        var review = await _db.Reviews.FindAsync(reviewId);
        if (review == null)
        {
            throw new BusinessException("REVIEW_NOT_FOUND", "DeÄŸerlendirme bulunamadÄ±.", 404);
        }

        review.Status = ReviewStatus.Rejected;
        review.AdminNote = adminNote;
        review.ReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(review);
    }

    private ReviewDto MapToDto(Review review)
    {
        return new ReviewDto
        {
            Id = review.Id,
            AppointmentId = review.AppointmentId,
            ClientId = review.ClientId,
            ExpertId = review.ExpertId,
            Rating = review.Rating,
            Comment = review.Comment,
            Status = review.Status.ToApiString(),
            AdminNote = review.AdminNote,
            CreatedAt = review.CreatedAt,
            ReviewedAt = review.ReviewedAt
        };
    }
}

