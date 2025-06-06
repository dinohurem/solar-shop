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
                key: 'customer_email',
                label: 'Customer',
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
            // Try to load orders from database
            const orders = await this.supabaseService.getTable('orders');
            this.ordersSubject.next(orders || []);
        } catch (error) {
            console.warn('Orders table not found in database. Using empty array as placeholder.');
            // Orders table doesn't exist yet - this is expected
            // Return empty array as placeholder
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
} 