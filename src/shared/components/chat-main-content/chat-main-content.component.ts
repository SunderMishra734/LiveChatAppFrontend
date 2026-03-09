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
  @Output() closeChat = new EventEmitter<void>();
  @ViewChild('messageContainer') messageContainer: any;
  @ViewChild('textArea') textArea!: any;
  @ViewChild('dotsMenuContainer') dotsMenuContainer!: ElementRef;
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
  isContactInfoVisible: boolean = false;
  isProfileImageModalVisible: boolean = false;
  isMenuVisible: boolean = false;
  isSearchPanelVisible: boolean = false;
  searchQuery: string = '';
  searchResults: MessageDto[] = [];
  currentMatchIndex: number = -1;
  searchHighlightTimeout: any = null;

  constructor(private chatService: ChatService, private signalRService: SignalrService) { }

  ngOnInit() {
    this.status = this.chattingUser?.onlineStatus === 1 ? 'Online' : 'Offline';
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
    this.isContactInfoVisible = false;
  }

  ngAfterViewInit() {
    this.textArea.nativeElement.addEventListener('input', () => {
      const el = this.textArea.nativeElement;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }

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

  getMessagesGroupedByDate(): { dateLabel: string; messages: MessageDto[] }[] {
    if (!this.messages?.length) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { dateLabel: string; messages: MessageDto[] }[] = [];
    let currentDateKey = '';
    let currentGroup: { dateLabel: string; messages: MessageDto[] } | null = null;

    for (const msg of this.messages) {
      const d = new Date(msg.timeStamp);
      d.setHours(0, 0, 0, 0);
      const dateKey = d.getTime().toString();

      if (dateKey !== currentDateKey) {
        currentDateKey = dateKey;
        let label: string;
        if (d.getTime() === today.getTime()) {
          label = 'Today';
        } else if (d.getTime() === yesterday.getTime()) {
          label = 'Yesterday';
        } else {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          label = `${day}/${month}/${d.getFullYear()}`;
        }
        currentGroup = { dateLabel: label, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup!.messages.push(msg);
    }
    return groups;
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
    if (this.emojiContainer?.nativeElement && !this.emojiContainer.nativeElement.contains(event.target)) {
      this.showEmojiPicker = false;
    }
    if (this.dotsMenuContainer?.nativeElement && !this.dotsMenuContainer.nativeElement.contains(event.target)) {
      this.isMenuVisible = false;
    }
  }

  toggleMenu(): void {
    this.isMenuVisible = !this.isMenuVisible;
  }

  onContactInfoMenu(): void {
    this.isMenuVisible = false;
    this.toggleContactInfo();
  }

  onCloseChatMenu(): void {
    this.isMenuVisible = false;
    this.closeChat.emit();
  }

  openSearchPanel(): void {
    this.isSearchPanelVisible = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.currentMatchIndex = -1;
  }

  closeSearchPanel(): void {
    this.isSearchPanelVisible = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.currentMatchIndex = -1;
    this.clearHighlight();
  }

  onSearchInput(): void {
    // Reset matches as user types to require enter to search
    this.searchResults = [];
    this.currentMatchIndex = -1;
    this.clearHighlight();
  }

  executeSearch(): void {
    if (!this.messages || !this.searchQuery.trim()) {
      this.searchResults = [];
      this.currentMatchIndex = -1;
      return;
    }
    
    const term = this.searchQuery.trim().toLowerCase();
    // Reverse array to put newest matches first like WhatsApp
    this.searchResults = [...this.messages].reverse().filter(m => 
      (m.message || '').toLowerCase().includes(term)
    );

    if (this.searchResults.length > 0) {
      this.currentMatchIndex = 0;
      this.jumpToCurrentMatch();
    } else {
      this.currentMatchIndex = -1;
    }
  }

  nextSearchMatch(): void {
    if (this.searchResults.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.searchResults.length;
    this.jumpToCurrentMatch();
  }

  prevSearchMatch(): void {
    if (this.searchResults.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.searchResults.length) % this.searchResults.length;
    this.jumpToCurrentMatch();
  }

  jumpToCurrentMatch(): void {
    const message = this.searchResults[this.currentMatchIndex];
    if (message) {
      this.scrollToMessage(message.id);
      this.highlightMessage(message.id);
    }
  }

  scrollToMessage(messageId: number): void {
    setTimeout(() => {
        const el = document.getElementById('msg-' + messageId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 50);
  }

  highlightMessage(messageId: number): void {
    this.clearHighlight();
    setTimeout(() => {
        const el = document.getElementById('msg-' + messageId);
        if (el) {
            // Apply a temporary background class to the actual bubble based on sender
            const bubble = el.querySelector('.common-chat-cls');
            if(bubble) {
                bubble.classList.add('search-highlight-active');
            }
            
            // Remove highlight after 2 seconds
            if(this.searchHighlightTimeout) clearTimeout(this.searchHighlightTimeout);
            this.searchHighlightTimeout = setTimeout(() => {
                this.clearHighlight();
            }, 2000);
        }
    }, 100);
  }

  clearHighlight(): void {
    const highlighted = document.querySelectorAll('.search-highlight-active');
    highlighted.forEach(el => el.classList.remove('search-highlight-active'));
  }

  toggleContactInfo() {
    this.isContactInfoVisible = !this.isContactInfoVisible;
  }

  openProfileImageModal(): void {
    if (this.chattingUser?.profilePicture) {
      this.isProfileImageModalVisible = true;
    }
  }

  closeProfileImageModal(): void {
    this.isProfileImageModalVisible = false;
  }
}
