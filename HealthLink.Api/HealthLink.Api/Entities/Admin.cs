namespace HealthLink.Api.Entities;

public class Admin
{
    public long Id { get; set; } // PK (bigint)

    public long UserId { get; set; } // FK to Users
    public User User { get; set; } = null!;

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;

    // System admin has elevated privileges (admin of admins)
    public bool IsSystemAdmin { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
