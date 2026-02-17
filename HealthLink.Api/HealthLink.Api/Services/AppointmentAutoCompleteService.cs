using HealthLink.Api.Data;
using HealthLink.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

/// <summary>
/// Background service that auto-completes appointments
/// stuck in InProgress status after EndDateTime + 30min.
/// Runs every 5 minutes.
/// </summary>
public class AppointmentAutoCompleteService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AppointmentAutoCompleteService> _logger;

    private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan GracePeriod = TimeSpan.FromMinutes(30);

    public AppointmentAutoCompleteService(
        IServiceScopeFactory scopeFactory,
        ILogger<AppointmentAutoCompleteService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AppointmentAutoCompleteService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await AutoCompleteStaleAppointments(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AppointmentAutoCompleteService.");
            }

            await Task.Delay(CheckInterval, stoppingToken);
        }
    }

    private async Task AutoCompleteStaleAppointments(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoff = DateTime.UtcNow - GracePeriod;

        var staleAppointments = await db.Appointments
            .Where(a => a.Status == AppointmentStatus.InProgress
                     && a.EndDateTime < cutoff)
            .ToListAsync(ct);

        if (staleAppointments.Count == 0)
            return;

        foreach (var appt in staleAppointments)
        {
            appt.Status = AppointmentStatus.Completed;
            appt.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Auto-completed {Count} stale appointments.",
            staleAppointments.Count);
    }
}
