import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface Company {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

@Component({
  selector: 'app-company-pricing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminFormComponent, TranslatePipe],
  template: `
    <app-admin-form
      [title]="isEditMode ? ('adminCompanyPricing.editPricing' | translate) : ('adminCompanyPricing.createPricing' | translate)"
      [subtitle]="'adminCompanyPricing.setPriceForCompany' | translate"
      [form]="pricingForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="loading"
      backRoute="/admin/company-pricing"
      (formSubmit)="onSave()">
      
      <div [formGroup]="pricingForm" class="space-y-8">
        <!-- Company Selection -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Company Information
          </h3>
          
          <div class="grid grid-cols-1 gap-6">
            <div class="relative">
              <select
                id="company_id"
                formControlName="company_id"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none"
                [class.border-red-500]="pricingForm.get('company_id')?.invalid && pricingForm.get('company_id')?.touched">
                <option value="">Select a company</option>
                <option *ngFor="let company of companies" [value]="company.id">
                  {{ company.name }} ({{ company.email }})
                </option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Company *
              </label>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              <div *ngIf="pricingForm.get('company_id')?.invalid && pricingForm.get('company_id')?.touched" 
                   class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Company selection is required
              </div>
            </div>
          </div>
        </div>

        <!-- Product Selection -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Product Selection
          </h3>
          
          <div class="grid grid-cols-1 gap-6">
            <!-- Product Search -->
            <div class="relative">
              <input
                type="text"
                id="productSearch"
                [(ngModel)]="productSearch"
                (input)="onProductSearch()"
                (focus)="showProductDropdown = true"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Search products..."
                autocomplete="off">
              <label for="productSearch" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Search Products
              </label>
              
              <!-- Product Dropdown -->
              <div *ngIf="showProductDropdown && filteredProducts.length > 0" 
                   class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div *ngFor="let product of filteredProducts" 
                     (click)="selectProduct(product)"
                     class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                  <div class="font-medium text-gray-900">{{ product.name }}</div>
                  <div class="text-sm text-gray-500">SKU: {{ product.sku }} | Current Price: €{{ product.price }}</div>
                </div>
              </div>
            </div>

            <!-- Selected Product Display -->
            <div *ngIf="selectedProduct" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-blue-900">{{ selectedProduct.name }}</h4>
                  <p class="text-sm text-blue-700">SKU: {{ selectedProduct.sku }} | Current Price: €{{ selectedProduct.price }}</p>
                </div>
                <button type="button" (click)="clearProductSelection()" 
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Change
                </button>
              </div>
            </div>

            <div *ngIf="!selectedProduct && pricingForm.get('product_id')?.invalid && pricingForm.get('product_id')?.touched" 
                 class="text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Product selection is required
            </div>
          </div>
        </div>

        <!-- Pricing -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            Custom Pricing
          </h3>
          
          <div class="grid grid-cols-1 gap-6">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-500 text-lg">€</span>
              </div>
              <input
                type="number"
                id="price"
                formControlName="price"
                step="0.01"
                min="0"
                class="peer w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0.00"
                [class.border-red-500]="pricingForm.get('price')?.invalid && pricingForm.get('price')?.touched">
              <label for="price" class="absolute left-10 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Custom Price *
              </label>
              <div *ngIf="pricingForm.get('price')?.invalid && pricingForm.get('price')?.touched" 
                   class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="pricingForm.get('price')?.errors?.['required']">Price is required</span>
                <span *ngIf="pricingForm.get('price')?.errors?.['min']">Price must be greater than 0</span>
              </div>
              <p class="mt-3 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                This price will override the standard product price for this company
              </p>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Important Notes
          </h3>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul class="text-sm text-blue-800 space-y-2">
              <li class="flex items-start">
                <svg class="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Company-specific pricing takes precedence over standard product pricing
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Changes will affect all future orders for this company
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Existing orders will not be affected by price changes
              </li>
            </ul>
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
export class CompanyPricingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private title = inject(Title);

  pricingForm: FormGroup;
  loading = false;
  isEditMode = false;
  recordId: string | null = null;

  companies: Company[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  productSearch = '';
  showProductDropdown = false;

  constructor() {
    this.pricingForm = this.fb.group({
      company_id: ['', Validators.required],
      product_id: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadProducts();
    this.checkEditMode();

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target || !(event.target as Element).closest('.relative')) {
        this.showProductDropdown = false;
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const companyId = this.route.snapshot.queryParamMap.get('companyId');
    const productId = this.route.snapshot.queryParamMap.get('productId');

    if (id) {
      this.isEditMode = true;
      this.recordId = id;
      this.loadRecord();
    } else if (companyId && productId) {
      // Pre-fill form when coming from company pricing list
      this.pricingForm.patchValue({
        company_id: companyId,
        product_id: productId
      });
    }

    this.title.setTitle(this.isEditMode ? 'Edit Company Pricing - Solar Shop Admin' : 'Create Company Pricing - Solar Shop Admin');
  }

  private async loadCompanies(): Promise<void> {
    try {
      const data = await this.supabase.getTable('profiles');
      // Filter for company admin users and map to Company interface
      this.companies = (data || [])
        .filter((profile: any) => profile.role === 'company_admin')
        .map((profile: any) => ({
          id: profile.id,
          name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
          email: profile.email || profile.user_id
        }));
    } catch (error) {
      console.error('Error loading companies:', error);
      this.companies = [];
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const data = await this.supabase.getTable('products');
      this.products = (data || []).filter(p => p.is_active !== false);
      this.filteredProducts = this.products;
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
      this.filteredProducts = [];
    }
  }

  private async loadRecord(): Promise<void> {
    if (!this.recordId) return;
    this.loading = true;
    try {
      const data = await this.supabase.getTableById('company_pricing', this.recordId);
      if (data) {
        this.pricingForm.patchValue(data);
        // Find and set selected product
        const product = this.products.find(p => p.id === data.product_id);
        if (product) {
          this.selectedProduct = product;
          this.productSearch = product.name;
        }
      }
    } catch (err) {
      console.error('Error loading pricing', err);
    } finally {
      this.loading = false;
    }
  }

  onProductSearch(): void {
    this.showProductDropdown = true;
    if (!this.productSearch.trim()) {
      this.filteredProducts = this.products;
      return;
    }

    const searchTerm = this.productSearch.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm)
    );
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.productSearch = product.name;
    this.showProductDropdown = false;
    this.pricingForm.patchValue({ product_id: product.id });
  }

  clearProductSelection(): void {
    this.selectedProduct = null;
    this.productSearch = '';
    this.filteredProducts = this.products;
    this.pricingForm.patchValue({ product_id: '' });
  }

  async onSave(): Promise<void> {
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
      alert('Error saving pricing. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
