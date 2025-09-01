import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';
import { Product } from '../product-list/product-list.component';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Get products by multiple category names, excluding a specific product
     * @param categoryNames Array of category names to filter by
     * @param excludeProductId Product ID to exclude from results
     * @param limit Maximum number of products to return
     */
    getProductsByCategories(categoryNames: string[], excludeProductId?: string, limit: number = 10): Observable<Product[]> {
        return from(this.fetchProductsByCategories(categoryNames, excludeProductId, limit)).pipe(
            catchError(error => {
                console.error('Error fetching products by categories:', error);
                return of([]);
            })
        );
    }

    /**
     * Get a single product by ID
     */
    getProductById(id: string): Observable<Product | null> {
        return from(this.fetchProductById(id)).pipe(
            catchError(error => {
                console.error('Error fetching product:', error);
                return of(null);
            })
        );
    }

    /**
     * Get featured products
     */
    getFeaturedProducts(limit: number = 6): Observable<Product[]> {
        return from(this.fetchFeaturedProducts(limit)).pipe(
            catchError(error => {
                console.error('Error fetching featured products:', error);
                return of([]);
            })
        );
    }

    private async fetchProductsByCategories(categoryNames: string[], excludeProductId?: string, limit: number = 10): Promise<Product[]> {
        try {
            // Get category IDs from category names
            const categories = await this.supabaseService.getCategories();
            const categoryIds = categories
                .filter(category => categoryNames.includes(category.name))
                .map(category => category.id);

            if (categoryIds.length === 0) {
                return [];
            }

            // Handle both legacy category_id and product_categories table
            // Get products that have category_id in the list OR have entries in product_categories
            const { data: productCategoryIds } = await this.supabaseService.client
                .from('product_categories')
                .select('product_id')
                .in('category_id', categoryIds);
            
            const productIdsFromJunction = (productCategoryIds || []).map(pc => pc.product_id);
            
            let query = this.supabaseService.client
                .from('products')
                .select(`
                    *,
                    categories(name, slug)
                `)
                .limit(limit);
            
            if (productIdsFromJunction.length > 0) {
                // Filter by either category_id OR product ID exists in junction table
                query = query.or(`category_id.in.(${categoryIds.join(',')}),id.in.(${productIdsFromJunction.join(',')})`);
            } else {
                // Fallback to just legacy category_id
                query = query.in('category_id', categoryIds);
            }

            // Exclude the specified product if provided
            if (excludeProductId) {
                query = query.neq('id', excludeProductId);
            }

            const { data: products, error } = await query;

            if (error) {
                console.error('Supabase error:', error);
                return [];
            }

            return await this.convertSupabaseProductsToLocal(products || []);
        } catch (error) {
            console.error('Error in fetchProductsByCategories:', error);
            return [];
        }
    }

    private async fetchProductById(id: string): Promise<Product | null> {
        try {
            // Get product with legacy category
            const { data: product, error } = await this.supabaseService.client
                .from('products')
                .select(`
                    *,
                    categories:category_id (
                        id,
                        name,
                        slug
                    )
                `)
                .eq('id', id)
                .eq('is_active', true)
                .single();

            if (error || !product) {
                console.error('Error fetching product by ID:', error);
                return null;
            }

            // Get additional categories from product_categories junction table
            const { data: additionalCategories } = await this.supabaseService.client
                .from('product_categories')
                .select(`
                    is_primary,
                    categories!product_categories_category_id_fkey (
                        id,
                        name,
                        slug
                    )
                `)
                .eq('product_id', id);

            // Attach additional categories to product
            product.product_categories = additionalCategories || [];

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

            // Get multiple categories from both sources
            let categoriesArray: Array<{ name: string; isPrimary: boolean }> = [];
            
            // First, add categories from product_categories junction table if available
            if (product.product_categories && product.product_categories.length > 0) {
                categoriesArray = product.product_categories.map((pc: any) => ({
                    name: pc.categories?.name || 'Unknown',
                    isPrimary: pc.is_primary || false
                }));
            }
            
            // If no junction table categories, use legacy category_id
            if (categoriesArray.length === 0 && categoryName && categoryName !== 'Unknown Category') {
                categoriesArray = [{
                    name: categoryName,
                    isPrimary: true
                }];
            }
            
            // If still no categories, set empty array
            if (categoriesArray.length === 0) {
                categoriesArray = [];
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