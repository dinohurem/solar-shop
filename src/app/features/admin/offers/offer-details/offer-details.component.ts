import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6" *ngIf="offer">
      <!-- Header -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <button 
              (click)="goBack()"
              class="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ offer.title }}</h1>
              <p class="text-gray-600 mt-1">{{ 'admin.offerDetailsAndProducts' | translate }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1 rounded-full text-sm font-medium"
                  [class]="offer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ offer.is_active ? ('admin.active' | translate) : ('admin.inactive' | translate) }}
            </span>
            <button 
              (click)="editOffer()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>{{ 'admin.editOffer' | translate }}</span>
            </button>
          </div>
        </div>

        <!-- Offer Summary -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="flex items-start space-x-4">
              <img *ngIf="offer.image_url" 
                   [src]="offer.image_url" 
                   [alt]="offer.title"
                   class="w-24 h-24 object-cover rounded-lg border border-gray-200">
              <div class="flex-1">
                <p class="text-gray-700 mb-4">{{ offer.description }}</p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-900">{{ 'admin.offersForm.couponCode' | translate }}:</span>
                    <span class="ml-2 text-gray-600 capitalize">{{ offer.code }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900">{{ 'admin.discountType' | translate }}:</span>
                    <span class="ml-2 text-gray-600 capitalize">{{ offer.discount_type }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900">{{ 'admin.discountValue' | translate }}:</span>
                    <span class="ml-2 text-gray-600">{{ offer.discount_value }}{{ offer.discount_type === 'percentage' ? '%' : '€' }}</span>
                  </div>
                  <div *ngIf="offer.min_order_amount">
                    <span class="font-medium text-gray-900">{{ 'admin.minPurchase' | translate }}:</span>
                    <span class="ml-2 text-gray-600">{{ offer.min_order_amount | currency:'EUR':'symbol':'1.2-2' }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900">{{ 'admin.offersForm.b2bOffer' | translate }}:</span>
                    <span class="ml-2 text-gray-600">
                      <span *ngIf="offer.is_b2b" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        {{ 'admin.contactsForm.yes' | translate }}
                      </span>
                      <span *ngIf="!offer.is_b2b" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                        {{ 'admin.contactsForm.no' | translate }}
                      </span>
                    </span>
                  </div>
                  <div *ngIf="offerCategory">
                    <span class="font-medium text-gray-900">{{ 'admin.category' | translate }}:</span>
                    <span class="ml-2 text-gray-600">{{ offerCategory.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'admin.offerTimeline' | translate }}</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ 'admin.startDate' | translate }}:</span>
                <span class="text-sm text-gray-600">{{ offer.start_date | date:'medium' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ 'admin.endDate' | translate }}:</span>
                <span class="text-sm text-gray-600">{{ offer.end_date | date:'medium' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ 'admin.usageLimit' | translate }}:</span>
                <span class="text-sm text-gray-600">{{ offer.max_usage || ('admin.unlimited' | translate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- Offer Products -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ 'admin.productsInOffer' | translate }}</h2>
        </div>

        <div class="space-y-4" *ngIf="offerProducts.length > 0; else noProducts">
          <div *ngFor="let product of offerProducts; let i = index"
               class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
              <div>
                <p class="font-medium text-gray-900">{{ product.name }}</p>
                <p class="text-sm text-gray-500">SKU: {{ product.sku || 'N/A' }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-600">{{ product.category }}</p>
              </div>

              <div class="text-center">
                <p class="text-sm font-medium text-gray-700">{{ 'admin.originalPrice' | translate }}</p>
                <p class="text-lg font-semibold text-gray-900">{{ product.price | currency:'EUR':'symbol':'1.2-2' }}</p>
              </div>

              <div class="text-center">
                <p class="text-sm font-medium text-gray-700">{{ 'admin.discountPercent' | translate }}</p>
                <p class="text-lg font-semibold text-blue-600">{{ product.discount_percentage }}%</p>
              </div>

              <div class="text-center">
                <p class="text-sm font-medium text-gray-700">{{ 'admin.finalPrice' | translate }}</p>
                <p class="text-lg font-semibold text-green-600">
                  {{ calculateDiscountedPrice(product.price, product.discount_percentage) | currency:'EUR':'symbol':'1.2-2' }}
                </p>
              </div>

              <div class="text-center">
                <p class="text-sm font-medium text-gray-700">{{ 'admin.savings' | translate }}</p>
                <p class="text-lg font-semibold text-red-600">
                  {{ (product.price * product.discount_percentage / 100) | currency:'EUR':'symbol':'1.2-2' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noProducts>
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'admin.noProductsAssigned' | translate }}</h3>
            <p class="text-gray-500">{{ 'admin.noProductsAssigned' | translate }}</p>
          </div>
        </ng-template>
      </div>

      <!-- Offer Summary Card -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-6" *ngIf="offerProducts.length > 0">
        <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          {{ 'admin.offerSummary' | translate }}
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">{{ 'admin.products' | translate }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ offerProducts.length }}</p>
          </div>
          
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">{{ 'admin.totalOriginal' | translate }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ getTotalOriginalPrice() | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
          
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">{{ 'admin.totalDiscounted' | translate }}</p>
            <p class="text-2xl font-bold text-green-600">{{ getTotalDiscountedPrice() | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
          
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">{{ 'admin.totalSavings' | translate }}</p>
            <p class="text-2xl font-bold text-red-600">{{ getTotalSavings() | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
        </div>
      </div>

      <!-- Terms & Conditions -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6" *ngIf="offer.terms_conditions">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'admin.termsConditions' | translate }}</h3>
        <div class="prose prose-sm text-gray-700" [innerHTML]="offer.terms_conditions"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!offer && !error" class="flex items-center justify-center h-64">
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="text-gray-600 text-lg">{{ 'common.loading' | translate }}</span>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="text-center py-12">
      <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'admin.offerNotFound' | translate }}</h3>
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <button 
        (click)="goBack()"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        {{ 'admin.goBack' | translate }}
      </button>
    </div>
  `
})
export class OfferDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);

  offer: any = null;
  offerProducts: any[] = [];
  offerCategory: any = null;
  error: string | null = null;

  ngOnInit(): void {
    const offerId = this.route.snapshot.paramMap.get('id');
    if (offerId) {
      this.loadOfferDetails(offerId);
    } else {
      this.error = 'No offer ID provided';
    }
  }

  private async loadOfferDetails(offerId: string): Promise<void> {
    try {
      this.offer = await this.supabaseService.getTableById('offers', offerId);
      if (this.offer) {
        this.title.setTitle(`${this.offer.title} - Offer Details - Solar Shop Admin`);
        await this.loadOfferProducts(offerId);
        await this.loadOfferCategory();
      } else {
        this.error = 'Offer not found';
      }
    } catch (error) {
      console.error('Error loading offer:', error);
      this.error = 'Error loading offer details';
    }
  }

  private async loadOfferProducts(offerId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('offer_products')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            price,
            stock_quantity,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('offer_id', offerId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      if (data && data.length > 0) {
        const offerProducts = data.map((offerProduct: any) => ({
          id: offerProduct.products.id,
          name: offerProduct.products.name,
          sku: offerProduct.products.sku,
          category: offerProduct.products.categories?.name || 'Solar Equipment',
          price: offerProduct.products.price || 0,
          discount_percentage: offerProduct.discount_percentage || 0,
          stock_quantity: offerProduct.products.stock_quantity || 0,
          offer_product_id: offerProduct.id
        }));

        this.offerProducts = offerProducts;
      } else {
        this.offerProducts = [];
      }

    } catch (error) {
      console.error('Error loading offer products:', error);
      this.offerProducts = [];
    }
  }

  calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
    if (!discountPercentage) return originalPrice;
    return originalPrice * (1 - discountPercentage / 100);
  }

  getTotalOriginalPrice(): number {
    return this.offerProducts.reduce((total, product) => total + product.price, 0);
  }

  getTotalDiscountedPrice(): number {
    return this.offerProducts.reduce((total, product) => {
      return total + this.calculateDiscountedPrice(product.price, product.discount_percentage);
    }, 0);
  }

  getTotalSavings(): number {
    return this.getTotalOriginalPrice() - this.getTotalDiscountedPrice();
  }

  editOffer(): void {
    this.router.navigate(['/admin/offers/edit', this.offer.id]);
  }

  goBack(): void {
    this.router.navigate(['/admin/offers']);
  }

  private async loadOfferCategory(): Promise<void> {
    if (!this.offer?.applicable_category_ids || this.offer.applicable_category_ids.length === 0) {
      this.offerCategory = null;
      return;
    }

    try {
      const categoryId = this.offer.applicable_category_ids[0];
      const { data, error } = await this.supabaseService.client
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      this.offerCategory = data;
    } catch (error) {
      console.error('Error loading offer category:', error);
      this.offerCategory = null;
    }
  }
} 