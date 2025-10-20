import { Component } from '@angular/core';
import { UserRole, Gender, LanguagePreference } from '../../models/enums.enum';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToasterMessageComponent } from '../../shared/components/toaster-message/toaster-message.component';

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

  constructor(private userService: UserService, private fb: FormBuilder) { }

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
}
