import { Injectable } from '@angular/core';
import { UserDetailDto } from '../models/user-detail-dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedUserService {
  private userDetailsSource = new BehaviorSubject<UserDetailDto | any>(null);
  private userIdSource = new BehaviorSubject<number>(0);

  currentUserDetails = this.userDetailsSource.asObservable();
  loggedInUserId = this.userIdSource.asObservable();

  constructor() { }

  // Method to update userDetails
  updateUserDetails(userDetails: UserDetailDto): void {
    this.userDetailsSource.next(userDetails); // Push new user details
  }

  addLoggedInUserId(userId: number): void{
    this.userIdSource.next(userId);
  }

  getCurrentUserDetails(): UserDetailDto | null {
    return this.userDetailsSource.getValue();
  }
}
