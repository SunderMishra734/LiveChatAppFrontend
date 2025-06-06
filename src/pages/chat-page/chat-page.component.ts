import { Component } from '@angular/core';
import { ChatSideBarComponent } from "../../shared/components/chat-side-bar/chat-side-bar.component";
import { ChatMainContentComponent } from "../../shared/components/chat-main-content/chat-main-content.component";

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatSideBarComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class ChatPageComponent {

}
