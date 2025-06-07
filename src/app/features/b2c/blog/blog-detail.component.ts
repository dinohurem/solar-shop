import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subject, catchError, finalize, of, takeUntil, from } from 'rxjs';
import { BlogPost } from '../../../shared/models/blog.model';
import { SupabaseService } from '../../../services/supabase.service';
import { BlogDataMapperService, SupabaseBlogPost } from '../../../services/blog-data-mapper.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center min-h-screen">
        <div class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-600"></div>
          <p class="text-gray-600 font-['DM_Sans']">Loading article...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="max-w-2xl mx-auto text-center py-20">
        <div class="text-gray-400 text-6xl mb-6">📄</div>
        <h2 class="text-2xl font-bold text-gray-900 font-['Poppins']">{{ 'blog.articleNotFound' | translate }}</h2>
        <p class="text-gray-600 mt-4 mb-8 font-['DM_Sans']">{{ error }}</p>
        <button 
          (click)="router.navigate(['/blog'])"
          class="bg-solar-600 text-white px-6 py-3 rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans'] font-medium">
          {{ 'blog.backToBlog' | translate }}
        </button>
      </div>

      <!-- Content -->
      <div *ngIf="blogPost && !loading">
        <!-- Hero Section -->
        <section class="relative bg-gradient-to-br from-solar-600 to-solar-800 text-white py-20">
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Breadcrumb -->
            <nav class="mb-8">
              <ol class="flex items-center space-x-2 text-sm">
                <li><a routerLink="/" class="hover:text-solar-200 transition-colors font-['DM_Sans']">Home</a></li>
                <li class="text-solar-200 font-['DM_Sans']">/</li>
                <li><a routerLink="/blog" class="hover:text-solar-200 transition-colors font-['DM_Sans']">Blog</a></li>
                <li class="text-solar-200 font-['DM_Sans']">/</li>
                <li class="text-solar-100 font-['DM_Sans']">{{ blogPost.title }}</li>
              </ol>
            </nav>

            <div class="max-w-4xl">
              <div class="flex items-center space-x-4 mb-6">
                <span class="bg-solar-500 text-white px-3 py-1 rounded-full text-sm font-medium font-['DM_Sans']">
                  {{ blogPost.category.name }}
                </span>
                <span class="text-solar-100 font-['DM_Sans']">{{ blogPost.readTime }} min read</span>
                <span class="text-solar-100 font-['DM_Sans']">{{ blogPost.publishedAt | date:'MMM dd, yyyy' }}</span>
              </div>
              
              <h1 class="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6 leading-tight">
                {{ blogPost.title }}
              </h1>
              
              <p class="text-xl text-solar-100 mb-8 leading-relaxed font-['DM_Sans']">
                {{ blogPost.excerpt }}
              </p>
            </div>
          </div>
        </section>

        <!-- Article Content -->
        <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <!-- Featured Image -->
          <div class="mb-12">
            <img 
              [src]="blogPost.imageUrl || '/assets/images/blog-placeholder.jpg'" 
              [alt]="blogPost.title"
              class="w-full h-96 object-cover rounded-lg shadow-lg"
            >
          </div>

          <!-- Article Body -->
          <div class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-['Poppins'] prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-p:font-['DM_Sans'] prose-p:leading-relaxed prose-p:mb-6 prose-ul:mb-6 prose-ul:pl-6 prose-li:mb-2 prose-li:font-['DM_Sans'] prose-blockquote:border-l-4 prose-blockquote:border-solar-500 prose-blockquote:pl-4 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:font-['DM_Sans'] prose-img:rounded-lg prose-img:my-8 prose-a:text-solar-600 prose-a:underline hover:prose-a:text-solar-500">
            <div [innerHTML]="blogPost.htmlContent || blogPost.content" class="text-gray-700 leading-relaxed font-['DM_Sans']">
            </div>
          </div>

          <!-- Tags -->
          <div class="mt-12 pt-8 border-t border-gray-200">
            <h3 class="text-lg font-semibold mb-4 font-['Poppins'] text-gray-900">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                *ngFor="let tag of blogPost?.tags"
                class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer font-['DM_Sans']"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </article>

        <!-- Related Posts -->
        <section class="bg-gray-50 py-16" *ngIf="relatedPosts.length > 0">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center font-['Poppins']">{{ 'blog.relatedArticles' | translate }}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div 
                *ngFor="let post of relatedPosts"
                class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                (click)="navigateToPost(post.id)"
              >
                <img 
                  [src]="post.imageUrl || '/assets/images/blog-placeholder.jpg'" 
                  [alt]="post.title"
                  class="w-full h-48 object-cover"
                >
                <div class="p-6">
                  <div class="flex items-center justify-between mb-3">
                    <span class="bg-solar-100 text-solar-800 px-2 py-1 rounded text-sm font-medium font-['DM_Sans']">
                      {{ post.category.name }}
                    </span>
                    <span class="text-gray-500 text-sm font-['DM_Sans']">{{ post.readTime }} min</span>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 font-['Poppins']">{{ post.title }}</h3>
                  <p class="text-gray-600 mb-4 line-clamp-3 font-['DM_Sans']">{{ post.excerpt }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500 font-['DM_Sans']">{{ post.publishedAt | date:'MMM dd' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Newsletter Signup -->
        <section class="bg-gradient-to-r from-solar-600 to-solar-700 py-16">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-white mb-4 font-['Poppins']">{{ 'blog.stayUpdated' | translate }}</h2>
            <p class="text-solar-100 mb-8 text-lg font-['DM_Sans']">
              {{ 'blog.newsletterText' | translate }}
            </p>
            <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                [placeholder]="'offers.enterEmail' | translate"
                class="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-solar-300 focus:outline-none font-['DM_Sans']"
              >
              <button 
                type="submit"
                class="bg-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-600 transition-colors font-['DM_Sans']"
              >
                {{ 'offers.subscribe' | translate }}
              </button>
            </form>
          </div>
        </section>        
        
      </div>
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
export class BlogDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private blogMapper = inject(BlogDataMapperService);
  private destroy$ = new Subject<void>();

  blogPost: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  postId: string | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.postId = params.get('id');
      if (this.postId) {
        this.loadBlogPost(this.postId);
        // Scroll to top when navigating to a new blog post
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBlogPost(id: string) {
    this.loading = true;
    this.error = null;

    from(this.supabaseService.getBlogPostById(id)).pipe(
      catchError((error: any) => {
        console.error('Error loading blog post:', error);
        this.error = 'Article not found or could not be loaded.';
        return of(null);
      }),
      finalize(() => this.loading = false),
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      if (data) {
        this.blogPost = this.blogMapper.mapSupabaseToBlogPost(data as SupabaseBlogPost);
        this.loadRelatedPosts(this.blogPost.category.id, this.blogPost.id);

        // Increment view count
        from(this.supabaseService.incrementBlogPostViews(id)).subscribe({
          error: (error: any) => console.warn('Failed to increment view count:', error)
        });
      }
    });
  }

  private loadRelatedPosts(categoryId: string, excludeId: string) {
    from(this.supabaseService.getRelatedBlogPosts(categoryId, excludeId, 3)).pipe(
      catchError((error: any) => {
        console.error('Error loading related posts:', error);
        return of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe((data: any[]) => {
      this.relatedPosts = this.blogMapper.mapSupabaseToBlogPosts(data as SupabaseBlogPost[]);
    });
  }

  navigateToPost(postId: string) {
    this.router.navigate(['/blog', postId]);
  }
} 