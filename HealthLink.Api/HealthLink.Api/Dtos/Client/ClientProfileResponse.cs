namespace HealthLink.Api.Dtos.Client;

public class ClientProfileResponse
{
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
}
