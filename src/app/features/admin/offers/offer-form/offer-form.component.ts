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
      *ngIf="offerForm"
      [title]="isEditMode ? 'Edit Offer' : 'Create Offer'"
      [subtitle]="isEditMode ? 'Update offer information' : 'Create a new promotional offer'"
      [form]="offerForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/offers'"
      (formSubmit)="onSubmit($event)"
    >
      <div *ngIf="offerForm">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Offer Title *</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="Enter offer title"
            >
            <div *ngIf="offerForm.get('title')?.invalid && offerForm.get('title')?.touched" class="mt-1 text-sm text-red-600">
              Title is required
            </div>
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Offer Type *</label>
            <select
              id="type"
              formControlName="type"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            >
              <option value="">Select offer type</option>
              <option value="percentage">Percentage Discount</option>
              <option value="fixed">Fixed Amount</option>
              <option value="bogo">Buy One Get One</option>
              <option value="bundle">Bundle Deal</option>
            </select>
            <div *ngIf="offerForm.get('type')?.invalid && offerForm.get('type')?.touched" class="mt-1 text-sm text-red-600">
              Offer type is required
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="Enter offer description"
          ></textarea>
        </div>

        <!-- Discount Details -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label for="discount_type" class="block text-sm font-medium text-gray-700">Discount Type *</label>
            <select
              id="discount_type"
              formControlName="discount_type"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            >
              <option value="">Select discount type</option>
              <option value="percentage">Percentage (%)</option>
              <option value="amount">Fixed Amount (€)</option>
            </select>
            <div *ngIf="offerForm.get('discount_type')?.invalid && offerForm.get('discount_type')?.touched" class="mt-1 text-sm text-red-600">
              Discount type is required
            </div>
          </div>

          <div>
            <label for="discount_value" class="block text-sm font-medium text-gray-700">Discount Value *</label>
            <input
              type="number"
              id="discount_value"
              formControlName="discount_value"
              step="0.01"
              min="0"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              [placeholder]="offerForm.get('discount_type')?.value === 'percentage' ? '10' : '50.00'"
            >
            <div *ngIf="offerForm.get('discount_value')?.invalid && offerForm.get('discount_value')?.touched" class="mt-1 text-sm text-red-600">
              Discount value is required
            </div>
          </div>

          <div>
            <label for="minimum_purchase" class="block text-sm font-medium text-gray-700">Minimum Purchase (€)</label>
            <input
              type="number"
              id="minimum_purchase"
              formControlName="minimum_purchase"
              step="0.01"
              min="0"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="0.00"
            >
          </div>
        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="start_date" class="block text-sm font-medium text-gray-700">Start Date *</label>
            <input
              type="datetime-local"
              id="start_date"
              formControlName="start_date"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            >
            <div *ngIf="offerForm.get('start_date')?.invalid && offerForm.get('start_date')?.touched" class="mt-1 text-sm text-red-600">
              Start date is required
            </div>
          </div>

          <div>
            <label for="end_date" class="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              id="end_date"
              formControlName="end_date"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            >
          </div>
        </div>

        <!-- Usage Limits -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="usage_limit" class="block text-sm font-medium text-gray-700">Usage Limit</label>
            <input
              type="number"
              id="usage_limit"
              formControlName="usage_limit"
              min="1"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="Unlimited"
            >
            <p class="mt-1 text-sm text-gray-500">Leave empty for unlimited usage</p>
          </div>

          <div>
            <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
            <input
              type="number"
              id="priority"
              formControlName="priority"
              min="0"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="0"
            >
            <p class="mt-1 text-sm text-gray-500">Higher numbers = higher priority</p>
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium text-gray-900">Offer Status</h4>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">Status *</label>
              <select
                id="status"
                formControlName="status"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div class="flex items-center pt-6">
              <input
                id="is_active"
                type="checkbox"
                formControlName="is_active"
                class="focus:ring-solar-500 h-4 w-4 text-solar-600 border-gray-300 rounded"
              >
              <label for="is_active" class="ml-2 text-sm font-medium text-gray-700">Active</label>
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

  offerForm: FormGroup | null = null;
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
    if (!this.offerId || !this.offerForm) return;

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
    if (!this.offerForm || this.offerForm.invalid) return;

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