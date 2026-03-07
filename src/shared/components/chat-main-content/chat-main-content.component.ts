import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
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
  @Input() chattingUser?: ChatListDto;
  @Input() isUserSelected: boolean = false;
  @Input() loggedInUserId: number = 0;
  @Output() messageSent = new EventEmitter<MessageDto>();
  @ViewChild('messageContainer') messageContainer: any;
  @ViewChild('textArea') textArea!: any;
  messages?: MessageDto[];
  message: MessageDto | any;
  newMessage: string = '';
  status: string = '';
  currentUserId: number = 0;
  messageRequestDto?: MessageRequestDto;
  showEmojiPicker = false;
  emojis: string[] = [
    "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😎",
    "😢", "😭", "😡", "👍", "🙏", "🔥", "❤️", "🎉"
  ];
  @ViewChild('emojiContainer') emojiContainer!: ElementRef;

  constructor(private chatService: ChatService, private signalRService: SignalrService) { }

  ngOnInit() {
    this.status = this.chattingUser?.onlineStatus === 1 ? 'Online' : 'Offline';
    console.log("Chatting User:", this.chattingUser);
    this.getMessages(this.chattingUser!.userId);
    this.signalRService.receiveMessages(messageDtoData => {
      if (this.currentUserId == messageDtoData.loggedInUserId && this.loggedInUserId == messageDtoData.contactUserId) {
        this.messages?.push(messageDtoData);
      }
    });
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      if (this.currentUserId == changeUserStatus.status) {
        this.chattingUser!.onlineStatus = changeUserStatus.status;
        this.status = changeUserStatus.status === 1 ? 'Online' : 'Offline';
      }
    });
  }

  ngOnChanges(): void {
    this.status = this.chattingUser?.onlineStatus === 1 ? 'Online' : 'Offline';
    this.signalRService.receiveChangeUserStatus(changeUserStatus => {
      if (this.currentUserId == changeUserStatus.status) {
        this.chattingUser!.onlineStatus = changeUserStatus.status;
        this.status = changeUserStatus.status === 1 ? 'Online' : 'Offline';
      }
    });
    this.getMessages(this.chattingUser!.userId);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngAfterViewInit() {
    this.textArea.nativeElement.addEventListener('input', () => {
      const el = this.textArea.nativeElement;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }

  // handleMessageInput(event: KeyboardEvent): void {
  //   if (event.key === 'Enter' && !event.shiftKey) {
  //     event.preventDefault();
  //     this.sendMessage();
  //     this.scrollToBottom();
  //   }
  // }

  handleMessageInput(event: KeyboardEvent, chatInput: HTMLElement): void {

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.newMessage = chatInput.innerText.trim();
      if (this.newMessage) {
        this.sendMessage();
        this.scrollToBottom();
        // clear input
        chatInput.innerHTML = '';
      }
    }
  }
  send(chatInput: HTMLElement): void {
    this.newMessage = chatInput.innerText.trim();
    if (this.newMessage) {
      this.sendMessage();
      this.scrollToBottom();
      // clear input
      chatInput.innerHTML = '';
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
        next: (res) => {
          if (res.success) {
            this.messages?.push(res.data);
            this.signalRService.sendMessage(res.data);
            this.messageSent.emit(res.data);
          }
        },
        error: (error) => {
          console.error("Error sending message:", error);
        }
      });
      this.newMessage = '';
    }
  }

  getMessages(contactUserId: number) {
    this.currentUserId = contactUserId;
    this.chatService.getMessages(contactUserId).subscribe({
      next: (res) => {
        if (res.success) {
          this.messages = res.data;
        }
        else {
          this.messages = [];
        }
        this.scrollToBottom();
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

  checkEmpty(element: HTMLElement) {
    if (element.innerText.trim() === '') {
      element.innerHTML = '';
    }
  }

  toggleEmojiPicker(event: Event) {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string, chatInput: HTMLElement) {

    chatInput.innerText += emoji;
    chatInput.focus();

  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {

    if (!this.emojiContainer.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    }

  }
}
