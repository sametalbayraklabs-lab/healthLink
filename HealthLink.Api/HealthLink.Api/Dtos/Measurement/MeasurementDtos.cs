namespace HealthLink.Api.Dtos.Measurement;

public class CreateMeasurementDto
{
    public long ClientId { get; set; }
    public DateTime Date { get; set; }
    public int HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public decimal? BodyFatPercentage { get; set; }
}

public class UpdateMeasurementDto
{
    public DateTime? Date { get; set; }
    public int? HeightCm { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? BodyFatPercentage { get; set; }
}

public class MeasurementDto
{
    public long Id { get; set; }
    public long ClientId { get; set; }
    public long ExpertId { get; set; }
    public DateTime Date { get; set; }
    public int HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public decimal? BodyFatPercentage { get; set; }
    public decimal Bmi { get; set; }
    public string BmiCategory { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
