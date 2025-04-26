import { Component, Input, ViewChild } from '@angular/core';
import { ChatListDto, MessageDto, MessageRequestDto } from '../../../models/chat';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { SignalrService } from '../../../services/signalr.service';

@Component({
  selector: 'app-chat-main-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-main-content.component.html',
  styleUrl: './chat-main-content.component.css'
})
export class ChatMainContentComponent {
  @Input() chattingUser: ChatListDto | any;
  @Input() isUserSelected: boolean = false;
  @Input() loggedInUserId: number = 0;
  @ViewChild('messageContainer') messageContainer: any;
  messages?: MessageDto[];
  message: MessageDto | any;
  newMessage: string = '';
  status: string = '';
  currentUserId: number = 0;
  messageRequestDto?: MessageRequestDto;

  constructor(private chatService: ChatService, private signalRService: SignalrService) { }

  ngOnInit() {
    this.status = this.chattingUser?.onlineStatus === 1 ? 'Online' : 'Offline';
    this.getMessages(this.loggedInUserId, this.chattingUser.userID);
    this.signalRService.receiveMessages(messageDtoData => {
      if (this.currentUserId == messageDtoData.loggedInUserId && this.loggedInUserId == messageDtoData.contactUserId) {
        this.messages?.push(messageDtoData);
      }
    });
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      if (this.currentUserId == changeUserStatus.id) {
        this.chattingUser.onlineStatus = changeUserStatus.status;
        this.status = changeUserStatus.status === 1 ? 'Online' : 'Offline';
      }
    });
  }

  ngOnChanges(): void {
    this.status = this.chattingUser?.onlineStatus === 1 ? 'Online' : 'Offline';
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      if (this.currentUserId == changeUserStatus.id) {
        this.chattingUser.onlineStatus = changeUserStatus.status;
        this.status = changeUserStatus.status === 1 ? 'Online' : 'Offline';
      }
    });
    this.getMessages(this.loggedInUserId, this.chattingUser.userID);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  handleMessageInput(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      this.sendMessage();
      this.scrollToBottom();
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.message = {
        loggedInUserId: this.loggedInUserId,
        contactUserId: this.currentUserId,
        message: this.newMessage,
        isRead: false
      }
      this.chatService.saveMessages(this.message).subscribe({
        next: (response) => {
          this.messages?.push(response);
          this.signalRService.sendMessage(response);
        },
        error: (error) => {
          console.error("Error sending message:", error);
        }
      });
      this.newMessage = '';
    }
  }

  getMessages(loggedInUserId: number, contactUserId: number) {
    this.messageRequestDto = {
      loggedInUserId: loggedInUserId,
      contactUserId: contactUserId
    };
    this.currentUserId = contactUserId;
    this.chatService.getMessages(this.messageRequestDto).subscribe({
      next: (response) => {
        this.messages = response;
      },
      error: (error) => {
        console.error("Error sending message:", error);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }
}
