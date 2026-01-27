export interface Appointment {
    id: number;
    clientId: number;
    expertId: number;
    clientPackageId?: number;
    serviceType: string;
    startDateTime: string;
    endDateTime: string;
    zoomLink?: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    client?: {
        firstName: string;
        lastName: string;
    };
    expert?: {
        firstName: string;
        lastName: string;
        title?: string;
    };
}

export interface CreateAppointmentRequest {
    expertId: number;
    clientPackageId?: number;
    serviceType: string;
    startDateTime: string;
    endDateTime: string;
}
