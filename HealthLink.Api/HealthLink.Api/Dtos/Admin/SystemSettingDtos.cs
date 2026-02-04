namespace HealthLink.Api.Dtos.Admin;

public class SystemSettingDto
{
    public long Id { get; set; }
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateSystemSettingDto
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}

public class UpdateSystemSettingDto
{
    public string Value { get; set; } = null!;
}
