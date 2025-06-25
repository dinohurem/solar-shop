import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';

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
  imports: [CommonModule, DataTableComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ 'admin.companyPricingForm.title' | translate }}</h1>
          <p class="mt-2 text-gray-600">{{ 'admin.companyPricingForm.subtitle' | translate }}</p>
        </div>
      </div>
      <app-data-table
        [title]="'admin.companyPricingForm.companyPrices' | translate"
        [data]="(companyPricing$ | async) || []"
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
  translationService = inject(TranslationService);
  private companyPricingSubject = new BehaviorSubject<CompanyPricingSummary[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  companyPricing$ = this.companyPricingSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

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
    rowClickable: true
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
    this.router.navigate(['/admin/company-pricing/create'], {
      queryParams: { companyId: item.company_id }
    });
  }

  onAdd(): void {
    this.router.navigate(['/admin/company-pricing/create']);
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
        company.company_name || company.companyName :
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
      alert(`Successfully deleted all custom pricing for ${companySummary.company_name}`);
    } catch (err) {
      console.error('Error deleting company pricing', err);
      alert('Error deleting company pricing. Please try again.');
    }
  }
}
