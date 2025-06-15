import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-company-pricing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent],
  template: `
    <app-admin-form
      [title]="isEditMode ? 'Edit Pricing' : 'Create Pricing'"
      subtitle="Set custom product price for company"
      [form]="pricingForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="loading"
      backRoute="/admin/company-pricing"
      (formSubmit)="onSave()">
      <div *ngIf="pricingForm" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Company ID</label>
          <input type="text" formControlName="company_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Product ID</label>
          <input type="text" formControlName="product_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" formControlName="price" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" step="0.01">
        </div>
      </div>
    </app-admin-form>
  `,
})
export class CompanyPricingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);

  pricingForm: FormGroup;
  loading = false;
  isEditMode = false;
  recordId: string | null = null;

  constructor() {
    this.pricingForm = this.fb.group({
      company_id: ['', Validators.required],
      product_id: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.recordId = id;
      this.loadRecord();
    }
  }

  private async loadRecord() {
    if (!this.recordId) return;
    this.loading = true;
    try {
      const data = await this.supabase.getTableById('company_pricing', this.recordId);
      if (data) this.pricingForm.patchValue(data);
    } catch (err) {
      console.error('Error loading pricing', err);
    } finally {
      this.loading = false;
    }
  }

  async onSave() {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      const value = this.pricingForm.value;
      if (this.isEditMode && this.recordId) {
        await this.supabase.updateRecord('company_pricing', this.recordId, value);
      } else {
        await this.supabase.createRecord('company_pricing', value);
      }
      this.router.navigate(['/admin/company-pricing']);
    } catch (err) {
      console.error('Error saving pricing', err);
    } finally {
      this.loading = false;
    }
  }
}
