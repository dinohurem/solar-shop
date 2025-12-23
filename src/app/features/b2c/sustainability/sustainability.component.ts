import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SustainabilityActions } from './store/sustainability.actions';
import { selectFeatures } from './store/sustainability.selectors';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

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
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Sustainability Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-solar-50">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Hero Image -->
          <div class="relative order-2 lg:order-1">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="assets/images/sustain.jpeg" 
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
                <div class="w-12 h-12 mb-4 rounded-full bg-solar-500 flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <!-- Inverter icon -->
                    <rect x="3" y="6" width="18" height="12" rx="2" stroke-width="2"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10v4M12 9v6M17 10v4"/>
                    <path stroke-linecap="round" stroke-width="2" d="M8 3v3M16 3v3M8 18v3M16 18v3"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-3 font-['Poppins']">
                  {{ 'sustainability.energyEfficiencySuggestions' | translate }}
                </h3>
                <p class="text-gray-600 text-sm leading-relaxed font-['DM_Sans']">
                  {{ 'sustainability.energyEfficiencySuggestionsText' | translate }}
                </p>
              </div>

              <!-- Green Certifications -->
              <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="w-12 h-12 mb-4 rounded-full bg-solar-500 flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <!-- AC Unit icon -->
                    <rect x="2" y="4" width="20" height="12" rx="2" stroke-width="2"/>
                    <path stroke-linecap="round" stroke-width="2" d="M6 20v-4M12 20v-4M18 20v-4"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 10h12"/>
                    <circle cx="16" cy="10" r="1.5" stroke-width="1.5"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-3 font-['Poppins']">
                  {{ 'sustainability.greenCertifications' | translate }}
                </h3>
                <p class="text-gray-600 text-sm leading-relaxed font-['DM_Sans']">
                  {{ 'sustainability.greenCertificationsText' | translate }}
                </p>
              </div>
              
            </div>

          </div>
        </div>
        
        <!-- CTA Button - Centered on full screen width -->
        <div class="mt-12 text-center">
          <button 
            (click)="navigateToSustainability()" 
            class="inline-flex items-center gap-2 bg-solar-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-solar-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-['DM_Sans'] whitespace-nowrap">
            {{ 'sustainability.towardsSustainability' | translate }}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    
    
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
    this.router.navigate(['/misija']);
  }

  navigateToSustainability() {
    this.router.navigate(['/tvrtka']);
  }
} 