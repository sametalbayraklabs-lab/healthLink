using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Expert;
using HealthLink.Api.Entities;
using HealthLink.Api.Services.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services
{
    public class ExpertService : IExpertService
    {
        private readonly AppDbContext _db;

        public ExpertService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyList<ExpertListItemResponse>> GetActiveExpertsAsync()
        {
            return await _db.Experts
                .Where(x => x.IsActive)
                .Select(x => new ExpertListItemResponse
                {
                    ExpertId = x.Id,
                    FullName = x.User.Email, 
                    Status = x.Status.ToString(),
                    Specializations = x.ExpertSpecializations
                        .Select(es => es.Specialization.Name)
                        .ToList()
                })
                .ToListAsync();
        }

        public async Task<ExpertDetailResponse> GetByIdAsync(long expertId)
        {
            var expert = await _db.Experts
                .Include(x => x.ExpertSpecializations)
                    .ThenInclude(es => es.Specialization)
                .FirstOrDefaultAsync(x => x.Id == expertId && x.IsActive);

            if (expert == null)
                throw new InvalidOperationException("Expert not found");

            return new ExpertDetailResponse
            {
                ExpertId = expert.Id,
                Status = expert.Status.ToString(),
                Bio = expert.Bio,
                Specializations = expert.ExpertSpecializations
                    .Select(es => es.Specialization.Name)
                    .ToList()
            };
        }

        // API-1 Methods
        public async Task<ExpertProfileDto> GetExpertProfileAsync(long userId)
        {
            var expert = await _db.Experts
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (expert == null)
            {
                throw new Common.BusinessException(
                    ErrorCodes.EXPERT_NOT_FOUND,
                    "Uzman bulunamadı.",
                    404
                );
            }

            return new ExpertProfileDto
            {
                Id = expert.Id,
                UserId = expert.UserId,
                ExpertType = expert.ExpertType.ToApiString(),
                DisplayName = expert.DisplayName,
                Bio = expert.Bio,
                City = expert.City,
                WorkType = expert.WorkType.ToApiString(),
                ExperienceStartDate = expert.ExperienceStartDate,
                Status = expert.Status.ToApiString(),
                AverageRating = expert.AverageRating,
                TotalReviewCount = expert.TotalReviewCount,
                CreatedAt = expert.CreatedAt,
                UpdatedAt = expert.UpdatedAt
            };
        }

        public async Task<ExpertProfileDto> UpdateExpertProfileAsync(long userId, UpdateExpertRequestDto request)
        {
            var expert = await _db.Experts
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (expert == null)
            {
                throw new Common.BusinessException(
                    ErrorCodes.EXPERT_NOT_FOUND,
                    "Uzman bulunamadı.",
                    404
                );
            }

            expert.DisplayName = request.DisplayName;
            expert.Bio = request.Bio;
            expert.City = request.City;
            expert.WorkType = Common.EnumExtensions.ParseWorkType(request.WorkType);
            expert.ExperienceStartDate = request.ExperienceStartDate;
            expert.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return await GetExpertProfileAsync(userId);
        }

        public async Task<ExpertPublicProfileDto> GetExpertByIdAsync(long expertId)
        {
            var expert = await _db.Experts
                .Include(x => x.ExpertSpecializations)
                    .ThenInclude(es => es.Specialization)
                .FirstOrDefaultAsync(x => x.Id == expertId);

            if (expert == null)
            {
                throw new Common.BusinessException(
                    ErrorCodes.EXPERT_NOT_FOUND,
                    "Uzman bulunamadı.",
                    404
                );
            }

            return new ExpertPublicProfileDto
            {
                Id = expert.Id,
                ExpertType = expert.ExpertType.ToApiString(),
                DisplayName = expert.DisplayName,
                Bio = expert.Bio,
                City = expert.City,
                WorkType = expert.WorkType.ToApiString(),
                ExperienceStartDate = expert.ExperienceStartDate,
                AverageRating = expert.AverageRating,
                TotalReviewCount = expert.TotalReviewCount,
                Specializations = expert.ExpertSpecializations
                    .Select(es => new SpecializationItemDto
                    {
                        Id = es.SpecializationId,
                        Name = es.Specialization.Name
                    })
                    .ToList()
            };
        }

        public async Task<Common.PagedResult<ExpertListItemDto>> GetExpertsAsync(
            string? expertType,
            string? city,
            long? specializationId,
            string? sort,
            int page = 1,
            int pageSize = 20)
        {
            var query = _db.Experts
                .Include(x => x.ExpertSpecializations)
                    .ThenInclude(es => es.Specialization)
                .Where(x => x.Status == Entities.Enums.ExpertStatus.Approved && x.IsActive);

            // Filter by expertType
            if (!string.IsNullOrWhiteSpace(expertType))
            {
                var parsedType = Common.EnumExtensions.ParseExpertType(expertType);
                query = query.Where(x => x.ExpertType == parsedType);
            }

            // Filter by city
            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(x => x.City == city);
            }

            // Filter by specialization
            if (specializationId.HasValue)
            {
                query = query.Where(x => x.ExpertSpecializations.Any(es => es.SpecializationId == specializationId.Value));
            }

            // Sorting
            query = sort?.ToLower() switch
            {
                "rating-desc" => query.OrderByDescending(x => x.AverageRating),
                "experience-desc" => query.OrderBy(x => x.ExperienceStartDate),
                _ => query.OrderByDescending(x => x.AverageRating) // default
            };

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ExpertListItemDto
                {
                    Id = x.Id,
                    ExpertType = x.ExpertType.ToApiString(),
                    DisplayName = x.DisplayName,
                    City = x.City,
                    WorkType = x.WorkType.ToApiString(),
                    AverageRating = x.AverageRating,
                    TotalReviewCount = x.TotalReviewCount,
                    Specializations = x.ExpertSpecializations
                        .Select(es => es.Specialization.Name)
                        .ToList()
                })
                .ToListAsync();

            return new Common.PagedResult<ExpertListItemDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<Common.PagedResult<ExpertListItemDto>> GetAllExpertsForAdminAsync(
            string? expertType,
            string? city,
            int page = 1,
            int pageSize = 50)
        {
            var query = _db.Experts
                .Include(x => x.User)
                .Include(x => x.ExpertSpecializations)
                    .ThenInclude(es => es.Specialization)
                .Where(x => x.IsActive);

            // Filter by expertType
            if (!string.IsNullOrWhiteSpace(expertType))
            {
                var parsedType = Common.EnumExtensions.ParseExpertType(expertType);
                query = query.Where(x => x.ExpertType == parsedType);
            }

            // Filter by city
            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(x => x.City == city);
            }

            // Order by creation date (newest first)
            query = query.OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ExpertListItemDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    Email = x.User.Email,
                    ExpertType = x.ExpertType.ToApiString(),
                    DisplayName = x.DisplayName,
                    City = x.City,
                    WorkType = x.WorkType.ToApiString(),
                    IsApproved = x.Status == Entities.Enums.ExpertStatus.Approved,
                    Status = x.Status.ToApiString(),
                    ExperienceStartDate = x.ExperienceStartDate,
                    AverageRating = x.AverageRating,
                    TotalReviewCount = x.TotalReviewCount,
                    CreatedAt = x.CreatedAt,
                    Specializations = x.ExpertSpecializations
                        .Select(es => es.Specialization.Name)
                        .ToList()
                })
                .ToListAsync();

            return new Common.PagedResult<ExpertListItemDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task SetSpecializationsAsync(long userId, List<long> specializationIds)
        {
            var expert = await _db.Experts
                .Include(x => x.ExpertSpecializations)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (expert == null)
            {
                throw new Common.BusinessException(
                    ErrorCodes.EXPERT_NOT_FOUND,
                    "Uzman bulunamadı.",
                    404
                );
            }

            // Verify all specialization IDs exist
            var existingSpecializations = await _db.Specializations
                .Where(s => specializationIds.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            if (existingSpecializations.Count != specializationIds.Count)
            {
                throw new Common.BusinessException(
                    ErrorCodes.INVALID_SPECIALIZATION_IDS,
                    "Geçersiz uzmanlık alanı ID'leri.",
                    400
                );
            }

            // Remove existing specializations
            _db.ExpertSpecializations.RemoveRange(expert.ExpertSpecializations);

            // Add new specializations
            foreach (var specId in specializationIds)
            {
                expert.ExpertSpecializations.Add(new Entities.ExpertSpecialization
                {
                    ExpertId = expert.Id,
                    SpecializationId = specId
                });
            }

            await _db.SaveChangesAsync();
        }

        public async Task<ExpertProfileDto> ApproveExpertAsync(long expertId, string? adminNote)
        {
            var expert = await _db.Experts.FindAsync(expertId);

            if (expert == null)
            {
                throw new Common.BusinessException(
                    ErrorCodes.EXPERT_NOT_FOUND,
                    "Uzman bulunamadı.",
                    404
                );
            }

            expert.Status = Entities.Enums.ExpertStatus.Approved;
            expert.UpdatedAt = DateTime.UtcNow;

            // TODO: Store adminNote in a separate AdminAction table if needed

            await _db.SaveChangesAsync();

            return await GetExpertProfileAsync(expert.UserId);
        }

        public async Task<ExpertProfileDto> RejectExpertAsync(long expertId, string? adminNote)
        {
            var expert = await _db.Experts.FindAsync(expertId);

            if (expert == null)
            {
                throw new Common.BusinessException(
                    ErrorCodes.EXPERT_NOT_FOUND,
                    "Uzman bulunamadı.",
                    404
                );
            }

            expert.Status = Entities.Enums.ExpertStatus.Rejected;
            expert.UpdatedAt = DateTime.UtcNow;

            // TODO: Store adminNote in a separate AdminAction table if needed

            await _db.SaveChangesAsync();

            return await GetExpertProfileAsync(expert.UserId);
        }

        public async Task<AvailabilityDto> GetAvailabilityAsync(long expertId, DateOnly date)
        {
            // Get expert's schedule template for the day
            var dayOfWeek = (int)date.DayOfWeek;
            var template = await _db.ExpertScheduleTemplates
                .FirstOrDefaultAsync(x => x.ExpertId == expertId && x.DayOfWeek == dayOfWeek);

            if (template == null || !template.IsOpen)
            {
                return new AvailabilityDto
                {
                    ExpertId = expertId,
                    Date = date,
                    AvailableSlots = new List<TimeSlotDto>()
                };
            }

            // Get existing appointments for the date
            var startOfDay = date.ToDateTime(TimeOnly.MinValue);
            var endOfDay = date.ToDateTime(TimeOnly.MaxValue);
            
            var existingAppointments = await _db.Appointments
                .Where(x => x.ExpertId == expertId 
                    && x.StartDateTime >= startOfDay 
                    && x.StartDateTime < endOfDay
                    && x.Status == Entities.Enums.AppointmentStatus.Scheduled)
                .Select(x => new { x.StartDateTime, x.EndDateTime })
                .ToListAsync();

            // Generate time slots (45 minutes each, standard session duration)
            var slots = new List<TimeSlotDto>();
            var currentTime = template.WorkStartTime!.Value;
            var endTime = template.WorkEndTime!.Value;

            while (currentTime.AddMinutes(45) <= endTime)
            {
                var slotStart = currentTime;
                var slotEnd = currentTime.AddMinutes(45);
                
                var slotStartDateTime = date.ToDateTime(slotStart);
                var slotEndDateTime = date.ToDateTime(slotEnd);

                // Check if slot overlaps with existing appointments
                var isAvailable = !existingAppointments.Any(apt =>
                    slotStartDateTime < apt.EndDateTime && slotEndDateTime > apt.StartDateTime);

                if (isAvailable)
                {
                    slots.Add(new TimeSlotDto
                    {
                        StartTime = slotStart,
                        EndTime = slotEnd,
                        DurationMinutes = 45
                    });
                }

                currentTime = currentTime.AddMinutes(45);
            }

            return new AvailabilityDto
            {
                ExpertId = expertId,
                Date = date,
                AvailableSlots = slots
            };
        }
    }
}
