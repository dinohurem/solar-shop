import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter, take } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { selectCurrentUser, selectAuthLoading, selectAuthError } from '../../../core/auth/store/auth.selectors';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { User, UserAddress } from '../../../shared/models/user.model';
import { Actions, ofType } from '@ngrx/effects';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[#222529] font-['Poppins']">My Profile</h1>
          <p class="text-[#324053] mt-2 font-['DM_Sans']">Manage your account settings and preferences</p>
        </div>

        <!-- Success Message -->
        <div *ngIf="showSuccessMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-green-800 font-['DM_Sans'] font-medium">Profile updated successfully!</span>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="error$ | async" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-red-800 font-['DM_Sans'] font-medium">{{ (error$ | async)?.message || 'An error occurred while updating your profile.' }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Navigation -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <nav class="space-y-2">
                <button
                  (click)="setActiveTab('user-info')"
                  [class]="activeTab === 'user-info' ? 'bg-[#0ACF83] text-white' : 'text-[#324053] hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>User Info</span>
                </button>
                
                <button
                  (click)="setActiveTab('billing-shipping')"
                  [class]="activeTab === 'billing-shipping' ? 'bg-[#0ACF83] text-white' : 'text-[#324053] hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Billing & Shipping Details</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">
            <!-- User Info Tab -->
            <div *ngIf="activeTab === 'user-info'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="mb-6">
                <h2 class="text-2xl font-semibold text-[#222529] font-['Poppins'] mb-2">Personal Information</h2>
                <p class="text-[#324053] font-['DM_Sans']">Update your personal details and contact information</p>
              </div>

              <form [formGroup]="userInfoForm" (ngSubmit)="updateUserInfo()" class="space-y-6">
                <!-- Profile Picture -->
                <div class="flex items-center space-x-6">
                  <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    <img 
                      *ngIf="(currentUser$ | async)?.avatar; else defaultAvatar" 
                      [src]="(currentUser$ | async)?.avatar" 
                      [alt]="(currentUser$ | async)?.firstName"
                      class="w-full h-full object-cover">
                    <ng-template #defaultAvatar>
                      <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                    </ng-template>
                  </div>
                  <div>
                    <button type="button" class="px-4 py-2 bg-[#0ACF83] text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-[#0ACF83]/90 transition-colors">
                      Change Photo
                    </button>
                    <p class="text-sm text-[#324053] mt-1 font-['DM_Sans']">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <!-- Name Fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-[#222529] mb-2 font-['DM_Sans']">First Name*</label>
                    <input
                      formControlName="firstName"
                      type="text"
                      class="w-full h-12 px-4 py-3 border rounded-lg text-sm text-[#222529] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [class.border-red-500]="userInfoForm.get('firstName')?.invalid && userInfoForm.get('firstName')?.touched"
                      [class.border-gray-300]="!userInfoForm.get('firstName')?.invalid || !userInfoForm.get('firstName')?.touched"
                      placeholder="Enter your first name">
                    <div *ngIf="userInfoForm.get('firstName')?.invalid && userInfoForm.get('firstName')?.touched" class="mt-1 text-sm text-red-600 font-['DM_Sans']">
                      First name is required
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[#222529] mb-2 font-['DM_Sans']">Last Name*</label>
                    <input
                      formControlName="lastName"
                      type="text"
                      class="w-full h-12 px-4 py-3 border rounded-lg text-sm text-[#222529] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [class.border-red-500]="userInfoForm.get('lastName')?.invalid && userInfoForm.get('lastName')?.touched"
                      [class.border-gray-300]="!userInfoForm.get('lastName')?.invalid || !userInfoForm.get('lastName')?.touched"
                      placeholder="Enter your last name">
                    <div *ngIf="userInfoForm.get('lastName')?.invalid && userInfoForm.get('lastName')?.touched" class="mt-1 text-sm text-red-600 font-['DM_Sans']">
                      Last name is required
                    </div>
                  </div>
                </div>

                <!-- Email and Phone -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-[#222529] mb-2 font-['DM_Sans']">Email Address*</label>
                    <input
                      formControlName="email"
                      type="email"
                      class="w-full h-12 px-4 py-3 border rounded-lg text-sm text-[#222529] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [class.border-red-500]="userInfoForm.get('email')?.invalid && userInfoForm.get('email')?.touched"
                      [class.border-gray-300]="!userInfoForm.get('email')?.invalid || !userInfoForm.get('email')?.touched"
                      placeholder="Enter your email address">
                    <div *ngIf="userInfoForm.get('email')?.invalid && userInfoForm.get('email')?.touched" class="mt-1 text-sm text-red-600 font-['DM_Sans']">
                      Please enter a valid email address
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[#222529] mb-2 font-['DM_Sans']">Phone Number</label>
                    <input
                      formControlName="phone"
                      type="tel"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#222529] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      placeholder="Enter your phone number">
                  </div>
                </div>

                <!-- Date of Birth and Gender -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-[#222529] mb-2 font-['DM_Sans']">Date of Birth</label>
                    <input
                      formControlName="dateOfBirth"
                      type="date"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#222529] focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent transition-all duration-200 font-['DM_Sans']">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-[#222529] mb-2 font-['DM_Sans']">Gender</label>
                    <select
                      formControlName="gender"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#222529] focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent transition-all duration-200 font-['DM_Sans']">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    [disabled]="userInfoForm.invalid || (loading$ | async)"
                    class="px-6 py-3 bg-[#0ACF83] hover:bg-[#0ACF83]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:ring-offset-2 font-['DM_Sans']">
                    <span *ngIf="!(loading$ | async)">Save Changes</span>
                    <span *ngIf="loading$ | async" class="flex items-center space-x-2">
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Billing & Shipping Tab -->
            <div *ngIf="activeTab === 'billing-shipping'" class="space-y-6">
              <!-- Addresses Section -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h2 class="text-2xl font-semibold text-[#222529] font-['Poppins'] mb-2">Addresses</h2>
                    <p class="text-[#324053] font-['DM_Sans']">Manage your billing and shipping addresses</p>
                  </div>
                  <button
                    (click)="addNewAddress()"
                    class="px-4 py-2 bg-[#0ACF83] text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-[#0ACF83]/90 transition-colors flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>Add Address</span>
                  </button>
                </div>

                <!-- Address List -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="(currentUser$ | async)?.addresses?.length; else noAddresses">
                  <div 
                    *ngFor="let address of (currentUser$ | async)?.addresses" 
                    class="border border-gray-200 rounded-lg p-4 hover:border-[#0ACF83] transition-colors">
                    <div class="flex justify-between items-start mb-3">
                      <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 bg-[#0ACF83] text-white text-xs rounded-full font-['DM_Sans'] font-medium">
                          {{ address.type | titlecase }}
                        </span>
                        <span *ngIf="address.isDefault" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-['DM_Sans'] font-medium">
                          Default
                        </span>
                      </div>
                      <div class="flex space-x-2">
                        <button class="text-[#0ACF83] hover:text-[#0ACF83]/80 text-sm font-['DM_Sans']">Edit</button>
                        <button class="text-red-500 hover:text-red-600 text-sm font-['DM_Sans']">Delete</button>
                      </div>
                    </div>
                    <div class="text-sm text-[#324053] font-['DM_Sans'] space-y-1">
                      <div class="font-medium">{{ address.firstName }} {{ address.lastName }}</div>
                      <div>{{ address.addressLine1 }}</div>
                      <div *ngIf="address.addressLine2">{{ address.addressLine2 }}</div>
                      <div>{{ address.city }}, {{ address.state }} {{ address.postalCode }}</div>
                      <div>{{ address.country }}</div>
                      <div *ngIf="address.phone">{{ address.phone }}</div>
                    </div>
                  </div>
                </div>

                <ng-template #noAddresses>
                  <div class="text-center py-8">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <h3 class="text-lg font-medium text-[#222529] font-['Poppins'] mb-2">No addresses found</h3>
                    <p class="text-[#324053] font-['DM_Sans'] mb-4">Add your first address to get started</p>
                    <button
                      (click)="addNewAddress()"
                      class="px-4 py-2 bg-[#0ACF83] text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-[#0ACF83]/90 transition-colors">
                      Add Address
                    </button>
                  </div>
                </ng-template>
              </div>

              <!-- Payment Methods Section -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h2 class="text-2xl font-semibold text-[#222529] font-['Poppins'] mb-2">Payment Methods</h2>
                    <p class="text-[#324053] font-['DM_Sans']">Manage your saved payment methods</p>
                  </div>
                  <button
                    (click)="addNewPaymentMethod()"
                    class="px-4 py-2 bg-[#0ACF83] text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-[#0ACF83]/90 transition-colors flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>Add Payment Method</span>
                  </button>
                </div>

                <!-- Payment Methods List -->
                <div class="space-y-4" *ngIf="(currentUser$ | async)?.paymentMethods?.length; else noPaymentMethods">
                  <div 
                    *ngFor="let payment of (currentUser$ | async)?.paymentMethods" 
                    class="border border-gray-200 rounded-lg p-4 hover:border-[#0ACF83] transition-colors">
                    <div class="flex justify-between items-center">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <svg class="w-6 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-medium text-[#222529] font-['DM_Sans']">
                            {{ payment.cardDetails?.brand | titlecase }} ending in {{ payment.cardDetails?.lastFourDigits }}
                          </div>
                          <div class="text-sm text-[#324053] font-['DM_Sans']">
                            Expires {{ payment.cardDetails?.expiryMonth }}/{{ payment.cardDetails?.expiryYear }}
                          </div>
                        </div>
                        <span *ngIf="payment.isDefault" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-['DM_Sans'] font-medium">
                          Default
                        </span>
                      </div>
                      <div class="flex space-x-2">
                        <button class="text-[#0ACF83] hover:text-[#0ACF83]/80 text-sm font-['DM_Sans']">Edit</button>
                        <button class="text-red-500 hover:text-red-600 text-sm font-['DM_Sans']">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>

                <ng-template #noPaymentMethods>
                  <div class="text-center py-8">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                    <h3 class="text-lg font-medium text-[#222529] font-['Poppins'] mb-2">No payment methods found</h3>
                    <p class="text-[#324053] font-['DM_Sans'] mb-4">Add your first payment method to get started</p>
                    <button
                      (click)="addNewPaymentMethod()"
                      class="px-4 py-2 bg-[#0ACF83] text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-[#0ACF83]/90 transition-colors">
                      Add Payment Method
                    </button>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  `]
})
export class ProfileComponent implements OnInit {
    private store = inject(Store);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private actions$ = inject(Actions);

    currentUser$: Observable<User | null>;
    loading$: Observable<boolean>;
    error$: Observable<any>;

    activeTab: 'user-info' | 'billing-shipping' = 'user-info';
    userInfoForm: FormGroup;
    showSuccessMessage = false;

    constructor() {
        this.currentUser$ = this.store.select(selectCurrentUser);
        this.loading$ = this.store.select(selectAuthLoading);
        this.error$ = this.store.select(selectAuthError);

        this.userInfoForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            dateOfBirth: [''],
            gender: ['']
        });
    }

    ngOnInit(): void {
        // Load user profile data
        this.store.dispatch(AuthActions.loadUserProfile());

        // Subscribe to user data and populate form
        this.currentUser$.subscribe(user => {
            if (user) {
                this.userInfoForm.patchValue({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth || '',
                    gender: user.gender || ''
                });
            }
        });

        // Listen for successful profile updates
        this.actions$.pipe(
            ofType(AuthActions.updateUserProfileSuccess),
            take(1)
        ).subscribe(() => {
            this.showSuccessMessage = true;
            setTimeout(() => {
                this.showSuccessMessage = false;
            }, 5000);
        });
    }

    setActiveTab(tab: 'user-info' | 'billing-shipping'): void {
        this.activeTab = tab;
        this.showSuccessMessage = false; // Hide success message when switching tabs
    }

    updateUserInfo(): void {
        if (this.userInfoForm.valid) {
            const updatedUser = {
                ...this.userInfoForm.value
            };
            this.store.dispatch(AuthActions.updateUserProfile({ user: updatedUser }));
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.userInfoForm.controls).forEach(key => {
                this.userInfoForm.get(key)?.markAsTouched();
            });
        }
    }

    addNewAddress(): void {
        // TODO: Implement add address modal/form
        console.log('Add new address');
    }

    addNewPaymentMethod(): void {
        // TODO: Implement add payment method modal/form
        console.log('Add new payment method');
    }
} 