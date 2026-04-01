using HealthLink.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/profile")]
[Authorize(Roles = "Admin")]
public class AdminProfileController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public AdminProfileController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpPost("photo")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<ActionResult> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya seçilmedi.");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest("Sadece JPEG, PNG veya WebP formatları desteklenir.");

        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.UserId == UserId);
        if (admin == null) return NotFound();

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads", "photos");
        Directory.CreateDirectory(uploadsDir);

        // Delete old photo if exists
        if (!string.IsNullOrEmpty(admin.ProfilePhotoUrl))
        {
            var oldPath = Path.Combine(webRoot, admin.ProfilePhotoUrl.TrimStart('/'));
            if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        }

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"admin_{admin.Id}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        admin.ProfilePhotoUrl = $"/uploads/photos/{fileName}";
        admin.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { profilePhotoUrl = admin.ProfilePhotoUrl });
    }

    [HttpDelete("photo")]
    public async Task<ActionResult> DeletePhoto()
    {
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.UserId == UserId);
        if (admin == null) return NotFound();

        if (!string.IsNullOrEmpty(admin.ProfilePhotoUrl))
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var filePath = Path.Combine(webRoot, admin.ProfilePhotoUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

            admin.ProfilePhotoUrl = null;
            admin.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }
}
