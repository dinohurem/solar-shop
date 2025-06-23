import { createReducer, on } from '@ngrx/store';
import { BlogActions } from './blog.actions';
import { BlogState, initialBlogState } from './blog.state';

export const blogReducer = createReducer(
    initialBlogState,
    on(BlogActions.loadBlogPosts, (state) => ({
        ...state,
        isLoading: true,
        error: null,
    })),
    on(BlogActions.loadBlogPostsSuccess, (state, { posts }) => ({
        ...state,
        posts,
        isLoading: false,
        error: null,
    })),
    on(BlogActions.loadBlogPostsFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error,
    })),
    on(BlogActions.selectPost, (state, { postId }) => ({
        ...state,
        selectedPostId: postId,
    })),
    on(BlogActions.filterByCategory, (state, { category }) => ({
        ...state,
        filteredCategory: category,
    })),
    on(BlogActions.searchPosts, (state, { query }) => ({
        ...state,
        searchQuery: query,
    }))
); 