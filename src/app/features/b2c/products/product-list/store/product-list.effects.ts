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

    loadAllManufacturers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductListActions.loadAllManufacturers),
            switchMap(() =>
                this.productListService.getAllManufacturers().pipe(
                    map(manufacturers => ProductListActions.loadAllManufacturersSuccess({ manufacturers })),
                    catchError((error: any) => of(ProductListActions.loadAllManufacturersFailure({ error: error.message || 'Failed to load manufacturers' })))
                )
            )
        )
    );

    loadCategoryCounts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductListActions.loadCategoryCounts),
            switchMap(({ filters }) =>
                this.productListService.getCategoryCounts(filters).pipe(
                    map(categoryCounts => ProductListActions.loadCategoryCountsSuccess({ categoryCounts })),
                    catchError((error: any) => of(ProductListActions.loadCategoryCountsFailure({ error: error.message || 'Failed to load category counts' })))
                )
            )
        )
    );

    loadManufacturerCounts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductListActions.loadManufacturerCounts),
            switchMap(({ filters }) =>
                this.productListService.getManufacturerCounts(filters).pipe(
                    map(manufacturerCounts => ProductListActions.loadManufacturerCountsSuccess({ manufacturerCounts })),
                    catchError((error: any) => of(ProductListActions.loadManufacturerCountsFailure({ error: error.message || 'Failed to load manufacturer counts' })))
                )
            )
        )
    );
} 