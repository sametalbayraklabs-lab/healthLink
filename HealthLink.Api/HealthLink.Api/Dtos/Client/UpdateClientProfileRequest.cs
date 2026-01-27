namespace HealthLink.Api.Dtos.Client;

public class UpdateClientProfileRequest
{
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
}