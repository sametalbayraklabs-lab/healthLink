using HealthLink.Api.Entities.Enums;

namespace HealthLink.Api.Common;

public static class EnumExtensions
{
    // Gender
    public static string? ToApiString(this Gender? gender)
    {
        return gender?.ToString();
    }

    public static Gender? ParseGender(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (Enum.TryParse<Gender>(value, true, out var result))
            return result;
        return null;
    }

    // ExpertType
    public static string ToApiString(this ExpertType expertType)
    {
        return expertType.ToString();
    }

    public static ExpertType ParseExpertType(string value)
    {
        if (Enum.TryParse<ExpertType>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ExpertType: {value}");
    }

    // ExpertStatus
    public static string ToApiString(this ExpertStatus status)
    {
        return status.ToString();
    }

    public static ExpertStatus ParseExpertStatus(string value)
    {
        if (Enum.TryParse<ExpertStatus>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ExpertStatus: {value}");
    }

    // WorkType
    public static string? ToApiString(this WorkType? workType)
    {
        return workType?.ToString();
    }

    public static WorkType? ParseWorkType(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (Enum.TryParse<WorkType>(value, true, out var result))
            return result;
        return null;
    }

    // SpecializationCategory
    public static string ToApiString(this SpecializationCategory category)
    {
        return category.ToString();
    }

    public static SpecializationCategory ParseSpecializationCategory(string value)
    {
        if (Enum.TryParse<SpecializationCategory>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid SpecializationCategory: {value}");
    }

    // ClientPackageStatus
    public static string ToApiString(this ClientPackageStatus status)
    {
        return status.ToString();
    }

    public static ClientPackageStatus ParseClientPackageStatus(string value)
    {
        if (Enum.TryParse<ClientPackageStatus>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ClientPackageStatus: {value}");
    }

    // PaymentStatus
    public static string ToApiString(this PaymentStatus status)
    {
        return status.ToString();
    }

    public static PaymentStatus ParsePaymentStatus(string value)
    {
        if (Enum.TryParse<PaymentStatus>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid PaymentStatus: {value}");
    }

    // PaymentGateway
    public static string ToApiString(this PaymentGateway gateway)
    {
        return gateway.ToString();
    }

    public static PaymentGateway ParsePaymentGateway(string value)
    {
        if (Enum.TryParse<PaymentGateway>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid PaymentGateway: {value}");
    }

    // PaymentMethod
    public static string ToApiString(this PaymentMethod method)
    {
        return method.ToString();
    }

    public static PaymentMethod ParsePaymentMethod(string value)
    {
        if (Enum.TryParse<PaymentMethod>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid PaymentMethod: {value}");
    }

    // AppointmentStatus (Note: DB stores as string, but we may need enum in some contexts)
    public static string ToApiString(this AppointmentStatus status)
    {
        return status.ToString();
    }

    public static AppointmentStatus ParseAppointmentStatus(string value)
    {
        if (Enum.TryParse<AppointmentStatus>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid AppointmentStatus: {value}");
    }

    // ServiceType
    public static string ToApiString(this ServiceType serviceType)
    {
        return serviceType.ToString();
    }

    public static ServiceType ParseServiceType(string value)
    {
        if (Enum.TryParse<ServiceType>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ServiceType: {value}");
    }

    // ReviewStatus
    public static string ToApiString(this ReviewStatus status)
    {
        return status.ToString();
    }

    public static ReviewStatus ParseReviewStatus(string value)
    {
        if (Enum.TryParse<ReviewStatus>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ReviewStatus: {value}");
    }

    // ComplaintCategory
    public static string ToApiString(this ComplaintCategory category)
    {
        return category.ToString();
    }

    public static ComplaintCategory ParseComplaintCategory(string value)
    {
        if (Enum.TryParse<ComplaintCategory>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ComplaintCategory: {value}");
    }

    // ComplaintType
    public static string ToApiString(this ComplaintType type)
    {
        return type.ToString();
    }

    public static ComplaintType ParseComplaintType(string value)
    {
        if (Enum.TryParse<ComplaintType>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ComplaintType: {value}");
    }

    // ComplaintStatus
    public static string ToApiString(this ComplaintStatus status)
    {
        return status.ToString();
    }

    public static ComplaintStatus ParseComplaintStatus(string value)
    {
        if (Enum.TryParse<ComplaintStatus>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ComplaintStatus: {value}");
    }

    // ContentItemType
    public static string ToApiString(this ContentItemType type)
    {
        return type.ToString();
    }

    public static ContentItemType ParseContentItemType(string value)
    {
        if (Enum.TryParse<ContentItemType>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ContentItemType: {value}");
    }

    // ContentItemStatus
    public static string ToApiString(this ContentItemStatus status)
    {
        return status.ToString();
    }

    public static ContentItemStatus ParseContentItemStatus(string value)
    {
        if (Enum.TryParse<ContentItemStatus>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ContentItemStatus: {value}");
    }

    // ScheduleExceptionType
    public static string ToApiString(this ScheduleExceptionType type)
    {
        return type.ToString();
    }

    public static ScheduleExceptionType ParseScheduleExceptionType(string value)
    {
        if (Enum.TryParse<ScheduleExceptionType>(value, true, out var result))
            return result;
        throw new ArgumentException($"Invalid ScheduleExceptionType: {value}");
    }
}
