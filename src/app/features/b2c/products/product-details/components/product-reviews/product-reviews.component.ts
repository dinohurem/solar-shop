import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: Date;
  verified: boolean;
  helpful: number;
}

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div id="reviews" class="space-y-8">
      <!-- Reviews Header -->
      <div>
        <h3 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'reviewsSection.customerReviews' | translate }}</h3>
        
        <!-- Rating Summary -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Overall Rating -->
            <div class="text-center">
              <div class="text-5xl font-bold text-blue-900 mb-3 font-['DM_Sans']">{{ averageRating }}</div>
              <div class="flex justify-center mb-3">
                <div class="flex space-x-1">
                  <svg 
                    *ngFor="let star of getStarArray(averageRating)" 
                    class="w-7 h-7 text-yellow-400 fill-current drop-shadow-sm"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
              <p class="text-sm text-blue-700 font-medium font-['DM_Sans']">{{ 'reviewsSection.basedOnReviews' | translate:{ count: reviews.length } }}</p>
            </div>

            <!-- Rating Breakdown -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4">{{ 'reviewsSection.ratingBreakdown' | translate }}</h4>
              <div *ngFor="let rating of [5,4,3,2,1]" class="flex items-center group">
                <span class="text-sm font-medium text-blue-800 w-8 font-['DM_Sans']">{{ rating }}</span>
                <svg class="w-4 h-4 text-yellow-400 fill-current mx-2" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <div class="flex-1 mx-3">
                  <div class="bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      class="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-700 ease-out"
                      [style.width.%]="getRatingPercentage(rating)"
                    ></div>
                  </div>
                </div>
                <span class="text-sm text-blue-700 w-12 text-right font-medium font-['DM_Sans']">
                  {{ getRatingCount(rating) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Write Review Button -->
        <div class="mb-8">
          <button 
            (click)="openWriteReview()"
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-['DM_Sans']"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            {{ 'reviewsSection.writeReview' | translate }}
          </button>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="space-y-6">
        <div 
          *ngFor="let review of reviews; trackBy: trackByReviewId" 
          class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
        >
          <!-- Review Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <div class="relative">
              <img 
                [src]="review.userAvatar" 
                [alt]="review.userName"
                  class="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-100"
                >
                <div *ngIf="review.verified" class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div>
                <div class="flex items-center mb-1">
                  <h4 class="font-semibold text-gray-900 font-['DM_Sans'] mr-3">{{ review.userName }}</h4>
                  <span 
                    *ngIf="review.verified"
                    class="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full font-['DM_Sans']"
                  >
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    {{ 'reviewsSection.verifiedPurchase' | translate }}
                  </span>
                </div>
                <div class="flex items-center">
                  <div class="flex space-x-0.5 mr-3">
                    <svg 
                      *ngFor="let star of getStarArray(review.rating)" 
                      class="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <span class="text-sm text-gray-500 font-['DM_Sans']">
                    {{ review.date | date:'MMM d, yyyy' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Content -->
          <div class="mb-6">
            <h5 class="font-semibold text-gray-900 mb-3 text-lg font-['DM_Sans']">{{ review.title }}</h5>
            <p class="text-gray-700 leading-relaxed font-['DM_Sans'] text-base">{{ review.comment }}</p>
          </div>

          <!-- Review Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <button 
              (click)="markHelpful(review.id)"
              class="flex items-center text-sm text-gray-600 hover:text-blue-600 font-['DM_Sans'] transition-colors duration-200 group"
            >
              <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              {{ 'reviewsSection.helpful' | translate }} ({{ review.helpful }})
            </button>
            <button 
              class="text-sm text-gray-600 hover:text-red-600 font-['DM_Sans'] transition-colors duration-200"
              (click)="reportReview(review.id)"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              {{ 'reviewsSection.report' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Load More Reviews -->
      <div class="text-center pt-8" *ngIf="reviews.length >= 5">
        <button 
          (click)="loadMoreReviews()"
          class="inline-flex items-center px-8 py-3 bg-white text-gray-700 font-semibold border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 font-['DM_Sans']"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          {{ 'reviewsSection.loadMoreReviews' | translate }}
        </button>
      </div>

      <!-- No Reviews State -->
      <div *ngIf="reviews.length === 0" class="text-center py-12">
        <div class="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ 'reviewsSection.noReviewsYet' | translate }}</h3>
        <p class="text-gray-600 mb-6">{{ 'reviewsSection.beFirstToReview' | translate }}</p>
        <button 
          (click)="openWriteReview()"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200"
        >
          {{ 'reviewsSection.writeFirstReview' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .drop-shadow-sm {
      filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.05));
    }
  `]
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: string;

  reviews: Review[] = [];
  averageRating: number = 0;

  ngOnInit(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    // Mock reviews data - in a real app, this would come from a service
    this.reviews = [
      {
        id: '1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        title: 'Excellent solar panel - highly recommended!',
        comment: 'These solar panels exceeded my expectations. Great efficiency and build quality. Installation was straightforward and they\'ve been performing excellently for months now.',
        date: new Date('2024-01-20'),
        verified: true,
        helpful: 12
      },
      {
        id: '2',
        userName: 'Michael Chen',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        rating: 4,
        title: 'Good value for money',
        comment: 'Solid performance and reasonable price. The panels work well but took a bit longer to install than expected. Overall satisfied with the purchase.',
        date: new Date('2024-01-18'),
        verified: true,
        helpful: 8
      },
      {
        id: '3',
        userName: 'Emma Wilson',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        title: 'Outstanding quality and service',
        comment: 'Perfect addition to our renewable energy setup. The customer service was exceptional and the product quality is top-notch. Would definitely buy again.',
        date: new Date('2024-01-15'),
        verified: false,
        helpful: 5
      },
      {
        id: '4',
        userName: 'David Rodriguez',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        rating: 4,
        title: 'Reliable and efficient',
        comment: 'These panels have been consistently producing power as expected. Good build quality and the warranty terms are fair. Happy with the investment.',
        date: new Date('2024-01-12'),
        verified: true,
        helpful: 3
      },
      {
        id: '5',
        userName: 'Lisa Thompson',
        userAvatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        title: 'Fantastic product and support',
        comment: 'Amazing panels with great technical support. The team helped with installation guidance and the panels are performing better than advertised specs.',
        date: new Date('2024-01-10'),
        verified: true,
        helpful: 7
      }
    ];

    this.calculateAverageRating();
  }

  private calculateAverageRating(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getRatingCount(rating: number): number {
    return this.reviews.filter(review => review.rating === rating).length;
  }

  getRatingPercentage(rating: number): number {
    const count = this.getRatingCount(rating);
    return this.reviews.length > 0 ? (count / this.reviews.length) * 100 : 0;
  }

  markHelpful(reviewId: string): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful++;
    }
  }

  reportReview(reviewId: string): void {
    console.log('Reporting review:', reviewId);
    // In a real app, this would show a report modal or send a report
  }

  openWriteReview(): void {
    // Implementation for opening write review modal/form
    console.log('Opening write review form');
  }

  loadMoreReviews(): void {
    // Implementation for loading more reviews
    console.log('Loading more reviews');
  }

  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }
} 