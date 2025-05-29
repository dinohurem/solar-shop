import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUser } from '../../../core/auth/store/auth.selectors';
import { User } from '../../../shared/models/user.model';
import * as AuthActions from '../../../core/auth/store/auth.actions';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterModule],
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
              Welcome, <span class="font-semibold">{{ (currentUser$ | async)?.firstName }}</span>
            </div>
            <button 
              (click)="viewSite()"
              class="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              View Site
            </button>
            <button 
              (click)="logout()"
              class="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar Navigation -->
        <nav class="w-64 bg-white shadow-sm h-screen sticky top-0 overflow-y-auto">
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
                <span>Dashboard</span>
              </a>

              <!-- Content Management -->
              <div class="pt-4">
                <h3 class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content Management</h3>
                
                <a routerLink="/admin/products" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <span>Products</span>
                </a>

                <a routerLink="/admin/categories" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  <span>Categories</span>
                </a>

                <a routerLink="/admin/blog" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                  </svg>
                  <span>Blog Posts</span>
                </a>

                <a routerLink="/admin/offers" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <span>Offers</span>
                </a>
              </div>

              <!-- System Management -->
              <div class="pt-4">
                <h3 class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System</h3>
                
                <a routerLink="/admin/users" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span>Users</span>
                </a>

                <a routerLink="/admin/orders" 
                   routerLinkActive="bg-blue-50 text-blue-700 border-blue-300"
                   class="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-transparent">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span>Orders</span>
                </a>
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

    currentUser$: Observable<User | null>;

    constructor() {
        this.currentUser$ = this.store.select(selectCurrentUser);
    }

    ngOnInit(): void { }

    viewSite(): void {
        this.router.navigate(['/']);
    }

    logout(): void {
        this.store.dispatch(AuthActions.logout());
    }
} 