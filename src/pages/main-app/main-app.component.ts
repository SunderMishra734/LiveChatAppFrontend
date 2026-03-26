import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  isSearchVisible: boolean = true;
  isChatActive: boolean = false;

  constructor(private router: Router, private elementRef: ElementRef, private authService: AuthService, private userService: UserService, private sharedUserService: SharedUserService, private signalRService: SignalrService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide on profile and setting pages
      if (event.urlAfterRedirects.includes('/app/profile') || event.urlAfterRedirects.includes('/app/setting')) {
        this.isSearchVisible = false;
      } else {
        this.isSearchVisible = true;
      }
    });
  }

  ngOnInit(): void {
    this.sharedUserService.updateSearchQuery(this.searchQuery);
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

    // Track active chat state to conditionally hide overlapping panels
    this.sharedUserService.chatActive$.subscribe(isActive => {
      this.isChatActive = isActive;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: any): void {
    // Use keepalive fetch to ensure request completes even if window is closed immediately
    this.userService.changeUserStatusKeepAlive(Status.Offline);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isUserProfileVisible && !this.userProfileContainer.nativeElement.contains(event.target)) {
      this.isUserProfileVisible = false;
    }
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.sharedUserService.updateSearchQuery(this.searchQuery);
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
