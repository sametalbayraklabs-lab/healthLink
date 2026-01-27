namespace HealthLink.Api.Entities
{
    public class SystemSetting
    {
        public long Id { get; set; }

        public string Key { get; set; } = null!;

        public string Value { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
