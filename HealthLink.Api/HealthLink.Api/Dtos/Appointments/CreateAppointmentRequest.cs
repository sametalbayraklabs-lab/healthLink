namespace HealthLink.Api.Dtos.Appointments;

public class CreateAppointmentRequest
{
    public long ExpertId { get; set; }
    public long ClientPackageId { get; set; }   
    public string ServiceType { get; set; } = null!;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
}
