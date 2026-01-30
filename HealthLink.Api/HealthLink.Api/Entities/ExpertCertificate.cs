namespace HealthLink.Api.Entities
{
    public class ExpertCertificate
    {
        public long Id { get; set; }
        public long ExpertId { get; set; }
        
        public string Name { get; set; } = null!;
        public string? Issuer { get; set; }
        public int? Year { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public Expert Expert { get; set; } = null!;
    }
}
