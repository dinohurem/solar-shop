import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import * as OrdersActions from '../orders/store/orders.actions';
import { selectOrders, selectOrdersLoading, selectOrdersError } from '../orders/store/orders.selectors';
import { Order } from '../../../shared/models/order.model';
import { Actions, ofType } from '@ngrx/effects';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-admin-orders-partners',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent, TranslatePipe],
    template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ 'admin.partnerOrdersForm.title' | translate }}</h1>
          <p class="mt-2 text-gray-600">{{ 'admin.partnerOrdersForm.subtitle' | translate }}</p>
        </div>
      </div>
      <app-data-table
        [title]="'admin.partnerOrdersForm.b2bOrders' | translate"
        [data]="(filteredOrders$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)">
      </app-data-table>
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
export class AdminOrdersPartnersComponent implements OnInit {
    private store = inject(Store);
    private router = inject(Router);
    private title = inject(Title);
    private actions$ = inject(Actions);
    private destroy$ = new Subject<void>();
    private translationService = inject(TranslationService);

    orders$: Observable<Order[]> = this.store.select(selectOrders);
    loading$: Observable<boolean> = this.store.select(selectOrdersLoading);
    error$: Observable<string | null> = this.store.select(selectOrdersError);

    // Filtered orders (B2B only)
    filteredOrders$: Observable<Order[]> = this.orders$.pipe(
        map(orders => orders
            .filter(order => order.is_b2b === true)
            .sort((a, b) => {
                // Sort by createdAt ascending (oldest first)
                const dateA = new Date(a.createdAt || '').getTime();
                const dateB = new Date(b.createdAt || '').getTime();
                return dateA - dateB;
            })
        )
    );

    // Modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'orderNumber',
                label: this.translationService.translate('admin.partnerOrdersForm.orderNumber'),
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'customerEmail',
                label: this.translationService.translate('admin.partnerOrdersForm.customer'),
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'totalAmount',
                label: this.translationService.translate('admin.partnerOrdersForm.total'),
                type: 'number',
                sortable: true,
                format: (value) => value ? `€${value.toFixed(2)}` : '€0.00'
            },
            {
                key: 'status',
                label: this.translationService.translate('admin.partnerOrdersForm.status'),
                type: 'status',
                sortable: true,
                searchable: true,
                format: (value) => {
                    return this.translationService.translate(`admin.orderStatus.${value}`) || value;
                }
            },
            {
                key: 'paymentStatus',
                label: this.translationService.translate('admin.partnerOrdersForm.payment'),
                type: 'status',
                sortable: true,
                format: (value) => {
                    return this.translationService.translate(`admin.paymentStatus.${value}`) || value;
                }
            },
            {
                key: 'items',
                label: this.translationService.translate('admin.partnerOrdersForm.items'),
                type: 'number',
                sortable: true,
                format: (value) => Array.isArray(value) ? value.length.toString() : '0'
            },
            {
                key: 'createdAt',
                label: this.translationService.translate('admin.partnerOrdersForm.orderDate'),
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: this.translationService.translate('admin.partnerOrdersForm.edit'),
                icon: 'edit',
                action: 'edit',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: this.translationService.translate('admin.partnerOrdersForm.delete'),
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
        this.title.setTitle(this.translationService.translate('admin.partnerOrdersForm.longTitle'));

        // Load orders
        this.store.dispatch(OrdersActions.loadOrders());

        // Listen for successful delete operations
        this.actions$.pipe(
            ofType(OrdersActions.deleteOrderSuccess),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.showSuccess(this.translationService.translate('admin.partnerOrdersForm.success'), this.translationService.translate('admin.partnerOrdersForm.orderDeletedSuccessfully'));
        });

        // Listen for failed delete operations
        this.actions$.pipe(
            ofType(OrdersActions.deleteOrderFailure),
            takeUntil(this.destroy$)
        ).subscribe(({ error }) => {
            this.showSuccess(this.translationService.translate('admin.partnerOrdersForm.error'), this.translationService.translate('admin.partnerOrdersForm.failedToDeleteOrder', { error }));
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
                // The delete confirmation is handled by the data-table component
                this.store.dispatch(OrdersActions.deleteOrder({ orderId: item.id }));
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/orders/details', item.id]);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // Partner orders typically aren't imported via CSV in most systems
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