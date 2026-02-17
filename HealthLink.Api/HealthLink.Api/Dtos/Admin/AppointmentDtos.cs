using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class AdminAppointmentListDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public long ExpertId { get; set; }
    public string ExpertName { get; set; } = null!;
    public string ExpertType { get; set; } = null!;
    public ServiceType ServiceType { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminAppointmentDetailDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string ClientEmail { get; set; } = null!;
    public long ExpertId { get; set; }
    public string ExpertName { get; set; } = null!;
    public string ExpertEmail { get; set; } = null!;
    public string ExpertType { get; set; } = null!;
    public long? ClientPackageId { get; set; }
    public string? PackageName { get; set; }
    public ServiceType ServiceType { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string? MeetingUrl { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
