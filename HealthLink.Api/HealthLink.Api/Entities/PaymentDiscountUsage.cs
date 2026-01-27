namespace HealthLink.Api.Entities
{
    public class PaymentDiscountUsage
    {
        public long Id { get; set; }

        public long PaymentId { get; set; }
        public Payment Payment { get; set; } = null!;

        public long DiscountCodeId { get; set; }
        public DiscountCode DiscountCode { get; set; } = null!;

        public decimal AppliedAmount { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
