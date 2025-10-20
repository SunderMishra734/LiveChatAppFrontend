import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthDto } from '../../../models/auth-dto';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { ToasterMessageComponent } from '../toaster-message/toaster-message.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ToasterMessageComponent, LoaderComponent],
  providers: [AdminService],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  isSignInVisible: boolean = true;
  strEmail: string = '';
  strPassword: string = '';
  loginData?: AuthDto;
  errorMessage: string = '';
  invalidEmail: boolean = false;
  emptyEmail: boolean = false;
  emptyPassword: boolean = false;
  actionType: number = 0;
  isTaosterVisible: boolean = false;
  mainMssg: string = '';
  descriptionMssg: string = '';
  rememberMe: boolean = false;
  invalidNewEmail: boolean = false;
  isEmailFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isPasswordVisible: boolean = false;
  isShowEyeVisible: boolean = true;
  isLoading: boolean = false;

  constructor(private router: Router, private adminService: AdminService) { }

  signInFn() {
    this.invalidNewEmail = false;
    this.isSignInVisible = true;
  }

  newAccountFn() {
    this.isSignInVisible = false;
    this.emptyEmail = false;
    this.emptyPassword = false;
    this.invalidEmail = false;
    this.strEmail = '';
    this.strPassword = '';
  }

  loginFn() {
    const emailValidate = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (this.validateData()) {
      this.isLoading = true;
      if (emailValidate.test(this.strEmail)) {
        this.loginData = {
          email: this.strEmail,
          password: this.strPassword
        }
        this.adminService.adminLogin(this.loginData).subscribe({
          next: (data) => {
            this.isLoading = false;
            if (data) {
              this.router.navigate(['/admin/app']);
            }
            this.errorMessage = 'Invalid credentials, please try again.';
            this.mainMssg = 'Invalid Credential';
            this.descriptionMssg = 'Entered email and password are incorrect.';
            this.strEmail = '';
            this.strPassword = '';
            this.showToasterMessage(2);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Invalid credentials, please try again.';
            this.mainMssg = 'Invalid Credential';
            this.descriptionMssg = 'Entered email and password are incorrect.';
            this.strEmail = '';
            this.strPassword = '';
            this.showToasterMessage(2);
          }
        });
      }
      else {
        this.invalidEmail = true;
        this.isLoading = false;
      }
    }
  }

  validateData(): boolean {
    if (this.strEmail == '' && this.strPassword == '') {
      this.emptyEmail = true;
      this.emptyPassword = true;
      return false;
    }
    if (this.strEmail == '') {
      this.emptyEmail = true;
      return false;
    }
    if (this.strPassword == '') {
      this.emptyPassword = true;
      return false;
    }
    return true;
  }

  emailOnChange() {
    this.emptyEmail = false;
    this.invalidEmail = false;
  }

  passwordOnChange() {
    this.emptyPassword = false;
  }

  showToasterMessage(actType: number) {
    this.isTaosterVisible = true;
    this.actionType = actType;
    // this.mainMssg = this.mainMssg;
    // this.descriptionMssg = this.descriptionMssg;
    setTimeout(() => {
      this.closeToasterMessage();
    }, 2500);
  }

  closeToasterMessage() {
    this.isTaosterVisible = false;
  }

  emailInput(nextInput: HTMLInputElement) {
    const emailValidate = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    nextInput.focus();
    if (!emailValidate.test(this.strEmail))
      this.invalidEmail = true;
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    this.isShowEyeVisible = !this.isShowEyeVisible;
  }

  rememberMeFn() {
    this.rememberMe = !this.rememberMe;
  }
}
