import { Component, Input, Output, EventEmitter, OnInit, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Edit, Trash2, Upload, Download, Plus, Search, Eye, EyeOff, Check, X, Printer } from 'lucide-angular';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'status' | 'array';
  sortable?: boolean;
  searchable?: boolean;
  format?: (value: any) => string;
}

export interface TableAction {
  label: string;
  icon: string;
  action: string;
  class?: string;
  condition?: (item: any) => boolean;
}

export interface TableConfig {
  columns: TableColumn[];
  actions: TableAction[];
  searchable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  allowCsvImport?: boolean;
  allowExport?: boolean;
  rowClickable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, DeleteConfirmationModalComponent, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
            <span class="text-sm text-gray-500">({{ filteredData.length }} {{ 'admin.common.items' | translate }})</span>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <!-- Search -->
            <div *ngIf="config.searchable" class="relative">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                placeholder="{{ 'common.searchPlaceholder' | translate }}"
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <lucide-angular 
                name="search" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                [img]="SearchIcon">
              </lucide-angular>
            </div>
            
            <!-- CSV Import -->
            <div *ngIf="config.allowCsvImport" class="relative">
              <input
                #fileInput
                type="file"
                accept=".csv"
                (change)="onFileSelected($event)"
                class="hidden">
              <button
                (click)="fileInput.click()"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <lucide-angular 
                  name="upload" 
                  class="w-4 h-4 inline-block mr-2"
                  [img]="UploadIcon">
                </lucide-angular>
                {{ 'common.importCSV' | translate }}
              </button>
            </div>
            
            <!-- CSV Template -->
            <div *ngIf="config.allowCsvImport" class="relative">
              <button
                (click)="downloadCsvTemplate()"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <lucide-angular 
                  name="download" 
                  class="w-4 h-4 inline-block mr-2"
                  [img]="DownloadIcon">
                </lucide-angular>
                CSV Template
              </button>
            </div>
            
            <!-- Export -->
            <button
              *ngIf="config.allowExport"
              (click)="exportToCsv()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <lucide-angular 
                name="download" 
                class="w-4 h-4 inline-block mr-2"
                [img]="DownloadIcon">
              </lucide-angular>
              {{ 'common.export' | translate }}
            </button>
            
            <!-- Add New -->
            <button
              (click)="onAdd()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <lucide-angular 
                name="plus" 
                class="w-4 h-4 inline-block mr-2"
                [img]="PlusIcon">
              </lucide-angular>
              {{ 'common.addNew' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- CSV Import Progress -->
      <div *ngIf="importing" class="px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span class="text-sm text-blue-800">{{ 'common.importing' | translate }}</span>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th *ngFor="let column of config.columns"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  [class.cursor-default]="!column.sortable"
                  (click)="onSort(column)">
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  <svg *ngIf="column.sortable && sortColumn === column.key" 
                       class="w-4 h-4 text-gray-400"
                       [class.rotate-180]="sortDirection === 'desc'"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ 'common.actions' | translate }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">

            <!-- Loading state -->
            <tr *ngIf="loading" class="text-center">
              <td [attr.colspan]="config.columns.length + 1" class="px-6 py-12">
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span class="ml-3 text-gray-600">{{ 'common.loading' | translate }}</span>
                </div>
              </td>
            </tr>

            <!-- Data rows -->
            <tr *ngFor="let item of paginatedData; let i = index" 
                class="hover:bg-gray-50 transition-colors"
                [class.cursor-pointer]="config.rowClickable !== false"
                (click)="onRowClick(item)">
              <td *ngFor="let column of config.columns" 
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <ng-container [ngSwitch]="column.type">
                  <!-- Image -->
                  <div *ngSwitchCase="'image'" class="flex items-center">
                    <img *ngIf="getColumnValue(item, column.key)" 
                         [src]="getColumnValue(item, column.key)" 
                         [alt]="column.label"
                         class="h-10 w-10 rounded-lg object-cover">
                    <span *ngIf="!getColumnValue(item, column.key)" 
                          class="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gray-200 text-gray-400">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </span>
                  </div>
                  
                  <!-- Boolean -->
                  <span *ngSwitchCase="'boolean'" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-green-100]="getColumnValue(item, column.key)"
                        [class.text-green-800]="getColumnValue(item, column.key)"
                        [class.bg-red-100]="!getColumnValue(item, column.key)"
                        [class.text-red-800]="!getColumnValue(item, column.key)">
                    {{ getColumnValue(item, column.key) ? 'Yes' : 'No' }}
                  </span>
                  
                  <!-- Status -->
                  <span *ngSwitchCase="'status'" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="getStatusClass(getColumnValue(item, column.key))">
                    {{ getColumnValue(item, column.key) }}
                  </span>
                  
                  <!-- Array -->
                  <div *ngSwitchCase="'array'" class="flex flex-wrap gap-1">
                    <span *ngFor="let tag of getColumnValue(item, column.key) || []" 
                          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {{ tag }}
                    </span>
                  </div>
                  
