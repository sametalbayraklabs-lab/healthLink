namespace HealthLink.Api.Common;

public class ErrorResponse
{
    public string ErrorCode { get; set; } = null!;
    public string Message { get; set; } = null!;
    public Dictionary<string, string[]>? Details { get; set; }
}
