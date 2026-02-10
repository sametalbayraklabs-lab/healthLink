using HealthLink.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public AdminDashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminDashboardStats>> GetStats()
    {
        var totalClients = await _db.Clients.CountAsync();
        var totalExperts = await _db.Experts.CountAsync();
        var totalAppointments = await _db.Appointments.CountAsync();
        var totalPayments = await _db.Payments
            .Where(p => p.Status == Entities.Enums.PaymentStatus.Success)
            .SumAsync(p => p.Amount);

        var stats = new AdminDashboardStats
        {
            TotalClients = totalClients,
            TotalExperts = totalExperts,
            TotalAppointments = totalAppointments,
            TotalPayments = totalPayments
        };

        return Ok(stats);
    }
}

public class AdminDashboardStats
{
    public int TotalClients { get; set; }
    public int TotalExperts { get; set; }
    public int TotalAppointments { get; set; }
    public decimal TotalPayments { get; set; }
}
