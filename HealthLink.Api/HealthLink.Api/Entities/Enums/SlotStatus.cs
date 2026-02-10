namespace HealthLink.Api.Entities.Enums
{
    public enum SlotStatus
    {
        Available = 0,  // Müsait - Can be booked
        Booked = 1,     // Dolu - Has appointment
        Closed = 2      // Kapalı - Not working hours
    }
}
