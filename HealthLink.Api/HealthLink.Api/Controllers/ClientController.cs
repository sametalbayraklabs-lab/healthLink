using HealthLink.Api.Dtos.Client;
using HealthLink.Api.Services.Interfaces;
using HealthLink.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Client")]
public class ClientController : BaseAuthenticatedController
{
    private readonly IClientService _service;
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ClientController(IClientService service, AppDbContext db, IWebHostEnvironment env)
    {
        _service = service;
        _db = db;
        _env = env;
    }



    [HttpGet("profile")]
    public async Task<ActionResult<ClientProfileResponse>> GetProfile()
        => Ok(await _service.GetProfileAsync(UserId));

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateClientProfileRequest request)
    {
        await _service.UpdateProfileAsync(UserId, request);
        return NoContent();
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ClientDashboardResponse>> GetDashboard()
        => Ok(await _service.GetDashboardAsync(UserId));

    // API-1 Endpoints
    [HttpGet("my")]
    public async Task<ActionResult<ClientProfileDto>> GetMyProfile()
        => Ok(await _service.GetClientProfileAsync(UserId));

    [HttpPut("my")]
    public async Task<ActionResult<ClientProfileDto>> UpdateMyProfile([FromBody] UpdateClientRequestDto request)
        => Ok(await _service.UpdateClientProfileAsync(UserId, request));

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClientListItemResponse>>> GetAllClients()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("by-expert")]
    public async Task<ActionResult<IReadOnlyList<ClientListItemResponse>>> GetClientsByExpert()
    {
        var result = await _service.GetByExpertAsync(UserId);
        return Ok(result);
    }

    [HttpPost("my/photo")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5 MB
    public async Task<ActionResult> UploadPhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya seçilmedi.");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest("Sadece JPEG, PNG veya WebP formatları desteklenir.");

        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == UserId);
        if (client == null) return NotFound();

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads", "photos");
        Directory.CreateDirectory(uploadsDir);

        // Delete old photo if exists
        if (!string.IsNullOrEmpty(client.ProfilePhotoUrl))
        {
            var oldPath = Path.Combine(webRoot, client.ProfilePhotoUrl.TrimStart('/'));
            if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        }

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"client_{client.Id}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        client.ProfilePhotoUrl = $"/uploads/photos/{fileName}";
        client.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { profilePhotoUrl = client.ProfilePhotoUrl });
    }

    [HttpDelete("my/photo")]
    public async Task<ActionResult> DeletePhoto()
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == UserId);
        if (client == null) return NotFound();

        if (!string.IsNullOrEmpty(client.ProfilePhotoUrl))
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var filePath = Path.Combine(webRoot, client.ProfilePhotoUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

            client.ProfilePhotoUrl = null;
            client.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }
}
