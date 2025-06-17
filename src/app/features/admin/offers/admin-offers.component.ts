import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ReactiveFormsModule],
  template: `
    <div class="w-full">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Offers</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage promotional offers and discounts</p>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
      </div>
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
  private fb = inject(FormBuilder);

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
        key: 'discount_value',
        label: 'Discount',
        type: 'number',
        sortable: true,
        format: (value) => value ? `${value}%` : ''
      },
      {
        key: 'status',
        label: 'Status',
        type: 'status',
        sortable: true,
        format: (value) => {
          const statusMap: { [key: string]: string } = {
            'draft': 'Draft',
            'active': 'Active',
            'paused': 'Paused',
            'expired': 'Expired'
          };
          return statusMap[value] || value || 'Draft';
        }
      }
    ],
    actions: [
      {
        label: 'Edit',
        icon: 'edit',
        action: 'edit',
        class: 'text-blue-600 hover:text-blue-900'
      },
      {
        label: 'View Details',
        icon: 'eye',
        action: 'details',
        class: 'text-green-600 hover:text-green-900'
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
      case 'details':
        this.router.navigate(['/admin/offers/details', item.id]);
        break;
      case 'delete':
        this.deleteOffer(item);
        break;
    }
  }

  onRowClick(item: any): void {
    this.router.navigate(['/admin/offers/details', item.id]);
  }

  onAddOffer(): void {
    this.router.navigate(['/admin/offers/create']);
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
      console.warn('Offers table not found in database. Using empty array as placeholder.');
      // Create some mock data for demonstration purposes
      const mockOffers = [
        {
          id: '1',
          title: 'Summer Sale',
          type: 'percentage',
          discount_value: 20,
          status: 'active',
          image_url: '',
          description: 'Get 20% off on all solar panels',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'First Time Buyer',
          type: 'fixed',
          discount_value: 100,
          status: 'draft',
          image_url: '',
          description: 'Fixed $100 discount for new customers',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }
      ];
      this.offersSubject.next(mockOffers);
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