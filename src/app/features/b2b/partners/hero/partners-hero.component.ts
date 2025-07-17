import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, switchMap, from, catchError, of } from 'rxjs';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../../services/supabase.service';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';

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
          <!-- Buttons for authenticated company users -->
          <ng-container *ngIf="isCompanyContact$ | async">
            <button (click)="navigateToProducts()" class="bg-white text-b2b-600 px-8 py-4 rounded-lg font-semibold hover:bg-b2b-50 transition-all">
              {{ 'b2b.products.title' | translate }}
            </button>
            <button (click)="navigateToOffers()" class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
              {{ 'b2b.offers.title' | translate }}
            </button>
          </ng-container>
          
          <!-- Default buttons for non-authenticated users -->
          <ng-container *ngIf="!(isCompanyContact$ | async)">
            <button (click)="navigateToRegister()" class="bg-white text-b2b-600 px-8 py-4 rounded-lg font-semibold hover:bg-b2b-50 transition-all">
              {{ 'b2b.hero.getStarted' | translate }}
            </button>
            <button (click)="navigateToAbout()" class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
              {{ 'b2b.hero.learnMore' | translate }}
            </button>
          </ng-container>
        </div>
      </div>
    </section>
  `,
})
export class PartnersHeroComponent implements OnInit {
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);

  isCompanyContact$: Observable<boolean>;

  constructor() {
    // Initialize the observable to check if user is a company contact
    this.isCompanyContact$ = this.store.select(selectCurrentUser).pipe(
      switchMap(user => {
        if (!user?.id) {
          return of(false);
        }

        // Check if user is a company contact person
        return from(
          this.supabaseService.client
            .from('companies')
            .select('id, status')
            .eq('contact_person_id', user.id)
            .eq('status', 'approved')
            .single()
        ).pipe(
          catchError(() => of({ data: null, error: true })),
          switchMap(result => of(!!result.data))
        );
      })
    );
  }

  ngOnInit(): void {
    // Component initialization if needed
  }

  navigateToRegister(): void {
    this.router.navigate(['/partneri/registracija']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/partneri/o-nama']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/partneri/proizvodi']);
  }

  navigateToOffers(): void {
    this.router.navigate(['/partneri/ponude']);
  }
}
