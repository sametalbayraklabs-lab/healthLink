using HealthLink.Api.Common;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using HealthLink.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/experts")]
public class ExpertsController : ControllerBase
{
    private readonly IExpertService _expertService;
    private readonly AppDbContext _db;

    public ExpertsController(IExpertService expertService, AppDbContext db)
    {
        _expertService = expertService;
        _db = db;
    }

    [HttpGet("me")]
    [Authorize(Roles = "Expert")] // Only experts
    public async Task<ActionResult<ExpertProfileDto>> GetMe()
    {
        var userId = Common.UserHelper.GetUserId(User);
        var result = await _expertService.GetExpertProfileAsync(userId);
        return Ok(result);
    }

    [HttpPut("me")]
    [Authorize(Roles = "Expert")] // Only experts
    public async Task<ActionResult<ExpertProfileDto>> UpdateMe(UpdateExpertRequestDto request)
    {
        var userId = Common.UserHelper.GetUserId(User);
        var result = await _expertService.UpdateExpertProfileAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpertPublicProfileDto>> GetById(long id)
    {
        var result = await _expertService.GetExpertByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ExpertListItemDto>>> GetExperts(
        [FromQuery] string? expertType,
        [FromQuery] string? city,
        [FromQuery] long? specializationId,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _expertService.GetExpertsAsync(expertType, city, specializationId, sort, page, pageSize);
        return Ok(result);
    }

    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")] // Only admins
    public async Task<ActionResult<PagedResult<ExpertListItemDto>>> GetAllExpertsForAdmin(
        [FromQuery] string? search,
        [FromQuery] string? expertType,
        [FromQuery] string? city,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _expertService.GetAllExpertsForAdminAsync(search, expertType, city, isActive, page, pageSize);
        return Ok(result);
    }

    [HttpPut("me/specializations")]
    [Authorize(Roles = "Expert")] // Only experts
    public async Task<ActionResult> SetSpecializations(SetSpecializationsRequestDto request)
    {
        var userId = Common.UserHelper.GetUserId(User);
        await _expertService.SetSpecializationsAsync(userId, request.SpecializationIds);
        return Ok(new { expertId = Common.UserHelper.GetExpertId(User), specializationIds = request.SpecializationIds });
    }

    [HttpPut("{id}/approve")]
    // // [Authorize(Roles = "...")] // Temporarily disabled // Temporarily removed
    public async Task<ActionResult<ExpertProfileDto>> Approve(long id, ApproveExpertRequestDto request)
    {
        var result = await _expertService.ApproveExpertAsync(id, request.AdminNote);
        return Ok(result);
    }

    [HttpPut("{id}/reject")]
    // // [Authorize(Roles = "...")] // Temporarily disabled // Temporarily removed
    public async Task<ActionResult<ExpertProfileDto>> Reject(long id, RejectExpertRequestDto request)
    {
        var result = await _expertService.RejectExpertAsync(id, request.AdminNote);
        return Ok(result);
    }

    /// <summary>
    /// Get expert's available time slots for appointment booking
    /// </summary>
    [HttpGet("{id}/availability")]
    public async Task<ActionResult<AvailabilityDto>> GetAvailability(
        long id,
        [FromQuery] string date)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
        {
            return BadRequest("Invalid date format. Use YYYY-MM-DD");
        }

        var result = await _expertService.GetAvailabilityAsync(id, parsedDate);
        return Ok(result);
    }

    /// <summary>
    /// Admin: Update expert details
    /// </summary>
    [HttpPut("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AdminUpdateExpert(long id, AdminExpertUpdateDto request)
    {
        var expert = await _db.Experts
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expert == null)
            return NotFound();

        if (request.DisplayName != null) expert.DisplayName = request.DisplayName;
        if (request.Bio != null) expert.Bio = request.Bio;
        if (request.City != null) expert.City = request.City;
        if (request.ExpertType.HasValue) expert.ExpertType = (ExpertType)request.ExpertType.Value;
        if (request.WorkType.HasValue) expert.WorkType = (WorkType)request.WorkType.Value;
        if (request.Status.HasValue) expert.Status = (ExpertStatus)request.Status.Value;
        if (request.ExperienceStartDate.HasValue) expert.ExperienceStartDate = request.ExperienceStartDate.Value;
        if (request.IsActive.HasValue) expert.IsActive = request.IsActive.Value;

        expert.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            expert.Id,
            expert.UserId,
            expert.DisplayName,
            Email = expert.User.Email,
            ExpertType = expert.ExpertType.ToString(),
            Status = expert.Status.ToString(),
            expert.Bio,
            expert.City,
            WorkType = expert.WorkType?.ToString(),
            expert.ExperienceStartDate,
            expert.IsActive,
            expert.CreatedAt,
            expert.UpdatedAt
        });
    }

    /// <summary>
    /// Admin: Toggle expert active status
    /// </summary>
    [HttpPut("admin/{id}/toggle-active")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AdminToggleExpertActive(long id)
    {
        var expert = await _db.Experts.FindAsync(id);
        if (expert == null) return NotFound();

        expert.IsActive = !expert.IsActive;
        expert.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { expert.Id, expert.IsActive });
    }
}

