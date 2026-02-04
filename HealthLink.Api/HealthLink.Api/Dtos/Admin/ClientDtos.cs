using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class AdminClientListDto
{
    public long Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public Gender? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminClientDetailDto
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public Gender? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Statistics
    public int TotalPackages { get; set; }
    public int TotalAppointments { get; set; }
    public decimal TotalSpent { get; set; }
}

public class ToggleClientActiveDto
{
    public bool IsActive { get; set; }
}
