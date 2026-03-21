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
import { BlockedUserDto } from '../../models/blocked-user-dto';

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
  loggedInUserId: number = 0;
  showSecurityNotifications: boolean = true;
  isDeleteModalVisible: boolean = false;
  isFeedbackModalVisible: boolean = false;
  isFeedbackSubmitted: boolean = false;
  feedbackForm!: FormGroup;
  userRating: number = 0;
  blockedContactsCount: number = 0;
  disappearingMessagesStatus: string = 'Off';
  isUnblockModalVisible: boolean = false;
  contactToUnblock: BlockedUserDto | any = null;

  blockedContacts: BlockedUserDto[] = [];
  allUsers: any[] = [];

  contactSearchQuery: string = '';
  // Removed hardcoded allContacts
  faqs = [
    {
      question: '1. How do I create an account in LiveChatApp?',
      answer: 'To create an account, open the registration page, enter your required details such as name, email, and password, and complete the verification process. Once registered, you can start chatting with other users.'
    },
    {
      question: '2. How can I change my profile information?',
      answer: 'Go to Settings → Profile, where you can update your name, profile picture, and status message. After making changes, save them to update your profile.'
    },
    {
      question: '3. How do I change my password?',
      answer: 'Navigate to Settings → Security → Change Password. Enter your current password and your new password, then confirm the changes.'
    },
    {
      question: '4. What should I do if I forget my password?',
      answer: 'Click on Forgot Password on the login page and follow the instructions to reset your password using your registered email.'
    },
    {
      question: '5. How can I block or unblock a user?',
      answer: 'Open the user\'s profile or chat options and select Block User. To unblock, go to Settings → Privacy → Blocked Users and remove the user from the blocked list.'
    },
    {
      question: '6. Can I delete my chat messages?',
      answer: 'Yes, you can delete messages by selecting the message and choosing the Delete option. This will remove the message from your chat history.'
    },
    {
      question: '7. How can I update my status?',
      answer: 'Go to Profile Settings and update your About or Status message. Your contacts will be able to see your updated status.'
    },
    {
      question: '8. How can I report a problem in LiveChatApp?',
      answer: 'If you encounter an issue, go to Help & Feedback → Contact Us and describe the problem. Our support team will review your request and assist you.'
    },
    {
      question: '9. Is my data secure on LiveChatApp?',
      answer: 'Yes, we take security seriously. Your account and messages are protected using modern security practices to keep your data safe.'
    },
    {
      question: '10. How can I delete my LiveChatApp account?',
      answer: 'You can delete your account by going to Settings → Account → Delete Account. Please note that this action will permanently remove your account and chat data.'
    }
  ];

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
    this.sharedUserService.loggedInUserId.subscribe(userId => {
      this.loggedInUserId = userId;
    });
    this.initChangePasswordForm();
    this.initFeedbackForm();
  }

  initChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  initFeedbackForm() {
    this.feedbackForm = this.fb.group({
      feedbackType: [1, [Validators.required]],
      subject: ['', [Validators.required]],
      description: ['', [Validators.required]],
      email: ['', [Validators.email]]
    });
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
    } else if (item.title === 'Privacy') {
      this.activeView = 'privacy';
      this.loadBlockedUsers();
    } else if (item.title === 'Help and feedback') {
      this.activeView = 'help';
    }
  }

  openBlockedContacts() {
    this.activeView = 'blocked-contacts';
  }

  loadBlockedUsers() {
    this.userService.getBlockedUsers().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.blockedContacts = res.data || [];
          this.blockedContactsCount = this.blockedContacts.length;
        } else {
          this.blockedContacts = [];
          this.blockedContactsCount = 0;
        }
      },
      error: (err) => {
        console.error('Error loading blocked users:', err);
        this.mainMssg = 'Error!';
        this.descriptionMssg = 'Failed to load blocked contacts.';
        this.showToasterMessage(2);
      }
    });
  }

  openDisappearingMessages() {
    this.activeView = 'disappearing-messages';
  }

  openAddBlockedContact() {
    this.activeView = 'add-blocked-contact';
    this.contactSearchQuery = '';
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.userService.getAllUser().subscribe({
      next: (res) => {
        if (res.success) {
          // Filter out logged in user and already blocked users
          this.allUsers = res.data.filter((u: any) => {
            if (u.userId === this.loggedInUserId) return false;
            return Array.isArray(this.blockedContacts) && !this.blockedContacts.some(bc => bc.blockedUserId === u.userId);
          });
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  getFilteredContacts() {
    if (!this.contactSearchQuery) return this.allUsers;
    return this.allUsers.filter(contact =>
      contact.fullName.toLowerCase().includes(this.contactSearchQuery.toLowerCase())
    );
  }

  blockContact(user: any) {
    this.userService.blockUser(user.userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadBlockedUsers();
          this.activeView = 'blocked-contacts';
          this.mainMssg = 'Blocked!';
          this.descriptionMssg = `${user.fullName} has been added to blocked contacts.`;
          this.showToasterMessage(1);
        } else {
          this.mainMssg = 'Error!';
          this.descriptionMssg = res.message || 'Failed to block user.';
          this.showToasterMessage(2);
        }
      },
      error: (err) => {
        this.mainMssg = 'Error!';
        this.descriptionMssg = 'An error occurred while blocking the user.';
        this.showToasterMessage(2);
      }
    });
  }

  setDisappearingTimer(timer: string) {
    this.disappearingMessagesStatus = timer;
  }

  openHelpCentre() {
    this.activeView = 'help-centre';
  }

  openTermsPolicy() {
    this.activeView = 'terms-policy';
  }

  openFeedbackModal() {
    this.isFeedbackModalVisible = true;
    this.isFeedbackSubmitted = false;
    this.userRating = 0;
    this.initFeedbackForm();
  }

  openContactUs() {
    this.activeView = 'contact-us';
  }

  openUnblockModal(contact: any) {
    this.contactToUnblock = contact;
    this.isUnblockModalVisible = true;
  }

  closeUnblockModal() {
    this.isUnblockModalVisible = false;
    this.contactToUnblock = null;
  }

  confirmUnblock() {
    if (this.contactToUnblock) {
      this.userService.unblockUser(this.contactToUnblock.blockedUserId).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadBlockedUsers();
            this.mainMssg = 'Unblocked!';
            this.descriptionMssg = `${this.contactToUnblock.fullName} has been unblocked.`;
            this.showToasterMessage(1);
            this.closeUnblockModal();
          } else {
            this.mainMssg = 'Error!';
            this.descriptionMssg = res.message || 'Failed to unblock user.';
            this.showToasterMessage(2);
          }
        },
        error: (err) => {
          this.mainMssg = 'Error!';
          this.descriptionMssg = 'An error occurred while unblocking the user.';
          this.showToasterMessage(2);
        }
      });
    }
  }

  closeFeedbackModal() {
    this.isFeedbackModalVisible = false;
    this.isFeedbackSubmitted = false;
  }

  setRating(rating: number) {
    this.userRating = rating;
  }

  submitFeedback() {
    if (this.feedbackForm.valid) {
      const payload = {
        ...this.feedbackForm.value,
        feedbackType: Number(this.feedbackForm.value.feedbackType),
        rating: this.userRating
      };

      this.userService.submitFeedback(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.isFeedbackSubmitted = true;
            this.mainMssg = 'Success!';
            this.descriptionMssg = 'Thank you for your feedback!';
            this.showToasterMessage(1);
          } else {
            this.mainMssg = 'Something Went Wrong!';
            this.descriptionMssg = res.message || 'Failed to submit feedback.';
            this.showToasterMessage(2);
          }
        },
        error: (err) => {
          this.mainMssg = 'Something Went Wrong!';
          this.descriptionMssg = 'Failed to submit feedback. Please try again later.';
          this.showToasterMessage(2);
        }
      });
    } else {
      Object.keys(this.feedbackForm.controls).forEach(key => {
        const control = this.feedbackForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  goBackToMain() {
    if (this.activeView === 'help-centre' || this.activeView === 'terms-policy' || this.activeView === 'contact-us') {
      this.activeView = 'help';
    } else if (this.activeView === 'disappearing-messages' || this.activeView === 'blocked-contacts') {
      this.activeView = 'privacy';
    } else if (this.activeView === 'add-blocked-contact') {
      this.activeView = 'blocked-contacts';
    } else {
      this.activeView = 'main';
    }
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
    this.isDeleteModalVisible = false;
    this.userService.deleteUser().subscribe({
      next: (res) => {
        if (res.success) {
          this.mainMssg = 'Account Deleted!';
          this.descriptionMssg = 'Your account has been permanently removed.';
          this.showToasterMessage(1);
          setTimeout(() => {
            this.logout();
          }, 2000);
        } else {
          this.mainMssg = 'Something Went Wrong!';
          this.descriptionMssg = res.message || 'Failed to delete account.';
          this.showToasterMessage(2);
        }
      },
      error: (err) => {
        this.mainMssg = 'Something Went Wrong!';
        this.descriptionMssg = 'An error occurred while deleting your account.';
        this.showToasterMessage(2);
      }
    });
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
