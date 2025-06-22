import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import * as OrdersActions from './store/orders.actions';
import { selectOrders, selectOrdersLoading, selectOrdersError } from './store/orders.selectors';
import { Order } from '../../../shared/models/order.model';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent, DeleteConfirmationModalComponent],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Orders</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage customer orders and order details</p>
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
            title="Customer Orders"
        [data]="(orders$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
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

    <!-- Delete Confirmation Modal -->
    <app-delete-confirmation-modal
      [isOpen]="showDeleteModal"
      [title]="'Confirm Order Deletion'"
      [message]="'Are you sure you want to delete this order? This action cannot be undone.'"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="onDeleteCancelled()"
    ></app-delete-confirmation-modal>
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

    orders$: Observable<Order[]> = this.store.select(selectOrders);
    loading$: Observable<boolean> = this.store.select(selectOrdersLoading);
    error$: Observable<string | null> = this.store.select(selectOrdersError);

    // Modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';
    showDeleteModal = false;
    pendingDeleteOrder: any = null;

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'orderNumber',
                label: 'Order #',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'customerEmail',
                label: 'Customer',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'totalAmount',
                label: 'Total',
                type: 'number',
                sortable: true,
                format: (value) => value ? `€${value.toFixed(2)}` : '€0.00'
            },
            {
                key: 'status',
                label: 'Status',
                type: 'status',
                sortable: true,
                searchable: true,
                format: (value) => {
                    return this.translationService.translate(`admin.orderStatus.${value}`) || value;
                }
            },
            {
                key: 'paymentStatus',
                label: 'Payment',
                type: 'status',
                sortable: true,
                format: (value) => {
                    return this.translationService.translate(`admin.paymentStatus.${value}`) || value;
                }
            },
            {
                key: 'items',
                label: 'Items',
                type: 'number',
                sortable: true,
                format: (value) => Array.isArray(value) ? value.length.toString() : '0'
            },
            {
                key: 'createdAt',
                label: 'Order Date',
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: 'Edit',
                icon: 'edit',
                action: 'edit',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Delete',
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

    ngOnInit(): void {
        this.title.setTitle('Orders - Solar Shop Admin');

        // Load orders
        this.store.dispatch(OrdersActions.loadOrders());

        // Listen for successful delete operations
        this.actions$.pipe(
            ofType(OrdersActions.deleteOrderSuccess),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.showSuccess('Success', 'Order deleted successfully');
        });

        // Listen for failed delete operations
        this.actions$.pipe(
            ofType(OrdersActions.deleteOrderFailure),
            takeUntil(this.destroy$)
        ).subscribe(({ error }) => {
            this.showSuccess('Error', `Failed to delete order: ${error}`);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/orders/edit', item.id]);
                break;
            case 'delete':
                this.pendingDeleteOrder = item;
                this.showDeleteModal = true;
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/orders/details', item.id]);
    }

    onDeleteConfirmed(): void {
        if (this.pendingDeleteOrder) {
            this.store.dispatch(OrdersActions.deleteOrder({ orderId: this.pendingDeleteOrder.id }));
        }
        this.onDeleteCancelled();
    }

    onDeleteCancelled(): void {
        this.showDeleteModal = false;
        this.pendingDeleteOrder = null;
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // Orders typically aren't imported via CSV in most systems
        // But if needed, this would handle it
        this.showSuccess('Info', 'Order import functionality would be implemented here');
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