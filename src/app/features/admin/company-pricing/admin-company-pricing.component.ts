import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

@Component({
  selector: 'app-admin-company-pricing',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Company Pricing</h1>
          <p class="mt-2 text-gray-600">Manage custom prices for partner companies</p>
        </div>
      </div>
      <app-data-table
        title="Company Pricing"
        [data]="(pricing$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAdd()"
        (rowClicked)="onRowClick($event)">
      </app-data-table>
    </div>
  `,
})
export class AdminCompanyPricingComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private pricingSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  pricing$ = this.pricingSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  tableConfig: TableConfig = {
    columns: [
      { key: 'company_id', label: 'Company ID', type: 'text', sortable: true },
      { key: 'product_id', label: 'Product ID', type: 'text', sortable: true },
      { key: 'price', label: 'Price', type: 'number', sortable: true }
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
    this.loadPricing();
  }

  onTableAction(event: { action: string; item: any }): void {
    const { action, item } = event;
    if (action === 'edit') {
      this.router.navigate(['/admin/company-pricing/edit', item.id]);
    } else if (action === 'delete') {
      this.deleteRecord(item);
    }
  }

  onRowClick(item: any): void {
    this.router.navigate(['/admin/company-pricing/edit', item.id]);
  }

  onAdd(): void {
    this.router.navigate(['/admin/company-pricing/create']);
  }

  private async loadPricing(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const data = await this.supabase.getTable('company_pricing');
      this.pricingSubject.next(data || []);
    } catch (err) {
      console.error('Error loading company pricing', err);
      this.pricingSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private async deleteRecord(record: any): Promise<void> {
    if (!confirm('Delete this entry?')) return;
    try {
      await this.supabase.deleteRecord('company_pricing', record.id);
      this.loadPricing();
    } catch (err) {
      console.error('Error deleting pricing', err);
    }
  }
}
