using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Payment;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Initiate payment
    /// </summary>
    [HttpPost("initiate")]
    // [Authorize] // Temporarily disabled
    public async Task<ActionResult<InitiatePaymentResponse>> Initiate([FromBody] InitiatePaymentRequest request)
    {
        var userId = User.GetUserId();
        var response = await _paymentService.InitiatePaymentAsync(userId, request);
        return Ok(response);
    }

    /// <summary>
    /// Payment gateway callback (no auth required)
    /// </summary>
    [HttpPost("callback")]
    public async Task<ActionResult<PaymentDto>> Callback([FromBody] PaymentCallbackRequest request)
    {
        var payment = await _paymentService.HandleCallbackAsync(request);
        return Ok(payment);
    }

    /// <summary>
    /// Get my payment history
    /// </summary>
    [HttpGet("me")]
    // [Authorize] // Temporarily disabled
    public async Task<ActionResult<List<PaymentDto>>> GetMyPayments()
    {
        var userId = User.GetUserId();
        var payments = await _paymentService.GetMyPaymentsAsync(userId);
        return Ok(payments);
    }

    /// <summary>
    /// Get payment by ID
    /// </summary>
    [HttpGet("{id}")]
    // [Authorize] // Temporarily disabled
    public async Task<ActionResult<PaymentDto>> GetById(long id)
    {
        var userId = User.GetUserId();
        var payment = await _paymentService.GetPaymentByIdAsync(userId, id);
        return Ok(payment);
    }
}

