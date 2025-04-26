import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserStatusService } from '../services/user-status.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LiveChatApp';
  constructor(private authService : AuthService, private userStatusService: UserStatusService) {
    // Service constructor will be called, event listeners will be registered
  }
}
