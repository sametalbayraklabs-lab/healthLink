namespace HealthLink.Api.Entities
{
    public class ExpertSpecialization
    {
        public long ExpertId { get; set; }
        public long SpecializationId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Expert Expert { get; set; } = null!;
        public Specialization Specialization { get; set; } = null!;
    }
}