using HealthLink.Api.Dtos.Appointments;

namespace HealthLink.Api.Services.Interfaces
{
    public interface IAppointmentService
    {
        /// <summary>
        /// Creates a new appointment for the given client.
        /// ClientPackage is mandatory.
        /// </summary>
        Task<AppointmentResponse> CreateAsync(
            long clientUserId,
            CreateAppointmentRequest request);

        /// <summary>
        /// Cancels an existing appointment.
        /// Can be performed by client or expert.
        /// May restore session usage based on cancel limit.
        /// </summary>
        Task CancelAsync(
            long userId,
            long appointmentId);

        /// <summary>
        /// Marks an appointment as completed.
        /// Only expert can perform this action.
        /// Increases used session count.
        /// </summary>
        Task CompleteAsync(
            long expertUserId,
            long appointmentId);

        /// <summary>
        /// Marks an appointment as incomplete.
        /// Only expert can perform this action.
        /// Does NOT affect session usage.
        /// </summary>
        Task MarkIncompleteAsync(
            long expertUserId,
            long appointmentId);

        /// <summary>
        /// Returns appointments for the authenticated client.
        /// </summary>
        Task<IReadOnlyList<AppointmentResponse>> GetClientAppointmentsAsync(
            long clientUserId);

        /// <summary>
        /// Returns appointments for the authenticated expert.
        /// </summary>
        Task<IReadOnlyList<AppointmentResponse>> GetExpertAppointmentsAsync(
            long expertUserId);
    }
}
