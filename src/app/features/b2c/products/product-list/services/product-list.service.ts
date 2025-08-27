import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../../services/supabase.service';
import { Product, SortOption } from '../product-list.component';
import { ProductsQuery, ProductsResponse } from '../store/product-list.actions';

export interface ProductFilters {
    category?: string;
    manufacturer?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    availability?: string;
    featured?: boolean;
    search?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductListService {

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

    private async fetchProductsWithPagination(query: ProductsQuery): Promise<ProductsResponse> {
        try {
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

            // Apply sorting
            if (query.sortOption) {
                switch (query.sortOption) {
                    case 'featured':
                        supabaseQuery = supabaseQuery.order('is_featured', { ascending: false })
                                                   .order('created_at', { ascending: false });
                        break;
                    case 'newest':
                        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
                        break;
                    case 'name-asc':
                        supabaseQuery = supabaseQuery.order('name', { ascending: true });
                        break;
                    case 'name-desc':
                        supabaseQuery = supabaseQuery.order('name', { ascending: false });
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
            const product = await this.supabaseService.getTableById('products', id);
            if (!product) return null;

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
            // Get category name from the joined categories table
            const categoryName = product.categories?.name || 'Unknown Category';

            // For now, use simple single category approach
            const categoriesArray: Array<{ name: string; isPrimary: boolean }> = [{
                name: categoryName,
                isPrimary: true
            }];

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

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.original_price || undefined,
                discount,
                imageUrl,
                category: categoryName, // Legacy single category
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
                isOnSale: product.is_on_sale || false
            };
        } catch (error) {
            console.error('Error converting product:', error);
            return null;
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