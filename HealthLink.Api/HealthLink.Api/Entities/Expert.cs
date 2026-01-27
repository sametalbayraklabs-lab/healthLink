using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class Expert
    {
        public long Id { get; set; }
        public long UserId { get; set; }

        public ExpertType ExpertType { get; set; }      // Enum (stored as int)
        public ExpertStatus Status { get; set; }

        public string? DisplayName { get; set; }        // Max 150
        public string? Bio { get; set; }
        public string? City { get; set; }               // Max 100

        public WorkType? WorkType { get; set; }         // Nullable enum (stored as int)
        public DateOnly? ExperienceStartDate { get; set; }

        public decimal? AverageRating { get; set; }     // Nullable, precision 3,2
        public int TotalReviewCount { get; set; } = 0;  // Default 0

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public User User { get; set; } = null!;
        public ICollection<ExpertSpecialization> ExpertSpecializations { get; set; } = new List<ExpertSpecialization>();
    }
}
