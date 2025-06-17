import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../../shared/data-table/data-table.component';

interface CompanyProductPricing {
    id: string;
    product_id: string;
    product_name: string;
    product_sku: string;
    standard_price: number;
    custom_price: number;
    savings: number;
    created_at: string;
    updated_at: string;
}

@Component({
    selector: 'app-company-pricing-details',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center space-x-4 mb-2">
            <button
              (click)="goBack()"
              class="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Companies
            </button>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">{{ companyName }}</h1>
          <p class="mt-2 text-gray-600">Custom pricing for {{ productCount }} products</p>
        </div>
      </div>
      <app-data-table
        [title]="'Products with Custom Pricing for ' + companyName"
        [data]="(productPricing$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAdd()"
        (rowClicked)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
})
export class CompanyPricingDetailsComponent implements OnInit {
    private supabase = inject(SupabaseService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    private productPricingSubject = new BehaviorSubject<CompanyProductPricing[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    productPricing$ = this.productPricingSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    companyId: string = '';
    companyName: string = '';
    productCount: number = 0;

    tableConfig: TableConfig = {
        columns: [
            { key: 'product_name', label: 'Product Name', type: 'text', sortable: true, searchable: true },
            { key: 'product_sku', label: 'SKU', type: 'text', sortable: true, searchable: true },
            {
                key: 'standard_price',
                label: 'Standard Price',
                type: 'number',
                sortable: true,
                format: (value) => `€${value.toFixed(2)}`
            },
            {
                key: 'custom_price',
                label: 'Custom Price',
                type: 'number',
                sortable: true,
                format: (value) => `€${value.toFixed(2)}`
            },
            {
                key: 'savings',
                label: 'Savings',
                type: 'text',
                sortable: true,
                format: (value) => {
                    if (value > 0) return `€${value.toFixed(2)} (${((value / (value + (this.productPricingSubject.value.find(p => p.savings === value)?.custom_price || 0))) * 100).toFixed(1)}%)`;
                    if (value < 0) return `-€${Math.abs(value).toFixed(2)} (${((Math.abs(value) / (Math.abs(value) + (this.productPricingSubject.value.find(p => p.savings === value)?.custom_price || 0))) * 100).toFixed(1)}% markup)`;
                    return '€0.00';
                }
            },
            { key: 'updated_at', label: 'Last Updated', type: 'date', sortable: true }
        ],
        actions: [
            { label: 'Edit', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>', action: 'edit', class: 'text-blue-600 hover:text-blue-900' },
            { label: 'Delete', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>', action: 'delete', class: 'text-red-600 hover:text-red-900' }
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
        this.companyId = this.route.snapshot.paramMap.get('companyId') || '';
        if (this.companyId) {
            this.loadCompanyPricing();
        }
    }

    onTableAction(event: { action: string; item: CompanyProductPricing }): void {
        const { action, item } = event;
        if (action === 'edit') {
            this.router.navigate(['/admin/company-pricing/edit', item.id]);
        } else if (action === 'delete') {
            this.deleteRecord(item);
        }
    }

    onRowClick(item: CompanyProductPricing): void {
        this.router.navigate(['/admin/company-pricing/edit', item.id]);
    }

    onAdd(): void {
        this.router.navigate(['/admin/company-pricing/create'], {
            queryParams: { companyId: this.companyId }
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/company-pricing']);
    }

    private async loadCompanyPricing(): Promise<void> {
        this.loadingSubject.next(true);
        try {
            // Load company details
            const profiles = await this.supabase.getTable('profiles');
            const companyProfile = (profiles || []).find((p: any) => p.id === this.companyId && p.role === 'company_admin');
            this.companyName = companyProfile ?
                (companyProfile.full_name || `${companyProfile.first_name} ${companyProfile.last_name}`) :
                `Company ${this.companyId}`;

            // Load pricing data
            const pricingData = await this.supabase.getTable('company_pricing');
            const companyPricing = (pricingData || []).filter((p: any) => p.company_id === this.companyId);

            // Load product details
            const products = await this.supabase.getTable('products');

            // Combine data
            const detailedPricing: CompanyProductPricing[] = companyPricing.map((pricing: any) => {
                const product = (products || []).find((p: any) => p.id === pricing.product_id);
                const standardPrice = product?.price || 0;
                const customPrice = pricing.price || 0;
                const savings = standardPrice - customPrice;

                return {
                    id: pricing.id,
                    product_id: pricing.product_id,
                    product_name: product?.name || 'Unknown Product',
                    product_sku: product?.sku || 'N/A',
                    standard_price: standardPrice,
                    custom_price: customPrice,
                    savings: savings,
                    created_at: pricing.created_at,
                    updated_at: pricing.updated_at
                };
            });

            this.productCount = detailedPricing.length;
            this.productPricingSubject.next(detailedPricing);
        } catch (err) {
            console.error('Error loading company pricing details', err);
            this.productPricingSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async deleteRecord(record: CompanyProductPricing): Promise<void> {
        if (!confirm(`Delete custom pricing for ${record.product_name}?`)) return;

        try {
            await this.supabase.deleteRecord('company_pricing', record.id);
            this.loadCompanyPricing(); // Reload data
            alert('Custom pricing deleted successfully');
        } catch (err) {
            console.error('Error deleting pricing', err);
            alert('Error deleting pricing. Please try again.');
        }
    }
} 