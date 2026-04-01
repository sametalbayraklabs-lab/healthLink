namespace HealthLink.Api.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlBody);
    Task SendVerificationCodeAsync(string to, string code);
    Task SendPasswordResetLinkAsync(string to, string resetLink);
    Task SendAppointmentCreatedAsync(string to, string participantName, string expertName, DateTime startTime);
    Task SendAppointmentCancelledAsync(string to, string cancelledBy, string expertName, DateTime startTime);
}
