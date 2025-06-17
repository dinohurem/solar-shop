import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent],
  template: `
    <app-admin-form
      [title]="isEditMode ? 'Edit Offer' : 'Create Offer'"
      [subtitle]="isEditMode ? 'Update offer information' : 'Create a new promotional offer'"
      [form]="offerForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/offers'"
      (formSubmit)="onSubmit($event)"
    >
      <div [formGroup]="offerForm" class="space-y-8">
        <!-- Basic Info -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Basic Information
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="text"
              id="title"
              formControlName="title"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Offer Title"
              >
              <label for="title" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Offer Title *
              </label>
              <div *ngIf="offerForm.get('title')?.invalid && offerForm.get('title')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              Title is required
            </div>
          </div>

            <div class="relative">
              <select
                id="type"
                formControlName="type"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
              >
                <option value="">Select offer type</option>
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Amount</option>
                <option value="bogo">Buy One Get One</option>
                <option value="bundle">Bundle Deal</option>
              </select>
              <label for="type" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Offer Type *
              </label>
              <div *ngIf="offerForm.get('type')?.invalid && offerForm.get('type')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Offer type is required
              </div>
            </div>
        </div>

          <div class="mt-6">
            <div class="relative">
          <textarea
            id="description"
            formControlName="description"
            rows="3"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Offer Description"
          ></textarea>
              <label for="description" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Description
              </label>
            </div>
          </div>
        </div>

        <!-- Discount Details -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            Discount Configuration
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="relative">
            <select
              id="discount_type"
              formControlName="discount_type"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
            >
              <option value="">Select discount type</option>
              <option value="percentage">Percentage (%)</option>
              <option value="amount">Fixed Amount (€)</option>
            </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Discount Type *
              </label>
              <div *ngIf="offerForm.get('discount_type')?.invalid && offerForm.get('discount_type')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              Discount type is required
            </div>
          </div>

            <div class="relative">
            <input
              type="number"
              id="discount_value"
              formControlName="discount_value"
              step="0.01"
              min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              [placeholder]="offerForm.get('discount_type')?.value === 'percentage' ? '10' : '50.00'"
            >
              <label for="discount_value" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Discount Value *
              </label>
              <div *ngIf="offerForm.get('discount_value')?.invalid && offerForm.get('discount_value')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              Discount value is required
            </div>
          </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">€</span>
              </div>
            <input
              type="number"
              id="minimum_purchase"
              formControlName="minimum_purchase"
              step="0.01"
              min="0"
                class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="0.00"
            >
              <label for="minimum_purchase" class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Minimum Purchase (€)
              </label>
            </div>
          </div>
        </div>

        <!-- Date Range -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Validity Period
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="datetime-local"
              id="start_date"
              formControlName="start_date"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200"
              >
              <label for="start_date" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <div *ngIf="offerForm.get('start_date')?.invalid && offerForm.get('start_date')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              Start date is required
            </div>
          </div>

            <div class="relative">
            <input
              type="datetime-local"
              id="end_date"
              formControlName="end_date"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200"
            >
              <label for="end_date" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                End Date
              </label>
            </div>
          </div>
        </div>

        <!-- Usage Limits -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Usage Configuration
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="number"
              id="usage_limit"
              formControlName="usage_limit"
              min="1"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="Unlimited"
            >
              <label for="usage_limit" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Usage Limit
              </label>
              <p class="mt-2 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Leave empty for unlimited usage
              </p>
          </div>

            <div class="relative">
            <input
              type="number"
              id="priority"
              formControlName="priority"
              min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="0"
            >
              <label for="priority" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Priority
              </label>
              <p class="mt-2 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Higher numbers = higher priority
              </p>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Offer Status
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <select
                id="status"
                formControlName="status"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="expired">Expired</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Status *
              </label>
            </div>

            <div class="flex items-center">
              <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200 w-full">
              <input
                id="is_active"
                type="checkbox"
                formControlName="is_active"
                  class="sr-only"
                >
                <span class="flex items-center">
                  <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                        [class.bg-blue-600]="offerForm.get('is_active')?.value"
                        [class.border-blue-600]="offerForm.get('is_active')?.value">
                    <svg *ngIf="offerForm.get('is_active')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                  <span class="text-sm font-medium text-gray-700">Active</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </app-admin-form>
  `
})
export class OfferFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);

  offerForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  offerId: string | null = null;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  private initForm(): void {
    const now = new Date();
    const defaultStart = new Date(now.getTime());
    const defaultEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    this.offerForm = this.fb.group({
      title: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: [''],
      discount_type: ['', [Validators.required]],
      discount_value: [0, [Validators.required, Validators.min(0)]],
      minimum_purchase: [null],
      start_date: [this.formatDateTimeLocal(defaultStart), [Validators.required]],
      end_date: [this.formatDateTimeLocal(defaultEnd)],
      usage_limit: [null],
      priority: [0],
      status: ['draft', [Validators.required]],
      is_active: [false]
    });
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private checkEditMode(): void {
    this.offerId = this.route.snapshot.paramMap.get('id');
    if (this.offerId) {
      this.isEditMode = true;
      this.loadOffer();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Offer - Solar Shop Admin' : 'Create Offer - Solar Shop Admin');
  }

  private async loadOffer(): Promise<void> {
    if (!this.offerId) return;

    try {
      const data = await this.supabaseService.getTableById('offers', this.offerId);
      if (data) {
        const formData = {
          ...data,
          start_date: data.start_date ? this.formatDateTimeLocal(new Date(data.start_date)) : '',
          end_date: data.end_date ? this.formatDateTimeLocal(new Date(data.end_date)) : ''
        };
        this.offerForm.patchValue(formData);
      }
    } catch (error) {
      console.error('Error loading offer:', error);
    }
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.offerForm.invalid) return;

    this.isSubmitting = true;

    try {
      const offerData = {
        ...formValue,
        start_date: formValue.start_date ? new Date(formValue.start_date).toISOString() : null,
        end_date: formValue.end_date ? new Date(formValue.end_date).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (this.isEditMode && this.offerId) {
        await this.supabaseService.updateRecord('offers', this.offerId, offerData);
      } else {
        offerData.created_at = new Date().toISOString();
        await this.supabaseService.createRecord('offers', offerData);
      }

      this.router.navigate(['/admin/offers']);
    } catch (error) {
      console.error('Error saving offer:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
} 