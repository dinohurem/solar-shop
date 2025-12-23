import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImageUrl?: string;
    categoryId?: string;
    categoryName?: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    publishedAt?: string;
    readingTime?: number;
    viewCount: number;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface BlogFilters {
    featured?: boolean;
    categoryId?: string;
    status?: 'draft' | 'published' | 'archived';
    tags?: string[];
    limit?: number;
    offset?: number;
}

@Injectable({
    providedIn: 'root'
})
export class BlogService {

    constructor(private supabaseService: SupabaseService) { }

    getBlogPosts(filters?: BlogFilters): Observable<BlogPost[]> {
        return from(this.fetchBlogPostsFromSupabase(filters)).pipe(
            catchError(error => {
                console.error('Error fetching blog posts:', error);
                return of([]);
            })
        );
    }

    getPublishedPosts(limit?: number): Observable<BlogPost[]> {
        return from(this.fetchPublishedPosts(limit)).pipe(
            catchError(error => {
                console.error('Error fetching published posts:', error);
                return of([]);
            })
        );
    }

    getFeaturedPosts(limit?: number): Observable<BlogPost[]> {
        return from(this.fetchFeaturedPosts(limit)).pipe(
            catchError(error => {
                console.error('Error fetching featured posts:', error);
                return of([]);
            })
        );
    }

    getBlogPostById(id: string): Observable<BlogPost | null> {
        return from(this.fetchBlogPostById(id)).pipe(
            catchError(error => {
                console.error('Error fetching blog post:', error);
                return of(null);
            })
        );
    }

    getBlogPostBySlug(slug: string): Observable<BlogPost | null> {
        return from(this.fetchBlogPostBySlug(slug)).pipe(
            catchError(error => {
                console.error('Error fetching blog post by slug:', error);
                return of(null);
            })
        );
    }

    getPostsByCategory(categoryId: string, limit?: number): Observable<BlogPost[]> {
        return from(this.fetchPostsByCategory(categoryId, limit)).pipe(
            catchError(error => {
                console.error('Error fetching posts by category:', error);
                return of([]);
            })
        );
    }

    getPostsByTag(tag: string, limit?: number): Observable<BlogPost[]> {
        return from(this.fetchPostsByTag(tag, limit)).pipe(
            catchError(error => {
                console.error('Error fetching posts by tag:', error);
                return of([]);
            })
        );
    }

    searchPosts(query: string, limit?: number): Observable<BlogPost[]> {
        return from(this.searchPostsInSupabase(query, limit)).pipe(
            catchError(error => {
                console.error('Error searching posts:', error);
                return of([]);
            })
        );
    }

    private async fetchBlogPostsFromSupabase(filters?: BlogFilters): Promise<BlogPost[]> {
        try {
            const supabaseFilters: any = {
                featured: filters?.featured,
                categoryId: filters?.categoryId,
                limit: filters?.limit,
                offset: filters?.offset
            };

            const posts = await this.supabaseService.getBlogPosts(supabaseFilters);
            return this.convertSupabasePostsToLocal(posts);
        } catch (error) {
            console.error('Error in fetchBlogPostsFromSupabase:', error);
            return [];
        }
    }

    private async fetchPublishedPosts(limit?: number): Promise<BlogPost[]> {
        try {
            const posts = await this.supabaseService.getBlogPosts({ limit });
            return this.convertSupabasePostsToLocal(posts);
        } catch (error) {
            console.error('Error in fetchPublishedPosts:', error);
            return [];
        }
    }

    private async fetchFeaturedPosts(limit?: number): Promise<BlogPost[]> {
        try {
            const posts = await this.supabaseService.getBlogPosts({
                featured: true,
                limit
            });
            return this.convertSupabasePostsToLocal(posts);
        } catch (error) {
            console.error('Error in fetchFeaturedPosts:', error);
            return [];
        }
    }

    private async fetchBlogPostById(id: string): Promise<BlogPost | null> {
        try {
            const post = await this.supabaseService.getTableById('blog_posts', id);
            if (!post) return null;

            return this.convertSupabasePostToLocal(post);
        } catch (error) {
            console.error('Error in fetchBlogPostById:', error);
            return null;
        }
    }

    private async fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
        try {
            const posts = await this.supabaseService.getBlogPosts();
            const post = posts.find(p => p.slug === slug);

            if (!post) return null;

            return this.convertSupabasePostToLocal(post);
        } catch (error) {
            console.error('Error in fetchBlogPostBySlug:', error);
            return null;
        }
    }

    private async fetchPostsByCategory(categoryId: string, limit?: number): Promise<BlogPost[]> {
        try {
            const posts = await this.supabaseService.getBlogPosts({
                categoryId,
                limit
            });
            return this.convertSupabasePostsToLocal(posts);
        } catch (error) {
            console.error('Error in fetchPostsByCategory:', error);
            return [];
        }
    }

    private async fetchPostsByTag(tag: string, limit?: number): Promise<BlogPost[]> {
        try {
            const posts = await this.supabaseService.getBlogPosts({ limit });
            // Filter by tag on the client side since Supabase doesn't support array filtering in this method
            const filteredPosts = posts.filter(post =>
                post.tags && post.tags.includes(tag)
            );
            return this.convertSupabasePostsToLocal(filteredPosts);
        } catch (error) {
            console.error('Error in fetchPostsByTag:', error);
            return [];
        }
    }

    private async searchPostsInSupabase(query: string, limit?: number): Promise<BlogPost[]> {
        try {
            const posts = await this.supabaseService.getBlogPosts({ limit });
            // Filter by search query on the client side
            const filteredPosts = posts.filter(post =>
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.content.toLowerCase().includes(query.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(query.toLowerCase())
            );
            return this.convertSupabasePostsToLocal(filteredPosts);
        } catch (error) {
            console.error('Error in searchPostsInSupabase:', error);
            return [];
        }
    }

    private convertSupabasePostsToLocal(posts: any[]): BlogPost[] {
        return posts.map(post => this.convertSupabasePostToLocal(post)).filter(Boolean) as BlogPost[];
    }

    private convertSupabasePostToLocal(post: any): BlogPost | null {
        try {
            return {
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt,
                featuredImageUrl: post.featured_image_url || this.getDefaultPostImage(),
                categoryId: post.category_id,
                categoryName: post.categories?.name || undefined,
                tags: post.tags || [],
                status: post.status,
                publishedAt: post.published_at,
                readingTime: post.reading_time,
                viewCount: post.view_count || 0,
                isFeatured: post.is_featured || false,
                createdAt: new Date(post.created_at),
                updatedAt: new Date(post.updated_at)
            };
        } catch (error) {
            console.error('Error converting blog post:', error);
            return null;
        }
    }

    private getDefaultPostImage(): string {
        const defaultImages = [
            'assets/images/placeholders/solar-panels-1.jpg',
            'assets/images/placeholders/solar-panels-2.jpg',
            'assets/images/placeholders/solar-panels-3.jpg',
            'assets/images/placeholders/solar-panels-4.jpg',
            'assets/images/placeholders/solar-panels-5.jpg'
        ];

        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }
} 