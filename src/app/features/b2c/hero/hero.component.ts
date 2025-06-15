import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HeroActions } from './store/hero.actions';
import { selectIsLoading } from './store/hero.selectors';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { OffersService } from '../offers/services/offers.service';
import { Offer } from '../../../shared/models/offer.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Hero Section -->
    <section class="relative min-h-screen lg:min-h-[60vh] xl:min-h-[65vh] overflow-hidden -mt-4">
      <!-- Background with rounded bottom -->
      <div class="absolute inset-0 bg-gradient-to-br from-solar-600 to-solar-800">
        <!-- Background Image -->
        <img 
          src="/assets/images/hero.jpg" 
          alt="Sustainable Building Materials" 
          class="w-full h-full object-cover opacity-20"
          onerror="console.error('Hero background image failed to load:', this.src); this.style.display='none'"
          onload="console.log('Hero background image loaded successfully')"
        >
        <!-- Gradient Overlay -->
        <!-- <div class="absolute inset-0 bg-gradient-to-br from-solar-600/80 to-solar-800/80 opacity-55"></div> -->
      </div>

      <!-- Rounded bottom shape -->
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-[40px]"></div>

      <!-- Content Container -->
      <div class="relative z-10 flex flex-col min-h-screen lg:min-h-[60vh] xl:min-h-[65vh] justify-center px-4 sm:px-6 lg:px-8 pt-8 lg:pt-16">
        <div class="max-w-7xl mx-auto text-center">
          <!-- Main Heading -->
          <h1 class="text-white font-bold text-3xl sm:text-5xl lg:text-5xl xl:text-6xl leading-tight mb-4 lg:mb-6 font-['Poppins']">
            {{ 'hero.mainTitle' | translate }}
          </h1>
          
          <!-- Subtitle -->
          <p class="text-white text-lg sm:text-xl lg:text-xl leading-relaxed mb-8 lg:mb-10 font-['DM_Sans'] opacity-90 max-w-3xl mx-auto">
            {{ 'hero.subtitle' | translate }}
          </p>

          <!-- Offers Carousel -->
          <div class="mb-8 lg:mb-12">
            <div class="relative max-w-6xl mx-auto">
              <!-- Loading State -->
              <div *ngIf="offersLoading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>

              <!-- Offers Container -->
              <div *ngIf="!offersLoading && featuredOffers.length > 0" class="relative">
                <!-- Navigation Arrows - Outside the cards -->
                <button 
                  (click)="previousOffer()"
                  [disabled]="featuredOffers.length <= 1"
                  class="absolute -left-24 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-300 backdrop-blur-sm shadow-lg hidden lg:flex items-center justify-center"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>

                <button 
                  (click)="nextOffer()"
                  [disabled]="featuredOffers.length <= 1"
                  class="absolute -right-24 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-300 backdrop-blur-sm shadow-lg hidden lg:flex items-center justify-center"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <!-- Mobile Navigation Arrows - Positioned differently for mobile -->
                <button 
                  (click)="previousOffer()"
                  [disabled]="featuredOffers.length <= 1"
                  class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-300 backdrop-blur-sm shadow-lg lg:hidden"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>

                <button 
                  (click)="nextOffer()"
                  [disabled]="featuredOffers.length <= 1"
                  class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-3 transition-all duration-300 backdrop-blur-sm shadow-lg lg:hidden"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <!-- Fixed Height Offer Cards Container -->
                <div class="overflow-hidden px-4 sm:px-8 lg:px-0">
                  <div 
                    class="flex transition-transform duration-700 ease-in-out"
                    [style.transform]="'translateX(-' + (currentOfferIndex * 100) + '%)'"
                  >
                    <div 
                      *ngFor="let offer of featuredOffers" 
                      class="flex-shrink-0 w-full px-2"
                    >
                      <!-- Compact Card Container -->
                      <div class="bg-white/15 backdrop-blur-sm rounded-3xl border border-white/30 hover:bg-white/20 transition-all duration-500 cursor-pointer relative overflow-hidden"
                           style="min-height: 400px; height: 400px;"
                           (click)="viewOffer(offer.id)">
                        
                        <!-- Prime Deal Ribbon with Corner Wrap -->
                        <div class="absolute top-0 right-0 z-10">
                          <!-- Main Ribbon -->
                          <div class="relative">
                            <div class="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold px-6 py-2 transform rotate-45 translate-x-4 translate-y-4 shadow-xl">
                              {{ 'hero.primeDeal' | translate }}
                            </div>
                            <!-- Corner Wrap Shadow/Fold Effect -->
                            <div class="absolute top-0 right-0 w-2 h-2 bg-accent-700 transform rotate-45 translate-x-3 translate-y-3 opacity-60"></div>
                            <div class="absolute top-0 right-0 w-1 h-1 bg-accent-800 transform rotate-45 translate-x-4 translate-y-4 opacity-40"></div>
                          </div>
                        </div>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-stretch h-full p-4 lg:p-6">
                          <!-- Compact Image Container -->
                          <div class="relative order-2 lg:order-1 flex flex-col justify-center">
                            <div class="relative">
                              <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-white/10">
                                <img 
                                  [src]="offer.imageUrl" 
                                  [alt]="offer.title"
                                  class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                  onerror="this.src='/assets/images/product-placeholder.jpg'"
                                >
                              </div>
                              <!-- Compact Discount Badge -->
                              <div class="absolute -top-2 -right-2 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                {{ offer.discountPercentage }}% OFF
                              </div>
                            </div>
                          </div>
                          
                          <!-- Compact Content Area -->
                          <div class="order-1 lg:order-2 text-center lg:text-left flex flex-col justify-center">
                            <div class="space-y-2 lg:space-y-3">
                              <!-- Offer Type Badge -->
                              <div class="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                Special Offer
                              </div>
                              
                              <!-- Compact Title -->
                              <div style="min-height: 60px;" class="flex items-center justify-center lg:justify-start">
                                <h3 class="text-white text-lg lg:text-xl xl:text-2xl font-bold font-['Poppins'] leading-tight line-clamp-2">
                                  {{ offer.title }}
                                </h3>
                              </div>
                              
                              <!-- Compact Description -->
                              <div style="min-height: 40px;" class="flex items-start">
                                <p class="text-white/90 text-sm lg:text-base font-['DM_Sans'] leading-relaxed line-clamp-2">
                                  {{ offer.shortDescription || offer.description }}
                                </p>
                              </div>
                              
                              <!-- Compact Price Section -->
                              <div style="min-height: 40px;" class="flex items-center justify-center lg:justify-start space-x-3">
                                <span class="text-white text-lg lg:text-xl font-bold font-['DM_Sans']">
                                  {{ offer.discountedPrice | currency:'EUR':'symbol':'1.2-2' }}
                                </span>
                                <span class="text-white/60 line-through text-sm lg:text-base font-['DM_Sans']">
                                  {{ offer.originalPrice | currency:'EUR':'symbol':'1.2-2' }}
                                </span>
                              </div>
                              
                              <!-- Compact Savings Display -->
                              <div style="min-height: 35px;" class="flex items-center justify-center lg:justify-start">
                                <div class="inline-block bg-solar-400/20 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                                  Save {{ (offer.originalPrice - offer.discountedPrice) | currency:'EUR':'symbol':'1.2-2' }}!
                                </div>
                              </div>
                              
                              <!-- Compact CTA Button -->
                              <div style="min-height: 50px;" class="flex items-center justify-center lg:justify-start">
                                <button 
                                  (click)="viewOffer(offer.id); $event.stopPropagation()"
                                  class="bg-white text-solar-600 font-bold text-base px-8 py-3 rounded-xl hover:bg-solar-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-['DM_Sans'] border-2 border-white"
                                >
                                {{ 'offers.viewDetails' | translate }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Carousel Indicators -->
                <div class="flex justify-center mt-4 space-x-2" *ngIf="featuredOffers.length > 1">
                  <button 
                    *ngFor="let _ of featuredOffers; let i = index"
                    (click)="goToOffer(i)"
                    class="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110"
                    [class]="currentOfferIndex === i ? 'bg-white shadow-lg' : 'bg-white/40 hover:bg-white/60'"
                  ></button>
                </div>
              </div>

              <!-- No Offers State -->
              <div *ngIf="!offersLoading && featuredOffers.length === 0" class="text-center py-8">
                <p class="text-white/80 text-lg font-['DM_Sans']">{{ 'hero.noOffersAvailable' | translate }}</p>
              </div>
            </div>
          </div>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              (click)="onExploreProducts()"
              [disabled]="isLoading$ | async"
              class="bg-solar-400 text-white font-semibold text-base px-8 py-3 rounded-xl hover:bg-solar-300 transition-all duration-300 font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span *ngIf="!(isLoading$ | async)">{{ 'hero.exploreProducts' | translate }}</span>
              <span *ngIf="isLoading$ | async" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ 'hero.loading' | translate }}
              </span>
            </button>

            <button 
              (click)="onExploreOffers()"
              class="bg-white/20 backdrop-blur-sm text-white font-semibold text-second-fg px-8 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-['DM_Sans'] border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {{ 'hero.exploreOffers' | translate }}
            </button>
          </div>
        </div>
      </div>
    </section>
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
export class HeroComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private offersService = inject(OffersService);

  isLoading$: Observable<boolean>;
  featuredOffers: Offer[] = [];
  offersLoading = true;
  currentOfferIndex = 0;
  private autoSlideInterval: any;

  constructor(private router: Router) {
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(HeroActions.initializeHero());
    this.loadFeaturedOffers();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private loadFeaturedOffers(): void {
    this.offersLoading = true;
    this.offersService.getFeaturedOffers(6).subscribe({
      next: (offers) => {
        this.featuredOffers = offers;
        this.offersLoading = false;
        this.setupAutoSlide();
      },
      error: (error) => {
        console.error('Error loading featured offers:', error);
        this.offersLoading = false;
      }
    });
  }

  private setupAutoSlide(): void {
    // Clear any existing interval
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }

    // Auto-slide every 8 seconds (increased from 5 seconds)
    this.autoSlideInterval = setInterval(() => {
      if (this.featuredOffers.length > 1) {
        this.nextOffer();
      }
    }, 8000);
  }

  nextOffer(): void {
    if (this.currentOfferIndex < this.featuredOffers.length - 1) {
      this.currentOfferIndex++;
    } else {
      this.currentOfferIndex = 0; // Loop back to start
    }
  }

  previousOffer(): void {
    if (this.currentOfferIndex > 0) {
      this.currentOfferIndex--;
    } else {
      this.currentOfferIndex = this.featuredOffers.length - 1; // Go to end
    }
  }

  goToOffer(index: number): void {
    this.currentOfferIndex = index;
    // Reset auto-slide timer when manually navigating
    this.setupAutoSlide();
  }

  viewOffer(offerId: string): void {
    this.router.navigate(['/offers', offerId]);
  }

  onExploreProducts(): void {
    this.router.navigate(['/products'], {
      state: { fromHero: true, clearFilters: true }
    });
  }

  onExploreOffers(): void {
    this.router.navigate(['/offers']);
  }
} 