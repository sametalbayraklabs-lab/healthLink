using HealthLink.Api.Services.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace HealthLink.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["Email:SenderName"] ?? "DengedeKal",
                _config["Email:SenderEmail"] ?? "noreply@dengedekal.com"));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _config["Email:SmtpHost"] ?? "smtp.gmail.com",
                int.Parse(_config["Email:SmtpPort"] ?? "587"),
                MailKit.Security.SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(
                _config["Email:SenderEmail"],
                _config["Email:Password"]);

            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {To}: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}: {Subject}", to, subject);
            // Don't throw — email failures shouldn't break the main flow
        }
    }

    public async Task SendVerificationCodeAsync(string to, string code)
    {
        var html = $@"
        <div style='font-family: Inter, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
                <h1 style='color: #1E8F8A; margin: 0; font-size: 24px;'>DengedeKal</h1>
                <p style='color: #64748b; margin-top: 4px;'>Sağlıklı Yaşamın Dijital Adresi</p>
            </div>
            <div style='background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>
                <h2 style='color: #0f172a; margin-top: 0;'>E-posta Doğrulama</h2>
                <p style='color: #334155;'>Hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
                <div style='text-align: center; margin: 24px 0;'>
                    <span style='display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1E8F8A; background: #e0f2f1; padding: 12px 24px; border-radius: 8px;'>{code}</span>
                </div>
                <p style='color: #94a3b8; font-size: 14px;'>Bu kod 15 dakika geçerlidir.</p>
            </div>
            <p style='text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;'>Bu e-postayı siz talep etmediyseniz lütfen dikkate almayın.</p>
        </div>";

        await SendEmailAsync(to, "DengedeKal — E-posta Doğrulama Kodu", html);
    }

    public async Task SendPasswordResetLinkAsync(string to, string resetLink)
    {
        var html = $@"
        <div style='font-family: Inter, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
                <h1 style='color: #1E8F8A; margin: 0; font-size: 24px;'>DengedeKal</h1>
                <p style='color: #64748b; margin-top: 4px;'>Sağlıklı Yaşamın Dijital Adresi</p>
            </div>
            <div style='background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>
                <h2 style='color: #0f172a; margin-top: 0;'>Parola Sıfırlama</h2>
                <p style='color: #334155;'>Parolanızı sıfırlamak için aşağıdaki butona tıklayın:</p>
                <div style='text-align: center; margin: 24px 0;'>
                    <a href='{resetLink}' style='display: inline-block; background: #1E8F8A; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;'>Parolayı Sıfırla</a>
                </div>
                <p style='color: #94a3b8; font-size: 14px;'>Bu link 1 saat geçerlidir. Butona tıklayamıyorsanız aşağıdaki linki tarayıcınıza yapıştırın:</p>
                <p style='color: #64748b; font-size: 12px; word-break: break-all;'>{resetLink}</p>
            </div>
            <p style='text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;'>Bu e-postayı siz talep etmediyseniz lütfen dikkate almayın.</p>
        </div>";

        await SendEmailAsync(to, "DengedeKal — Parola Sıfırlama", html);
    }

    public async Task SendAppointmentCreatedAsync(string to, string participantName, string expertName, DateTime startTime)
    {
        var formattedDate = startTime.ToLocalTime().ToString("dd MMMM yyyy, HH:mm", new System.Globalization.CultureInfo("tr-TR"));
        var html = $@"
        <div style='font-family: Inter, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
                <h1 style='color: #1E8F8A; margin: 0; font-size: 24px;'>DengedeKal</h1>
            </div>
            <div style='background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>
                <h2 style='color: #0f172a; margin-top: 0;'>Yeni Randevu 🗓️</h2>
                <p style='color: #334155;'>Merhaba <strong>{participantName}</strong>,</p>
                <p style='color: #334155;'>Yeni bir randevunuz oluşturuldu:</p>
                <div style='background: #f0fdfa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #1E8F8A;'>
                    <p style='margin: 4px 0; color: #0f172a;'><strong>Uzman:</strong> {expertName}</p>
                    <p style='margin: 4px 0; color: #0f172a;'><strong>Tarih:</strong> {formattedDate}</p>
                </div>
                <p style='color: #64748b; font-size: 14px;'>Randevu saatinden önce platformda hazır olmanızı öneririz.</p>
            </div>
        </div>";

        await SendEmailAsync(to, "DengedeKal — Yeni Randevunuz Var", html);
    }

    public async Task SendAppointmentCancelledAsync(string to, string cancelledBy, string expertName, DateTime startTime)
    {
        var formattedDate = startTime.ToLocalTime().ToString("dd MMMM yyyy, HH:mm", new System.Globalization.CultureInfo("tr-TR"));
        var html = $@"
        <div style='font-family: Inter, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;'>
            <div style='text-align: center; margin-bottom: 24px;'>
                <h1 style='color: #1E8F8A; margin: 0; font-size: 24px;'>DengedeKal</h1>
            </div>
            <div style='background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>
                <h2 style='color: #ef4444; margin-top: 0;'>Randevu İptali ❌</h2>
                <p style='color: #334155;'>Aşağıdaki randevunuz iptal edilmiştir:</p>
                <div style='background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ef4444;'>
                    <p style='margin: 4px 0; color: #0f172a;'><strong>Uzman:</strong> {expertName}</p>
                    <p style='margin: 4px 0; color: #0f172a;'><strong>Tarih:</strong> {formattedDate}</p>
                    <p style='margin: 4px 0; color: #0f172a;'><strong>İptal Eden:</strong> {cancelledBy}</p>
                </div>
            </div>
        </div>";

        await SendEmailAsync(to, "DengedeKal — Randevu İptal Edildi", html);
    }
}
