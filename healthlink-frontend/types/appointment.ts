export interface Appointment {
    id: number;
    clientId: number;
    expertId: number;
    expertName?: string;
    expertTitle?: string;
    clientPackageId?: number;
    serviceType: string;
    startDateTime: string;
    endDateTime: string;
    dailyRoomName?: string;
    meetingUrl?: string;
    status: string;
    hasReview?: boolean;
    reviewId?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAppointmentRequest {
    expertId: number;
    clientPackageId?: number;
    serviceType: string;
    startDateTime: string;
    endDateTime: string;
}
