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
    const token = this.authService.getToken();
    if (!token) {
      return next.handle(req);
    }
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || !isTokenValid(token)) {
          this.authService.clearSession();
          this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
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
