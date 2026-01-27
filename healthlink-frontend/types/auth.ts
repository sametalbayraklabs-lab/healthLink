export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterClientRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
}

export interface RegisterExpertRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    expertType: string;
    title?: string;
    bio?: string;
    city?: string;
}

export interface UserInfo {
    id: number;
    email: string;
    roles: string[];
    clientId?: number;
    expertId?: number;
}

export interface LoginResponse {
    accessToken: string;
    expiresIn: number;
    user: UserInfo;
}

export interface RegisterClientResponse {
    accessToken: string;
    expiresIn: number;
    user: UserInfo;
}

export interface RegisterExpertResponse {
    accessToken: string;
    expiresIn: number;
    user: UserInfo;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
