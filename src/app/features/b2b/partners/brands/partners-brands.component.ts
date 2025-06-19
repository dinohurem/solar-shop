import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-partners-brands',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 font-['Poppins']">{{ 'b2b.products.ourBrands' | translate }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div *ngFor="let brand of brands" class="relative rounded-2xl overflow-hidden h-64">
            <img [src]="brand.image" [alt]="brand.name" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div class="text-center text-white">
                <h3 class="text-2xl font-bold mb-2">{{ brand.name }}</h3>
                <p class="text-sm">{{ brand.descriptionKey | translate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PartnersBrandsComponent {
  brands = [
    {
      name: 'FRONIUS',
      descriptionKey: 'b2b.products.premiumInverterSolutions',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop'
    },
    {
      name: 'GOODWE',
      descriptionKey: 'b2b.products.reliableSolarTechnology',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=300&fit=crop'
    },
    {
      name: 'HUAWEI',
      descriptionKey: 'b2b.products.smartEnergySolutions',
      image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=500&h=300&fit=crop'
    }
  ];
}
