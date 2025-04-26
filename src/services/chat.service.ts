import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ChatListDto, MessageDto, MessageRequestDto } from '../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllChatUser(userId: number): Observable<ChatListDto[]> {
    const url = `${this.baseUrl}/chat/GetAllChattedUser/${userId}`;
    return this.http.get<ChatListDto[]>(url);
  }

  getMessages(messageRequestDto: MessageRequestDto): Observable<MessageDto[]> {
    const url = `${this.baseUrl}/chat/GetMessages`;
    return this.http.post<MessageDto[]>(url, messageRequestDto);
  }

  saveMessages(MessageDto: MessageDto): Observable<MessageDto>{
    const url = `${this.baseUrl}/chat/SaveMessages`;
    return this.http.post<MessageDto>(url, MessageDto);
  }
}
