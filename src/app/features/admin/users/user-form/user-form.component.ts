import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  template: `
    <app-admin-form
      [title]="isEditMode ? ('adminUsers.editUser' | translate) : ('adminUsers.createUser' | translate)"
      [subtitle]="'adminUsers.manageUserAccounts' | translate"
      [form]="userForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="loading"
      backRoute="/admin/users"
      (formSubmit)="onSave()">
      
      <div [formGroup]="userForm" class="space-y-8">
        <!-- Personal Information Section -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {{ 'adminUsers.personalInformation' | translate }}
          </h3>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- First Name -->
            <div class="relative">
              <input
                type="text"
                id="first_name"
                formControlName="first_name"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="First Name"
                [class.border-red-500]="userForm.get('first_name')?.invalid && userForm.get('first_name')?.touched">
              <label for="first_name" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.firstName' | translate }} *
              </label>
              <div *ngIf="userForm.get('first_name')?.invalid && userForm.get('first_name')?.touched" 
                   class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'adminUsers.firstNameRequired' | translate }}
              </div>
            </div>

            <!-- Last Name -->
            <div class="relative">
              <input
                type="text"
                id="last_name"
                formControlName="last_name"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Last Name"
                [class.border-red-500]="userForm.get('last_name')?.invalid && userForm.get('last_name')?.touched">
              <label for="last_name" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.lastName' | translate }} *
              </label>
              <div *ngIf="userForm.get('last_name')?.invalid && userForm.get('last_name')?.touched" 
                   class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'adminUsers.lastNameRequired' | translate }}
              </div>
            </div>

            <!-- Email -->
            <div class="relative">
              <input
                type="email"
                id="email"
                formControlName="email"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Email"
                [class.border-red-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched">
              <label for="email" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.email' | translate }} *
              </label>
              <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" 
                   class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="userForm.get('email')?.errors?.['required']">{{ 'adminUsers.emailRequired' | translate }}</span>
                <span *ngIf="userForm.get('email')?.errors?.['email']">{{ 'adminUsers.validEmailRequired' | translate }}</span>
              </div>
            </div>

            <!-- Phone -->
            <div class="relative">
              <input
                type="tel"
                id="phone"
                formControlName="phone"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Phone">
              <label for="phone" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.phone' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Profile Information Section -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ 'adminUsers.profileInformation' | translate }}
          </h3>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Avatar URL -->
            <div class="relative">
              <input
                type="url"
                id="avatar_url"
                formControlName="avatar_url"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Avatar URL">
              <label for="avatar_url" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.avatarUrl' | translate }}
              </label>
            </div>

            <!-- Role -->
            <div class="relative">
              <select
                id="role"
                formControlName="role"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
                [class.border-red-500]="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                <option value="">{{ 'adminUsers.selectRole' | translate }}</option>
                <option value="customer">{{ 'adminUsers.roleUser' | translate }}</option>
                <option value="admin">{{ 'adminUsers.roleAdmin' | translate }}</option>
                <option value="company_admin">{{ 'adminUsers.roleModerator' | translate }}</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'adminUsers.role' | translate }} *
              </label>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched" 
                   class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                {{ 'adminUsers.roleRequired' | translate }}
              </div>
            </div>

            <!-- Date of Birth -->
            <div class="relative">
              <input
                type="date"
                id="date_of_birth"
                formControlName="date_of_birth"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white">
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                {{ 'adminUsers.dateOfBirth' | translate }}
              </label>
            </div>

            <!-- Bio -->
            <div class="relative">
              <textarea
                id="bio"
                formControlName="bio"
                rows="4"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Bio"></textarea>
              <label for="bio" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.bio' | translate }}
              </label>
            </div>
          </div>
        </div>

        <!-- Address Information Section -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ 'adminUsers.addressInformation' | translate }}
          </h3>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Street Address -->
            <div class="relative lg:col-span-2">
              <input
                type="text"
                id="street_address"
                formControlName="street_address"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Street Address">
              <label for="street_address" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.streetAddress' | translate }}
              </label>
            </div>

            <!-- City -->
            <div class="relative">
              <input
                type="text"
                id="city"
                formControlName="city"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="City">
              <label for="city" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.city' | translate }}
              </label>
            </div>

            <!-- State -->
            <div class="relative">
              <input
                type="text"
                id="state"
                formControlName="state"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="State">
              <label for="state" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.state' | translate }}
              </label>
            </div>

            <!-- Postal Code -->
            <div class="relative">
              <input
                type="text"
                id="postal_code"
                formControlName="postal_code"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Postal Code">
              <label for="postal_code" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.postalCode' | translate }}
              </label>
            </div>

            <!-- Country -->
            <div class="relative">
              <input
                type="text"
                id="country"
                formControlName="country"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Country">
              <label for="country" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                {{ 'adminUsers.country' | translate }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </app-admin-form>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private titleService = inject(Title);

  userForm!: FormGroup;
  loading = false;
  isEditMode = false;
  userId: string | null = null;

  constructor() {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      avatar_url: [''],
      role: ['', Validators.required],
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
    // Check if we're in edit mode
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.isEditMode = true;
      this.userId = userId;
      this.loadUser();
    }

    // Set page title
    this.titleService.setTitle(this.isEditMode ? 'Edit User - Solar Shop Admin' : 'Create User - Solar Shop Admin');
  }

  private async loadUser(): Promise<void> {
    if (!this.userId) return;

    try {
      const data = await this.supabaseService.getTableById('profiles', this.userId);
      if (data) {
        this.userForm.patchValue(data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async onSave(): Promise<void> {
    if (this.userForm.invalid) return;

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