namespace HealthLink.Api.Dtos.Expert
{
    public class ExpertDetailResponse
    {
        public long ExpertId { get; set; }
        
        public string Status { get; set; } = null!;

        public string? Bio { get; set; }

        public IReadOnlyList<string> Specializations { get; set; }
            = Array.Empty<string>();
    }
}
