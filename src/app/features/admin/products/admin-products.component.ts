import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, from, map, catchError, of, BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig, TableColumn, TableAction } from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent, TranslatePipe],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate"> {{ 'admin.products' | translate }}</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600"> {{ 'admin.manageYourProductCatalog' | translate }}</p>
        </div>
      </div>

        <!-- Data Table Container -->
        <div class="w-full overflow-hidden">
      <app-data-table
        title="{{ 'admin.products' | translate }}"
        [data]="(products$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddProduct()"
        (rowClicked)="onRowClick($event)"        (csvImported)="onCsvImported($event)">
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
export class AdminProductsComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    private title = inject(Title);
    private translationService = inject(TranslationService);

    private productsSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);
    products$ = this.productsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    // Modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'image_url',
                label: this.translationService.translate('admin.productImage'),
                type: 'image',
                sortable: false,
                searchable: false
            },
            {
                key: 'name',
                label: this.translationService.translate('admin.productName'),
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
                label: this.translationService.translate('admin.productBrand'),
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'price',
                label: this.translationService.translate('admin.productPricing'),
                type: 'number',
                sortable: true,
                format: (value) => value ? `$${value.toFixed(2)}` : ''
            },
            {
                key: 'stock_quantity',
                label: this.translationService.translate('admin.productStock'),
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
                label: this.translationService.translate('admin.productCreated'),
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: this.translationService.translate('common.edit'),
                icon: 'edit',
                action: 'edit',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: this.translationService.translate('common.delete'),
                icon: 'trash2',
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
            const products = await Promise.all(csvData.map(async row => {

                // find the category id from the category name from the csv file
                let category_id = '';
                const category = await this.supabaseService.getTable('categories', { name: row.category_name || row.Category || '' });
                // if category is not found, create a new category
                if (category.length === 0) {
                    // Create a category slug from the category name
                    const categorySlug = row.category_name || row.Category || ''.toLowerCase().replace(/ /g, '-');
                    const newCategory = await this.supabaseService.createRecord('categories', { name: row.category_name, slug: categorySlug });

                    // If the new category is not created, throw an error
                    if (!newCategory) {
                        throw new Error('Failed to create category from the product csv file.');
                    }

                    // wait for the new category to be created
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    category_id = newCategory?.id || '';

                    // if category_id is not found, throw an error
                    if (!category_id) {
                        throw new Error('Failed to get category id from the product csv file. Category not found.');
                    }
                } else {
                    category_id = category[0].id;
                }

                return {
                    name: row.name || row.Name || '',
                    slug: row.slug || row.Slug || '',
                    description: row.description || row.Description || '',
                    short_description: row.short_description || row['Short Description'] || '',
                    price: parseFloat(row.price || row.Price || '0'),
                    original_price: row.original_price ? parseFloat(row.original_price) : undefined,
                    currency: row.currency || row.Currency || 'USD',
                    sku: row.sku || row.SKU || '',
                    brand: row.brand || row.Brand || '',
                    model: row.model || row.Model || '',
                    category_id: category_id,
                    weight: row.weight ? parseFloat(row.weight) : undefined,
                    stock_quantity: parseInt(row.stock_quantity || row['Stock Quantity'] || '0'),
                    is_active: (row.is_active || row['Is Active'] || 'true').toLowerCase() === 'true',
                    is_featured: (row.is_featured || row['Is Featured'] || 'false').toLowerCase() === 'true',
                    tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
                    is_on_sale: (row.is_on_sale || row['Is On Sale'] || 'false').toLowerCase() === 'true',
                    images: row.images ? row.images.split(',').map((u: string) => u.trim()) : [],
                }
            }));

            // Import products one by one
            for (const product of products) {
                // Check if product already exists based on the name
                const existingProduct = await this.supabaseService.getTable('products', { name: product.name });
                if (existingProduct.length > 0) {
                    alert(this.translationService.translate('admin.productAlreadyExists', { name: product.name }));
                    continue;
                }

                await this.supabaseService.createRecord('products', product);
            }

            alert(`${this.translationService.translate('common.importSuccess')} ${products.length} ${this.translationService.translate('admin.products')}`);
            this.loadProducts();
        } catch (error) {
            console.error('Error importing products:', error);
            alert(this.translationService.translate('admin.productImportError'));
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
            console.warn('Products table not found in database. Using mock data as placeholder.');
            // Create some mock data for demonstration purposes
            const mockProducts = [
                {
                    id: '1',
                    name: 'SunPower Maxeon 3 400W Solar Panel',
                    sku: 'SP-MAX3-400',
                    brand: 'SunPower',
                    price: 299.99,
                    stock_quantity: 25,
                    is_active: true,
                    image_url: '',
                    description: 'High-efficiency solar panel with 22.6% efficiency rating',
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Tesla Powerwall 2 Battery',
                    sku: 'TESLA-PW2',
                    brand: 'Tesla',
                    price: 7999.99,
                    stock_quantity: 5,
                    is_active: true,
                    image_url: '',
                    description: '13.5 kWh home battery backup system',
                    created_at: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'SolarEdge SE7600H Inverter',
                    sku: 'SE-7600H',
                    brand: 'SolarEdge',
                    price: 1299.99,
                    stock_quantity: 12,
                    is_active: true,
                    image_url: '',
                    description: '7.6kW single-phase inverter with HD-Wave technology',
                    created_at: new Date().toISOString()
                }
            ];
            this.productsSubject.next(mockProducts);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async deleteProduct(product: any): Promise<void> {
        try {
            await this.supabaseService.deleteRecord('products', product.id);
            this.showSuccess(this.translationService.translate('common.success'), this.translationService.translate('admin.productDeletedSuccessfully'));
            this.loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showSuccess(this.translationService.translate('common.error'), this.translationService.translate('admin.productDeletedError'));
        }
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