using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/payments")]
[Authorize(Roles = "Admin")]
public class AdminPaymentsController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminPaymentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminPaymentListDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? gateway,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Payments
            .Include(p => p.Client)
                .ThenInclude(c => c.User)
            .Include(p => p.ClientPackage)
                .ThenInclude(cp => cp.ServicePackage)
            .AsQueryable();

        // Status filter
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<Entities.Enums.PaymentStatus>(status, out var paymentStatus))
        {
            query = query.Where(p => p.Status == paymentStatus);
        }

        // Gateway filter
        if (!string.IsNullOrWhiteSpace(gateway) && Enum.TryParse<Entities.Enums.PaymentGateway>(gateway, out var paymentGateway))
        {
            query = query.Where(p => p.Gateway == paymentGateway);
        }

        var payments = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminPaymentListDto
            {
                Id = p.Id,
                ClientId = p.ClientId,
                ClientName = p.Client.FirstName + " " + p.Client.LastName,
                ClientEmail = p.Client.User.Email,
                ClientPackageId = p.ClientPackageId,
                PackageName = p.ClientPackage.ServicePackage.Name,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                Gateway = p.Gateway,
                ConfirmedAt = p.ConfirmedAt,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Ok(payments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminPaymentDetailDto>> GetById(long id)
    {
        var payment = await _db.Payments
            .Include(p => p.Client)
                .ThenInclude(c => c.User)
            .Include(p => p.ClientPackage)
                .ThenInclude(cp => cp.ServicePackage)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            return NotFound();
        }

        var dto = new AdminPaymentDetailDto
        {
            Id = payment.Id,
            ClientId = payment.ClientId,
            ClientName = payment.Client.FirstName + " " + payment.Client.LastName,
            ClientEmail = payment.Client.User.Email,
            ClientPackageId = payment.ClientPackageId,
            PackageName = payment.ClientPackage.ServicePackage.Name,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentMethod = payment.PaymentMethod,
            Status = payment.Status,
            Gateway = payment.Gateway,
            GatewayPaymentId = payment.GatewayPaymentId,
            ProviderRawResponse = payment.ProviderRawResponse,
            ConfirmedAt = payment.ConfirmedAt,
            CreatedAt = payment.CreatedAt,
            UpdatedAt = payment.UpdatedAt
        };

        return Ok(dto);
    }
}
