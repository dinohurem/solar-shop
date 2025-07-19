import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  icon: string;
  productCount?: number;
}

@Component({
  selector: 'app-partners-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <section class="py-16 bg-b2b-gray-50" *ngIf="categories.length">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 text-center font-['Poppins']">{{ 'b2b.products.productCategories' | translate }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div *ngFor="let category of categories" 
               (click)="navigateToProducts(category.slug)"
               class="text-center group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
            
            <!-- Category Icon/Image Container -->
            <div class="relative w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-solar-100 to-solar-200 rounded-full flex items-center justify-center group-hover:from-solar-200 group-hover:to-solar-300 transition-all duration-300 shadow-lg">
              
              <!-- Category Icon -->
              <div class="text-solar-600 group-hover:text-solar-700 transition-colors duration-300" [innerHTML]="getCategoryIcon(category.icon)">
              </div>
              
              <!-- Product Count Badge -->
              <div *ngIf="category.productCount" 
                   class="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                {{ category.productCount }}
              </div>
            </div>
            
            <!-- Category Name -->
            <h3 class="font-semibold text-b2b-gray-900 group-hover:text-solar-600 transition-colors duration-300 font-['Poppins']">
              {{ category.name }}
            </h3>
            
            <!-- Hover Indicator -->
            <div class="mt-2 w-0 group-hover:w-8 h-1 bg-solar-500 mx-auto transition-all duration-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PartnersCategoriesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  categories: CategoryItem[] = [];

  // Sample categories data with icons
  private sampleCategories: CategoryItem[] = [
    {
      id: '1',
      name: 'Solar Panels',
      slug: 'solar-panels',
      imageUrl: '',
      icon: 'solar-panel',
      productCount: 24
    },
    {
      id: '2',
      name: 'Inverters',
      slug: 'inverters',
      imageUrl: '',
      icon: 'inverter',
      productCount: 12
    },
    {
      id: '3',
      name: 'Batteries',
      slug: 'batteries',
      imageUrl: '',
      icon: 'battery',
      productCount: 8
    },
    {
      id: '4',
      name: 'Mounting Systems',
      slug: 'mounting',
      imageUrl: '',
      icon: 'mounting',
      productCount: 15
    },
    {
      id: '5',
      name: 'Monitoring',
      slug: 'accessories',
      imageUrl: '',
      icon: 'monitoring',
      productCount: 6
    },
    {
      id: '6',
      name: 'Cables & Wiring',
      slug: 'cables',
      imageUrl: '',
      icon: 'cables',
      productCount: 18
    },
    {
      id: '7',
      name: 'Tools & Equipment',
      slug: 'tools',
      imageUrl: '',
      icon: 'tools',
      productCount: 9
    },
    {
      id: '8',
      name: 'Safety Equipment',
      slug: 'safety',
      imageUrl: '',
      icon: 'safety',
      productCount: 7
    }
  ];

  private sanitizer = inject(DomSanitizer);

  async ngOnInit() {
    try {
      // Try to load categories from database
      const dbCategories = await this.supabase.getCategories();
      if (dbCategories && dbCategories.length > 0) {
        // Map database categories to our interface and limit to 8
        this.categories = dbCategories
          .slice(0, 8)
          .map((cat: any, index: number) => ({
            id: cat.id || `cat-${index}`,
            name: cat.name || `Category ${index + 1}`,
            slug: this.createSlug(cat.name || `category-${index}`),
            imageUrl: cat.image_url || '',
            icon: this.getIconForCategory(cat.name || ''),
            productCount: cat.product_count || Math.floor(Math.random() * 25) + 5
          }));
      }
    } catch (err) {
      console.warn('Categories table not found in database. Using sample data as placeholder.');
    }

    // If no database categories or error, use sample data
    if (this.categories.length === 0) {
      this.categories = this.sampleCategories.slice(0, 8);
    }
  }

  navigateToProducts(categorySlug: string): void {
    // Navigate to products page with category filter applied
    this.router.navigate(['/partneri/proizvodi'], {
      queryParams: { category: categorySlug }
    });
  }

  getCategoryIcon(iconType: string): SafeHtml {
    const icons: { [key: string]: string } = {
      'solar-panel': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="2" stroke-width="2"/>
          <rect x="4" y="4" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="10" y="4" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="16" y="4" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="4" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="16" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="4" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="10" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
          <rect x="16" y="16" width="4" height="4" rx="0.5" fill="currentColor"/>
        </svg>
      `,
      'inverter': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="2"/>
          <circle cx="7" cy="9" r="1" fill="currentColor"/>
          <circle cx="7" cy="15" r="1" fill="currentColor"/>
          <rect x="11" y="8" width="8" height="2" rx="1" fill="currentColor"/>
          <rect x="11" y="14" width="6" height="2" rx="1" fill="currentColor"/>
          <path d="M9 12l2-2v4l-2-2z" stroke-width="2"/>
        </svg>
      `,
      'battery': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="7" width="12" height="10" rx="2" stroke-width="2"/>
          <path d="M17 9v6" stroke-width="2"/>
          <path d="M7 10v4" stroke-width="2"/>
          <path d="M10 10v4" stroke-width="2"/>
        </svg>
      `,
      'mounting': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M3 21h18" stroke-width="2"/>
          <path d="M5 21V7l5-4 5 4v14" stroke-width="2"/>
          <path d="M9 9h6" stroke-width="2"/>
          <path d="M9 12h6" stroke-width="2"/>
          <path d="M9 15h6" stroke-width="2"/>
        </svg>
      `,
      'monitoring': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2"/>
          <path d="M8 21h8" stroke-width="2"/>
          <path d="M12 17v4" stroke-width="2"/>
          <path d="M7 8l3 3 3-3 3 3" stroke-width="2"/>
        </svg>
      `,
      'cables': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16" stroke-width="2"/>
          <path d="M4 10h16" stroke-width="2"/>
          <path d="M4 14h16" stroke-width="2"/>
          <path d="M4 18h16" stroke-width="2"/>
          <circle cx="6" cy="8" r="1" fill="currentColor"/>
          <circle cx="6" cy="12" r="1" fill="currentColor"/>
          <circle cx="6" cy="16" r="1" fill="currentColor"/>
          <circle cx="18" cy="8" r="1" fill="currentColor"/>
          <circle cx="18" cy="12" r="1" fill="currentColor"/>
          <circle cx="18" cy="16" r="1" fill="currentColor"/>
        </svg>
      `,
      'tools': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke-width="2"/>
        </svg>
      `,
      'safety': `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
          <path d="M9 12l2 2 4-4" stroke-width="2"/>
        </svg>
      `
    };

    const iconSvg = icons[iconType] || icons['solar-panel'];
    return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }

  private createSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private getIconForCategory(categoryName: string): string {
    const name = categoryName.toLowerCase();
    if (name.includes('solar') || name.includes('panel')) return 'solar-panel';
    if (name.includes('inverter')) return 'inverter';
    if (name.includes('battery') || name.includes('storage')) return 'battery';
    if (name.includes('mount') || name.includes('rack')) return 'mounting';
    if (name.includes('monitor') || name.includes('accessory')) return 'monitoring';
    if (name.includes('cable') || name.includes('wire')) return 'cables';
    if (name.includes('tool') || name.includes('equipment')) return 'tools';
    if (name.includes('safety') || name.includes('protection')) return 'safety';
    return 'solar-panel';
  }
}
