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

              <!-- Author Info -->
              <div class="flex items-center space-x-4">
                <img 
                  [src]="blogPost.author.avatar || '/assets/images/default-avatar.jpg'" 
                  [alt]="blogPost.author.name"
                  class="w-12 h-12 rounded-full object-cover"
                >
                <div>
                  <p class="font-semibold font-['DM_Sans']">{{ blogPost.author.name }}</p>
                  <p class="text-solar-100 text-sm font-['DM_Sans']">{{ blogPost.author.title }}</p>
                </div>
              </div>
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

          <!-- Share Section -->
          <div class="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 font-['Poppins'] text-gray-900">{{ 'blog.shareArticle' | translate }}</h3>
            <div class="flex flex-wrap gap-4">
              <button 
                (click)="shareOnFacebook()"
                class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-['DM_Sans'] font-medium">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{{ 'blog.facebook' | translate }}</span>
              </button>
              
              <button 
                (click)="shareOnTwitter()"
                class="flex items-center space-x-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-['DM_Sans'] font-medium">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>{{ 'blog.twitter' | translate }}</span>
              </button>
              
              <button 
                (click)="shareOnLinkedIn()"
                class="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-['DM_Sans'] font-medium">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>{{ 'blog.linkedin' | translate }}</span>
              </button>
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
                    <div class="flex items-center space-x-2">
                      <img 
                        [src]="post.author.avatar || '/assets/images/default-avatar.jpg'" 
                        [alt]="post.author.name"
                        class="w-8 h-8 rounded-full object-cover"
                      >
                      <span class="text-sm text-gray-700 font-['DM_Sans']">{{ post.author.name }}</span>
                    </div>
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

        <!-- Footer -->
        <footer class="bg-white border-t border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <!-- Logo and Description -->
              <div class="lg:col-span-1">
                <div class="flex items-center space-x-2 mb-4">
                  <img src="assets/images/logo.svg" alt="SolarShop" class="h-8 w-8">
                  <span class="text-xl font-bold text-gray-900 font-['Poppins']">SolarShop</span>
                </div>
                <p class="text-gray-600 mb-6 font-['DM_Sans']">
                  Your trusted partner for solar energy solutions. Building a sustainable future together.
                </p>
                <div class="flex space-x-4">
                  <a href="#" class="text-gray-400 hover:text-solar-600 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" class="text-gray-400 hover:text-solar-600 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" class="text-gray-400 hover:text-solar-600 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <!-- Navigation Links -->
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 font-['DM_Sans']">Navigation</h3>
                <ul class="space-y-3">
                  <li><a routerLink="/products" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">{{ 'nav.products' | translate }}</a></li>
                  <li><a routerLink="/offers" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">{{ 'nav.offers' | translate }}</a></li>
                  <li><a routerLink="/mission" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">{{ 'nav.sustainability' | translate }}</a></li>
                  <li><a routerLink="/blog" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">{{ 'nav.blog' | translate }}</a></li>
                </ul>
              </div>

              <!-- Company Links -->
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 font-['DM_Sans']">Company</h3>
                <ul class="space-y-3">
                  <li><a routerLink="/company" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">{{ 'nav.company' | translate }}</a></li>
                  <li><a routerLink="/contact" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">{{ 'nav.contact' | translate }}</a></li>
                  <li><a href="#" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">Privacy Policy</a></li>
                  <li><a href="#" class="text-gray-600 hover:text-solar-600 transition-colors font-['DM_Sans']">Terms of Service</a></li>
                </ul>
              </div>

              <!-- Contact Info -->
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 font-['DM_Sans']">Contact</h3>
                <ul class="space-y-3">
                  <li class="flex items-center space-x-2 text-gray-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <span class="font-['DM_Sans']">{{ 'contact.phone' | translate }}</span>
                  </li>
                  <li class="flex items-center space-x-2 text-gray-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span class="font-['DM_Sans']">{{ 'contact.email' | translate }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Bottom Bar -->
            <div class="border-t border-gray-200 mt-12 pt-8">
              <div class="flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-500 text-sm font-['DM_Sans']">
                  © 2024 SolarShop. All rights reserved.
                </p>
                <div class="flex items-center space-x-4 mt-4 md:mt-0">
                  <button 
                    class="text-gray-500 hover:text-solar-600 text-sm font-['DM_Sans'] transition-colors">
                    {{ 'language.current' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
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

  shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.blogPost?.title || '');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, '_blank');
  }

  shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.blogPost?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
  }

  shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.blogPost?.title || '');
    const summary = encodeURIComponent(this.blogPost?.excerpt || '');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
  }
} 