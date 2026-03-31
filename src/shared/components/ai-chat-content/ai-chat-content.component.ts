import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../../services/ai-chat.service';
import { AIChatMessageDto, AIChatSessionDto, AIRequestDto } from '../../../models/ai-chat';
import { SenderType } from '../../../models/enums.enum';

@Component({
  selector: 'app-ai-chat-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-content.component.html',
  styleUrl: './ai-chat-content.component.css'
})
export class AiChatContentComponent implements OnChanges, AfterViewChecked {
  @Input() session: AIChatSessionDto | null = null;
  @Output() menuClicked = new EventEmitter<void>();
  @Output() backClicked = new EventEmitter<void>();
  messages: AIChatMessageDto[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  waitingMessage: string = '';
  senderType = SenderType;
  private shouldScroll: boolean = false;
  private waitingTimer: any;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(private aiChatService: AiChatService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session']) {
      this.shouldScroll = true;
      this.waitingMessage = '';
      if (this.waitingTimer) clearTimeout(this.waitingTimer);
      if (this.session) {
        this.loadMessages(this.session.sessionId);
      } else {
        this.messages = [];
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadMessages(sessionId: number): void {
    this.isLoading = true;
    this.aiChatService.getSessionMessages(sessionId).subscribe({
      next: (res) => {
        if (res.success) {
          this.messages = res.data;
          this.shouldScroll = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userMessage: AIChatMessageDto = {
      aiMessageId: 0,
      sessionId: this.session?.sessionId ?? 0,
      sender: SenderType.User,
      message: this.newMessage,
      messageText: this.newMessage,
      createdAt: new Date()
    };

    // Optimistically add user message
    const messageToSend = this.newMessage.trim();
    this.messages.push({ ...userMessage, message: messageToSend, messageText: messageToSend });
    this.newMessage = '';
    this.shouldScroll = true;
    this.isLoading = true;

    const request: AIRequestDto = {
      sessionId: this.session?.sessionId ?? 0,
      message: messageToSend
    };

    this.waitingMessage = '';
    if (this.waitingTimer) clearTimeout(this.waitingTimer);
    this.waitingTimer = setTimeout(() => {
      if (this.isLoading) {
        this.waitingMessage = 'Processing taking a little more time than usual...';
        this.shouldScroll = true;
      }
    }, 10000);

    this.aiChatService.sendMessages(request).subscribe({
      next: (res) => {
        if (this.waitingTimer) clearTimeout(this.waitingTimer);
        this.waitingMessage = '';
        if (res.success) {
          // If it was a new session, we'll get a real session id back
          if (this.session === null || this.session.sessionId === 0) {
            this.aiChatService.notifySessionCreated();
            this.session = { sessionId: res.data.sessionId, title: messageToSend } as any;
          }

          const aiResponse: AIChatMessageDto = {
            aiMessageId: Date.now(), // Generate a temp ID
            sessionId: res.data.sessionId,
            sender: SenderType.AI,
            message: '', // Start empty for typing effect
            messageText: '',
            createdAt: new Date(),
            corporateId: res.data.corporateId,
            userId: res.data.userId
          };
          this.messages.push(aiResponse);
          this.simulateTyping(res.data.message || '', aiResponse);
        }
        this.isLoading = false;
      },
      error: (err) => {
        if (this.waitingTimer) clearTimeout(this.waitingTimer);
        this.waitingMessage = '';
        console.error('Error sending message:', err);
        this.isLoading = false;
      }
    });
  }

  private simulateTyping(fullText: string, aiMessage: AIChatMessageDto): void {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx >= fullText.length) {
        clearInterval(interval);
        return;
      }
      
      aiMessage.message += fullText[currentIdx];
      aiMessage.messageText += fullText[currentIdx];
      currentIdx++;
      this.shouldScroll = true;
    }, 20); // Typing speed
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
