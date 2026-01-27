export interface ClientProfile {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    gender?: string;
    birthDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface UpdateClientRequest {
    firstName: string;
    lastName: string;
    phone?: string;
    gender?: string;
    birthDate?: string;
}

export interface ClientDashboard {
    upcomingAppointmentsCount: number;
    completedAppointmentsCount: number;
    activePackagesCount: number;
    unreadMessagesCount: number;
    recentAppointments: any[];
}
