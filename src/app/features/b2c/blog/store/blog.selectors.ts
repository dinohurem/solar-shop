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
        let filteredPosts = posts;

        // Filter by category
        if (filteredCategory) {
            filteredPosts = filteredPosts.filter(post =>
                post.category.id === filteredCategory
            );
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

        return filteredPosts;
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