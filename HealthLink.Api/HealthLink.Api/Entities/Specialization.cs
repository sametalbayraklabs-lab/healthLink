using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class Specialization
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public ExpertType ExpertType { get; set; }
        public SpecializationCategory Category { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<ExpertSpecialization> ExpertSpecializations { get; set; } = new List<ExpertSpecialization>();
    }
}
