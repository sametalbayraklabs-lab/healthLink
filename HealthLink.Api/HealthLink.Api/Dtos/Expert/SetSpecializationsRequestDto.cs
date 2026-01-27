namespace HealthLink.Api.Dtos.Expert;

public class SetSpecializationsRequestDto
{
    public List<long> SpecializationIds { get; set; } = new();
}
