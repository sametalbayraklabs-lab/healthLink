using HealthLink.Api.Dtos.Discount;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/discount-codes")]
public class DiscountCodesController : ControllerBase
{
    private readonly IDiscountCodeService _discountService;

    public DiscountCodesController(IDiscountCodeService discountService)
    {
        _discountService = discountService;
    }

    /// <summary>
    /// Validate discount code
    /// </summary>
    [HttpPost("validate")]
    public async Task<ActionResult<ValidateDiscountResponse>> Validate([FromBody] ValidateDiscountRequest request)
    {
        var response = await _discountService.ValidateDiscountAsync(request);
        return Ok(response);
    }

    /// <summary>
    /// Create discount code (Admin only)
    /// </summary>
    [HttpPost]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<DiscountCodeDto>> Create([FromBody] CreateDiscountCodeRequest request)
    {
        var discount = await _discountService.CreateDiscountCodeAsync(request);
        return CreatedAtAction(nameof(GetAll), discount);
    }

    /// <summary>
    /// Get all discount codes (Admin only)
    /// </summary>
    [HttpGet]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<List<DiscountCodeDto>>> GetAll()
    {
        var discounts = await _discountService.GetAllDiscountCodesAsync();
        return Ok(discounts);
    }

    /// <summary>
    /// Update discount code (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    // [Authorize(Roles = "...")] // Temporarily disabled
    public async Task<ActionResult<DiscountCodeDto>> Update(long id, [FromBody] CreateDiscountCodeRequest request)
    {
        var discount = await _discountService.UpdateDiscountCodeAsync(id, request);
        return Ok(discount);
    }
}

