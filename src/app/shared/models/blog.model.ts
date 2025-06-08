export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    htmlContent?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    publishedAt: string;
    updatedAt: string;
    readTime: number;
    category: BlogCategory;
    tags: BlogTag[];
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    seoMetadata: SeoMetadata;
    relatedPosts?: string[];
    tableOfContents?: TableOfContentsItem[];
    socialSharing: SocialSharingConfig;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    parentId?: string;
    postCount: number;
    isActive: boolean;
    order: number;
}

export interface BlogTag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    postCount: number;
    isActive: boolean;
}

export interface TableOfContentsItem {
    id: string;
    title: string;
    level: number;
    anchor: string;
    children?: TableOfContentsItem[];
}

export interface SocialSharingConfig {
    enabled: boolean;
    platforms: string[];
    customMessage?: string;
}

export interface SocialLinks {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    website?: string;
}

export interface BlogComment {
    id: string;
    postId: string;
    parentId?: string;
    author: CommentAuthor;
    content: string;
    htmlContent?: string;
    createdAt: string;
    updatedAt?: string;
    status: 'pending' | 'approved' | 'rejected' | 'spam';
    likeCount: number;
    replies?: BlogComment[];
    isEdited: boolean;
}

export interface CommentAuthor {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
    website?: string;
    isRegistered: boolean;
}

export interface BlogFilter {
    categories?: string[];
    tags?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
    status?: string[];
    featured?: boolean;
    search?: string;
    sortBy?: 'publishedAt' | 'updatedAt' | 'title' | 'viewCount' | 'likeCount';
    sortOrder?: 'asc' | 'desc';
}

export interface BlogSearchResult {
    posts: BlogPost[];
    total: number;
    page: number;
    limit: number;
    filters: BlogFilter;
    facets: BlogFacets;
}

export interface BlogFacets {
    categories: FacetItem[];
    tags: FacetItem[];
    years: FacetItem[];
    months: FacetItem[];
}

export interface FacetItem {
    value: string;
    label: string;
    count: number;
    selected: boolean;
}

export interface BlogStats {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalComments: number;
    totalCategories: number;
    totalTags: number;
    popularPosts: BlogPost[];
    recentPosts: BlogPost[];
    topCategories: BlogCategory[];
    topTags: BlogTag[];
}



export interface SeoMetadata {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
} 