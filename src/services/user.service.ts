import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { UserDetailDto } from '../models/user-detail-dto';
import { URLS } from '../shared/config/api.config';
import { ApiService } from './api.service';

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

  changeUserStatus(status: number){
    const url = URLS.ChangeUserStatus;
    return this.apiService.post(url, status);
  }

  createUser(userDetails: any): Observable<any> {
    const url = URLS.CreateUser;
    return this.apiService.post(url, userDetails);
  }
  
  uploadProfileImage(userDetails: any): Observable<any> {
    const url = URLS.UploadFile;
    return this.apiService.post(url, userDetails);
  }

  saveProfileImage(fileData: any): Observable<any> {
    const url = URLS.SaveFile;
    return this.apiService.post(url, fileData);
  }

  deleteProfileImage(fileData: any): Observable<any> {
    const url = URLS.DeleteFile;
    return this.apiService.post(url, fileData);
  }
}
