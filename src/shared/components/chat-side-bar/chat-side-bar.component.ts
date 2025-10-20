import { Component } from '@angular/core';
import { ChatMainContentComponent } from "../chat-main-content/chat-main-content.component";
import { ChatListDto, ChattingUser } from '../../../models/chat';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat.service';
import { SharedUserService } from '../../../services/shared-user.service';
import { SignalrService } from '../../../services/signalr.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-chat-side-bar',
  standalone: true,
  imports: [ChatMainContentComponent, CommonModule],
  templateUrl: './chat-side-bar.component.html',
  styleUrl: './chat-side-bar.component.css'
})
export class ChatSideBarComponent {
  selectedUser: any;
  isUserSelected: boolean = false;
  allChatUser?: ChatListDto[];
  loggedInUserId: number = 0;
  isAllUserPopVisible: boolean = false;
  allUser: any;

  constructor(private chatService: ChatService, private sharedUserService: SharedUserService, private signalRService: SignalrService, private userService: UserService) { }

  ngOnInit() {
    this.sharedUserService.loggedInUserId.subscribe(userId => {
      this.loggedInUserId = userId;
      this.chatService.getAllChatUser().subscribe(res => {
        if (res.success) {
          this.allChatUser = res.data;
        }
      });
    });
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      this.allChatUser!.forEach(element => {
        if (element.userId == changeUserStatus.userId) {
          element.onlineStatus = changeUserStatus.status;
        }
      });
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

  selectUser(user: ChatListDto): void {
    this.selectedUser = user;
    this.isUserSelected = true;
  }

  isSelected(user: ChatListDto): boolean {
    return this.selectedUser?.userId === user.userId;
  }

  showAllUserPop() {
    this.isAllUserPopVisible = true;
    this.userService.getAllUser().subscribe(res => {
      if (res.success) {
        this.allUser = res.data;
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
        isRead: false
      };
      this.selectedUser = newUser;
      this.allChatUser = [...(this.allChatUser ?? []), newUser];
    }
    this.isUserSelected = true;
    this.isAllUserPopVisible = false;
  }

}
