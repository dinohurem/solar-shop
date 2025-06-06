import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

@Component({
    selector: 'app-admin-categories',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Categories</h1>
          <p class="mt-2 text-gray-600">Manage product categories</p>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Categories"
        [data]="(categories$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddCategory()"
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
export class AdminCategoriesComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);

    private categoriesSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    categories$ = this.categoriesSubject.asObservable();
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
                key: 'name',
                label: 'Name',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'slug',
                label: 'Slug',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'description',
                label: 'Description',
                type: 'text',
                sortable: false,
                searchable: true
            },
            {
                key: 'sort_order',
                label: 'Sort Order',
                type: 'number',
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
        this.loadCategories();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/categories/edit', item.id]);
                break;
            case 'delete':
                this.deleteCategory(item);
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/categories/edit', item.id]);
    }

    onAddCategory(): void {
        this.router.navigate(['/admin/categories/create']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        if (!csvData || csvData.length === 0) {
            alert('No data found in CSV file');
            return;
        }

        this.loadingSubject.next(true);

        try {
            // Map CSV data to category format
            const categories = csvData.map(row => ({
                name: row.name || row.Name || '',
                slug: (row.slug || row.Slug || row.name || row.Name || '').toLowerCase().replace(/\s+/g, '-'),
                description: row.description || row.Description || '',
                image_url: row.image_url || row['Image URL'] || undefined,
                sort_order: parseInt(row.sort_order || row['Sort Order'] || '0'),
                is_active: (row.is_active || row['Is Active'] || 'true').toLowerCase() === 'true'
            }));

            // Import categories one by one
            for (const category of categories) {
                await this.supabaseService.createRecord('categories', category);
            }

            alert(`Successfully imported ${categories.length} categories`);
            this.loadCategories();
        } catch (error) {
            console.error('Error importing categories:', error);
            alert('Error importing categories. Please check the CSV format.');
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async loadCategories(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            const categories = await this.supabaseService.getTable('categories');
            this.categoriesSubject.next(categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categoriesSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async deleteCategory(category: any): Promise<void> {
        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
            return;
        }

        try {
            await this.supabaseService.deleteRecord('categories', category.id);
            alert('Category deleted successfully');
            this.loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category');
        }
    }
} 