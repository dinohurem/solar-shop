import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, map, filter } from 'rxjs/operators';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { User } from '../../../../shared/models/user.model';
import { Order } from '../../../../shared/models/order.model';
import { Company } from '../../../../shared/models/company.model';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslatePipe],
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
      <div *ngIf="!loading && isCompanyContact" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Success Message -->
        <div *ngIf="showSuccessMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-green-800 font-['DM_Sans'] font-medium">{{ 'b2b.profile.companyInfoUpdated' | translate }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Navigation -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <nav class="space-y-2">
                <button
                  (click)="setActiveTab('company-info')"
                  [class]="activeTab === 'company-info' ? 'bg-solar-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H7a2 2 0 01-2-2m2 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2"/>
                  </svg>
                  <span>{{ 'b2b.profile.companyInfo' | translate }}</span>
                </button>
                
                <button
                  (click)="setActiveTab('company-orders')"
                  [class]="activeTab === 'company-orders' ? 'bg-solar-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <span>{{ 'b2b.profile.companyOrders' | translate }}</span>
                </button>

                <button
                  (click)="contactSupport()"
                  class="w-full text-left px-4 py-3 rounded-lg font-['DM_Sans'] font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ 'b2b.profile.contactSupport' | translate }}</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">
            <!-- Company Info Tab -->
            <div *ngIf="activeTab === 'company-info'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="mb-6">
                <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">{{ 'b2b.profile.companyInformation' | translate }}</h2>
                <p class="text-gray-600 font-['DM_Sans']">{{ 'b2b.profile.updateCompanyDetails' | translate }}</p>
              </div>

              <!-- Company Status Banner -->
              <div *ngIf="company" class="mb-6 p-4 rounded-lg border" [class]="getStatusBannerClass(company.status)">
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <div class="font-medium">{{ 'b2b.profile.companyStatus' | translate }}: {{ getStatusLabel(company.status) }}</div>
                    <div class="text-sm opacity-75">{{ getStatusDescription(company.status) }}</div>
                  </div>
                </div>
              </div>

              <!-- Company Form -->
              <form [formGroup]="companyInfoForm" (ngSubmit)="updateCompanyInfo()" class="space-y-6">
                <!-- Basic Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'b2b.profile.companyName' | translate }}*</label>
                    <input
                      formControlName="companyName"
                      type="text"
                      class="w-full h-12 px-4 py-3 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [class.border-red-500]="companyInfoForm.get('companyName')?.invalid && companyInfoForm.get('companyName')?.touched"
                      [class.border-gray-300]="!companyInfoForm.get('companyName')?.invalid || !companyInfoForm.get('companyName')?.touched"
                      [placeholder]="'b2b.profile.enterCompanyName' | translate">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'b2b.profile.businessType' | translate }}*</label>
                    <select
                      formControlName="businessType"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']">
                      <option value="">{{ 'b2b.profile.selectBusinessType' | translate }}</option>
                      <option value="retailer">{{ 'b2b.profile.retailer' | translate }}</option>
                      <option value="wholesaler">{{ 'b2b.profile.wholesaler' | translate }}</option>
                      <option value="installer">{{ 'b2b.profile.installer' | translate }}</option>
                      <option value="distributor">{{ 'b2b.profile.distributor' | translate }}</option>
                      <option value="other">{{ 'b2b.profile.other' | translate }}</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'b2b.profile.taxNumber' | translate }}*</label>
                    <input
                      formControlName="taxNumber"
                      type="text"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [placeholder]="'b2b.profile.enterTaxNumber' | translate">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'b2b.profile.website' | translate }}</label>
                    <input
                      formControlName="website"
                      type="url"
                      class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                      [placeholder]="'b2b.profile.enterWebsite' | translate">
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="border-t pt-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4 font-['Poppins']">{{ 'b2b.profile.contactInformation' | translate }}</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'b2b.profile.email' | translate }}*</label>
                      <input
                        formControlName="companyEmail"
                        type="email"
                        class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                        [placeholder]="'b2b.profile.enterEmail' | translate">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'b2b.profile.phone' | translate }}*</label>
                      <input
                        formControlName="companyPhone"
                        type="tel"
                        class="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                        [placeholder]="'b2b.profile.enterPhone' | translate">
                    </div>
                  </div>
                </div>

                <!-- Address Information -->
                <div class="border-t pt-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4 font-['Poppins']">{{ 'b2b.profile.addressInformation' | translate }}</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans']">{{ 'b2b.profile.address' | translate }}*</label>
                      <textarea
                        formControlName="companyAddress"
                        rows="3"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:border-transparent transition-all duration-200 font-['DM_Sans']"
                        [placeholder]="'b2b.profile.enterAddress' | translate"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="border-t pt-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4 font-['Poppins']">{{ 'b2b.profile.quickStats' | translate }}</h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-gray-900">{{ companyOrders.length }}</div>
                      <div class="text-sm text-gray-600">{{ 'b2b.profile.totalOrders' | translate }}</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-solar-600">{{ getTotalSpent() | currency:'EUR':'symbol':'1.2-2' }}</div>
                      <div class="text-sm text-gray-600">{{ 'b2b.profile.totalSpent' | translate }}</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-blue-600">{{ getActiveOrders() }}</div>
                      <div class="text-sm text-gray-600">{{ 'b2b.profile.activeOrders' | translate }}</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 text-center">
                      <div class="text-2xl font-bold text-green-600">{{ getDeliveredOrders() }}</div>
                      <div class="text-sm text-gray-600">{{ 'b2b.profile.deliveredOrders' | translate }}</div>
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    [disabled]="companyInfoForm.invalid || updating"
                    class="px-6 py-3 bg-solar-600 hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-solar-600 focus:ring-offset-2 font-['DM_Sans']">
                    <span *ngIf="!updating">{{ 'b2b.profile.saveChanges' | translate }}</span>
                    <span *ngIf="updating" class="flex items-center space-x-2">
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ 'b2b.profile.saving' | translate }}</span>
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Company Orders Tab -->
            <div *ngIf="activeTab === 'company-orders'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="mb-6">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-2">{{ 'b2b.profile.companyOrders' | translate }}</h2>
                    <p class="text-gray-600 font-['DM_Sans']">{{ 'b2b.profile.viewOrderHistory' | translate }}</p>
                  </div>
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

              <!-- Loading State -->
              <div *ngIf="ordersLoading" class="flex justify-center py-8">
                <svg class="animate-spin w-8 h-8 text-solar-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <!-- Orders List -->
              <div *ngIf="!ordersLoading && filteredOrders.length > 0" class="space-y-4">
                <div *ngFor="let order of filteredOrders" class="border border-gray-200 rounded-lg p-6 hover:border-solar-600 transition-colors">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 font-['Poppins']">{{ 'b2b.profile.orderNumber' | translate }}: {{ order.orderNumber }}</h3>
                      <p class="text-sm text-gray-600 font-['DM_Sans']">{{ formatDate(order.createdAt) }}</p>
                    </div>
                    <div class="text-right">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            [class]="getOrderStatusClass(order.status)">
                        {{ getOrderStatusLabel(order.status) }}
                      </span>
                      <p class="text-lg font-semibold text-gray-900 mt-1">{{ order.subtotal | currency:'EUR':'symbol':'1.2-2' }}</p>
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
              <div *ngIf="!ordersLoading && filteredOrders.length === 0" class="text-center py-12">
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
  `,
})
export class PartnerProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  currentUser$: Observable<User | null>;

  loading = true;
  updating = false;
  ordersLoading = false;
  isCompanyContact = false;
  company: Company | null = null;
  companyOrders: Order[] = [];
  filteredOrders: Order[] = [];
  orderStatusFilter = '';
  activeTab: 'company-info' | 'company-orders' | 'company-pricing' = 'company-info';
  showSuccessMessage = false;

  companyInfoForm: FormGroup;

  constructor() {
    this.currentUser$ = this.store.select(selectCurrentUser);

    this.companyInfoForm = this.fb.group({
      companyName: ['', [Validators.required]],
      businessType: [''],
      taxNumber: ['', [Validators.required]],
      website: [''],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPhone: ['', [Validators.required]],
      companyAddress: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check for order success query param
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params['orderSuccess'] && params['orderNumber']) {
        this.showOrderSuccessMessage(params['orderNumber']);
      }
    });

    // Subscribe to current user from NgRx store
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      console.log('NgRx user state changed:', user);
      if (user) {
        this.loadPartnerProfile(user);
      } else {
        console.log('No user in NgRx store, redirecting to login');
        this.loading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadPartnerProfile(currentUser: User): Promise<void> {
    try {
      this.loading = true;
      console.log('Starting to load partner profile for user:', currentUser.id, currentUser.email);

      // Check if user is a company contact person
      const { data: companies, error: companyError } = await this.supabaseService.client
        .from('companies')
        .select('*')
        .eq('contact_person_id', currentUser.id)
        .eq('status', 'approved')
        .single();

      console.log('Company query result:', { companies, companyError });

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          console.log('No approved company found for this user (this is normal if user is not a partner)');
        } else {
          console.error('Database error when checking company:', companyError);
        }
        this.isCompanyContact = false;
        this.loading = false;
        return;
      }

      if (!companies) {
        console.log('User is not an approved company contact');
        this.isCompanyContact = false;
        this.loading = false;
        return;
      }

      console.log('Found approved company:', companies.company_name, companies.id);

      // Map database response to TypeScript model
      this.company = {
        id: companies.id,
        contactPersonId: companies.contact_person_id,
        contactPersonName: companies.contact_person_name,
        companyName: companies.company_name,
        taxNumber: companies.tax_number,
        companyAddress: companies.company_address,
        companyPhone: companies.company_phone,
        companyEmail: companies.company_email,
        website: companies.website,
        businessType: companies.business_type,
        yearsInBusiness: companies.years_in_business,
        annualRevenue: companies.annual_revenue,
        numberOfEmployees: companies.number_of_employees,
        description: companies.description,
        status: companies.status,
        approved: companies.approved,
        approvedAt: companies.approved_at ? new Date(companies.approved_at) : undefined,
        approvedBy: companies.approved_by,
        rejectedAt: companies.rejected_at ? new Date(companies.rejected_at) : undefined,
        rejectedBy: companies.rejected_by,
        rejectionReason: companies.rejection_reason,
        createdAt: new Date(companies.created_at),
        updatedAt: new Date(companies.updated_at)
      };

      this.isCompanyContact = true;

      // Populate form with company data
      this.companyInfoForm.patchValue({
        companyName: this.company.companyName || '',
        businessType: this.company.businessType || '',
        taxNumber: this.company.taxNumber || '',
        website: this.company.website || '',
        companyEmail: this.company.companyEmail || '',
        companyPhone: this.company.companyPhone || '',
        companyAddress: this.company.companyAddress || ''
      });

      // Load company orders
      await this.loadCompanyOrders();

    } catch (error) {
      console.error('Error loading partner profile:', error);
      this.isCompanyContact = false;
    } finally {
      this.loading = false;
    }
  }

  private async loadCompanyOrders(): Promise<void> {
    if (!this.company) {
      console.log('No company data available for loading orders');
      return;
    }

    try {
      this.ordersLoading = true;
      console.log('Loading orders for company:', this.company.id, 'contactPersonId:', this.company.contactPersonId);

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
            total_price
          )
        `)
        .eq('is_b2b', true)
        .eq('user_id', this.company.contactPersonId)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { data: orders, error });

      if (error) {
        console.error('Error loading company orders:', error);
        return;
      }

      // Map database orders to TypeScript model
      this.companyOrders = (orders || []).map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        totalAmount: order.total_amount,
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        shippingCost: order.shipping_cost,
        discountAmount: order.discount_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        shippingStatus: order.shipping_status,
        paymentMethod: order.payment_method,
        orderDate: order.order_date,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number,
        notes: order.notes,
        adminNotes: order.admin_notes,
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          productImageUrl: item.product_image_url,
          productSpecifications: item.product_specifications,
          createdAt: item.created_at
        })),
        is_b2b: order.is_b2b,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }));

      this.filteredOrders = [...this.companyOrders];
      console.log('Successfully loaded and mapped orders:', this.companyOrders.length, 'orders');
    } catch (error) {
      console.error('Error loading company orders:', error);
    } finally {
      this.ordersLoading = false;
    }
  }

  setActiveTab(tab: 'company-info' | 'company-orders'): void {
    this.activeTab = tab;
    this.showSuccessMessage = false;

    if (tab === 'company-orders' && this.companyOrders.length === 0) {
      this.loadCompanyOrders();
    }
  }

  async updateCompanyInfo(): Promise<void> {
    if (this.companyInfoForm.invalid || !this.company) return;

    try {
      this.updating = true;
      const formData = this.companyInfoForm.value;

      const { data, error } = await this.supabaseService.client
        .from('companies')
        .update({
          company_name: formData.companyName,
          business_type: formData.businessType,
          tax_number: formData.taxNumber,
          website: formData.website,
          company_email: formData.companyEmail,
          company_phone: formData.companyPhone,
          company_address: formData.companyAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.company.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        return;
      }

      // Update local company data
      this.company = { ...this.company, ...formData };
      this.showSuccessMessage = true;

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);

    } catch (error) {
      console.error('Error updating company info:', error);
    } finally {
      this.updating = false;
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

  getStatusBannerClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved Partner';
      case 'rejected':
        return 'Application Rejected';
      default:
        return status;
    }
  }

  getStatusDescription(status: string): string {
    switch (status) {
      case 'pending':
        return 'Your partnership application is under review';
      case 'approved':
        return 'You have full access to partner benefits';
      case 'rejected':
        return 'Contact support for more information';
      default:
        return '';
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
    return this.companyOrders.reduce((total, order) => total + order.subtotal, 0);
  }

  getActiveOrders(): number {
    return this.companyOrders.filter(order =>
      ['pending', 'processing', 'shipped'].includes(order.status)
    ).length;
  }

  getDeliveredOrders(): number {
    return this.companyOrders.filter(order => order.status === 'delivered').length;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/partners/order-details', order.id]);
  }

  reorderItems(order: Order): void {
    // TODO: Implement reorder functionality
    console.log('Reordering items from order:', order.id);
  }

  contactSupport(): void {
    this.router.navigate(['/partners/contact']);
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

  private showOrderSuccessMessage(orderNumber: string): void {
    this.showSuccessMessage = true;
    // Hide success message after 5 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }
} 