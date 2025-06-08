import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { Review } from '../../../shared/models/review.model';

@Component({
    selector: 'app-admin-reviews',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Reviews</h1>
          <p class="mt-2 text-gray-600">Manage product reviews and ratings</p>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Reviews"
        [data]="(reviews$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddReview()"
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
export class AdminReviewsComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);

    private reviewsSubject = new BehaviorSubject<Review[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    reviews$ = this.reviewsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'product.name',
                label: 'Product',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'user.firstName',
                label: 'Customer',
                type: 'text',
                sortable: true,
                searchable: true,
                format: (value: any) => `${value || ''}`
            },
            {
                key: 'rating',
                label: 'Rating',
                type: 'text',
                sortable: true,
                format: (value: any) => {
                    const stars = '★'.repeat(value) + '☆'.repeat(5 - value);
                    return `${stars} (${value}/5)`;
                }
            },
            {
                key: 'title',
                label: 'Title',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'comment',
                label: 'Comment',
                type: 'text',
                searchable: true,
                format: (value) => value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : ''
            },
            {
                key: 'status',
                label: 'Status',
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'isVerifiedPurchase',
                label: 'Verified',
                type: 'boolean',
                sortable: true,
                format: (value) => value ? 'Yes' : 'No'
            },
            {
                key: 'helpfulCount',
                label: 'Helpful',
                type: 'number',
                sortable: true
            },
            {
                key: 'createdAt',
                label: 'Created',
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: 'View',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>',
                action: 'view',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Approve',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
                action: 'approve',
                class: 'text-green-600 hover:text-green-900',
                condition: (item: any) => item.status === 'pending'
            },
            {
                label: 'Reject',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
                action: 'reject',
                class: 'text-red-600 hover:text-red-900',
                condition: (item: any) => item.status === 'pending'
            },
            {
                label: 'Hide',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.122-3.122L12 12m0 0l3.878 3.878M12 12l3.878-3.878"/>',
                action: 'hide',
                class: 'text-gray-600 hover:text-gray-900',
                condition: (item: any) => item.status === 'approved'
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
        allowCsvImport: false,
        allowExport: true,
        rowClickable: true
    };

    ngOnInit(): void {
        this.loadReviews();
    }

    onTableAction(event: { action: string, item: Review }): void {
        const { action, item } = event;

        switch (action) {
            case 'view':
                this.router.navigate(['/admin/reviews/view', item.id]);
                break;
            case 'approve':
                this.updateReviewStatus(item.id, 'approved');
                break;
            case 'reject':
                this.updateReviewStatus(item.id, 'rejected');
                break;
            case 'hide':
                this.updateReviewStatus(item.id, 'hidden');
                break;
            case 'delete':
                this.deleteReview(item.id);
                break;
        }
    }

    onRowClick(item: Review): void {
        this.router.navigate(['/admin/reviews/view', item.id]);
    }

    onAddReview(): void {
        // Reviews are typically created by customers, not admins
        alert('Reviews are created by customers after purchase');
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // CSV import disabled for reviews
        alert('CSV import is disabled for reviews');
    }

    private async loadReviews(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            const reviews = await this.supabaseService.getTable('reviews');
            // Map database fields to model fields
            const mappedReviews = (reviews || []).map((review: any) => ({
                id: review.id,
                userId: review.user_id,
                productId: review.product_id,
                orderId: review.order_id,
                rating: review.rating,
                title: review.title,
                comment: review.comment,
                isVerifiedPurchase: review.is_verified_purchase,
                isApproved: review.is_approved,
                adminResponse: review.admin_response,
                helpfulCount: review.helpful_count,
                reportedCount: review.reported_count,
                status: review.status,
                createdAt: review.created_at,
                updatedAt: review.updated_at
            }));
            this.reviewsSubject.next(mappedReviews);
        } catch (error) {
            console.warn('Reviews table not found in database. Using empty array as placeholder.');
            this.reviewsSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected' | 'hidden'): Promise<void> {
        try {
            await this.supabaseService.updateRecord('reviews', reviewId, { status });
            await this.loadReviews(); // Reload data
            alert(`Review ${status} successfully`);
        } catch (error) {
            console.error('Error updating review status:', error);
            alert('Error updating review status');
        }
    }

    private async deleteReview(reviewId: string): Promise<void> {
        if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            try {
                await this.supabaseService.deleteRecord('reviews', reviewId);
                await this.loadReviews(); // Reload data
                alert('Review deleted successfully');
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Error deleting review');
            }
        }
    }
} 