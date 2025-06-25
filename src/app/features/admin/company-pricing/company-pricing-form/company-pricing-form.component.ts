import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import * as CompanyPricingActions from '../store/company-pricing.actions';
import * as CompanyPricingSelectors from '../store/company-pricing.selectors';
import { Company, Product } from '../store/company-pricing.actions';

interface ProductWithCustomPrice extends Product {
  customPrice: number;
  hasCustomPrice: boolean;
}

@Component({
  selector: 'app-company-pricing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ 'admin.companyPricingForm.title' | translate }}
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ 'admin.companyPricingForm.subtitle' | translate }}
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            type="button"
            (click)="goBack()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            type="button"
            (click)="saveChanges()"
            [disabled]="!hasChanges() || (loading$ | async)"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="loading$ | async" class="inline-flex items-center">
              <svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ 'common.saving' | translate }}
            </span>
            <span *ngIf="!(loading$ | async)">{{ 'common.save' | translate }}</span>
          </button>
        </div>
      </div>

      <!-- Company Selection -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          {{ 'admin.companyPricingForm.selectCompany' | translate }}
        </h3>
        
        <div class="relative">
          <select
            [(ngModel)]="selectedCompanyId"
            (ngModelChange)="onCompanySelected($event)"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white appearance-none">
            <option value="">{{ 'admin.companyPricingForm.selectCompany' | translate }}</option>
            <option *ngFor="let company of companies" [value]="company.id">
              {{ company.name }} ({{ company.email }})
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div *ngIf="selectedCompany" class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          {{ 'admin.companyPricingForm.productSelection' | translate }} - {{ selectedCompany.name }}
        </h3>

        <!-- Search -->
        <div class="mb-6">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="productSearchTerm"
              (ngModelChange)="filterProducts()"
              placeholder="Search products..."
              class="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companyPricingForm.productName' | translate }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companyPricingForm.skuLabel' | translate }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companyPricingForm.currentPrice' | translate }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companyPricingForm.customPriceEuro' | translate }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'common.actions' | translate }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let product of filteredProducts" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ product.sku }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">€{{ product.price | number:'1.2-2' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    [value]="product.customPrice || ''"
                    (input)="updateCustomPrice(product, $event)"
                    [placeholder]="'€' + (product.price | number:'1.2-2')"
                    class="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    *ngIf="product.hasCustomPrice"
                    type="button"
                    (click)="removeCustomPrice(product)"
                    class="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                    [title]="'common.remove' | translate">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="filteredProducts.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
        </div>
      </div>

      <!-- Summary -->
      <div *ngIf="selectedCompany && getProductsWithCustomPricing().length > 0" class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">
          {{ 'admin.companyPricingForm.customPricingSummary' | translate }}
        </h3>
        <div class="space-y-3">
          <div *ngFor="let product of getProductsWithCustomPricing()" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <div>
              <span class="font-medium text-gray-900">{{ product.name }}</span>
              <span class="text-sm text-gray-500 ml-2">({{ product.sku }})</span>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">€{{ product.price | number:'1.2-2' }} → <span class="font-medium text-green-600">€{{ product.customPrice | number:'1.2-2' }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CompanyPricingFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabase = inject(SupabaseService);
  private title = inject(Title);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  companies$: Observable<Company[]> = this.store.select(CompanyPricingSelectors.selectCompanies);
  products$: Observable<Product[]> = this.store.select(CompanyPricingSelectors.selectProducts);
  loading$: Observable<boolean> = this.store.select(CompanyPricingSelectors.selectCompanyPricingLoading);

  companies: Company[] = [];
  products: Product[] = [];
  filteredProducts: ProductWithCustomPrice[] = [];
  selectedCompanyId: string = '';
  selectedCompany: Company | null = null;
  productSearchTerm: string = '';
  existingPricing: any[] = [];

  ngOnInit(): void {
    console.log('Company Pricing Form: ngOnInit called');

    // Dispatch actions to load data
    console.log('Company Pricing Form: Dispatching loadCompanies action');
    this.store.dispatch(CompanyPricingActions.loadCompanies());
    console.log('Company Pricing Form: Dispatching loadProducts action');
    this.store.dispatch(CompanyPricingActions.loadProducts());

    // Subscribe to data
    this.companies$.pipe(takeUntil(this.destroy$)).subscribe(companies => {
      console.log('Company Pricing Form: Companies received:', companies);
      this.companies = companies;
    });

    this.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      console.log('Company Pricing Form: Products received:', products);
      this.products = products;
      this.updateFilteredProducts();
    });

    this.checkEditMode();
    this.title.setTitle('Company Pricing - Solar Shop Admin');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkEditMode(): void {
    const companyId = this.route.snapshot.queryParamMap.get('companyId');
    if (companyId) {
      this.selectedCompanyId = companyId;
      this.onCompanySelected(companyId);
    }
  }

  onCompanySelected(companyId: string): void {
    this.selectedCompany = this.companies.find(c => c.id === companyId) || null;
    if (this.selectedCompany) {
      this.loadExistingPricing();
    }
    this.updateFilteredProducts();
  }

  private async loadExistingPricing(): Promise<void> {
    if (!this.selectedCompany) return;

    try {
      const { data, error } = await this.supabase.client
        .from('company_pricing')
        .select('*')
        .eq('company_id', this.selectedCompany.id);

      if (error) {
        console.error('Error loading existing pricing:', error);
        return;
      }

      this.existingPricing = data || [];
      this.updateFilteredProducts();
    } catch (error) {
      console.error('Error loading existing pricing:', error);
    }
  }

  private updateFilteredProducts(): void {
    if (!this.products.length) return;

    let filtered = this.products.map(product => {
      const existingPrice = this.existingPricing.find(p => p.product_id === product.id);
      const customPrice = existingPrice ? parseFloat(existingPrice.price) : product.price;
      return {
        ...product,
        customPrice: customPrice,
        hasCustomPrice: !!existingPrice && customPrice !== product.price
      };
    });

    if (this.productSearchTerm) {
      const searchTerm = this.productSearchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredProducts = filtered;
  }

  filterProducts(): void {
    this.updateFilteredProducts();
  }

  updateCustomPrice(product: ProductWithCustomPrice, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (!isNaN(value) && value > 0) {
      product.customPrice = value;
      product.hasCustomPrice = value !== product.price;
    } else {
      product.customPrice = product.price;
      product.hasCustomPrice = false;
    }
  }

  removeCustomPrice(product: ProductWithCustomPrice): void {
    product.customPrice = product.price;
    product.hasCustomPrice = false;
  }

  getProductsWithCustomPricing(): ProductWithCustomPrice[] {
    return this.filteredProducts.filter(p => p.hasCustomPrice && p.customPrice !== p.price);
  }

  hasChanges(): boolean {
    return this.getProductsWithCustomPricing().length > 0;
  }

  async saveChanges(): Promise<void> {
    if (!this.selectedCompany) return;

    const productsToSave = this.getProductsWithCustomPricing();
    const existingProductIds = this.existingPricing.map(p => p.product_id);

    try {
      // Create new pricing records
      for (const product of productsToSave) {
        const existingPricing = this.existingPricing.find(p => p.product_id === product.id);

        if (existingPricing) {
          // Update existing
          await this.supabase.updateRecord('company_pricing', existingPricing.id, {
            price: product.customPrice
          });
        } else {
          // Create new
          await this.supabase.createRecord('company_pricing', {
            company_id: this.selectedCompany.id,
            product_id: product.id,
            price: product.customPrice
          });
        }
      }

      // Remove pricing for products that no longer have custom pricing
      const currentProductIds = productsToSave.map(p => p.id);
      const toRemove = this.existingPricing.filter(p =>
        !currentProductIds.includes(p.product_id)
      );

      for (const pricing of toRemove) {
        await this.supabase.deleteRecord('company_pricing', pricing.id);
      }

      // Navigate back
      this.router.navigate(['/admin/company-pricing']);
    } catch (error) {
      console.error('Error saving company pricing:', error);
      alert('Error saving pricing changes. Please try again.');
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/company-pricing']);
  }
}
