using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Admin;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/clients")]
// [Authorize(Roles = "Admin")] // TEMP: Disabled for testing
public class AdminClientsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminClientsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminClientListDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Clients
            .Include(c => c.User)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(search) ||
                c.LastName.ToLower().Contains(search) ||
                c.User.Email.ToLower().Contains(search));
        }

        // Active filter
        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        var clients = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new AdminClientListDto
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Email = c.User.Email,
                Gender = c.Gender,
                BirthDate = c.BirthDate,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminClientDetailDto>> GetById(long id)
    {
        var client = await _db.Clients
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client == null)
        {
            return NotFound();
        }

        // Get statistics
        var totalPackages = await _db.ClientPackages
            .Where(cp => cp.ClientId == id)
            .CountAsync();

        var totalAppointments = await _db.Appointments
            .Where(a => a.ClientId == id)
            .CountAsync();

        var totalSpent = await _db.Payments
            .Where(p => p.ClientId == id && p.Status == Entities.Enums.PaymentStatus.Success)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        var dto = new AdminClientDetailDto
        {
            Id = client.Id,
            UserId = client.UserId,
            FirstName = client.FirstName,
            LastName = client.LastName,
            Email = client.User.Email,
            Gender = client.Gender,
            BirthDate = client.BirthDate,
            IsActive = client.IsActive,
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt,
            TotalPackages = totalPackages,
            TotalAppointments = totalAppointments,
            TotalSpent = totalSpent
        };

        return Ok(dto);
    }

    [HttpPut("{id}/toggle-active")]
    public async Task<ActionResult<AdminClientDetailDto>> ToggleActive(long id, ToggleClientActiveDto request)
    {
        var client = await _db.Clients
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client == null)
        {
            return NotFound();
        }

        client.IsActive = request.IsActive;
        client.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Return updated details
        return await GetById(id);
    }
}
