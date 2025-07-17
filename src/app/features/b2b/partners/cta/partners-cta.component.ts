import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';

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
          <button *ngIf="!isAuthenticated" class="bg-white text-b2b-600 px-8 py-4 rounded-lg font-semibold hover:bg-b2b-50 transition-all" (click)="navigateToRegister()">
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
export class PartnersCtaComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  
  isAuthenticated = false;
  currentUser: User | null = null;

  ngOnInit(): void {
    this.store.select(selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = !!user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToRegister() {
    this.router.navigate(['/partneri/register']);
  }

  navigateToContactSales() {
    this.router.navigate(['/partneri/contact']);
  }
}
