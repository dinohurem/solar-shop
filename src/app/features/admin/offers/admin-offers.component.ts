import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="w-full">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{{ 'admin.offersForm.title' | translate }}</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{{ 'admin.offersForm.subtitle' | translate }}</p>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <app-data-table
            [title]="'admin.offersForm.title' | translate"
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
  private translationService = inject(TranslationService);

  private offersSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  offers$ = this.offersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  tableConfig: TableConfig = {
    columns: [
      {
        key: 'image_url',
        label: this.translationService.translate('admin.common.image'),
        type: 'image',
        sortable: false,
        searchable: false
      },
      {
        key: 'title',
        label: this.translationService.translate('admin.offersForm.offerName'),
        type: 'text',
        sortable: true,
        searchable: true
      },
      {
        key: 'type',
        label: this.translationService.translate('admin.offersForm.offerType'),
        type: 'status',
        sortable: true,
        searchable: true
      },
      {
        key: 'discount_value',
        label: this.translationService.translate('admin.offersForm.discountValue'),
        type: 'number',
        sortable: true,
        format: (value) => value ? `${value}%` : ''
      },
      {
        key: 'status',
        label: this.translationService.translate('admin.offersForm.status'),
        type: 'status',
        sortable: true,
        format: (value) => {
          const statusMap: { [key: string]: string } = {
            'draft': this.translationService.translate('admin.offersForm.draft'),
            'active': this.translationService.translate('admin.offersForm.active'),
            'paused': this.translationService.translate('admin.offersForm.paused'),
            'expired': this.translationService.translate('admin.offersForm.expired')
          };
          return statusMap[value] || value || this.translationService.translate('admin.offersForm.draft');
        }
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
        label: this.translationService.translate('common.view'),
        icon: 'eye',
        action: 'details',
        class: 'text-green-600 hover:text-green-900'
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
    this.title.setTitle(this.translationService.translate('admin.offersForm.title') + ' - Solar Shop Admin');
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
      alert(this.translationService.translate('common.noResults'));
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

      alert(this.translationService.translate('admin.offersForm.offerCreated'));
      this.loadOffers();
    } catch (error) {
      console.error('Error importing offers:', error);
      alert(this.translationService.translate('admin.offersForm.offerError'));
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
    if (!confirm(this.translationService.translate('admin.offersForm.offerDeleted'))) return;

    try {
      await this.supabaseService.deleteRecord('offers', offer.id);
      this.loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert(this.translationService.translate('admin.offersForm.offerError'));
    }
  }
} 