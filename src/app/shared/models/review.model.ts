export interface Review {
    id: string;
    userId: string;
    productId: string;
    orderId?: string;
    orderItemId?: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerifiedPurchase: boolean;
    isApproved: boolean;
    adminResponse?: string;
    helpfulCount: number;
    reportedCount: number;
    status: ReviewStatus;
    createdAt: string;
    updatedAt: string;
    // Populated fields
    user?: {
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    product?: {
        name: string;
        imageUrl?: string;
    };
}

export type ReviewStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'hidden';

export interface ReviewFilter {
    status?: ReviewStatus[];
    rating?: number[];
    isVerifiedPurchase?: boolean;
    productId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface ReviewSummary {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
}

export interface ProductReviewSummary {
    productId: string;
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    recentReviews: Review[];
} 