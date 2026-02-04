using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class AdminPaymentListDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string ClientEmail { get; set; } = null!;
    public long ClientPackageId { get; set; }
    public string PackageName { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string PaymentMethod { get; set; } = null!;
    public PaymentStatus Status { get; set; }
    public PaymentGateway Gateway { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminPaymentDetailDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string ClientEmail { get; set; } = null!;
    public long ClientPackageId { get; set; }
    public string PackageName { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string PaymentMethod { get; set; } = null!;
    public PaymentStatus Status { get; set; }
    public PaymentGateway Gateway { get; set; }
    public string? GatewayPaymentId { get; set; }
    public string? ProviderRawResponse { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
