using System.Text.Json;
using System.Text.Json.Serialization;

namespace HealthLink.Api.Common;

/// <summary>
/// Custom JSON converter for TimeOnly that accepts both HH:mm and HH:mm:ss formats
/// </summary>
public class TimeOnlyJsonConverter : JsonConverter<TimeOnly>
{
    private const string TimeFormat = "HH:mm:ss";
    private const string ShortTimeFormat = "HH:mm";

    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
        {
            throw new JsonException("TimeOnly value cannot be null or empty");
        }

        // Try parsing with seconds first
        if (TimeOnly.TryParseExact(value, TimeFormat, out var timeWithSeconds))
        {
            return timeWithSeconds;
        }

        // Try parsing without seconds (HH:mm format from HTML time input)
        if (TimeOnly.TryParseExact(value, ShortTimeFormat, out var timeWithoutSeconds))
        {
            return timeWithoutSeconds;
        }

        throw new JsonException($"Unable to parse '{value}' as TimeOnly. Expected format: HH:mm or HH:mm:ss");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(ShortTimeFormat));
    }
}

/// <summary>
/// Custom JSON converter for nullable TimeOnly
/// </summary>
public class NullableTimeOnlyJsonConverter : JsonConverter<TimeOnly?>
{
    private const string TimeFormat = "HH:mm:ss";
    private const string ShortTimeFormat = "HH:mm";

    public override TimeOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        // Try parsing with seconds first
        if (TimeOnly.TryParseExact(value, TimeFormat, out var timeWithSeconds))
        {
            return timeWithSeconds;
        }

        // Try parsing without seconds (HH:mm format from HTML time input)
        if (TimeOnly.TryParseExact(value, ShortTimeFormat, out var timeWithoutSeconds))
        {
            return timeWithoutSeconds;
        }

        throw new JsonException($"Unable to parse '{value}' as TimeOnly. Expected format: HH:mm or HH:mm:ss");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(value.Value.ToString(ShortTimeFormat));
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}
