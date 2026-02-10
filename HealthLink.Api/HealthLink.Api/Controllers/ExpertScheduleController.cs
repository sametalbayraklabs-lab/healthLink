using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/expert/schedule")]
[Authorize(Roles = "Expert")]
public class ExpertScheduleController : BaseAuthenticatedController
{
    private readonly AppDbContext _db;

    public ExpertScheduleController(AppDbContext db)
    {
        _db = db;
    }

    #region Schedule Templates (Weekly Recurring Hours)

    /// <summary>
    /// Get all schedule templates for current expert
    /// </summary>
    [HttpGet("templates")]
    public async Task<ActionResult<List<ScheduleTemplateDto>>> GetTemplates()
    {
        var templates = await _db.ExpertScheduleTemplates
            .Include(x => x.TimeSlots)
            .Where(x => x.ExpertId == ExpertId)
            .OrderBy(x => x.DayOfWeek)
            .ToListAsync();

        var dtos = templates.Select(t => new ScheduleTemplateDto
        {
            DayOfWeek = t.DayOfWeek,
            IsOpen = t.IsOpen,
            AutoMarkAvailable = t.AutoMarkAvailable,
            TimeSlots = t.TimeSlots.Select(ts => new TimeSlotDto
            {
                StartTime = ts.StartTime,
                EndTime = ts.EndTime
            }).ToList()
        }).ToList();

        // Ensure all 7 days are present
        for (int day = 0; day < 7; day++)
        {
            if (!dtos.Any(d => d.DayOfWeek == day))
            {
                dtos.Add(new ScheduleTemplateDto
                {
                    DayOfWeek = day,
                    IsOpen = false,
                    AutoMarkAvailable = true,
                    TimeSlots = new List<TimeSlotDto>()
                });
            }
        }

        return Ok(dtos.OrderBy(d => d.DayOfWeek).ToList());
    }

