import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ProductsActions } from './products.actions';
import { CategoriesService } from '../services/categories.service';

@Injectable()
export class ProductsEffects {
    private actions$ = inject(Actions);
    private categoriesService = inject(CategoriesService);

    loadProductCategories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadProductCategories),
            switchMap(() =>
                this.categoriesService.getActiveCategories().pipe(
                    map(categories => ProductsActions.loadProductCategoriesSuccess({ categories })),
                    catchError((error: any) => of(ProductsActions.loadProductCategoriesFailure({
                        error: error.message || 'Failed to load categories'
                    })))
                )
            )
        )
    );
} 