import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { Subject, takeUntil } from 'rxjs';

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
            <div *ngIf="!isAuthenticated" class="flex items-center space-x-2">
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

            <!-- User Dropdown (when authenticated) -->
            <div *ngIf="isAuthenticated" class="relative flex items-center space-x-4">
              <div class="h-6 w-px bg-gray-300"></div>
              <a routerLink="/" 
                 class="text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span>{{ 'b2bFooter.backToB2C' | translate }}</span>
              </a>
              <button (click)="toggleUserMenu()" 
                      class="flex items-center space-x-2 text-gray-700 hover:text-solar-600 px-3 py-2 text-sm font-medium">
                <div class="w-8 h-8 bg-solar-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span>{{ currentUser?.name || ('b2bNav.partner' | translate) }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <!-- User Dropdown Menu -->
              <div *ngIf="showUserMenu" 
                   class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1">
                  <a routerLink="/partners/dashboard" 
                     class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {{ 'b2bNav.dashboard' | translate }}
                  </a>
                  <a routerLink="/partners/profile" 
                     class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {{ 'b2bNav.profile' | translate }}
                  </a>
                  <a routerLink="/partners/orders" 
                     class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {{ 'b2bNav.orders' | translate }}
                  </a>
                  <div class="border-t border-gray-100"></div>
                  <button (click)="signOut()" 
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {{ 'b2bNav.signOut' | translate }}
                  </button>
                </div>
              </div>
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
              <div *ngIf="!isAuthenticated" class="space-y-2">
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
              
              <div *ngIf="isAuthenticated" class="space-y-2">
                <a routerLink="/partners/dashboard" 
                   class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  {{ 'b2bNav.dashboard' | translate }}
                </a>
                <a routerLink="/partners/profile" 
                   class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  {{ 'b2bNav.profile' | translate }}
                </a>
                <a routerLink="/partners/orders" 
                   class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-solar-600 hover:bg-gray-50 rounded-md">
                  {{ 'b2bNav.orders' | translate }}
                </a>
                <a routerLink="/" 
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
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  showMobileMenu = false;
  showUserMenu = false;
  isAuthenticated = false; // TODO: Replace with actual auth service
  currentUser: any = null; // TODO: Replace with actual user data

  constructor(private router: Router) { }

  ngOnInit(): void {
    // TODO: Initialize authentication state and user data
    // this.authService.currentUser$.subscribe(user => {
    //   this.isAuthenticated = !!user;
    //   this.currentUser = user;
    // });
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
    // TODO: Implement sign out
    // this.authService.signOut();
    this.showUserMenu = false;
    this.router.navigate(['/partners']);
  }

  // Close dropdowns when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUserMenu = false;
    }
  }
} 