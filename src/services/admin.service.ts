import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthDto } from '../models/auth-dto';
import { Customer, User } from '../models/customer';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  adminLogin(loginData: AuthDto) {
    const url = `${this.baseUrl}/AdminLogin`;
    return this.http.post<any>(url, loginData).pipe(
      tap(response => {
        if (response && response.token) {
          return response;
        }
      })
    );
  }

  getAllCustomers() {
    const url = `${this.baseUrl}/Admin/GetAllCustomers`;
    return this.http.get<any>(url);
  }

  createCustomer(customer: Customer) {
    const url = `${this.baseUrl}/Admin/CreateCustomer`;
    return this.http.post<any>(url, customer);
  }

  updateCustomer(customer: Customer): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/Admin/UpdateCustomer`, customer);
  }

  deleteCustomer(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/Admin/DeleteCustomer?id=${id}`);
  }

  createUser(user: User) {
    const url = `${this.baseUrl}/User/CreateUser`;
    return this.http.post<any>(url, user);
  }
}
