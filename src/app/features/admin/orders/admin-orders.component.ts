import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import * as OrdersActions from './store/orders.actions';
import { selectOrders, selectOrdersLoading, selectOrdersError } from './store/orders.selectors';
import { Order } from '../../../shared/models/order.model';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AdminNotificationsService } from '../shared/services/admin-notifications.service';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent, TranslatePipe],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{{ 'admin.ordersForm.title' | translate }}</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{{ 'admin.ordersForm.subtitle' | translate }}</p>
        </div>
      </div>

        <!-- Error Message -->
        <div *ngIf="error$ | async" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-red-800 font-medium">{{ (error$ | async) || 'Failed to load orders' }}</span>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="w-full overflow-hidden">
      <app-data-table
        [title]="'admin.ordersForm.customerOrders' | translate"
        [data]="(filteredOrders$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (addClicked)="onAddOrder()"
        (actionClicked)="onTableAction($event)"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)">
      </app-data-table>
      
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <app-success-modal
      [isOpen]="showSuccessModal"
      [title]="successModalTitle"
      [message]="successModalMessage"
      (closed)="onSuccessModalClosed()"
    ></app-success-modal>


  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
    private store = inject(Store);
    private router = inject(Router);
    private title = inject(Title);
    private actions$ = inject(Actions);
    private destroy$ = new Subject<void>();
    private translationService = inject(TranslationService);
    private notificationsService = inject(AdminNotificationsService);

    orders$: Observable<Order[]> = this.store.select(selectOrders);
    loading$: Observable<boolean> = this.store.select(selectOrdersLoading);
    error$: Observable<string | null> = this.store.select(selectOrdersError);

    // Filtered orders (B2C only - no B2B orders)
    filteredOrders$: Observable<Order[]> = this.orders$.pipe(
        map(orders => orders
            .filter(order => order.is_b2b !== true)
            .sort((a, b) => {
                // Sort by createdAt descending (most recent first)
                const dateA = new Date(a.createdAt || '').getTime();
                const dateB = new Date(b.createdAt || '').getTime();
                return dateB - dateA;
            })
        )
    );

    // Modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

    tableConfig!: TableConfig;

    ngOnInit(): void {
        this.title.setTitle(this.translationService.translate('admin.ordersForm.longTitle'));

        // Initialize table config with translations
        this.initializeTableConfig();

        // Subscribe to language changes to reinitialize table config
        this.translationService.currentLanguage$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.initializeTableConfig();
        });

        // Load orders
        this.store.dispatch(OrdersActions.loadOrders());

        // Mark orders section as viewed to clear notification badge
        this.notificationsService.markSectionAsViewed('orders');

        // Listen for successful delete operations (silent - no popup)
        this.actions$.pipe(
            ofType(OrdersActions.deleteOrderSuccess),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            // Order deleted successfully - no popup needed
        });

        // Listen for failed delete operations (silent - just log error)
        this.actions$.pipe(
            ofType(OrdersActions.deleteOrderFailure),
            takeUntil(this.destroy$)
        ).subscribe(({ error }) => {
            console.error('Failed to delete order:', error);
        });
    }

    private initializeTableConfig(): void {
        this.tableConfig = {
            columns: [
                {
                    key: 'orderNumber',
                    label: this.translationService.translate('admin.ordersForm.orderNumber'),
                    type: 'text',
                    sortable: true,
                    searchable: true
                },
                {
                    key: 'customerEmail',
                    label: this.translationService.translate('admin.ordersForm.customer'),
                    type: 'text',
                    sortable: true,
                    searchable: true
                },
                {
                    key: 'totalAmount',
                    label: this.translationService.translate('admin.ordersForm.total'),
                    type: 'number',
                    sortable: true,
                    format: (value) => value ? `€${value.toFixed(2)}` : '€0.00'
                },
                {
                    key: 'status',
                    label: this.translationService.translate('admin.ordersForm.status'),
                    type: 'status',
                    sortable: true,
                    searchable: true,
                    format: (value) => {
                        return this.translationService.translate(`admin.orderStatus.${value}`) || value;
                    }
                },
                {
                    key: 'paymentStatus',
                    label: this.translationService.translate('admin.ordersForm.payment'),
                    type: 'status',
                    sortable: true,
                    format: (value) => {
                        return this.translationService.translate(`admin.paymentStatus.${value}`) || value;
                    }
                },
                {
                    key: 'items',
                    label: this.translationService.translate('admin.ordersForm.items'),
                    type: 'number',
                    sortable: true,
                    format: (value) => Array.isArray(value) ? value.length.toString() : '0'
                },
                {
                    key: 'createdAt',
                    label: this.translationService.translate('admin.ordersForm.orderDate'),
                    type: 'date',
                    sortable: true
                }
            ],
            actions: [
                {
                    label: this.translationService.translate('admin.ordersForm.edit'),
                    icon: 'edit',
                    action: 'edit',
                    class: 'text-blue-600 hover:text-blue-900'
                },
                {
                    label: this.translationService.translate('admin.ordersForm.delete'),
                    icon: 'trash2',
                    action: 'delete',
                    class: 'text-red-600 hover:text-red-900'
                }
            ],
            searchable: true,
            sortable: true,
            paginated: true,
            pageSize: 20,
            allowCsvImport: false,
            allowExport: true,
            rowClickable: true
        };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/narudzbe/uredi', item.id]);
                break;
            case 'delete':
                // The delete confirmation is handled by the data-table component
                this.store.dispatch(OrdersActions.deleteOrder({ orderId: item.id }));
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/narudzbe/detalji', item.id]);
    }

    onAddOrder(): void {
        this.router.navigate(['/admin/narudzbe/kreiraj']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // Orders typically aren't imported via CSV in most systems
        // But if needed, this would handle it
    }

    private showSuccess(title: string, message: string): void {
        this.successModalTitle = title;
        this.successModalMessage = message;
        this.showSuccessModal = true;
    }

    onSuccessModalClosed(): void {
        this.showSuccessModal = false;
        this.successModalTitle = '';
        this.successModalMessage = '';
    }
}