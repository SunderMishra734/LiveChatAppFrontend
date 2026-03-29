import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

@Injectable()
export class authInterceptor implements HttpInterceptor{

  constructor(private authService: AuthService, private router: Router, private adminService: AdminService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isAdminRequest = req.url.includes('/Admin') || this.router.url.includes('/admin');
    const isLoginRequest = req.url.includes('/Auth/AdminLogin') || req.url.includes('/Auth/login');

    const token = isAdminRequest 
      ? this.adminService.getAdminToken() 
      : this.authService.getToken();

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only redirect if it's a 401 and NOT a login request
        if (error.status === 401 && !isLoginRequest) {
          if (isAdminRequest) {
            this.adminService.clearAdminSession();
            this.router.navigate(['/admin/login']);
          } else {
            this.authService.clearSession();
            this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
          }
        }
        return throwError(() => error);
      })
    );
  }
  
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const decodedToken: any = jwtDecode(token);
  const expiry = decodedToken.exp * 1000; // Convert to milliseconds
  return expiry > Date.now(); // Check if token is still valid
}
