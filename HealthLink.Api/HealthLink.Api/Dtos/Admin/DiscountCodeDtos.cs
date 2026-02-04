using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Dtos.Admin;

public class DiscountCodeDto
{
    public long Id { get; set; }
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public int? MaxUsageCount { get; set; }
    public int UsedCount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public ExpertType ApplicableExpertType { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateDiscountCodeDto
{
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public int? MaxUsageCount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public ExpertType ApplicableExpertType { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateDiscountCodeDto
{
    public string? Description { get; set; }
    public decimal? DiscountValue { get; set; }
    public int? MaxUsageCount { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool? IsActive { get; set; }
}
