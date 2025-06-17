import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { Review } from '../../../shared/models/review.model';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';

@Component({
    selector: 'app-admin-reviews',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Reviews</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage product reviews and ratings</p>
        </div>
      </div>

        <!-- Data Table Container -->
        <div class="w-full overflow-hidden">
      <app-data-table
        title="Reviews"
        [data]="(reviews$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddReview()"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)">
      </app-data-table>        </div>
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
export class AdminReviewsComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);

    private reviewsSubject = new BehaviorSubject<Review[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true); reviews$ = this.reviewsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    // Success modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

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
                icon: 'eye',
                action: 'view',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Approve',
                icon: 'check',
                action: 'approve',
                class: 'text-green-600 hover:text-green-900',
                condition: (item: any) => item.status === 'pending'
            },
            {
                label: 'Reject',
                icon: 'x',
                action: 'reject',
                class: 'text-red-600 hover:text-red-900',
                condition: (item: any) => item.status === 'pending'
            },
            {
                label: 'Hide',
                icon: 'eye-off',
                action: 'hide',
                class: 'text-gray-600 hover:text-gray-900',
                condition: (item: any) => item.status === 'approved'
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
        this.router.navigate(['/admin/reviews/create']);
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
    } private async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected' | 'hidden'): Promise<void> {
        try {
            await this.supabaseService.updateRecord('reviews', reviewId, { status });
            await this.loadReviews(); // Reload data
            this.showSuccess('Success', `Review ${status} successfully`);
        } catch (error) {
            console.error('Error updating review status:', error);
            this.showSuccess('Error', 'Error updating review status');
        }
    }

    private async deleteReview(reviewId: string): Promise<void> {
        try {
            await this.supabaseService.deleteRecord('reviews', reviewId);
            await this.loadReviews(); // Reload data
            this.showSuccess('Success', 'Review deleted successfully');
        } catch (error) {
            console.error('Error deleting review:', error);
            this.showSuccess('Error', 'Error deleting review');
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