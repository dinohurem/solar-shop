import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
    selector: 'app-admin-categories',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TranslatePipe],
    template: `
    <div class="w-full">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate"> {{ 'admin.categoriesForm.title' | translate }}</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600"> {{ 'admin.categoriesForm.subtitle' | translate }}</p>
        </div>
      </div>

        <!-- Data Table Container -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <app-data-table
        title="{{ 'admin.categoriesForm.title' | translate }}"
        [data]="(categories$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddCategory()"
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
export class AdminCategoriesComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    private title = inject(Title);
    translationService = inject(TranslationService);

    private categoriesSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    categories$ = this.categoriesSubject.asObservable();
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
                key: 'name',
                label: this.translationService.translate('admin.common.name'),
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'description',
                label: this.translationService.translate('admin.common.description'),
                type: 'text',
                sortable: false,
                searchable: true
            },
            {
                key: 'is_active',
                label: this.translationService.translate('admin.common.status'),
                type: 'boolean',
                sortable: true
            }
        ],
        actions: [
            {
                label: this.translationService.translate('admin.common.edit'),
                icon: 'edit',
                action: 'edit',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: this.translationService.translate('admin.common.delete'),
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
        this.title.setTitle(this.translationService.translate('admin.categoriesForm.longTitle'));
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
            alert(this.translationService.translate('admin.categoriesForm.noDataFoundInCsvFile'));
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

            alert(this.translationService.translate('admin.categoriesForm.successImportingCategories', { count: categories.length }));
            this.loadCategories();
        } catch (error) {
            console.error('Error importing categories:', error);
            alert(this.translationService.translate('admin.categoriesForm.errorImportingCategories'));
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
            console.warn('Categories table not found in database. Using mock data as placeholder.');
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
            alert(this.translationService.translate('admin.categoriesForm.categoryDeletedSuccessfully'));
            this.loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(this.translationService.translate('admin.categoriesForm.errorDeletingCategory'));
        }
    }
} 