import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiChatSidebarComponent } from '../../shared/components/ai-chat-sidebar/ai-chat-sidebar.component';
import { AiChatContentComponent } from '../../shared/components/ai-chat-content/ai-chat-content.component';
import { AIChatSessionDto } from '../../models/ai-chat';
import { SharedUserService } from '../../services/shared-user.service';
import { OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ai-chat-page',
  standalone: true,
  imports: [CommonModule, AiChatSidebarComponent, AiChatContentComponent],
  templateUrl: './ai-chat-page.component.html',
  styleUrl: './ai-chat-page.component.css'
})
export class AiChatPageComponent implements OnInit, OnDestroy {
  selectedSession: AIChatSessionDto | null = null;
  showMobileHistory: boolean = false;

  constructor(
    private sharedUserService : SharedUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Hide global bottom nav immediately upon entering AI section
    // Wrapped in setTimeout to prevent NG0100 error on initial load
    setTimeout(() => {
      this.sharedUserService.setChatActive(true);
    }, 0);
  }

  ngOnDestroy(): void {
    this.sharedUserService.setChatActive(false);
  }

  onSessionSelected(session: AIChatSessionDto | null): void {
    this.selectedSession = session;
    this.showMobileHistory = false; // Auto-close on selection
    this.sharedUserService.setChatActive(true);
  }

  onBack(): void {
    if (this.selectedSession) {
      // If in a session, return to history list
      this.selectedSession = null;
    } else {
      // If already at history/welcome, exit AI section
      this.onExitAi();
    }
  }

  onExitAi(): void {
    this.sharedUserService.setChatActive(false);
    this.router.navigate(['/app/chat']);
  }

  toggleMobileHistory(): void {
    this.showMobileHistory = !this.showMobileHistory;
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
}
