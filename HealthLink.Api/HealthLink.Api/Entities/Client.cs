using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Entities
{
    public class Client
    {
        public long Id { get; set; }                // PK

        public long UserId { get; set; }            // FK -> Users.Id (1-1, unique)

        public string FirstName { get; set; } = null!;  // Required, max 100
        public string LastName { get; set; } = null!;   // Required, max 100

        // BREAKING CHANGE: Gender changed from string? to Gender? enum
        public Gender? Gender { get; set; }         // Nullable enum (stored as int)
        public DateTime? BirthDate { get; set; }    // TDD: birthdate (kept nullable)

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public User User { get; set; } = null!;
    }
}
