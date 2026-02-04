using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class AdminReviewListDto
{
    public long Id { get; set; }
    public long AppointmentId { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public long ExpertId { get; set; }
    public string ExpertName { get; set; } = null!;
    public string ExpertType { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public ReviewStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminReviewDetailDto
{
    public long Id { get; set; }
    public long AppointmentId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string ClientEmail { get; set; } = null!;
    public long ExpertId { get; set; }
    public string ExpertName { get; set; } = null!;
    public string ExpertEmail { get; set; } = null!;
    public string ExpertType { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public ReviewStatus Status { get; set; }
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}

public class ReviewActionDto
{
    public ReviewStatus Status { get; set; }
    public string? AdminNote { get; set; }
}
