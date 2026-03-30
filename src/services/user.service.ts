import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { UserDetailDto } from '../models/user-detail-dto';
import { URLS } from '../shared/config/api.config';
import { ApiService } from './api.service';
import { BlockedUserDto } from '../models/blocked-user-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl: string = environment.apiUrl;

  constructor(private apiService: ApiService) { }


  getUserDetails(): Observable<any> {
    const url = URLS.GetUser; 
    return this.apiService.get<any>(url);
  }

  getAllUser(): Observable<any> {
    const url = URLS.GetAllUser;
    return this.apiService.get<any>(url);
  }

  updateUserProfile(userDetails: UserDetailDto): Observable<any> {
    const url = URLS.UpdateUser;
    return this.apiService.post(url, userDetails);
  }

  changeUserStatus(status: number) {
    const url = URLS.ChangeUserStatus;
    return this.apiService.post(url, status);
  }

  changeUserStatusKeepAlive(status: number): void {
    const url = URLS.ChangeUserStatus;
    const token = localStorage.getItem('token');
    
    // Use native fetch with keepalive to ensure request completes after window close
    if (token) {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(status),
        keepalive: true
      });
    }
  }

  createUser(userDetails: any): Observable<any> {
    const url = URLS.CreateUser;
    return this.apiService.post(url, userDetails);
  }
  
  uploadProfileImage(userDetails: any): Observable<any> {
    const url = URLS.UploadFile;
    return this.apiService.post(url, userDetails);
  }

  deleteProfileImage(fileData: any): Observable<any> {
    const url = URLS.DeleteFile;
    return this.apiService.post(url, fileData);
  }

  deleteUser(): Observable<any> {
    const url = URLS.DeleteUser;
    return this.apiService.delete(url, null);
  }

  submitFeedback(feedbackData: any): Observable<any> {
    const url = URLS.SubmitFeedback;
    return this.apiService.post(url, feedbackData);
  }

  getBlockedUsers(): Observable<any> {
    const url = URLS.GetBlockedUsers;
    return this.apiService.get<any>(url);
  }

  blockUser(userId: number): Observable<any> {
    const url = URLS.BlockUser;
    return this.apiService.post(url, { blockedUserId : userId });
  }

  unblockUser(userId: number): Observable<any> {
    const url = URLS.UnblockUser;
    return this.apiService.post(url, { blockedUserId : userId });
  }
}
