using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class ClientPackage
    {
        public long Id { get; set; }

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public long ServicePackageId { get; set; }
        public ServicePackage ServicePackage { get; set; } = null!;

        public int TotalSessions { get; set; }

        public int UsedSessions { get; set; } = 0;

        public ClientPackageStatus Status { get; set; }

        public DateTime PurchaseDate { get; set; }

        public DateTime? ExpireDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
