export interface Customer {
    id: number;
    name?: string;
    email?: string;
    contactNumber?: string;
    isExpired: boolean;
    expiryDate: Date;
    websiteURL?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    timeZone?: string;
    logoURL?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    industryType?: string;
}

export interface User {
    cId: number;
    userName: string;
    email: string;
    ur: number;
    fullName: string;
    phoneNumber: string;
    gender: number;
    dob: Date;
}
