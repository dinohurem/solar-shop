import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-partners',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    template: `
    <div class="min-h-screen bg-b2b-gray-50">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-b2b-600 to-b2b-800 py-24">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 font-['Poppins']">
            {{ 'b2b.hero.title' | translate }}
          </h1>
          <p class="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'b2b.hero.subtitle' | translate }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-b2b-600 px-8 py-4 rounded-lg font-semibold hover:bg-b2b-50 transition-all">
              {{ 'b2b.hero.getStarted' | translate }}
            </button>
            <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
              {{ 'b2b.hero.learnMore' | translate }}
            </button>
          </div>
        </div>
      </section>

      <!-- Banner Carousel Section (like in image) -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- GOODWE Banner -->
            <div class="bg-gradient-to-r from-teal-400 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div class="absolute top-4 right-4 text-teal-200">
                <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold mb-2">GOODWE</h3>
              <div class="text-sm mb-4">SMA SUNGROW</div>
              <p class="text-lg font-semibold mb-4">Reliable technology, trusted quality</p>
              <p class="text-sm opacity-90">The Summer Draw: Electrical inverters and accessories at advanced prices</p>
            </div>

            <!-- HUAWEI Banner -->
            <div class="bg-white border-2 border-gray-200 rounded-2xl p-8 relative overflow-hidden">
              <div class="text-red-500 text-2xl font-bold mb-4">HUAWEI</div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">Huawei welcome offer - final round!</h3>
              <p class="text-gray-600 text-sm mb-4">Take advantage of the Huawei promotion until the 31st of July!</p>
              <div class="text-gray-900 font-semibold">up to 10% off</div>
            </div>

            <!-- PV Manager Banner -->
            <div class="bg-gradient-to-br from-b2b-500 to-b2b-700 rounded-2xl p-8 text-white relative overflow-hidden">
              <div class="absolute bottom-0 right-0 opacity-20">
                <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold mb-2">Your PV Manager Free Trial</h3>
              <p class="text-sm opacity-90 mb-4">Join the community for your professional business</p>
              <button class="bg-white text-b2b-600 px-4 py-2 rounded font-semibold text-sm hover:bg-b2b-50 transition-all">
                Try now
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Current Highlights -->
      <section class="py-16 bg-b2b-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 font-['Poppins']">Current Highlights</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div *ngFor="let product of currentHighlights" class="bg-white rounded-lg border border-b2b-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div class="aspect-square bg-b2b-gray-100 relative">
                <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover">
                <div *ngIf="product.badge" class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {{ product.badge }}
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-b2b-gray-900 mb-2">{{ product.name }}</h3>
                <p class="text-sm text-b2b-gray-600 mb-3">{{ product.description }}</p>
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-green-600 text-xs">● available</span>
                </div>
                <button class="w-full border border-b2b-300 text-b2b-600 py-2 rounded hover:bg-b2b-50 transition-colors text-sm font-medium">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Special Offers -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 font-['Poppins']">Current special offers</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div *ngFor="let offer of specialOffers" class="bg-white rounded-lg border border-b2b-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div class="aspect-square bg-b2b-gray-100 relative">
                <img [src]="offer.image" [alt]="offer.name" class="w-full h-full object-cover">
                <div *ngIf="offer.badge" class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {{ offer.badge }}
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-b2b-gray-900 mb-2">{{ offer.name }}</h3>
                <p class="text-sm text-b2b-gray-600 mb-3">{{ offer.description }}</p>
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-green-600 text-xs">● available</span>
                </div>
                <button class="w-full border border-b2b-300 text-b2b-600 py-2 rounded hover:bg-b2b-50 transition-colors text-sm font-medium">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="py-16 bg-b2b-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 text-center font-['Poppins']">Categories</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div *ngFor="let category of categories" class="text-center group cursor-pointer">
              <div class="w-20 h-20 mx-auto mb-4 bg-b2b-100 rounded-full flex items-center justify-center group-hover:bg-b2b-200 transition-colors">
                <div [innerHTML]="category.icon" class="w-8 h-8 text-b2b-600"></div>
              </div>
              <h3 class="font-medium text-b2b-gray-900">{{ category.name }}</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- Our Brands -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 font-['Poppins']">Our brands</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div *ngFor="let brand of brands" class="relative rounded-2xl overflow-hidden h-64">
              <img [src]="brand.image" [alt]="brand.name" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div class="text-center text-white">
                  <h3 class="text-2xl font-bold mb-2">{{ brand.name }}</h3>
                  <p class="text-sm">{{ brand.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-b2b-600">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-6 font-['Poppins']">Ready to partner with us?</h2>
          <p class="text-xl text-white/90 mb-8 font-['DM_Sans']">Join thousands of partners worldwide and grow your solar business with IBC SOLAR</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-b2b-600 px-8 py-4 rounded-lg font-semibold hover:bg-b2b-50 transition-all">
              Become a Partner
            </button>
            <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class PartnersComponent implements OnInit {

    currentHighlights = [
        {
            name: 'IBC MonoSol 440 MS HAL+ (BF)',
            description: '440W Monocrystalline Solar Panel',
            image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop',
            badge: 'NEW'
        },
        {
            name: 'SMA Sunny Tripower 20.0 / 25.0',
            description: 'Three-phase Solar Inverter',
            image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop',
            badge: null
        },
        {
            name: 'IBC TopFix 200 eco',
            description: 'Roof Mounting System',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
            badge: null
        },
        {
            name: 'IBC Module Micro 450 IQ7+',
            description: 'Microinverter System',
            image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop',
            badge: null
        }
    ];

    specialOffers = [
        {
            name: 'IBC MonoSol 440 MS HAL+ 120pcs Promo',
            description: 'Special bulk pricing for 120 panels',
            image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=300&fit=crop',
            badge: 'SALE'
        },
        {
            name: 'SMA Maintenance Kit 20.0',
            description: 'Complete maintenance solution',
            image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop',
            badge: null
        },
        {
            name: 'IBC Complete PLZ+ SOLO Compact',
            description: 'Complete solar system package',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
            badge: 'HOT'
        },
        {
            name: 'IBC MonoSol Transparent 190 IQ7+',
            description: 'Transparent solar panel solution',
            image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=300&fit=crop',
            badge: null
        }
    ];

    categories = [
        {
            name: 'PV modules',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>'
        },
        {
            name: 'Inverters',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>'
        },
        {
            name: 'Storage',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v4h16V6H4zm0 6v6h16v-6H4z"/></svg>'
        },
        {
            name: 'Mounting systems',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v2H4V4zm0 14h16v2H4v-2zm5-7l3-3 3 3-3 3-3-3z"/></svg>'
        },
        {
            name: 'Accessories',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        },
        {
            name: 'E-Mobility',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>'
        },
        {
            name: 'Deals',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
        },
        {
            name: 'Promotion',
            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>'
        }
    ];

    brands = [
        {
            name: 'FRONIUS',
            description: 'Premium inverter solutions',
            image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop'
        },
        {
            name: 'GOODWE',
            description: 'Reliable solar technology',
            image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=300&fit=crop'
        },
        {
            name: 'HUAWEI',
            description: 'Smart energy solutions',
            image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=500&h=300&fit=crop'
        }
    ];

    ngOnInit(): void {
        // Component initialization
    }
} 