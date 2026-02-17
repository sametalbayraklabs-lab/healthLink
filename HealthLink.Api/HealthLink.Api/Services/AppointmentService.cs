using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Appointments;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class AppointmentService : IAppointmentService
{
    private readonly AppDbContext _db;

    public AppointmentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AppointmentResponse> CreateAsync(
        long clientUserId,
        CreateAppointmentRequest request)
    {
        // Normalize DateTimes - PostgreSQL timestamptz requires UTC kind
        // Frontend sends local wall-clock time without timezone suffix (Kind=Unspecified)
        if (request.StartDateTime.Kind == DateTimeKind.Unspecified)
            request.StartDateTime = DateTime.SpecifyKind(request.StartDateTime, DateTimeKind.Utc);
        if (request.EndDateTime.Kind == DateTimeKind.Unspecified)
            request.EndDateTime = DateTime.SpecifyKind(request.EndDateTime, DateTimeKind.Utc);
        // 1. Client
        var client = await _db.Clients
            .FirstOrDefaultAsync(x => x.UserId == clientUserId);

        if (client == null)
            throw new BusinessException(
                ErrorCodes.ClientPackageRequired,
                "Client not found.");

        // 2. ServiceType parse
        if (!Enum.TryParse<ServiceType>(
                request.ServiceType,
                true,
                out var serviceType))
        {
            throw new BusinessException(
                ErrorCodes.InvalidServiceType,
                "Invalid service type.");
        }

        // 3. ClientPackage (zorunlu)
        var package = await _db.ClientPackages
            .FirstOrDefaultAsync(x =>
                x.Id == request.ClientPackageId &&
                x.ClientId == client.Id &&
                x.Status == ClientPackageStatus.Active &&
                (x.ExpireDate == null || x.ExpireDate >= DateTime.UtcNow));

        if (package == null)
            throw new BusinessException(
                ErrorCodes.ClientPackageNotActive,
                "Client package is not active.");

        // Check remaining sessions
        if (package.UsedSessions >= package.TotalSessions)
            throw new BusinessException(
                ErrorCodes.ClientPackageRequired,
                "Bu pakette kalan seans hakkınız bulunmamaktadır.");

        // 4. Client takvim overlap
        var clientOverlap = await _db.Appointments.AnyAsync(x =>
            x.ClientId == client.Id &&
            x.Status == AppointmentStatus.Scheduled &&
            x.StartDateTime < request.EndDateTime &&
            x.EndDateTime > request.StartDateTime);

        if (clientOverlap)
            throw new BusinessException(
                ErrorCodes.AppointmentTimeNotAvailable,
                "Selected time slot is not available.");

        // 5. Expert takvim overlap
        var expertOverlap = await _db.Appointments.AnyAsync(x =>
            x.ExpertId == request.ExpertId &&
            x.Status == AppointmentStatus.Scheduled &&
            x.StartDateTime < request.EndDateTime &&
            x.EndDateTime > request.StartDateTime);

        if (expertOverlap)
            throw new BusinessException(
                ErrorCodes.AppointmentTimeNotAvailable,
                "Selected time slot is not available.");

        // 6. Appointment create
        var appointment = new Appointment
        {
            ClientId = client.Id,
            ExpertId = request.ExpertId,
            ClientPackageId = package.Id,
            ServiceType = serviceType,
            Status = AppointmentStatus.Scheduled,
            StartDateTime = request.StartDateTime,
            EndDateTime = request.EndDateTime,
            CreatedAt = DateTime.UtcNow
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        return new AppointmentResponse
        {
            Id = appointment.Id,
            ClientId = appointment.ClientId,
            ExpertId = appointment.ExpertId,
            ServiceType = appointment.ServiceType.ToApiString(),
            Status = appointment.Status.ToApiString(),
            StartDateTime = appointment.StartDateTime,
            EndDateTime = appointment.EndDateTime
        };
    }

    public async Task CancelAsync(long userId, long appointmentId)
    {
        var appt = await _db.Appointments
            .Include(x => x.ClientPackage)
            .FirstOrDefaultAsync(x => x.Id == appointmentId);

        if (appt == null)
            throw new BusinessException(ErrorCodes.AppointmentNotFound, "Appointment not found.");

        if (appt.Status != AppointmentStatus.Scheduled)
            throw new BusinessException(ErrorCodes.AppointmentNotCancelable, "Appointment cannot be cancelled.");

        var isClient = await _db.Clients.AnyAsync(c => c.UserId == userId && c.Id == appt.ClientId);
        var isExpert = await _db.Experts.AnyAsync(e => e.UserId == userId && e.Id == appt.ExpertId);

        if (!isClient && !isExpert)
            throw new BusinessException(ErrorCodes.AppointmentNotCancelable, "Unauthorized.");

        var cancelLimitHours = int.Parse(
            (await _db.SystemSettings.FirstAsync(x => x.Key == "Session.CancelLimitHours")).Value);

        var hoursDiff = (appt.StartDateTime - DateTime.UtcNow).TotalHours;

        if (hoursDiff >= cancelLimitHours && appt.ClientPackage != null)
        {
            appt.ClientPackage.UsedSessions =
                Math.Max(0, appt.ClientPackage.UsedSessions - 1);
        }

        appt.Status = isClient
            ? AppointmentStatus.CancelledByClient
            : AppointmentStatus.CancelledByExpert;

        await _db.SaveChangesAsync();
    }

    public async Task MarkIncompleteAsync(long expertUserId, long appointmentId)
    {
        var appt = await _db.Appointments.FirstOrDefaultAsync(x => x.Id == appointmentId);

        if (appt == null || appt.Status != AppointmentStatus.Scheduled)
            throw new BusinessException(
                ErrorCodes.AppointmentNotMarkableIncomplete,
                "Cannot mark incomplete.");

        var isExpert = await _db.Experts.AnyAsync(e => e.UserId == expertUserId && e.Id == appt.ExpertId);
        if (!isExpert)
            throw new BusinessException(
                ErrorCodes.AppointmentNotMarkableIncomplete,
                "Only expert can mark incomplete.");

        appt.Status = AppointmentStatus.Incomplete;
        await _db.SaveChangesAsync();
    }

    public async Task CompleteAsync(long expertUserId, long appointmentId)
    {
        var appt = await _db.Appointments
            .Include(x => x.ClientPackage)
            .FirstOrDefaultAsync(x => x.Id == appointmentId);

        if (appt == null || appt.Status != AppointmentStatus.Scheduled)
            throw new BusinessException(
                ErrorCodes.AppointmentNotMarkableIncomplete,
                "Cannot mark complete.");

        var isExpert = await _db.Experts.AnyAsync(e => e.UserId == expertUserId && e.Id == appt.ExpertId);
        if (!isExpert)
            throw new BusinessException(
                ErrorCodes.AppointmentNotMarkableIncomplete,
                "Only expert can mark complete.");

        appt.Status = AppointmentStatus.Completed;
        
        // Increase used session count
        if (appt.ClientPackage != null)
        {
            appt.ClientPackage.UsedSessions++;
        }

        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<AppointmentResponse>> GetClientAppointmentsAsync(long clientUserId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == clientUserId);
        if (client == null)
            throw new BusinessException(ErrorCodes.ClientPackageRequired, "Client not found.");

        return await _db.Appointments
            .Include(x => x.Expert)
            .Where(x => x.ClientId == client.Id)
            .OrderByDescending(x => x.StartDateTime)
            .Select(x => new AppointmentResponse
            {
                Id = x.Id,
                ClientId = x.ClientId,
                ExpertId = x.ExpertId,
                ExpertName = x.Expert.DisplayName,
                ExpertTitle = x.Expert.ExpertType.ToApiString(),
                ServiceType = x.ServiceType.ToApiString(),
                Status = x.Status.ToApiString(),
                StartDateTime = x.StartDateTime,
                EndDateTime = x.EndDateTime,
                MeetingUrl = x.MeetingUrl,
                HasReview = _db.Reviews.Any(r => r.AppointmentId == x.Id),
                ReviewId = _db.Reviews.Where(r => r.AppointmentId == x.Id).Select(r => (long?)r.Id).FirstOrDefault()
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<AppointmentResponse>> GetExpertAppointmentsAsync(long expertUserId)
    {
        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == expertUserId);
        if (expert == null)
            throw new BusinessException(ErrorCodes.ClientPackageRequired, "Expert not found.");

        var rawAppointments = await _db.Appointments
            .Include(x => x.Client)
            .Where(x => x.ExpertId == expert.Id)
            .OrderByDescending(x => x.StartDateTime)
            .ToListAsync();

        return rawAppointments.Select(x => new AppointmentResponse
        {
            Id = x.Id,
            ClientId = x.ClientId,
            ExpertId = x.ExpertId,
            ClientName = $"{x.Client.FirstName} {x.Client.LastName}",
            ServiceType = x.ServiceType.ToApiString(),
            Status = x.Status.ToApiString(),
            StartDateTime = x.StartDateTime,
            EndDateTime = x.EndDateTime
        }).ToList();
    }

    public async Task<IReadOnlyList<MyExpertDto>> GetMyExpertsAsync(long clientUserId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == clientUserId);
        if (client == null)
            throw new BusinessException(ErrorCodes.ClientPackageRequired, "Client not found.");

        var favoriteExpertIds = await _db.FavoriteExperts
            .Where(f => f.ClientId == client.Id)
            .Select(f => f.ExpertId)
            .ToListAsync();

        var myExperts = await _db.Appointments
            .Include(x => x.Expert)
            .Where(x => x.ClientId == client.Id && x.Status == Entities.Enums.AppointmentStatus.Completed)
            .GroupBy(x => x.ExpertId)
            .Select(g => new MyExpertDto
            {
                ExpertId = g.Key,
                DisplayName = g.First().Expert.DisplayName,
                ExpertType = g.First().Expert.ExpertType.ToApiString(),
                ProfilePhotoUrl = g.First().Expert.ProfilePhotoUrl,
                AverageRating = g.First().Expert.AverageRating,
                TotalReviewCount = g.First().Expert.TotalReviewCount,
                TotalSessions = g.Count(),
                LastSessionDate = g.Max(a => a.StartDateTime),
                IsFavorite = favoriteExpertIds.Contains(g.Key)
            })
            .OrderByDescending(x => x.LastSessionDate)
            .ToListAsync();

        // Also include favorite experts that don't have completed appointments
        var expertIdsInList = myExperts.Select(e => e.ExpertId).ToHashSet();
        var favOnlyExperts = await _db.FavoriteExperts
            .Include(f => f.Expert)
            .Where(f => f.ClientId == client.Id && !expertIdsInList.Contains(f.ExpertId))
            .Select(f => new MyExpertDto
            {
                ExpertId = f.ExpertId,
                DisplayName = f.Expert.DisplayName,
                ExpertType = f.Expert.ExpertType.ToApiString(),
                ProfilePhotoUrl = f.Expert.ProfilePhotoUrl,
                AverageRating = f.Expert.AverageRating,
                TotalReviewCount = f.Expert.TotalReviewCount,
                TotalSessions = 0,
                LastSessionDate = DateTime.MinValue,
                IsFavorite = true
            })
            .ToListAsync();

        return myExperts.Concat(favOnlyExperts).ToList();
    }

}


