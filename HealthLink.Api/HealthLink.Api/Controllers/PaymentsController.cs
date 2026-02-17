using HealthLink.Api.Common;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Payment;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : BaseAuthenticatedController
{
    private readonly IPaymentService _paymentService;
    private readonly IIyzicoService _iyzicoService;
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public PaymentsController(
        IPaymentService paymentService,
        IIyzicoService iyzicoService,
        AppDbContext db,
        IConfiguration configuration)
    {
        _paymentService = paymentService;
        _iyzicoService = iyzicoService;
        _db = db;
        _configuration = configuration;
    }

    /// <summary>
    /// Iyzico Checkout Form callback (called by Iyzico after payment)
    /// </summary>
    [HttpPost("iyzico-callback")]
    [AllowAnonymous]
    public async Task<IActionResult> IyzicoCallback([FromForm] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new { error = "Token is required." });
        }

        // Retrieve payment result from Iyzico
        var result = await _iyzicoService.RetrieveCheckoutFormResultAsync(token);

        // Find payment by iyzico token
        var payment = await _db.Payments
            .Include(p => p.ClientPackage)
            .FirstOrDefaultAsync(p => p.IyzicoToken == token);

        if (payment == null)
        {
            // Log and redirect to failure page
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            return Redirect($"{frontendUrl}/client/payments/result?status=error&message=payment_not_found");
        }

        var frontendBaseUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";

        if (result.IsSuccess)
        {
            // Update payment
            payment.Status = PaymentStatus.Success;
            payment.GatewayPaymentId = result.PaymentId;
            payment.ProviderRawResponse = result.RawResponse;
            payment.ConfirmedAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;

            // Activate client package
            payment.ClientPackage.Status = ClientPackageStatus.Active;
            payment.ClientPackage.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Redirect($"{frontendBaseUrl}/client/payments/result?status=success&paymentId={payment.Id}");
        }
        else
        {
            // Payment failed
            payment.Status = PaymentStatus.Failed;
            payment.ProviderRawResponse = result.RawResponse;
            payment.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var errorMsg = Uri.EscapeDataString(result.ErrorMessage ?? "Ödeme başarısız");
            return Redirect($"{frontendBaseUrl}/client/payments/result?status=failed&paymentId={payment.Id}&message={errorMsg}");
        }
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
