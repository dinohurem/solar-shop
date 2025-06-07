import { Injectable } from '@angular/core';
import { BlogPost, BlogCategory, BlogTag } from '../shared/models/blog.model';

export interface SupabaseBlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image_url?: string;
    category_id?: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    published_at?: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords: string[];
    reading_time?: number;
    view_count: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    categories?: {
        name: string;
        slug: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class BlogDataMapperService {

    mapSupabaseToBlogPost(supabasePost: SupabaseBlogPost): BlogPost {
        return {
            id: supabasePost.id,
            title: supabasePost.title,
            slug: supabasePost.slug,
            excerpt: supabasePost.excerpt,
            content: supabasePost.content,
            htmlContent: supabasePost.content,
            imageUrl: supabasePost.featured_image_url || '/assets/images/blog-placeholder.jpg',
            publishedAt: supabasePost.published_at || supabasePost.created_at,
            updatedAt: supabasePost.updated_at,
            readTime: supabasePost.reading_time || this.calculateReadTime(supabasePost.content),
            category: this.mapSupabaseToCategory(supabasePost),
            tags: this.mapSupabaseToTags(supabasePost.tags),
            status: supabasePost.status,
            featured: supabasePost.is_featured,
            viewCount: supabasePost.view_count,
            likeCount: 0, // Default as we don't have this in Supabase yet
            commentCount: 0, // Default as we don't have this in Supabase yet
            seoMetadata: {
                title: supabasePost.seo_title || supabasePost.title,
                description: supabasePost.seo_description || supabasePost.excerpt,
                keywords: supabasePost.seo_keywords || []
            },
            socialSharing: {
                enabled: true,
                platforms: ['facebook', 'twitter', 'linkedin', 'email']
            }
        };
    }

    mapSupabaseToBlogPosts(supabasePosts: SupabaseBlogPost[]): BlogPost[] {
        return supabasePosts.map(post => this.mapSupabaseToBlogPost(post));
    }

    private mapSupabaseToCategory(supabasePost: SupabaseBlogPost): BlogCategory {
        const category = supabasePost.categories;
        return {
            id: supabasePost.category_id || '',
            name: category?.name || 'Uncategorized',
            slug: category?.slug || 'uncategorized',
            postCount: 0,
            isActive: true,
            order: 0
        };
    }

    private mapSupabaseToTags(tags: string[]): BlogTag[] {
        if (!tags || !Array.isArray(tags)) return [];

        return tags.map((tag, index) => ({
            id: `tag-${index}`,
            name: tag,
            slug: tag.toLowerCase().replace(/\s+/g, '-'),
            postCount: 0,
            isActive: true
        }));
    }

    private calculateReadTime(content: string): number {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
} 