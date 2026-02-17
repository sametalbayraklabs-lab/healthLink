namespace HealthLink.Api.Dtos.Expert;

public class ExpertClientDto
{
    public long ClientId { get; set; }
    public string FullName { get; set; } = null!;
    public string? Email { get; set; }
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public DateTime? LastAppointmentDate { get; set; }
}
