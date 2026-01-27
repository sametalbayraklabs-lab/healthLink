export interface ExpertProfile {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    expertType: string;
    title?: string;
    bio?: string;
    city?: string;
    approvalStatus: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    specializations?: Specialization[];
}

export interface ExpertPublicProfile {
    id: number;
    firstName: string;
    lastName: string;
    expertType: string;
    title?: string;
    bio?: string;
    city?: string;
    rating?: number;
    reviewCount?: number;
    specializations?: Specialization[];
}

export interface ExpertListItem {
    id: number;
    firstName: string;
    lastName: string;
    expertType: string;
    title?: string;
    city?: string;
    rating?: number;
    reviewCount?: number;
}

export interface UpdateExpertRequest {
    firstName: string;
    lastName: string;
    phone?: string;
    title?: string;
    bio?: string;
    city?: string;
}

export interface Specialization {
    id: number;
    name: string;
    expertType?: string;
}

export interface SetSpecializationsRequest {
    specializationIds: number[];
}
