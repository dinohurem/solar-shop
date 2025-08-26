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
                key: 'name',
                label: this.translationService.translate('admin.productName'),
                type: 'text',
                sortable: true,
                searchable: true,
                width: '25%',
                minWidth: '200px',
                maxWidth: '300px'
            },
            {
                key: 'sku',
                label: 'SKU',
                type: 'text',
                sortable: true,
                searchable: true,
                width: '15%',
                minWidth: '120px',
                maxWidth: '150px'
            },
            {
                key: 'brand',
                label: this.translationService.translate('admin.productBrand'),
                type: 'text',
                sortable: true,
                searchable: true,
                width: '15%',
                minWidth: '120px',
                maxWidth: '180px'
            },
            {
                key: 'price',
                label: this.translationService.translate('admin.productPricing'),
                type: 'number',
                sortable: true,
                format: (value) => value ? `$${value.toFixed(2)}` : '',
                width: '10%',
                minWidth: '100px'
            },
            {
                key: 'original_price',
                label: this.translationService.translate('admin.productCompareAtPrice'),
                type: 'number',
                sortable: true,
                format: (value) => value ? `$${value.toFixed(2)}` : '',
                width: '10%',
                minWidth: '120px'
            },
            {
                key: 'stock_quantity',
                label: this.translationService.translate('admin.productStock'),
                type: 'number',
                sortable: true,
                width: '8%',
                minWidth: '80px'
            },
            {
                key: 'is_active',
                label: this.translationService.translate('admin.common.status'),
                type: 'boolean',
                sortable: true,
                format: (value) => value ? this.translationService.translate('admin.common.yes') : this.translationService.translate('admin.common.no'),
                width: '8%',
                minWidth: '80px'
            },
            {
                key: 'created_at',
                label: this.translationService.translate('admin.productCreated'),
                type: 'date',
                sortable: true,
                width: '12%',
                minWidth: '120px'
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
        rowClickable: true,
        csvTemplate: [
            'name', 'sku', 'description', 'short_description', 'price', 'original_price', 'currency',
            'brand', 'model', 'category_name', 'weight', 'dimensions', 'stock_quantity',
            'is_active', 'is_featured', 'is_on_sale', 'tags', 'images', 'specifications', 'features',
            'certifications', 'estimated_delivery_days', 'installation_required', 'free_shipping',
            'related_product_sku', 'related_category_name', 'relationship_type', 'sort_order', 'relationship_active'
        ]
    };

    ngOnInit(): void {
        this.title.setTitle('Products - Solar Shop Admin');
        this.loadProducts();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/proizvodi/uredi', item.id]);
                break;
            case 'delete':
                this.deleteProduct(item);
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/proizvodi/uredi', item.id]);
    }

    onAddProduct(): void {
        this.router.navigate(['/admin/proizvodi/kreiraj']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        if (!csvData || csvData.length === 0) {
            alert('No data found in CSV file');
            return;
        }

        this.loadingSubject.next(true);

        try {
            let successCount = 0;
            let errorCount = 0;
            const errors: string[] = [];
            const createdProducts: { [key: string]: string } = {}; // Map of product name/sku to ID

            // First pass: Create products
            for (const row of csvData) {
                try {
                    // Skip relationship-only rows (rows without product name/sku)
                    if (!row.name && !row.Name && !row.sku && !row.SKU) {
                        continue;
                    }

                    // Find or create category
                    let category_id = '';
                    const categoryName = row.category_name || row.Category || '';
                    if (categoryName) {
                        const category = await this.supabaseService.getTable('categories', { name: categoryName });
                        if (category.length === 0) {
                            const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                            const newCategory = await this.supabaseService.createRecord('categories', {
                                name: categoryName,
                                slug: categorySlug,
                                is_active: true,
                                sort_order: 0
                            });
                            if (newCategory) {
                                category_id = newCategory.id;
                            }
                        } else {
                            category_id = category[0].id;
                        }
                    }

                    const productData = {
                        name: row.name || row.Name || '',
                        slug: row.slug || row.Slug || (row.name || row.Name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        description: row.description || row.Description || '',
                        short_description: row.short_description || row['Short Description'] || row.description || row.Description || '',
                        price: parseFloat(row.price || row.Price || '0'),
                        original_price: row.original_price ? parseFloat(row.original_price) : undefined,
                        currency: row.currency || row.Currency || 'EUR',
                        sku: row.sku || row.SKU || '',
                        brand: row.brand || row.Brand || '',
                        model: row.model || row.Model || '',
                        category_id: category_id || undefined,
                        weight: row.weight ? parseFloat(row.weight) : undefined,
                        dimensions: row.dimensions || undefined,
                        stock_quantity: parseInt(row.stock_quantity || row['Stock Quantity'] || '0'),
                        stock_status: parseInt(row.stock_quantity || row['Stock Quantity'] || '0') > 0 ? 'in_stock' as const : 'out_of_stock' as const,
                        is_active: (row.is_active || row['Is Active'] || 'true').toLowerCase() === 'true',
                        is_featured: (row.is_featured || row['Is Featured'] || 'false').toLowerCase() === 'true',
                        is_on_sale: (row.is_on_sale || row['Is On Sale'] || 'false').toLowerCase() === 'true',
                        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
                        images: row.images ? row.images.split(',').map((url: string, index: number) => ({
                            url: url.trim(),
                            alt: `${row.name || row.Name} - Image ${index + 1}`,
                            is_primary: index === 0,
                            order: index,
                            type: index === 0 ? 'main' : 'gallery'
                        })) : [],
                        specifications: this.parseJsonField(row.specifications),
                        features: row.features ? row.features.split('\n').map((f: string) => f.trim()).filter((f: string) => f.length > 0) : [],
                        certifications: row.certifications ? row.certifications.split(',').map((c: string) => c.trim()) : [],
                        estimated_delivery_days: parseInt(row.estimated_delivery_days || '7'),
                        installation_required: (row.installation_required || 'false').toLowerCase() === 'true',
                        free_shipping: (row.free_shipping || 'false').toLowerCase() === 'true',
                        rating_average: 0,
                        rating_count: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    // Check if product already exists
                    const existingProduct = await this.supabaseService.getTable('products', { sku: productData.sku });
                    if (existingProduct.length > 0) {
                        createdProducts[productData.sku] = existingProduct[0].id;
                        continue; // Skip creating, but remember the ID for relationships
                    }

                    const newProduct = await this.supabaseService.createRecord('products', productData);
                    if (newProduct) {
                        createdProducts[productData.sku] = newProduct.id;
                        successCount++;
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    errors.push(`Error creating product: ${JSON.stringify(row)} - ${errorMessage}`);
                    errorCount++;
                }
            }

            // Second pass: Create relationships
            for (const row of csvData) {
                try {
                    const productSku = row.sku || row.SKU;
                    const relatedProductSku = row.related_product_sku;
                    const relatedCategoryName = row.related_category_name;
                    const relationshipType = row.relationship_type;

                    // Skip if no relationship data
                    if (!productSku || !relationshipType || (!relatedProductSku && !relatedCategoryName)) {
                        continue;
                    }

                    const productId = createdProducts[productSku];
                    if (!productId) {
                        continue; // Product doesn't exist, skip relationship
                    }

                    let relatedProductId = null;
                    let relatedCategoryId = null;

                    if (relatedProductSku) {
                        relatedProductId = createdProducts[relatedProductSku];
                        if (!relatedProductId) {
                            // Try to find existing product
                            const existingRelatedProduct = await this.supabaseService.getTable('products', { sku: relatedProductSku });
                            if (existingRelatedProduct.length > 0) {
                                relatedProductId = existingRelatedProduct[0].id;
                            }
                        }
                    }

                    if (relatedCategoryName) {
                        const relatedCategory = await this.supabaseService.getTable('categories', { name: relatedCategoryName });
                        if (relatedCategory.length > 0) {
                            relatedCategoryId = relatedCategory[0].id;
                        }
                    }

                    if (relatedProductId || relatedCategoryId) {
                        const relationshipData = {
                            product_id: productId,
                            related_product_id: relatedProductId,
                            related_category_id: relatedCategoryId,
                            relationship_type: relationshipType,
                            sort_order: parseInt(row.sort_order || '0'),
                            is_active: (row.relationship_active || 'true').toLowerCase() === 'true'
                        };

                        await this.supabaseService.client
                            .from('product_relationships')
                            .insert(relationshipData);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    errors.push(`Error creating relationship: ${JSON.stringify(row)} - ${errorMessage}`);
                }
            }

            // Show results
            let message = `CSV Import Results:\n✓ Successfully processed: ${successCount} products`;
            if (errorCount > 0) {
                message += `\n✗ Errors: ${errorCount} records`;
                if (errors.length > 0) {
                    message += `\n\nFirst 5 errors:\n${errors.slice(0, 5).join('\n')}`;
                }
            }

            alert(message);
            this.loadProducts();
        } catch (error) {
            console.error('Error importing products:', error);
            alert(this.translationService.translate('admin.productImportError'));
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private parseJsonField(value: string): any {
        if (!value) return {};
        try {
            return JSON.parse(value);
        } catch {
            return {};
        }
    }

    private async loadProducts(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            const products = await this.supabaseService.getTable('products');
            this.productsSubject.next(products || []);
        } catch (error) {
            console.warn('Products table not found in database. Using mock data as placeholder.');
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