import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, from } from 'rxjs';
import { BlogActions } from './blog.actions';
import { BlogService } from '../services/blog.service';
import { BlogDataMapperService } from '../../../../services/blog-data-mapper.service';
import { SupabaseService } from '../../../../services/supabase.service';

@Injectable()
export class BlogEffects {
    private actions$ = inject(Actions);
    private blogService = inject(BlogService);
    private blogMapper = inject(BlogDataMapperService);
    private supabaseService = inject(SupabaseService);

    loadBlogPosts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BlogActions.loadBlogPosts),
            mergeMap(() =>
                from(this.supabaseService.getBlogPosts()).pipe(
                    map(supabasePosts => {
                        // Map Supabase posts to our BlogPost format
                        const blogPosts = this.blogMapper.mapSupabaseToBlogPosts(supabasePosts as any[]);
                        return BlogActions.loadBlogPostsSuccess({ posts: blogPosts });
                    }),
                    catchError(error => {
                        console.error('Error loading blog posts:', error);
                        return of(BlogActions.loadBlogPostsFailure({
                            error: error.message || 'Failed to load blog posts'
                        }));
                    })
                )
            )
        )
    );
} 