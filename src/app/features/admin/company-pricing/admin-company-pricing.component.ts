import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { ToastService } from '../../../shared/services/toast.service';

interface CompanyPricingSummary {
  id: string;
  company_id: string;
  company_name: string;
  product_count: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-admin-company-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ 'admin.companyPricingForm.title' | translate }}</h1>
          <p class="mt-2 text-gray-600">{{ 'admin.companyPricingForm.subtitle' | translate }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <button
            (click)="toggleGlobalBulkPricing()"
            class="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-md hover:bg-purple-200 transition-colors">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
              <span>{{ 'admin.companyPricingForm.bulkPricing' | translate }}</span>
            </div>
          </button>
        </div>
      </div>
      <app-data-table
        [title]="'admin.companyPricingForm.companyPrices' | translate"
        [data]="(companyPricing$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAdd()"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)"
        (exportClicked)="onExport()">
      </app-data-table>

      <!-- Global Bulk Pricing Modal -->
      <div *ngIf="showGlobalBulkPricing" class="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-purple-900 mb-4">{{ 'admin.companyPricingForm.bulkPricing' | translate }}</h3>

        <div class="bg-purple-100 border border-purple-300 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-purple-900 mb-3">{{ 'admin.companyPricingForm.applyBulkDiscount' | translate }}</h4>
          <div class="flex items-end space-x-4 mb-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-purple-700 mb-2">
                {{ 'admin.companyPricingForm.discountPercentage' | translate }}
              </label>
              <input
                type="number"
                [(ngModel)]="globalBulkDiscountPercentage"
                min="0"
                max="100"
                step="0.1"
                class="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.0">
            </div>
          </div>

          <!-- Preset Buttons -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              *ngFor="let preset of [5, 10, 15, 20, 25, 30]"
              (click)="applyGlobalPresetDiscount(preset)"
              class="px-3 py-1 bg-purple-200 hover:bg-purple-300 text-purple-800 rounded text-sm transition-colors">
              -{{ preset }}% {{ 'admin.companyPricingForm.discount' | translate }}
            </button>
          </div>

          <div class="flex space-x-3 mb-4">
            <button
              (click)="applyGlobalBulkDiscountToAll()"
              [disabled]="!globalBulkDiscountPercentage || globalBulkDiscountPercentage <= 0 || globalBulkDiscountPercentage > 100"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              {{ 'admin.companyPricingForm.applyToAll' | translate }}
            </button>
          </div>

          <p class="text-xs text-purple-600 mb-4">
            {{ 'admin.companyPricingForm.bulkDiscountHint' | translate }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class AdminCompanyPricingComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  translationService = inject(TranslationService);
  private companyPricingSubject = new BehaviorSubject<CompanyPricingSummary[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  companyPricing$ = this.companyPricingSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  // Global bulk pricing properties
  showGlobalBulkPricing = false;
  globalBulkDiscountPercentage: number = 0;

  tableConfig: TableConfig = {
    columns: [
      { key: 'company_name', label: this.translationService.translate('admin.companyPricingForm.companyName'), type: 'text', sortable: true, searchable: true },
      { key: 'company_id', label: this.translationService.translate('admin.companyPricingForm.companyId'), type: 'text', sortable: true, searchable: true },
      { key: 'product_count', label: this.translationService.translate('admin.companyPricingForm.productsWithCustomPricing'), type: 'number', sortable: true },
      { key: 'created_at', label: this.translationService.translate('admin.companyPricingForm.firstCreated'), type: 'date', sortable: true },
      { key: 'updated_at', label: this.translationService.translate('admin.companyPricingForm.lastUpdated'), type: 'date', sortable: true }
    ],
    actions: [
      { label: this.translationService.translate('common.actions'), icon: 'trash2', action: 'delete', class: 'text-red-600 hover:text-red-900' }
    ],
    searchable: true,
    sortable: true,
    paginated: true,
    pageSize: 20,
    allowCsvImport: true,
    allowExport: true,
    rowClickable: true,
    customExportHandler: true,
    csvTemplate: [
      'company_id', 'company_name', 'company_email', 'product_id', 'product_sku', 'product_name',
      'price_tier_1', 'quantity_tier_1', 'price_tier_2', 'quantity_tier_2',
      'price_tier_3', 'quantity_tier_3', 'minimum_order', 'update_mode'
    ]
  };

  ngOnInit(): void {
    this.loadCompanyPricing();
  }

  onTableAction(event: { action: string; item: CompanyPricingSummary }): void {
    const { action, item } = event;
    if (action === 'delete') {
      this.deleteAllCompanyPricing(item);
    }
  }

  onRowClick(item: CompanyPricingSummary): void {
    this.router.navigate(['/admin/cijene-tvrtki/kreiraj'], {
      queryParams: { companyId: item.company_id }
    });
  }

  onAdd(): void {
    this.router.navigate(['/admin/cijene-tvrtki/kreiraj']);
  }

  async onCsvImported(csvData: any[]): Promise<void> {
    if (!csvData || csvData.length === 0) {
      const message = this.translationService.translate('admin.companyPricingForm.noDataFoundInCsv');
      alert(message);
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const companiesCache = new Map<string, any>();
      const productsCache = new Map<string, any>();

      for (const row of csvData) {
        try {
          // Support flexible field names for company identification
          const companyIdentifier = row.company_id || row.company_name || row.company_email;
          const productIdentifier = row.product_id || row.product_sku || row.product_name;

          // Validate required fields
          if (!companyIdentifier || !productIdentifier || !row.price_tier_1) {
            errors.push(`Row missing required fields (company_id/name/email, product_id/sku/name, price_tier_1): ${JSON.stringify(row)}`);
            errorCount++;
            continue;
          }

          // Find or validate company
          let company = null;
          if (row.company_id) {
            // Direct ID lookup
            if (companiesCache.has(row.company_id)) {
              company = companiesCache.get(row.company_id);
            } else {
              company = await this.supabase.getTableById('companies', row.company_id);
              if (company) companiesCache.set(row.company_id, company);
            }
          } else if (row.company_name) {
            // Lookup by name
            if (companiesCache.has(row.company_name)) {
              company = companiesCache.get(row.company_name);
            } else {
              const companies = await this.supabase.getTable('companies', { company_name: row.company_name });
              if (companies.length > 0) {
                company = companies[0];
                companiesCache.set(row.company_name, company);
              }
            }
          } else if (row.company_email) {
            // Lookup by email
            if (companiesCache.has(row.company_email)) {
              company = companiesCache.get(row.company_email);
            } else {
              const companies = await this.supabase.getTable('companies', { email: row.company_email });
              if (companies.length > 0) {
                company = companies[0];
                companiesCache.set(row.company_email, company);
              }
            }
          }

          if (!company) {
            errors.push(`Company not found: ${companyIdentifier}`);
            errorCount++;
            continue;
          }

          // Find or validate product
          let product = null;
          if (row.product_id) {
            // Direct ID lookup
            if (productsCache.has(row.product_id)) {
              product = productsCache.get(row.product_id);
            } else {
              product = await this.supabase.getTableById('products', row.product_id);
              if (product) productsCache.set(row.product_id, product);
            }
          } else if (row.product_sku) {
            // Lookup by SKU
            if (productsCache.has(row.product_sku)) {
              product = productsCache.get(row.product_sku);
            } else {
              const products = await this.supabase.getTable('products', { sku: row.product_sku });
              if (products.length > 0) {
                product = products[0];
                productsCache.set(row.product_sku, product);
              }
            }
          } else if (row.product_name) {
            // Lookup by name
            if (productsCache.has(row.product_name)) {
              product = productsCache.get(row.product_name);
            } else {
              const products = await this.supabase.getTable('products', { name: row.product_name });
              if (products.length > 0) {
                product = products[0];
                productsCache.set(row.product_name, product);
              }
            }
          }

          if (!product) {
            errors.push(`Product not found: ${productIdentifier}`);
            errorCount++;
            continue;
          }

          // Validate tier pricing logic
          const tier1Price = parseFloat(row.price_tier_1) || 0;
          const tier1Qty = parseInt(row.quantity_tier_1) || 1;
          const tier2Price = row.price_tier_2 ? parseFloat(row.price_tier_2) : null;
          const tier2Qty = row.quantity_tier_2 ? parseInt(row.quantity_tier_2) : null;
          const tier3Price = row.price_tier_3 ? parseFloat(row.price_tier_3) : null;
          const tier3Qty = row.quantity_tier_3 ? parseInt(row.quantity_tier_3) : null;
          const minimumOrder = parseInt(row.minimum_order) || 1;

          // Validate tier quantity progression
          if (tier2Qty && tier2Qty <= tier1Qty) {
            errors.push(`Tier 2 quantity (${tier2Qty}) must be greater than tier 1 quantity (${tier1Qty}) for ${companyIdentifier} - ${productIdentifier}`);
            errorCount++;
            continue;
          }
          if (tier3Qty && (!tier2Qty || tier3Qty <= tier2Qty)) {
            errors.push(`Tier 3 quantity (${tier3Qty}) must be greater than tier 2 quantity (${tier2Qty}) for ${companyIdentifier} - ${productIdentifier}`);
            errorCount++;
            continue;
          }

          // Check if pricing already exists
          const { data: existingPricing, error: checkError } = await this.supabase.client
            .from('company_pricing')
            .select('*')
            .eq('company_id', company.id)
            .eq('product_id', product.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing pricing:', checkError);
            errors.push(`Error checking existing pricing for company ${company.company_name || company.id} and product ${product.name || product.id}`);
            errorCount++;
            continue;
          }

          // Prepare pricing data with enhanced validation
          const pricingData: any = {
            company_id: company.id,
            product_id: product.id,
            price_tier_1: tier1Price,
            quantity_tier_1: tier1Qty,
            price_tier_2: tier2Price,
            quantity_tier_2: tier2Qty,
            price_tier_3: tier3Price,
            quantity_tier_3: tier3Qty,
            minimum_order: Math.max(minimumOrder, 1), // Ensure minimum order is at least 1
            updated_at: new Date().toISOString()
          };

          // Handle update mode
          const updateMode = row.update_mode || 'upsert'; // upsert, update_only, insert_only

          if (existingPricing) {
            if (updateMode === 'insert_only') {
              continue; // Skip if exists and mode is insert_only
            }

            const { error: updateError } = await this.supabase.client
              .from('company_pricing')
              .update(pricingData)
              .eq('id', existingPricing.id);

            if (updateError) {
              console.error('Error updating company pricing:', updateError);
              errors.push(`Error updating pricing for company ${company.company_name || company.id} and product ${product.name || product.id}: ${updateError.message}`);
              errorCount++;
              continue;
            }
          } else {
            if (updateMode === 'update_only') {
              continue; // Skip if doesn't exist and mode is update_only
            }

            pricingData.created_at = new Date().toISOString();
            const { error: insertError } = await this.supabase.client
              .from('company_pricing')
              .insert(pricingData);

            if (insertError) {
              console.error('Error inserting company pricing:', insertError);
              errors.push(`Error inserting pricing for company ${company.company_name || company.id} and product ${product.name || product.id}: ${insertError.message}`);
              errorCount++;
              continue;
            }
          }

          successCount++;
        } catch (error) {
          console.error('Error processing row:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error processing row: ${JSON.stringify(row)} - ${errorMessage}`);
          errorCount++;
        }
      }

      // Show detailed results
      let message = `CSV Import Results:\n✓ Successfully processed: ${successCount} pricing records`;
      if (errorCount > 0) {
        message += `\n✗ Errors: ${errorCount} records`;
        if (errors.length > 0) {
          message += `\n\nFirst 5 errors:\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n\n... and ${errors.length - 5} more errors. Check console for full details.`;
          }
        }
      }

      // Log all errors to console for debugging
      if (errors.length > 0) {
        console.error('All import errors:', errors);
      }

      alert(message);

      // Reload data
      await this.loadCompanyPricing();
    } catch (error) {
      console.error('Error importing CSV:', error);
      const errorMessage = this.translationService.translate('admin.companyPricingForm.errorImportingCsv');
      alert(errorMessage);
    }
  }

  async onExport(): Promise<void> {
    try {
      // Get all company pricing data with tier pricing
      const allPricing = await this.supabase.getTable('company_pricing');
      if (!allPricing || allPricing.length === 0) {
        const message = this.translationService.translate('admin.companyPricingForm.noCompanyPricingDataToExport');
        alert(message);
        return;
      }

      // Define comprehensive CSV headers
      const headers = [
        'company_id', 'company_name', 'company_email', 'product_id', 'product_sku', 'product_name',
        'price_tier_1', 'quantity_tier_1', 'price_tier_2', 'quantity_tier_2',
        'price_tier_3', 'quantity_tier_3', 'minimum_order', 'update_mode'
      ];

      // Get company and product details for enhanced export
      const companyIds = [...new Set(allPricing.map((p: any) => p.company_id))];
      const productIds = [...new Set(allPricing.map((p: any) => p.product_id))];

      const companies = await Promise.all(
        companyIds.map(id => this.supabase.getTableById('companies', id))
      );
      const products = await Promise.all(
        productIds.map(id => this.supabase.getTableById('products', id))
      );

      const companyMap = new Map(companies.filter(c => c).map(c => [c!.id, c]));
      const productMap = new Map(products.filter(p => p).map(p => [p!.id, p]));

      // Create enhanced CSV rows with company and product details
      const rows = allPricing.map((pricing: any) => {
        const company = companyMap.get(pricing.company_id);
        const product = productMap.get(pricing.product_id);

        return [
          pricing.company_id || '',
          company?.company_name || '',
          company?.email || '',
          pricing.product_id || '',
          product?.sku || '',
          product?.name || '',
          pricing.price_tier_1 || pricing.price || '',
          pricing.quantity_tier_1 || '1',
          pricing.price_tier_2 || '',
          pricing.quantity_tier_2 || '',
          pricing.price_tier_3 || '',
          pricing.quantity_tier_3 || '',
          pricing.minimum_order || '1',
          'upsert' // Default update mode
        ];
      });

      // Create CSV content
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'company-pricing-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting company pricing:', error);
      const errorMessage = this.translationService.translate('admin.companyPricingForm.errorExportingCompanyPricing');
      alert(errorMessage);
    }
  }

  private async loadCompanyPricing(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const data = await this.supabase.getTable('company_pricing');
      const summaries = await this.groupByCompany(data || []);
      this.companyPricingSubject.next(summaries);
    } catch (err) {
      console.error('Error loading company pricing', err);
      this.companyPricingSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async groupByCompany(pricingData: any[]): Promise<CompanyPricingSummary[]> {
    const companyGroups = new Map<string, any[]>();

    pricingData.forEach(pricing => {
      if (!companyGroups.has(pricing.company_id)) {
        companyGroups.set(pricing.company_id, []);
      }
      companyGroups.get(pricing.company_id)!.push(pricing);
    });

    // Get companies from the companies table
    const { data: companies, error } = await this.supabase.client
      .from('companies')
      .select('*')
      .eq('status', 'approved');

    if (error) {
      console.error('Error loading companies:', error);
    }

    const summaries: CompanyPricingSummary[] = [];

    companyGroups.forEach((pricings, companyId) => {
      const company = (companies || []).find((c: any) => c.id === companyId);
      const companyName = company ?
        company.company_name :
        `Company ${companyId}`;

      const sortedPricings = pricings.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const lastUpdated = pricings.reduce((latest, current) => {
        const currentDate = new Date(current.updated_at || current.created_at);
        const latestDate = new Date(latest);
        return currentDate > latestDate ? current.updated_at || current.created_at : latest;
      }, sortedPricings[0].created_at);

      summaries.push({
        id: `company_${companyId}`,
        company_id: companyId,
        company_name: companyName,
        product_count: pricings.length,
        created_at: sortedPricings[0].created_at,
        updated_at: lastUpdated
      });
    });

    return summaries.sort((a, b) => a.company_name.localeCompare(b.company_name));
  }

  private async deleteAllCompanyPricing(companySummary: CompanyPricingSummary): Promise<void> {
    if (!confirm(`Delete all custom pricing for ${companySummary.company_name}? This will remove all ${companySummary.product_count} custom price(s) for this company.`)) {
      return;
    }

    try {
      const allPricing = await this.supabase.getTable('company_pricing');
      const companyPricing = (allPricing || []).filter((p: any) => p.company_id === companySummary.company_id);

      for (const pricing of companyPricing) {
        await this.supabase.deleteRecord('company_pricing', pricing.id);
      }

      this.loadCompanyPricing();
      const successMessage = this.translationService.translate('admin.companyPricingForm.successfullyDeletedAllCustomPricing', {
        companyName: companySummary.company_name
      });
      alert(successMessage);
    } catch (err) {
      console.error('Error deleting company pricing', err);
      const errorMessage = this.translationService.translate('admin.companyPricingForm.errorDeletingCompanyPricing');
      alert(errorMessage);
    }
  }

  // Global bulk pricing methods
  toggleGlobalBulkPricing(): void {
    this.showGlobalBulkPricing = !this.showGlobalBulkPricing;
  }

  applyGlobalPresetDiscount(percentage: number): void {
    this.globalBulkDiscountPercentage = percentage;
  }

  async applyGlobalBulkDiscountToAll(): Promise<void> {
    if (!this.globalBulkDiscountPercentage || this.globalBulkDiscountPercentage <= 0 || this.globalBulkDiscountPercentage > 100) {
      return;
    }

    const confirmMessage = this.translationService.translate('admin.companyPricingForm.confirmBulkDiscountAll', {
      percentage: this.globalBulkDiscountPercentage.toString()
    });
    if (confirm(confirmMessage)) {
      this.applyGlobalBulkDiscountToAllConfirmed();
    }
  }

  private async applyGlobalBulkDiscountToAllConfirmed(): Promise<void> {
    let toastId: string | undefined;

    try {
      this.loadingSubject.next(true);

      // Start loading toast
      const loadingMessage = this.translationService.translate('admin.companyPricingForm.bulkDiscountProcessing');
      toastId = this.toastService.showLoading(loadingMessage);

      const discount = this.globalBulkDiscountPercentage / 100;
      let successCount = 0;
      let errorCount = 0;

      // Step 1: Get all approved companies
      const { data: companies, error: companiesError } = await this.supabase.client
        .from('companies')
        .select('*')
        .eq('status', 'approved');

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw new Error('Failed to fetch companies');
      }

      if (!companies || companies.length === 0) {
        this.toastService.failLoading(toastId, 'No approved companies found to apply discount to.');
        return;
      }

      // Step 2: Get all products
      const allProducts = await this.supabase.getTable('products');
      if (!allProducts || allProducts.length === 0) {
        this.toastService.failLoading(toastId, 'No products found to apply discount to.');
        return;
      }

      // Step 3: Get existing company pricing records for efficiency
      const existingPricing = await this.supabase.getTable('company_pricing');
      const pricingMap = new Map<string, any>();

      if (existingPricing) {
        existingPricing.forEach(pricing => {
          const key = `${pricing.company_id}-${pricing.product_id}`;
          pricingMap.set(key, pricing);
        });
      }

      // Step 4: Process all company-product combinations
      const totalCombinations = companies.length * allProducts.length;
      let processedCount = 0;

      for (const company of companies) {
        for (const product of allProducts) {
          try {
            processedCount++;

            // Update progress every 10 items or on final item
            if (processedCount % 10 === 0 || processedCount === totalCombinations) {
              const progress = Math.round((processedCount / totalCombinations) * 100);
              const progressMessage = this.translationService.translate('admin.companyPricingForm.bulkDiscountProgress', {
                current: processedCount.toString(),
                total: totalCombinations.toString()
              });
              this.toastService.updateLoadingProgress(toastId, progressMessage, progress);
            }

            const key = `${company.id}-${product.id}`;
            const existingRecord = pricingMap.get(key);

            // Always use the original product price as the base for discount calculation
            const basePrice = Number(product.price) || 0;
            if (basePrice <= 0) {
              continue; // Skip products without valid price
            }

            const discountedPrice = Math.round(basePrice * (1 - discount) * 100) / 100;

            if (existingRecord) {
              // Update existing pricing record with discounted original price
              const updatedData = {
                price_tier_1: discountedPrice,
                quantity_tier_1: 1,
                price_tier_2: null,
                quantity_tier_2: null,
                price_tier_3: null,
                quantity_tier_3: null,
                minimum_order: 1,
                updated_at: new Date().toISOString()
              };

              const { error: updateError } = await this.supabase.client
                .from('company_pricing')
                .update(updatedData)
                .eq('id', existingRecord.id);

              if (updateError) {
                console.error('Error updating existing pricing:', updateError);
                errorCount++;
              } else {
                successCount++;
              }
            } else {
              // Create new pricing record with discounted base price
              const newPricingData = {
                company_id: company.id,
                product_id: product.id,
                price_tier_1: discountedPrice,
                quantity_tier_1: 1,
                price_tier_2: null,
                quantity_tier_2: null,
                price_tier_3: null,
                quantity_tier_3: null,
                minimum_order: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              const { error: insertError } = await this.supabase.client
                .from('company_pricing')
                .insert(newPricingData);

              if (insertError) {
                console.error('Error inserting new pricing:', insertError);
                errorCount++;
              } else {
                successCount++;
              }
            }
          } catch (error) {
            console.error('Error processing company-product combination:', error);
            errorCount++;
          }
        }
      }

      // Complete the loading toast with success
      const successMessage = this.translationService.translate('admin.companyPricingForm.bulkDiscountCompleted', {
        count: successCount.toString()
      });
      this.toastService.completeLoading(toastId, successMessage);

      // Reload the data
      await this.loadCompanyPricing();

    } catch (error) {
      console.error('Error applying global bulk discount:', error);
      const errorMessage = this.translationService.translate('admin.companyPricingForm.errorSavingPricing');

      // Check if toastId exists (might be undefined if error occurred before toast creation)
      if (typeof toastId !== 'undefined') {
        this.toastService.failLoading(toastId, errorMessage);
      } else {
        this.toastService.showError(errorMessage);
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }
}
