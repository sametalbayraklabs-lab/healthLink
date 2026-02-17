namespace HealthLink.Api.Common.Errors;

public static class ErrorCodes
{
    public const string AppointmentTimeNotAvailable = "appointment.time_not_available";
    public const string ClientPackageRequired = "appointment.client_package_required";
    public const string ClientPackageNotActive = "appointment.client_package_not_active";
    public const string InvalidServiceType = "appointment.invalid_service_type";
    public const string AppointmentNotCancelable = "appointment.not_cancelable";
    public const string AppointmentNotFound = "appointment.not_found";
    public const string AppointmentNotMarkableIncomplete = "appointment.not_markable_incomplete";

    // Auth & User error codes
    public const string EMAIL_ALREADY_EXISTS = "auth.email_already_exists";
    public const string EMAIL_ALREADY_USED_AS_CLIENT = "auth.email_already_used_as_client";
    public const string EMAIL_ALREADY_USED_AS_EXPERT = "auth.email_already_used_as_expert";
    public const string INVALID_CREDENTIALS = "auth.invalid_credentials";
    public const string USER_INACTIVE = "auth.user_inactive";
    public const string INVALID_CURRENT_PASSWORD = "auth.invalid_current_password";
    public const string USER_NOT_FOUND = "user.not_found";
    
    // Client error codes
    public const string CLIENT_NOT_FOUND = "client.not_found";
    public const string NOT_A_CLIENT = "client.not_a_client";
    
    // Expert error codes
    public const string EXPERT_NOT_FOUND = "expert.not_found";
    public const string NOT_AN_EXPERT = "expert.not_an_expert";
    public const string EXPERT_NOT_APPROVED = "expert.not_approved";
    
    // Specialization error codes
    public const string SPECIALIZATION_NOT_FOUND = "specialization.not_found";
    public const string INVALID_SPECIALIZATION_IDS = "specialization.invalid_ids";

    // Messaging error codes
    public const string CONVERSATION_NOT_FOUND = "messaging.conversation_not_found";
    public const string UNAUTHORIZED = "auth.unauthorized";

}
