import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AddToCartButtonComponent } from '../cart/components/add-to-cart-button/add-to-cart-button.component';
import { OffersService, Offer } from './services/offers.service';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, AddToCartButtonComponent],
  template: `
    <!-- Offers & Promotions Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="flex justify-between items-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-heyhome-dark-green font-['Poppins']">
            Offers & Promotions
          </h2>
          <button (click)="navigateToOffers()" class="flex items-center gap-2 text-heyhome-dark-green hover:text-heyhome-primary transition-colors font-semibold text-lg group">
            <span>View All</span>
            <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Offers Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            *ngFor="let offer of offers$ | async; trackBy: trackByOfferId"
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <!-- Product Image -->
            <div class="relative h-56 bg-gray-50 overflow-hidden">
              <img 
                [src]="offer.imageUrl" 
                [alt]="offer.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
              <!-- Discount Badge -->
              <div class="absolute top-4 left-4 bg-gradient-to-r from-[#0ACF83] to-[#0ACFAC] text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg">
                -{{ offer.discountPercentage }}%
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-heyhome-dark-green mb-4 font-['Poppins']">
                {{ offer.title }}
              </h3>
              
              <!-- Pricing -->
              <div class="flex items-center gap-3 mb-4">
                <span class="text-lg text-gray-400 line-through font-medium">
                  {{ offer.originalPrice | currency:'EUR':'symbol':'1.2-2' }}
                </span>
                <span class="text-xl font-bold text-heyhome-dark-green">
                  {{ offer.discountedPrice | currency:'EUR':'symbol':'1.2-2' }}
                </span>
              </div>

              <!-- Add to Cart Button -->
              <app-add-to-cart-button 
                [productId]="offer.id" 
                [quantity]="1" 
                buttonText="Add to Cart"
                [fullWidth]="true"
                size="lg">
              </app-add-to-cart-button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-heyhome-primary border-t-transparent"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && (offers$ | async)?.length === 0" class="text-center py-12">
          <div class="text-gray-500 text-lg">No offers available at the moment.</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class OffersComponent implements OnInit {
  offers$: Observable<Offer[]>;
  isLoading = false;

  constructor(
    private router: Router,
    private offersService: OffersService
  ) {
    this.offers$ = this.offersService.getFeaturedOffers(4);
  }

  ngOnInit(): void {
    this.loadOffers();
  }

  private loadOffers(): void {
    this.isLoading = true;
    this.offers$ = this.offersService.getFeaturedOffers(4);

    // Subscribe to handle loading state
    this.offers$.subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.isLoading = false;
      }
    });
  }

  trackByOfferId(index: number, offer: Offer): string {
    return offer.id;
  }

  navigateToOffers() {
    this.router.navigate(['/offers']);
  }
} 