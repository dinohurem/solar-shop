import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { SupabaseService } from '../../../../services/supabase.service';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { selectB2BCartTotalItems } from '../../cart/store/b2b-cart.selectors';
import * as B2BCartActions from '../../cart/store/b2b-cart.actions';
import { Subject, takeUntil, switchMap, from, catchError, of } from 'rxjs';

@Component({
  selector: 'app-b2b-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center">
            <a routerLink="/partners" class="flex items-center space-x-3">
              <img 
                src="assets/images/logo.svg" 
                alt="SolarShop" 
                class="h-8 w-auto sm:h-10 lg:h-10 object-contain group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm"
                onerror="console.error('Logo failed to load:', this.src); this.src='assets/images/logo.png'"
              >
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a routerLink="/partners" 
               routerLinkActive="text-solar-600 border-b-2 border-solar-600"
               [routerLinkActiveOptions]="{exact: true}"
               class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium transition-colors">
              {{ 'b2bNav.home' | translate }}
            </a>
            <a routerLink="/partners/products" 
               routerLinkActive="text-solar-600 border-b-2 border-solar-600"
               class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium transition-colors">
              {{ 'b2bNav.products' | translate }}
            </a>
            <a routerLink="/partners/offers" 
               routerLinkActive="text-solar-600 border-b-2 border-solar-600"
               class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium transition-colors">
              {{ 'b2bNav.offers' | translate }}
            </a>
            <a routerLink="/partners/contact" 
               routerLinkActive="text-solar-600 border-b-2 border-solar-600"
               class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium transition-colors">
              {{ 'b2bNav.contact' | translate }}
            </a>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Authentication -->
            <div *ngIf="!isAuthenticated || !isCompanyContact" class="flex items-center space-x-2">
              <a routerLink="/login" 
                 class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium">
                {{ 'b2bNav.signIn' | translate }}
              </a>
              <a routerLink="/partners/register" 
                 class="bg-solar-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors">
                {{ 'b2bNav.getStarted' | translate }}
              </a>
              <div class="h-6 w-px bg-gray-300 mx-2"></div>
              <a routerLink="/" 
                 class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span>{{ 'b2bFooter.backToB2C' | translate }}</span>
              </a>
            </div>

            <!-- User Dropdown (when authenticated and is company contact) -->
            <div *ngIf="isAuthenticated && isCompanyContact" class="flex items-center space-x-4">
              <!-- Cart Button -->
              <button (click)="toggleCart()" 
                      class="relative p-2 text-gray-600 hover:text-solar-600 transition-all duration-300 hover:scale-110 hover:bg-solar-50 rounded-full"
                      [title]="'cart.cart' | translate">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"/>
                </svg>
                <!-- Cart Items Count Badge -->
                <span *ngIf="(cartItemsCount$ | async) && (cartItemsCount$ | async)! > 0" 
                      class="absolute -top-1 -right-1 bg-solar-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[1.25rem]">
                  {{ cartItemsCount$ | async }}
                </span>
              </button>
              
              <div class="relative">
                <button (click)="toggleUserMenu()" 
                        class="p-2 text-gray-600 hover:text-solar-600 transition-all duration-300 hover:scale-110 hover:bg-solar-50 rounded-full">
                  <div class="w-8 h-8 bg-solar-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                </button>
                
                <!-- User Dropdown Menu -->
                <div *ngIf="showUserMenu" 
                     class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200 transform transition-all duration-300 ease-out scale-100 opacity-100">
                  <div class="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <div class="font-semibold text-gray-900">{{ currentUser?.name || ('b2bNav.partner' | translate) }}</div>
                    <div class="text-gray-500 truncate">{{ currentUser?.email }}</div>
                  </div>
                  <a routerLink="/partners/profile" 
                     (click)="closeUserMenu()"
                     class="block px-4 py-3 text-sm text-gray-700 hover:bg-solar-50 hover:text-solar-600 transition-all duration-200">
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span>{{ 'b2bNav.profile' | translate }}</span>
                    </div>
                  </a>
                  <button (click)="signOut()" 
                          class="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-accent-50 hover:text-accent-600 transition-all duration-200 rounded-b-lg">
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>{{ 'b2bNav.signOut' | translate }}</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div class="h-6 w-px bg-gray-300"></div>
              <a routerLink="/" 
                 class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span>{{ 'b2bFooter.backToB2C' | translate }}</span>
              </a>
            </div>

            <!-- Mobile Menu Button -->
            <button (click)="toggleMobileMenu()" 
                    class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-solar-600 hover:bg-gray-100">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                <path *ngIf="showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div *ngIf="showMobileMenu" class="md:hidden border-t border-gray-200">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <a routerLink="/partners" 
               routerLinkActive="bg-solar-50 text-solar-600"
               [routerLinkActiveOptions]="{exact: true}"
               class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
              {{ 'b2bNav.home' | translate }}
            </a>
            <a routerLink="/partners/products" 
               routerLinkActive="bg-solar-50 text-solar-600"
               class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
              {{ 'b2bNav.products' | translate }}
            </a>
            <a routerLink="/partners/offers" 
               routerLinkActive="bg-solar-50 text-solar-600"
               class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
              {{ 'b2bNav.offers' | translate }}
            </a>
            <a routerLink="/partners/contact" 
               routerLinkActive="bg-solar-50 text-solar-600"
               class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
              {{ 'b2bNav.contact' | translate }}
            </a>
            
            <!-- Mobile Auth Section -->
            <div class="border-t border-gray-200 pt-4 mt-4">
              <div *ngIf="!isAuthenticated || !isCompanyContact" class="space-y-2">
                <a routerLink="/login" 
                   class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  {{ 'b2bNav.signIn' | translate }}
                </a>
                <a routerLink="/partners/register" 
                   class="block px-3 py-2 text-base font-medium bg-solar-600 text-white rounded-md hover:bg-solar-700">
                  {{ 'b2bNav.getStarted' | translate }}
                </a>
                <a routerLink="/" 
                   class="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  <span>{{ 'b2bFooter.backToB2C' | translate }}</span>
                </a>
              </div>
              
              <div *ngIf="isAuthenticated && isCompanyContact" class="space-y-2">
                <a routerLink="/partners/profile" 
                   (click)="closeMobileMenu()"
                   class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  {{ 'b2bNav.profile' | translate }}
                </a>
                <a routerLink="/" 
                   (click)="closeMobileMenu()"
                   class="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  <span>{{ 'b2bFooter.backToB2C' | translate }}</span>
                </a>
                <button (click)="signOut()" 
                        class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  {{ 'b2bNav.signOut' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class B2bNavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private supabaseService = inject(SupabaseService);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  showMobileMenu = false;
  showUserMenu = false;
  isAuthenticated = false;
  currentUser: any = null;
  isCompanyContact = false; // Flag to check if user is a company contact person
  company: any = null;

  currentUser$: Observable<any>;
  cartItemsCount$: Observable<number>;

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.cartItemsCount$ = this.store.select(selectB2BCartTotalItems);
  }

  ngOnInit(): void {
    // Initialize authentication state and user data
    this.supabaseService.getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        switchMap(user => {
          this.isAuthenticated = !!user;
          this.currentUser = user;

          if (user?.id) {
            // Check if user is a company contact person
            return from(
              this.supabaseService.client
                .from('companies')
                .select('id, status')
                .eq('contact_person_id', user.id)
                .single()
            ).pipe(
              catchError(() => of({ data: null, error: null }))
            );
          }
          return of({ data: null, error: null });
        })
      )
      .subscribe(({ data }) => {
        this.isCompanyContact = !!data && data.status === 'approved';
        this.company = data;

        // Load cart items if user is company contact
        if (this.isCompanyContact && this.company) {
          this.store.dispatch(B2BCartActions.loadB2BCart({ companyId: this.company.id }));
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showMobileMenu = false;
  }

  signOut(): void {
    this.supabaseService.signOut().then(() => {
      this.showUserMenu = false;
      this.isAuthenticated = false;
      this.isCompanyContact = false;
      this.currentUser = null;
      this.router.navigate(['/partners']);
    });
  }

  toggleCart(): void {
    this.store.dispatch(B2BCartActions.toggleB2BCartSidebar());
  }

  // Close dropdowns when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUserMenu = false;
    }
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
} 