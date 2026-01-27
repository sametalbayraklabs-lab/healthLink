using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Complaint;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/complaints")]
// [Authorize] // Temporarily disabled
public class ComplaintsController : ControllerBase
{
    private readonly IComplaintService _complaintService;

    public ComplaintsController(IComplaintService complaintService)
    {
        _complaintService = complaintService;
    }

    /// <summary>
    /// Create a complaint
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ComplaintDto>> Create([FromBody] CreateComplaintRequest request)
    {
        var userId = User.GetUserId();
        var complaint = await _complaintService.CreateComplaintAsync(userId, request);
        return CreatedAtAction(nameof(GetMyComplaints), complaint);
    }

    /// <summary>
    /// Get my complaints
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<List<ComplaintDto>>> GetMyComplaints()
    {
        var userId = User.GetUserId();
        var complaints = await _complaintService.GetMyComplaintsAsync(userId);
        return Ok(complaints);
    }

    /// <summary>
    /// Get all complaints (Admin only)
    /// </summary>
    [HttpGet]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<List<ComplaintDto>>> GetAll()
    {
        var complaints = await _complaintService.GetAllComplaintsAsync();
        return Ok(complaints);
    }

    /// <summary>
    /// Update complaint status (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<ComplaintDto>> Update(long id, [FromBody] UpdateComplaintRequest request)
    {
        var complaint = await _complaintService.UpdateComplaintAsync(id, request);
        return Ok(complaint);
    }
}

