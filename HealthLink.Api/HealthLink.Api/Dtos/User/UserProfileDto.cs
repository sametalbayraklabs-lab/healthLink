namespace HealthLink.Api.Dtos.User;

public class UserProfileDto
{
    public long Id { get; set; }
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public List<string> Roles { get; set; } = new();
    public long? ClientId { get; set; }
    public long? ExpertId { get; set; }
    public bool IsActive { get; set; }
}
