using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using HealthLink.Api.Common.Errors;
using HealthLink.Api.Services.Interfaces;

namespace HealthLink.Api.Services;

/// <summary>
/// Daily.co REST API client service.
/// Registered via AddHttpClient in Program.cs.
/// </summary>
public class DailyService : IDailyService
{
    private readonly HttpClient _http;
    private readonly string _apiUrl;
    private readonly string _apiKey;

    public DailyService(HttpClient httpClient, IConfiguration configuration)
    {
        _http = httpClient;
        _apiUrl = configuration["Daily:ApiUrl"] ?? "https://api.daily.co/v1";
        _apiKey = configuration["Daily:ApiKey"] ?? throw new InvalidOperationException("Daily:ApiKey is not configured.");

        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<(string RoomName, string RoomUrl)> CreateRoomAsync(long appointmentId, DateTime expiry)
    {
        var roomName = $"hl-appt-{appointmentId}";

        // Convert expiry to Unix timestamp
        var exp = new DateTimeOffset(expiry).ToUnixTimeSeconds();

        var body = new
        {
            name = roomName,
            privacy = "private",
            properties = new
            {
                exp,
                enable_recording = false,           // Recording disabled for now (TDD spec)
                enable_chat = true,
                enable_screenshare = true,
                start_audio_off = false,
                start_video_off = false,
                lang = "tr"
            }
        };

        var content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _http.PostAsync($"{_apiUrl}/rooms", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new DailyException(response.StatusCode, errorBody);
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var url = doc.RootElement.GetProperty("url").GetString()!;
        var name = doc.RootElement.GetProperty("name").GetString()!;

        return (name, url);
    }

    public async Task<string> GetMeetingTokenAsync(
        string roomName, long userId, string userName, bool isOwner, DateTime expiry)
    {
        var exp = new DateTimeOffset(expiry).ToUnixTimeSeconds();

        var body = new
        {
            properties = new
            {
                room_name = roomName,
                user_name = userName,
                user_id = userId.ToString(),
                is_owner = isOwner,
                exp
            }
        };

        var content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _http.PostAsync($"{_apiUrl}/meeting-tokens", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new DailyException(response.StatusCode, errorBody);
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        return doc.RootElement.GetProperty("token").GetString()!;
    }

    public async Task DeleteRoomAsync(string roomName)
    {
        var response = await _http.DeleteAsync($"{_apiUrl}/rooms/{roomName}");

        // Silently ignore 404 (room already expired/deleted)
        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new DailyException(response.StatusCode, errorBody);
        }
    }
}
