namespace HealthLink.Api.Entities;

public class User
{
    public long Id { get; set; } // PK (bigint)

    public string Email { get; set; } = null!;        // unique
    public string PasswordHash { get; set; } = null!;
    public string PasswordSalt { get; set; } = null!;

    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

