namespace HealthLink.Api.Dtos.Client;

public class UpdateClientRequestDto
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public DateTime? BirthDate { get; set; }
    public string? Gender { get; set; } // "Male", "Female", "Other", "PreferNotToSay"
}