                  <!-- Date -->
                  <span *ngSwitchCase="'date'">
                    {{ formatDate(getColumnValue(item, column.key)) }}
                  </span>
                  
                  <!-- Default (text/number) -->
                  <span *ngSwitchDefault>
                    {{ column.format ? column.format(getColumnValue(item, column.key)) : getColumnValue(item, column.key) }}
                  </span>
                </ng-container>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <ng-container *ngFor="let action of config.actions">
                    <button *ngIf="!action.condition || action.condition(item)"
                            (click)="onAction(action.action, item, $event)"
                            [class]="action.class || 'text-blue-600 hover:text-blue-900'"
                            class="p-1 rounded hover:bg-gray-100 transition-colors"
                            [title]="action.label">
                      <lucide-angular 
                        [name]="action.icon" 
                        class="w-4 h-4"
                        [img]="getIconForAction(action.icon)">
                      </lucide-angular>
                      <span class="sr-only">{{ action.label }}</span>
                    </button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div *ngIf="config.paginated && totalPages > 1" 
           class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          {{ 'common.showing' | translate }} {{ (currentPage - 1) * pageSize + 1 }} {{ 'common.to' | translate }} {{ Math.min(currentPage * pageSize, filteredData.length) }} 
          {{ 'common.of' | translate }} {{ filteredData.length }} {{ 'common.results' | translate }}
        </div>
        <div class="flex space-x-2">
          <button (click)="goToPage(currentPage - 1)"
                  [disabled]="currentPage === 1"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            {{ 'common.previous' | translate }}
          </button>
          <button *ngFor="let page of getPageNumbers()"
                  (click)="goToPage(page)"
                  [class.bg-blue-600]="page === currentPage"
                  [class.text-white]="page === currentPage"
                  [class.text-blue-600]="page !== currentPage"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            {{ page }}
          </button>
          <button (click)="goToPage(currentPage + 1)"
                  [disabled]="currentPage === totalPages"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            {{ 'common.next' | translate }}
          </button>
        </div>
      </div>      <!-- Empty State -->
      <div *ngIf="filteredData.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V3a1 1 0 00-1-1H9a1 1 0 00-1 1v2m4 0h0"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ 'admin.common.noResults' | translate }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ 'admin.common.getStartedByCreating' | translate }}</p>
        <div class="mt-6">
          <button (click)="onAdd()" 
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <lucide-angular 
              name="plus" 
              class="w-4 h-4 mr-2"
              [img]="PlusIcon">
            </lucide-angular>
            {{ 'common.addNew' | translate }} {{ title.toLowerCase().slice(0, -1) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <app-delete-confirmation-modal
      [isOpen]="showDeleteModal"
      [title]="deleteModalTitle"
      [message]="deleteModalMessage"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="onDeleteCancelled()"
    ></app-delete-confirmation-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() data: any[] = [];
  @Input() config!: TableConfig;
  @Input() loading: boolean = false;
  @Output() actionClicked = new EventEmitter<{ action: string, item: any }>();
  @Output() addClicked = new EventEmitter<void>();
  @Output() csvImported = new EventEmitter<any[]>();
  @Output() rowClicked = new EventEmitter<any>();
  translationService = inject(TranslationService);
  private router = inject(Router);

  // Delete modal properties
  showDeleteModal = false;
  deleteModalTitle = '';
  deleteModalMessage = '';
  pendingDeleteItem: any = null;

  // Lucide Icons
  readonly SearchIcon = Search;
  readonly UploadIcon = Upload;
  readonly DownloadIcon = Download;
  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly PrinterIcon = Printer;

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  pageSize: number = 10;
  importing: boolean = false;

  filteredData: any[] = [];
  paginatedData: any[] = [];
  totalPages: number = 0;

  Math = Math;

  ngOnInit(): void {
    this.pageSize = this.config.pageSize || 10;
    this.updateDisplayData();
  }

  ngOnChanges(): void {
    this.updateDisplayData();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateDisplayData();
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    this.updateDisplayData();
  }
  onAction(action: string, item: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Handle delete actions with modal
    if (action === 'delete') {
      this.showDeleteConfirmation(item);
    } else {
      this.actionClicked.emit({ action, item });
    }
  }

  onAdd(): void {
    this.addClicked.emit();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.importing = true;
      this.parseCsv(file);
    }
  }

  private parseCsv(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim() || '';
          });
          return obj;
        });

      this.importing = false;
      this.csvImported.emit(data);
    };
    reader.readAsText(file);
  }

  exportToCsv(): void {
    const headers = this.config.columns.map(col => col.label).join(',');
    const rows = this.data.map(item =>
      this.config.columns.map(col => this.getColumnValue(item, col.key) || '').join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayData();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const half = Math.floor(maxPages / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxPages - 1);

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getColumnValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'published': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      // Payment status colors
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
      'partially_refunded': 'bg-orange-100 text-orange-800'
    };
    return statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  onRowClick(item: any): void {
    if (this.config.rowClickable !== false) {
      this.rowClicked.emit(item);
    }
  }

  private updateDisplayData(): void {
    this.filteredData = this.data.filter(item => {
      if (!this.searchTerm) return true;

      return this.config.columns
        .filter(col => col.searchable !== false)
        .some(col => {
          const value = this.getColumnValue(item, col.key);
          return value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
        });
    });

    if (this.sortColumn) {
      this.filteredData.sort((a, b) => {
        const aVal = this.getColumnValue(a, this.sortColumn);
        const bVal = this.getColumnValue(b, this.sortColumn);

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;

        return this.sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    if (this.config.paginated) {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      this.paginatedData = this.filteredData.slice(startIndex, startIndex + this.pageSize);
    } else {
      this.paginatedData = this.filteredData;
    }
  }

  getIconForAction(iconName: string): any {
    switch (iconName) {
      case 'edit':
        return this.EditIcon;
      case 'delete':
        return this.Trash2Icon;
      case 'trash2':
        return this.Trash2Icon;
      case 'upload':
        return this.UploadIcon;
      case 'download':
        return this.DownloadIcon;
      case 'plus':
        return this.PlusIcon;
      case 'search':
        return this.SearchIcon;
      case 'eye':
        return this.EyeIcon;
      case 'eye-off':
        return this.EyeOffIcon;
      case 'check':
        return this.CheckIcon;
      case 'x':
        return this.XIcon; case 'printer':
        return this.PrinterIcon;
      default:
        return this.EditIcon; // Default fallback
    }
  }

  showDeleteConfirmation(item: any): void {
    this.pendingDeleteItem = item;
    this.deleteModalTitle = 'Confirm Deletion';

    // Try to get a meaningful name for the item
    const itemName = item.name || item.title || item.first_name || item.order_number || 'this item';
    this.deleteModalMessage = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    if (this.pendingDeleteItem) {
      this.actionClicked.emit({ action: 'delete', item: this.pendingDeleteItem });
      this.onDeleteCancelled(); // Reset state
    }
  }

  onDeleteCancelled(): void {
    this.showDeleteModal = false;
    this.pendingDeleteItem = null;
    this.deleteModalTitle = '';
    this.deleteModalMessage = '';
  }

  downloadCsvTemplate(): void {
    // Get the entity type from the URL route instead of localized title
    const currentUrl = this.router.url;
    let entityType = '';

    // Extract entity type from URL
    if (currentUrl.includes('/admin/categories')) {
      entityType = 'categories';
    } else if (currentUrl.includes('/admin/products')) {
      entityType = 'products';
    } else if (currentUrl.includes('/admin/offers')) {
      entityType = 'offers';
    } else if (currentUrl.includes('/admin/company-pricing')) {
      entityType = 'company-pricing';
    } else {
      // Fallback to title-based detection for other entities
      entityType = 'unknown';
    }

    let headers: string[] = [];
    let sampleData: string[] = [];

    // Define templates for different entities
    if (entityType.includes('categor')) {
      headers = ['name', 'description', 'slug', 'image_url', 'sort_order', 'is_active'];
      sampleData = ['Inverters', 'Inverters for solar panels', 'inverters', 'https://example.com/inverter.jpg', '1', 'true'];
    } else if (entityType.includes('product')) {
      headers = ['name', 'slug', 'description', 'short_description', 'price', 'original_price', 'sku', 'brand', 'model', 'category_name', 'stock_quantity', 'weight', 'is_active', 'is_featured', 'is_on_sale', 'images'];
      sampleData = ['Solar Panel 100W', 'solar-panel-100w', 'High efficiency solar panel', 'High efficiency solar panel', '299.99', '399.99', 'SOLAR-100W', 'SolarTech', 'SolarTech Model', 'Solar Panels11', '100', '1', 'true', 'true', 'true', 'https://example.com/solar-panel-100w.jpg,https://example.com/solar-panel-100w-2.jpg'];
    } else if (entityType.includes('offer')) {
      headers = ['title', 'image_url', 'description', 'short_description', 'type', 'status', 'featured', 'discount_type', 'discount_value', 'start_date', 'end_date', 'min_order_amount', 'max_order_amount', 'is_active'];
      sampleData = ['Solar Panel 100W', 'https://example.com/solar-panel-100w.jpg', 'High efficiency solar panel', 'High efficiency solar panel', 'bundle_deal', 'active', 'true', 'percentage', '10', '2025-01-01', '2025-05-01', '100', 'null', 'true'];
    } else if (entityType.includes('company-pricing')) {
      headers = ['company_id', 'price', 'is_active'];
      sampleData = ['1', '299.99', 'true'];
    } else {
      // Generic template based on table columns
      alert(this.translationService.translate('admin.common.noTemplateAvailable'));
      return;
    }

    // Create CSV content
    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType.replace(/\s+/g, '-')}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}