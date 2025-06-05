import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { BlogPost } from '../../../shared/models/blog.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BlogActions } from './store/blog.actions';
import {
  selectBlogPosts,
  selectBlogIsLoading,
  selectBlogError,
  selectFilteredPosts,
  selectPostCategories,
  selectFilteredCategory
} from './store/blog.selectors';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-solar-600 to-solar-800 text-white py-20 px-4 md:px-8 lg:px-32">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="font-['Poppins'] font-semibold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          {{ 'blog.title' | translate }}
        </h1>
        <p class="font-['DM_Sans'] text-base md:text-lg max-w-4xl mx-auto opacity-80 leading-relaxed">
          {{ 'blog.subtitle' | translate }}
        </p>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto">
        <!-- Category Filters -->
        <div class="flex flex-wrap justify-center gap-3 mb-16">
          <button 
            (click)="filterByCategory(null)"
            [class]="(selectedCategory$ | async) === null ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            class="px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider transition-colors">
            {{ 'blog.allPosts' | translate }}
          </button>
          <button 
            *ngFor="let category of categories$ | async"
            (click)="filterByCategory(category.id)"
            [class]="(selectedCategory$ | async) === category.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            class="px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider transition-colors">
            {{ category.name }}
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading$ | async" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-600"></div>
            <p class="text-gray-600">{{ 'blog.loading' | translate }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error$ | async as error" class="text-center py-20">
          <div class="text-red-600 text-6xl mb-4">📝</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ 'blog.unableToLoad' | translate }}</h2>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            (click)="loadBlogPosts()"
            class="bg-solar-600 text-white px-6 py-3 rounded-lg hover:bg-solar-700 transition-colors">
            {{ 'blog.tryAgain' | translate }}
          </button>
        </div>

        <!-- Blog Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" *ngIf="!(isLoading$ | async) && !(error$ | async)">
          <article 
            *ngFor="let post of filteredPosts$ | async"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            (click)="navigateToPost(post.id)"
          >
            <div class="h-60 overflow-hidden">
              <img 
                [src]="post.imageUrl || '/assets/images/blog-placeholder.jpg'"
                [alt]="post.title"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between text-sm text-gray-500 font-['DM_Sans']">
                <span>{{ post.publishedAt | date:'MMM dd, yyyy' }}</span>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ post.readTime }} min</span>
                </div>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="bg-solar-100 text-solar-800 px-2 py-1 rounded text-xs font-medium">
                  {{ post.category.name }}
                </span>
                <span *ngIf="post.featured" class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                  {{ 'blog.featured' | translate }}
                </span>
              </div>
              <h3 class="font-['DM_Sans'] font-semibold text-xl text-gray-800 leading-tight line-clamp-2">
                {{ post.title }}
              </h3>
              <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed line-clamp-3">
                {{ post.excerpt }}
              </p>
              <div class="flex items-center space-x-2 pt-2">
                <img 
                  [src]="post.author.avatar || '/assets/images/default-avatar.jpg'"
                  [alt]="post.author.name"
                  class="w-8 h-8 rounded-full object-cover"
                >
                <span class="text-sm text-gray-700">{{ post.author.name }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div *ngIf="!(isLoading$ | async) && !(error$ | async) && (filteredPosts$ | async)?.length === 0" class="text-center py-20">
          <div class="text-gray-400 text-6xl mb-4">📝</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ 'blog.noPosts' | translate }}</h2>
          <p class="text-gray-600 mb-6">{{ 'blog.noPostsText' | translate }}</p>
        </div>
      </div>
    </section>


    </div>
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
export class BlogComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  // NgRx Observables
  blogPosts$: Observable<BlogPost[]>;
  filteredPosts$: Observable<BlogPost[]>;
  categories$: Observable<any[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedCategory$: Observable<string | null>;

  constructor() {
    // Initialize observables from store
    this.blogPosts$ = this.store.select(selectBlogPosts);
    this.filteredPosts$ = this.store.select(selectFilteredPosts);
    this.categories$ = this.store.select(selectPostCategories);
    this.isLoading$ = this.store.select(selectBlogIsLoading);
    this.error$ = this.store.select(selectBlogError);
    this.selectedCategory$ = this.store.select(selectFilteredCategory);
  }

  ngOnInit() {
    this.loadBlogPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlogPosts() {
    console.log('BlogComponent: Dispatching loadBlogPosts action');
    this.store.dispatch(BlogActions.loadBlogPosts());
  }

  filterByCategory(categoryId: string | null) {
    this.store.dispatch(BlogActions.filterByCategory({ category: categoryId || '' }));
  }

  searchPosts(query: string) {
    this.store.dispatch(BlogActions.searchPosts({ query }));
  }

  navigateToPost(postId: string) {
    this.store.dispatch(BlogActions.selectPost({ postId }));
    this.router.navigate(['/blog', postId]);
  }

  navigateToBlog() {
    // Already on blog page
  }
} 