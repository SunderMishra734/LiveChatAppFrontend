export class Chat {
}

export class ChattingUser {
    id: number;
    name: string;
    lastMessaage: string;
    time: string;
    status: boolean;
    imgUrl: string;

    constructor() {
        this.id = 0;
        this.name = '';
        this.lastMessaage = '';
        this.time = '';
        this.status = false;
        this.imgUrl = '';
    }
}

export class Messages {
    id: number;
    senderId: number;
    receiverId: number;
    text?: string;
    mediaUrl?: string;
    messageType: 'text' | 'media' | 'system';
    timestamp: string;
    isRead: boolean;

    constructor() {
        this.id = 0;
        this.senderId = 0;
        this.receiverId = 0;
        this.text = '';
        this.messageType = 'text';
        this.timestamp = '00:00';
        this.isRead = false;
    }
}

export interface ChatListDto {
    userID: number;
    username: string;
    profilePicture: string;
    lastSeen: Date;
    onlineStatus: number;
    lastMessage: string;
    lastMessageTime: Date,
    isRead: boolean;
}

export interface MessageRequestDto {
    loggedInUserId: number;
    contactUserId?: number;
}

export interface MessageDto {
    id: number;
    loggedInUserId: number;
    contactUserId: number;
    message: string;
    messageType: string;
    timeStamp: Date;
    isRead: boolean;
}