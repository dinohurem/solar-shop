import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { User } from '../../../../../shared/models/user.model';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'checkout.step2' | translate }}</h2>
      
      <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
        <!-- Contact Information -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'checkout.personalInfo' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.firstName' | translate }} *</label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.firstName' | translate"
              >
              <div *ngIf="shippingForm.get('firstName')?.invalid && shippingForm.get('firstName')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'checkout.firstNameRequired' | translate }}
              </div>
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.lastName' | translate }} *</label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.lastName' | translate"
              >
              <div *ngIf="shippingForm.get('lastName')?.invalid && shippingForm.get('lastName')?.touched" class="mt-1 text-sm text-red-600">
              {{ 'checkout.lastNameRequired' | translate }}
              </div>
            </div>
            <div class="md:col-span-2">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Email *</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.email' | translate"
              >
              <div *ngIf="shippingForm.get('email')?.invalid && shippingForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'checkout.emailRequired' | translate }}
              </div>
            </div>
            <div class="md:col-span-2">
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.phone' | translate }} *</label>
              <input
                type="tel"
                id="phone"
                formControlName="phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.phone' | translate"
              >
              <div *ngIf="shippingForm.get('phone')?.invalid && shippingForm.get('phone')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'checkout.phoneRequired' | translate }}
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-[#324053] mb-4 font-['Poppins']">{{ 'checkout.shippingAddress' | translate }}</h3>
          <div class="space-y-4">
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.address' | translate }} *</label>
              <input
                type="text"
                id="address"
                formControlName="address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.address' | translate"
              >
              <div *ngIf="shippingForm.get('address')?.invalid && shippingForm.get('address')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'checkout.addressRequired' | translate }}
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.city' | translate }} *</label>
                <input
                  type="text"
                  id="city"
                  formControlName="city"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                  [placeholder]="'checkout.city' | translate"
                >
                <div *ngIf="shippingForm.get('city')?.invalid && shippingForm.get('city')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'checkout.cityRequired' | translate }}
                </div>
              </div>
              <div>
                <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.postalCode' | translate }} *</label>
                <input
                  type="text"
                  id="postalCode"
                  formControlName="postalCode"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                  [placeholder]="'checkout.postalCode' | translate"
                >
                <div *ngIf="shippingForm.get('postalCode')?.invalid && shippingForm.get('postalCode')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'checkout.postalCodeRequired' | translate }}
                </div>
              </div>
              <div>
                <label for="country" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.country' | translate }} *</label>
                <select
                  id="country"
                  formControlName="country"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                >
                  <option value="">{{ 'checkout.selectCountry' | translate }}</option>
                  <option value="Croatia">{{ 'checkout.countryCroatia' | translate }}</option>
                </select>
                <div *ngIf="shippingForm.get('country')?.invalid && shippingForm.get('country')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'checkout.countryRequired' | translate }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pickup Options -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-[#324053] mb-4 font-['Poppins']">{{ 'checkout.pickupOptions' | translate }}</h3>
          <div class="space-y-3">
            <label class="flex items-center p-4 border border-green-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-green-50">
              <input
                type="radio"
                name="shippingOption"
                value="pickup_at_storage"
                formControlName="shippingOption"
                class="text-[#0ACF83] focus:ring-[#0ACF83]"
                checked
              >
              <div class="ml-3 flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-[#324053] font-['DM_Sans']">{{ 'checkout.pickupAtStorage' | translate }}</span>
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-green-600 font-['DM_Sans']">{{ 'checkout.free' | translate }}</span>
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <p class="text-sm text-gray-600 font-['DM_Sans']">{{ 'checkout.pickupAtStorageDescription' | translate }}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button"
            (click)="goBack()"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
          >
          {{ 'checkout.backStep' | translate }}  {{ 'checkout.step1' | translate }}
          </button>
          <button 
            type="submit"
            [disabled]="shippingForm.invalid"
            class="flex-1 px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ 'checkout.nextStep' | translate }} {{ 'checkout.step3' | translate }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class ShippingComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  shippingForm: FormGroup;
  currentUser: User | null = null;

  constructor() {
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      shippingOption: ['pickup_at_storage', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Subscribe to current user and pre-populate form fields if logged in
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.shippingForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || ''
          });
          // Disable email field for authenticated users
          if (user.email) {
            this.shippingForm.get('email')?.disable();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    // Ensure cart items are still available for checkout
    const checkoutItems = localStorage.getItem('checkoutItems');
    if (!checkoutItems) {
      console.error('No checkout items found. Redirecting to cart.');
      this.router.navigate(['/blagajna/pregled-narudzbe']);
      return;
    }

    // Save shipping information to localStorage for payment step
    const shippingData = this.shippingForm.value;
    localStorage.setItem('shippingInfo', JSON.stringify(shippingData));

    this.router.navigate(['/blagajna/placanje']);
  }

  goBack() {
    this.router.navigate(['/blagajna/pregled-narudzbe']);
  }
} 