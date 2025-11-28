import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../../services/supabase.service';
import { Product, SortOption } from '../product-list.component';
import { ProductsQuery, ProductsResponse } from '../store/product-list.actions';
import { SortOptionsService } from '../../../../../shared/services/sort-options.service';

export interface ProductFilters {
    category?: string;
    manufacturer?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    availability?: string;
    featured?: boolean;
    search?: string;
}

export interface CategoryCountFilters {
    searchQuery?: string;
    manufacturers?: string[];
    priceRange?: { min: number; max: number };
    availability?: string;
}

export interface ManufacturerCountFilters {
    searchQuery?: string;
    categories?: string[];
    priceRange?: { min: number; max: number };
    availability?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductListService {
    private sortOptionsService = inject(SortOptionsService);

    constructor(private supabaseService: SupabaseService) { }

    getProducts(filters?: ProductFilters): Observable<Product[]> {
        return from(this.fetchProductsFromSupabase(filters)).pipe(
            catchError(error => {
                console.error('Error fetching products:', error);
                return of([]);
            })
        );
    }

    getProductById(id: string): Observable<Product | null> {
        return from(this.fetchProductById(id)).pipe(
            catchError(error => {
                console.error('Error fetching product:', error);
                return of(null);
            })
        );
    }

    getFeaturedProducts(limit: number = 6): Observable<Product[]> {
        return from(this.fetchFeaturedProducts(limit)).pipe(
            catchError(error => {
                console.error('Error fetching featured products:', error);
                return of([]);
            })
        );
    }

    getProductsByCategory(categoryId: string, limit?: number): Observable<Product[]> {
        return from(this.fetchProductsByCategory(categoryId, limit)).pipe(
            catchError(error => {
                console.error('Error fetching products by category:', error);
                return of([]);
            })
        );
    }

    searchProducts(query: string, limit?: number): Observable<Product[]> {
        return from(this.searchProductsInSupabase(query, limit)).pipe(
            catchError(error => {
                console.error('Error searching products:', error);
                return of([]);
            })
        );
    }

    getProductsWithPagination(query: ProductsQuery): Observable<ProductsResponse> {
        return from(this.fetchProductsWithPagination(query)).pipe(
            catchError(error => {
                console.error('Error fetching products with pagination:', error);
                return of({ products: [], totalItems: 0, totalPages: 0, currentPage: 1 });
            })
        );
    }

    getAllManufacturers(): Observable<string[]> {
        return from(this.fetchAllManufacturers()).pipe(
            catchError(error => {
                console.error('Error fetching all manufacturers:', error);
                return of([]);
            })
        );
    }

    getCategoryCounts(filters?: CategoryCountFilters | Partial<ProductFilters>): Observable<{ [categoryName: string]: number }> {
        return from(this.fetchCategoryCounts(filters)).pipe(
            catchError(error => {
                console.error('Error fetching category counts:', error);
                return of({});
            })
        );
    }

    getManufacturerCounts(filters?: ManufacturerCountFilters | Partial<ProductFilters>): Observable<{ [manufacturerName: string]: number }> {
        return from(this.fetchManufacturerCounts(filters)).pipe(
            catchError(error => {
                console.error('Error fetching manufacturer counts:', error);
                return of({});
            })
        );
    }

    private async fetchProductsWithPagination(query: ProductsQuery): Promise<ProductsResponse> {
        try {
            const page = query.page || 1;
            const itemsPerPage = query.itemsPerPage || 10;
            const from = (page - 1) * itemsPerPage;
            const to = from + itemsPerPage - 1;

            // Build the query - simplified approach like B2B
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
                    
                    // Handle both legacy category_id and product_categories table
                    // Get products that have category_id in the list OR have entries in product_categories
                    const { data: productCategoryIds } = await this.supabaseService.client
                        .from('product_categories')
                        .select('product_id')
                        .in('category_id', categoryIds);
                    
                    const productIdsFromJunction = (productCategoryIds || []).map(pc => pc.product_id);
                    
                    if (productIdsFromJunction.length > 0) {
                        // Filter by either category_id OR product ID exists in junction table
                        const filterQuery = `category_id.in.(${categoryIds.join(',')}),id.in.(${productIdsFromJunction.join(',')})`;
                        supabaseQuery = supabaseQuery.or(filterQuery);
                    } else {
                        // Fallback to just legacy category_id
                        supabaseQuery = supabaseQuery.in('category_id', categoryIds);
                    }
                }
            }

            if (query.manufacturers && query.manufacturers.length > 0) {
                // Use 'in' operator for manufacturers too
                supabaseQuery = supabaseQuery.in('brand', query.manufacturers);
            }

            if (query.priceRange && (query.priceRange.min > 0 || query.priceRange.max > 0)) {
                if (query.priceRange.min > 0) {
                    supabaseQuery = supabaseQuery.gte('price', query.priceRange.min);
                }
                if (query.priceRange.max > 0) {
                    supabaseQuery = supabaseQuery.lte('price', query.priceRange.max);
                }
            }

            // Apply sorting using dynamic sort options (multi-field support)
            const sortCode = query.sortOption || this.sortOptionsService.getDefaultSortOptionCode();
            const sortOptions = this.sortOptionsService.getEnabledSortOptions();
            const selectedSort = sortOptions.find(opt => opt.code === sortCode);

            if (selectedSort && selectedSort.sortFields && selectedSort.sortFields.length > 0) {
                // Apply each sort field in order
                for (const sf of selectedSort.sortFields) {
                    supabaseQuery = supabaseQuery.order(sf.field, { ascending: sf.direction === 'asc' });
                }
            } else {
                // Fallback to featured sorting
                supabaseQuery = supabaseQuery.order('is_featured', { ascending: false })
                                             .order('created_at', { ascending: false });
            }

            // Apply pagination
            supabaseQuery = supabaseQuery.range(from, to);

            const { data, error, count } = await supabaseQuery;

            if (error) {
                throw error;
            }

            // Convert products using existing method
            const products = await this.convertSupabaseProductsToLocal(data || []);
            
            const totalItems = count || 0;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            return {
                products,
                totalItems,
                totalPages,
                currentPage: page
            };
        } catch (error) {
            console.error('Error in fetchProductsWithPagination:', error);
            return { products: [], totalItems: 0, totalPages: 0, currentPage: 1 };
        }
    }

    private async fetchProductsFromSupabase(filters?: ProductFilters): Promise<Product[]> {
        try {
            const supabaseFilters: any = {};

            if (filters?.category) {
                // Get category ID from slug or name
                const categories = await this.supabaseService.getCategories();
                const category = categories.find(c =>
                    c.slug === filters.category ||
                    c.name.toLowerCase() === filters.category!.toLowerCase()
                );
                if (category) {
                    supabaseFilters.category_id = category.id;
                }
            }

            if (filters?.featured !== undefined) {
                supabaseFilters.is_featured = filters.featured;
            }

            if (filters?.availability) {
                if (filters.availability === 'available') {
                    supabaseFilters.stock_status = 'in_stock';
                } else if (filters.availability === 'limited') {
                    supabaseFilters.stock_status = 'low_stock';
                } else if (filters.availability === 'out-of-stock') {
                    supabaseFilters.stock_status = 'out_of_stock';
                }
            }

            const products = await this.supabaseService.getProducts({
                ...supabaseFilters,
                search: filters?.search,
                limit: 50
            });

            return await this.convertSupabaseProductsToLocal(products);
        } catch (error) {
            console.error('Error in fetchProductsFromSupabase:', error);
            return [];
        }
    }

    private async fetchProductById(id: string): Promise<Product | null> {
        try {
            // Use supabase query with proper joins to get product_categories data
            const { data: product, error } = await this.supabaseService.client
                .from('products')
                .select(`
                    *,
                    categories:category_id (
                        id,
                        name,
                        slug
                    ),
                    product_categories!product_categories_product_id_fkey (
                        is_primary,
                        categories!product_categories_category_id_fkey (
                            id,
                            name,
                            slug
                        )
                    )
                `)
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (error || !product) {
                console.error('Error fetching product by ID:', error);
                return null;
            }

            return await this.convertSupabaseProductToLocal(product);
        } catch (error) {
            console.error('Error in fetchProductById:', error);
            return null;
        }
    }

    private async fetchFeaturedProducts(limit: number): Promise<Product[]> {
        try {
            const products = await this.supabaseService.getProducts({
                featured: true,
                limit
            });

            return await this.convertSupabaseProductsToLocal(products);
        } catch (error) {
            console.error('Error in fetchFeaturedProducts:', error);
            return [];
        }
    }

    private async fetchProductsByCategory(categoryId: string, limit?: number): Promise<Product[]> {
        try {
            const products = await this.supabaseService.getProducts({
                categoryId,
                limit
            });

            return await this.convertSupabaseProductsToLocal(products);
        } catch (error) {
            console.error('Error in fetchProductsByCategory:', error);
            return [];
        }
    }

    private async searchProductsInSupabase(query: string, limit?: number): Promise<Product[]> {
        try {
            const products = await this.supabaseService.getProducts({
                search: query,
                limit
            });

            return await this.convertSupabaseProductsToLocal(products);
        } catch (error) {
            console.error('Error in searchProductsInSupabase:', error);
            return [];
        }
    }

    private async convertSupabaseProductsToLocal(products: any[]): Promise<Product[]> {
        const convertedProducts: Product[] = [];

        for (const product of products) {
            const converted = await this.convertSupabaseProductToLocal(product);
            if (converted) {
                convertedProducts.push(converted);
            }
        }

        return convertedProducts;
    }

    private async convertSupabaseProductToLocal(product: any): Promise<Product | null> {
        try {
            // Get legacy single category name
            const categoryName = product.categories?.name || 'Unknown Category';

            // For now, use the single category approach to simplify and avoid the complex joins
            let categoriesArray: Array<{ name: string; isPrimary: boolean }> = [];
            
            // Use the single category from the join
            if (categoryName && categoryName !== 'Unknown Category') {
                categoriesArray = [{
                    name: categoryName,
                    isPrimary: true
                }];
            }

            // Get primary image
            const imageUrl = this.getProductImage(product.images);

            // Calculate discount percentage
            const discount = product.original_price && product.original_price > product.price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : undefined;

            // Determine availability based on stock status
            let availability: 'available' | 'limited' | 'out-of-stock' = 'available';
            if (product.stock_status === 'out_of_stock' || product.stock_quantity === 0) {
                availability = 'out-of-stock';
            } else if (product.stock_status === 'low_stock' || product.stock_quantity < 10) {
                availability = 'limited';
            }

            // Get the primary category name for legacy support
            const primaryCategory = categoriesArray.find(cat => cat.isPrimary) || categoriesArray[0];
            const legacyCategoryName = primaryCategory ? primaryCategory.name : categoryName;

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.original_price || undefined,
                discount,
                imageUrl,
                category: legacyCategoryName, // Legacy single category (primary or first from categories)
                categories: categoriesArray, // New multi-category array
                manufacturer: product.brand,
                model: product.model,
                weight: product.weight,
                dimensions: product.dimensions,
                certificates: product.certifications || [],
                rating: product.rating_average || 0,
                reviewCount: product.rating_count || 0,
                availability,
                featured: product.is_featured || false,
                createdAt: new Date(product.created_at),
                specifications: product.specifications || {},
                features: product.features || [],
                sku: product.sku || '',
                images: product.images || [],
                isOnSale: product.is_on_sale || false,
                technical_sheet: product.technical_sheet || undefined
            };
        } catch (error) {
            console.error('Error converting product:', error);
            return null;
        }
    }

    private async fetchAllManufacturers(): Promise<string[]> {
        try {
            const { data, error } = await this.supabaseService.client
                .from('products')
                .select('brand')
                .eq('is_active', true)
                .not('brand', 'is', null)
                .not('brand', 'eq', '');

            if (error) {
                throw error;
            }

            // Get unique manufacturers
            const manufacturers = [...new Set(data?.map(product => product.brand).filter(Boolean) || [])];
            return manufacturers.sort();
        } catch (error) {
            console.error('Error fetching all manufacturers:', error);
            return [];
        }
    }

    private async fetchCategoryCounts(filters?: CategoryCountFilters | Partial<ProductFilters>): Promise<{ [categoryName: string]: number }> {
        try {
            // First, get ALL categories with hierarchy information to ensure we show 0 counts
            const { data: allCategoriesData, error: categoriesError } = await this.supabaseService.client
                .from('categories')
                .select('id, name, parent_id')
                .eq('is_active', true);

            if (categoriesError) {
                throw categoriesError;
            }

            // Initialize all categories with 0 count
            const categoryCounts: { [categoryName: string]: number } = {};
            const categoryHierarchy: { [categoryId: string]: { name: string; parentId?: string; children: string[] } } = {};
            
            allCategoriesData?.forEach(category => {
                categoryCounts[category.name] = 0;
                categoryHierarchy[category.id] = {
                    name: category.name,
                    parentId: category.parent_id,
                    children: []
                };
            });

            // Build parent-child relationships
            allCategoriesData?.forEach(category => {
                if (category.parent_id && categoryHierarchy[category.parent_id]) {
                    categoryHierarchy[category.parent_id].children.push(category.id);
                }
            });

            // Now build query to get full product data (without count) - like B2B
            let supabaseQuery = this.supabaseService.client
                .from('products')
                .select(`
                    id,
                    name,
                    description,
                    sku,
                    brand,
                    price,
                    category_id,
                    categories!inner(id, name),
                    product_categories!left(category_id)
                `)
                .eq('is_active', true);

            // Apply the same filters as in the main query
            const searchQuery = (filters as any)?.searchQuery || (filters as any)?.search;
            if (searchQuery && searchQuery.trim()) {
                const searchTerm = `%${searchQuery.trim()}%`;
                supabaseQuery = supabaseQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm}`);
            }

            if ((filters as any)?.manufacturers && (filters as any).manufacturers.length > 0) {
                supabaseQuery = supabaseQuery.in('brand', (filters as any).manufacturers);
            }

            if (filters?.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max > 0)) {
                if (filters.priceRange.min > 0) {
                    supabaseQuery = supabaseQuery.gte('price', filters.priceRange.min);
                }
                if (filters.priceRange.max > 0) {
                    supabaseQuery = supabaseQuery.lte('price', filters.priceRange.max);
                }
            }

            // Add availability filter like B2B
            if (filters?.availability && filters.availability !== '') {
                switch (filters.availability) {
                    case 'in-stock':
                        supabaseQuery = supabaseQuery.eq('stock_status', 'in_stock');
                        break;
                    case 'low-stock':
                        supabaseQuery = supabaseQuery.eq('stock_status', 'low_stock');
                        break;
                    case 'out-of-stock':
                        supabaseQuery = supabaseQuery.eq('stock_status', 'out_of_stock');
                        break;
                }
            }

            const { data, error } = await supabaseQuery;

            if (error) {
                throw error;
            }

            // Count products by individual categories first (including additional categories)
            const individualCategoryCounts: { [categoryId: string]: Set<string> } = {};
            
            // Initialize all category IDs with empty sets for distinct product tracking
            Object.keys(categoryHierarchy).forEach(categoryId => {
                individualCategoryCounts[categoryId] = new Set<string>();
            });

            data?.forEach((product: any) => {
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

            // Now calculate hierarchical counts: each parent gets its own count + all descendants
            const hierarchicalCounts = this.calculateHierarchicalCounts(categoryHierarchy, individualCategoryCounts);

            // Convert from category ID-based counts to category name-based counts
            Object.entries(hierarchicalCounts).forEach(([categoryId, count]) => {
                const categoryInfo = categoryHierarchy[categoryId];
                if (categoryInfo) {
                    categoryCounts[categoryInfo.name] = count;
                }
            });

            return categoryCounts;
        } catch (error) {
            console.error('Error fetching category counts:', error);
            return {};
        }
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

    private async fetchManufacturerCounts(filters?: ManufacturerCountFilters | Partial<ProductFilters>): Promise<{ [manufacturerName: string]: number }> {
        try {
            // First, get ALL manufacturers to ensure we show 0 counts
            const { data: allManufacturersData, error: manufacturersError } = await this.supabaseService.client
                .from('products')
                .select('brand')
                .eq('is_active', true)
                .not('brand', 'is', null)
                .not('brand', 'eq', '');

            if (manufacturersError) {
                throw manufacturersError;
            }

            // Initialize all manufacturers with 0 count
            const manufacturerCounts: { [manufacturerName: string]: number } = {};
            const uniqueManufacturers = [...new Set(allManufacturersData?.map(product => product.brand).filter(Boolean) || [])];
            uniqueManufacturers.forEach(manufacturer => {
                manufacturerCounts[manufacturer] = 0;
            });

            // Now build query to get full product data (without count) - like B2B
            let supabaseQuery = this.supabaseService.client
                .from('products')
                .select(`
                    id,
                    name,
                    description,
                    sku,
                    brand,
                    price,
                    category_id,
                    categories!inner(name)
                `)
                .eq('is_active', true)
                .not('brand', 'is', null)
                .not('brand', 'eq', '');

            // Apply the same filters as in the main query
            const searchQuery = (filters as any)?.searchQuery || (filters as any)?.search;
            if (searchQuery && searchQuery.trim()) {
                const searchTerm = `%${searchQuery.trim()}%`;
                supabaseQuery = supabaseQuery.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},sku.ilike.${searchTerm}`);
            }

            if ((filters as any)?.categories && (filters as any).categories.length > 0) {
                // First, get the category IDs from category names
                const { data: categoryData } = await this.supabaseService.client
                    .from('categories')
                    .select('id, name')
                    .in('name', (filters as any).categories);

                if (categoryData && categoryData.length > 0) {
                    const categoryIds = categoryData.map(cat => cat.id);
                    
                    // Handle both legacy category_id and product_categories table
                    const { data: productCategoryIds } = await this.supabaseService.client
                        .from('product_categories')
                        .select('product_id')
                        .in('category_id', categoryIds);
                    
                    const productIdsFromJunction = (productCategoryIds || []).map(pc => pc.product_id);
                    
                    if (productIdsFromJunction.length > 0) {
                        // Filter by either category_id OR product ID exists in junction table
                        const filterQuery = `category_id.in.(${categoryIds.join(',')}),id.in.(${productIdsFromJunction.join(',')})`;
                        supabaseQuery = supabaseQuery.or(filterQuery);
                    } else {
                        // Fallback to just legacy category_id
                        supabaseQuery = supabaseQuery.in('category_id', categoryIds);
                    }
                }
            }

            if (filters?.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max > 0)) {
                if (filters.priceRange.min > 0) {
                    supabaseQuery = supabaseQuery.gte('price', filters.priceRange.min);
                }
                if (filters.priceRange.max > 0) {
                    supabaseQuery = supabaseQuery.lte('price', filters.priceRange.max);
                }
            }

            // Add availability filter like B2B
            if (filters?.availability && filters.availability !== '') {
                switch (filters.availability) {
                    case 'in-stock':
                        supabaseQuery = supabaseQuery.eq('stock_status', 'in_stock');
                        break;
                    case 'low-stock':
                        supabaseQuery = supabaseQuery.eq('stock_status', 'low_stock');
                        break;
                    case 'out-of-stock':
                        supabaseQuery = supabaseQuery.eq('stock_status', 'out_of_stock');
                        break;
                }
            }

            const { data, error } = await supabaseQuery;

            if (error) {
                throw error;
            }

            // Count products by manufacturer (overriding 0s with actual counts)
            data?.forEach((product: any) => {
                if (product.brand) {
                    manufacturerCounts[product.brand] = (manufacturerCounts[product.brand] || 0) + 1;
                }
            });

            return manufacturerCounts;
        } catch (error) {
            console.error('Error fetching manufacturer counts:', error);
            return {};
        }
    }

    private getProductImage(images: any[]): string {
        if (images && images.length > 0) {
            const primaryImage = images.find(img => img.is_primary) || images[0];
            return primaryImage.url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop';
        }
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop';
    }
} 