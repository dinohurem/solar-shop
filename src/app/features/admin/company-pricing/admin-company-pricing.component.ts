import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

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
        title="Companies with Custom Pricing"
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

  private companyPricingSubject = new BehaviorSubject<CompanyPricingSummary[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  companyPricing$ = this.companyPricingSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  tableConfig: TableConfig = {
    columns: [
      { key: 'company_name', label: 'Company Name', type: 'text', sortable: true, searchable: true },
      { key: 'company_id', label: 'Company ID', type: 'text', sortable: true, searchable: true },
      { key: 'product_count', label: 'Products with Custom Pricing', type: 'number', sortable: true },
      { key: 'created_at', label: 'First Created', type: 'date', sortable: true },
      { key: 'updated_at', label: 'Last Updated', type: 'date', sortable: true }
    ],
    actions: [
      { label: 'Delete All', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>', action: 'delete', class: 'text-red-600 hover:text-red-900' }
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
    this.loadCompanyPricing();
  }

  onTableAction(event: { action: string; item: CompanyPricingSummary }): void {
    const { action, item } = event;
    if (action === 'delete') {
      this.deleteAllCompanyPricing(item);
    }
  }

  onRowClick(item: CompanyPricingSummary): void {
    this.router.navigate(['/admin/company-pricing/company', item.company_id]);
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

    const profiles = await this.supabase.getTable('profiles');
    const companyProfiles = (profiles || []).filter((p: any) => p.role === 'company_admin');

    const summaries: CompanyPricingSummary[] = [];

    companyGroups.forEach((pricings, companyId) => {
      const companyProfile = companyProfiles.find((p: any) => p.id === companyId);
      const companyName = companyProfile ?
        (companyProfile.full_name || `${companyProfile.first_name} ${companyProfile.last_name}`) :
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
