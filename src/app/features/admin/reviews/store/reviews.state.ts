import { Review } from '../../../../shared/models/review.model';

export interface ReviewsState {
    reviews: Review[];
    currentReview: Review | null;
    loading: boolean;
    loadingReview: boolean;
    error: string | null;
    updatingStatus: boolean;
    updatingReview: boolean;
    deletingReview: boolean;
    approvingReview: boolean;
    rejectingReview: boolean;
} 