namespace HealthLink.Api.Dtos.Client
{
    public class ClientListItemResponse
    {
        public long ClientId { get; set; }
        public string Email { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
