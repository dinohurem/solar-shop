import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HeroActions } from './store/hero.actions';
import { selectIsLoading } from './store/hero.selectors';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Hero Section -->
    <section class="relative min-h-screen overflow-hidden">
      <!-- Background with rounded bottom -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#0B8F5C] to-[#044741]">
        <!-- Background Image -->
        <img 
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Sustainable Building Materials" 
          class="w-full h-full object-cover opacity-20"
        >
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#0B8F5C]/80 to-[#044741]/80"></div>
      </div>

      <!-- Rounded bottom shape -->
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-[40px]"></div>

      <!-- Content Container -->
      <div class="relative z-10 flex flex-col min-h-screen justify-center px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Main Heading -->
          <h1 class="text-white font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6 font-['Poppins']">
            {{ 'hero.mainTitle' | translate }}
          </h1>
          
          <!-- Subtitle -->
          <p class="text-white text-lg sm:text-xl lg:text-2xl leading-relaxed mb-12 font-['DM_Sans'] opacity-90 max-w-3xl mx-auto">
            {{ 'hero.subtitle' | translate }}
          </p>
          
          <!-- CTA Button -->
          <button 
            (click)="onExploreProducts()"
            [disabled]="isLoading$ | async"
            class="bg-[#0ACF83] text-white font-semibold text-lg px-10 py-4 rounded-xl hover:bg-[#09b574] transition-all duration-300 font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span *ngIf="!(isLoading$ | async)">{{ 'hero.exploreProducts' | translate }}</span>
            <span *ngIf="isLoading$ | async" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ 'hero.loading' | translate }}
            </span>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      display: block;
    }
  `]
})
export class HeroComponent implements OnInit {
  private store = inject(Store);

  isLoading$: Observable<boolean>;

  constructor(private router: Router) {
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(HeroActions.initializeHero());
  }

  onExploreProducts(): void {
    // this.store.dispatch(HeroActions.exploreProducts());

    this.router.navigate(['/products']);
  }
} 