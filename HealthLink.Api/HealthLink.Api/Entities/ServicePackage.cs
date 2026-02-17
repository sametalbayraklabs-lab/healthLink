using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ServicePackage
    {
        public long Id { get; set; }

        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        public ExpertType ExpertType { get; set; } = ExpertType.All;

        public int SessionCount { get; set; }

        public int ValidityDays { get; set; } = 30;

        public decimal Price { get; set; }

        public string Currency { get; set; } = "TRY";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public ICollection<ClientPackage> ClientPackages { get; set; } = new List<ClientPackage>();
    }
}
