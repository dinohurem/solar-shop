import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Orders</h1>
          <p class="mt-2 text-gray-600">Manage customer orders and transactions</p>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Orders"
        [data]="(orders$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddOrder()"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)">
      </app-data-table>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);

    private ordersSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    orders$ = this.ordersSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'order_number',
                label: 'Order #',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'customer_name',
                label: 'Customer Name',
                type: 'text',
                sortable: true,
                searchable: true,
                format: (value) => value || 'Guest'
            },
            {
                key: 'customer_email',
                label: 'Email',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'total_amount',
                label: 'Total',
                type: 'number',
                sortable: true,
                format: (value) => value ? `$${value.toFixed(2)}` : ''
            },
            {
                key: 'status',
                label: 'Status',
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'payment_status',
                label: 'Payment',
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'shipping_status',
                label: 'Shipping',
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'order_date',
                label: 'Order Date',
                type: 'date',
                sortable: true
            },
            {
                key: 'created_at',
                label: 'Created',
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: 'Edit',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>',
                action: 'edit',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Print',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>',
                action: 'print',
                class: 'text-gray-600 hover:text-gray-900'
            },
            {
                label: 'Delete',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
                action: 'delete',
                class: 'text-red-600 hover:text-red-900'
            }
        ],
        searchable: true,
        sortable: true,
        paginated: true,
        pageSize: 20,
        allowCsvImport: false, // Orders shouldn't be imported via CSV
        allowExport: true,
        rowClickable: true
    };

    ngOnInit(): void {
        this.loadOrders();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/orders/edit', item.id]);
                break;
            case 'print':
                this.printOrder(item);
                break;
            case 'delete':
                this.deleteOrder(item);
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/orders/edit', item.id]);
    }

    onAddOrder(): void {
        this.router.navigate(['/admin/orders/create']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // This should not be called since CSV import is disabled
        alert('CSV import is disabled for orders');
    }

    private async loadOrders(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            // Load all orders from database
            const orders = await this.supabaseService.getTable('orders');

            // Transform data to match table display format
            const transformedOrders = (orders || []).map((order: any) => ({
                id: order.id,
                order_number: order.order_number,
                customer_email: order.customer_email,
                customer_name: order.customer_name,
                total_amount: order.total_amount,
                status: order.status,
                payment_status: order.payment_status,
                shipping_status: order.shipping_status,
                payment_method: order.payment_method,
                order_date: order.order_date,
                created_at: order.created_at,
                updated_at: order.updated_at
            })).sort((a, b) => {
                // Sort by created_at date descending (most recent first)
                const dateA = new Date(a.created_at || a.order_date);
                const dateB = new Date(b.created_at || b.order_date);
                return dateB.getTime() - dateA.getTime();
            });

            this.ordersSubject.next(transformedOrders);
        } catch (error) {
            console.warn('Error loading orders:', error);
            this.ordersSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private printOrder(order: any): void {
        // Implement order printing functionality
        console.log('Printing order:', order);
        alert('Print functionality would be implemented here');
    }

    private async deleteOrder(order: any): Promise<void> {
        if (!confirm(`Are you sure you want to delete order "${order.order_number}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await this.supabaseService.deleteRecord('orders', order.id);
            alert('Order deleted successfully');
            this.loadOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error deleting order');
        }
    }
} 