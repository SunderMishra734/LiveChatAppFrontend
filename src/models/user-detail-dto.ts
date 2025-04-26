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
}

export interface ChangeUserStatusDto{
    id: number;
    status: number;
}
