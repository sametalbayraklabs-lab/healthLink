using HealthLink.Api.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/admin/lookups")]
[Authorize(Roles = "Admin")]
public class AdminLookupsController : BaseAuthenticatedController
{
    [HttpGet]
    public ActionResult<AdminLookupsDto> GetAll()
    {
        var result = new AdminLookupsDto
        {
            PaymentGateways = EnumToLookup<PaymentGateway>(new Dictionary<string, string>
            {
                ["Iyzico"] = "Iyzico",
                ["Stripe"] = "Stripe",
                ["PayTR"] = "PayTR",
                ["PayPal"] = "PayPal"
            }),
            PaymentStatuses = EnumToLookup<PaymentStatus>(new Dictionary<string, string>
            {
                ["Pending"] = "Bekliyor",
                ["Success"] = "Başarılı",
                ["Failed"] = "Başarısız",
                ["Refunded"] = "İade Edildi"
            }),
            ReviewStatuses = EnumToLookup<ReviewStatus>(new Dictionary<string, string>
            {
                ["PendingApproval"] = "Onay Bekliyor",
                ["Approved"] = "Onaylandı",
                ["Rejected"] = "Reddedildi"
            }),
            ContentItemStatuses = EnumToLookup<ContentItemStatus>(new Dictionary<string, string>
            {
                ["Draft"] = "Taslak",
                ["PendingApproval"] = "Onay Bekliyor",
                ["Published"] = "Yayında",
                ["Archived"] = "Arşivlenmiş"
            }),
            ContentItemTypes = EnumToLookup<ContentItemType>(new Dictionary<string, string>
            {
                ["Blog"] = "Blog",
                ["Recipe"] = "Tarif",
                ["Announcement"] = "Duyuru"
            }),
            ComplaintStatuses = EnumToLookup<ComplaintStatus>(new Dictionary<string, string>
            {
                ["Open"] = "Açık",
                ["InReview"] = "İnceleniyor",
                ["Resolved"] = "Çözüldü",
                ["Rejected"] = "Reddedildi"
            }),
            ComplaintCategories = EnumToLookup<ComplaintCategory>(new Dictionary<string, string>
            {
                ["Expert"] = "Uzman",
                ["System"] = "Sistem",
                ["Payment"] = "Ödeme"
            }),
            AppointmentStatuses = EnumToLookup<AppointmentStatus>(new Dictionary<string, string>
            {
                ["Scheduled"] = "Planlandı",
                ["Completed"] = "Tamamlandı",
                ["CancelledByClient"] = "Danışan İptal",
                ["CancelledByExpert"] = "Uzman İptal",
                ["NoShow"] = "Katılmadı",
                ["Incomplete"] = "Tamamlanmadı"
            }),
            ExpertTypes = EnumToLookup<ExpertType>(new Dictionary<string, string>
            {
                ["All"] = "Tümü",
                ["Dietitian"] = "Diyetisyen",
                ["Psychologist"] = "Psikolog",
                ["SportsCoach"] = "Spor Koçu"
            }),
            SpecializationCategories = EnumToLookup<SpecializationCategory>(new Dictionary<string, string>
            {
                ["Psychologist"] = "Psikolog",
                ["Dietitian"] = "Diyetisyen",
                ["SportsCoach"] = "Spor Koçu"
            })
        };

        return Ok(result);
    }

    private static List<LookupItem> EnumToLookup<T>(Dictionary<string, string> labels) where T : struct, Enum
    {
        return Enum.GetValues<T>()
            .Where(e => labels.ContainsKey(e.ToString()))
            .Select(e => new LookupItem
            {
                Value = e.ToString(),
                Label = labels.GetValueOrDefault(e.ToString(), e.ToString())
            })
            .ToList();
    }
}

public class LookupItem
{
    public string Value { get; set; } = null!;
    public string Label { get; set; } = null!;
}

public class AdminLookupsDto
{
    public List<LookupItem> PaymentGateways { get; set; } = new();
    public List<LookupItem> PaymentStatuses { get; set; } = new();
    public List<LookupItem> ReviewStatuses { get; set; } = new();
    public List<LookupItem> ContentItemStatuses { get; set; } = new();
    public List<LookupItem> ContentItemTypes { get; set; } = new();
    public List<LookupItem> ComplaintStatuses { get; set; } = new();
    public List<LookupItem> ComplaintCategories { get; set; } = new();
    public List<LookupItem> AppointmentStatuses { get; set; } = new();
    public List<LookupItem> ExpertTypes { get; set; } = new();
    public List<LookupItem> SpecializationCategories { get; set; } = new();
}
