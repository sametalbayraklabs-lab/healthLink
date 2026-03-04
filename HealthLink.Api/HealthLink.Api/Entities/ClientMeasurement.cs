namespace HealthLink.Api.Entities
{
    public class ClientMeasurement
    {
        public long Id { get; set; }

        public long ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public long ExpertId { get; set; }
        public Expert Expert { get; set; } = null!;

        public DateTime Date { get; set; }

        public int HeightCm { get; set; }

        public decimal WeightKg { get; set; }

        public decimal? BodyFatPercentage { get; set; }

        public decimal Bmi { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
