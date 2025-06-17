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
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Orders</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage customer orders and order details</p>
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
                icon: 'eye',
                action: 'details',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Edit',
                icon: 'edit',
                action: 'edit',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Print Invoice',
                icon: 'printer',
                action: 'print',
                class: 'text-purple-600 hover:text-purple-900'
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