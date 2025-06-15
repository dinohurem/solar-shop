import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartnersHeroComponent } from './hero/partners-hero.component';
import { PartnersHighlightsComponent } from './highlights/partners-highlights.component';
import { PartnersCategoriesComponent } from './categories/partners-categories.component';
import { PartnersBrandsComponent } from './brands/partners-brands.component';
import { PartnersCtaComponent } from './cta/partners-cta.component';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, RouterModule, PartnersHeroComponent, PartnersHighlightsComponent, PartnersCategoriesComponent, PartnersBrandsComponent, PartnersCtaComponent],
  template: `
    <div class="min-h-screen bg-b2b-gray-50">
      <app-partners-hero></app-partners-hero>
      <app-partners-highlights></app-partners-highlights>
      <app-partners-categories></app-partners-categories>
      <app-partners-brands></app-partners-brands>
      <app-partners-cta></app-partners-cta>
    </div>
  `,
})
export class PartnersComponent {}
