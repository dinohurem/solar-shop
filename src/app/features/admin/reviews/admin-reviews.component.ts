import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { Review } from '../../../shared/models/review.model';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';

@Component({
    selector: 'app-admin-reviews',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent, TranslatePipe],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{{ 'admin.reviewsForm.title' | translate }}</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{{ 'admin.reviewsForm.subtitle' | translate }}</p>
        </div>
      </div>

        <!-- Data Table Container -->
        <div class="w-full overflow-hidden">
      <app-data-table
        [title]="'admin.reviewsForm.title' | translate"
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
    private translationService = inject(TranslationService);

    private reviewsSubject = new BehaviorSubject<Review[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);
    reviews$ = this.reviewsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    // Success modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'product.name',
                label: this.translationService.translate('admin.reviewsForm.reviewProduct'),
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'user.firstName',
                label: this.translationService.translate('admin.reviewsForm.reviewAuthor'),
                type: 'text',
                sortable: true,
                searchable: true,
                format: (value: any) => `${value || ''}`
            },
            {
                key: 'rating',
                label: this.translationService.translate('admin.reviewsForm.reviewRating'),
                type: 'text',
                sortable: true,
                format: (value: any) => {
                    const stars = '★'.repeat(value) + '☆'.repeat(5 - value);
                    return `${stars} (${value}/5)`;
                }
            },
            {
                key: 'title',
                label: this.translationService.translate('admin.reviewsForm.reviewTitle'),
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'comment',
                label: this.translationService.translate('admin.reviewsForm.reviewContent'),
                type: 'text',
                searchable: true,
                format: (value) => value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : ''
            },
            {
                key: 'status',
                label: this.translationService.translate('admin.reviewsForm.reviewStatus'),
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'isVerifiedPurchase',
                label: this.translationService.translate('reviews.verifiedPurchase'),
                type: 'boolean',
                sortable: true,
                format: (value) => value ? this.translationService.translate('common.yes') : this.translationService.translate('common.no')
            },
            {
                key: 'helpfulCount',
                label: this.translationService.translate('reviews.helpful'),
                type: 'number',
                sortable: true
            },
            {
                key: 'createdAt',
                label: this.translationService.translate('admin.reviewsForm.reviewDate'),
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: this.translationService.translate('common.view'),
                icon: 'eye',
                action: 'view',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: this.translationService.translate('admin.reviewsForm.approved'),
                icon: 'check',
                action: 'approve',
                class: 'text-green-600 hover:text-green-900',
                condition: (item: any) => item.status === 'pending'
            },
            {
                label: this.translationService.translate('admin.reviewsForm.rejected'),
                icon: 'x',
                action: 'reject',
                class: 'text-red-600 hover:text-red-900',
                condition: (item: any) => item.status === 'pending'
            },
            {
                label: this.translationService.translate('common.hide'),
                icon: 'eye-off',
                action: 'hide',
                class: 'text-gray-600 hover:text-gray-900',
                condition: (item: any) => item.status === 'approved'
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
        // CSV import not supported for reviews
        alert(this.translationService.translate('common.importError'));
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
                updatedAt: review.updated_at,
                user: review.user,
                product: review.product
            }));
            this.reviewsSubject.next(mappedReviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.reviewsSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected' | 'hidden'): Promise<void> {
        try {
            await this.supabaseService.updateRecord('reviews', reviewId, { status });
            this.showSuccess(
                this.translationService.translate('admin.reviewsForm.reviewUpdated'),
                this.translationService.translate('admin.reviewsForm.reviewUpdated')
            );
            this.loadReviews();
        } catch (error) {
            console.error('Error updating review status:', error);
            alert(this.translationService.translate('admin.reviewsForm.reviewError'));
        }
    }

    private async deleteReview(reviewId: string): Promise<void> {
        if (!confirm(this.translationService.translate('admin.reviewsForm.reviewDeleted'))) return;

        try {
            await this.supabaseService.deleteRecord('reviews', reviewId);
            this.showSuccess(
                this.translationService.translate('admin.reviewsForm.reviewDeleted'),
                this.translationService.translate('admin.reviewsForm.reviewDeleted')
            );
            this.loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert(this.translationService.translate('admin.reviewsForm.reviewError'));
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