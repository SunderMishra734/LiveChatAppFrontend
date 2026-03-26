import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, Subject } from 'rxjs';
import { AIChatMessageDto, AIChatSessionDto, AIRequestDto, AIRootResponse } from '../models/ai-chat';
import { URLS } from '../shared/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private sessionCreatedSource = new Subject<void>();
  sessionCreated$ = this.sessionCreatedSource.asObservable();

  constructor(private apiService: ApiService) { }

  notifySessionCreated(): void {
    this.sessionCreatedSource.next();
  }

  getAllSessions(): Observable<AIRootResponse<AIChatSessionDto[]>> {
    return this.apiService.get<AIRootResponse<AIChatSessionDto[]>>(URLS.GetAllSessions);
  }

  getSessionMessages(sessionId: number): Observable<AIRootResponse<AIChatMessageDto[]>> {
    return this.apiService.get<AIRootResponse<AIChatMessageDto[]>>(URLS.GetSessionMessages, { sessionId });
  }

  sendMessages(request: AIRequestDto): Observable<AIRootResponse<AIChatMessageDto>> {
    return this.apiService.post<AIRootResponse<AIChatMessageDto>>(URLS.SendMessage, request);
  }

  renameSession(sessionId: number, title: string): Observable<AIRootResponse<any>> {
    return this.apiService.post<AIRootResponse<any>>(URLS.RenameSession, { sessionId, title });
  }

  deleteSession(sessionId: number): Observable<AIRootResponse<any>> {
    return this.apiService.post<AIRootResponse<any>>(URLS.DeleteSession + `/${sessionId}`, null);
  }
}
