import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { OffersActions } from './store/offers.actions';
import { selectOffers, selectIsLoading } from './store/offers.selectors';
import { AddToCartButtonComponent } from '../cart/components/add-to-cart-button/add-to-cart-button.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Offer } from './services/offers.service';

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [CommonModule, AddToCartButtonComponent, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-solar-600 to-solar-800 text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-5xl lg:text-6xl font-bold mb-6 font-['Poppins']">
            {{ 'offers.title' | translate }}
          </h1>
          <p class="text-xl lg:text-2xl max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'offers.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- Offers Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center justify-between mb-12 gap-4">
          <div class="flex items-center space-x-4">
            <span class="text-lg font-semibold text-[#324053] font-['Poppins']">Filter by:</span>
            <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']">
              <option value="">{{ 'offers.allCategories' | translate }}</option>
              <option value="solar-panels">{{ 'offers.solarPanels' | translate }}</option>
              <option value="inverters">{{ 'offers.inverters' | translate }}</option>
              <option value="batteries">{{ 'offers.batteries' | translate }}</option>
              <option value="accessories">{{ 'offers.accessories' | translate }}</option>
            </select>
          </div>
          <div class="text-sm text-gray-600 font-['DM_Sans']">
            {{ 'offers.offersAvailable' | translate:{ count: ((offers$ | async)?.length || 0) } }}
          </div>
        </div>

        <!-- Offers Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div 
            *ngFor="let offer of offers$ | async; trackBy: trackByOfferId"
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
            (click)="navigateToProduct(offer.id)"
          >
            <!-- Product Image -->
            <div class="relative h-64 bg-gray-50 overflow-hidden">
              <img 
                [src]="offer.imageUrl" 
                [alt]="offer.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
              <!-- Discount Badge -->
              <div class="absolute top-4 left-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg">
                -{{ offer.discountPercentage }}%
              </div>
              <!-- Sale Badge -->
              <div class="absolute top-4 right-4 bg-solar-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {{ 'offers.sale' | translate }}
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-[#324053] mb-3 font-['Poppins'] line-clamp-2 group-hover:text-solar-600 transition-colors">
                {{ offer.title }}
              </h3>
              
              <p *ngIf="offer.description" class="text-gray-600 text-sm mb-4 font-['DM_Sans'] line-clamp-2">
                {{ offer.description }}
              </p>
              
              <!-- Pricing -->
              <div class="flex items-center gap-3 mb-6">
                <span class="text-lg text-gray-400 line-through font-medium font-['DM_Sans']">
                  {{ offer.originalPrice | currency:'EUR':'symbol':'1.2-2' }}
                </span>
                <span class="text-2xl font-bold text-[#324053] font-['DM_Sans']">
                  {{ offer.discountedPrice | currency:'EUR':'symbol':'1.2-2' }}
                </span>
              </div>

              <!-- Savings -->
              <div class="bg-solar-50 text-solar-800 text-sm font-semibold px-3 py-2 rounded-lg mb-4 text-center">
                {{ 'offers.youSave' | translate:{ amount: getSavingsAmount(offer) } }}
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <app-add-to-cart-button 
                  [productId]="offer.id" 
                  [quantity]="1" 
                  [buttonText]="'offers.addToCart' | translate"
                  [fullWidth]="true"
                  size="md"
                  variant="primary"
                  (click)="$event.stopPropagation()">
                </app-add-to-cart-button>
                
                <button 
                  (click)="navigateToProduct(offer.id); $event.stopPropagation()"
                  class="w-full px-4 py-2 bg-white text-[#324053] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold font-['DM_Sans']"
                >
                  {{ 'offers.viewDetails' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-solar-600 border-t-transparent"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!(isLoading$ | async) && (offers$ | async)?.length === 0" class="text-center py-20">
          <div class="text-gray-400 mb-6">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">{{ 'offers.noOffers' | translate }}</h3>
          <p class="text-gray-600 mb-8 font-['DM_Sans']">{{ 'offers.noOffersText' | translate }}</p>
          <button 
            (click)="navigateToProducts()"
            class="px-8 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans']"
          >
            {{ 'offers.browseAllProducts' | translate }}
          </button>
        </div>

        <!-- Call to Action -->
        <div class="mt-20 bg-gradient-to-r from-solar-600 to-solar-800 rounded-3xl p-12 text-center text-white">
          <h2 class="text-3xl lg:text-4xl font-bold mb-6 font-['Poppins']">
            {{ 'offers.dontMissOut' | translate }}
          </h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto font-['DM_Sans']">
            {{ 'offers.subscribeText' | translate }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              [placeholder]="'offers.enterEmail' | translate"
              class="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-['DM_Sans']"
            >
            <button class="px-8 py-3 bg-white text-solar-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors font-['DM_Sans']">
              {{ 'offers.subscribe' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      display: block;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class OffersPageComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  offers$: Observable<Offer[]>;
  isLoading$: Observable<boolean>;

  constructor() {
    this.offers$ = this.store.select(selectOffers);
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(OffersActions.loadOffers());
  }

  trackByOfferId(index: number, offer: Offer): string {
    return offer.id;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  getSavingsAmount(offer: Offer): string {
    const savingsAmount = offer.originalPrice - offer.discountedPrice;
    return savingsAmount.toLocaleString('en-US', { style: 'currency', currency: 'EUR' });
  }
} 