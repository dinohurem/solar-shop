import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import * as ProductsActions from './products.actions';

@Injectable()
export class ProductsEffects {

    constructor(
        private actions$: Actions,
        private supabaseService: SupabaseService
    ) { }

    private getPrimaryImageUrl(images: any[]): string {
        if (!images || !Array.isArray(images) || images.length === 0) {
            return '/assets/images/product-placeholder.jpg';
        }

        // Find primary image first
        const primaryImage = images.find(img => img.is_primary);
        if (primaryImage) {
            return primaryImage.url;
        }

        // Fallback to first image
        const firstImage = images[0];
        return firstImage?.url || '/assets/images/product-placeholder.jpg';
    }

    loadProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadProducts),
            switchMap(() =>
                from(
                    this.supabaseService.client
                        .from('products')
                        .select(`
                            *,
                            categories!inner(name, slug)
                        `)
                        .eq('is_active', true)
                ).pipe(
                    map(({ data, error }) => {
                        if (error) {
                            return ProductsActions.loadProductsFailure({ error: error.message });
                        }

                        // Transform the data to include category name and extract primary image
                        const transformedProducts = (data || []).map(product => ({
                            ...product,
                            category: product.categories?.name || 'Uncategorized',
                            image_url: this.getPrimaryImageUrl(product.images),
                            in_stock: product.stock_status === 'in_stock',
                            partner_only: false, // TODO: implement partner-only logic
                            minimum_order: product.minimum_order || 1
                        }));

                        return ProductsActions.loadProductsSuccess({ products: transformedProducts });
                    }),
                    catchError((error: any) =>
                        of(ProductsActions.loadProductsFailure({ error: error.message || 'Failed to load products' }))
                    )
                )
            )
        )
    );

    loadCompanyPricing$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadCompanyPricing),
            switchMap(({ companyId }) =>
                from(
                    this.supabaseService.client
                        .from('company_pricing')
                        .select('*')
                        .eq('company_id', companyId)
                ).pipe(
                    map(({ data, error }) => {
                        if (error) {
                            return ProductsActions.loadCompanyPricingFailure({ error: error.message });
                        }
                        return ProductsActions.loadCompanyPricingSuccess({ pricing: data || [] });
                    }),
                    catchError((error: any) =>
                        of(ProductsActions.loadCompanyPricingFailure({ error: error.message || 'Failed to load company pricing' }))
                    )
                )
            )
        )
    );

    loadProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadProduct),
            switchMap(({ productId }) =>
                from(
                    this.supabaseService.client
                        .from('products')
                        .select('*')
                        .eq('id', productId)
                        .eq('is_active', true)
                        .single()
                ).pipe(
                    map(({ data, error }) => {
                        if (error) {
                            return ProductsActions.loadProductFailure({ error: error.message });
                        }
                        return ProductsActions.loadProductSuccess({ product: data });
                    }),
                    catchError((error: any) =>
                        of(ProductsActions.loadProductFailure({ error: error.message || 'Failed to load product' }))
                    )
                )
            )
        )
    );

    loadCategories$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadCategories),
            switchMap(() =>
                from(
                    this.supabaseService.client
                        .from('categories')
                        .select('*')
                        .eq('is_active', true)
                        .order('sort_order', { ascending: true })
                ).pipe(
                    map(({ data, error }) => {
                        if (error) {
                            return ProductsActions.loadCategoriesFailure({ error: error.message });
                        }
                        return ProductsActions.loadCategoriesSuccess({ categories: data || [] });
                    }),
                    catchError((error: any) =>
                        of(ProductsActions.loadCategoriesFailure({ error: error.message || 'Failed to load categories' }))
                    )
                )
            )
        )
    );
} 