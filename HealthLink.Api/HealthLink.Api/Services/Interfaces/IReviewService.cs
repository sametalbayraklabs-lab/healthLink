using HealthLink.Api.Dtos.Review;

namespace HealthLink.Api.Services.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(long userId, CreateReviewRequest request);
    Task<List<ReviewDto>> GetExpertReviewsAsync(long expertId);
    Task<List<ReviewDto>> GetMyExpertReviewsAsync(long userId);
    Task<List<ReviewDto>> GetMyReviewsAsync(long userId);
    Task<ReviewDto> ApproveReviewAsync(long reviewId, string? adminNote);
    Task<ReviewDto> RejectReviewAsync(long reviewId, string? adminNote);
}
