import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CategoriesService, ProductCategory } from './services/categories.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Products Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-heyhome-dark-green font-['Poppins'] mb-4">
            {{ 'products.title' | translate }}
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'products.subtitle' | translate }}
          </p>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let category of productCategories$ | async; trackBy: trackByCategoryId"
            class="flex flex-col gap-4"
          >
            <!-- Main Category Card -->
            <div 
              class="relative h-[500px] rounded-3xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              (click)="navigateToProductList(category)"
            >
              <!-- Background Image -->
              <div class="absolute inset-0">
                <img 
                  [src]="category.imageUrl" 
                  [alt]="category.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                >
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>

              <!-- Content -->
              <div class="relative z-10 h-full flex flex-col justify-end p-8">
                <div class="text-white">
                  <h3 class="text-3xl font-bold mb-4 font-['Poppins'] group-hover:text-solar-300 transition-colors duration-300">
                    {{ category.name }}
                  </h3>
                  
                  <p class="text-base leading-relaxed mb-6 opacity-90 font-['DM_Sans'] line-clamp-3">
                    {{ category.description || ('Explore our ' + category.name.toLowerCase() + ' collection') }}
                  </p>

                  <!-- Product Count Badge -->
                  <div class="mb-4">
                    <span class="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
                      {{ 'products.productsCount' | translate:{ count: (category.productCount || 0) } }}
                    </span>
                  </div>
                  
                  <!-- Learn More Button -->
                  <button 
                    class="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-solar-500 transition-all duration-300 group-hover:bg-solar-500 border border-white/30"
                    (click)="navigateToProductList(category); $event.stopPropagation()"
                  >
                    <span>{{ 'products.exploreProducts' | translate }}</span>
                    <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Subcategories -->
            <div 
              *ngIf="category.subcategories && category.subcategories.length > 0"
              class="grid grid-cols-1 gap-2"
            >
              <div 
                *ngFor="let subcategory of category.subcategories; trackBy: trackByCategoryId"
                class="bg-white rounded-xl p-4 border border-gray-200 hover:border-solar-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                (click)="navigateToProductList(subcategory)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-solar-600 transition-colors font-['Poppins']">
                      {{ subcategory.name }}
                    </h4>
                    <p class="text-sm text-gray-600 mt-1 font-['DM_Sans']">
                      {{ 'products.productsCount' | translate:{ count: (subcategory.productCount || 0) } }}
                    </p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-solar-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-solar-500 border-t-transparent"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && (productCategories$ | async)?.length === 0" class="text-center py-20">
          <div class="text-gray-400 mb-6">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">{{ 'products.noCategories' | translate }}</h3>
          <p class="text-gray-600 font-['DM_Sans']">{{ 'products.noCategoriesText' | translate }}</p>
        </div>

        <!-- Call to Action -->
        <div class="mt-20 bg-gradient-to-r from-solar-500 to-solar-600 rounded-3xl p-12 text-center text-white">
          <h2 class="text-3xl lg:text-4xl font-bold mb-6 font-['Poppins']">
            {{ 'products.needHelp' | translate }}
          </h2>
          <p class="text-xl mb-8 max-w-2xl mx-auto font-['DM_Sans']">
            {{ 'products.needHelpText' | translate }}
          </p>
          <button 
            (click)="navigateToContact()"
            class="px-8 py-3 bg-white text-solar-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors font-['DM_Sans']"
          >
            {{ 'products.contactExperts' | translate }}
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductsComponent implements OnInit {
  productCategories$!: Observable<ProductCategory[]>;
  isLoading = false;

  constructor(
    private router: Router,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.productCategories$ = this.categoriesService.getNestedCategories();

    // Subscribe to handle loading state
    this.productCategories$.subscribe({
      next: (categories) => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });
  }

  trackByCategoryId(index: number, category: ProductCategory): string {
    return category.id;
  }

  navigateToProductList(category: ProductCategory): void {
    // Navigate to product list with category filter
    // Use slug first, then fallback to name (URL-friendly)
    const categoryParam = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.router.navigate(['/proizvodi'], {
      queryParams: { category: categoryParam }
    });
  }

  navigateToContact(): void {
    this.router.navigate(['/kontakt']);
  }
} 