import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlogPost } from '../../../shared/models/blog.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BlogActions } from './store/blog.actions';
import {
  selectBlogPosts,
  selectBlogIsLoading,
  selectBlogError
} from './store/blog.selectors';

@Component({
  selector: 'app-blog-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Recent Blog Posts Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="font-['Poppins'] font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            {{ 'blog.recentProjects' | translate }}
          </h2>
          <p class="font-['DM_Sans'] text-lg text-gray-600 max-w-3xl mx-auto">
            {{ 'blog.recentProjectsSubtitle' | translate }}
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-12">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-600"></div>
            <p class="text-gray-600 font-['DM_Sans']">{{ 'common.loading' | translate }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error$ | async as error" class="text-center py-12">
          <div class="text-gray-400 text-4xl mb-4">📝</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">{{ 'blog.unableToLoad' | translate }}</h3>
          <p class="text-gray-600 mb-4 font-['DM_Sans']">{{ error }}</p>
          <button 
            (click)="loadBlogPosts()"
            class="bg-solar-600 text-white px-4 py-2 rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans']">
            {{ 'blog.tryAgain' | translate }}
          </button>
        </div>

        <!-- Recent Blog Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="!(isLoading$ | async) && !(error$ | async)">
          <article 
            *ngFor="let post of recentPosts$ | async"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            (click)="navigateToPost(post.id)"
          >
            <div class="h-48 overflow-hidden">
              <img 
                [src]="post.imageUrl || '/assets/images/blog-placeholder.jpg'"
                [alt]="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between text-sm text-gray-500 mb-3 font-['DM_Sans']">
                <span>{{ post.publishedAt | date:'MMM dd, yyyy' }}</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ post.readTime }} min</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between mb-3">
                <span class="bg-solar-100 text-solar-800 px-2 py-1 rounded text-xs font-medium font-['DM_Sans']">
                  {{ post.category.name || 'General' }}
                </span>
                <span *ngIf="post.featured" class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium font-['DM_Sans']">
                  {{ 'blog.featured' | translate }}
                </span>
              </div>
              
              <h3 class="font-['Poppins'] font-semibold text-xl text-gray-900 leading-tight mb-3 line-clamp-2">
                {{ post.title }}
              </h3>
              
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {{ post.excerpt }}
              </p>
              
              <div class="flex items-center justify-between">
                <div class="text-solar-600 font-medium text-sm font-['DM_Sans'] group-hover:text-solar-700 transition-colors">
                  {{ 'blog.readMore' | translate }}
                  <svg class="w-4 h-4 inline ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div *ngIf="!(isLoading$ | async) && !(error$ | async) && (recentPosts$ | async)?.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-4xl mb-4">📝</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">{{ 'blog.noPosts' | translate }}</h3>
          <p class="text-gray-600 font-['DM_Sans']">{{ 'blog.noPostsText' | translate }}</p>
        </div>

        <!-- View All Button -->
        <div class="text-center mt-12" *ngIf="!(isLoading$ | async) && !(error$ | async) && (recentPosts$ | async)?.length">
          <button 
            (click)="navigateToBlog()"
            class="bg-solar-600 text-white px-8 py-3 rounded-lg hover:bg-solar-700 transition-colors font-medium font-['DM_Sans'] inline-flex items-center space-x-2"
          >
            <span>{{ 'blog.viewAllPosts' | translate }}</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class BlogHomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  // NgRx Observables
  blogPosts$: Observable<BlogPost[]>;
  recentPosts$: Observable<BlogPost[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor() {
    // Initialize observables from store
    this.blogPosts$ = this.store.select(selectBlogPosts);
    this.isLoading$ = this.store.select(selectBlogIsLoading);
    this.error$ = this.store.select(selectBlogError);

    // Get last 3 posts sorted by publishedAt
    this.recentPosts$ = this.blogPosts$.pipe(
      map(posts => {
        if (!posts || posts.length === 0) return [];
        // Create a copy of the array before sorting to avoid mutating the original
        return [...posts]
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 3);
      })
    );
  }

  ngOnInit() {
    this.loadBlogPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlogPosts() {
    console.log('BlogHomeComponent: Dispatching loadBlogPosts action');
    this.store.dispatch(BlogActions.loadBlogPosts());
  }

  navigateToPost(postId: string) {
    this.store.dispatch(BlogActions.selectPost({ postId }));
    this.router.navigate(['/blog', postId]);
  }

  navigateToBlog() {
    this.router.navigate(['/blog']);
  }
} 