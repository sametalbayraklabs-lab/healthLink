namespace HealthLink.Api.Dtos.Expert
{
    public class ExpertAvailabilitySlotResponse
    {
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public bool IsAvailable { get; set; }
    }
}
