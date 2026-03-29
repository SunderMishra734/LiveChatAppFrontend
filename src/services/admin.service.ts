import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthDto } from '../models/auth-dto';
import { Customer, User } from '../models/customer';
import { URLS } from '../shared/config/api.config';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private apiService: ApiService) { }

  adminLogin(loginData: AuthDto) {
    return this.apiService.post<any>(URLS.AdminLogin, loginData).pipe(
      tap(response => {
        if (response && response.token) {
          return response;
        }
      })
    );
  }

  getAllCustomers() {
    return this.apiService.get<any>(URLS.GetAllCustomers);
  }

  createCustomer(customer: Customer) {
    return this.apiService.post<any>(URLS.CreateCustomer, customer);
  }

  updateCustomer(customer: Customer): Observable<boolean> {
    return this.apiService.post<any>(URLS.UpdateCustomer, customer);
  }

  deleteCustomer(id: number): Observable<boolean> {
    return this.apiService.delete<any>(URLS.DeleteCustomer + `?id=${id}`);
  }

  createUser(user: User) {
    return this.apiService.post<any>(URLS.CreateUser, user);
  }

  getAdminUsers(corporateId: number): Observable<any> {
    return this.apiService.get<any>(URLS.GetAdminUsers, { corporateId });
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
