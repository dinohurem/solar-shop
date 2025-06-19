import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partners-cta',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="py-16 bg-b2b-600 text-center">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white mb-6 font-['Poppins']">{{ 'b2bFooter.readyToPartner' | translate }}</h2>
        <p class="text-xl text-white/90 mb-8 font-['DM_Sans']">{{ 'b2bFooter.joinThousands' | translate }}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="bg-white text-b2b-600 px-8 py-4 rounded-lg font-semibold hover:bg-b2b-50 transition-all" (click)="navigateToRegister()">
            {{ 'b2bFooter.becomePartner' | translate }}
          </button>
          <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all" (click)="navigateToContactSales()">
            {{ 'b2bFooter.contactSales' | translate }}
          </button>
        </div>
      </div>
    </section>
  `,
})
export class PartnersCtaComponent {
  private router = inject(Router);

  navigateToRegister() {
    this.router.navigate(['/partners/register']);
  }

  navigateToContactSales() {
    this.router.navigate(['/partners/contact']);
  }
}
