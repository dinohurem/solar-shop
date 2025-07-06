import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface PartnerOffer {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  imageUrl: string;
  description: string;
  shortDescription: string;
  type: string;
  status: string;
  couponCode?: string;
  startDate: string;
  endDate: string;
  featured: boolean;
  isB2B: boolean;
}

interface PartnerProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  sku: string;
}

@Component({
  selector: 'app-partners-offer-details',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50" *ngIf="offer; else loadingTemplate">
      <!-- Hero Section -->
      <div class="relative bg-gradient-to-r from-solar-600 to-solar-800 text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Offer Image -->
            <div class="relative">
              <img 
                [src]="offer.imageUrl" 
                [alt]="offer.title"
                class="w-full h-96 object-cover rounded-2xl shadow-2xl"
              >
              <!-- Discount Badge -->
              <div class="absolute top-6 left-6 bg-accent-500 text-white text-lg font-bold px-4 py-3 rounded-full shadow-lg">
                -{{ offer.discountPercentage }}%
              </div>
              <!-- Partner Only Badge -->
              <div class="absolute top-6 right-6 bg-solar-100 text-solar-800 text-sm font-bold px-3 py-2 rounded-full shadow-lg">
                {{ 'b2b.offers.partnerOnly' | translate }}
              </div>
            </div>

            <!-- Offer Info -->
            <div>
              <div class="mb-6">
                <span class="inline-block bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  {{ getOfferTypeDisplay(offer.type) }}
                </span>
                <h1 class="text-5xl lg:text-6xl font-bold mb-6 font-['Poppins']">
                  {{ offer.title }}
                </h1>
                <p class="text-xl lg:text-2xl text-white/90 font-['DM_Sans']">
                  {{ offer.description || offer.shortDescription }}
                </p>
              </div>

              <!-- Partner Pricing -->
              <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <div class="text-center mb-4">
                  <h3 class="text-lg font-semibold text-white mb-2">{{ 'b2b.products.partnerPrice' | translate }}</h3>
                </div>
                <div class="flex items-center gap-4 mb-4">
                  <span class="text-2xl text-white/70 line-through font-medium">
                    €{{ offer.originalPrice.toLocaleString() }}
                  </span>
                  <span class="text-4xl font-bold text-white">
                    €{{ getPartnerPrice(offer).toLocaleString() }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div class="text-center">
                    <div class="text-white/70">{{ 'b2b.offers.savings' | translate }}</div>
                    <div class="text-lg font-bold text-accent-200">
                      €{{ getPartnerSavings(offer).toLocaleString() }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-white/70">Total Discount</div>
                    <div class="text-lg font-bold text-accent-200">
                      {{ getTotalDiscountPercentage(offer) }}%
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coupon Code -->
              <div *ngIf="offer.couponCode" class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-sm text-white/70">{{ 'b2b.offers.couponCode' | translate }}:</span>
                    <div class="text-xl font-bold text-white font-mono">{{ offer.couponCode }}</div>
                  </div>
                  <button 
                    (click)="copyCouponCode(offer.couponCode!)"
                    class="bg-white text-solar-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {{ copiedCoupon ? 'Copied!' : ('b2b.offers.copy' | translate) }}
                  </button>
                </div>
              </div>

              <!-- Offer Validity -->
              <div *ngIf="offer.endDate" class="bg-accent-500/20 border border-accent-300/30 rounded-xl p-4 mb-6">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-accent-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z"/>
                  </svg>
                  <span class="text-white font-semibold">
                    {{ 'b2b.offers.expires' | translate }}: {{ formatDate(offer.endDate) }}
                  </span>
                </div>
              </div>

              <!-- Action Button -->
              <div class="flex space-x-4">
                <button 
                  *ngIf="!isOfferExpired(offer.endDate)"
                  (click)="claimOffer(offer)"
                  class="flex-1 bg-white text-solar-600 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  {{ 'b2b.offers.claimOffer' | translate }}
                </button>
                <button 
                  *ngIf="isOfferExpired(offer.endDate)"
                  disabled
                  class="flex-1 bg-gray-400 text-white py-3 px-6 rounded-lg font-bold text-lg cursor-not-allowed shadow-lg">
                  {{ 'b2b.offers.expired' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Included Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 font-['Poppins']">
          {{ 'b2b.offers.productsIncluded' | translate }}
        </h2>

        <!-- Product Cards with Partner Pricing -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let product of relatedProducts; trackBy: trackByProductId"
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <!-- Product Image -->
            <div class="relative h-64 bg-gray-50 overflow-hidden">
              <img 
                [src]="product.imageUrl"
                [alt]="product.name"
                class="w-full h-full object-cover"
              >
              <!-- Partner Exclusive Badge -->
              <div class="absolute top-4 left-4 bg-solar-600 text-white text-xs font-bold px-3 py-2 rounded-full">
                Partner Price
              </div>
              <!-- Discount Badge -->
              <div class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{{ offer.discountPercentage }}%
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">
                {{ product.name }}
              </h3>
              <p class="text-gray-600 text-sm mb-4 font-['DM_Sans'] line-clamp-2">
                {{ product.description }}
              </p>

              <!-- Pricing Comparison -->
              <div class="space-y-3 mb-4">
                <!-- Retail Price -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ 'b2b.products.retailPrice' | translate }}:</span>
                  <span class="text-lg text-gray-500 line-through">
                    €{{ product.price.toLocaleString() }}
                  </span>
                </div>
                
                <!-- Partner Price -->
                <div class="flex items-center justify-between bg-solar-50 p-2 rounded-lg">
                  <span class="text-sm font-medium text-solar-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                  <span class="text-xl font-bold text-solar-600">
                    €{{ getProductPartnerPrice(product, offer).toLocaleString() }}
                  </span>
                </div>
                
                <!-- Total Savings -->
                <div class="flex items-center justify-between border-t pt-2">
                  <span class="text-sm font-medium text-green-700">{{ 'b2b.products.savings' | translate }}:</span>
                  <span class="text-lg font-bold text-green-600">
                    €{{ getProductTotalSavings(product, offer).toLocaleString() }}
                  </span>
                </div>
              </div>

              <!-- Add to Cart -->
              <div class="space-y-3">
                <button 
                  (click)="addToCart(product, offer)"
                  class="w-full px-4 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans']"
                >
                  {{ 'b2b.offers.addToCartPartnerPrice' | translate }}
                </button>
                
                <button 
                  (click)="navigateToProduct(product.id)"
                  class="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold font-['DM_Sans']"
                >
                  {{ 'b2b.offers.viewDetails' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Offer Details Section -->
      <div class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Offer Description -->
            <div class="lg:col-span-2">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                About This Partner Offer
              </h2>
              <div class="prose prose-lg max-w-none">
                <p class="text-gray-600 leading-relaxed font-['DM_Sans']">
                  {{ offer.description || 'Take advantage of this exclusive partner offer to get exceptional savings on premium solar and energy products.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-solar-600 border-t-transparent mx-auto mb-4"></div>
          <p class="text-gray-600 font-['DM_Sans']">Loading partner offer details...</p>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class PartnersOfferDetailsComponent implements OnInit, OnDestroy {
  offer: PartnerOffer | null = null;
  relatedProducts: PartnerProduct[] = [];
  copiedCoupon = false;
  private destroy$ = new Subject<void>();

  // Partner discount percentage (additional discount on top of offer discount)
  readonly PARTNER_DISCOUNT_PERCENTAGE = 15;

  // Sample data for demonstration
  private sampleOffers: PartnerOffer[] = [
    {
      id: '1',
      title: 'Bulk Solar Panel Package - 50% Off Installation',
      originalPrice: 15000,
      discountedPrice: 12000,
      discountPercentage: 20,
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
      description: 'Complete solar panel installation package for commercial properties. Includes 100+ high-efficiency panels, professional installation, and 5-year maintenance.',
      shortDescription: 'Bulk solar installation with professional service',
      type: 'bulk-discount',
      status: 'active',
      couponCode: 'BULK50PARTNER',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      featured: true,
      isB2B: true
    },
    {
      id: '2',
      title: 'Partner Exclusive: Premium Inverter Bundle',
      originalPrice: 8500,
      discountedPrice: 6800,
      discountPercentage: 25,
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop',
      description: 'Exclusive bundle for certified partners including 3 premium inverters, monitoring system, and extended warranty coverage.',
      shortDescription: 'Premium inverter bundle with monitoring',
      type: 'partner-exclusive',
      status: 'active',
      couponCode: 'INVPARTNER25',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      featured: true,
      isB2B: true
    },
    {
      id: '3',
      title: 'Energy Storage Solution - Early Bird Pricing',
      originalPrice: 12000,
      discountedPrice: 9600,
      discountPercentage: 20,
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      description: 'Complete energy storage solution with lithium batteries, smart management system, and installation support.',
      shortDescription: 'Complete energy storage with smart management',
      type: 'early-bird',
      status: 'active',
      couponCode: 'STORAGE20EB',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      featured: false,
      isB2B: true
    },
    {
      id: '4',
      title: 'Commercial Mounting System Package',
      originalPrice: 5000,
      discountedPrice: 4000,
      discountPercentage: 20,
      imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop',
      description: 'Professional-grade mounting systems designed for large-scale commercial installations. Includes all hardware and installation guides.',
      shortDescription: 'Professional mounting systems for commercial use',
      type: 'volume-discount',
      status: 'active',
      couponCode: 'MOUNT20COMM',
      startDate: '2024-01-01',
      endDate: '2024-08-31',
      featured: false,
      isB2B: true
    },
    {
      id: '5',
      title: 'Smart Monitoring System Bundle',
      originalPrice: 3500,
      discountedPrice: 2800,
      discountPercentage: 20,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      description: 'Advanced monitoring and analytics system for tracking solar performance across multiple installations.',
      shortDescription: 'Smart monitoring and analytics system',
      type: 'partner-exclusive',
      status: 'active',
      couponCode: 'MONITOR20SMART',
      startDate: '2024-01-01',
      endDate: '2024-07-15',
      featured: true,
      isB2B: true
    }
  ];

  private sampleProducts: PartnerProduct[] = [
    {
      id: '1',
      name: 'SolarMax Pro 400W Panel',
      description: 'High-efficiency monocrystalline solar panel',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
      price: 299.99,
      category: 'solar-panels',
      sku: 'SM-400-MONO'
    },
    {
      id: '2',
      name: 'PowerInvert 5000W Inverter',
      description: 'Advanced hybrid inverter with battery capability',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&h=500&fit=crop',
      price: 1899.99,
      category: 'inverters',
      sku: 'PI-5000-HYB'
    },
    {
      id: '3',
      name: 'EnergyStore 10kWh Battery',
      description: 'Lithium iron phosphate battery system',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=500&fit=crop',
      price: 4500.00,
      category: 'batteries',
      sku: 'ES-10KWH-LIFEPO4'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const offerId = params['id'];
      this.loadOffer(offerId);
    });

    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOffer(offerId: string): void {
    // Simulate loading offer from service
    this.offer = this.sampleOffers.find(o => o.id === offerId) || this.sampleOffers[0];
    this.relatedProducts = this.sampleProducts;
  }

  getOfferTypeDisplay(type?: string): string {
    const typeMap: { [key: string]: string } = {
      'bulk-discount': 'Partner Bulk Discount',
      'partner-exclusive': 'Partner Exclusive',
      'early-bird': 'Partner Early Bird',
      'volume-discount': 'Partner Volume Discount'
    };
    return typeMap[type || ''] || 'Exclusive Partner Offer';
  }

  calculateDiscountedPrice(originalPrice: number, discountPercentage: number): number {
    return originalPrice * (1 - discountPercentage / 100);
  }

  getPartnerPrice(offer: PartnerOffer): number {
    const discountedPrice = this.calculateDiscountedPrice(offer.originalPrice, offer.discountPercentage);
    return this.calculateDiscountedPrice(discountedPrice, this.PARTNER_DISCOUNT_PERCENTAGE);
  }

  getPartnerSavings(offer: PartnerOffer): number {
    return offer.originalPrice - this.getPartnerPrice(offer);
  }

  getTotalDiscountPercentage(offer: PartnerOffer): number {
    const partnerPrice = this.getPartnerPrice(offer);
    return Math.round(((offer.originalPrice - partnerPrice) / offer.originalPrice) * 100);
  }

  getProductPartnerPrice(product: PartnerProduct, offer: PartnerOffer): number {
    const offerDiscountedPrice = this.calculateDiscountedPrice(product.price, offer.discountPercentage);
    return this.calculateDiscountedPrice(offerDiscountedPrice, this.PARTNER_DISCOUNT_PERCENTAGE);
  }

  getProductTotalSavings(product: PartnerProduct, offer: PartnerOffer): number {
    return product.price - this.getProductPartnerPrice(product, offer);
  }

  copyCouponCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCoupon = true;
      setTimeout(() => {
        this.copiedCoupon = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy coupon code:', err);
    });
  }

  claimOffer(offer: PartnerOffer): void {
    alert(`Partner offer "${offer.title}" has been claimed!`);
  }

  addToCart(product: PartnerProduct, offer: PartnerOffer): void {
    const partnerPrice = this.getProductPartnerPrice(product, offer);
    alert(`Added "${product.name}" to cart at partner price: €${partnerPrice.toFixed(2)}`);
  }

  isOfferExpired(endDate?: string): boolean {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }

  trackByProductId(index: number, product: PartnerProduct): string {
    return product.id;
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId], {
      queryParams: { companyPricing: true }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 