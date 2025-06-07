import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, from, map, catchError, of, BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig, TableColumn, TableAction } from '../shared/data-table/data-table.component';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Products</h1>
          <p class="mt-2 text-gray-600">Manage your product catalog</p>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Products"
        [data]="(products$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddProduct()"
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
export class AdminProductsComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    private title = inject(Title);

    private productsSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    products$ = this.productsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'image_url',
                label: 'Image',
                type: 'image',
                sortable: false,
                searchable: false
            },
            {
                key: 'name',
                label: 'Name',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'sku',
                label: 'SKU',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'brand',
                label: 'Brand',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'price',
                label: 'Price',
                type: 'number',
                sortable: true,
                format: (value) => value ? `$${value.toFixed(2)}` : ''
            },
            {
                key: 'stock_quantity',
                label: 'Stock',
                type: 'number',
                sortable: true
            },
            {
                key: 'is_active',
                label: 'Status',
                type: 'boolean',
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
        allowCsvImport: true,
        allowExport: true,
        rowClickable: true
    };

    ngOnInit(): void {
        this.title.setTitle('Products - Solar Shop Admin');
        this.loadProducts();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/products/edit', item.id]);
                break;
            case 'delete':
                this.deleteProduct(item);
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/products/edit', item.id]);
    }

    onAddProduct(): void {
        this.router.navigate(['/admin/products/create']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        if (!csvData || csvData.length === 0) {
            alert('No data found in CSV file');
            return;
        }

        this.loadingSubject.next(true);

        try {
            // Map CSV data to product format
            const products = csvData.map(row => ({
                name: row.name || row.Name || '',
                description: row.description || row.Description || '',
                short_description: row.short_description || row['Short Description'] || '',
                price: parseFloat(row.price || row.Price || '0'),
                original_price: row.original_price ? parseFloat(row.original_price) : undefined,
                currency: row.currency || row.Currency || 'USD',
                sku: row.sku || row.SKU || '',
                brand: row.brand || row.Brand || '',
                category_id: row.category_id || row['Category ID'] || undefined,
                weight: row.weight ? parseFloat(row.weight) : undefined,
                dimensions: row.dimensions || undefined,
                stock_quantity: parseInt(row.stock_quantity || row['Stock Quantity'] || '0'),
                stock_threshold: parseInt(row.stock_threshold || row['Stock Threshold'] || '5'),
                is_active: (row.is_active || row['Is Active'] || 'true').toLowerCase() === 'true',
                is_featured: (row.is_featured || row['Is Featured'] || 'false').toLowerCase() === 'true',
                tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
                image_url: row.image_url || row['Image URL'] || undefined,
                gallery_urls: row.gallery_urls ? row.gallery_urls.split(',').map((u: string) => u.trim()) : []
            }));

            // Import products one by one
            for (const product of products) {
                await this.supabaseService.createRecord('products', product);
            }

            alert(`Successfully imported ${products.length} products`);
            this.loadProducts();
        } catch (error) {
            console.error('Error importing products:', error);
            alert('Error importing products. Please check the CSV format.');
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async loadProducts(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            const products = await this.supabaseService.getTable('products');
            this.productsSubject.next(products || []);
        } catch (error) {
            console.error('Error loading products:', error);
            this.productsSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async deleteProduct(product: any): Promise<void> {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return;
        }

        try {
            await this.supabaseService.deleteRecord('products', product.id);
            alert('Product deleted successfully');
            this.loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    }
} 