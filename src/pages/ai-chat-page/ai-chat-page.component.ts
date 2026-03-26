import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiChatSidebarComponent } from '../../shared/components/ai-chat-sidebar/ai-chat-sidebar.component';
import { AiChatContentComponent } from '../../shared/components/ai-chat-content/ai-chat-content.component';
import { AIChatSessionDto } from '../../models/ai-chat';

@Component({
  selector: 'app-ai-chat-page',
  standalone: true,
  imports: [CommonModule, AiChatSidebarComponent, AiChatContentComponent],
  templateUrl: './ai-chat-page.component.html',
  styleUrl: './ai-chat-page.component.css'
})
export class AiChatPageComponent {
  selectedSession: AIChatSessionDto | null = null;
  showMobileHistory: boolean = false;

  onSessionSelected(session: AIChatSessionDto | null): void {
    this.selectedSession = session;
    this.showMobileHistory = false; // Auto-close on selection
  }

  toggleMobileHistory(): void {
    this.showMobileHistory = !this.showMobileHistory;
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
}
