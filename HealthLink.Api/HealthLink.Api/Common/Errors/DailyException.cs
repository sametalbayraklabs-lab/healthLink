using System.Net;

namespace HealthLink.Api.Common.Errors;

/// <summary>
/// Represents an error returned by the Daily.co REST API.
/// Caught by GlobalExceptionHandlerMiddleware for user-friendly responses.
/// </summary>
public class DailyException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public string DailyErrorBody { get; }

    public DailyException(HttpStatusCode statusCode, string errorBody)
        : base($"Daily.co API error ({statusCode}): {errorBody}")
    {
        StatusCode = statusCode;
        DailyErrorBody = errorBody;
    }
}
