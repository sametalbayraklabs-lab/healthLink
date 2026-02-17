using HealthLink.Api.Common;
using HealthLink.Api.Common.Errors;
using System.Net;
using System.Text.Json;

namespace HealthLink.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BusinessException ex)
        {
            _logger.LogWarning(ex, "Business exception: {ErrorCode}", ex.ErrorCode);
            await HandleBusinessExceptionAsync(context, ex);
        }
        catch (DailyException ex)
        {
            _logger.LogError(ex, "Daily.co API error: {StatusCode} — {Body}", ex.StatusCode, ex.DailyErrorBody);
            await HandleDailyExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleUnhandledExceptionAsync(context, ex);
        }
    }

    private static Task HandleBusinessExceptionAsync(HttpContext context, BusinessException exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = exception.StatusCode;

        var response = new
        {
            errorCode = exception.ErrorCode,
            fallbackMessage = exception.Message,
            timestamp = DateTime.UtcNow
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static Task HandleDailyExceptionAsync(HttpContext context, DailyException exception)
    {
        context.Response.ContentType = "application/json";

        // Map Daily.co status codes to meaningful client responses
        var (statusCode, errorCode, message) = exception.StatusCode switch
        {
            HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden
                => (500, "VIDEO_CONFIG_ERROR",
                    "Video servisi yapılandırma hatası. Lütfen yönetici ile iletişime geçin."),

            HttpStatusCode.TooManyRequests
                => (429, "VIDEO_SERVICE_BUSY",
                    "Video servisi şu an çok yoğun. Lütfen 30 saniye sonra tekrar deneyin."),

            HttpStatusCode.NotFound
                => (404, "VIDEO_ROOM_NOT_FOUND",
                    "Video odası bulunamadı veya süresi dolmuş."),

            _ => (502, "VIDEO_SERVICE_ERROR",
                  "Video servisi ile iletişimde hata oluştu. Lütfen tekrar deneyin.")
        };

        context.Response.StatusCode = statusCode;

        var response = new
        {
            errorCode,
            fallbackMessage = message,
            timestamp = DateTime.UtcNow
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static Task HandleUnhandledExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new
        {
            errorCode = "INTERNAL_SERVER_ERROR",
            fallbackMessage = "An unexpected error occurred. Please try again later.",
            // Include details in development for debugging
            detail = exception.Message,
            innerDetail = exception.InnerException?.Message,
            timestamp = DateTime.UtcNow
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
