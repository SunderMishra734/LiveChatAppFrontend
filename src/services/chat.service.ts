import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { MessageDto, MessageRequestDto } from '../models/chat';
import { ApiService } from './api.service';
import { URLS } from '../shared/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  baseUrl: string = environment.apiUrl;

  constructor(private apiService: ApiService) { }

  getAllChatUser(): Observable<any> {
    const url = URLS.GetAllChat;
    return this.apiService.get<any>(url);
  }

  getMessages(contactUserId: number): Observable<any> {
    const url = URLS.GetMessages;
    const params = { contactUserId: contactUserId };
    return this.apiService.get<any>(url, params);
  }

  saveMessages(MessageDto: MessageDto): Observable<any> {
    const url = URLS.SaveMessages;
    return this.apiService.post<any>(url, MessageDto);
  }
}
