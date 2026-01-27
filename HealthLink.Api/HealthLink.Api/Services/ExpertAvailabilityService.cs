using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Services.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services
{
    public class ExpertAvailabilityService : IExpertAvailabilityService
    {
        private readonly AppDbContext _db;

        public ExpertAvailabilityService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyList<ExpertAvailabilitySlotResponse>> GetDailyAvailabilityAsync(
            long expertId,
            DateOnly date)
        {
            var expertExists = await _db.Experts
                .AnyAsync(x => x.Id == expertId && x.IsActive);

            if (!expertExists)
                throw new InvalidOperationException("Expert not found");

            var dayOfWeek = (int)date.DayOfWeek;

            var template = await _db.ExpertScheduleTemplates
                .FirstOrDefaultAsync(x =>
                    x.ExpertId == expertId &&
                    x.DayOfWeek == dayOfWeek &&
                    x.IsOpen);

            if (template == null || template.WorkStartTime == null || template.WorkEndTime == null)
                return Array.Empty<ExpertAvailabilitySlotResponse>();

            // Session duration
            var durationMinutes = await _db.SystemSettings
                .Where(x => x.Key == "Session.DefaultDurationMinutes")
                .Select(x => int.Parse(x.Value))
                .FirstAsync();

            var dayStart = date.ToDateTime(template.WorkStartTime.Value);
            var dayEnd = date.ToDateTime(template.WorkEndTime.Value);

            // Exceptions
            var exceptions = await _db.ExpertScheduleExceptions
                .Where(x => x.ExpertId == expertId && x.Date == date)
                .ToListAsync();

            // Existing appointments
            var appointments = await _db.Appointments
                .Where(x =>
                    x.ExpertId == expertId &&
                    x.StartDateTime.Date == date.ToDateTime(TimeOnly.MinValue).Date &&
                    x.Status == AppointmentStatus.Scheduled)
                .ToListAsync();

            var slots = new List<ExpertAvailabilitySlotResponse>();
            var cursor = dayStart;

            while (cursor.AddMinutes(durationMinutes) <= dayEnd)
            {
                var slotEnd = cursor.AddMinutes(durationMinutes);

                var blockedByAppointment = appointments.Any(a =>
                    a.StartDateTime < slotEnd &&
                    a.EndDateTime > cursor);

                var slotStartTime = TimeOnly.FromDateTime(cursor);
                var slotEndTime = TimeOnly.FromDateTime(slotEnd);

                var blockedByException = exceptions.Any(e =>
                    // Full-day block
                    (e.StartTime == null && e.EndTime == null)
                    ||
                    // Partial block
                    (
                        e.StartTime != null &&
                        e.EndTime != null &&
                        slotStartTime < e.EndTime &&
                        slotEndTime > e.StartTime
                    )
                );

                slots.Add(new ExpertAvailabilitySlotResponse
                {
                    StartDateTime = cursor,
                    EndDateTime = slotEnd,
                    IsAvailable = !blockedByAppointment && !blockedByException
                });

                cursor = slotEnd;
            }

            return slots;
        }
    }
}

