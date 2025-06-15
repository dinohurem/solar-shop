import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-partners-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 bg-b2b-gray-50" *ngIf="categories.length">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 text-center font-['Poppins']">Categories</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div *ngFor="let category of categories" class="text-center group cursor-pointer">
            <div class="w-20 h-20 mx-auto mb-4 bg-b2b-100 rounded-full flex items-center justify-center group-hover:bg-b2b-200 transition-colors">
              <img [src]="category.image_url" class="w-8 h-8" *ngIf="category.image_url">
            </div>
            <h3 class="font-medium text-b2b-gray-900">{{ category.name }}</h3>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PartnersCategoriesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  categories: any[] = [];

  async ngOnInit() {
    try {
      this.categories = await this.supabase.getCategories();
    } catch (err) {
      console.error('Error loading categories', err);
      this.categories = [];
    }
  }
}
