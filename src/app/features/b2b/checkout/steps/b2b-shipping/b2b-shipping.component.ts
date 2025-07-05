import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../../services/supabase.service';
import { User } from '../../../../../shared/models/user.model';
import { Company } from '../../../../../shared/models/company.model';

@Component({
  selector: 'app-b2b-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'b2bCheckout.shippingInfo' | translate }}</h2>
      
      <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
        <!-- Company Information (Read-only) -->
        <div class="mb-8 p-4 bg-solar-50 border border-solar-200 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.companyInfo' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.companyName' | translate }}</label>
              <input
                type="text"
                [value]="company?.companyName || ''"
                readonly
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-['DM_Sans'] cursor-not-allowed"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.companyEmail' | translate }}</label>
              <input
                type="email"
                [value]="company?.companyEmail || ''"
                readonly
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-['DM_Sans'] cursor-not-allowed"
              >
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.companyAddress' | translate }}</label>
              <input
                type="text"
                [value]="company?.companyAddress || ''"
                readonly
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-['DM_Sans'] cursor-not-allowed"
              >
            </div>
          </div>
        </div>

        <!-- Contact Person Information -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.contactPerson' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="contactName" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.contactName' | translate }} *</label>
              <input
                type="text"
                id="contactName"
                formControlName="contactName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'b2bCheckout.contactName' | translate"
              >
              <div *ngIf="shippingForm.get('contactName')?.invalid && shippingForm.get('contactName')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'b2bCheckout.contactNameRequired' | translate }}
              </div>
            </div>
            <div>
              <label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.contactEmail' | translate }} *</label>
              <input
                type="email"
                id="contactEmail"
                formControlName="contactEmail"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'b2bCheckout.contactEmail' | translate"
              >
              <div *ngIf="shippingForm.get('contactEmail')?.invalid && shippingForm.get('contactEmail')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'b2bCheckout.contactEmailRequired' | translate }}
              </div>
            </div>
            <div class="md:col-span-2">
              <label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.contactPhone' | translate }} *</label>
              <input
                type="tel"
                id="contactPhone"
                formControlName="contactPhone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'b2bCheckout.contactPhone' | translate"
              >
              <div *ngIf="shippingForm.get('contactPhone')?.invalid && shippingForm.get('contactPhone')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'b2bCheckout.contactPhoneRequired' | translate }}
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.deliveryAddress' | translate }}</h3>
          <div class="space-y-4">
            <div>
              <label for="deliveryAddress" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.address' | translate }} *</label>
              <input
                type="text"
                id="deliveryAddress"
                formControlName="deliveryAddress"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'b2bCheckout.address' | translate"
              >
              <div *ngIf="shippingForm.get('deliveryAddress')?.invalid && shippingForm.get('deliveryAddress')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'b2bCheckout.addressRequired' | translate }}
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="deliveryCity" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.city' | translate }} *</label>
                <input
                  type="text"
                  id="deliveryCity"
                  formControlName="deliveryCity"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                  [placeholder]="'b2bCheckout.city' | translate"
                >
                <div *ngIf="shippingForm.get('deliveryCity')?.invalid && shippingForm.get('deliveryCity')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'b2bCheckout.cityRequired' | translate }}
                </div>
              </div>
              <div>
                <label for="deliveryPostalCode" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.postalCode' | translate }} *</label>
                <input
                  type="text"
                  id="deliveryPostalCode"
                  formControlName="deliveryPostalCode"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                  [placeholder]="'b2bCheckout.postalCode' | translate"
                >
                <div *ngIf="shippingForm.get('deliveryPostalCode')?.invalid && shippingForm.get('deliveryPostalCode')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'b2bCheckout.postalCodeRequired' | translate }}
                </div>
              </div>
              <div>
                <label for="deliveryCountry" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.country' | translate }} *</label>
                <select
                  id="deliveryCountry"
                  formControlName="deliveryCountry"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                >
                  <option value="">{{ 'b2bCheckout.selectCountry' | translate }}</option>
                  <option value="Bosnia">{{ 'b2bCheckout.countryBosnia' | translate }}</option>
                  <option value="Croatia">{{ 'b2bCheckout.countryCroatia' | translate }}</option>
                  <option value="Serbia">{{ 'b2bCheckout.countrySerbia' | translate }}</option>
                </select>
                <div *ngIf="shippingForm.get('deliveryCountry')?.invalid && shippingForm.get('deliveryCountry')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'b2bCheckout.countryRequired' | translate }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.additionalInfo' | translate }}</h3>
          <div class="space-y-4">
            <div>
              <label for="deliveryInstructions" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'b2bCheckout.deliveryInstructions' | translate }}</label>
              <textarea
                id="deliveryInstructions"
                formControlName="deliveryInstructions"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'b2bCheckout.deliveryInstructions' | translate"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Shipping Options -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'b2bCheckout.shippingOptions' | translate }}</h3>
          <div class="space-y-3">
            <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="shippingMethod"
                value="pickup"
                formControlName="shippingMethod"
                class="text-solar-600 focus:ring-solar-500"
              >
              <div class="ml-3 flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-gray-900 font-['DM_Sans']">{{ 'b2bCheckout.pickupAtStore' | translate }}</span>
                  <span class="font-semibold text-gray-900 font-['DM_Sans']">{{ 'b2bCheckout.free' | translate }}</span>
                </div>
                <p class="text-sm text-gray-600 font-['DM_Sans']">{{ 'b2bCheckout.pickupAtStoreDescription' | translate }}</p>
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
            {{ 'b2bCheckout.backStep' | translate }} {{ 'b2bCheckout.step1' | translate }}
          </button>
          <button 
            type="submit"
            [disabled]="shippingForm.invalid"
            class="flex-1 px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ 'b2bCheckout.nextStep' | translate }} {{ 'b2bCheckout.step3' | translate }}
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
export class B2bShippingComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private destroy$ = new Subject<void>();

  shippingForm: FormGroup;
  currentUser: User | null = null;
  company: Company | null = null;

  constructor() {
    this.shippingForm = this.fb.group({
      contactName: ['', [Validators.required]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required]],
      deliveryAddress: ['', [Validators.required]],
      deliveryCity: ['', [Validators.required]],
      deliveryPostalCode: ['', [Validators.required]],
      deliveryCountry: ['', [Validators.required]],
      deliveryInstructions: [''],
      shippingMethod: ['pickup', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    // Subscribe to current user and load company information
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        this.currentUser = user;
        if (user?.id) {
          await this.loadCompanyInfo(user.id);
          // Pre-populate contact information
          this.shippingForm.patchValue({
            contactName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            contactEmail: user.email
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadCompanyInfo(userId: string): Promise<void> {
    try {
      const { data: companies, error } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', userId)
        .eq('status', 'approved')
        .single();

      if (!error && companies) {
        this.company = companies;
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }

  onSubmit() {
    // Ensure cart items are still available for checkout
    const checkoutItems = localStorage.getItem('b2bCheckoutItems');
    if (!checkoutItems) {
      console.error('No B2B checkout items found. Redirecting to cart.');
      this.router.navigate(['/partners/checkout/order-review']);
      return;
    }

    // Save shipping information to localStorage for payment step
    const shippingData = {
      ...this.shippingForm.value,
      company: this.company
    };
    localStorage.setItem('b2bShippingInfo', JSON.stringify(shippingData));

    this.router.navigate(['/partners/checkout/payment']);
  }

  goBack() {
    this.router.navigate(['/partners/checkout/order-review']);
  }
} 