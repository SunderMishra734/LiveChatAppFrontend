import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { SharedUserService } from '../../services/shared-user.service';
import { SignalrService } from '../../services/signalr.service';
import { Status } from '../../models/enums.enum';
import { UserStatusDto } from '../../models/user-detail-dto';

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
  userDetails: any;
  userId: any;
  userFullName: string = "";
  userEmail: string = "";
  profilePic: string = "";
  changeUserStatusDto!: UserStatusDto;

  constructor(private router: Router, private elementRef: ElementRef, private authService: AuthService, private userService: UserService, private sharedUserService: SharedUserService, private signalRService: SignalrService) { }

  ngOnInit(): void {
    this.getUserId();
    if (this.userId) {
      this.getUserDetails();
    }
    // Subscribe to shared userDetails
    this.sharedUserService.currentUserDetails.subscribe(details => {
      if (details) {
        this.userDetails = details;
        this.userFullName = details.fullName;
        this.userEmail = details.email;
        this.profilePic = details.profilePic;
      }
    });
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
    this.userService.changeUserStatus(Status.Offline).subscribe();
    this.authService.logOut();
  }

  getUserId(): void {
    this.userId = this.authService.getUserId();
    this.sharedUserService.addLoggedInUserId(this.userId);
    this.signalRService.startConnection();
  }

  getUserDetails(): void {
    this.userService.getUserDetails().subscribe({
      next: (data) => {
        if (data.success) {
          this.userDetails = data.data;
          this.sharedUserService.updateUserDetails(this.userDetails);
          this.userFullName = this.userDetails.fullName;
          this.userEmail = this.userDetails.email;
          this.profilePic = this.userDetails.profilePic;
          this.userService.changeUserStatus(Status.Online).subscribe();
        }
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
      }
    });
  }
}
