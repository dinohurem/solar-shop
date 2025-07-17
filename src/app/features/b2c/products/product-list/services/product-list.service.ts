import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../../services/supabase.service';
import { Product } from '../product-list.component';

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
            // Get category name
            const category = await this.supabaseService.getTableById('categories', product.category_id);
            const categoryName = category?.name || 'Unknown Category';

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
                category: categoryName,
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
                sku: product.sku || ''
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