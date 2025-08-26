import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
    selector: 'app-admin-blog',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent, TranslatePipe],
    template: `
    <div class="w-full">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{{ 'admin.blogForm.title' | translate }}</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{{ 'admin.blogForm.subtitle' | translate }}</p>
        </div>
      </div>

        <!-- Data Table Container -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <app-data-table
        [title]="translationService.translate('admin.blogForm.title')"
        [data]="(posts$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddPost()"
        (rowClicked)="onRowClick($event)"        (csvImported)="onCsvImported($event)">
      </app-data-table>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <app-success-modal
      [isOpen]="showSuccessModal"
      [title]="successModalTitle"
      [message]="successModalMessage"
      (closed)="onSuccessModalClosed()"
    ></app-success-modal>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminBlogComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    translationService = inject(TranslationService);

    private postsSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true); posts$ = this.postsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    // Modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'featured_image_url',
                label: this.translationService.translate('admin.common.image'),
                type: 'image',
                sortable: false,
                searchable: false,
                width: '10%',
                minWidth: '80px'
            },
            {
                key: 'title',
                label: this.translationService.translate('admin.blogForm.postTitle'),
                type: 'text',
                sortable: true,
                searchable: true,
                width: '40%',
                minWidth: '250px',
                maxWidth: '400px'
            },
            {
                key: 'status',
                label: this.translationService.translate('admin.common.status'),
                type: 'status',
                sortable: true,
                format: (value) => {
                    return this.translationService.translate(`admin.blogForm.${value}`) || value;
                },
                width: '15%',
                minWidth: '120px'
            },
            {
                key: 'published_at',
                label: this.translationService.translate('admin.blogForm.published'),
                type: 'date',
                sortable: true,
                width: '25%',
                minWidth: '150px'
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
        allowCsvImport: false,
        allowExport: true,
        rowClickable: true
    };

    ngOnInit(): void {
        this.loadPosts();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/blog/uredi', item.id]);
                break;
            case 'delete':
                this.deletePost(item);
                break;
        }
    }

    onRowClick(item: any): void {
        this.router.navigate(['/admin/blog/uredi', item.id]);
    }

    onAddPost(): void {
        this.router.navigate(['/admin/blog/kreiraj']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        if (!csvData || csvData.length === 0) {
            alert('No data found in CSV file');
            return;
        }

        this.loadingSubject.next(true);

        try {
            // Map CSV data to blog post format
            const blogPosts = csvData.map(row => ({
                title: row.title || row.Title || '',
                slug: (row.slug || row.Slug || row.title || row.Title || '').toLowerCase().replace(/\s+/g, '-'),
                content: row.content || row.Content || '',
                excerpt: row.excerpt || row.Excerpt || '',
                featured_image_url: row.featured_image_url || row['Featured Image URL'] || undefined,
                category_id: row.category_id || row['Category ID'] || undefined,
                tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
                status: (row.status || row.Status || 'draft') as 'draft' | 'published' | 'archived',
                published_at: row.published_at || row['Published At'] || undefined,
                seo_title: row.seo_title || row['SEO Title'] || undefined,
                seo_description: row.seo_description || row['SEO Description'] || undefined,
                seo_keywords: row.seo_keywords ? row.seo_keywords.split(',').map((k: string) => k.trim()) : [],
                reading_time: row.reading_time ? parseInt(row.reading_time) : undefined,
                is_featured: (row.is_featured || row['Is Featured'] || 'false').toLowerCase() === 'true'
            }));

            // Import blog posts one by one
            for (const post of blogPosts) {
                await this.supabaseService.createRecord('blog_posts', post);
            }

            alert(`Successfully imported ${blogPosts.length} blog posts`);
            this.loadPosts();
        } catch (error) {
            console.error('Error importing blog posts:', error);
            alert('Error importing blog posts. Please check the CSV format.');
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async loadPosts(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            const posts = await this.supabaseService.getTable('blog_posts');
            this.postsSubject.next(posts || []);
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.postsSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    } private async deletePost(post: any): Promise<void> {
        try {
            await this.supabaseService.deleteRecord('blog_posts', post.id);
            this.showSuccess('Success', 'Blog post deleted successfully');
            this.loadPosts();
        } catch (error) {
            console.error('Error deleting blog post:', error);
            this.showSuccess('Error', 'Error deleting blog post');
        }
    }

    private showSuccess(title: string, message: string): void {
        this.successModalTitle = title;
        this.successModalMessage = message;
        this.showSuccessModal = true;
    }

    onSuccessModalClosed(): void {
        this.showSuccessModal = false;
        this.successModalTitle = '';
        this.successModalMessage = '';
    }
}