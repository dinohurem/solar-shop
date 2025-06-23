import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

interface HighlightOffer {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  type: string;
  status: string;
  featured: boolean;
  isB2B: boolean;
  endDate?: string;
}

@Component({
  selector: 'app-partners-highlights',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <section class="py-16 bg-b2b-gray-50" *ngIf="highlights.length">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 font-['Poppins'] text-center">
          {{ 'b2b.offers.currentHighlights' | translate }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div *ngFor="let offer of highlights" 
               (click)="navigateToOffer(offer.id)"
               class="bg-white rounded-lg border border-b2b-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            
            <!-- Offer Image -->
            <div class="aspect-square bg-b2b-gray-100 relative">
              <img [src]="offer.imageUrl" [alt]="offer.title" 
                   class="w-full h-full object-cover">
              
              <!-- Featured Badge -->
              <div *ngIf="offer.featured" class="absolute top-3 left-3">
                <span class="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span>Featured</span>
                </span>
              </div>
              
              <!-- Discount Badge -->
              <div class="absolute top-3 right-3">
                <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{{ offer.discountPercentage }}%
                </span>
              </div>
              
              <!-- Partner Only Badge -->
              <div class="absolute bottom-3 left-3">
                <span class="bg-solar-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Partner Only
                </span>
              </div>
            </div>
            
            <!-- Offer Content -->
            <div class="p-4">
              <h3 class="font-semibold text-b2b-gray-900 mb-2 line-clamp-2">{{ offer.title }}</h3>
              <p class="text-sm text-b2b-gray-600 mb-3 line-clamp-2">{{ offer.shortDescription }}</p>
              
              <!-- Pricing -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-lg font-bold text-solar-600">
                    €{{ offer.discountedPrice | number:'1.0-0' }}
                  </span>
                  <span class="text-sm text-gray-500 line-through">
                    €{{ offer.originalPrice | number:'1.0-0' }}
                  </span>
                </div>
                <div class="text-xs text-green-600 font-medium">
                  Save €{{ (offer.originalPrice - offer.discountedPrice) | number:'1.0-0' }}
                </div>
              </div>
              
              <!-- Expiry Warning -->
              <div *ngIf="offer.endDate && isOfferEndingSoon(offer.endDate)" 
                   class="mt-3 text-xs text-red-600 font-medium flex items-center space-x-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span>Ending soon!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
export class PartnersHighlightsComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  highlights: HighlightOffer[] = [];

  async ngOnInit() {
    await this.loadB2BOffers();
  }

  private async loadB2BOffers() {
    try {
      // Try to load B2B offers from database using the dedicated method
      const offers = await this.supabase.getB2BOffers({ limit: 4 });

      if (offers && offers.length > 0) {
        this.highlights = offers.map((offer: any) => ({
          id: offer.id,
          title: offer.title,
          description: offer.description || '',
          shortDescription: offer.short_description || offer.description || '',
          imageUrl: offer.image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
          originalPrice: offer.original_price || 0,
          discountedPrice: offer.discounted_price || 0,
          discountPercentage: offer.discount_value || 0,
          type: offer.type || 'general',
          status: offer.status || 'active',
          featured: offer.featured || false,
          isB2B: offer.is_b2b || false,
          endDate: offer.end_date
        }));
      } else {
        console.warn('No B2B offers found in database. Using fallback sample data.');
      }
    } catch (error) {
      console.warn('Error loading B2B offers from database:', error);
      console.warn('Using fallback sample data. Please ensure the offers table exists and the migration 007_add_is_b2b_to_offers.sql has been run.');
    }
  }

  navigateToOffer(offerId: string): void {
    this.router.navigate(['/partners/offers', offerId]);
  }

  isOfferEndingSoon(endDate: string): boolean {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilEnd = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  }
}
