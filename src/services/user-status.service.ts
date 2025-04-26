import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID, OnDestroy, HostListener } from '@angular/core';
import { SignalrService } from './signalr.service';
import { UserService } from './user.service';
import { ChangeUserStatusDto } from '../models/user-detail-dto';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserStatusService implements OnDestroy {
  changeUserStatusDto!: ChangeUserStatusDto;
  userId: any;
  baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService, private userService: UserService, private signalRService: SignalrService, @Inject(PLATFORM_ID) private platformId: Object) {
    if (typeof window !== 'undefined' && this.authService.isLoggedIn()) {
      this.userId = this.authService.getUserId();
    }
    if(typeof window !== 'undefined'){
      setTimeout(()=>{
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        window.addEventListener('unload', this.handleBeforeUnload);
      }, 0)
    }
  }

  private handleBeforeUnload = (event: Event) => {
    const changeUserStatusDto: ChangeUserStatusDto = {
      id: this.userId,
      status: 0
    };
    const url = `${this.baseUrl}/User/ChangeUserStatus`;
    const blob = new Blob([JSON.stringify(changeUserStatusDto)], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    this.signalRService.sendChangeUserStatus(changeUserStatusDto);
  };

  ngOnDestroy(): void {
    if(typeof window !== 'undefined'){
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      window.removeEventListener('unload', this.handleBeforeUnload);
    }
  }

  // @HostListener('window:beforeunload', ['$event'])
  // onBeforeUnload(event: BeforeUnloadEvent){
  //   setTimeout(()=>{
  //     const changeUserStatusDto: ChangeUserStatusDto = {
  //       id: this.userId,
  //       status: 0
  //     };
  //     // const url = `${this.baseUrl}/User/ChangeUserStatus`;
  //     // const blob = new Blob([JSON.stringify(changeUserStatusDto)], { type: 'application/json' });
  //     // navigator.sendBeacon(url, blob);
  //     // this.signalRService.sendChangeUserStatus(changeUserStatusDto);
  //     this.userService.changeUserStatus(changeUserStatusDto).subscribe(() => {
  //     });
  //   }, 0);
  // }
  
}
