import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter, take, BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { selectCurrentUser, selectAuthLoading, selectAuthError } from '../../../core/auth/store/auth.selectors';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { User, UserAddress } from '../../../shared/models/user.model';
import { Actions, ofType } from '@ngrx/effects';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Order } from '../../../shared/models/order.model';
import { Review } from '../../../shared/models/review.model';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">{{ 'profile.myProfile' | translate }}</h1>
          <p class="text-gray-600 mt-2 font-['DM_Sans']">{{ 'profile.manageAccount' | translate }}</p>
        </div>

        <!-- Success Message -->
        <div *ngIf="showSuccessMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-green-800 font-['DM_Sans'] font-medium">{{ 'profile.profileUpdated' | translate }}</span>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="error$ | async" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-red-800 font-['DM_Sans'] font-medium">{{ (error$ | async)?.message || ('profile.updateError' | translate) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Navigation -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <nav class="space-y-2">
                <button
                  (click)="setActiveTab('user-info')"
                  [class]="activeTab === 'user-info' ? 'bg-solar-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>{{ 'profile.userInfo' | translate }}</span>
                </button>
                
                <button
                  (click)="setActiveTab('billing-shipping')"
                  [class]="activeTab === 'billing-shipping' ? 'bg-solar-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>{{ 'profile.billingShipping' | translate }}</span>
                </button>

                <button
                  (click)="setActiveTab('my-orders')"
                  [class]="activeTab === 'my-orders' ? 'bg-solar-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <span>{{ 'profile.myOrders' | translate }}</span>
                </button>

                <button
                  (click)="setActiveTab('my-reviews')"
                  [class]="activeTab === 'my-reviews' ? 'bg-solar-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  <span>{{ 'profile.myReviews' | translate }}</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">
            <!-- User Info Tab -->
            <div *ngIf="activeTab === 'user-info'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">{{ 'profile.personalInformation' | translate }}</h2>
                <p class="text-gray-600 font-['DM_Sans']">{{ 'profile.updatePersonalDetails' | translate }}</p>
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
                    <button type="button" class="px-4 py-2 bg-solar-600 text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-solar-700 transition-colors">
                      {{ 'profile.changePhoto' | translate }}
                    </button>
                    <p class="text-sm text-gray-600 mt-1 font-['DM_Sans']">{{ 'profile.photoRequirements' | translate }}</p>
                  </div>
                </div>

                <!-- Name Fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'profile.firstName' | translate }}*</label>
                    <input
                      formControlName="firstName"
                      type="text"
                      class="w-full h-12 px-4 py-3 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [class.border-red-500]="userInfoForm.get('firstName')?.invalid && userInfoForm.get('firstName')?.touched"
                      [class.border-gray-300]="!userInfoForm.get('firstName')?.invalid || !userInfoForm.get('firstName')?.touched"
                      [placeholder]="'profile.enterFirstName' | translate">
                    <div *ngIf="userInfoForm.get('firstName')?.invalid && userInfoForm.get('firstName')?.touched" class="mt-1 text-sm text-red-600 font-['DM_Sans']">
                      {{ 'profile.firstNameRequired' | translate }}
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'profile.lastName' | translate }}*</label>
                    <input
                      formControlName="lastName"
                      type="text"
                      class="w-full h-12 px-4 py-3 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [class.border-red-500]="userInfoForm.get('lastName')?.invalid && userInfoForm.get('lastName')?.touched"
                      [class.border-gray-300]="!userInfoForm.get('lastName')?.invalid || !userInfoForm.get('lastName')?.touched"
                      [placeholder]="'profile.enterLastName' | translate">
                    <div *ngIf="userInfoForm.get('lastName')?.invalid && userInfoForm.get('lastName')?.touched" class="mt-1 text-sm text-red-600 font-['DM_Sans']">
                      {{ 'profile.lastNameRequired' | translate }}
                    </div>
                  </div>
                </div>

                <!-- Email and Phone -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'profile.emailAddress' | translate }}*</label>
                    <input
                      formControlName="email"
                      type="email"
                      class="w-full h-12 px-4 py-3 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [class.border-red-500]="userInfoForm.get('email')?.invalid && userInfoForm.get('email')?.touched"
                      [class.border-gray-300]="!userInfoForm.get('email')?.invalid || !userInfoForm.get('email')?.touched"
                      [placeholder]="'profile.enterEmailAddress' | translate">
                    <div *ngIf="userInfoForm.get('email')?.invalid && userInfoForm.get('email')?.touched" class="mt-1 text-sm text-red-600 font-['DM_Sans']">
                      {{ 'profile.validEmailRequired' | translate }}
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'profile.phoneNumber' | translate }}</label>
                    <input
                      formControlName="phone"
                      type="tel"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [placeholder]="'profile.enterPhoneNumber' | translate">
                  </div>
                </div>

                <!-- Date of Birth and Gender -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'profile.dateOfBirth' | translate }}</label>
                    <input
                      formControlName="dateOfBirth"
                      type="date"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'profile.gender' | translate }}</label>
                    <select
                      formControlName="gender"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']">
                      <option value="">{{ 'profile.selectGender' | translate }}</option>
                      <option value="male">{{ 'profile.male' | translate }}</option>
                      <option value="female">{{ 'profile.female' | translate }}</option>
                      <option value="other">{{ 'profile.other' | translate }}</option>
                      <option value="prefer_not_to_say">{{ 'profile.preferNotToSay' | translate }}</option>
                    </select>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    [disabled]="userInfoForm.invalid || (loading$ | async)"
                    class="px-6 py-3 bg-solar-600 hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:ring-offset-2 font-['DM_Sans']">
                    <span *ngIf="!(loading$ | async)">{{ 'profile.saveChanges' | translate }}</span>
                    <span *ngIf="loading$ | async" class="flex items-center space-x-2">
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ 'profile.saving' | translate }}</span>
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
                    <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">{{ 'profile.addresses' | translate }}</h2>
                    <p class="text-gray-600 font-['DM_Sans']">{{ 'profile.manageBillingShipping' | translate }}</p>
                  </div>
                  <button
                    (click)="addNewAddress()"
                    class="px-4 py-2 bg-solar-600 text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-solar-700 transition-colors flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>{{ 'profile.addAddress' | translate }}</span>
                  </button>
                </div>

                <!-- Address List -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="(currentUser$ | async)?.addresses?.length; else noAddresses">
                  <div 
                    *ngFor="let address of (currentUser$ | async)?.addresses" 
                    class="border border-gray-200 rounded-lg p-4 hover:border-solar-600 transition-colors">
                    <div class="flex justify-between items-start mb-3">
                      <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 bg-solar-600 text-white text-xs rounded-full font-['DM_Sans'] font-medium">
                          {{ address.type | titlecase }}
                        </span>
                        <span *ngIf="address.isDefault" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-['DM_Sans'] font-medium">
                          {{ 'profile.default' | translate }}
                        </span>
                      </div>
                      <div class="flex space-x-2">
                        <button class="text-solar-600 hover:text-solar-700 text-sm font-['DM_Sans']">{{ 'profile.edit' | translate }}</button>
                        <button class="text-red-500 hover:text-red-600 text-sm font-['DM_Sans']">{{ 'profile.delete' | translate }}</button>
                      </div>
                    </div>
                    <div class="text-sm text-gray-600 font-['DM_Sans'] space-y-1">
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
                    <h3 class="text-lg font-medium text-gray-900 font-['Poppins'] mb-2">{{ 'profile.noAddressesFound' | translate }}</h3>
                    <p class="text-gray-600 font-['DM_Sans'] mb-4">{{ 'profile.addFirstAddress' | translate }}</p>
                    <button
                      (click)="addNewAddress()"
                      class="px-4 py-2 bg-solar-600 text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-solar-700 transition-colors">
                      {{ 'profile.addAddress' | translate }}
                    </button>
                  </div>
                </ng-template>
              </div>

              <!-- Payment Methods Section -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">{{ 'profile.paymentMethods' | translate }}</h2>
                    <p class="text-gray-600 font-['DM_Sans']">{{ 'profile.manageSavedPayment' | translate }}</p>
                  </div>
                  <button
                    (click)="addNewPaymentMethod()"
                    class="px-4 py-2 bg-solar-600 text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-solar-700 transition-colors flex items-center space-x-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>{{ 'profile.addPaymentMethod' | translate }}</span>
                  </button>
                </div>

                <!-- Payment Methods List -->
                <div class="space-y-4" *ngIf="(currentUser$ | async)?.paymentMethods?.length; else noPaymentMethods">
                  <div 
                    *ngFor="let payment of (currentUser$ | async)?.paymentMethods" 
                    class="border border-gray-200 rounded-lg p-4 hover:border-solar-600 transition-colors">
                    <div class="flex justify-between items-center">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <svg class="w-6 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        </div>
                        <div>
                          <div class="font-medium text-gray-900 font-['DM_Sans']">
                            {{ payment.cardDetails?.brand | titlecase }} ending in {{ payment.cardDetails?.lastFourDigits }}
                          </div>
                          <div class="text-sm text-gray-600 font-['DM_Sans']">
                            Expires {{ payment.cardDetails?.expiryMonth }}/{{ payment.cardDetails?.expiryYear }}
                          </div>
                        </div>
                        <span *ngIf="payment.isDefault" class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-['DM_Sans'] font-medium">
                          {{ 'profile.default' | translate }}
                        </span>
                      </div>
                      <div class="flex space-x-2">
                        <button class="text-solar-600 hover:text-solar-700 text-sm font-['DM_Sans']">{{ 'profile.edit' | translate }}</button>
                        <button class="text-red-500 hover:text-red-600 text-sm font-['DM_Sans']">{{ 'profile.delete' | translate }}</button>
                      </div>
                    </div>
                  </div>
                </div>

                <ng-template #noPaymentMethods>
                  <div class="text-center py-8">
                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 font-['Poppins'] mb-2">{{ 'profile.noPaymentMethodsFound' | translate }}</h3>
                    <p class="text-gray-600 font-['DM_Sans'] mb-4">{{ 'profile.addFirstPayment' | translate }}</p>
                    <button
                      (click)="addNewPaymentMethod()"
                      class="px-4 py-2 bg-solar-600 text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-solar-700 transition-colors">
                      {{ 'profile.addPaymentMethod' | translate }}
                    </button>
                  </div>
                </ng-template>
              </div>
            </div>

            <!-- My Orders Tab -->
            <div *ngIf="activeTab === 'my-orders'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">{{ 'profile.myOrders' | translate }}</h2>
                <p class="text-gray-600 font-['DM_Sans']">{{ 'profile.viewOrderHistory' | translate }}</p>
              </div>

              <!-- Loading State -->
              <div *ngIf="ordersLoading$ | async" class="flex justify-center py-8">
                <svg class="animate-spin w-8 h-8 text-solar-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <!-- Orders List -->
              <div class="space-y-4" *ngIf="!(ordersLoading$ | async) && (orders$ | async)?.length; else noOrders">
                <div 
                  *ngFor="let order of orders$ | async" 
                  class="border border-gray-200 rounded-lg p-6 hover:border-solar-600 transition-colors">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 font-['Poppins']">{{ order.orderNumber }}</h3>
                      <p class="text-sm text-gray-600 font-['DM_Sans']">{{ order.orderDate | date:'medium' }}</p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full font-['DM_Sans']"
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-800': order.status === 'pending',
                              'bg-blue-100 text-blue-800': order.status === 'confirmed',
                              'bg-purple-100 text-purple-800': order.status === 'processing',
                              'bg-indigo-100 text-indigo-800': order.status === 'shipped',
                              'bg-green-100 text-green-800': order.status === 'delivered',
                              'bg-red-100 text-red-800': order.status === 'cancelled'
                            }">
                        {{ order.status | titlecase }}
                      </span>
                      <p class="text-lg font-semibold text-gray-900 mt-1 font-['DM_Sans']">
                        {{ order.totalAmount | currency:'EUR':'symbol':'1.2-2' }}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Order Items Preview -->
                  <div class="space-y-2 mb-4">
                    <div 
                      *ngFor="let item of order.items.slice(0, 2)" 
                      class="flex items-center space-x-3">
                      <img 
                        [src]="item.productImageUrl || '/assets/images/placeholder.jpg'" 
                        [alt]="item.productName"
                        class="w-12 h-12 object-cover rounded-lg bg-gray-100">
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-medium text-gray-900 truncate font-['DM_Sans']">{{ item.productName }}</h4>
                        <p class="text-sm text-gray-500 font-['DM_Sans']">Qty: {{ item.quantity }}</p>
                      </div>
                      <span class="text-sm font-medium text-gray-900 font-['DM_Sans']">
                        {{ item.totalPrice | currency:'EUR':'symbol':'1.2-2' }}
                      </span>
                    </div>
                    <div *ngIf="order.items.length > 2" class="text-sm text-gray-500 font-['DM_Sans'] pl-15">
                      +{{ order.items.length - 2 }} more items
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex space-x-3 pt-4 border-t border-gray-200">
                    <button class="text-solar-600 hover:text-solar-700 text-sm font-medium font-['DM_Sans']">
                      {{ 'profile.viewDetails' | translate }}
                    </button>
                    <button *ngIf="order.status === 'delivered'" 
                            class="text-solar-600 hover:text-solar-700 text-sm font-medium font-['DM_Sans']">
                      {{ 'profile.writeReview' | translate }}
                    </button>
                    <button *ngIf="order.trackingNumber" 
                            class="text-solar-600 hover:text-solar-700 text-sm font-medium font-['DM_Sans']">
                      {{ 'profile.trackOrder' | translate }}
                    </button>
                  </div>
                </div>
              </div>

              <ng-template #noOrders>
                <div *ngIf="!(ordersLoading$ | async)" class="text-center py-12">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 font-['Poppins'] mb-2">{{ 'profile.noOrdersFound' | translate }}</h3>
                  <p class="text-gray-600 font-['DM_Sans'] mb-6">{{ 'profile.startShopping' | translate }}</p>
                  <button
                    (click)="router.navigate(['/products'])"
                    class="px-6 py-3 bg-solar-600 text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-solar-700 transition-colors">
                    {{ 'profile.browseProducts' | translate }}
                  </button>
                </div>
              </ng-template>
            </div>

            <!-- My Reviews Tab -->
            <div *ngIf="activeTab === 'my-reviews'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">{{ 'profile.myReviews' | translate }}</h2>
                <p class="text-gray-600 font-['DM_Sans']">{{ 'profile.manageReviews' | translate }}</p>
              </div>

              <!-- Loading State -->
              <div *ngIf="reviewsLoading$ | async" class="flex justify-center py-8">
                <svg class="animate-spin w-8 h-8 text-solar-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <!-- Reviews List -->
              <div class="space-y-6" *ngIf="!(reviewsLoading$ | async) && (reviews$ | async)?.length; else noReviews">
                <div 
                  *ngFor="let review of reviews$ | async" 
                  class="border border-gray-200 rounded-lg p-6 hover:border-solar-600 transition-colors">
                  <div class="flex items-start space-x-4">
                    <img 
                      [src]="review.product?.imageUrl || '/assets/images/placeholder.jpg'" 
                      [alt]="review.product?.name"
                      class="w-16 h-16 object-cover rounded-lg bg-gray-100">
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900 font-['Poppins']">{{ review.product?.name }}</h3>
                          <div class="flex items-center space-x-1 mt-1">
                            <div class="flex space-x-1">
                              <svg *ngFor="let star of [1,2,3,4,5]" 
                                   class="w-4 h-4"
                                   [class.text-yellow-400]="star <= review.rating"
                                   [class.text-gray-300]="star > review.rating"
                                   fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                              </svg>
                            </div>
                            <span class="text-sm text-gray-600 font-['DM_Sans']">{{ review.createdAt | date:'mediumDate' }}</span>
                          </div>
                        </div>
                        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full font-['DM_Sans']"
                              [ngClass]="{
                                'bg-yellow-100 text-yellow-800': review.status === 'pending',
                                'bg-green-100 text-green-800': review.status === 'approved',
                                'bg-red-100 text-red-800': review.status === 'rejected',
                                'bg-gray-100 text-gray-800': review.status === 'hidden'
                              }">
                          {{ review.status | titlecase }}
                        </span>
                      </div>
                      
                      <div *ngIf="review.title" class="mb-2">
                        <h4 class="font-medium text-gray-900 font-['DM_Sans']">{{ review.title }}</h4>
                      </div>
                      
                      <div *ngIf="review.comment" class="mb-3">
                        <p class="text-gray-700 font-['DM_Sans']">{{ review.comment }}</p>
                      </div>

                      <div *ngIf="review.isVerifiedPurchase" class="mb-3">
                        <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full font-['DM_Sans']">
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                          {{ 'profile.verifiedPurchase' | translate }}
                        </span>
                      </div>

                      <div *ngIf="review.adminResponse" class="bg-gray-50 rounded-lg p-3 mt-3">
                        <h5 class="text-sm font-medium text-gray-900 mb-1 font-['DM_Sans']">{{ 'profile.adminResponse' | translate }}</h5>
                        <p class="text-sm text-gray-700 font-['DM_Sans']">{{ review.adminResponse }}</p>
                      </div>

                      <!-- Actions -->
                      <div class="flex space-x-3 mt-4">
                        <button class="text-solar-600 hover:text-solar-700 text-sm font-medium font-['DM_Sans']">
                          {{ 'profile.editReview' | translate }}
                        </button>
                        <button class="text-red-600 hover:text-red-700 text-sm font-medium font-['DM_Sans']">
                          {{ 'profile.deleteReview' | translate }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ng-template #noReviews>
                <div *ngIf="!(reviewsLoading$ | async)" class="text-center py-12">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 font-['Poppins'] mb-2">{{ 'profile.noReviewsFound' | translate }}</h3>
                  <p class="text-gray-600 font-['DM_Sans'] mb-6">{{ 'profile.writeFirstReview' | translate }}</p>
                  <button
                    (click)="router.navigate(['/products'])"
                    class="px-6 py-3 bg-solar-600 text-white rounded-lg font-['DM_Sans'] font-medium hover:bg-solar-700 transition-colors">
                    {{ 'profile.browseProducts' | translate }}
                  </button>
                </div>
              </ng-template>
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
  public router = inject(Router);
  private actions$ = inject(Actions);
  private supabaseService = inject(SupabaseService);

  currentUser$: Observable<User | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  activeTab: 'user-info' | 'billing-shipping' | 'my-orders' | 'my-reviews' = 'user-info';
  userInfoForm: FormGroup;
  showSuccessMessage = false;

  // Orders
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private ordersLoadingSubject = new BehaviorSubject<boolean>(false);
  orders$ = this.ordersSubject.asObservable();
  ordersLoading$ = this.ordersLoadingSubject.asObservable();

  // Reviews
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  private reviewsLoadingSubject = new BehaviorSubject<boolean>(false);
  reviews$ = this.reviewsSubject.asObservable();
  reviewsLoading$ = this.reviewsLoadingSubject.asObservable();

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

  setActiveTab(tab: 'user-info' | 'billing-shipping' | 'my-orders' | 'my-reviews'): void {
    this.activeTab = tab;
    this.showSuccessMessage = false; // Hide success message when switching tabs

    // Load data when switching to specific tabs
    if (tab === 'my-orders') {
      this.loadUserOrders();
    } else if (tab === 'my-reviews') {
      this.loadUserReviews();
    }
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

  private async loadUserOrders(): Promise<void> {
    this.ordersLoadingSubject.next(true);
    try {
      // TODO: Implement actual order loading from Supabase
      // For now, return empty array as placeholder
      const orders: Order[] = [];
      this.ordersSubject.next(orders);
    } catch (error) {
      console.error('Error loading user orders:', error);
      this.ordersSubject.next([]);
    } finally {
      this.ordersLoadingSubject.next(false);
    }
  }

  private async loadUserReviews(): Promise<void> {
    this.reviewsLoadingSubject.next(true);
    try {
      // TODO: Implement actual review loading from Supabase
      // For now, return empty array as placeholder
      const reviews: Review[] = [];
      this.reviewsSubject.next(reviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
      this.reviewsSubject.next([]);
    } finally {
      this.reviewsLoadingSubject.next(false);
    }
  }
} 