import { Component } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { SharedUserService } from '../../services/shared-user.service';
import { UserDetailDto } from '../../models/user-detail-dto';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, CKEditorModule, CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
  address!: string;
  public Editor: any;
  public editorConfig = {
    toolbar: ['bold', 'italic', 'link', 'undo', 'redo'],
    removePlugins: ['EasyImage', 'Watermark'],
  };
  isDisable: boolean = true;
  isSaveBtnVisible: boolean = false;
  userDetails?: UserDetailDto;
  userFullName?: string;
  userEmail?: string;
  userDOF?: string;
  userContactNo?: string;

  constructor(private sharedUserService: SharedUserService, @Inject(PLATFORM_ID) private platformId: Object){}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      import('@ckeditor/ckeditor5-build-classic').then((ClassicEditor) => {
        this.Editor = ClassicEditor;
      });
    }
    this.sharedUserService.currentUserDetails.subscribe(userDetails => {
      this.userDetails = userDetails;
      this.userFullName = this.userDetails?.fullName;
      this.userEmail = this.userDetails?.email;
      this.userDOF = this.formatDateForInput(this.userDetails?.dateOfBirth);
      this.userContactNo = this.userDetails?.phoneNumber;
    });
  }

  editFn() {
    this.isDisable = false;
    this.isSaveBtnVisible = true;
  }

  saveFn() {
    this.isDisable = true;
    this.isSaveBtnVisible = false;
  }

  formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }
}
