using HealthLink.Api.Common;
using HealthLink.Api.Data;
using HealthLink.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/favorites")]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FavoritesController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all favorite experts for the current client
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = User.GetUserId();
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null) return Forbid();

        var favorites = await _db.FavoriteExperts
            .Include(f => f.Expert)
            .Where(f => f.ClientId == client.Id)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                f.ExpertId,
                f.Expert.DisplayName,
                ExpertType = f.Expert.ExpertType.ToApiString(),
                f.Expert.ProfilePhotoUrl,
                f.Expert.AverageRating,
                f.Expert.TotalReviewCount,
                f.CreatedAt
            })
            .ToListAsync();

        return Ok(favorites);
    }

    /// <summary>
    /// Add an expert to favorites
    /// </summary>
    [HttpPost("{expertId}")]
    public async Task<IActionResult> AddFavorite(long expertId)
    {
        var userId = User.GetUserId();
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null) return Forbid();

        var expert = await _db.Experts.FindAsync(expertId);
        if (expert == null) return NotFound("Uzman bulunamadı.");

        var existing = await _db.FavoriteExperts
            .FirstOrDefaultAsync(f => f.ClientId == client.Id && f.ExpertId == expertId);
        if (existing != null) return Ok(new { message = "Zaten favorilerde." });

        _db.FavoriteExperts.Add(new FavoriteExpert
        {
            ClientId = client.Id,
            ExpertId = expertId,
            CreatedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();

        return Ok(new { message = "Favorilere eklendi." });
    }

    /// <summary>
    /// Remove an expert from favorites
    /// </summary>
    [HttpDelete("{expertId}")]
    public async Task<IActionResult> RemoveFavorite(long expertId)
    {
        var userId = User.GetUserId();
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null) return Forbid();

        var existing = await _db.FavoriteExperts
            .FirstOrDefaultAsync(f => f.ClientId == client.Id && f.ExpertId == expertId);
        if (existing == null) return NotFound("Favori bulunamadı.");

        _db.FavoriteExperts.Remove(existing);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Favorilerden çıkarıldı." });
    }

    /// <summary>
    /// Check if an expert is in favorites
    /// </summary>
    [HttpGet("{expertId}/check")]
    public async Task<IActionResult> CheckFavorite(long expertId)
    {
        var userId = User.GetUserId();
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null) return Forbid();

        var isFavorite = await _db.FavoriteExperts
            .AnyAsync(f => f.ClientId == client.Id && f.ExpertId == expertId);

        return Ok(new { isFavorite });
    }
}
