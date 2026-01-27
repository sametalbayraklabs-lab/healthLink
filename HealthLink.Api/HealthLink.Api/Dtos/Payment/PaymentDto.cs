namespace HealthLink.Api.Dtos.Payment;

public class PaymentDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public long ClientPackageId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string PaymentMethod { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Gateway { get; set; } = null!;
    public DateTime? ConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
