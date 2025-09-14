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
            console.log('🔍 B2B Filtering by categories:', query.categories);
            
            // First, get the category IDs from category names
            const { data: categoryData } = await this.supabaseService.client
                .from('categories')
                .select('id, name')
                .in('name', query.categories);

            console.log('📋 B2B Found category data:', categoryData);

            if (categoryData && categoryData.length > 0) {
                const categoryIds = categoryData.map(cat => cat.id);
                console.log('🏷️ B2B Category IDs:', categoryIds);
                
                // Handle both legacy category_id and product_categories table
                const { data: productCategoryIds } = await this.supabaseService.client
                    .from('product_categories')
                    .select('product_id')
                    .in('category_id', categoryIds);
                
                console.log('🔗 B2B Product-category junction data:', productCategoryIds);
                
                const productIdsFromJunction = (productCategoryIds || []).map(pc => pc.product_id);
                console.log('📦 B2B Product IDs from junction table:', productIdsFromJunction);
                
                if (productIdsFromJunction.length > 0) {
                    // Filter by either category_id OR product ID exists in junction table
                    const filterQuery = `category_id.in.(${categoryIds.join(',')}),id.in.(${productIdsFromJunction.join(',')})`;
                    console.log('🎯 B2B Applying OR filter:', filterQuery);
                    supabaseQuery = supabaseQuery.or(filterQuery);
                } else {
                    // Fallback to just legacy category_id
                    console.log('📝 B2B Applying legacy category_id filter:', categoryIds);
                    supabaseQuery = supabaseQuery.in('category_id', categoryIds);
                }
            } else {
                console.log('⚠️ B2B No matching categories found for:', query.categories);
            }
        }

        if (query.manufacturers && query.manufacturers.length > 0) {
            supabaseQuery = supabaseQuery.in('brand', query.manufacturers);
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

    loadAllManufacturers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadAllManufacturers),
            switchMap(() =>
                from(this.fetchAllManufacturers()).pipe(
                    map(manufacturers => ProductsActions.loadAllManufacturersSuccess({ manufacturers })),
                    catchError((error: any) => of(ProductsActions.loadAllManufacturersFailure({ error: error.message || 'Failed to load manufacturers' })))
                )
            )
        )
    );

    loadCategoryCounts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadCategoryCounts),
            switchMap(({ filters }) =>
                from(this.fetchCategoryCounts(filters)).pipe(
                    map(categoryCounts => ProductsActions.loadCategoryCountsSuccess({ categoryCounts })),
                    catchError((error: any) => of(ProductsActions.loadCategoryCountsFailure({ error: error.message || 'Failed to load category counts' })))
                )
            )
        )
    );

    loadManufacturerCounts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductsActions.loadManufacturerCounts),
            switchMap(({ filters }) =>
                from(this.fetchManufacturerCounts(filters)).pipe(
                    map(manufacturerCounts => ProductsActions.loadManufacturerCountsSuccess({ manufacturerCounts })),
                    catchError((error: any) => of(ProductsActions.loadManufacturerCountsFailure({ error: error.message || 'Failed to load manufacturer counts' })))
                )
            )
        )
    );

    private async fetchAllManufacturers(): Promise<string[]> {
        const { data, error } = await this.supabaseService.client
            .from('products')
            .select('brand')
            .eq('is_active', true)
            .not('brand', 'is', null);

        if (error) {
            throw error;
        }

        const uniqueManufacturers = [...new Set((data || []).map(product => product.brand).filter(Boolean))];
        return uniqueManufacturers.sort();
    }

    private async fetchCategoryCounts(filters?: ProductsActions.CategoryCountFilters): Promise<{ [categoryName: string]: number }> {
        // First get all categories with hierarchy information to initialize with 0 counts
        const { data: allCategories, error: categoriesError } = await this.supabaseService.client
            .from('categories')
            .select('id, name, parent_id')
            .eq('is_active', true);

        if (categoriesError) {
            throw categoriesError;
        }

        // Initialize all categories with 0 count and build hierarchy
        const allCategoryCounts: { [categoryName: string]: number } = {};
        const categoryHierarchy: { [categoryId: string]: { name: string; parentId?: string; children: string[] } } = {};
        
        (allCategories || []).forEach(category => {
            allCategoryCounts[category.name] = 0;
            categoryHierarchy[category.id] = {
                name: category.name,
                parentId: category.parent_id,
                children: []
            };
        });

        // Build parent-child relationships
        (allCategories || []).forEach(category => {
            if (category.parent_id && categoryHierarchy[category.parent_id]) {
                categoryHierarchy[category.parent_id].children.push(category.id);
            }
        });

        // Build query for actual counts - get full product data with category info
        let query = this.supabaseService.client
            .from('products')
            .select(`
                id,
                name,
                description,
                sku,
                brand,
                stock_status,
                category_id,
                categories!inner(id, name),
                product_categories!left(category_id)
            `)
            .eq('is_active', true);

        // Apply filters
        if (filters?.searchQuery && filters.searchQuery.trim()) {
            const searchTerm = `%${filters.searchQuery.trim()}%`;
            query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm}`);
        }

        if (filters?.manufacturers && filters.manufacturers.length > 0) {
            query = query.in('brand', filters.manufacturers);
        }

        if (filters?.availability && filters.availability !== '') {
            switch (filters.availability) {
                case 'in-stock':
                    query = query.eq('stock_status', 'in_stock');
                    break;
            }
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Count products by individual categories first (including additional categories)
        const individualCategoryCounts: { [categoryId: string]: Set<string> } = {};
        
        // Initialize all category IDs with empty sets for distinct product tracking
        Object.keys(categoryHierarchy).forEach(categoryId => {
            individualCategoryCounts[categoryId] = new Set<string>();
        });

        (data || []).forEach(product => {
            // Count for main category
            if (product.category_id && individualCategoryCounts[product.category_id]) {
                individualCategoryCounts[product.category_id].add(product.id);
            }

            // Count for additional categories
            if (product.product_categories) {
                const additionalCategories = Array.isArray(product.product_categories) 
                    ? product.product_categories 
                    : [product.product_categories];
                
                additionalCategories.forEach((pc: any) => {
                    if (pc.category_id && individualCategoryCounts[pc.category_id]) {
                        individualCategoryCounts[pc.category_id].add(product.id);
                    }
                });
            }
        });

        // Calculate hierarchical counts: each parent gets its own count + all descendants
        const hierarchicalCounts = this.calculateHierarchicalCounts(categoryHierarchy, individualCategoryCounts);

        // Convert from category ID-based counts to category name-based counts
        Object.entries(hierarchicalCounts).forEach(([categoryId, count]) => {
            const categoryInfo = categoryHierarchy[categoryId];
            if (categoryInfo) {
                allCategoryCounts[categoryInfo.name] = count;
            }
        });

        return allCategoryCounts;
    }

    /**
     * Calculate hierarchical counts where each parent category includes counts from all its descendants
     */
    private calculateHierarchicalCounts(
        categoryHierarchy: { [categoryId: string]: { name: string; parentId?: string; children: string[] } },
        individualCounts: { [categoryId: string]: Set<string> }
    ): { [categoryId: string]: number } {
        const hierarchicalCounts: { [categoryId: string]: number } = {};

        // Helper function to recursively collect all descendant product IDs
        const collectDescendantProducts = (categoryId: string, visited: Set<string> = new Set()): Set<string> => {
            if (visited.has(categoryId)) {
                return new Set(); // Prevent infinite loops
            }
            visited.add(categoryId);

            const allProducts = new Set<string>();
            
            // Add this category's own products
            if (individualCounts[categoryId]) {
                individualCounts[categoryId].forEach(productId => allProducts.add(productId));
            }

            // Add products from all descendants
            const categoryInfo = categoryHierarchy[categoryId];
            if (categoryInfo && categoryInfo.children.length > 0) {
                categoryInfo.children.forEach(childId => {
                    const childProducts = collectDescendantProducts(childId, new Set(visited));
                    childProducts.forEach(productId => allProducts.add(productId));
                });
            }

            return allProducts;
        };

        // Calculate hierarchical count for each category
        Object.keys(categoryHierarchy).forEach(categoryId => {
            const allProducts = collectDescendantProducts(categoryId);
            hierarchicalCounts[categoryId] = allProducts.size;
        });

        return hierarchicalCounts;
    }

    private async fetchManufacturerCounts(filters?: ProductsActions.ManufacturerCountFilters): Promise<{ [manufacturerName: string]: number }> {
        // First get all manufacturers to initialize with 0 counts
        const allManufacturers = await this.fetchAllManufacturers();
        const allManufacturerCounts: { [manufacturerName: string]: number } = {};
        allManufacturers.forEach(manufacturer => {
            allManufacturerCounts[manufacturer] = 0;
        });

        // Build query for actual counts - get full product data
        let query = this.supabaseService.client
            .from('products')
            .select(`
                id,
                name,
                description,
                sku,
                brand,
                stock_status,
                category_id,
                categories!inner(name)
            `)
            .eq('is_active', true)
            .not('brand', 'is', null);

        // Apply filters
        if (filters?.searchQuery && filters.searchQuery.trim()) {
            const searchTerm = `%${filters.searchQuery.trim()}%`;
            query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm}`);
        }

        if (filters?.categories && filters.categories.length > 0) {
            // Filter by category name directly since we're joining with categories table
            query = query.in('categories.name', filters.categories);
        }

        if (filters?.availability && filters.availability !== '') {
            switch (filters.availability) {
                case 'in-stock':
                    query = query.eq('stock_status', 'in_stock');
                    break;
            }
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Count products by manufacturer
        const filteredCounts: { [manufacturerName: string]: number } = {};
        (data || []).forEach(product => {
            const manufacturerName = product.brand;
            if (manufacturerName) {
                filteredCounts[manufacturerName] = (filteredCounts[manufacturerName] || 0) + 1;
            }
        });

        // Merge with all manufacturers (overriding 0s with actual counts)
        return { ...allManufacturerCounts, ...filteredCounts };
    }
} 