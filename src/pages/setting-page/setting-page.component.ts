import { Component } from '@angular/core';
import { UserRole, Gender, LanguagePreference } from '../../models/enums.enum';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToasterMessageComponent } from '../../shared/components/toaster-message/toaster-message.component';
import { SharedUserService } from '../../services/shared-user.service';
import { AuthService } from '../../services/auth.service';
import { UserDetailDto } from '../../models/user-detail-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setting-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ToasterMessageComponent],
  templateUrl: './setting-page.component.html',
  styleUrl: './setting-page.component.css'
})
export class SettingPageComponent {
  isCreateUserShow: boolean = false;
  userForm!: FormGroup;
  userRoles = Object.entries(UserRole)
    .filter(([key, value]) => !isNaN(Number(value)))
    .map(([key, value]) => ({ key, value }));

  genders = Object.entries(Gender)
    .filter(([key, value]) => !isNaN(Number(value)))
    .map(([key, value]) => ({ key, value }));

  language = Object.entries(LanguagePreference)
    .filter(([key, value]) => !isNaN(Number(value)))
    .map(([key, value]) => ({ key, value }));
  // start: toaster variable
  isTaosterVisible: boolean = false;
  actionType: number = 0;
  mainMssg: string = '';
  descriptionMssg: string = '';
  // end: toaster variable

  currentUserDetails: UserDetailDto | any = null;
  searchQuery: string = '';
  isShowChangePassword: boolean = false;
  changePasswordForm!: FormGroup;
  isAdmin: boolean = false;
  showSecurityNotifications: boolean = true;
  isDeleteModalVisible: boolean = false;

  settingsMenuItems = [
    { title: 'Account', desc: 'Account info, change password, Security notifications,', icon: 'fa-key' },
    { title: 'Privacy', desc: 'Blocked contacts, disappearing messages', icon: 'fa-lock' },
    { title: 'Help and feedback', desc: 'Help centre, contact us, privacy policy', icon: 'fa-question-circle' }
  ];

  get filteredSettingsMenuItems() {
    if (!this.searchQuery) {
      return this.settingsMenuItems;
    }
    const lowerQuery = this.searchQuery.toLowerCase();
    return this.settingsMenuItems.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.desc.toLowerCase().includes(lowerQuery)
    );
  }

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private sharedUserService: SharedUserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.sharedUserService.currentUserDetails.subscribe(details => {
      if (details) {
        this.currentUserDetails = details;
        this.isAdmin = details.userRole === UserRole.Admin;
      }
    });
    this.initChangePasswordForm();
  }

  initChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    this.authService.changePassword(this.changePasswordForm.value.currentPassword, this.changePasswordForm.value.newPassword, this.changePasswordForm.value.confirmPassword).subscribe({
      next: () => {
        this.mainMssg = 'Password Changed!';
        this.descriptionMssg = 'Your password has been updated.';
        this.showToasterMessage(1);
        this.isShowChangePassword = false;
        this.changePasswordForm.reset();
      },
      error: () => {
        this.mainMssg = 'Error!';
        this.descriptionMssg = 'Failed to change password.';
        this.showToasterMessage(2);
      }
    });
  }

  activeView: string = 'main';

  onMenuClick(item: any) {
    if (item.title === 'Account') {
      this.activeView = 'account';
    }
  }

  goBackToMain() {
    this.activeView = 'main';
    this.isCreateUserShow = false;
  }

  logout() {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }

  createNewUser() {
    this.isCreateUserShow = true;
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      gender: ['', Validators.required],
      role: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      profilePic: ['']
    });
  }

  createUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const formValue = this.userForm.value;
    const userDetails = {
      userName: formValue.userName,
      email: formValue.email,
      ur: Number(formValue.role),
      fullName: formValue.fullName,
      phoneNumber: formValue.phoneNumber,
      gender: Number(formValue.gender),
      dob: formValue.dateOfBirth,
      onlineStatus: 0,
      profilePic: formValue.profilePic,
    };
    this.userService.createUser(userDetails).subscribe({
      next: (res) => {
        // handle success (show message, reset form, etc.)
        this.isCreateUserShow = false;
        this.mainMssg = 'Created!';
        this.descriptionMssg = 'User created successfully.';
        this.showToasterMessage(1);
      },
      error: (err) => {
        this.mainMssg = 'Something Went Wrong!';
        this.descriptionMssg = 'Failed to update user.';
        this.showToasterMessage(2);
      }
    });
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

  deleteAccount() {
    this.isDeleteModalVisible = true;
  }

  confirmDelete() {
    if (this.currentUserDetails?.userId) {
      this.isDeleteModalVisible = false;
    }
  }

  closeDeleteModal() {
    this.isDeleteModalVisible = false;
  }

  copyToClipboard(text: string, fieldName: string) {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.mainMssg = `${fieldName} Copied!`;
        this.descriptionMssg = `${text} has been copied to your clipboard.`;
        this.showToasterMessage(1);
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    }
  }
}
