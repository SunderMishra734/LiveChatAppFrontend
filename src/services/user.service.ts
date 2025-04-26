import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { ChangeUserStatusDto, UserDetailDto } from '../models/user-detail-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserDetails(userId: number): Observable<UserDetailDto> {
    const url = `${this.baseUrl}/User/GetUser/${userId}`; 
    return this.http.get<UserDetailDto>(url);
  }

  changeUserStatus(changeUserStatus: ChangeUserStatusDto){
    const url = `${this.baseUrl}/User/ChangeUserStatus`;
    return this.http.post(url, changeUserStatus);
  }
}
