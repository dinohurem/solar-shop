import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
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
          <p class="mt-2 text-gray-600">Manage customer orders and order details</p>
        </div>
      </div>

      <!-- Data Table -->
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
    private title = inject(Title);

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
                format: (value) => value ? `€${value.toFixed(2)}` : '€0.00'
            },
            {
                key: 'status',
                label: 'Status',
                type: 'status',
                sortable: true,
                searchable: true,
                format: (value) => {
                    const statusMap: { [key: string]: string } = {
                        'pending': 'Pending',
                        'confirmed': 'Confirmed',
                        'processing': 'Processing',
                        'shipped': 'Shipped',
                        'delivered': 'Delivered',
                        'cancelled': 'Cancelled',
                        'refunded': 'Refunded'
                    };
                    return statusMap[value] || value;
                }
            },
            {
                key: 'payment_status',
                label: 'Payment',
                type: 'status',
                sortable: true,
                format: (value) => {
                    const statusMap: { [key: string]: string } = {
                        'pending': 'Pending',
                        'paid': 'Paid',
                        'failed': 'Failed',
                        'refunded': 'Refunded'
                    };
                    return statusMap[value] || value;
                }
            },
            {
                key: 'order_items_count',
                label: 'Items',
                type: 'number',
                sortable: true,
                format: (value) => value || 0
            },
            {
                key: 'created_at',
                label: 'Order Date',
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: 'View Details',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>',
                action: 'details',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Edit Status',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>',
                action: 'edit',
                class: 'text-green-600 hover:text-green-900'
            },
            {
                label: 'Print Invoice',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>',
                action: 'print',
                class: 'text-purple-600 hover:text-purple-900'
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
        allowCsvImport: false,
        allowExport: true,
        rowClickable: true
    };

    ngOnInit(): void {
        this.title.setTitle('Orders - Solar Shop Admin');
        this.loadOrders();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'details':
                this.router.navigate(['/admin/orders/details', item.id]);
                break;
            case 'edit':
                this.router.navigate(['/admin/orders/edit', item.id]);
                break;
            case 'print':
                this.printInvoice(item);
                break;
            case 'delete':
                this.deleteOrder(item);
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/orders/details', item.id]);
    }

    printInvoice(order: any): void {
        // In a real implementation, this would generate and print an invoice
        console.log('Printing invoice for order:', order.order_number);
        alert(`Invoice printing for order ${order.order_number} would start here`);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // Orders typically aren't imported via CSV in most systems
        // But if needed, this would handle it
        alert('Order import functionality would be implemented here');
    }

    private async loadOrders(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            // Load orders with related data
            const orders = await this.supabaseService.getTable('orders');

            // For each order, load related items
            const ordersWithItems = await Promise.all(
                (orders || []).map(async (order: any) => {
                    try {
                        // Load order items (simulate for now since getOrderItems doesn't exist)
                        // In a real implementation, you would have an order_items table
                        const orderItems: any[] = [];
                        return {
                            ...order,
                            order_items: orderItems,
                            order_items_count: orderItems.length
                        };
                    } catch {
                        return {
                            ...order,
                            order_items: [],
                            order_items_count: 0
                        };
                    }
                })
            );

            this.ordersSubject.next(ordersWithItems);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.ordersSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
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