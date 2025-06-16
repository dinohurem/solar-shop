import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface PartnerProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  sku: string;
  retailPrice: number;
  partnerPrice?: number;
  savings?: number;
  minimumOrder: number;
  inStock: boolean;
  partnerOnly: boolean;
}

@Component({
  selector: 'app-partners-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ 'b2b.products.title' | translate }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 font-['DM_Sans']">
            {{ 'b2b.products.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- Login Required Banner (for non-authenticated users) -->
      <div *ngIf="!isAuthenticated" class="bg-solar-50 border-b border-solar-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <div>
                <p class="text-sm font-medium text-solar-800">
                  {{ 'b2b.products.loginRequired' | translate }}
                </p>
              </div>
            </div>
            <button (click)="navigateToLogin()" 
                    class="bg-solar-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
              {{ 'b2b.products.loginToViewPrices' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Category Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select [(ngModel)]="selectedCategory" (ngModelChange)="filterProducts()" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                <option value="">All Categories</option>
                <option value="solar-panels">Solar Panels</option>
                <option value="inverters">Inverters</option>
                <option value="batteries">Batteries</option>
                <option value="mounting">Mounting Systems</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <!-- Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input [(ngModel)]="searchTerm" (ngModelChange)="filterProducts()" 
                     type="text" placeholder="Search products..." 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
            </div>

            <!-- Availability Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select [(ngModel)]="availabilityFilter" (ngModelChange)="filterProducts()" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                <option value="">All Products</option>
                <option value="in-stock">In Stock</option>
                <option value="partner-only">{{ 'b2b.products.availableForPartners' | translate }}</option>
              </select>
            </div>

            <!-- Sort -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select [(ngModel)]="sortBy" (ngModelChange)="sortProducts()" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Best Savings</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div *ngFor="let product of filteredProducts" 
               class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            
            <!-- Product Image -->
            <div class="aspect-w-16 aspect-h-12 bg-gray-100">
              <img [src]="product.imageUrl" [alt]="product.name" 
                   class="w-full h-48 object-cover">
            </div>

            <!-- Product Info -->
            <div class="p-4">
              <!-- Category & SKU -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {{ product.category }}
                </span>
                <span class="text-xs text-gray-400">{{ product.sku }}</span>
              </div>

              <!-- Product Name -->
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins'] line-clamp-2">
                {{ product.name }}
              </h3>

              <!-- Description -->
              <p class="text-sm text-gray-600 mb-4 line-clamp-2 font-['DM_Sans']">
                {{ product.description }}
              </p>

              <!-- Pricing Section -->
              <div class="mb-4">
                <div *ngIf="!isAuthenticated" class="text-center py-4 bg-gray-50 rounded-lg">
                  <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <p class="text-sm text-gray-500 font-medium">
                    {{ 'b2b.products.loginToViewPrices' | translate }}
                  </p>
                </div>

                <div *ngIf="isAuthenticated" class="space-y-2">
                  <!-- Partner Price -->
                  <div *ngIf="product.partnerPrice" class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">{{ 'b2b.products.partnerPrice' | translate }}:</span>
                    <span class="text-lg font-bold text-solar-600">€{{ product.partnerPrice | number:'1.2-2' }}</span>
                  </div>

                  <!-- Retail Price -->
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">{{ 'b2b.products.retailPrice' | translate }}:</span>
                    <span class="text-sm text-gray-500 line-through">€{{ product.retailPrice | number:'1.2-2' }}</span>
                  </div>

                  <!-- Savings -->
                  <div *ngIf="product.savings" class="flex items-center justify-between">
                    <span class="text-sm font-medium text-green-700">{{ 'b2b.products.savings' | translate }}:</span>
                    <span class="text-sm font-bold text-green-600">€{{ product.savings | number:'1.2-2' }}</span>
                  </div>

                  <!-- Contact for Pricing -->
                  <div *ngIf="!product.partnerPrice" class="text-center py-2">
                    <p class="text-sm text-gray-600">{{ 'b2b.products.contactForPricing' | translate }}</p>
                  </div>
                </div>
              </div>

              <!-- Minimum Order -->
              <div class="mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ 'b2b.products.minimumOrder' | translate }}:</span>
                  <span class="font-medium">{{ product.minimumOrder }} {{ 'b2b.products.pieces' | translate }}</span>
                </div>
              </div>

              <!-- Status Badges -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex space-x-2">
                  <span *ngIf="product.inStock" 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    In Stock
                  </span>
                  <span *ngIf="!product.inStock" 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                  <span *ngIf="product.partnerOnly" 
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-solar-100 text-solar-800">
                    {{ 'b2b.products.availableForPartners' | translate }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-2">
                <button *ngIf="isAuthenticated && product.inStock" 
                        (click)="addToCart(product)"
                        class="w-full bg-solar-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
                  Add to Cart
                </button>
                <button *ngIf="isAuthenticated && !product.inStock" 
                        (click)="requestQuote(product)"
                        class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                  Request Quote
                </button>
                <button *ngIf="!isAuthenticated" 
                        (click)="navigateToLogin()"
                        class="w-full bg-solar-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
                  Sign In to Order
                </button>
                <button (click)="viewDetails(product)" 
                        class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Products Found -->
        <div *ngIf="filteredProducts.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p class="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      </div>
    </div>
  `,
})
export class PartnersProductsComponent implements OnInit {
  isAuthenticated = false; // This should be connected to your auth service
  selectedCategory = '';
  searchTerm = '';
  availabilityFilter = '';
  sortBy = 'name';

  allProducts: PartnerProduct[] = [
    {
      id: '1',
      name: 'SolarMax Pro 400W Monocrystalline Panel',
      description: 'High-efficiency monocrystalline solar panel with 21.5% efficiency rating and 25-year warranty.',
      imageUrl: '/assets/images/products/solar-panel-1.jpg',
      category: 'solar-panels',
      sku: 'SM-400-MONO',
      retailPrice: 299.99,
      partnerPrice: 239.99,
      savings: 60.00,
      minimumOrder: 10,
      inStock: true,
      partnerOnly: false
    },
    {
      id: '2',
      name: 'PowerInvert 5000W Hybrid Inverter',
      description: 'Advanced hybrid inverter with battery storage capability and smart grid integration.',
      imageUrl: '/assets/images/products/inverter-1.jpg',
      category: 'inverters',
      sku: 'PI-5000-HYB',
      retailPrice: 1899.99,
      partnerPrice: 1519.99,
      savings: 380.00,
      minimumOrder: 1,
      inStock: true,
      partnerOnly: true
    },
    {
      id: '3',
      name: 'EnergyStore 10kWh Lithium Battery',
      description: 'High-capacity lithium iron phosphate battery system with 6000+ cycle life.',
      imageUrl: '/assets/images/products/battery-1.jpg',
      category: 'batteries',
      sku: 'ES-10KWH-LFP',
      retailPrice: 4999.99,
      partnerPrice: 3999.99,
      savings: 1000.00,
      minimumOrder: 1,
      inStock: false,
      partnerOnly: true
    },
    {
      id: '4',
      name: 'SecureMount Roof Mounting System',
      description: 'Universal roof mounting system compatible with most panel types and roof materials.',
      imageUrl: '/assets/images/products/mounting-1.jpg',
      category: 'mounting',
      sku: 'SM-ROOF-UNI',
      retailPrice: 149.99,
      partnerPrice: 119.99,
      savings: 30.00,
      minimumOrder: 5,
      inStock: true,
      partnerOnly: false
    },
    {
      id: '5',
      name: 'SmartMonitor Energy Management System',
      description: 'Real-time energy monitoring and management system with mobile app integration.',
      imageUrl: '/assets/images/products/monitor-1.jpg',
      category: 'accessories',
      sku: 'SM-EMS-001',
      retailPrice: 599.99,
      partnerPrice: 479.99,
      savings: 120.00,
      minimumOrder: 1,
      inStock: true,
      partnerOnly: false
    },
    {
      id: '6',
      name: 'Industrial Grade 600W Panel',
      description: 'Heavy-duty solar panel designed for commercial and industrial applications.',
      imageUrl: '/assets/images/products/solar-panel-2.jpg',
      category: 'solar-panels',
      sku: 'IG-600-COMM',
      retailPrice: 449.99,
      partnerPrice: undefined, // Contact for pricing
      savings: undefined,
      minimumOrder: 20,
      inStock: true,
      partnerOnly: true
    }
  ];

  filteredProducts: PartnerProduct[] = [];

  constructor(private router: Router) {
    // TODO: Connect to auth service
    // this.authService.isAuthenticated$.subscribe(isAuth => this.isAuthenticated = isAuth);
  }

  ngOnInit(): void {
    this.filteredProducts = [...this.allProducts];
  }

  filterProducts(): void {
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesAvailability = !this.availabilityFilter ||
        (this.availabilityFilter === 'in-stock' && product.inStock) ||
        (this.availabilityFilter === 'partner-only' && product.partnerOnly);

      return matchesCategory && matchesSearch && matchesAvailability;
    });

    this.sortProducts();
  }

  sortProducts(): void {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          const priceA = a.partnerPrice || a.retailPrice;
          const priceB = b.partnerPrice || b.retailPrice;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = a.partnerPrice || a.retailPrice;
          const priceB2 = b.partnerPrice || b.retailPrice;
          return priceB2 - priceA2;
        case 'savings':
          return (b.savings || 0) - (a.savings || 0);
        default:
          return 0;
      }
    });
  }

  navigateToLogin(): void {
    // Navigate to login page
    window.location.href = '/login';
  }

  addToCart(product: PartnerProduct): void {
    console.log('Adding to cart:', product);
    // TODO: Implement add to cart functionality
  }

  requestQuote(product: PartnerProduct): void {
    console.log('Requesting quote for:', product);
    // TODO: Implement quote request functionality
  }

  viewDetails(product: PartnerProduct): void {
    // Navigate to product details with company pricing flag
    this.router.navigate(['/products', product.id], {
      queryParams: { companyPricing: true }
    });
  }
} 