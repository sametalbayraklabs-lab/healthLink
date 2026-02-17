using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Entities;
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

        /// <summary>
        /// Get all time slot templates (48 slots, 30-min intervals).
        /// </summary>
        public async Task<IReadOnlyList<TimeSlotTemplate>> GetAllTemplatesAsync()
        {
            return await _db.TimeSlotTemplates
                .OrderBy(t => t.SortOrder)
                .ToListAsync();
        }

        /// <summary>
        /// Get daily availability for an expert.
        /// Returns all 48 template slots with their statuses.
        /// </summary>
        public async Task<IReadOnlyList<ExpertAvailabilitySlotResponse>> GetDailyAvailabilityAsync(
            long expertId,
            DateOnly date)
        {
            var expertExists = await _db.Experts
                .AnyAsync(x => x.Id == expertId && x.IsActive);

            if (!expertExists)
                throw new InvalidOperationException("Expert not found");

            // Load all 48 templates
            var templates = await _db.TimeSlotTemplates
                .OrderBy(t => t.SortOrder)
                .ToListAsync();

            // Exceptions for this day
            var exceptions = await _db.ExpertScheduleExceptions
                .Where(x => x.ExpertId == expertId && x.Date == date)
                .ToListAsync();

            // Holiday = full day off
            var fullDayOff = exceptions.Any(e => e.Type == ScheduleExceptionType.Holiday);
            if (fullDayOff)
            {
                // Return all slots as ExceptionClosed
                return templates.Select(t => new ExpertAvailabilitySlotResponse
                {
                    TimeSlotTemplateId = t.Id,
                    StartTime = t.StartTime.ToString("HH:mm"),
                    EndTime = t.EndTime.ToString("HH:mm"),
                    Status = SlotStatus.ExceptionClosed
                }).ToArray();
            }

            // Saved availability slots from DB (only Available, Booked, ExceptionClosed exist in table)
            var savedSlots = await _db.ExpertAvailabilitySlots
                .Where(x => x.ExpertId == expertId && x.Date == date)
                .ToListAsync();

            // Existing appointments for cross-check
            var dateTime = DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            var appointments = await _db.Appointments
                .Where(x =>
                    x.ExpertId == expertId &&
                    x.StartDateTime.Date == dateTime.Date &&
                    x.Status == AppointmentStatus.Scheduled)
                .ToListAsync();

            var result = new List<ExpertAvailabilitySlotResponse>();

            foreach (var template in templates)
            {
                // Check if blocked by partial exception
                var blockedByException = exceptions.Any(e =>
                    (e.Type == ScheduleExceptionType.PartialClose ||
                     e.Type == ScheduleExceptionType.CustomBlock) &&
                    e.StartTime.HasValue && e.EndTime.HasValue &&
                    template.StartTime < e.EndTime.Value &&
                    template.EndTime > e.StartTime.Value);

                // Check if blocked by appointment
                var slotStartDt = date.ToDateTime(template.StartTime);
                var slotEndDt = date.ToDateTime(template.EndTime);
                var blockedByAppointment = appointments.Any(a =>
                    a.StartDateTime < DateTime.SpecifyKind(slotEndDt, DateTimeKind.Utc) &&
                    a.EndDateTime > DateTime.SpecifyKind(slotStartDt, DateTimeKind.Utc));

                SlotStatus status;

                if (blockedByAppointment)
                {
                    status = SlotStatus.Booked;
                }
                else if (blockedByException)
                {
                    status = SlotStatus.ExceptionClosed;
                }
                else
                {
                    // Check DB — record exists = that status, no record = Closed
                    var savedSlot = savedSlots.FirstOrDefault(s =>
                        s.TimeSlotTemplateId == template.Id);

                    status = savedSlot?.Status ?? SlotStatus.Closed;
                }

                result.Add(new ExpertAvailabilitySlotResponse
                {
                    TimeSlotTemplateId = template.Id,
                    StartTime = template.StartTime.ToString("HH:mm"),
                    EndTime = template.EndTime.ToString("HH:mm"),
                    Status = status
                });
            }

            return result;
        }

        /// <summary>
        /// Save daily availability slots for an expert.
        /// Available slots → INSERT/UPDATE in DB.
        /// Closed slots → DELETE from DB (no record = closed).
        /// Booked/ExceptionClosed → untouched.
        /// </summary>
        public async Task SaveDailyAvailabilityAsync(
            long expertId,
            DateOnly date,
            List<SaveSlotRequest> slots)
        {
            // Get existing slots for this day
            var existingSlots = await _db.ExpertAvailabilitySlots
                .Where(x =>
                    x.ExpertId == expertId &&
                    x.Date == date)
                .ToListAsync();

            foreach (var slotReq in slots)
            {
                var existing = existingSlots.FirstOrDefault(s =>
                    s.TimeSlotTemplateId == slotReq.TimeSlotTemplateId);

                if (slotReq.Status == SlotStatus.Available)
                {
                    if (existing != null)
                    {
                        // Update to Available
                        existing.Status = SlotStatus.Available;
                        existing.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        // Find template to get SlotTime
                        var template = await _db.TimeSlotTemplates
                            .FindAsync(slotReq.TimeSlotTemplateId);

                        // Create Available record
                        _db.ExpertAvailabilitySlots.Add(new ExpertAvailabilitySlot
                        {
                            ExpertId = expertId,
                            Date = date,
                            TimeSlotTemplateId = slotReq.TimeSlotTemplateId,
                            SlotTime = template?.StartTime.ToString("HH:mm") ?? "",
                            Status = SlotStatus.Available,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                else if (slotReq.Status == SlotStatus.Closed)
                {
                    if (existing != null && existing.Status != SlotStatus.Booked
                                         && existing.Status != SlotStatus.ExceptionClosed)
                    {
                        // Delete the record (no record = closed)
                        _db.ExpertAvailabilitySlots.Remove(existing);
                    }
                }
                // Booked and ExceptionClosed are not modified
            }

            await _db.SaveChangesAsync();
        }
    }

    public class SaveSlotRequest
    {
        public int TimeSlotTemplateId { get; set; }
        public SlotStatus Status { get; set; }
    }

    public class SaveDailyAvailabilityRequest
    {
        public DateOnly Date { get; set; }
        public List<SaveSlotRequest> Slots { get; set; } = new();
    }
}