    /// <summary>
    /// Update all schedule templates (bulk update for weekly schedule)
    /// </summary>
    [HttpPut("templates")]
    public async Task<ActionResult<List<ScheduleTemplateDto>>> UpdateTemplates([FromBody] UpdateScheduleTemplatesDto request)
    {
        // Validate
        foreach (var template in request.Templates)
        {
            if (template.IsOpen && template.TimeSlots.Count == 0)
            {
                return BadRequest(new { message = $"Açık günler için en az bir zaman aralığı gereklidir (Gün: {template.DayOfWeek})" });
            }

            foreach (var slot in template.TimeSlots)
            {
                if (slot.StartTime >= slot.EndTime)
                {
                    return BadRequest(new { message = $"Bitiş saati başlangıç saatinden sonra olmalıdır (Gün: {template.DayOfWeek})" });
                }
            }
        }

        // Get existing templates with time slots
        var existing = await _db.ExpertScheduleTemplates
            .Include(x => x.TimeSlots)
            .Where(x => x.ExpertId == ExpertId)
            .ToListAsync();

        // Update or create
        foreach (var templateDto in request.Templates)
        {
            var existingTemplate = existing.FirstOrDefault(x => x.DayOfWeek == templateDto.DayOfWeek);

            if (existingTemplate != null)
            {
                // Update existing
                existingTemplate.IsOpen = templateDto.IsOpen;
                existingTemplate.AutoMarkAvailable = templateDto.AutoMarkAvailable;
                existingTemplate.UpdatedAt = DateTime.UtcNow;

                // Remove old time slots
                _db.ExpertScheduleTimeSlots.RemoveRange(existingTemplate.TimeSlots);

                // Add new time slots
                foreach (var slotDto in templateDto.TimeSlots)
                {
                    existingTemplate.TimeSlots.Add(new ExpertScheduleTimeSlot
                    {
                        StartTime = slotDto.StartTime,
                        EndTime = slotDto.EndTime,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            else
            {
                // Create new
                var newTemplate = new ExpertScheduleTemplate
                {
                    ExpertId = ExpertId!.Value,
                    DayOfWeek = templateDto.DayOfWeek,
                    IsOpen = templateDto.IsOpen,
                    AutoMarkAvailable = templateDto.AutoMarkAvailable,
                    CreatedAt = DateTime.UtcNow
                };

                foreach (var slotDto in templateDto.TimeSlots)
                {
                    newTemplate.TimeSlots.Add(new ExpertScheduleTimeSlot
                    {
                        StartTime = slotDto.StartTime,
                        EndTime = slotDto.EndTime,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                _db.ExpertScheduleTemplates.Add(newTemplate);
            }
        }

        await _db.SaveChangesAsync();

        // Return updated templates
        return await GetTemplates();
    }

    /// <summary>
    /// Update single day schedule template
    /// </summary>
    [HttpPut("templates/{dayOfWeek:int}")]
    public async Task<ActionResult<ScheduleTemplateDto>> UpdateTemplate(int dayOfWeek, [FromBody] ScheduleTemplateDto request)
    {
        if (dayOfWeek < 0 || dayOfWeek > 6)
        {
            return BadRequest(new { message = "Geçersiz gün (0-6 arası olmalı)" });
        }

        if (request.IsOpen && request.TimeSlots.Count == 0)
        {
            return BadRequest(new { message = "Açık günler için en az bir zaman aralığı gereklidir" });
        }

        foreach (var slot in request.TimeSlots)
        {
            if (slot.StartTime >= slot.EndTime)
            {
                return BadRequest(new { message = "Bitiş saati başlangıç saatinden sonra olmalıdır" });
            }
        }

        var template = await _db.ExpertScheduleTemplates
            .Include(x => x.TimeSlots)
            .FirstOrDefaultAsync(x => x.ExpertId == ExpertId && x.DayOfWeek == dayOfWeek);

        if (template != null)
        {
            // Update existing
            template.IsOpen = request.IsOpen;
            template.AutoMarkAvailable = request.AutoMarkAvailable;
            template.UpdatedAt = DateTime.UtcNow;

            // Remove old time slots
            _db.ExpertScheduleTimeSlots.RemoveRange(template.TimeSlots);

            // Add new time slots
            foreach (var slotDto in request.TimeSlots)
            {
                template.TimeSlots.Add(new ExpertScheduleTimeSlot
                {
                    StartTime = slotDto.StartTime,
                    EndTime = slotDto.EndTime,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
        else
        {
            // Create new
            template = new ExpertScheduleTemplate
            {
                ExpertId = ExpertId!.Value,
                DayOfWeek = dayOfWeek,
                IsOpen = request.IsOpen,
                AutoMarkAvailable = request.AutoMarkAvailable,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var slotDto in request.TimeSlots)
            {
                template.TimeSlots.Add(new ExpertScheduleTimeSlot
                {
                    StartTime = slotDto.StartTime,
                    EndTime = slotDto.EndTime,
                    CreatedAt = DateTime.UtcNow
                });
            }

            _db.ExpertScheduleTemplates.Add(template);
        }

        await _db.SaveChangesAsync();

        return Ok(new ScheduleTemplateDto
        {
            DayOfWeek = template.DayOfWeek,
            IsOpen = template.IsOpen,
            AutoMarkAvailable = template.AutoMarkAvailable,
            TimeSlots = template.TimeSlots.Select(ts => new TimeSlotDto
            {
                StartTime = ts.StartTime,
                EndTime = ts.EndTime
            }).ToList()
        });
    }

    /// <summary>
    /// Apply template changes to calendar for specified date range
    /// </summary>
    [HttpPost("templates/apply")]
    public async Task<ActionResult> ApplyTemplateToCalendar([FromBody] ApplyTemplateToCalendarRequest request)
    {
        if (request.StartDate > request.EndDate)
        {
            return BadRequest(new { message = "Başlangıç tarihi bitiş tarihinden önce olmalıdır" });
        }

        // Get all templates with AutoMarkAvailable = true
        var templates = await _db.ExpertScheduleTemplates
            .Include(x => x.TimeSlots)
            .Where(x => x.ExpertId == ExpertId && x.IsOpen && x.AutoMarkAvailable)
            .ToListAsync();

        if (!templates.Any())
        {
            return BadRequest(new { message = "Otomatik müsait işaretle aktif olan gün bulunamadı" });
        }

        // Get session duration
        var durationMinutes = await _db.SystemSettings
            .Where(x => x.Key == "Session.DefaultDurationMinutes")
            .Select(x => int.Parse(x.Value))
            .FirstAsync();

        int slotsCreated = 0;
        var currentDate = DateOnly.FromDateTime(request.StartDate);
        var endDate = DateOnly.FromDateTime(request.EndDate);

        while (currentDate <= endDate)
        {
            var dayOfWeek = (int)currentDate.DayOfWeek;
            var template = templates.FirstOrDefault(t => t.DayOfWeek == dayOfWeek);

            if (template != null)
            {
                // Get existing appointments for this day
                var dateTimeUtc = DateTime.SpecifyKind(currentDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
                var appointments = await _db.Appointments
                    .Where(x =>
                        x.ExpertId == ExpertId &&
                        x.StartDateTime.Date == dateTimeUtc.Date &&
                        x.Status == Entities.Enums.AppointmentStatus.Scheduled)
                    .ToListAsync();

                // Generate slots for each time range in template
                foreach (var timeSlot in template.TimeSlots.OrderBy(ts => ts.StartTime))
                {
                    var dayStart = DateTime.SpecifyKind(currentDate.ToDateTime(timeSlot.StartTime), DateTimeKind.Utc);
                    var dayEnd = DateTime.SpecifyKind(currentDate.ToDateTime(timeSlot.EndTime), DateTimeKind.Utc);
                    var cursor = dayStart;

                    while (cursor.AddMinutes(durationMinutes) <= dayEnd)
                    {
                        var slotEnd = cursor.AddMinutes(durationMinutes);

                        // Check if slot overlaps with existing appointment
                        var hasAppointment = appointments.Any(a =>
                            a.StartDateTime < slotEnd &&
                            a.EndDateTime > cursor);

                        if (!hasAppointment)
                        {
                            // Check if slot already exists
                            var existingSlot = await _db.ExpertAvailabilitySlots
                                .FirstOrDefaultAsync(s =>
                                    s.ExpertId == ExpertId &&
                                    s.StartDateTime == cursor &&
                                    s.EndDateTime == slotEnd);

                            if (existingSlot == null)
                            {
                                // Create new availability slot
                                _db.ExpertAvailabilitySlots.Add(new ExpertAvailabilitySlot
                                {
                                    ExpertId = ExpertId!.Value,
                                    StartDateTime = cursor,
                                    EndDateTime = slotEnd,
                                    Status = SlotStatus.Available,
                                    CreatedAt = DateTime.UtcNow
                                });
                                slotsCreated++;
                            }
                        }

                        cursor = slotEnd;
                    }
                }
            }

            currentDate = currentDate.AddDays(1);
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = $"{slotsCreated} adet müsaitlik slotu oluşturuldu", slotsCreated });
    }

    #endregion

    #region Schedule Exceptions (Time-off / Custom Hours)

    /// <summary>
    /// Get all schedule exceptions for current expert
    /// </summary>
    [HttpGet("exceptions")]
    public async Task<ActionResult<List<ScheduleExceptionDto>>> GetExceptions([FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate)
    {
        var query = _db.ExpertScheduleExceptions
            .Where(x => x.ExpertId == ExpertId);

        if (startDate.HasValue)
        {
            query = query.Where(x => x.Date >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(x => x.Date <= endDate.Value);
        }

        var exceptions = await query
            .OrderBy(x => x.Date)
            .ToListAsync();

        var dtos = exceptions.Select(e => new ScheduleExceptionDto
        {
            Id = e.Id,
            Date = e.Date,
            Type = e.Type,
            StartTime = e.StartTime,
            EndTime = e.EndTime,
            Reason = e.Reason,
            CreatedAt = e.CreatedAt
        }).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Create new schedule exception
    /// </summary>
    [HttpPost("exceptions")]
    public async Task<ActionResult<ScheduleExceptionDto>> CreateException([FromBody] CreateScheduleExceptionDto request)
    {
        // Validation
        if (request.Type == Entities.Enums.ScheduleExceptionType.PartialClose || 
            request.Type == Entities.Enums.ScheduleExceptionType.CustomBlock)
        {
            if (request.StartTime == null || request.EndTime == null)
            {
                return BadRequest(new { message = "Kısmi kapalı veya özel blok için başlangıç ve bitiş saati gereklidir" });
            }

            if (request.StartTime >= request.EndTime)
            {
                return BadRequest(new { message = "Bitiş saati başlangıç saatinden sonra olmalıdır" });
            }
        }

        // Check if exception already exists for this date
        var exists = await _db.ExpertScheduleExceptions
            .AnyAsync(x => x.ExpertId == ExpertId && x.Date == request.Date);

        if (exists)
        {
            return BadRequest(new { message = "Bu tarih için zaten bir istisna mevcut" });
        }

        var exception = new ExpertScheduleException
        {
            ExpertId = ExpertId!.Value,
            Date = request.Date,
            Type = request.Type,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow
        };

        _db.ExpertScheduleExceptions.Add(exception);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetExceptions), new ScheduleExceptionDto
        {
            Id = exception.Id,
            Date = exception.Date,
            Type = exception.Type,
            StartTime = exception.StartTime,
            EndTime = exception.EndTime,
            Reason = exception.Reason,
            CreatedAt = exception.CreatedAt
        });
    }

    /// <summary>
    /// Update schedule exception
    /// </summary>
    [HttpPut("exceptions/{id:long}")]
    public async Task<ActionResult<ScheduleExceptionDto>> UpdateException(long id, [FromBody] UpdateScheduleExceptionDto request)
    {
        var exception = await _db.ExpertScheduleExceptions
            .FirstOrDefaultAsync(x => x.Id == id && x.ExpertId == ExpertId);

        if (exception == null)
        {
            return NotFound(new { message = "İstisna bulunamadı" });
        }

        // Update fields if provided
        if (request.Date.HasValue) exception.Date = request.Date.Value;
        if (request.Type.HasValue) exception.Type = request.Type.Value;
        if (request.StartTime != null) exception.StartTime = request.StartTime;
        if (request.EndTime != null) exception.EndTime = request.EndTime;
        if (request.Reason != null) exception.Reason = request.Reason;

        // Validation
        if (exception.Type == Entities.Enums.ScheduleExceptionType.PartialClose || 
            exception.Type == Entities.Enums.ScheduleExceptionType.CustomBlock)
        {
            if (exception.StartTime == null || exception.EndTime == null)
            {
                return BadRequest(new { message = "Kısmi kapalı veya özel blok için başlangıç ve bitiş saati gereklidir" });
            }

            if (exception.StartTime >= exception.EndTime)
            {
                return BadRequest(new { message = "Bitiş saati başlangıç saatinden sonra olmalıdır" });
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new ScheduleExceptionDto
        {
            Id = exception.Id,
            Date = exception.Date,
            Type = exception.Type,
            StartTime = exception.StartTime,
            EndTime = exception.EndTime,
            Reason = exception.Reason,
            CreatedAt = exception.CreatedAt
        });
    }

    /// <summary>
    /// Delete schedule exception
    /// </summary>
    [HttpDelete("exceptions/{id:long}")]
    public async Task<ActionResult> DeleteException(long id)
    {
        var exception = await _db.ExpertScheduleExceptions
            .FirstOrDefaultAsync(x => x.Id == id && x.ExpertId == ExpertId);

        if (exception == null)
        {
            return NotFound(new { message = "İstisna bulunamadı" });
        }

        _db.ExpertScheduleExceptions.Remove(exception);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    #endregion
}
