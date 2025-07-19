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
  minimumOrder: number;
  // Quantity-based pricing tiers
  quantityTier1: number;
  priceTier1: number;
  quantityTier2?: number;
  priceTier2?: number;
  quantityTier3?: number;
  priceTier3?: number;
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
                  {{ 'admin.companyPricingForm.pricingTiers' | translate }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companyPricingForm.minimumOrder' | translate }}
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
                <td class="px-6 py-4">
                  <div class="space-y-2">
                    <!-- Tier 1 (Base Price) -->
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500 w-16">Kol ≥</span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        [value]="product.quantityTier1"
                        (input)="updateQuantityTier(product, 1, $event)"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <span class="text-xs text-gray-500">→</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        [value]="product.priceTier1 || ''"
                        (input)="updatePriceTier(product, 1, $event)"
                        [placeholder]="'€' + (product.price | number:'1.2-2')"
                        class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <!-- Tier 2 -->
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500 w-16">Kol ≥</span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        [value]="product.quantityTier2 || ''"
                        (input)="updateQuantityTier(product, 2, $event)"
                        placeholder="10"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <span class="text-xs text-gray-500">→</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        [value]="product.priceTier2 || ''"
                        (input)="updatePriceTier(product, 2, $event)"
                        [disabled]="!product.quantityTier2"
                        placeholder="€"
                        class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                    </div>
                    <!-- Tier 3 -->
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500 w-16">Kol ≥</span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        [value]="product.quantityTier3 || ''"
                        (input)="updateQuantityTier(product, 3, $event)"
                        [disabled]="!product.quantityTier2"
                        placeholder="50"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      <span class="text-xs text-gray-500">→</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        [value]="product.priceTier3 || ''"
                        (input)="updatePriceTier(product, 3, $event)"
                        [disabled]="!product.quantityTier3"
                        placeholder="€"
                        class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    [value]="product.minimumOrder || 1"
                    (input)="updateMinimumOrder(product, $event)"
                    placeholder="1"
                    class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
              <div class="text-sm text-gray-500">
                <div *ngIf="product.hasCustomPrice">
                  <div *ngIf="product.priceTier1 && product.priceTier1 !== product.price" class="mb-1">
                    <span class="text-xs">Kol ≥{{ product.quantityTier1 }}:</span> €{{ product.price | number:'1.2-2' }} → <span class="font-medium text-green-600">€{{ product.priceTier1 | number:'1.2-2' }}</span>
                  </div>
                  <div *ngIf="product.priceTier2" class="mb-1">
                    <span class="text-xs">Kol ≥{{ product.quantityTier2 }}:</span> <span class="font-medium text-green-600">€{{ product.priceTier2 | number:'1.2-2' }}</span>
                  </div>
                  <div *ngIf="product.priceTier3" class="mb-1">
                    <span class="text-xs">Kol ≥{{ product.quantityTier3 }}:</span> <span class="font-medium text-green-600">€{{ product.priceTier3 | number:'1.2-2' }}</span>
                  </div>
                </div>
                <div *ngIf="product.minimumOrder !== 1" class="text-xs text-blue-600 mt-1">
                  Min. Kol. : {{ product.minimumOrder }}
                </div>
              </div>
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
      // Check edit mode after companies are loaded
      if (companies.length > 0) {
        this.checkEditMode();
      }
    });

    this.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      console.log('Company Pricing Form: Products received:', products);
      this.products = products;
      this.updateFilteredProducts();
      // If we have a selected company but products weren't loaded yet, trigger the selection again
      if (this.selectedCompanyId && this.selectedCompany && products.length > 0) {
        this.loadExistingPricing();
        this.updateFilteredProducts();
      }
    });
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
    console.log('Company Pricing Form: onCompanySelected called with:', companyId);
    this.selectedCompany = this.companies.find(c => c.id === companyId) || null;
    console.log('Company Pricing Form: Selected company:', this.selectedCompany);

    if (this.selectedCompany) {
      this.loadExistingPricing();
    }
    this.updateFilteredProducts();
  }

  private async loadExistingPricing(): Promise<void> {
    if (!this.selectedCompany) {
      console.log('Company Pricing Form: loadExistingPricing - no selected company');
      return;
    }

    console.log('Company Pricing Form: Loading existing pricing for company:', this.selectedCompany.id);

    try {
      const { data, error } = await this.supabase.client
        .from('company_pricing')
        .select('*, minimum_order')
        .eq('company_id', this.selectedCompany.id);

      if (error) {
        console.error('Error loading existing pricing:', error);
        return;
      }

      this.existingPricing = data || [];
      console.log('Company Pricing Form: Loaded existing pricing:', this.existingPricing);
      this.updateFilteredProducts();
    } catch (error) {
      console.error('Error loading existing pricing:', error);
    }
  }

  private updateFilteredProducts(): void {
    console.log('Company Pricing Form: updateFilteredProducts called, products count:', this.products.length);
    if (!this.products.length) {
      console.log('Company Pricing Form: No products available, skipping update');
      return;
    }

    let filtered = this.products.map(product => {
      const existingPrice = this.existingPricing.find(p => p.product_id === product.id);
      const minimumOrder = existingPrice ? (existingPrice.minimum_order || 1) : 1;

      // Handle quantity-based pricing tiers
      const quantityTier1 = existingPrice?.quantity_tier_1 || 1;
      const priceTier1 = existingPrice ? parseFloat(existingPrice.price_tier_1) : product.price;
      const quantityTier2 = existingPrice?.quantity_tier_2;
      const priceTier2 = existingPrice?.price_tier_2 ? parseFloat(existingPrice.price_tier_2) : undefined;
      const quantityTier3 = existingPrice?.quantity_tier_3;
      const priceTier3 = existingPrice?.price_tier_3 ? parseFloat(existingPrice.price_tier_3) : undefined;

      return {
        ...product,
        customPrice: priceTier1, // For backward compatibility
        hasCustomPrice: !!existingPrice && (priceTier1 !== product.price || !!priceTier2 || !!priceTier3),
        minimumOrder: minimumOrder,
        quantityTier1,
        priceTier1,
        quantityTier2,
        priceTier2,
        quantityTier3,
        priceTier3
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
      product.priceTier1 = value;
      product.hasCustomPrice = value !== product.price;
    } else {
      product.customPrice = product.price;
      product.priceTier1 = product.price;
      product.hasCustomPrice = false;
    }
  }

  updateQuantityTier(product: ProductWithCustomPrice, tier: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);

    if (tier === 1) {
      product.quantityTier1 = !isNaN(value) && value > 0 ? value : 1;
    } else if (tier === 2) {
      if (!isNaN(value) && value > product.quantityTier1) {
        product.quantityTier2 = value;
      } else {
        product.quantityTier2 = undefined;
        product.priceTier2 = undefined;
        // Also clear tier 3 if tier 2 is cleared
        product.quantityTier3 = undefined;
        product.priceTier3 = undefined;
      }
    } else if (tier === 3) {
      if (!isNaN(value) && product.quantityTier2 && value > product.quantityTier2) {
        product.quantityTier3 = value;
      } else {
        product.quantityTier3 = undefined;
        product.priceTier3 = undefined;
      }
    }

    this.updateHasCustomPrice(product);
  }

  updatePriceTier(product: ProductWithCustomPrice, tier: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);

    if (tier === 1) {
      if (!isNaN(value) && value > 0) {
        product.priceTier1 = value;
        product.customPrice = value; // For backward compatibility
      } else {
        product.priceTier1 = product.price;
        product.customPrice = product.price;
      }
    } else if (tier === 2) {
      if (!isNaN(value) && value > 0 && product.quantityTier2) {
        product.priceTier2 = value;
      } else {
        product.priceTier2 = undefined;
      }
    } else if (tier === 3) {
      if (!isNaN(value) && value > 0 && product.quantityTier3) {
        product.priceTier3 = value;
      } else {
        product.priceTier3 = undefined;
      }
    }

    this.updateHasCustomPrice(product);
  }

  private updateHasCustomPrice(product: ProductWithCustomPrice): void {
    product.hasCustomPrice =
      product.priceTier1 !== product.price ||
      !!product.priceTier2 ||
      !!product.priceTier3;
  }

  updateMinimumOrder(product: ProductWithCustomPrice, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);

    if (!isNaN(value) && value > 0) {
      product.minimumOrder = value;
    } else {
      product.minimumOrder = 1;
    }
  }

  removeCustomPrice(product: ProductWithCustomPrice): void {
    product.customPrice = product.price;
    product.hasCustomPrice = false;
    product.minimumOrder = 1;
    // Reset all pricing tiers
    product.quantityTier1 = 1;
    product.priceTier1 = product.price;
    product.quantityTier2 = undefined;
    product.priceTier2 = undefined;
    product.quantityTier3 = undefined;
    product.priceTier3 = undefined;
  }

  getProductsWithCustomPricing(): ProductWithCustomPrice[] {
    return this.filteredProducts.filter(p =>
      p.hasCustomPrice ||
      p.minimumOrder !== 1
    );
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
          const { error } = await this.supabase.client
            .from('company_pricing')
            .update({
              price_tier_1: product.priceTier1,
              quantity_tier_1: product.quantityTier1,
              price_tier_2: product.priceTier2 || null,
              quantity_tier_2: product.quantityTier2 || null,
              price_tier_3: product.priceTier3 || null,
              quantity_tier_3: product.quantityTier3 || null,
              minimum_order: product.minimumOrder
            })
            .eq('id', existingPricing.id);

          if (error) throw error;
        } else {
          // Create new - only create if there's a custom price or minimum order different from default
          if (product.hasCustomPrice || product.minimumOrder !== 1) {
            const { error } = await this.supabase.client
              .from('company_pricing')
              .insert({
                company_id: this.selectedCompany.id,
                product_id: product.id,
                price_tier_1: product.priceTier1,
                quantity_tier_1: product.quantityTier1,
                price_tier_2: product.priceTier2 || null,
                quantity_tier_2: product.quantityTier2 || null,
                price_tier_3: product.priceTier3 || null,
                quantity_tier_3: product.quantityTier3 || null,
                minimum_order: product.minimumOrder
              });

            if (error) throw error;
          }
        }
      }

      // Remove pricing for products that no longer have custom pricing or minimum order requirements
      const currentProductIds = productsToSave.map(p => p.id);
      const toRemove = this.existingPricing.filter(p =>
        !currentProductIds.includes(p.product_id)
      );

      for (const pricing of toRemove) {
        const { error } = await this.supabase.client
          .from('company_pricing')
          .delete()
          .eq('id', pricing.id);

        if (error) throw error;
      }

      // Navigate back
      this.router.navigate(['/admin/cijene-tvrtki']);
    } catch (error) {
      console.error('Error saving company pricing:', error);
      alert('Error saving pricing changes. Please try again.');
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/cijene-tvrtki']);
  }
}
