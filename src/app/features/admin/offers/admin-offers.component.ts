import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

@Component({
    selector: 'app-admin-offers',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Offers</h1>
          <p class="mt-2 text-gray-600">Manage promotional offers and discounts</p>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Offers"
        [data]="(offers$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddOffer()"
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
export class AdminOffersComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    private title = inject(Title);

    private offersSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    offers$ = this.offersSubject.asObservable();
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
                key: 'title',
                label: 'Title',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'type',
                label: 'Type',
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'discount_type',
                label: 'Discount Type',
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'discount_value',
                label: 'Discount Value',
                type: 'number',
                sortable: true,
                format: (value) => value ? `${value}${this.getDiscountSymbol(value)}` : ''
            },
            {
                key: 'start_date',
                label: 'Start Date',
                type: 'date',
                sortable: true
            },
            {
                key: 'end_date',
                label: 'End Date',
                type: 'date',
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
                label: 'View',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>',
                action: 'view',
                class: 'text-green-600 hover:text-green-900'
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
        this.title.setTitle('Offers - Solar Shop Admin');
        this.loadOffers();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/offers/edit', item.id]);
                break;
            case 'view':
                this.router.navigate(['/offers', item.id]);
                break;
            case 'delete':
                this.deleteOffer(item);
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/offers/edit', item.id]);
    }

    onAddOffer(): void {
        this.router.navigate(['/admin/offers/create']);
    }

    getDiscountSymbol(value: any): string {
        return '%';
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        if (!csvData || csvData.length === 0) {
            alert('No data found in CSV file');
            return;
        }

        this.loadingSubject.next(true);

        try {
            // Map CSV data to offer format
            const offers = csvData.map(row => ({
                title: row.title || row.Title || '',
                description: row.description || row.Description || '',
                short_description: row.short_description || row['Short Description'] || '',
                type: (row.type || row.Type || 'product') as any,
                discount_type: (row.discount_type || row['Discount Type'] || 'percentage') as any,
                discount_value: parseFloat(row.discount_value || row['Discount Value'] || '0'),
                minimum_purchase: row.minimum_purchase ? parseFloat(row.minimum_purchase) : undefined,
                maximum_discount: row.maximum_discount ? parseFloat(row.maximum_discount) : undefined,
                start_date: row.start_date || row['Start Date'] || undefined,
                end_date: row.end_date || row['End Date'] || undefined,
                usage_limit: row.usage_limit ? parseInt(row.usage_limit) : undefined,
                image_url: row.image_url || row['Image URL'] || undefined,
                terms_conditions: row.terms_conditions || row['Terms & Conditions'] || '',
                is_active: (row.is_active || row['Is Active'] || 'true').toLowerCase() === 'true'
            }));

            // Import offers one by one
            for (const offer of offers) {
                await this.supabaseService.createRecord('offers', offer);
            }

            alert(`Successfully imported ${offers.length} offers`);
            this.loadOffers();
        } catch (error) {
            console.error('Error importing offers:', error);
            alert('Error importing offers. Please check the CSV format.');
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async loadOffers(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            const offers = await this.supabaseService.getTable('offers');
            this.offersSubject.next(offers || []);
        } catch (error) {
            console.error('Error loading offers:', error);
            this.offersSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async deleteOffer(offer: any): Promise<void> {
        if (!confirm(`Are you sure you want to delete "${offer.title}"?`)) {
            return;
        }

        try {
            await this.supabaseService.deleteRecord('offers', offer.id);
            alert('Offer deleted successfully');
            this.loadOffers();
        } catch (error) {
            console.error('Error deleting offer:', error);
            alert('Error deleting offer');
        }
    }
} 