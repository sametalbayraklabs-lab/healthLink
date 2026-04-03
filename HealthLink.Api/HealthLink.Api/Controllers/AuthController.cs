using HealthLink.Api.Common;
using HealthLink.Api.Data;
using HealthLink.Api.Dtos.Auth;
using HealthLink.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace HealthLink.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly AppDbContext _db;

    public AuthController(IAuthService auth, AppDbContext db)
    {
        _auth = auth;
        _db = db;
    }

    [HttpPost("register-client")]
    [EnableRateLimiting("register")]
    public async Task<ActionResult<RegisterClientResponseDto>> RegisterClient(RegisterClientRequestDto request)
    {
        var result = await _auth.RegisterClientAsync(request);
        return CreatedAtAction(nameof(RegisterClient), result);
    }

    [HttpPost("register-expert")]
    [EnableRateLimiting("register")]
    public async Task<ActionResult<RegisterExpertResponseDto>> RegisterExpert(RegisterExpertRequestDto request)
    {
        var result = await _auth.RegisterExpertAsync(request);
        return CreatedAtAction(nameof(RegisterExpert), result);
    }

    [HttpPost("register-admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> RegisterAdmin(RegisterAdminRequestDto request)
    {
        var result = await _auth.RegisterAdminAsync(request);
        return CreatedAtAction(nameof(RegisterAdmin), result);
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
    {
        var result = await _auth.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequestDto request)
    {
        var userId = UserHelper.GetUserId(User);
        await _auth.ChangePasswordAsync(userId, request);
        return Ok(new { success = true });
    }

    [HttpPost("heartbeat")]
    [Authorize]
    public async Task<ActionResult> Heartbeat()
    {
        var userId = UserHelper.GetUserId(User);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user != null)
        {
            user.LastSeenAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
        return Ok();
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult> VerifyEmail(VerifyEmailRequestDto request)
    {
        await _auth.VerifyEmailAsync(request);
        return Ok(new { success = true, message = "E-posta başarıyla doğrulandı." });
    }

    [HttpPost("resend-verification")]
    [EnableRateLimiting("email")]
    public async Task<ActionResult> ResendVerification(ResendVerificationRequestDto request)
    {
        await _auth.ResendVerificationCodeAsync(request);
        return Ok(new { success = true, message = "Doğrulama kodu tekrar gönderildi." });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("email")]
    public async Task<ActionResult> ForgotPassword(ForgotPasswordRequestDto request)
    {
        await _auth.ForgotPasswordAsync(request);
        return Ok(new { success = true, message = "Sıfırlama linki e-posta adresinize gönderildi." });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordRequestDto request)
    {
        await _auth.ResetPasswordAsync(request);
        return Ok(new { success = true, message = "Parolanız başarıyla değiştirildi." });
    }

    [HttpPost("refresh-token")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<RefreshTokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
    {
        var result = await _auth.RefreshTokenAsync(request.RefreshToken);
        return Ok(result);
    }

    [HttpPost("revoke-token")]
    [Authorize]
    public async Task<ActionResult> RevokeToken(RefreshTokenRequestDto request)
    {
        var userId = UserHelper.GetUserId(User);
        await _auth.RevokeRefreshTokenAsync(userId, request.RefreshToken);
        return Ok(new { success = true, message = "Token başarıyla iptal edildi." });
    }
}
