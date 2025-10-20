import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthDto } from '../models/auth-dto';
import { tap } from 'rxjs';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { URLS } from '../shared/config/api.config';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl: string = environment.apiUrl;
  constructor(private router: Router, private apiService: ApiService) { }

  login(loginData: AuthDto) {
    const url = URLS.AuthLogin;
    return this.apiService.post<any>(url, loginData).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data);
        }
      })
    );
  }

  logOut() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    const url = URLS.AuthChangePassword;
    const passwordPayload = { 
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword
     };
    return this.apiService.post<any>(url, passwordPayload);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Store token in localStorage
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Retrieve token from localStorage
  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token');
  }

  // Clear session on logout and redirect to login page
  clearSession(): void {
    localStorage.removeItem('token');
    // this.router.navigate(['/login']);
  }

  // Check if user is logged in by checking token existence
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.UserId || null;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }
}
