using HealthLink.Api.Dtos.Specialization;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/specializations")]
public class SpecializationsController : ControllerBase
{
    private readonly ISpecializationService _specializationService;

    public SpecializationsController(ISpecializationService specializationService)
    {
        _specializationService = specializationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SpecializationDto>>> GetSpecializations([FromQuery] string? expertType)
    {
        var result = await _specializationService.GetSpecializationsAsync(expertType);
        return Ok(result);
    }
}

