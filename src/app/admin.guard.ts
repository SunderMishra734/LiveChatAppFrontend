import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private adminService: AdminService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.adminService.getAdminToken()) {
      return true;
    }
    return this.router.createUrlTree(['/admin/login']);
  }
}
