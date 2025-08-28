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
            return '/assets/images/product-placeholder.svg';
        }

        // Find primary image first
        const primaryImage = images.find(img => img.is_primary);
        if (primaryImage) {
            return primaryImage.url;
        }

        // Fallback to first image
        const firstImage = images[0];
        return firstImage?.url || '/assets/images/product-placeholder.svg';
    }

    loadProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadProducts),
            switchMap(({ query }) =>
                from(this.loadProductsWithPagination(query || {})).pipe(
                    map((response) => {
                        return ProductsActions.loadProductsSuccess({ response });
                    }),
                    catchError((error: any) =>
                        of(ProductsActions.loadProductsFailure({ error: error.message || 'Failed to load products' }))
                    )
                )
            )
        )
    );

    private async loadProductsWithPagination(query: ProductsActions.ProductsQuery): Promise<ProductsActions.ProductsResponse> {
        const page = query.page || 1;
        const itemsPerPage = query.itemsPerPage || 10;
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        // Build the query - simpler approach using direct category_id
        let supabaseQuery = this.supabaseService.client
            .from('products')
            .select(`
                *,
                categories!inner(id, name, slug)
            `, { count: 'exact' })
            .eq('is_active', true);

        // Apply filters
        if (query.searchQuery && query.searchQuery.trim()) {
            const searchTerm = `%${query.searchQuery.trim()}%`;
            supabaseQuery = supabaseQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm}`);
        }

        if (query.categories && query.categories.length > 0) {
            // First, get the category IDs from category names
            const { data: categoryData } = await this.supabaseService.client
                .from('categories')
                .select('id, name')
                .in('name', query.categories);

            if (categoryData && categoryData.length > 0) {
                const categoryIds = categoryData.map(cat => cat.id);
                supabaseQuery = supabaseQuery.in('category_id', categoryIds);
            }
        }

        if (query.availability && query.availability !== '') {
            switch (query.availability) {
                case 'in-stock':
                    supabaseQuery = supabaseQuery.eq('stock_status', 'in_stock');
                    break;
                case 'partner-only':
                    // TODO: implement partner-only filter when the field is available
                    break;
            }
        }

        // Apply sorting
        if (query.sortBy) {
            switch (query.sortBy) {
                case 'name':
                    supabaseQuery = supabaseQuery.order('name', { ascending: true });
                    break;
                case 'price-low':
                    supabaseQuery = supabaseQuery.order('price', { ascending: true });
                    break;
                case 'price-high':
                    supabaseQuery = supabaseQuery.order('price', { ascending: false });
                    break;
                default:
                    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
                    break;
            }
        } else {
            supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        }

        // Apply pagination
        supabaseQuery = supabaseQuery.range(from, to);

        const { data, error, count } = await supabaseQuery;

        if (error) {
            throw error;
        }

        // Transform the data to include category name and extract primary image
        const transformedProducts = (data || []).map(product => {
            // Use simple single category from joined categories table
            const categoryName = product.categories?.name || 'Uncategorized';
            const categoriesArray: Array<{ name: string; isPrimary: boolean }> = [{
                name: categoryName,
                isPrimary: true
            }];

            return {
                ...product,
                category: categoryName, // Legacy single category
                categories: categoriesArray, // New multi-category array
                image_url: this.getPrimaryImageUrl(product.images),
                in_stock: product.stock_status === 'in_stock',
                partner_only: false, // TODO: implement partner-only logic
                minimum_order: product.minimum_order || 1
            };
        });

        const totalItems = count || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        return {
            products: transformedProducts,
            totalItems,
            totalPages,
            currentPage: page
        };
    }

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
                        
                        // Map the data to include all fields, with backward compatibility
                        const mappedPricing = (data || []).map((item: any) => ({
                            id: item.id,
                            company_id: item.company_id,
                            product_id: item.product_id,
                            price: item.price || item.price_tier_1, // Backward compatibility
                            minimum_order: item.minimum_order || 1,
                            quantity_tier_1: item.quantity_tier_1 || 1,
                            price_tier_1: item.price_tier_1 || item.price,
                            quantity_tier_2: item.quantity_tier_2,
                            price_tier_2: item.price_tier_2,
                            quantity_tier_3: item.quantity_tier_3,
                            price_tier_3: item.price_tier_3,
                            created_at: item.created_at,
                            updated_at: item.updated_at
                        }));
                        
                        return ProductsActions.loadCompanyPricingSuccess({ pricing: mappedPricing });
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