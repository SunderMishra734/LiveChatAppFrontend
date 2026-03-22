import { Component } from '@angular/core';
import { ChatMainContentComponent } from "../chat-main-content/chat-main-content.component";
import { ToasterMessageComponent } from "../toaster-message/toaster-message.component";
import { ChatListDto, ChattingUser, MessageDto } from '../../../models/chat';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat.service';
import { SharedUserService } from '../../../services/shared-user.service';
import { SignalrService } from '../../../services/signalr.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-chat-side-bar',
  standalone: true,
  imports: [ChatMainContentComponent, ToasterMessageComponent, CommonModule],
  templateUrl: './chat-side-bar.component.html',
  styleUrl: './chat-side-bar.component.css'
})
export class ChatSideBarComponent {
  selectedUser: any;
  isUserSelected: boolean = false;
  allChatUser?: ChatListDto[];
  filteredChatUsers?: ChatListDto[];
  loggedInUserId: number = 0;
  isAllUserPopVisible: boolean = false;
  allUser: any;
  currentSearchQuery: string = '';
  
  // Toaster variables
  isTaosterVisible: boolean = false;
  actionType: number = 0;
  mainMssg: string = '';
  descriptionMssg: string = '';

  constructor(private chatService: ChatService, private sharedUserService: SharedUserService, private signalRService: SignalrService, private userService: UserService) { }

  ngOnInit() {
    this.sharedUserService.loggedInUserId.subscribe(userId => {
      this.loggedInUserId = userId;
      this.chatService.getAllChatUser().subscribe(res => {
        if (res.success) {
            this.allChatUser = res.data.map((user: ChatListDto) => ({
            ...user,
            unreadCount: 0
          }));
          this.applyFilter();
        }
      });
    });
    this.sharedUserService.searchQuery$.subscribe(query => {
      this.currentSearchQuery = query;
      this.applyFilter();
    });
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      this.allChatUser!.forEach(element => {
        if (element.userId == changeUserStatus.userId) {
          element.onlineStatus = changeUserStatus.status;
        }
      });
    });

    this.signalRService.receiveMessages(messageDtoData => {
      // Only handle messages where the logged-in user is the receiver
      if (messageDtoData.contactUserId == this.loggedInUserId) {
        this.handleIncomingMessage(messageDtoData);
      }
    });
  }

  ngOnChanges(): void {
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      this.allChatUser!.forEach(element => {
        if (element.userId == changeUserStatus.userId) {
          element.onlineStatus = changeUserStatus.status;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.sharedUserService.setChatActive(false);
  }

  onCloseChat(): void {
    this.isUserSelected = false;
    this.selectedUser = undefined;
    this.sharedUserService.setChatActive(false);
  }

  selectUser(user: ChatListDto): void {
    this.selectedUser = user;
    this.isUserSelected = true;
    this.sharedUserService.setChatActive(true);
    // Mark messages as read for this user
    if (user.unreadCount && user.unreadCount > 0) {
      user.unreadCount = 0;
      const index = this.allChatUser?.findIndex(u => u.userId === user.userId);
      if (index !== undefined && index !== -1 && this.allChatUser) {
        this.allChatUser[index] = { ...this.allChatUser[index], unreadCount: 0, isRead: true };
      }
      this.applyFilter();
    }
  }

  isSelected(user: ChatListDto): boolean {
    return this.selectedUser?.userId === user.userId;
  }

  showAllUserPop() {
    this.isAllUserPopVisible = true;
    this.userService.getAllUser().subscribe(res => {
      if (res.success) {
        // Filter out logged in user and users we already have a chat with
        this.allUser = res.data.filter((u: any) => {
          if (u.userId === this.loggedInUserId) return false;
          return !this.allChatUser?.some(chatUser => chatUser.userId === u.userId);
        });
      }
    });
  }

  selectUserFromPopup(user: any) {
    const exists = this.allChatUser?.some((u: any) => u.userId === user.userId);
    if (!exists) {
      const newUser: ChatListDto = {
        userId: user.userId,
        fullName: user.fullName,
        profilePicture: user.profilePic,
        lastMessage: '',
        lastSeen: new Date(),
        onlineStatus: user.onlineStatus,
        lastMessageTime: new Date(),
        isRead: false,
        unreadCount: 0
      };
      this.selectedUser = newUser;
      this.allChatUser = [...(this.allChatUser ?? []), newUser];
      this.applyFilter();
    }
    this.isUserSelected = true;
    this.sharedUserService.setChatActive(true);
    this.isAllUserPopVisible = false;
  }

  onMessageSent(message: MessageDto): void {
    if (!this.allChatUser || !message) {
      return;
    }
    const contactId = message.contactUserId;

    const index = this.allChatUser.findIndex(u => u.userId === contactId);
    if (index === -1) {
      return;
    }

    const user = this.allChatUser[index];
    const updatedUser: ChatListDto = {
      ...user,
      lastMessage: message.message,
      lastMessageTime: message.timeStamp,
      isRead: true,
      unreadCount: 0
    };

    const remaining = this.allChatUser.filter((_, i) => i !== index);
    this.allChatUser = [updatedUser, ...remaining];
    this.applyFilter();
  }

  private handleIncomingMessage(message: MessageDto): void {
    if (!this.allChatUser) {
      return;
    }

    const contactId = message.loggedInUserId; // sender id
    const index = this.allChatUser.findIndex(u => u.userId === contactId);
    if (index === -1) {
      return;
    }

    const user = this.allChatUser[index];
    const isActiveChat = this.selectedUser?.userId === contactId;

    const updatedUser: ChatListDto = {
      ...user,
      lastMessage: message.message,
      lastMessageTime: message.timeStamp,
      isRead: isActiveChat,
      unreadCount: isActiveChat ? 0 : (user.unreadCount ?? 0) + 1
    };

    const remaining = this.allChatUser.filter((_, i) => i !== index);
    this.allChatUser = [updatedUser, ...remaining];
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.allChatUser) {
      this.filteredChatUsers = [];
      return;
    }
    const term = this.currentSearchQuery.trim().toLowerCase();
    if (!term) {
      this.filteredChatUsers = [...this.allChatUser];
      return;
    }
    this.filteredChatUsers = this.allChatUser.filter(user => {
      const name = user.fullName?.toLowerCase() ?? '';
      const lastMessage = user.lastMessage?.toLowerCase() ?? '';
      return name.includes(term) || lastMessage.includes(term);
    });
  }

  onChatDeleted(userId: number): void {
    this.mainMssg = 'Chat deleted!';
    this.descriptionMssg = `The chat has been successfully deleted.`;
    this.showToasterMessage(1);
    
    // Refresh the list from the server to ensure consistency
    this.chatService.getAllChatUser().subscribe(res => {
      if (res.success) {
        this.allChatUser = res.data.map((user: ChatListDto) => ({
          ...user,
          unreadCount: 0
        }));
        this.applyFilter();
      }
    });
    
    // Close the current chat view
    this.onCloseChat();
  }

  showToasterMessage(actType: number) {
    this.isTaosterVisible = true;
    this.actionType = actType;
    setTimeout(() => {
      this.isTaosterVisible = false;
    }, 2500);
  }

}
