using HealthLink.Api.Common;
using HealthLink.Api.Dtos.Payment;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : BaseAuthenticatedController
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
    [Authorize]
    public async Task<ActionResult<InitiatePaymentResponse>> Initiate([FromBody] InitiatePaymentRequest request)
    {
        var response = await _paymentService.InitiatePaymentAsync(UserId, request);
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
    [Authorize]
    public async Task<ActionResult<List<PaymentDto>>> GetMyPayments()
    {
        var payments = await _paymentService.GetMyPaymentsAsync(UserId);
        return Ok(payments);
    }

    /// <summary>
    /// Get payment by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<PaymentDto>> GetById(long id)
    {
        var payment = await _paymentService.GetPaymentByIdAsync(UserId, id);
        return Ok(payment);
    }
}

