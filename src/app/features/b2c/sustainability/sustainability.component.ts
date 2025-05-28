import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SustainabilityActions } from './store/sustainability.actions';
import { selectFeatures } from './store/sustainability.selectors';
import { Router } from '@angular/router';

export interface SustainabilityFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-sustainability',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Sustainability Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F8F9FA] to-[#E8F5E8]">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Hero Image -->
          <div class="relative order-2 lg:order-1">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Sustainable Energy Solutions with Wind Turbines and Solar Panels" 
                class="w-full h-[400px] object-cover"
              >
              <!-- Overlay gradient -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          <!-- Features Grid -->
          <div class="order-1 lg:order-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Energy Efficiency Suggestions -->
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="w-12 h-12 mb-4 rounded-full bg-[#0ACF83] flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-[#222529] mb-3 font-['Poppins']">
                  Energy Efficiency Suggestions
                </h3>
                <p class="text-[#324053] text-sm leading-relaxed font-['DM_Sans']">
                  Guides for thermal insulation, consumption reduction, and renewable energy systems.
                </p>
              </div>

              <!-- Green Certifications -->
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="w-12 h-12 mb-4 rounded-full bg-[#0ACF83] flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-[#222529] mb-3 font-['Poppins']">
                  Green Certifications & Standards
                </h3>
                <p class="text-[#324053] text-sm leading-relaxed font-['DM_Sans']">
                  Overview of certifications (LEED, ISO 14001, etc.)
                </p>
              </div>

              <!-- Reduced Environmental Impact Products -->
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="w-12 h-12 mb-4 rounded-full bg-[#0ACF83] flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-[#222529] mb-3 font-['Poppins']">
                  Reduced Environmental Impact Products
                </h3>
                <p class="text-[#324053] text-sm leading-relaxed font-['DM_Sans']">
                  Selection of solutions focused on sustainability and recyclability.
                </p>
              </div>

              <!-- Sustainable Materials -->
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="w-12 h-12 mb-4 rounded-full bg-[#0ACF83] flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-[#222529] mb-3 font-['Poppins']">
                  Sustainable Materials
                </h3>
                <p class="text-[#324053] text-sm leading-relaxed font-['DM_Sans']">
                  Certified low-impact products.
                </p>
              </div>
            </div>

            <!-- CTA Button -->
            <div class="mt-8 text-center sm:text-left">
              <button 
                (click)="navigateToSustainability()" 
                class="bg-[#0ACF83] text-white font-semibold text-lg px-8 py-4 rounded-xl hover:bg-[#09b574] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-['DM_Sans']">
                Towards Sustainability
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    
    :host {
      display: block;
    }
  `]
})
export class SustainabilityComponent implements OnInit {
  private store = inject(Store);

  features$: Observable<SustainabilityFeature[]>;

  constructor(private router: Router) {
    this.features$ = this.store.select(selectFeatures);
  }

  ngOnInit(): void {
    this.store.dispatch(SustainabilityActions.loadFeatures());
  }

  trackByFeatureId(index: number, feature: SustainabilityFeature): string {
    return feature.id;
  }

  navigateToMission() {
    this.router.navigate(['/mission']);
  }

  navigateToSustainability() {
    this.router.navigate(['/mission']);
  }
} 