import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BlogState } from './blog.state';

export const selectBlogState = createFeatureSelector<BlogState>('blog');

export const selectBlogPosts = createSelector(
    selectBlogState,
    (state: BlogState) => state.posts
);

export const selectBlogIsLoading = createSelector(
    selectBlogState,
    (state: BlogState) => state.isLoading
);

export const selectBlogError = createSelector(
    selectBlogState,
    (state: BlogState) => state.error
);

export const selectSelectedPostId = createSelector(
    selectBlogState,
    (state: BlogState) => state.selectedPostId
);

export const selectSelectedPost = createSelector(
    selectBlogState,
    (state: BlogState) => state.posts.find(post => post.id === state.selectedPostId)
);

export const selectFilteredCategory = createSelector(
    selectBlogState,
    (state: BlogState) => state.filteredCategory
);

export const selectSearchQuery = createSelector(
    selectBlogState,
    (state: BlogState) => state.searchQuery
);

export const selectFilteredPosts = createSelector(
    selectBlogPosts,
    selectFilteredCategory,
    selectSearchQuery,
    (posts, filteredCategory, searchQuery) => {
        console.log('selectFilteredPosts called with:', { posts: posts.length, filteredCategory, searchQuery });
        let filteredPosts = posts;

        // Filter by category
        if (filteredCategory) {
            console.log('Filtering by category:', filteredCategory);
            filteredPosts = filteredPosts.filter(post =>
                post.category.id === filteredCategory
            );
            console.log('Filtered posts count:', filteredPosts.length);
        } else {
            console.log('No category filter applied, showing all posts');
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.name.toLowerCase().includes(query))
            );
        }

        // Sort by updatedAt (most recently updated first), fallback to publishedAt
        const sortedPosts = [...filteredPosts].sort((a, b) => {
            const aDate = new Date(a.updatedAt || a.publishedAt).getTime();
            const bDate = new Date(b.updatedAt || b.publishedAt).getTime();
            return bDate - aDate;
        });

        console.log('Final filtered posts count:', sortedPosts.length);
        return sortedPosts;
    }
);

export const selectFeaturedPosts = createSelector(
    selectBlogPosts,
    (posts) => posts.filter(post => post.featured)
);

export const selectPostCategories = createSelector(
    selectBlogPosts,
    (posts) => {
        const categories = posts.map(post => post.category);
        // Remove duplicates based on category id
        const uniqueCategories = categories.filter((category, index, self) =>
            index === self.findIndex(c => c.id === category.id)
        );
        return uniqueCategories;
    }
); 