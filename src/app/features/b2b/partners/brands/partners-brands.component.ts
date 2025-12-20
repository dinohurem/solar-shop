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
        <h2 class="text-3xl font-bold text-b2b-gray-900 mb-12 font-['Poppins'] text-center">{{ 'b2b.products.ourBrands' | translate }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div *ngFor="let brand of brands" class="rounded-2xl overflow-hidden h-64">
            <img [src]="brand.image" [alt]="brand.name" class="w-full h-full object-contain bg-white p-4">
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
      image: 'assets/images/fronius.jpeg'
    },
    {
      name: 'GOODWE',
      descriptionKey: 'b2b.products.reliableSolarTechnology',
      image: 'assets/images/goodwe.jpeg'
    },
    {
      name: 'HUAWEI',
      descriptionKey: 'b2b.products.smartEnergySolutions',
      image: 'assets/images/huawei.jpeg'
    }
  ];
}
