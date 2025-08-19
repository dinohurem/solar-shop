import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ProductListActions } from './product-list.actions';
import { ProductListService } from '../services/product-list.service';

@Injectable()
export class ProductListEffects {
    private actions$ = inject(Actions);
    private productListService = inject(ProductListService);

    loadProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductListActions.loadProducts),
            switchMap(({ query }) =>
                this.productListService.getProductsWithPagination(query || {}).pipe(
                    map(response => ProductListActions.loadProductsSuccess({ response })),
                    catchError((error: any) => of(ProductListActions.loadProductsFailure({ error: error.message || 'Failed to load products' })))
                )
            )
        )
    );
} 