import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NavbarActions } from './store/navbar.actions';
import { selectIsMobileMenuOpen, selectCurrentLanguage } from './store/navbar.selectors';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserAvatar,
  selectIsAdmin
} from '../../../core/auth/store/auth.selectors';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CartButtonComponent } from '../cart/components/cart-button/cart-button.component';
import * as AuthActions from '../../../core/auth/store/auth.actions';
import { User } from '../../../shared/models/user.model';
import { filter } from 'rxjs/operators';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, CartButtonComponent, TranslatePipe],
  template: `
    <!-- Top Info Bar (Desktop) -->
    <div class="hidden lg:block bg-heyhome-dark-green text-white text-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-2">
          <!-- Contact Info -->
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-2 hover:text-green-200 transition-colors duration-200">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>{{ 'contact.phone' | translate }}</span>
            </div>
            <div class="flex items-center space-x-2 hover:text-green-200 transition-colors duration-200">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>{{ 'contact.email' | translate }}</span>
            </div>
          </div>
          
          <!-- Language Selector -->
          <div class="flex items-center space-x-1 cursor-pointer hover:text-green-200 transition-colors duration-200" (click)="toggleLanguage()">
            <div class="flex items-center space-x-2" *ngIf="(currentLanguage$ | async) === 'en'">
              <span>{{ 'language.current' | translate }}</span>
              <svg class="w-4 h-4 transform transition-transform duration-200 hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex items-center space-x-2" *ngIf="(currentLanguage$ | async) === 'hr'">
              <div class="flex items-center space-x-1">
                <div class="w-4 h-3 flex flex-col rounded-sm overflow-hidden">
                  <div class="w-full h-1/3 bg-red-600"></div>
                  <div class="w-full h-1/3 bg-white"></div>
                  <div class="w-full h-1/3 bg-blue-600"></div>
                </div>
                <span>{{ 'language.current' | translate }}</span>
              </div>
              <svg class="w-4 h-4 transform transition-transform duration-200 hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Top Info Bar -->
    <div class="lg:hidden bg-heyhome-medium-green text-white text-sm">
      <div class="px-5 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-5">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>{{ 'contact.phone' | translate }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>{{ 'contact.email' | translate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 lg:h-20">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <a routerLink="/" class="cursor-pointer group">
              <div class="flex items-center space-x-3">                
                <div class="hidden sm:block">
                  <span class="text-xl lg:text-2xl font-bold text-gray-900 font-['Poppins'] group-hover:text-green-600 transition-colors duration-300 transform group-hover:scale-105">
                    SolarShop
                  </span>
                </div>
              </div>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-8">
            <div class="relative group">
              <div class="flex items-center space-x-1 cursor-pointer text-gray-900 font-medium transition-all duration-300 hover:text-green-600 group-hover:scale-105">
                <span>{{ 'nav.products' | translate }}</span>
                <svg class="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
            </div>
            
            <a routerLink="/offers" 
               routerLinkActive="text-green-600 font-semibold" 
               class="relative text-gray-900 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group">
              <span>{{ 'nav.offers' | translate }}</span>
              <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
            </a>
            
            <a routerLink="/mission" 
               routerLinkActive="text-green-600 font-semibold" 
               class="relative text-gray-900 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group">
              <span>{{ 'nav.sustainability' | translate }}</span>
              <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
            </a>
            
            <a routerLink="/blog" 
               routerLinkActive="text-green-600 font-semibold" 
               class="relative text-gray-900 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group">
              <span>{{ 'nav.blog' | translate }}</span>
              <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
            </a>
            
            <a routerLink="/company" 
               routerLinkActive="text-green-600 font-semibold" 
               class="relative text-gray-900 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group">
              <span>{{ 'nav.company' | translate }}</span>
              <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
            </a>
            
            <a routerLink="/contact" 
               routerLinkActive="text-green-600 font-semibold" 
               class="relative text-gray-900 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group">
              <span>{{ 'nav.contact' | translate }}</span>
              <div class="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></div>
            </a>
          </div>

          <!-- Desktop Icons -->
          <div class="hidden lg:flex items-center space-x-5">
            <button class="p-2 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:bg-green-50 rounded-full" 
                    [title]="'nav.searchPlaceholder' | translate">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            
            <!-- Authentication Icon -->
            <div class="relative">
              <!-- Login Icon (when not authenticated) -->
              <button 
                *ngIf="!(isAuthenticated$ | async)"
                (click)="navigateToLogin()"
                class="p-2 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:bg-green-50 rounded-full"
                [title]="'auth.signIn' | translate">
                <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                </svg>
              </button>

              <!-- Profile Icon (when authenticated) -->
              <div *ngIf="isAuthenticated$ | async" class="relative">
                <button 
                  (click)="toggleProfileMenu()"
                  class="p-2 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:bg-green-50 rounded-full flex items-center space-x-2"
                  [title]="'profile.profile' | translate">
                  <!-- User Avatar or Default Profile Icon -->
                  <div *ngIf="(userAvatar$ | async); else defaultProfileIcon" class="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-green-200 transition-all duration-300">
                    <img [src]="userAvatar$ | async" [alt]="(currentUser$ | async)?.firstName" class="w-full h-full object-cover">
                  </div>
                  <ng-template #defaultProfileIcon>
                    <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </ng-template>
                </button>

                <!-- Profile Dropdown Menu -->
                <div 
                  *ngIf="showProfileMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200 transform transition-all duration-300 ease-out scale-100 opacity-100">
                  <div class="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                    <div class="font-semibold text-gray-900">{{ (currentUser$ | async)?.firstName }} {{ (currentUser$ | async)?.lastName }}</div>
                    <div class="text-gray-500 truncate">{{ (currentUser$ | async)?.email }}</div>
                  </div>
                  <a 
                    routerLink="/profile" 
                    (click)="closeProfileMenu()"
                    class="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200">
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span>{{ 'profile.profile' | translate }}</span>
                    </div>
                  </a>
                  <a 
                    *ngIf="isAdmin$ | async"
                    routerLink="/admin" 
                    (click)="closeProfileMenu()"
                    class="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{{ 'profile.adminDashboard' | translate }}</span>
                    </div>
                  </a>
                  <button 
                    (click)="logout()"
                    class="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-b-lg">
                    <div class="flex items-center space-x-3">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>{{ 'profile.signOut' | translate }}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <app-cart-button></app-cart-button>
          </div>

          <!-- Mobile Menu Button and Icons -->
          <div class="lg:hidden flex items-center space-x-3">
            <button class="p-2 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:bg-green-50 rounded-full"
                    [title]="'nav.searchPlaceholder' | translate">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            
            <!-- Mobile Authentication Icon -->
            <button 
              *ngIf="!(isAuthenticated$ | async)"
              (click)="navigateToLogin()"
              class="p-2 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:bg-green-50 rounded-full"
              [title]="'auth.signIn' | translate">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
            </button>
            
            <button 
              *ngIf="isAuthenticated$ | async"
              (click)="navigateToProfile()"
              class="p-2 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:bg-green-50 rounded-full"
              [title]="'profile.profile' | translate">
              <svg class="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
            
            <app-cart-button></app-cart-button>
            
            <button 
              class="p-2 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:bg-green-50 rounded-full"
              (click)="toggleMobileMenu()">
              <svg class="w-6 h-6 transform transition-transform duration-300" 
                   [ngClass]="{'rotate-90': (isMobileMenuOpen$ | async)}"
                   stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div 
        class="lg:hidden bg-white border-t border-gray-200 transition-all duration-500 ease-in-out overflow-hidden"
        [ngClass]="{
          'max-h-96 opacity-100': (isMobileMenuOpen$ | async),
          'max-h-0 opacity-0': !(isMobileMenuOpen$ | async)
        }">
        <div class="px-4 py-6 space-y-4">
          <div class="relative group">
            <div class="flex items-center space-x-1 cursor-pointer text-gray-900 font-medium transition-all duration-300 hover:text-green-600 py-2">
              <span>{{ 'nav.products' | translate }}</span>
              <svg class="w-4 h-4 text-gray-600 transition-transform duration-300 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
          
          <a routerLink="/offers" 
             routerLinkActive="text-green-600 font-semibold bg-green-50" 
             class="block text-gray-900 hover:text-green-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-green-50">
            {{ 'nav.offers' | translate }}
          </a>
          
          <a routerLink="/mission" 
             routerLinkActive="text-green-600 font-semibold bg-green-50" 
             class="block text-gray-900 hover:text-green-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-green-50">
            {{ 'nav.sustainability' | translate }}
          </a>
          
          <a routerLink="/blog" 
             routerLinkActive="text-green-600 font-semibold bg-green-50" 
             class="block text-gray-900 hover:text-green-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-green-50">
            {{ 'nav.blog' | translate }}
          </a>
          
          <a routerLink="/company" 
             routerLinkActive="text-green-600 font-semibold bg-green-50" 
             class="block text-gray-900 hover:text-green-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-green-50">
            {{ 'nav.company' | translate }}
          </a>
          
          <a routerLink="/contact" 
             routerLinkActive="text-green-600 font-semibold bg-green-50" 
             class="block text-gray-900 hover:text-green-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-green-50">
            {{ 'nav.contact' | translate }}
          </a>
          
          <!-- Mobile Authentication Links -->
          <div class="border-t border-gray-200 pt-4 mt-4" *ngIf="isAuthenticated$ | async">
            <a routerLink="/profile" 
               routerLinkActive="text-green-600 font-semibold bg-green-50" 
               class="block text-gray-900 hover:text-green-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-green-50 mb-2">
              {{ 'profile.profile' | translate }}
            </a>
            <a 
              *ngIf="isAdmin$ | async"
              routerLink="/admin" 
              (click)="closeProfileMenu()"
              class="block text-gray-900 hover:text-blue-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-blue-50 mb-2">
              {{ 'profile.adminDashboard' | translate }}
            </a>
            <button (click)="logout()" 
                    class="block w-full text-left text-gray-900 hover:text-red-600 font-medium transition-all duration-300 py-2 px-3 rounded-lg hover:bg-red-50">
              {{ 'profile.signOut' | translate }}
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    /* Custom scrollbar for better UX */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #10b981;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #059669;
    }
    
    /* Active route highlighting */
    .router-link-active {
      position: relative;
    }
    
    .router-link-active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #10b981;
      border-radius: 1px;
    }
    
    /* Smooth animations */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Hover effects */
    .group:hover .group-hover\\:w-full {
      width: 100%;
    }
    
    .group:hover .group-hover\\:rotate-180 {
      transform: rotate(180deg);
    }
    
    .group:hover .group-hover\\:scale-105 {
      transform: scale(1.05);
    }
  `],
  animations: []
})
export class NavbarComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  isMobileMenuOpen$: Observable<boolean>;
  currentLanguage$: Observable<string>;
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  userAvatar$: Observable<string | null>;
  isAdmin$: Observable<boolean>;
  showProfileMenu = false;
  currentRoute = '';

  constructor() {
    this.isMobileMenuOpen$ = this.store.select(selectIsMobileMenuOpen);
    this.currentLanguage$ = this.store.select(selectCurrentLanguage);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.userAvatar$ = this.store.select(selectUserAvatar);
    this.isAdmin$ = this.store.select(selectIsAdmin);

    // Track route changes for active highlighting
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showProfileMenu = false;
    }
  }

  ngOnInit(): void {
    this.store.dispatch(NavbarActions.initializeNavbar());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMobileMenu(): void {
    this.store.dispatch(NavbarActions.toggleMobileMenu());
  }

  toggleLanguage(): void {
    this.store.dispatch(NavbarActions.toggleLanguage());
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
    this.closeProfileMenu();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
    this.showProfileMenu = false;
    this.router.navigate(['/']);
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }
} 