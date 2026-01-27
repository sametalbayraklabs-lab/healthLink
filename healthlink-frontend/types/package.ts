export interface ServicePackage {
    id: number;
    name: string;
    description?: string;
    expertType: string;
    serviceType: string;
    sessionCount: number;
    durationMinutes: number;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ClientPackage {
    id: number;
    clientId: number;
    packageId: number;
    remainingSessions: number;
    purchaseDate: string;
    expiryDate?: string;
    isActive: boolean;
    package?: ServicePackage;
}

export interface PurchasePackageRequest {
    packageId: number;
    discountCode?: string;
}

export interface PurchasePackageResponse {
    clientPackage: ClientPackage;
    payment: {
        id: number;
        amount: number;
        status: string;
    };
}
