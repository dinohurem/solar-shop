import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-partners-highlights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 bg-b2b-gray-50" *ngIf="highlights.length">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 font-['Poppins']">Current Highlights</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div *ngFor="let product of highlights" class="bg-white rounded-lg border border-b2b-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div class="aspect-square bg-b2b-gray-100 relative">
              <img [src]="product.image_url" [alt]="product.name" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-b2b-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-sm text-b2b-gray-600 mb-3">{{ product.short_description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PartnersHighlightsComponent implements OnInit {
  private supabase = inject(SupabaseService);
  highlights: any[] = [];

  async ngOnInit() {
    try {
      this.highlights = await this.supabase.getProducts({ featured: true, limit: 4 });
    } catch (err) {
      console.error('Error loading highlights', err);
      this.highlights = [];
    }
  }
}
