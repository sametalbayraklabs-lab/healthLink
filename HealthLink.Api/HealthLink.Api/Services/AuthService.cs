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

    public AuthService(AppDbContext db, JwtTokenGenerator jwt)
    {
        _db = db;
        _jwt = jwt;
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

        var (token, expiresAt) = _jwt.GenerateToken(user.Id, user.Email, roles, clientId, expertId);
        var expiresIn = (int)(expiresAt - DateTime.UtcNow).TotalSeconds;

        return new LoginResponseDto
        {
            AccessToken = token,
            ExpiresIn = expiresIn,
            User = new UserInfoDto
            {
                Id = user.Id,
                Email = user.Email,
                Roles = roles,
                ClientId = clientId,
                ExpertId = expertId
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
}
