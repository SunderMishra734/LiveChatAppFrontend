import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthDto } from '../models/auth-dto';
import { Customer, User } from '../models/customer';
import { URLS } from '../shared/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) { }

  adminLogin(loginData: AuthDto) {
    return this.http.post<any>(URLS.AdminLogin, loginData).pipe(
      tap(response => {
        if (response && response.token) {
          return response;
        }
      })
    );
  }

  getAllCustomers() {
    return this.http.get<any>(URLS.GetAllCustomers);
  }

  createCustomer(customer: Customer) {
    return this.http.post<any>(URLS.CreateCustomer, customer);
  }

  updateCustomer(customer: Customer): Observable<boolean> {
    return this.http.post<boolean>(URLS.UpdateCustomer, customer);
  }

  deleteCustomer(id: number): Observable<boolean> {
    return this.http.delete<boolean>(URLS.DeleteCustomer + `?id=${id}`);
  }

  createUser(user: User) {
    return this.http.post<any>(URLS.CreateUser, user);
  }

  setAdminToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('admintoken', token);
    }
  }

  getAdminToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('admintoken');
  }

  clearAdminSession(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('admintoken');
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
