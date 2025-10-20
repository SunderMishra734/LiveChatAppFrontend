import { Component } from '@angular/core';
import { Customer, User } from '../../../models/customer';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToasterMessageComponent } from '../toaster-message/toaster-message.component';
import { UserRole, Gender } from '../../../models/enums.enum';

@Component({
  selector: 'app-admin-main-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToasterMessageComponent],
  templateUrl: './admin-main-page.component.html',
  styleUrl: './admin-main-page.component.css'
})
export class AdminMainPageComponent {
  customers!: Customer[];
  isCEPageShow: boolean = false;
  isEditMode: boolean = false;
  isSaveMode: boolean = false;
  customerIdToUpdate: number | null = null;
  // start: toaster variable
  isTaosterVisible: boolean = false;
  actionType: number = 0;
  mainMssg: string = '';
  descriptionMssg: string = '';
  // end: toaster variable
  customerForm!: FormGroup;
  userForm!: FormGroup;
  // userRoles = Object.keys(UserRole).filter(key => isNaN(Number(key)));
  userRoles = Object.entries(UserRole)
    .filter(([key, value]) => !isNaN(Number(value)))
    .map(([key, value]) => ({ key, value }));

  genders = Object.entries(Gender)
    .filter(([key, value]) => !isNaN(Number(value)))
    .map(([key, value]) => ({ key, value }));
  isAdminUserFormVisible: boolean = false;
  isCustomerFormVisible: boolean = true;
  userIdToUpdate: number | null = null;

  constructor(private adminService: AdminService, private fb: FormBuilder) { }

  ngOnInit() {
    this.loadCustomers();
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      expiryDate: ['', Validators.required],
      websiteURL: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      timeZone: [''],
      logoURL: [''],
      industryType: ['', Validators.required],
      isActive: [true],
      createdAt: [new Date()],
      updatedAt: [new Date()],
      isExpired: [false]
    });

    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      ur: ['', Validators.required],
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      gender: ['', Validators.required],
      dob: ['', Validators.required]
    });
  }

  loadCustomers() {
    this.adminService.getAllCustomers().subscribe({
      next: (response) => (this.customers = response.data),
      error: (error) => console.error('Error fetching customers:', error),
    });
    this.isSaveMode = false;
    this.toggleFormControls(true);
  }

  createCustomerFn() {
    this.isCEPageShow = true;
    this.isSaveMode = true;
    this.toggleFormControls(true);
  }

  submitForm() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const formValue = this.customerForm.value;
    const customer: Customer = {
      ...formValue,
      id: this.customerIdToUpdate ?? 0,
      isExpired: formValue.isExpired,
      createdAt: formValue.createdAt ?? new Date(),
      updatedAt: new Date()
    };

    if (this.isEditMode && this.customerIdToUpdate !== null) {
      this.adminService.updateCustomer(customer).subscribe({
        next: () => {
          this.mainMssg = 'Updated!';
          this.descriptionMssg = 'Customer updated successfully.';
          this.showToasterMessage(1);
          this.resetFormState();
          this.loadCustomers();
        },
        error: (err) => {
          this.mainMssg = 'Something Went Wrong!';
          this.descriptionMssg = 'Failed to update customer.';
          this.showToasterMessage(2);
        }
      });
    } else {
      this.adminService.createCustomer(customer).subscribe({
        next: () => {
          this.mainMssg = 'Created!';
          this.descriptionMssg = 'Customer created successfully.';
          this.showToasterMessage(1);
          this.resetFormState();
          this.loadCustomers();
        },
        error: (err) => {
          this.mainMssg = 'Something Went Wrong!';
          this.descriptionMssg = 'Failed to create customer.';
          this.showToasterMessage(2);
        }
      });
    }
  }

  onEditMode() {
    this.isSaveMode = true;
    this.toggleFormControls(true);
  }

  editFn(customer: Customer) {
    this.isCEPageShow = true;
    this.isEditMode = true;
    this.customerIdToUpdate = customer.id ?? null;
    const formatDate = (date: Date | string | undefined): string | null => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // format as yyyy-MM-dd
    };
    this.customerForm.patchValue({
      name: customer.name,
      email: customer.email,
      contactNumber: customer.contactNumber,
      expiryDate: this.formatDateForInput(customer.expiryDate),
      websiteURL: customer.websiteURL,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      country: customer.country,
      timeZone: customer.timeZone,
      logoURL: customer.logoURL,
      industryType: customer.industryType,
      isActive: customer.isActive,
      createdAt: formatDate(customer.createdAt),
      updatedAt: formatDate(customer.updatedAt),
      isExpired: customer.isExpired,
    });
    this.toggleFormControls(false);
  }

  deleteFn(cutomerId: number) {
    this.adminService.deleteCustomer(cutomerId).subscribe({
      next: (response) => {
        if (response) {
          alert('Customer deleted');
          this.loadCustomers();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to delete customer.');
      }
    })
  }

  cancelCreate() {
    this.resetFormState();
  }

  resetFormState() {
    this.isCEPageShow = false;
    this.isEditMode = false;
    this.isSaveMode = false;
    this.customerIdToUpdate = null;
    this.customerForm.reset();
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2); // Months are 0-based
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  }

  toggleFormControls(enable: boolean) {
    if (!this.customerForm) return; // prevent error if called early
    if (enable) {
      this.customerForm.enable();
    } else {
      this.customerForm.disable();
    }
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

  showAdminUserForm() {
    this.isAdminUserFormVisible = true;
    this.isCustomerFormVisible = false;
  }

  cancelUserForm() {
    this.resetUserFormState();
  }

  resetUserFormState() {
    this.isAdminUserFormVisible = false;
    this.isCustomerFormVisible = true;
    this.userForm.reset();
  }

  submitUserForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.value;

    const user: User = {
      cId: this.customerIdToUpdate ?? 0,
      userName: formValue.userName,
      email: formValue.email,
      ur: Number(formValue.ur),
      fullName: formValue.fullName,
      phoneNumber: formValue.phoneNumber,
      gender: Number(formValue.gender),
      dob: new Date(formValue.dob)
    };

    this.adminService.createUser(user).subscribe({
      next: () => {
        this.mainMssg = 'Created!';
        this.descriptionMssg = 'Admin user created successfully.';
        this.showToasterMessage(1);
        this.resetUserFormState();
      },
      error: (err) => {
        this.mainMssg = 'Something Went Wrong!';
        this.descriptionMssg = 'Failed to create admin user.';
        this.showToasterMessage(2);
      }
    });
  }
}
