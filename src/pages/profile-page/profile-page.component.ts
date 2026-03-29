import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedUserService } from '../../services/shared-user.service';
import { UserDetailDto } from '../../models/user-detail-dto';
import { Inject, PLATFORM_ID } from '@angular/core';
import { UserRole, Gender, LanguagePreference } from '../../models/enums.enum';
import { UserService } from '../../services/user.service';
import { ToasterMessageComponent } from '../../shared/components/toaster-message/toaster-message.component';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, CommonModule, ToasterMessageComponent,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  userFullName!: string;
  userEmail!: string;
  address!: string;
  public Editor: any;
  public editorConfig = {
    toolbar: ['bold', 'italic', 'link', 'undo', 'redo'],
    removePlugins: ['EasyImage', 'Watermark'],
  };
  isDisable: boolean = true;
  isSaveBtnVisible: boolean = false;
  userDetails?: UserDetailDto;
  profileForm!: FormGroup;
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
  isFileChanged: boolean = false;
  fileName: string = '';
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isEdited: boolean = false;
  originalFormValue: any;

  constructor(
    private sharedUserService: SharedUserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.sharedUserService.currentUserDetails.subscribe(userDetails => {
      this.userDetails = userDetails;
      this.initForm(userDetails);
    });
  }

  initForm(userDetails?: UserDetailDto) {
    this.profileForm = this.fb.group({
      fullName: [userDetails?.fullName || ''],
      email: [{ value: userDetails?.email || '', disabled: true }],
      dateOfBirth: [this.formatDateForInput(userDetails?.dateOfBirth) || ''],
      phoneNumber: [userDetails?.phoneNumber || ''],
      gender: [userDetails?.gender ?? ''],
      profileStatus: [userDetails?.profileStatus || ''],
      timeZone: [userDetails?.timeZone || ''],
      languagePreference: [userDetails?.languagePreference ?? ''],
      address: [userDetails?.address || '']
    });
    if (this.isDisable) {
      this.profileForm.disable();
    } else {
      this.profileForm.enable();
    }
    this.userFullName = userDetails?.fullName || '';
    this.userEmail = userDetails?.email || '';

    this.originalFormValue = this.profileForm.getRawValue();
    this.profileForm.valueChanges.subscribe(() => {
      this.isEdited = JSON.stringify(this.originalFormValue) !== JSON.stringify(this.profileForm.getRawValue());
    });
  }

  editFn() {
    this.isDisable = false;
    this.isSaveBtnVisible = true;
    this.profileForm.enable();
    this.profileForm.get('email')?.disable();
  }

  saveFn() {
    if (!this.isEdited) {
      return;
    }
    if (this.profileForm.valid) {
      const updatedDetails: UserDetailDto = {
        ...this.userDetails,
        ...this.profileForm.value
      };
      this.userService.updateUserProfile(updatedDetails).subscribe({
        next: (response) => {
          this.sharedUserService.updateUserDetails(updatedDetails);
          const fileData = {
            fileName: this.fileName,
          }
          if (this.isFileChanged) {
            this.userService.saveProfileImage(fileData).subscribe({
              next: (res) => {
                if (res && res.data && res.data.successMessage) {
                  if (this.userDetails) {
                    this.userDetails.profilePic = res.data.successMessage;
                  }
                  this.isFileChanged = false;
                  this.isDisable = true;
                  this.isSaveBtnVisible = false;
                  this.profileForm.disable();
                  this.mainMssg = 'Updated!';
                  this.descriptionMssg = 'User updated successfully.';
                  this.showToasterMessage(1);
                }
              },
              error: (err) => {
                this.mainMssg = 'Something Went Wrong!';
                this.descriptionMssg = 'Failed to save profile image';
                this.showToasterMessage(2);
              }
            });
          }
          else {
            this.isFileChanged = false;
            this.isDisable = true;
            this.isSaveBtnVisible = false;
            this.profileForm.disable();
            this.mainMssg = 'Updated!';
            this.descriptionMssg = 'User updated successfully.';
            this.showToasterMessage(1);
          }
          this.isEdited = false;
        },
        error: (err) => {
          this.mainMssg = 'Something Went Wrong!';
          this.descriptionMssg = 'Failed to update user.';
          this.showToasterMessage(2);
          this.isEdited = false;
        }
      });
    }
  }

  cancelFn() {
    this.isDisable = true;
    this.isSaveBtnVisible = false;
    this.profileForm.disable();
    this.initForm(this.userDetails);
    this.isFileChanged = false;
    this.isEdited = false;
  }

  formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
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

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.userService.uploadProfileImage(formData).subscribe({
        next: (res: any) => {
          if (res && res.data && res.data.success) {
            this.fileName = this.getFileNameFromUrl(res.data.successMessage);
            if (this.userDetails) {
              this.userDetails.profilePic = res.data.successMessage;
            }
            this.isFileChanged = true;
            this.mainMssg = 'Image Uploaded!';
            this.descriptionMssg = 'Your profile image was uploaded successfully.';
            this.showToasterMessage(1);
            this.isEdited = true;
          }
        },
        error: (err) => {
          this.mainMssg = 'Error!';
          this.descriptionMssg = 'Failed to upload image.';
          this.showToasterMessage(2);
        }
      });
    }
  }

  deleteProfilePic() {
    this.fileName = this.getFileNameFromUrl(this.userDetails?.profilePic || '');
    const fileData = {
      fileName: this.fileName ?? this.userDetails?.profilePic,
    }

    this.userService.deleteProfileImage(fileData).subscribe({
      next: (res) => {
        if (res && res.success) {
          if (this.userDetails) {
            this.userDetails.profilePic = res.data.successMessage;
          }
          this.isFileChanged = false;
          this.isDisable = true;
          this.isSaveBtnVisible = false;
          this.profileForm.disable();
          this.mainMssg = 'Deleted!';
          this.descriptionMssg = 'User profile deleted successfully.';
          this.showToasterMessage(1);
        }
      },
      error: (err) => {
        this.mainMssg = 'Something Went Wrong!';
        this.descriptionMssg = 'Failed to save profile image';
        this.showToasterMessage(2);
      }
    });
  }

  changeProfilePic() {
    this.fileInput.nativeElement.click();
  }

  getFileNameFromUrl(url: string): string {
    const pathname = new URL(url).pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
  }

}
