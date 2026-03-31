import { Component, EventEmitter, OnInit, Output, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../../services/ai-chat.service';
import { SharedUserService } from '../../../services/shared-user.service';
import { AIChatSessionDto } from '../../../models/ai-chat';

@Component({
  selector: 'app-ai-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-sidebar.component.html',
  styleUrl: './ai-chat-sidebar.component.css'
})
export class AiChatSidebarComponent implements OnInit {
  sessions: AIChatSessionDto[] = [];
  filteredSessions: AIChatSessionDto[] = [];
  selectedSessionId: number | null = null;
  isLoading: boolean = false;
  
  // Session Management State
  activeMenuSessionId: number | null = null;
  editingSessionId: number | null = null;
  editTitle: string = '';
  isDeleteModalVisible: boolean = false;
  sessionToDelete: AIChatSessionDto | null = null;
  searchQuery: string = '';

  @ViewChild('renameInput') renameInput!: ElementRef;

  @Output() sessionSelected = new EventEmitter<AIChatSessionDto | null>();
  @Output() exitAi = new EventEmitter<void>();

  constructor(private aiChatService: AiChatService, private sharedUserService: SharedUserService) { }

  ngOnInit(): void {
    this.loadSessions();
    this.aiChatService.sessionCreated$.subscribe(() => {
      this.loadSessions();
    });

    // Subscribe to shared search query
    this.sharedUserService.searchQuery$.subscribe(query => {
      this.searchQuery = query;
      this.applyFilter();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.activeMenuSessionId = null;
  }

  loadSessions(): void {
    this.isLoading = true;
    this.aiChatService.getAllSessions().subscribe({
      next: (res) => {
        if (res.success) {
          this.sessions = res.data;
          this.applyFilter();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading AI sessions:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredSessions = [...this.sessions];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredSessions = this.sessions.filter(s => 
        s.title.toLowerCase().includes(query)
      );
    }
  }

  selectSession(session: AIChatSessionDto | null): void {
    if (this.editingSessionId) return; // Don't switch if renaming
    this.selectedSessionId = session?.sessionId ?? 0;
    this.sessionSelected.emit(session);
  }

  createNewChat(): void {
    this.selectSession(null);
  }

  // --- Session Management Methods ---
  
  toggleMenu(event: MouseEvent, sessionId: number): void {
    event.stopPropagation();
    this.activeMenuSessionId = this.activeMenuSessionId === sessionId ? null : sessionId;
  }

  startRename(session: AIChatSessionDto): void {
    this.editingSessionId = session.sessionId;
    this.editTitle = session.title;
    this.activeMenuSessionId = null;
    
    // Auto focus the input field
    setTimeout(() => {
      if (this.renameInput) {
        this.renameInput.nativeElement.focus();
        this.renameInput.nativeElement.select();
      }
    }, 0);
  }

  saveRename(): void {
    if (!this.editingSessionId) return;
    const sessionId = this.editingSessionId;
    const newTitle = this.editTitle.trim();

    if (newTitle && newTitle !== this.sessions.find(s => s.sessionId === sessionId)?.title) {
      this.aiChatService.renameSession(sessionId, newTitle).subscribe({
        next: (res) => {
          if (res.success) {
            const session = this.sessions.find(s => s.sessionId === sessionId);
            if (session) session.title = newTitle;
          }
        },
        error: (err) => console.error('Error renaming session:', err)
      });
    }
    this.editingSessionId = null;
  }

  cancelRename(): void {
    this.editingSessionId = null;
  }

  openDeleteModal(session: AIChatSessionDto): void {
    this.sessionToDelete = session;
    this.isDeleteModalVisible = true;
    this.activeMenuSessionId = null;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.sessionToDelete = null;
  }

  confirmDelete(): void {
    if (!this.sessionToDelete) return;
    const sessionId = this.sessionToDelete.sessionId;
    
    this.aiChatService.deleteSession(sessionId).subscribe({
      next: (res) => {
        if (res.success) {
          this.sessions = this.sessions.filter(s => s.sessionId !== sessionId);
          if (this.selectedSessionId === sessionId) {
            this.selectSession(null);
          }
        }
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        this.closeDeleteModal();
      }
    });
  }

  getDisplayDate(session: AIChatSessionDto): string {
    const defaultDate = '0001-01-01T00:00:00';
    if (!session.updatedAt || session.updatedAt.startsWith(defaultDate)) {
      return session.createdAt;
    }
    return session.updatedAt;
  }
}
