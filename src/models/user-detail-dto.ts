import { Gender } from "./enums.enum";

export interface UserDetailDto {
    fullName: string;
    email: string;
    bio: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    profileStatus: string;
    lastSeen: Date;
    onlineStatus: number;
    languagePreference: number;
    timeZone: string;
    updatedAt: Date;
    profilePic: string;
    gender: Gender;
}

export interface UserStatusDto{
    corporateId: number;
    userId: number;
    status: number;
}
