import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthDto } from '../models/auth-dto';
import { tap } from 'rxjs';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl: string = environment.apiUrl;
  constructor(private router: Router, private http: HttpClient) { }

  login(loginData: AuthDto) {
    const url = `${this.baseUrl}/Auth/login`;
    return this.http.post<any>(url, loginData).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
        }
      })
    );
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
