import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-partners-hero',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="relative bg-gradient-to-br from-b2b-600 to-b2b-800 py-24 text-center">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  `,
})
export class PartnersHeroComponent {}
