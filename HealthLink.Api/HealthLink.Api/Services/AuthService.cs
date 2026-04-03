using System.Security.Cryptography;
using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Auth;
using HealthLink.Api.Entities;
using HealthLink.Api.Entities.Enums;
using HealthLink.Api.Security;
using HealthLink.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtTokenGenerator _jwt;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, JwtTokenGenerator jwt, IEmailService email, IConfiguration config)
    {
        _db = db;
        _jwt = jwt;
        _email = email;
        _config = config;
    }

    public async Task<RegisterClientResponseDto> RegisterClientAsync(RegisterClientRequestDto request)
    {
        // Check if email already exists
        var existingUser = await _db.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
        if (existingUser != null)
        {
            throw new BusinessException(
                ErrorCodes.EMAIL_ALREADY_EXISTS,
                "Bu e-posta adresi zaten kayıtlı.",
                400
            );
        }

        // Hash password
        var (hash, salt) = PasswordHasher.HashPassword(request.Password);

        // Create User with verification code
        var verificationCode = new Random().Next(100000, 999999).ToString();
        var user = new User
        {
            Email = request.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Phone = request.Phone,
            IsActive = true,
            EmailVerified = false,
            EmailVerificationCode = verificationCode,
            EmailVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(); // Save to get UserId

        // Create Client
        var client = new Client
        {
            UserId = user.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            // Convert BirthDate to UTC if provided (PostgreSQL requires UTC for timestamp with time zone)
            BirthDate = request.BirthDate.HasValue 
                ? DateTime.SpecifyKind(request.BirthDate.Value, DateTimeKind.Utc) 
                : null,
            Gender = EnumExtensions.ParseGender(request.Gender),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Clients.Add(client);
        await _db.SaveChangesAsync();

        // Send verification email (fire-and-forget)
        _ = _email.SendVerificationCodeAsync(user.Email, verificationCode);

        return new RegisterClientResponseDto
        {
            UserId = user.Id,
            ClientId = client.Id,
            Email = user.Email
        };
    }

    public async Task<RegisterExpertResponseDto> RegisterExpertAsync(RegisterExpertRequestDto request)
    {
        // Check if email already exists
        var existingUser = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (existingUser != null)
        {
            // Check if already used as client
            var isClient = await _db.Clients.AnyAsync(c => c.UserId == existingUser.Id);
            if (isClient)
            {
                throw new BusinessException(
                    ErrorCodes.EMAIL_ALREADY_USED_AS_CLIENT,
                    "Bu e-posta adresi bir danışan hesabı ile ilişkilendirilmiş.",
                    400
                );
            }

            throw new BusinessException(
                ErrorCodes.EMAIL_ALREADY_EXISTS,
                "Bu e-posta adresi zaten kayıtlı.",
                400
            );
        }

        // Hash password
        var (hash, salt) = PasswordHasher.HashPassword(request.Password);

        // Create User with verification code
        var verificationCode = new Random().Next(100000, 999999).ToString();
        var user = new User
        {
            Email = request.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Phone = request.Phone,
            IsActive = true,
            EmailVerified = false,
            EmailVerificationCode = verificationCode,
            EmailVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Create Expert with Pending status
        var expert = new Expert
        {
            UserId = user.Id,
            ExpertType = EnumExtensions.ParseExpertType(request.ExpertType),
            Status = ExpertStatus.Pending,
            DisplayName = request.DisplayName,
            City = request.City,
            WorkType = EnumExtensions.ParseWorkType(request.WorkType),
            ExperienceStartDate = request.ExperienceStartDate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Experts.Add(expert);
        await _db.SaveChangesAsync();

        // Send verification email (fire-and-forget)
        _ = _email.SendVerificationCodeAsync(user.Email, verificationCode);

        return new RegisterExpertResponseDto
        {
            UserId = user.Id,
            ExpertId = expert.Id,
            Status = expert.Status.ToApiString()
        };
    }

    public async Task<RegisterAdminResponseDto> RegisterAdminAsync(RegisterAdminRequestDto request)
    {
        // Check if email already exists
        var existingUser = await _db.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
        if (existingUser != null)
        {
            throw new BusinessException(
                ErrorCodes.EMAIL_ALREADY_EXISTS,
                "Bu e-posta adresi zaten kayıtlı.",
                400
            );
        }

        // Hash password
        var (hash, salt) = PasswordHasher.HashPassword(request.Password);

        // Create User
        var user = new User
        {
            Email = request.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            Phone = request.Phone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Create Admin
        var admin = new Admin
        {
            UserId = user.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsSystemAdmin = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Admins.Add(admin);
        await _db.SaveChangesAsync();

        return new RegisterAdminResponseDto
        {
            UserId = user.Id,
            AdminId = admin.Id,
            Email = user.Email
        };
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null)
        {
            throw new BusinessException(
                ErrorCodes.INVALID_CREDENTIALS,
                "E-posta veya şifre hatalı.",
                401
            );
        }

        if (!user.IsActive)
        {
            throw new BusinessException(
                ErrorCodes.USER_INACTIVE,
                "Hesabınız aktif değil.",
                403
            );
        }

        if (!user.EmailVerified)
        {
            throw new BusinessException(
                "EMAIL_NOT_VERIFIED",
                "E-posta adresiniz doğrulanmamış. Lütfen e-postanıza gönderilen kodu girin.",
                403
            );
        }

        var valid = PasswordHasher.VerifyPassword(
            request.Password,
            user.PasswordHash,
            user.PasswordSalt
        );

        if (!valid)
        {
            throw new BusinessException(
                ErrorCodes.INVALID_CREDENTIALS,
                "E-posta veya şifre hatalı.",
                401
            );
        }

        // Determine roles and IDs
        var roles = new List<string>();
        long? clientId = null;
        long? expertId = null;

        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == user.Id);
        if (client != null)
        {
            roles.Add("Client");
            clientId = client.Id;
        }

        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == user.Id);
        if (expert != null)
        {
            roles.Add("Expert");
            expertId = expert.Id;
        }

        // Check for Admin role
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.UserId == user.Id);
        if (admin != null)
        {
            roles.Add("Admin");
            // Note: IsSystemAdmin flag available for future use
        }

        var (accessToken, expiresAt) = _jwt.GenerateToken(user.Id, user.Email, roles, clientId, expertId);
        var expiresIn = (int)(expiresAt - DateTime.UtcNow).TotalSeconds;

        // Create refresh token
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresIn = expiresIn,
            User = new UserInfoDto
            {
                Id = user.Id,
                Email = user.Email,
                Roles = roles,
                ClientId = clientId,
                ExpertId = expertId,
                FirstName = client?.FirstName,
                DisplayName = expert?.DisplayName,
                ProfilePhotoUrl = admin?.ProfilePhotoUrl ?? expert?.ProfilePhotoUrl ?? client?.ProfilePhotoUrl
            }
        };
    }

    public async Task ChangePasswordAsync(long userId, ChangePasswordRequestDto request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            throw new BusinessException(
                ErrorCodes.USER_NOT_FOUND,
                "Kullanıcı bulunamadı.",
                404
            );
        }

        // Verify current password
        var valid = PasswordHasher.VerifyPassword(
            request.CurrentPassword,
            user.PasswordHash,
            user.PasswordSalt
        );

        if (!valid)
        {
            throw new BusinessException(
                ErrorCodes.INVALID_CURRENT_PASSWORD,
                "Mevcut şifre hatalı.",
                400
            );
        }

        // Hash new password
        var (hash, salt) = PasswordHasher.HashPassword(request.NewPassword);
        user.PasswordHash = hash;
        user.PasswordSalt = salt;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    public async Task VerifyEmailAsync(VerifyEmailRequestDto request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
            throw new BusinessException(ErrorCodes.USER_NOT_FOUND, "Kullanıcı bulunamadı.", 404);

        if (user.EmailVerified)
            throw new BusinessException("ALREADY_VERIFIED", "E-posta zaten doğrulanmış.", 400);

        if (user.EmailVerificationCode != request.Code)
            throw new BusinessException("INVALID_CODE", "Doğrulama kodu hatalı.", 400);

        if (user.EmailVerificationCodeExpiry < DateTime.UtcNow)
            throw new BusinessException("CODE_EXPIRED", "Doğrulama kodunun süresi dolmuş. Lütfen yeni kod talep edin.", 400);

        user.EmailVerified = true;
        user.EmailVerificationCode = null;
        user.EmailVerificationCodeExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task ResendVerificationCodeAsync(ResendVerificationRequestDto request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
            throw new BusinessException(ErrorCodes.USER_NOT_FOUND, "Kullanıcı bulunamadı.", 404);

        if (user.EmailVerified)
            throw new BusinessException("ALREADY_VERIFIED", "E-posta zaten doğrulanmış.", 400);

        var code = new Random().Next(100000, 999999).ToString();
        user.EmailVerificationCode = code;
        user.EmailVerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _ = _email.SendVerificationCodeAsync(user.Email, code);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        // Don't reveal if user exists — always return success
        if (user == null) return;

        var token = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:3000";
        var resetLink = $"{frontendUrl}/auth/reset-password?token={token}";
        _ = _email.SendPasswordResetLinkAsync(user.Email, resetLink);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);
        if (user == null)
            throw new BusinessException("INVALID_TOKEN", "Geçersiz veya süresi dolmuş sıfırlama bağlantısı.", 400);

        if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new BusinessException("TOKEN_EXPIRED", "Sıfırlama bağlantısının süresi dolmuş. Lütfen yeni link talep edin.", 400);

        var (hash, salt) = PasswordHasher.HashPassword(request.NewPassword);
        user.PasswordHash = hash;
        user.PasswordSalt = salt;
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<RefreshTokenResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken == null)
            throw new BusinessException("INVALID_REFRESH_TOKEN", "Geçersiz refresh token.", 401);

        if (storedToken.IsRevoked)
            throw new BusinessException("TOKEN_REVOKED", "Token iptal edilmiş.", 401);

        if (storedToken.IsExpired)
            throw new BusinessException("TOKEN_EXPIRED", "Token süresi dolmuş. Lütfen tekrar giriş yapın.", 401);

        var user = storedToken.User;
        if (!user.IsActive)
            throw new BusinessException(ErrorCodes.USER_INACTIVE, "Hesabınız aktif değil.", 403);

        // Determine roles and IDs
        var roles = new List<string>();
        long? clientId = null;
        long? expertId = null;

        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == user.Id);
        if (client != null) { roles.Add("Client"); clientId = client.Id; }

        var expert = await _db.Experts.FirstOrDefaultAsync(e => e.UserId == user.Id);
        if (expert != null) { roles.Add("Expert"); expertId = expert.Id; }

        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.UserId == user.Id);
        if (admin != null) { roles.Add("Admin"); }

        // Generate new access token
        var (newAccessToken, expiresAt) = _jwt.GenerateToken(user.Id, user.Email, roles, clientId, expertId);
        var expiresIn = (int)(expiresAt - DateTime.UtcNow).TotalSeconds;

        // Rotate refresh token: revoke old, create new
        var newRefreshToken = await CreateRefreshTokenAsync(user.Id);
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.ReplacedByToken = newRefreshToken.Token;
        await _db.SaveChangesAsync();

        return new RefreshTokenResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresIn = expiresIn
        };
    }

    public async Task RevokeRefreshTokenAsync(long userId, string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && rt.UserId == userId);

        if (storedToken == null)
            throw new BusinessException("INVALID_REFRESH_TOKEN", "Geçersiz refresh token.", 400);

        if (!storedToken.IsRevoked)
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(long userId)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7), // 7 gün
            CreatedAt = DateTime.UtcNow
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return refreshToken;
    }
}
