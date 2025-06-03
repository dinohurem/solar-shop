import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, from, takeUntil, catchError, of, finalize } from 'rxjs';
import { BlogPost } from '../../../shared/models/blog.model';
import { SupabaseService } from '../../../services/supabase.service';
import { BlogDataMapperService, SupabaseBlogPost } from '../../../services/blog-data-mapper.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4 md:px-8 lg:px-32">
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
            [class]="selectedCategory === null ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            class="px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider transition-colors">
            {{ 'blog.allPosts' | translate }}
          </button>
          <button 
            *ngFor="let category of categories"
            (click)="filterByCategory(category.id)"
            [class]="selectedCategory === category.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            class="px-4 py-2 rounded-full text-sm font-medium font-['DM_Sans'] uppercase tracking-wider transition-colors">
            {{ category.name }}
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p class="text-gray-600">{{ 'blog.loading' | translate }}</p>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="text-center py-20">
          <div class="text-red-600 text-6xl mb-4">📝</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ 'blog.unableToLoad' | translate }}</h2>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            (click)="loadBlogPosts()"
            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            {{ 'blog.tryAgain' | translate }}
          </button>
        </div>

        <!-- Blog Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" *ngIf="!loading && !error">
          <article 
            *ngFor="let post of displayedPosts"
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
                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
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

        <!-- Load More Button -->
        <div class="text-center" *ngIf="!loading && !error && hasMorePosts">
          <button 
            (click)="loadMorePosts()"
            [disabled]="loadingMore"
            class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!loadingMore">{{ 'blog.loadMore' | translate }}</span>
            <span *ngIf="loadingMore" class="flex items-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{{ 'common.loading' | translate }}</span>
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- What You'll Find Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              {{ 'blog.whatYouFind' | translate }}
            </h2>
            
            <div class="space-y-6">
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.technicalGuides' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.technicalGuidesText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.regulationsInsights' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.regulationsText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.sustainabilityTips' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.sustainabilityText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.caseStudies' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.caseStudiesText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.faqTutorials' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.faqText' | translate }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Right Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              {{ 'blog.trustedPartner' | translate }}
            </h2>
            
            <p class="font-['DM_Sans'] text-base text-gray-800 leading-relaxed">
              {{ 'blog.partnerText' | translate }}
            </p>
          </div>
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
  private supabaseService = inject(SupabaseService);
  private blogMapper = inject(BlogDataMapperService);
  private destroy$ = new Subject<void>();

  blogPosts: BlogPost[] = [];
  displayedPosts: BlogPost[] = [];
  categories: any[] = [];
  selectedCategory: string | null = null;
  loading = true;
  loadingMore = false;
  error: string | null = null;
  hasMorePosts = true;
  currentPage = 0;
  postsPerPage = 9;

  ngOnInit() {
    this.loadCategories();
    this.loadBlogPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories() {
    from(this.supabaseService.getCategories()).pipe(
      catchError((error: any) => {
        console.error('Error loading categories:', error);
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe((data: any[]) => {
      this.categories = data;
    });
  }

  loadBlogPosts() {
    this.loading = true;
    this.error = null;
    this.currentPage = 0;

    from(this.supabaseService.getBlogPosts({
      limit: this.postsPerPage,
      offset: 0
    })).pipe(
      catchError((error: any) => {
        console.error('Error loading blog posts:', error);
        this.error = 'Unable to load articles. Please try again later.';
        return of([]);
      }),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    ).subscribe((data: any[]) => {
      this.blogPosts = this.blogMapper.mapSupabaseToBlogPosts(data as SupabaseBlogPost[]);
      this.applyFilters();
      this.hasMorePosts = data.length === this.postsPerPage;
    });
  }

  loadMorePosts() {
    if (this.loadingMore || !this.hasMorePosts) return;

    this.loadingMore = true;
    this.currentPage++;

    from(this.supabaseService.getBlogPosts({
      categoryId: this.selectedCategory || undefined,
      limit: this.postsPerPage,
      offset: this.currentPage * this.postsPerPage
    })).pipe(
      catchError((error: any) => {
        console.error('Error loading more posts:', error);
        this.currentPage--; // Revert page increment on error
        return of([]);
      }),
      finalize(() => this.loadingMore = false),
      takeUntil(this.destroy$)
    ).subscribe((data: any[]) => {
      const newPosts = this.blogMapper.mapSupabaseToBlogPosts(data as SupabaseBlogPost[]);
      this.blogPosts.push(...newPosts);
      this.applyFilters();
      this.hasMorePosts = data.length === this.postsPerPage;
    });
  }

  filterByCategory(categoryId: string | null) {
    this.selectedCategory = categoryId;
    this.currentPage = 0;
    this.loadingMore = false;

    from(this.supabaseService.getBlogPosts({
      categoryId: categoryId || undefined,
      limit: this.postsPerPage,
      offset: 0
    })).pipe(
      catchError((error: any) => {
        console.error('Error filtering posts:', error);
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe((data: any[]) => {
      this.blogPosts = this.blogMapper.mapSupabaseToBlogPosts(data as SupabaseBlogPost[]);
      this.applyFilters();
      this.hasMorePosts = data.length === this.postsPerPage;
    });
  }

  private applyFilters() {
    this.displayedPosts = [...this.blogPosts];
  }

  navigateToPost(postId: string) {
    this.router.navigate(['/blog', postId]);
  }

  navigateToBlog() {
    // Already on blog page
  }
} 