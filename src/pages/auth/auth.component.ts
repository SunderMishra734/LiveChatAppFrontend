import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthDto } from '../../models/auth-dto';
import { HttpClientModule } from '@angular/common/http';
import { ToasterMessageComponent } from '../../shared/components/toaster-message/toaster-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ToasterMessageComponent, LoaderComponent],
  providers: [AuthService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
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
  rememberMe: boolean = false;
  invalidNewEmail: boolean = false;
  // newStudent?: StudentLogin;
  isEmailFocused: boolean = false;
  isPasswordFocused: boolean = false;
  isPasswordVisible: boolean = false;
  isShowEyeVisible: boolean = true;
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

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
          Name: '',
          Email: this.strEmail,
          Password: this.strPassword
        }
        this.authService.login(this.loginData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/app/chat']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Invalid credentials, please try again.';
            this.strEmail = '';
            this.strPassword = '';
            this.showToasterMessage(2);
          }
        })
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
}
