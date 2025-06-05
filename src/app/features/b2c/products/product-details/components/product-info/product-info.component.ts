import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../product-list/product-list.component';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Product Title and Rating -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 font-['Poppins'] mb-4">
          {{ product.name }}
        </h1>
        
        <!-- Rating and Reviews -->
        <div class="flex items-center mb-4">
          <div class="flex items-center">
            <div class="flex">
              <svg 
                *ngFor="let star of getStarArray(product.rating)" 
                class="w-5 h-5 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">{{ product.rating }}</span>
          </div>
          <span class="mx-2 text-gray-300">|</span>
          <a href="#reviews" class="text-sm text-solar-600 hover:text-solar-700 font-['DM_Sans']">
            {{ product.reviewCount }} {{ 'productList.reviews' | translate }}
          </a>
        </div>

        <!-- Availability -->
        <div class="flex items-center mb-6">
          <span class="text-sm font-medium text-gray-700 mr-2 font-['DM_Sans']">{{ 'productDetails.availability' | translate }}:</span>
          <span 
            class="px-2 py-1 rounded-full text-xs font-semibold"
            [ngClass]="{
              'bg-green-100 text-green-800': product.availability === 'available',
              'bg-yellow-100 text-yellow-800': product.availability === 'limited',
              'bg-red-100 text-red-800': product.availability === 'out-of-stock'
            }"
          >
            {{ getAvailabilityText(product.availability) }}
          </span>
        </div>
      </div>

      <!-- Price -->
      <div class="border-t border-gray-200 pt-6">
        <div class="flex items-center space-x-4 mb-4">
          <span class="text-3xl font-bold text-gray-900 font-['DM_Sans']">
            €{{ product.price.toLocaleString() }}
          </span>
          <span 
            *ngIf="product.originalPrice" 
            class="text-xl text-gray-500 line-through font-['DM_Sans']"
          >
            €{{ product.originalPrice.toLocaleString() }}
          </span>
          <span 
            *ngIf="product.discount" 
            class="bg-solar-600 text-white px-2 py-1 rounded-full text-sm font-semibold"
          >
            -{{ product.discount }}%
          </span>
        </div>
        <p class="text-sm text-gray-600 font-['DM_Sans']">
          {{ 'productDetails.priceIncludesVat' | translate }}
        </p>
      </div>

      <!-- Product Description -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3 font-['Poppins']">{{ 'productDetails.description' | translate }}</h3>
        <p class="text-gray-700 leading-relaxed font-['DM_Sans']">
          {{ product.description }}
        </p>
      </div>

      <!-- Product Details -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'productDetails.productDetails' | translate }}</h3>
        <dl class="grid grid-cols-1 gap-4">
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.category' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.category }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.manufacturer' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.manufacturer }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm font-medium text-gray-500 font-['DM_Sans']">{{ 'productDetails.sku' | translate }}:</dt>
            <dd class="text-sm text-gray-900 font-['DM_Sans']">{{ product.id.toUpperCase() }}</dd>
          </div>
        </dl>
      </div>

      <!-- Certificates -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'productDetails.certifications' | translate }}</h3>
        <div class="flex flex-wrap gap-2">
          <span 
            *ngFor="let certificate of product.certificates"
            class="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full font-['DM_Sans']"
          >
            {{ certificate }}
          </span>
        </div>
      </div>

      <!-- Quantity and Add to Cart -->
      <div class="border-t border-gray-200 pt-6">
        <div class="flex items-center space-x-4 mb-6">
          <div class="flex items-center">
            <label class="text-sm font-medium text-gray-700 mr-3 font-['DM_Sans']">{{ 'productDetails.quantity' | translate }}:</label>
            <div class="flex items-center border border-gray-300 rounded-md">
              <button 
                (click)="decreaseQuantity()"
                [disabled]="quantity <= 1"
                class="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input 
                type="number" 
                [(ngModel)]="quantity"
                [min]="1"
                [max]="99"
                class="w-16 px-2 py-2 text-center border-0 focus:ring-0 font-['DM_Sans']"
              >
              <button 
                (click)="increaseQuantity()"
                [disabled]="quantity >= 99"
                class="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button 
            (click)="addToCart()"
            [disabled]="product.availability === 'out-of-stock'"
            class="w-full px-6 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-['DM_Sans']"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"/>
            </svg>
            {{ product.availability === 'out-of-stock' ? ('productDetails.outOfStock' | translate) : ('productDetails.addToCart' | translate) }}
          </button>
          
          <button 
            (click)="addToWishlist()"
            class="w-full px-6 py-3 bg-white text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-['DM_Sans']"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {{ 'productDetails.addToWishlist' | translate }}
          </button>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="font-['DM_Sans']">{{ 'productDetails.freeShipping' | translate }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-['DM_Sans']">{{ 'productDetails.twoYearWarranty' | translate }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
              <span class="font-['DM_Sans']">{{ 'productDetails.easyReturns' | translate }}</span>
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
export class ProductInfoComponent {
  @Input() product!: Product;

  quantity: number = 1;

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available': return 'productDetails.inStock';
      case 'limited': return 'productDetails.limitedStock';
      case 'out-of-stock': return 'productDetails.outOfStock';
      default: return '';
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', this.product, 'Quantity:', this.quantity);
  }

  addToWishlist(): void {
    // TODO: Implement add to wishlist functionality
    console.log('Add to wishlist:', this.product);
  }
} 