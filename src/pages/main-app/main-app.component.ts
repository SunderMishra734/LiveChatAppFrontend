import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ChangeUserStatusDto, UserDetailDto } from '../../models/user-detail-dto';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { SharedUserService } from '../../services/shared-user.service';
import { SignalrService } from '../../services/signalr.service';

@Component({
  selector: 'app-main-app',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule],
  templateUrl: './main-app.component.html',
  styleUrl: './main-app.component.css'
})
export class MainAppComponent {
  @ViewChild('userProfileContainer') userProfileContainer!: ElementRef;
  loading: boolean = false;
  isUserProfileVisible: boolean = false;
  searchQuery: string = '';
  userDetails?: UserDetailDto;
  userId: any;
  userFullName: string = "";
  userEmail: string = "";
  changeUserStatusDto!: ChangeUserStatusDto;

  constructor(private router: Router, private elementRef: ElementRef, private authService: AuthService, private userService: UserService, private sharedUserService: SharedUserService, private signalRService: SignalrService) { }

  ngOnInit(): void {
    this.getUserId();  // Get the user ID on initialization
    if (this.userId) {
      this.getUserDetails(this.userId);  // Fetch user details if userId is available
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isUserProfileVisible && !this.userProfileContainer.nativeElement.contains(event.target)) {
      this.isUserProfileVisible = false;
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['app/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  userProfileFn() {
    this.isUserProfileVisible = !this.isUserProfileVisible;
  }

  showProfileFn() {
    this.router.navigate(['app/profile']);
    this.isUserProfileVisible = false;
  }

  logOutFn() {
    this.router.navigate(['login']);
    this.changeUserStatusDto = {
      id: Number(this.userId),
      status: 0
    };
    this.userService.changeUserStatus(this.changeUserStatusDto).subscribe(() => {
    });
    this.signalRService.sendChangeUserStatus(this.changeUserStatusDto);
  }

  getUserId(): void {
    this.userId = this.authService.getUserId();
    this.sharedUserService.addLoggedInUserId(this.userId);
    this.signalRService.startConnection();
  }

  getUserDetails(userId: number): void {
    this.userService.getUserDetails(userId).subscribe({
      next: (data) => {
        this.userDetails = data;
        this.sharedUserService.updateUserDetails(this.userDetails);
        this.userFullName = this.userDetails.fullName;
        this.userEmail = this.userDetails.email;
        this.changeUserStatusDto = {
          id: Number(this.userId),
          status: 1
        };
        this.userService.changeUserStatus(this.changeUserStatusDto).subscribe(() => {
          setTimeout(() => {
            this.signalRService.sendChangeUserStatus(this.changeUserStatusDto);
          }, 3000);
        });
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
      }
    });
  }
}
