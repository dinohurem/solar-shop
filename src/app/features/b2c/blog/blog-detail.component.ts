import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BlogPost } from '../../../shared/models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Breadcrumb -->
          <nav class="mb-8">
            <ol class="flex items-center space-x-2 text-sm">
              <li><a routerLink="/" class="hover:text-green-200 transition-colors">Home</a></li>
              <li class="text-green-200">/</li>
              <li><a routerLink="/blog" class="hover:text-green-200 transition-colors">Blog</a></li>
              <li class="text-green-200">/</li>
              <li class="text-green-100">{{ blogPost?.title }}</li>
            </ol>
          </nav>

          <div class="max-w-4xl">
            <div class="flex items-center space-x-4 mb-6">
              <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {{ blogPost?.category?.name }}
              </span>
              <span class="text-green-100">{{ blogPost?.readTime }} min read</span>
              <span class="text-green-100">{{ blogPost?.publishedAt | date:'MMM dd, yyyy' }}</span>
            </div>
            
            <h1 class="text-4xl md:text-5xl font-bold font-['Poppins'] mb-6 leading-tight">
              {{ blogPost?.title }}
            </h1>
            
            <p class="text-xl text-green-100 mb-8 leading-relaxed">
              {{ blogPost?.excerpt }}
            </p>

            <!-- Author Info -->
            <div class="flex items-center space-x-4">
              <img 
                [src]="blogPost?.author?.avatar || '/assets/images/default-avatar.jpg'" 
                [alt]="blogPost?.author?.name"
                class="w-12 h-12 rounded-full object-cover"
              >
              <div>
                <p class="font-semibold">{{ blogPost?.author?.name }}</p>
                <p class="text-green-100 text-sm">{{ blogPost?.author?.title }}</p>
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
            [src]="blogPost?.imageUrl || '/assets/images/blog-placeholder.jpg'" 
            [alt]="blogPost?.title"
            class="w-full h-96 object-cover rounded-lg shadow-lg"
          >
        </div>

        <!-- Article Body -->
        <div class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-ul:mb-6 prose-ul:pl-6 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:pl-4 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:text-gray-600 prose-img:rounded-lg prose-img:my-8 prose-a:text-green-600 prose-a:underline hover:prose-a:text-green-500">
          <div [innerHTML]="blogPost?.htmlContent || blogPost?.content" class="text-gray-700 leading-relaxed">
          </div>
        </div>

        <!-- Tags -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <h3 class="text-lg font-semibold mb-4">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              *ngFor="let tag of blogPost?.tags"
              class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Social Sharing -->
        <div class="mt-8 pt-8 border-t border-gray-200">
          <h3 class="text-lg font-semibold mb-4">Share this article</h3>
          <div class="flex flex-wrap gap-4">
            <button 
              (click)="shareOnFacebook()"
              class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
            
            <button 
              (click)="shareOnTwitter()"
              class="flex items-center space-x-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Twitter</span>
            </button>
            
            <button 
              (click)="shareOnLinkedIn()"
              class="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>
        </div>
      </article>

      <!-- Related Posts -->
      <section class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-12 text-center">Related Articles</h2>
          
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
                  <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    {{ post.category.name }}
                  </span>
                  <span class="text-gray-500 text-sm">{{ post.readTime }} min</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{{ post.title }}</h3>
                <p class="text-gray-600 mb-4 line-clamp-3">{{ post.excerpt }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <img 
                      [src]="post.author.avatar || '/assets/images/default-avatar.jpg'" 
                      [alt]="post.author.name"
                      class="w-8 h-8 rounded-full object-cover"
                    >
                    <span class="text-sm text-gray-700">{{ post.author.name }}</span>
                  </div>
                  <span class="text-sm text-gray-500">{{ post.publishedAt | date:'MMM dd' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Signup -->
      <section class="bg-gradient-to-r from-green-600 to-green-700 py-16">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p class="text-green-100 mb-8 text-lg">
            Get the latest solar energy insights and tips delivered to your inbox.
          </p>
          <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              class="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-green-300 focus:outline-none"
            >
            <button 
              type="submit"
              class="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  `,
  styles: [`
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
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  blogPost: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  postId: string | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.postId = params.get('id');
      if (this.postId) {
        this.loadBlogPost(this.postId);
        this.loadRelatedPosts(this.postId);
        // Scroll to top when navigating to a new blog post
        window.scrollTo(0, 0);
      }
    });
  }

  private loadBlogPost(id: string) {
    // Mock data for demonstration - replace with actual service call
    this.blogPost = {
      id: id,
      title: 'Complete Guide to Solar Panel Installation: Everything You Need to Know',
      slug: 'complete-guide-solar-panel-installation',
      excerpt: 'Discover the comprehensive process of solar panel installation, from initial assessment to final connection. Learn about costs, permits, and what to expect during your solar journey.',
      content: `
        <h2>Introduction to Solar Panel Installation</h2>
        <p>Solar panel installation is a significant investment that can provide decades of clean energy and substantial savings on your electricity bills. This comprehensive guide will walk you through every step of the process, helping you understand what to expect and how to prepare for your solar installation.</p>
        
        <h2>Pre-Installation Assessment</h2>
        <p>Before any installation begins, a thorough assessment of your property is essential. This includes:</p>
        <ul>
          <li>Roof condition and structural integrity evaluation</li>
          <li>Shading analysis to determine optimal panel placement</li>
          <li>Electrical system assessment</li>
          <li>Energy consumption analysis</li>
        </ul>
        
        <h2>Permits and Documentation</h2>
        <p>Solar installations require various permits and approvals. Your installer will typically handle:</p>
        <ul>
          <li>Building permits from local authorities</li>
          <li>Electrical permits</li>
          <li>Utility interconnection agreements</li>
          <li>HOA approvals if applicable</li>
        </ul>
        
        <h2>Installation Process</h2>
        <p>The actual installation typically takes 1-3 days and involves several key steps:</p>
        
        <h3>Day 1: Preparation and Mounting</h3>
        <p>The installation team will begin by preparing your roof and installing the mounting system. This involves:</p>
        <ul>
          <li>Marking optimal panel locations</li>
          <li>Installing roof attachments and rails</li>
          <li>Ensuring proper waterproofing</li>
        </ul>
        
        <h3>Day 2: Panel Installation and Wiring</h3>
        <p>Solar panels are carefully positioned and secured to the mounting system. The electrical work includes:</p>
        <ul>
          <li>Connecting panels in series or parallel configurations</li>
          <li>Running DC wiring to the inverter location</li>
          <li>Installing the inverter and monitoring system</li>
        </ul>
        
        <h3>Day 3: Final Connections and Testing</h3>
        <p>The final day involves completing all electrical connections and testing the system:</p>
        <ul>
          <li>Connecting the inverter to your electrical panel</li>
          <li>Installing the production meter</li>
          <li>System testing and commissioning</li>
        </ul>
        
        <h2>Post-Installation Steps</h2>
        <p>After installation is complete, several important steps remain:</p>
        <ul>
          <li>Local inspection and approval</li>
          <li>Utility interconnection and net metering setup</li>
          <li>System monitoring activation</li>
          <li>Performance verification</li>
        </ul>
        
        <h2>Maintenance and Monitoring</h2>
        <p>Solar panels require minimal maintenance, but regular monitoring ensures optimal performance:</p>
        <ul>
          <li>Monthly production monitoring</li>
          <li>Annual professional inspections</li>
          <li>Occasional cleaning if needed</li>
          <li>Inverter maintenance as recommended</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Solar panel installation is a straightforward process when handled by experienced professionals. By understanding each step, you can better prepare for your installation and ensure a smooth transition to clean, renewable energy.</p>
      `,
      htmlContent: '',
      imageUrl: '/assets/images/solar-installation-guide.jpg',
      author: {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@solarshop.com',
        avatar: '/assets/images/author-sarah.jpg',
        title: 'Solar Installation Expert',
        isActive: true
      },
      publishedAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      readTime: 8,
      category: {
        id: '1',
        name: 'Installation Guide',
        slug: 'installation-guide',
        postCount: 12,
        isActive: true,
        order: 1
      },
      tags: [
        { id: '1', name: 'Solar Panels', slug: 'solar-panels', postCount: 25, isActive: true },
        { id: '2', name: 'Installation', slug: 'installation', postCount: 18, isActive: true },
        { id: '3', name: 'Guide', slug: 'guide', postCount: 15, isActive: true }
      ],
      status: 'published',
      featured: true,
      viewCount: 1250,
      likeCount: 89,
      commentCount: 23,
      seoMetadata: {
        title: 'Complete Guide to Solar Panel Installation | Solar Shop',
        description: 'Learn everything about solar panel installation process, costs, permits, and what to expect during your solar journey.',
        keywords: ['solar panel installation', 'solar guide', 'renewable energy', 'solar process']
      },
      socialSharing: {
        enabled: true,
        platforms: ['facebook', 'twitter', 'linkedin', 'email']
      }
    };
  }

  private loadRelatedPosts(currentPostId: string) {
    // Mock related posts - replace with actual service call
    this.relatedPosts = [
      {
        id: '2',
        title: 'Solar Panel Maintenance: Best Practices for Optimal Performance',
        slug: 'solar-panel-maintenance-best-practices',
        excerpt: 'Learn how to maintain your solar panels for maximum efficiency and longevity.',
        content: '',
        imageUrl: '/assets/images/solar-maintenance.jpg',
        author: {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@solarshop.com',
          avatar: '/assets/images/author-mike.jpg',
          isActive: true
        },
        publishedAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z',
        readTime: 6,
        category: {
          id: '2',
          name: 'Maintenance',
          slug: 'maintenance',
          postCount: 8,
          isActive: true,
          order: 2
        },
        tags: [],
        status: 'published',
        featured: false,
        viewCount: 890,
        likeCount: 45,
        commentCount: 12,
        seoMetadata: {
          title: 'Solar Panel Maintenance Guide',
          description: 'Best practices for solar panel maintenance',
          keywords: ['solar maintenance', 'solar care']
        },
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin']
        }
      },
      {
        id: '3',
        title: 'Understanding Solar Incentives and Tax Credits in 2024',
        slug: 'solar-incentives-tax-credits-2024',
        excerpt: 'Maximize your savings with federal and state solar incentives available this year.',
        content: '',
        imageUrl: '/assets/images/solar-incentives.jpg',
        author: {
          id: '3',
          name: 'Lisa Rodriguez',
          email: 'lisa@solarshop.com',
          avatar: '/assets/images/author-lisa.jpg',
          isActive: true
        },
        publishedAt: '2024-01-05T09:15:00Z',
        updatedAt: '2024-01-05T09:15:00Z',
        readTime: 7,
        category: {
          id: '3',
          name: 'Financial Benefits',
          slug: 'financial-benefits',
          postCount: 10,
          isActive: true,
          order: 3
        },
        tags: [],
        status: 'published',
        featured: true,
        viewCount: 1450,
        likeCount: 78,
        commentCount: 34,
        seoMetadata: {
          title: 'Solar Incentives and Tax Credits 2024',
          description: 'Complete guide to solar incentives and tax credits',
          keywords: ['solar incentives', 'tax credits', 'solar savings']
        },
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin', 'email']
        }
      }
    ];
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