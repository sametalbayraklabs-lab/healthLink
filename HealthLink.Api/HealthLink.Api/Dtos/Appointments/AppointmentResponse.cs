namespace HealthLink.Api.Dtos.Appointments;

public class AppointmentResponse
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public long ExpertId { get; set; }
    public string ServiceType { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
}
