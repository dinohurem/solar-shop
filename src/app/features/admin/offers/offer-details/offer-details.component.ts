import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
    selector: 'app-offer-details',
    standalone: true,
    imports: [CommonModule],
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
              <p class="text-gray-600 mt-1">Offer Details & Products</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1 rounded-full text-sm font-medium"
                  [class]="offer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ offer.is_active ? 'Active' : 'Inactive' }}
            </span>
            <button 
              (click)="editOffer()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Edit Offer</span>
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
                    <span class="font-medium text-gray-900">Type:</span>
                    <span class="ml-2 text-gray-600 capitalize">{{ offer.type }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900">Discount Type:</span>
                    <span class="ml-2 text-gray-600 capitalize">{{ offer.discount_type }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900">Discount Value:</span>
                    <span class="ml-2 text-gray-600">{{ offer.discount_value }}{{ offer.discount_type === 'percentage' ? '%' : '€' }}</span>
                  </div>
                  <div *ngIf="offer.minimum_purchase">
                    <span class="font-medium text-gray-900">Min. Purchase:</span>
                    <span class="ml-2 text-gray-600">{{ offer.minimum_purchase | currency:'EUR':'symbol':'1.2-2' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Offer Timeline</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Start Date:</span>
                <span class="text-sm text-gray-600">{{ offer.start_date | date:'medium' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">End Date:</span>
                <span class="text-sm text-gray-600">{{ offer.end_date | date:'medium' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Usage Limit:</span>
                <span class="text-sm text-gray-600">{{ offer.usage_limit || 'Unlimited' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Offer Products -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Products in this Offer</h2>
          <div class="flex items-center space-x-3">
            <button 
              (click)="addProduct()"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Add Product</span>
            </button>
            <button 
              (click)="saveChanges()"
              [disabled]="!hasChanges"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        <div class="space-y-4" *ngIf="offerProducts.length > 0; else noProducts">
          <div *ngFor="let product of offerProducts; trackBy: trackByProductId" 
               class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <div class="flex items-center space-x-4">
              <img [src]="product.image_url || '/assets/images/product-placeholder.jpg'" 
                   [alt]="product.name"
                   class="w-16 h-16 object-cover rounded-lg border border-gray-200">
              
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">{{ product.name }}</h4>
                <p class="text-sm text-gray-600">SKU: {{ product.sku }}</p>
                <p class="text-sm text-gray-600">Category: {{ product.category || 'N/A' }}</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Original Price</p>
                  <p class="font-semibold text-gray-900">{{ product.price | currency:'EUR':'symbol':'1.2-2' }}</p>
                </div>

                <div class="text-center">
                  <label class="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Discount %</label>
                  <input 
                    type="number" 
                    [value]="product.discount_percentage || 0"
                    (input)="updateProductDiscount(product.id, $event)"
                    min="0" 
                    max="100" 
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Final Price</p>
                  <p class="font-semibold text-green-600">
                    {{ calculateDiscountedPrice(product.price, product.discount_percentage) | currency:'EUR':'symbol':'1.2-2' }}
                  </p>
                </div>

                <div class="text-center">
                  <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Savings</p>
                  <p class="font-semibold text-red-600">
                    {{ (product.price - calculateDiscountedPrice(product.price, product.discount_percentage)) | currency:'EUR':'symbol':'1.2-2' }}
                  </p>
                </div>
              </div>

              <button 
                (click)="removeProduct(product.id)"
                class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noProducts>
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products assigned</h3>
            <p class="text-gray-500 mb-4">Add products to this offer to get started</p>
            <button 
              (click)="addProduct()"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Add First Product
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Offer Summary Card -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-6" *ngIf="offerProducts.length > 0">
        <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          Offer Summary
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">Products</p>
            <p class="text-2xl font-bold text-gray-900">{{ offerProducts.length }}</p>
          </div>
          
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">Total Original</p>
            <p class="text-2xl font-bold text-gray-900">{{ getTotalOriginalPrice() | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
          
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">Total Discounted</p>
            <p class="text-2xl font-bold text-green-600">{{ getTotalDiscountedPrice() | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
          
          <div class="bg-white rounded-lg p-4 text-center border border-blue-100">
            <p class="text-sm text-gray-600 mb-1">Total Savings</p>
            <p class="text-2xl font-bold text-red-600">{{ getTotalSavings() | currency:'EUR':'symbol':'1.2-2' }}</p>
          </div>
        </div>
      </div>

      <!-- Terms & Conditions -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6" *ngIf="offer.terms_conditions">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
        <div class="prose prose-sm text-gray-700" [innerHTML]="offer.terms_conditions"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!offer && !error" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="text-center py-12">
      <svg class="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Offer not found</h3>
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <button 
        (click)="goBack()"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        Go Back
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
    originalOfferProducts: any[] = [];
    hasChanges = false;
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
            // For now, load all products and simulate offer products
            // In a real implementation, you would have an offer_products table
            const allProducts = await this.supabaseService.getTable('products');

            // Simulate some products being part of this offer
            const simulatedOfferProducts = (allProducts || []).slice(0, 3).map((product: any, index: number) => ({
                ...product,
                discount_percentage: [10, 15, 20][index] || 0, // Sample discounts
                offer_product_id: `${offerId}_${product.id}` // Simulated ID
            }));

            this.offerProducts = simulatedOfferProducts;
            this.originalOfferProducts = JSON.parse(JSON.stringify(simulatedOfferProducts));
        } catch (error) {
            console.error('Error loading offer products:', error);
            this.offerProducts = [];
            this.originalOfferProducts = [];
        }
    }

    trackByProductId(index: number, product: any): any {
        return product.id;
    }

    updateProductDiscount(productId: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        const discountPercentage = parseFloat(target.value) || 0;

        const productIndex = this.offerProducts.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            this.offerProducts[productIndex].discount_percentage = discountPercentage;
            this.checkForChanges();
        }
    }

    calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
        if (!discountPercentage) return originalPrice;
        return originalPrice * (1 - discountPercentage / 100);
    }

    getTotalOriginalPrice(): number {
        return this.offerProducts.reduce((total, product) => total + (product.price || 0), 0);
    }

    getTotalDiscountedPrice(): number {
        return this.offerProducts.reduce((total, product) => {
            return total + this.calculateDiscountedPrice(product.price || 0, product.discount_percentage || 0);
        }, 0);
    }

    getTotalSavings(): number {
        return this.getTotalOriginalPrice() - this.getTotalDiscountedPrice();
    }

    addProduct(): void {
        // In a real implementation, you would open a product selection modal
        alert('Product selection modal would open here');
    }

    removeProduct(productId: string): void {
        if (confirm('Are you sure you want to remove this product from the offer?')) {
            this.offerProducts = this.offerProducts.filter(p => p.id !== productId);
            this.checkForChanges();
        }
    }

    private checkForChanges(): void {
        this.hasChanges = JSON.stringify(this.offerProducts) !== JSON.stringify(this.originalOfferProducts);
    }

    async saveChanges(): Promise<void> {
        if (!this.hasChanges) return;

        try {
            // For now, just simulate saving changes
            // In a real implementation, you would save to an offer_products table
            console.log('Saving offer changes:', this.offerProducts);

            this.originalOfferProducts = JSON.parse(JSON.stringify(this.offerProducts));
            this.hasChanges = false;

            alert('Offer changes saved successfully!');
        } catch (error) {
            console.error('Error saving offer changes:', error);
            alert('Error saving changes. Please try again.');
        }
    }

    editOffer(): void {
        this.router.navigate(['/admin/offers/edit', this.offer.id]);
    }

    goBack(): void {
        this.router.navigate(['/admin/offers']);
    }
} 