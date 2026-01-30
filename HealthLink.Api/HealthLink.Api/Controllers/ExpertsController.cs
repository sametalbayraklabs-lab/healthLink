using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Services.Interfaces;
using HealthLink.Api.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/experts")]
public class ExpertsController : ControllerBase
{
    private readonly IExpertService _expertService;

    public ExpertsController(IExpertService expertService)
    {
        _expertService = expertService;
    }

    [HttpGet("me")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ExpertProfileDto>> GetMe()
    {
        var userId = User.GetUserId();
        var result = await _expertService.GetExpertProfileAsync(userId);
        return Ok(result);
    }

    [HttpPut("me")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ExpertProfileDto>> UpdateMe(UpdateExpertRequestDto request)
    {
        var userId = User.GetUserId();
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
    // // [Authorize] // Temporarily disabled // Temporarily removed - will fix JWT auth later
    public async Task<ActionResult<PagedResult<ExpertListItemDto>>> GetAllExpertsForAdmin(
        [FromQuery] string? expertType,
        [FromQuery] string? city,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _expertService.GetAllExpertsForAdminAsync(expertType, city, page, pageSize);
        return Ok(result);
    }

    [HttpPut("me/specializations")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult> SetSpecializations(SetSpecializationsRequestDto request)
    {
        var userId = User.GetUserId();
        await _expertService.SetSpecializationsAsync(userId, request.SpecializationIds);
        return Ok(new { expertId = User.GetExpertId(), specializationIds = request.SpecializationIds });
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
}

