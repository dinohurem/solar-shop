import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Offer } from '../../../../shared/models/offer.model';

@Component({
  selector: 'app-partners-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ 'b2b.offers.title' | translate }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 font-['DM_Sans']">
            {{ 'b2b.offers.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- Login Required Banner (for non-authenticated users) -->
      <div *ngIf="!isAuthenticated || !hasCompanyId" class="bg-solar-50 border-b border-solar-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-solar-800">
                  <span *ngIf="!isAuthenticated">{{ 'b2b.offers.loginRequired' | translate }}</span>
                  <span *ngIf="isAuthenticated && !hasCompanyId">Partner verification required to view exclusive offers</span>
                </p>
              </div>
            </div>
            <button *ngIf="!isAuthenticated" 
                    (click)="navigateToLogin()" 
                    class="bg-solar-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
              {{ 'b2b.offers.loginToViewOffers' | translate }}
            </button>
            <button *ngIf="isAuthenticated && !hasCompanyId" 
                    (click)="navigateToPartnerRegistration()" 
                    class="bg-solar-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
              Become a Partner
            </button>
          </div>
        </div>
      </div>

      <!-- Offers Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let offer of b2bOffers" 
               class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            
            <!-- Offer Image -->
            <div class="relative">
              <img [src]="offer.imageUrl" [alt]="offer.title" 
                   class="w-full h-48 object-cover">
              
              <!-- Discount Badge -->
              <div class="absolute top-4 left-4">
                <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{{ offer.discountPercentage }}%
                </span>
              </div>

              <!-- Partner Only Badge -->
              <div class="absolute top-4 right-4">
                <span class="bg-solar-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {{ 'b2b.offers.partnerOnly' | translate }}
                </span>
              </div>

              <!-- Expiry Date -->
              <div *ngIf="offer.endDate" class="absolute bottom-4 right-4">
                <span class="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {{ 'b2b.offers.expires' | translate }}: {{ formatDate(offer.endDate) }}
                </span>
              </div>
            </div>

            <!-- Offer Content -->
            <div class="p-6">
              <!-- Title -->
              <h3 class="text-xl font-bold text-gray-900 mb-2 font-['Poppins']">
                {{ offer.title }}
              </h3>

              <!-- Description -->
              <p class="text-gray-600 mb-4 font-['DM_Sans'] line-clamp-3">
                {{ offer.description }}
              </p>

              <!-- Pricing -->
              <div *ngIf="isAuthenticated && hasCompanyId" class="mb-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-2xl font-bold text-solar-600">
                      €{{ offer.discountedPrice | number:'1.2-2' }}
                    </span>
                    <span class="text-lg text-gray-500 line-through ml-2">
                      €{{ offer.originalPrice | number:'1.2-2' }}
                    </span>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">{{ 'b2b.offers.savings' | translate }}</div>
                    <div class="text-lg font-bold text-green-600">
                      €{{ (offer.originalPrice - offer.discountedPrice) | number:'1.2-2' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Login Required Pricing -->
              <div *ngIf="!isAuthenticated || !hasCompanyId" class="mb-4 text-center py-4 bg-gray-50 rounded-lg">
                <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <p class="text-sm text-gray-500 font-medium">
                  <span *ngIf="!isAuthenticated">{{ 'b2b.offers.loginToViewPrices' | translate }}</span>
                  <span *ngIf="isAuthenticated && !hasCompanyId">Partner verification required to view pricing</span>
                </p>
              </div>

              <!-- Coupon Code -->
              <div *ngIf="offer.couponCode && isAuthenticated && hasCompanyId" class="mb-4">
                <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-sm text-gray-600">{{ 'b2b.offers.couponCode' | translate }}:</span>
                      <span class="ml-2 font-mono font-bold text-solar-600">{{ offer.couponCode }}</span>
                    </div>
                    <button (click)="copyCouponCode(offer.couponCode)" 
                            class="text-solar-600 hover:text-solar-700 text-sm font-medium">
                      {{ 'b2b.offers.copy' | translate }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Offer Type -->
              <div class="mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [class]="getOfferTypeClass(offer.type)">
                  {{ getOfferTypeLabel(offer.type) }}
                </span>
              </div>

              <!-- Actions -->
              <div class="space-y-2">
                <button *ngIf="isAuthenticated && hasCompanyId" 
                        (click)="claimOffer(offer)"
                        [disabled]="isOfferExpired(offer.endDate)"
                        class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  <span *ngIf="!isOfferExpired(offer.endDate)">{{ 'b2b.offers.claimOffer' | translate }}</span>
                  <span *ngIf="isOfferExpired(offer.endDate)">{{ 'b2b.offers.expired' | translate }}</span>
                </button>
                
                <button *ngIf="!isAuthenticated" 
                        (click)="navigateToLogin()"
                        class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 transition-colors">
                  {{ 'b2b.offers.signInToClaim' | translate }}
                </button>

                <button *ngIf="isAuthenticated && !hasCompanyId" 
                        (click)="navigateToPartnerRegistration()"
                        class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 transition-colors">
                  Become a Partner to Claim
                </button>
                
                <button (click)="viewOfferDetails(offer)" 
                        class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  {{ 'b2b.offers.viewDetails' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Offers Available -->
        <div *ngIf="b2bOffers.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'b2b.offers.noOffers' | translate }}</h3>
          <p class="text-gray-600">{{ 'b2b.offers.noOffersText' | translate }}</p>
        </div>
      </div>
    </div>
  `,
})
export class PartnersOffersComponent implements OnInit {
  isAuthenticated = false; // This should be connected to your auth service
  hasCompanyId = false; // Check if user has company association
  isPartner = false; // Check if user is verified partner

  // Sample B2B offers data
  b2bOffers: Offer[] = [
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

  constructor(private router: Router) {
    // TODO: Connect to auth service and check user status
    // this.authService.isAuthenticated$.subscribe(isAuth => this.isAuthenticated = isAuth);
    // this.authService.user$.subscribe(user => {
    //   this.hasCompanyId = !!user?.companyId;
    //   this.isPartner = user?.role === 'partner' || user?.isVerifiedPartner;
    // });

    // For demo purposes, simulate authenticated partner
    this.isAuthenticated = true;
    this.hasCompanyId = true;
    this.isPartner = true;
  }

  ngOnInit(): void {
    // Filter offers to show only B2B offers
    this.b2bOffers = this.b2bOffers.filter(offer => offer.isB2B);
  }

  navigateToLogin(): void {
    // Navigate to login page
    window.location.href = '/login';
  }

  navigateToPartnerRegistration(): void {
    // Navigate to partner registration page
    this.router.navigate(['/partners/register']);
  }

  claimOffer(offer: Offer): void {
    // TODO: Implement offer claiming logic
    alert(`Offer "${offer.title}" has been added to your account!`);
  }

  viewOfferDetails(offer: Offer): void {
    this.router.navigate(['/partners/offers', offer.id]);
  }

  copyCouponCode(couponCode: string): void {
    navigator.clipboard.writeText(couponCode).then(() => {
      // TODO: Show toast notification
      alert('Coupon code copied to clipboard!');
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

  isOfferExpired(endDate?: string): boolean {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  }

  getOfferTypeClass(type?: string): string {
    switch (type) {
      case 'bulk-discount':
        return 'bg-blue-100 text-blue-800';
      case 'partner-exclusive':
        return 'bg-purple-100 text-purple-800';
      case 'early-bird':
        return 'bg-green-100 text-green-800';
      case 'volume-discount':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getOfferTypeLabel(type?: string): string {
    switch (type) {
      case 'bulk-discount':
        return 'Bulk Discount';
      case 'partner-exclusive':
        return 'Partner Exclusive';
      case 'early-bird':
        return 'Early Bird';
      case 'volume-discount':
        return 'Volume Discount';
      default:
        return 'Special Offer';
    }
  }
} 