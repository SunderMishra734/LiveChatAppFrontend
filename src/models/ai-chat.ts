import { SenderType } from "./enums.enum";

export interface AIChatSessionDto {
    sessionId: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface AIChatMessageDto {
    aiMessageId: number;
    sessionId: number;
    sender: SenderType;
    message?: string;     // From SendMessage response
    messageText?: string; // From GetSessionMessages response
    createdAt: Date;
    corporateId?: number;
    userId?: number;
}

export interface AIRequestDto {
    sessionId: number;
    message: string;
}

export interface AIRootResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
