import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partners-cta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 bg-b2b-600 text-center">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white mb-6 font-['Poppins']">Ready to partner with us?</h2>
        <p class="text-xl text-white/90 mb-8 font-['DM_Sans']">Join thousands of partners worldwide and grow your solar business with IBC SOLAR</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button class="bg-white text-b2b-600 px-8 py-4 rounded-lg font-semibold hover:bg-b2b-50 transition-all">
            Become a Partner
          </button>
          <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  `,
})
export class PartnersCtaComponent {}
