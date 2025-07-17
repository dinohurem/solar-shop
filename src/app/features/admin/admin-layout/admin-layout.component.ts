import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUser } from '../../../core/auth/store/auth.selectors';
import { User } from '../../../shared/models/user.model';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { TranslationService, SupportedLanguage } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Admin Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">Solar Shop Admin</h1>
          </div>
          
          <!-- User Info & Actions -->
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-700">
              {{ 'admin.welcome' | translate }}, <span class="font-semibold">{{ (currentUser$ | async)?.firstName }}</span>
            </div>
            <button 
              (click)="viewSite()"
              class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              {{ 'admin.viewSite' | translate }}
            </button>
            <button 
              (click)="logout()"
              class="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              {{ 'admin.logout' | translate }}
            </button>
          </div>
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar Navigation -->
        <nav class="w-64 min-w-64 max-w-64 bg-white shadow-sm h-screen sticky top-0 overflow-y-auto flex-shrink-0">
          <div class="p-6">
            <div class="space-y-2">
              <!-- Dashboard -->
              <a routerLink="/admin" 
                 routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"/>
                </svg>
                <span>{{ 'admin.dashboard' | translate }}</span>
              </a>

              <!-- Content Management -->
              <div class="pt-4">
                <h3 class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ 'admin.contentManagement' | translate }}</h3>
                
                <a routerLink="/admin/proizvodi" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <span>{{ 'admin.products' | translate }}</span>
                </a>

                <a routerLink="/admin/kategorije" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  <span>{{ 'admin.categories' | translate }}</span>
                </a>

                <a routerLink="/admin/blog" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                  </svg>
                  <span>{{ 'admin.blog' | translate }}</span>
                </a>

                <a routerLink="/admin/ponude" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <span>{{ 'admin.offers' | translate }}</span>
                </a>
              </div>

              <!-- System Management -->
              <div class="pt-4">
                <h3 class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ 'admin.systemManagement' | translate }}</h3>
                
                <a routerLink="/admin/narudzbe" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span>{{ 'admin.orders' | translate }}</span>
                </a>

                <a routerLink="/admin/korisnici" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span>{{ 'admin.users' | translate }}</span>
                </a>

                <a routerLink="/admin/recenzije" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  <span>{{ 'admin.reviews' | translate }}</span>
                </a>

                <a routerLink="/admin/lista-zelja"
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  <span>{{ 'admin.wishlist' | translate }}</span>
                </a>

                <a routerLink="/admin/kontakti"
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ 'admin.contacts' | translate }}</span>
                </a>

                <a *ngIf="showEmailTest"
                   routerLink="/admin/email-test"
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>Email Test</span>
                </a>
              </div>

              <!-- Company Management -->
              <div class="pt-4">
                <h3 class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ 'admin.companyManagement' | translate }}</h3>
                
                <a routerLink="/admin/narudzbe-partneri" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span>{{ 'admin.partnerOrders' | translate }}</span>
                </a>

                <a routerLink="/admin/tvrtke" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span>{{ 'admin.companies' | translate }}</span>
                </a>

                <a routerLink="/admin/cijenik-tvrtka"
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ 'admin.companyPricing' | translate }}</span>
                </a>
              </div>

                             <!-- Language Selector -->
               <div class="pt-4 border-t border-gray-200">
                 <div class="px-4">
                   <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ 'admin.language' | translate }}</label>
                  <select 
                    [value]="currentLanguage"
                    (change)="onLanguageChange($event)"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="hr">Hrvatski</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .router-link-active {
      background-color: rgb(239 246 255) !important;
      color: rgb(29 78 216) !important;
      border-color: rgb(147 197 253) !important;
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  currentUser$: Observable<User | null>;
  currentLanguage: SupportedLanguage = 'hr';
  showEmailTest = false;

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.currentLanguage = this.translationService.getCurrentLanguage();
  }

  ngOnInit(): void { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Show Email Test option when Shift+L is pressed
    if (event.shiftKey && event.key === 'L' && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.showEmailTest = !this.showEmailTest;
      console.log('Email Test visibility toggled:', this.showEmailTest);
    }
  }

  viewSite(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const language = target.value as SupportedLanguage;
    this.translationService.setLanguage(language);
    this.currentLanguage = language;
  }
} 