import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map, filter, switchMap } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Order } from '../../../../shared/models/order.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
                {{ 'b2b.profile.title' | translate }}
              </h1>
              <p class="mt-2 text-lg text-gray-600 font-['DM_Sans']">
                {{ 'b2b.profile.subtitle' | translate }}
              </p>
            </div>
            <div class="flex space-x-4">
              <button (click)="navigateToProducts()" 
                      class="bg-solar-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-solar-700 transition-colors">
                {{ 'b2b.profile.viewProducts' | translate }}
              </button>
              <button (click)="navigateToOffers()" 
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                {{ 'b2b.profile.viewOffers' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-600"></div>
      </div>

      <!-- Not Authorized State -->
      <div *ngIf="!loading && !isCompanyContact" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <h3 class="text-lg font-medium text-red-900 mb-2">{{ 'b2b.profile.accessDenied' | translate }}</h3>
          <p class="text-red-700 mb-4">{{ 'b2b.profile.accessDeniedMessage' | translate }}</p>
          <button (click)="navigateToHome()" 
                  class="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
            {{ 'b2b.profile.returnHome' | translate }}
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading && isCompanyContact" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Sidebar - Company Settings -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">
                  {{ 'b2b.profile.companySettings' | translate }}
                </h3>
              </div>
              
              <div class="p-6 space-y-6" *ngIf="company">
                <!-- Company Status -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'b2b.profile.status' | translate }}
                  </label>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        [class]="getStatusClass(company.status)">
                    {{ getStatusLabel(company.status) }}
                  </span>
                </div>

                <!-- Company Information -->
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ 'b2b.profile.companyName' | translate }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ company.companyName }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ 'b2b.profile.businessType' | translate }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ getBusinessTypeLabel(company.businessType) }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ 'b2b.profile.taxNumber' | translate }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ company.taxNumber }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ 'b2b.profile.email' | translate }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ company.companyEmail }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ 'b2b.profile.phone' | translate }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ company.companyPhone }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">{{ 'b2b.profile.address' | translate }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ company.companyAddress }}</p>
                  </div>
                  
                  <div *ngIf="company.website">
                    <label class="block text-sm font-medium text-gray-700">{{ 'b2b.profile.website' | translate }}</label>
                    <p class="mt-1 text-sm text-gray-900">
                      <a [href]="company.website" target="_blank" class="text-solar-600 hover:text-solar-700">
                        {{ company.website }}
                      </a>
                    </p>
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="border-t pt-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">{{ 'b2b.profile.quickStats' | translate }}</h4>
                  <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="text-lg font-bold text-gray-900">{{ companyOrders.length }}</div>
                      <div class="text-xs text-gray-600">{{ 'b2b.profile.totalOrders' | translate }}</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="text-lg font-bold text-gray-900">{{ getTotalSpent() | currency:'EUR':'symbol':'1.2-2' }}</div>
                      <div class="text-xs text-gray-600">{{ 'b2b.profile.totalSpent' | translate }}</div>
                    </div>
                  </div>
                </div>

                <!-- Contact Support -->
                <div class="border-t pt-4">
                  <button (click)="contactSupport()" 
                          class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    {{ 'b2b.profile.contactSupport' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content - Company Orders -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">
                    {{ 'b2b.profile.companyOrders' | translate }}
                  </h3>
                  <div class="flex items-center space-x-2">
                    <select [(ngModel)]="orderStatusFilter" (ngModelChange)="filterOrders()"
                            class="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
                      <option value="">{{ 'b2b.profile.allOrders' | translate }}</option>
                      <option value="pending">{{ 'b2b.profile.pending' | translate }}</option>
                      <option value="processing">{{ 'b2b.profile.processing' | translate }}</option>
                      <option value="shipped">{{ 'b2b.profile.shipped' | translate }}</option>
                      <option value="delivered">{{ 'b2b.profile.delivered' | translate }}</option>
                      <option value="cancelled">{{ 'b2b.profile.cancelled' | translate }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="overflow-hidden">
                <!-- Orders List -->
                <div *ngIf="filteredOrders.length > 0" class="divide-y divide-gray-200">
                  <div *ngFor="let order of filteredOrders" class="p-6 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center justify-between mb-3">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">
                          {{ 'b2b.profile.orderNumber' | translate }}: {{ order.orderNumber }}
                        </h4>
                        <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">{{ order.totalAmount | currency:'EUR':'symbol':'1.2-2' }}</div>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              [class]="getOrderStatusClass(order.status)">
                          {{ getOrderStatusLabel(order.status) }}
                        </span>
                      </div>
                    </div>

                    <!-- Order Items Preview -->
                    <div class="bg-gray-50 rounded-lg p-3 mb-3">
                      <div class="text-xs font-medium text-gray-700 mb-2">{{ 'b2b.profile.orderItems' | translate }}:</div>
                      <div class="space-y-1">
                        <div *ngFor="let item of order.items; let i = index" class="flex justify-between text-xs text-gray-600">
                          <span *ngIf="i < 3">{{ item.productName }} ({{ item.quantity }}x)</span>
                          <span *ngIf="i < 3">{{ (item.unitPrice * item.quantity) | currency:'EUR':'symbol':'1.2-2' }}</span>
                        </div>
                        <div *ngIf="order.items.length > 3" class="text-xs text-gray-500 italic">
                          {{ 'b2b.profile.andMoreItems' | translate: { count: order.items.length - 3 } }}
                        </div>
                      </div>
                    </div>

                    <!-- Order Actions -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span *ngIf="order.paymentStatus">
                          {{ 'b2b.profile.payment' | translate }}: 
                          <span [class]="order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'">
                            {{ getPaymentStatusLabel(order.paymentStatus) }}
                          </span>
                        </span>
                        <span *ngIf="order.items.length">
                          {{ order.items.length }} {{ 'b2b.profile.items' | translate }}
                        </span>
                      </div>
                      <div class="flex space-x-2">
                        <button (click)="viewOrderDetails(order)" 
                                class="text-solar-600 hover:text-solar-700 text-xs font-medium">
                          {{ 'b2b.profile.viewDetails' | translate }}
                        </button>
                        <button *ngIf="order.status === 'delivered'" 
                                (click)="reorderItems(order)"
                                class="text-blue-600 hover:text-blue-700 text-xs font-medium">
                          {{ 'b2b.profile.reorder' | translate }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Orders State -->
                <div *ngIf="filteredOrders.length === 0" class="text-center py-12">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">{{ 'b2b.profile.noOrdersFound' | translate }}</h3>
                  <p class="text-gray-600 mb-4">{{ 'b2b.profile.noOrdersFoundMessage' | translate }}</p>
                  <button (click)="navigateToProducts()" 
                          class="bg-solar-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-solar-700 transition-colors">
                    {{ 'b2b.profile.startShopping' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PartnerProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);

  currentUser$: Observable<User | null>;

  loading = true;
  isCompanyContact = false;
  company: Company | null = null;
  companyOrders: Order[] = [];
  filteredOrders: Order[] = [];
  orderStatusFilter = '';

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.loadPartnerProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadPartnerProfile(): Promise<void> {
    try {
      this.loading = true;

      // Get the current user from the observable
      this.currentUser$.pipe(
        filter(user => user !== null),
        takeUntil(this.destroy$)
      ).subscribe(async (user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }

        try {
          // Check if user is a company contact person
          const { data: companies, error: companyError } = await this.supabaseService.client
            .from('companies')
            .select('*')
            .eq('contact_person_id', user.id)
            .eq('status', 'approved')
            .single();

          if (companyError || !companies) {
            this.isCompanyContact = false;
            this.loading = false;
            return;
          }

          this.company = companies;
          this.isCompanyContact = true;

          // Load company orders
          await this.loadCompanyOrders();

        } catch (error) {
          console.error('Error loading company data:', error);
          this.isCompanyContact = false;
        } finally {
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('Error loading partner profile:', error);
      this.isCompanyContact = false;
      this.loading = false;
    }
  }

  private async loadCompanyOrders(): Promise<void> {
    if (!this.company) return;

    try {
      const { data: orders, error } = await this.supabaseService.client
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            discount_percentage
          )
        `)
        .eq('is_b2b', true)
        .eq('company_id', this.company.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading company orders:', error);
        this.companyOrders = [];
        this.filteredOrders = [];
        return;
      }

      // Transform the order data to match our expected structure
      this.companyOrders = (orders || []).map((order: any) => ({
        ...order,
        items: (order.order_items || []).map((item: any) => ({
          ...item,
          productName: item.product_name,
          unitPrice: item.unit_price,
          discountPercentage: item.discount_percentage
        })),
        orderNumber: order.order_number || order.id,
        totalAmount: order.total_amount || 0,
        createdAt: order.created_at,
        paymentStatus: order.payment_status,
        // Ensure all required fields are present
        status: order.status || 'pending'
      }));

      this.filteredOrders = [...this.companyOrders];

    } catch (error) {
      console.error('Error loading company orders:', error);
      this.companyOrders = [];
      this.filteredOrders = [];
    }
  }

  filterOrders(): void {
    if (!this.orderStatusFilter) {
      this.filteredOrders = [...this.companyOrders];
    } else {
      this.filteredOrders = this.companyOrders.filter(order => order.status === this.orderStatusFilter);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  getBusinessTypeLabel(type: string): string {
    switch (type) {
      case 'retailer':
        return 'Retailer';
      case 'wholesaler':
        return 'Wholesaler';
      case 'installer':
        return 'Installer';
      case 'distributor':
        return 'Distributor';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getOrderStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  }

  getTotalSpent(): number {
    return this.companyOrders.reduce((total, order) => total + order.totalAmount, 0);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/order-details', order.id]);
  }

  reorderItems(order: Order): void {
    // TODO: Implement reorder functionality
    console.log('Reordering items from order:', order.id);
  }

  contactSupport(): void {
    this.router.navigate(['/contact']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/partners/products']);
  }

  navigateToOffers(): void {
    this.router.navigate(['/partners/offers']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
} 