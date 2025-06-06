import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AdminFormComponent],
    template: `
    <app-admin-form
      [title]="isEditMode ? 'Edit User' : 'Create User'"
      subtitle="Manage user accounts and profiles"
      [form]="userForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="loading"
      backRoute="/admin/users"
      (formSubmit)="onSave()">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Personal Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Personal Information</h3>
          
          <!-- First Name -->
          <div>
            <label for="first_name" class="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              id="first_name"
              formControlName="first_name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [class.border-red-300]="userForm.get('first_name')?.invalid && userForm.get('first_name')?.touched">
            <div *ngIf="userForm.get('first_name')?.invalid && userForm.get('first_name')?.touched" 
                 class="mt-1 text-sm text-red-600">
              First name is required
            </div>
          </div>

          <!-- Last Name -->
          <div>
            <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              id="last_name"
              formControlName="last_name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [class.border-red-300]="userForm.get('last_name')?.invalid && userForm.get('last_name')?.touched">
            <div *ngIf="userForm.get('last_name')?.invalid && userForm.get('last_name')?.touched" 
                 class="mt-1 text-sm text-red-600">
              Last name is required
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [class.border-red-300]="userForm.get('email')?.invalid && userForm.get('email')?.touched">
            <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" 
                 class="mt-1 text-sm text-red-600">
              <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
        </div>

        <!-- Profile Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Profile Information</h3>
          
          <!-- Avatar URL -->
          <div>
            <label for="avatar_url" class="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="url"
              id="avatar_url"
              formControlName="avatar_url"
              placeholder="https://example.com/avatar.jpg"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Role *</label>
            <select
              id="role"
              formControlName="role"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              [class.border-red-300]="userForm.get('role')?.invalid && userForm.get('role')?.touched">
              <option value="">Select a role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
            <div *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" 
                 class="mt-1 text-sm text-red-600">
              Role is required
            </div>
          </div>

          <!-- Date of Birth -->
          <div>
            <label for="date_of_birth" class="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              formControlName="date_of_birth"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>

          <!-- Bio -->
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              id="bio"
              formControlName="bio"
              rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Tell us about yourself..."></textarea>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="mt-8 space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Address Information</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Street Address -->
          <div>
            <label for="street_address" class="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              id="street_address"
              formControlName="street_address"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>

          <!-- City -->
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              id="city"
              formControlName="city"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>

          <!-- State -->
          <div>
            <label for="state" class="block text-sm font-medium text-gray-700">State/Province</label>
            <input
              type="text"
              id="state"
              formControlName="state"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>

          <!-- Postal Code -->
          <div>
            <label for="postal_code" class="block text-sm font-medium text-gray-700">Postal Code</label>
            <input
              type="text"
              id="postal_code"
              formControlName="postal_code"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>

          <!-- Country -->
          <div>
            <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              id="country"
              formControlName="country"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>
        </div>
      </div>
    </app-admin-form>
  `
})
export class UserFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private supabaseService = inject(SupabaseService);

    userForm: FormGroup;
    loading = false;
    isEditMode = false;
    userId: string | null = null;

    constructor() {
        this.userForm = this.fb.group({
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            avatar_url: [''],
            role: ['user', [Validators.required]],
            date_of_birth: [''],
            bio: [''],
            street_address: [''],
            city: [''],
            state: [''],
            postal_code: [''],
            country: ['']
        });
    }

    ngOnInit(): void {
        this.userId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.userId;

        if (this.isEditMode && this.userId) {
            this.loadUser();
        }
    }

    private async loadUser(): Promise<void> {
        if (!this.userId) return;

        this.loading = true;
        try {
            const user = await this.supabaseService.getTableById('profiles', this.userId);
            if (user) {
                this.userForm.patchValue(user);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            alert('Error loading user data');
        } finally {
            this.loading = false;
        }
    }

    async onSave(): Promise<void> {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        try {
            const formData = this.userForm.value;

            if (this.isEditMode && this.userId) {
                await this.supabaseService.updateRecord('profiles', this.userId, formData);
                alert('User updated successfully');
            } else {
                await this.supabaseService.createRecord('profiles', formData);
                alert('User created successfully');
            }

            this.router.navigate(['/admin/users']);
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user');
        } finally {
            this.loading = false;
        }
    }
} 