namespace HealthLink.Api.Dtos.Discount;

public class DiscountCodeDto
{
    public long Id { get; set; }
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = null!;
    public decimal DiscountValue { get; set; }
    public int? MaxUsageCount { get; set; }
    public int UsedCount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public string ApplicableExpertType { get; set; } = null!;
    public bool IsActive { get; set; }
}
