using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class Payment
    {
        public long Id { get; set; }

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public long ClientPackageId { get; set; }
        public ClientPackage ClientPackage { get; set; } = null!;

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "TRY";

        public string PaymentMethod { get; set; } = null!;

        public PaymentStatus Status { get; set; }

        public PaymentGateway Gateway { get; set; }

        public string? GatewayPaymentId { get; set; }

        public string? ProviderRawResponse { get; set; }

        public DateTime? ConfirmedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
