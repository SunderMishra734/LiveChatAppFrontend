import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { MessageDto } from '../models/chat';
import { environment } from '../environments/environment';
import { UserStatusDto } from '../models/user-detail-dto';
import { Status } from '../models/enums.enum';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  constructor() { }

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/chatHub`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => { console.log('SignalR Connected'); })
      .catch(err => console.error('SignalR Connection Error:', err));
  }

  receiveMessages(callback: (messageDto: MessageDto) => void) {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  receiveChangeUserStatus(callback: (userStatusDto: UserStatusDto) => void) {
    this.hubConnection.on('ReceiveChangeUserStatus', callback);
  }

  // Send message to SignalR
  public sendMessage(messageDto: MessageDto) {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.error('SignalR is not connected. Cannot send message.');
      return;
    }

    this.hubConnection.invoke('SendMessage', messageDto)
      .catch(err => console.error(err));
  }

  public sendChangeUserStatus(status: Status) {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.error('SignalR is not connected. Cannot send message.');
      return;
    }

    this.hubConnection.invoke("SendChangeUserStatus", status.valueOf())
      .catch(err => console.error(err));
  }
}
