import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, forkJoin, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { ErpIntegrationService } from '../../../shared/services/erp-integration.service';
import { ToastService } from '../../../shared/services/toast.service';
import { SortOptionsManagementComponent } from '../sort-options/sort-options-management.component';
import { LucideAngularModule, ChevronUp, ChevronDown } from 'lucide-angular';

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [CommonModule, FormsModule, DataTableComponent, SuccessModalComponent, TranslatePipe, SortOptionsManagementComponent, LucideAngularModule],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate"> {{ 'admin.products' | translate }}</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600"> {{ 'admin.manageYourProductCatalog' | translate }}</p>
          </div>

          <!-- ERP Sync Button and Last Update -->
          <div class="flex flex-col items-end space-y-2">
            <button
              (click)="manualErpSync()"
              [disabled]="erpSyncInProgress"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
              <svg *ngIf="!erpSyncInProgress" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <svg *ngIf="erpSyncInProgress" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ 'admin.syncErpStock' | translate }}
            </button>
            <span *ngIf="lastErpSyncTime" class="text-xs text-gray-500">
              {{ 'admin.lastUpdate' | translate }}: {{ lastErpSyncTime | date:'dd.MM.yyyy HH:mm' }}
            </span>
          </div>
        </div>

        <!-- Sort Options Management Section -->
        <app-sort-options-management
          (sortOptionsChanged)="onSortOptionsChanged()">
        </app-sort-options-management>

        <!-- Data Table Container -->
        <div class="w-full overflow-hidden">
      <app-data-table
        title="{{ 'admin.products' | translate }}"
        [data]="(products$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddProduct()"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)"
        (cellValueChanged)="onDisplayOrderChanged($event)">
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
    private erpService = inject(ErpIntegrationService);
    private toastService = inject(ToastService);

    private productsSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);
    products$ = this.productsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    lastErpSyncTime: string | null = null;
    erpSyncInProgress = false;

    // Modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

    // Icon references for lucide
    ChevronUpIcon = ChevronUp;
    ChevronDownIcon = ChevronDown;

    editingDisplayOrder: { [key: string]: boolean } = {};
    displayOrderValues: { [key: string]: number } = {};

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'display_order',
                label: '#',
                type: 'editable-number',
                sortable: true,
                width: '5%',
                minWidth: '60px',
                maxWidth: '80px'
            },
            {
                key: 'name',
                label: this.translationService.translate('admin.productName'),
                type: 'text',
                sortable: true,
                searchable: true,
                width: '22%',
                minWidth: '180px',
                maxWidth: '280px'
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
                label: '',
                icon: 'chevron-up',
                action: 'move-up',
                class: 'text-gray-600 hover:text-gray-900'
            },
            {
                label: '',
                icon: 'chevron-down',
                action: 'move-down',
                class: 'text-gray-600 hover:text-gray-900'
            },
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

    async ngOnInit(): Promise<void> {
        this.title.setTitle('Products - Solar Shop Admin');
        this.loadLastSyncTime();
        await this.loadProducts();
        // Check if we need to run automatic daily sync (after products are loaded)
        this.checkAndRunAutomaticSync();
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
            case 'move-up':
                this.moveProduct(item, -1);
                break;
            case 'move-down':
                this.moveProduct(item, 1);
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
            // Load products sorted by display_order
            const { data: products, error } = await this.supabaseService.client
                .from('products')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error loading products:', error);
                this.productsSubject.next([]);
            } else {
                this.productsSubject.next(products || []);
            }
        } catch (error) {
            console.warn('Products table not found in database. Using mock data as placeholder.');
        } finally {
            this.loadingSubject.next(false);
        }
    }

    /**
     * Move product up or down in display order
     */
    async moveProduct(product: any, direction: -1 | 1): Promise<void> {
        const products = this.productsSubject.value;
        const currentIndex = products.findIndex(p => p.id === product.id);
        const newIndex = currentIndex + direction;

        // Check bounds
        if (newIndex < 0 || newIndex >= products.length) {
            return;
        }

        const otherProduct = products[newIndex];

        try {
            // Swap display_order values using actual index positions
            const updates = [
                { id: product.id, display_order: newIndex },
                { id: otherProduct.id, display_order: currentIndex }
            ];

            // Update both products in database
            for (const update of updates) {
                const { error } = await this.supabaseService.client
                    .from('products')
                    .update({ display_order: update.display_order })
                    .eq('id', update.id);

                if (error) {
                    console.error('Error updating display order:', error);
                    this.toastService.showError(this.translationService.translate('common.error'));
                    return;
                }
            }

            // Reload products to reflect changes
            await this.loadProducts();
        } catch (error) {
            console.error('Error moving product:', error);
            this.toastService.showError(this.translationService.translate('common.error'));
        }
    }

    /**
     * Handle display order change via inline editing
     * If the new order number is already taken, shift other products down by one
     */
    async onDisplayOrderChanged(event: { item: any, column: string, value: number }): Promise<void> {
        if (event.column !== 'display_order') return;

        const { item, value: newDisplayOrder } = event;
        const products = this.productsSubject.value;
        const currentProduct = products.find(p => p.id === item.id);

        if (!currentProduct || currentProduct.display_order === newDisplayOrder) {
            return; // No change
        }

        try {
            // Check if newDisplayOrder is already taken
            const conflictingProduct = products.find(p => p.display_order === newDisplayOrder && p.id !== item.id);

            if (conflictingProduct) {
                // Shift all products at or above the new position down by 1
                const productsToShift = products.filter(p =>
                    p.id !== item.id && p.display_order >= newDisplayOrder
                );

                // Update all affected products
                const updates = [
                    { id: item.id, display_order: newDisplayOrder },
                    ...productsToShift.map(p => ({ id: p.id, display_order: p.display_order + 1 }))
                ];

                for (const update of updates) {
                    const { error } = await this.supabaseService.client
                        .from('products')
                        .update({ display_order: update.display_order })
                        .eq('id', update.id);

                    if (error) {
                        console.error('Error updating display order:', error);
                        this.toastService.showError(this.translationService.translate('common.error'));
                        return;
                    }
                }
            } else {
                // No conflict, just update this product
                const { error } = await this.supabaseService.client
                    .from('products')
                    .update({ display_order: newDisplayOrder })
                    .eq('id', item.id);

                if (error) {
                    console.error('Error updating display order:', error);
                    this.toastService.showError(this.translationService.translate('common.error'));
                    return;
                }
            }

            // Reload products to reflect changes
            await this.loadProducts();
        } catch (error) {
            console.error('Error updating display order:', error);
            this.toastService.showError(this.translationService.translate('common.error'));
        }
    }

    /**
     * Load last sync time from localStorage
     */
    private loadLastSyncTime(): void {
        const lastSync = localStorage.getItem('lastErpSyncTime');
        if (lastSync) {
            this.lastErpSyncTime = lastSync;
        }
    }

    /**
     * Save sync time to localStorage
     */
    private saveLastSyncTime(): void {
        const now = new Date().toISOString();
        this.lastErpSyncTime = now;
        localStorage.setItem('lastErpSyncTime', now);
    }

    /**
     * Check if automatic sync should run (once per day)
     */
    private checkAndRunAutomaticSync(): void {
        const lastSync = localStorage.getItem('lastErpSyncTime');

        if (!lastSync) {
            // Never synced before, run sync
            console.log('[Admin Products] No previous sync found, running automatic sync...');
            this.autoUpdateErpStock();
            return;
        }

        const lastSyncDate = new Date(lastSync);
        const now = new Date();
        const hoursSinceLastSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

        // Run automatic sync if more than 24 hours have passed
        if (hoursSinceLastSync >= 24) {
            console.log('[Admin Products] Last sync was more than 24 hours ago, running automatic sync...');
            this.autoUpdateErpStock();
        } else {
            console.log(`[Admin Products] Last sync was ${Math.round(hoursSinceLastSync)} hours ago, skipping automatic sync.`);
        }
    }

    /**
     * Manual ERP sync triggered by button
     */
    async manualErpSync(): Promise<void> {
        await this.autoUpdateErpStock();
    }

    /**
     * Automatically update ERP stock for all products with progress tracking
     */
    private async autoUpdateErpStock(): Promise<void> {
        if (this.erpSyncInProgress) {
            return; // Prevent multiple concurrent updates
        }

        this.erpSyncInProgress = true;
        console.log('[Admin Products] Starting ERP stock update...');

        let toastId: string | null = null;

        try {
            // Get products directly from subject (they're already loaded by this point)
            const products = this.productsSubject.value;

            if (!products || products.length === 0) {
                console.log('[Admin Products] No products to update');
                return;
            }

            // Get unique SKUs from products
            const skus = [...new Set(products.map(p => p.sku).filter(Boolean))];
            const totalBatches = Math.ceil(skus.length / 3);
            console.log(`[Admin Products] Updating stock for ${skus.length} products...`);

            // Show initial loading toast with progress
            toastId = this.toastService.showLoading(
                `${this.translationService.translate('admin.erpSyncStarted')} - ${this.translationService.translate('admin.processingProducts')}: 0/${skus.length}`
            );

            // Fetch ERP stock for all products in batches with rate limiting
            const batchSize = 3; // Very small batch size to avoid rate limits
            const delayBetweenBatches = 2000; // 2 second delay between batches
            const stockResponses: any[] = [];
            let processedCount = 0;

            // Helper function to delay execution
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // Process batches sequentially with delays
            for (let i = 0; i < skus.length; i += batchSize) {
                const batch = skus.slice(i, i + batchSize);
                const currentBatch = Math.floor(i / batchSize) + 1;
                console.log(`[Admin Products] Processing batch ${currentBatch} of ${totalBatches} (${batch.length} SKUs)`);

                // Calculate progress percentage
                const progress = Math.round((currentBatch / totalBatches) * 100);

                // Update progress toast
                this.toastService.updateLoadingProgress(
                    toastId,
                    `${this.translationService.translate('admin.erpSyncInProgress')} - ${this.translationService.translate('admin.processingBatch')} ${currentBatch}/${totalBatches}`,
                    progress
                );

                const batchRequests = batch.map(sku =>
                    this.erpService.getStockBySku(sku).pipe(
                        catchError(err => {
                            console.error(`[Admin Products] Error fetching stock for ${sku}:`, err);
                            return of({ success: false, error: err.message });
                        })
                    )
                );

                try {
                    const batchResults = await forkJoin(batchRequests).toPromise();
                    if (batchResults) {
                        stockResponses.push(...batchResults);
                        processedCount += batchResults.length;
                    } else {
                        // Add empty responses if batchResults is undefined
                        batch.forEach(() => stockResponses.push({ success: false, error: 'No results' }));
                        processedCount += batch.length;
                    }
                } catch (err) {
                    console.error(`[Admin Products] Batch failed:`, err);
                    // Add empty responses for failed batch
                    batch.forEach(() => stockResponses.push({ success: false, error: 'Batch failed' }));
                    processedCount += batch.length;
                }

                // Add delay between batches to avoid rate limiting (except for last batch)
                if (i + batchSize < skus.length) {
                    console.log(`[Admin Products] Waiting ${delayBetweenBatches}ms before next batch...`);
                    await delay(delayBetweenBatches);
                }
            }

            // Update products with ERP stock in memory and database
            const updatedProducts = [];
            const dbUpdatePromises = [];

            for (const product of products) {
                if (!product.sku) {
                    updatedProducts.push(product);
                    continue;
                }

                // Find stock response for this product
                const stockIndex = skus.indexOf(product.sku);
                if (stockIndex === -1) {
                    updatedProducts.push(product);
                    continue;
                }

                const stockResponse = stockResponses[stockIndex];
                // Skip if ERP didn't return valid data or if the data array is empty
                if (stockResponse?.success && 'data' in stockResponse && stockResponse.data && Array.isArray(stockResponse.data) && stockResponse.data.length > 0) {
                    // Calculate total stock across all units
                    const totalStock = stockResponse.data.reduce((sum: number, item: any) => sum + item.quantity, 0);

                    const updatedProduct = {
                        ...product,
                        erp_stock: totalStock,
                        erp_stock_updated_at: new Date().toISOString(),
                        stock_quantity: totalStock
                    };

                    updatedProducts.push(updatedProduct);

                    // Update database (use partial update to avoid type errors)
                    const updatePromise = this.supabaseService.updateRecord('products', product.id, {
                        erp_stock: totalStock,
                        erp_stock_updated_at: new Date().toISOString(),
                        stock_quantity: totalStock
                    } as any).catch(err => {
                        console.error(`[Admin Products] Failed to update DB for product ${product.id}:`, err);
                    });

                    dbUpdatePromises.push(updatePromise);
                } else {
                    // Skip database update if SKU not found in ERP or no data returned
                    if (!stockResponse?.success) {
                        console.log(`[Admin Products] SKU ${product.sku} not found in ERP, skipping DB update`);
                    }
                    updatedProducts.push(product);
                }
            }

            // Wait for all database updates to complete
            await Promise.all(dbUpdatePromises);

            this.productsSubject.next(updatedProducts);
            console.log('[Admin Products] ERP stock update completed successfully (memory + database)');

            // Save sync time
            this.saveLastSyncTime();
            const successfulUpdates = dbUpdatePromises.length;

            // Complete the loading toast with success message
            this.toastService.completeLoading(
                toastId,
                `${this.translationService.translate('admin.erpSyncCompleted')} - ${successfulUpdates} ${this.translationService.translate('admin.productsUpdated')}`
            );

            // Auto-remove success toast after 5 seconds
            setTimeout(() => {
                this.toastService.removeToast(toastId!);
            }, 5000);

        } catch (error) {
            console.error('[Admin Products] Error updating ERP stock:', error);

            // If we have a toast ID, update it to show error
            if (toastId) {
                this.toastService.failLoading(
                    toastId,
                    this.translationService.translate('admin.erpSyncFailed')
                );

                // Auto-remove error toast after 5 seconds
                setTimeout(() => {
                    this.toastService.removeToast(toastId!);
                }, 5000);
            } else {
                // Fallback if no toast was created
                this.toastService.showError(
                    this.translationService.translate('admin.erpSyncFailed')
                );
            }
        } finally {
            this.erpSyncInProgress = false;
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

    onSortOptionsChanged(): void {
        // Sort options have been updated, components will automatically refresh via the service
        console.log('[Admin Products] Sort options changed');
    }
}