namespace HealthLink.Api.Entities;

public class User
{
    public long Id { get; set; } // PK (bigint)

    public string Email { get; set; } = null!;        // unique
    public string PasswordHash { get; set; } = null!;
    public string PasswordSalt { get; set; } = null!;

    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime? LastSeenAt { get; set; }

    // Email verification
    public bool EmailVerified { get; set; } = false;
    public string? EmailVerificationCode { get; set; }
    public DateTime? EmailVerificationCodeExpiry { get; set; }

    // Password reset
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

