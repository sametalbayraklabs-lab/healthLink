namespace HealthLink.Api.Dtos.Expert
{
    public class ExpertListItemResponse
    {
        public long ExpertId { get; set; }
        public string FullName { get; set; } = null!;
        public string Status { get; set; } = null!;
        public List<string> Specializations { get; set; } = new();
    }
}
