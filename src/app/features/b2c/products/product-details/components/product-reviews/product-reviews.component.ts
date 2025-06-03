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
        <h3 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'reviews.customerReviews' | translate }}</h3>
        
        <!-- Rating Summary -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Overall Rating -->
            <div class="text-center">
              <div class="text-4xl font-bold text-gray-900 mb-2 font-['DM_Sans']">{{ averageRating }}</div>
              <div class="flex justify-center mb-2">
                <div class="flex">
                  <svg 
                    *ngFor="let star of getStarArray(averageRating)" 
                    class="w-6 h-6 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
              </div>
              <p class="text-sm text-gray-600 font-['DM_Sans']">{{ 'reviews.basedOnReviews' | translate:{ count: reviews.length } }}</p>
            </div>

            <!-- Rating Breakdown -->
            <div class="space-y-2">
              <div *ngFor="let rating of [5,4,3,2,1]" class="flex items-center">
                <span class="text-sm font-medium text-gray-700 w-8 font-['DM_Sans']">{{ rating }}</span>
                <svg class="w-4 h-4 text-yellow-400 fill-current mx-1" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <div class="flex-1 mx-2">
                  <div class="bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-yellow-400 h-2 rounded-full"
                      [style.width.%]="getRatingPercentage(rating)"
                    ></div>
                  </div>
                </div>
                <span class="text-sm text-gray-600 w-12 text-right font-['DM_Sans']">
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
            class="px-6 py-3 bg-[#0ACF83] text-white font-semibold rounded-lg hover:bg-[#09b574] transition-colors font-['DM_Sans']"
          >
            {{ 'reviews.writeReview' | translate }}
          </button>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="space-y-6">
        <div 
          *ngFor="let review of reviews" 
          class="bg-white border border-gray-200 rounded-lg p-6"
        >
          <!-- Review Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <img 
                [src]="review.userAvatar" 
                [alt]="review.userName"
                class="w-10 h-10 rounded-full mr-3"
              >
              <div>
                <div class="flex items-center">
                  <h4 class="font-semibold text-gray-900 font-['DM_Sans']">{{ review.userName }}</h4>
                  <span 
                    *ngIf="review.verified"
                    class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-['DM_Sans']"
                  >
                    {{ 'reviews.verifiedPurchase' | translate }}
                  </span>
                </div>
                <div class="flex items-center mt-1">
                  <div class="flex">
                    <svg 
                      *ngFor="let star of getStarArray(review.rating)" 
                      class="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <span class="ml-2 text-sm text-gray-600 font-['DM_Sans']">
                    {{ review.date | date:'MMM d, yyyy' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Content -->
          <div class="mb-4">
            <h5 class="font-semibold text-gray-900 mb-2 font-['DM_Sans']">{{ review.title | translate }}</h5>
            <p class="text-gray-700 leading-relaxed font-['DM_Sans']">{{ review.comment | translate }}</p>
          </div>

          <!-- Review Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <button 
              (click)="markHelpful(review.id)"
              class="flex items-center text-sm text-gray-600 hover:text-gray-800 font-['DM_Sans']"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              {{ 'reviews.helpful' | translate:{ count: review.helpful } }}
            </button>
            <button class="text-sm text-gray-600 hover:text-gray-800 font-['DM_Sans']">
              {{ 'reviews.report' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Load More Reviews -->
      <div class="text-center pt-8" *ngIf="reviews.length >= 5">
        <button 
          (click)="loadMoreReviews()"
          class="px-6 py-3 bg-white text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-['DM_Sans']"
        >
          {{ 'reviews.loadMoreReviews' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
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
        title: 'reviews.excellentQuality',
        comment: 'reviews.excellentQuality',
        date: new Date('2024-01-20'),
        verified: true,
        helpful: 12
      },
      {
        id: '2',
        userName: 'Michael Chen',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        rating: 4,
        title: 'reviews.goodValue',
        comment: 'reviews.goodValue',
        date: new Date('2024-01-18'),
        verified: true,
        helpful: 8
      },
      {
        id: '3',
        userName: 'Emma Wilson',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        title: 'reviews.highlyRecommended',
        comment: 'reviews.highlyRecommended',
        date: new Date('2024-01-15'),
        verified: true,
        helpful: 15
      },
      {
        id: '4',
        userName: 'David Rodriguez',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        rating: 4,
        title: 'reviews.solidProduct',
        comment: 'reviews.solidProduct',
        date: new Date('2024-01-12'),
        verified: false,
        helpful: 5
      },
      {
        id: '5',
        userName: 'Lisa Thompson',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        title: 'reviews.outstandingService',
        comment: 'reviews.outstandingService',
        date: new Date('2024-01-10'),
        verified: true,
        helpful: 9
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

  openWriteReview(): void {
    // TODO: Implement write review functionality
    console.log('Open write review modal');
  }

  loadMoreReviews(): void {
    // TODO: Implement load more reviews functionality
    console.log('Load more reviews');
  }
} 