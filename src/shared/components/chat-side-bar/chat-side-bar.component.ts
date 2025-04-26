import { Component } from '@angular/core';
import { ChatMainContentComponent } from "../chat-main-content/chat-main-content.component";
import { ChatListDto, ChattingUser } from '../../../models/chat';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat.service';
import { SharedUserService } from '../../../services/shared-user.service';
import { SignalrService } from '../../../services/signalr.service';

@Component({
  selector: 'app-chat-side-bar',
  standalone: true,
  imports: [ChatMainContentComponent, CommonModule],
  templateUrl: './chat-side-bar.component.html',
  styleUrl: './chat-side-bar.component.css'
})
export class ChatSideBarComponent {
  selectedUser?: ChatListDto;
  isUserSelected: boolean = false;
  allChatUser!: ChatListDto[];
  loggedInUserId: number = 0;

  constructor(private chatService: ChatService, private sharedUserService: SharedUserService, private signalRService: SignalrService) { }

  ngOnInit() {
    this.sharedUserService.loggedInUserId.subscribe(userId => {
      this.loggedInUserId = userId;
      this.chatService.getAllChatUser(this.loggedInUserId).subscribe(userChatDetails => {
        this.allChatUser = userChatDetails;
      });
    });
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      this.allChatUser.forEach(element => {
        if (element.userID == changeUserStatus.id) {
          element.onlineStatus = changeUserStatus.status;
        }
      });
    });
    this.signalRService.receiveMessages(messageDtoData => {
      this.allChatUser.forEach(element => {
        if ((element.userID == messageDtoData.contactUserId && this.loggedInUserId != messageDtoData.contactUserId) || (element.userID == messageDtoData.loggedInUserId && this.loggedInUserId != messageDtoData.loggedInUserId)) {
          element.lastMessage = messageDtoData.message;
          element.lastSeen = messageDtoData.timeStamp;
        }
      });
    });
  }

  ngOnChanges(): void {
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      this.allChatUser.forEach(element => {
        if (element.userID == changeUserStatus.id) {
          element.onlineStatus = changeUserStatus.status;
        }
      });
    });
    this.signalRService.receiveMessages(messageDtoData => {
      this.allChatUser.forEach(element => {
        if ((element.userID == messageDtoData.contactUserId) || (element.userID == messageDtoData.loggedInUserId  && this.loggedInUserId != messageDtoData.loggedInUserId)) {
          element.lastMessage = messageDtoData.message;
          element.lastSeen = messageDtoData.timeStamp;
        }
      });
    });
  }

  selectUser(user: ChatListDto): void {
    this.selectedUser = user;
    this.isUserSelected = true;
  }

  isSelected(user: ChatListDto): boolean {
    return this.selectedUser?.userID === user.userID;
  }

}
