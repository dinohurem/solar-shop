import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Observable, from } from 'rxjs';
interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBlogPosts: number;
  totalOffers: number;
  totalUsers: number;
  totalOrders: number;
  recentOrders: any[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">Admin</h1>
        <button
          (click)="refreshStats()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {{ 'admin.refreshData' | translate }}
        </button>
      </div>

      <div *ngIf="stats$ | async as stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Products</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <a routerLink="/admin/proizvodi" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage Products →
            </a>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Categories</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalCategories }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <a routerLink="/admin/kategorije" class="text-green-600 hover:text-green-800 text-sm font-medium">
              Manage Categories →
            </a>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Blog Posts</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalBlogPosts }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <a routerLink="/admin/blog" class="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Manage Blog Posts →
            </a>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Active Offers</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalOffers }}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <a routerLink="/admin/ponude" class="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
              Manage Offers →
            </a>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
            </div>
            <div class="p-3 bg-indigo-100 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <a routerLink="/admin/korisnici" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Manage Users →
            </a>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Orders</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalOrders }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-lg">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <a routerLink="/admin/narudzbe" class="text-orange-600 hover:text-orange-800 text-sm font-medium">
              Manage Orders →
            </a>
          </div>
        </div>
      </div>

      <div *ngIf="stats$ | async as stats">
        <div *ngIf="stats.recentOrders && stats.recentOrders.length > 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <a routerLink="/admin/narudzbe" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Orders →
            </a>
          </div>
          
          <div class="space-y-4">
            <div 
              *ngFor="let order of stats.recentOrders" 
              (click)="viewOrderDetails(order.id)"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200">
              <div class="flex-1">
                <div class="flex items-center space-x-4">
                  <div>
                    <h3 class="font-medium text-gray-900">{{ order.order_number }}</h3>
                    <p class="text-sm text-gray-600">{{ order.customer_name || order.customer_email }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-lg font-semibold text-gray-900">\${{ order.total_amount?.toFixed(2) }}</p>
                    <p class="text-xs text-gray-500">{{ order.created_at | date:'shortDate' }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.status === 'pending',
                        'bg-blue-100 text-blue-800': order.status === 'confirmed',
                        'bg-purple-100 text-purple-800': order.status === 'processing',
                        'bg-indigo-100 text-indigo-800': order.status === 'shipped',
                        'bg-green-100 text-green-800': order.status === 'delivered',
                        'bg-red-100 text-red-800': order.status === 'cancelled'
                      }">
                  {{ getOrderStatusLabel(order.status) }}
                </span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!(stats$ | async)" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private titleService = inject(Title);
  private router = inject(Router);

  stats$: Observable<DashboardStats>;

  constructor() {
    this.stats$ = this.loadStats();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard - Solar Shop Admin');
  }

  refreshStats(): void {
    this.stats$ = this.loadStats();
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/admin/narudzbe/edit', orderId]);
  }

  getOrderStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusLabels[status] || status;
  }

  private loadStats(): Observable<DashboardStats> {
    const loadStatsAsync = async () => {
      try {
        const [products, categories, blogPosts, offers, users] = await Promise.all([
          this.supabaseService.getTable('products'),
          this.supabaseService.getTable('categories'),
          this.supabaseService.getTable('blog_posts'),
          this.supabaseService.getTable('offers'),
          this.supabaseService.getTable('profiles')
        ]);

        const orders = await this.supabaseService.getTable('orders');
        const recentOrders = (orders || [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        return {
          totalProducts: products?.length || 0,
          totalCategories: categories?.length || 0,
          totalBlogPosts: blogPosts?.length || 0,
          totalOffers: offers?.length || 0,
          totalUsers: users?.length || 0,
          totalOrders: orders?.length || 0,
          recentOrders: recentOrders
        };
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        return {
          totalProducts: 0,
          totalCategories: 0,
          totalBlogPosts: 0,
          totalOffers: 0,
          totalUsers: 0,
          totalOrders: 0,
          recentOrders: []
        };
      }
    };

    return from(loadStatsAsync());
  }
} 