import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
    productCount?: number;
    ownProductCount?: number; // Products directly assigned to this category (not including subcategories)
    createdAt: Date;
    updatedAt: Date;
    subcategories?: ProductCategory[];
}

export interface CategoryFilters {
    parentId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CategoriesService {

    constructor(private supabaseService: SupabaseService) { }

    getCategories(filters?: CategoryFilters): Observable<ProductCategory[]> {
        return from(this.fetchCategoriesFromSupabase(filters)).pipe(
            catchError(error => {
                console.error('Error fetching categories:', error);
                return of([]);
            })
        );
    }

    getActiveCategories(): Observable<ProductCategory[]> {
        return from(this.fetchActiveCategories()).pipe(
            catchError(error => {
                console.error('Error fetching active categories:', error);
                return of([]);
            })
        );
    }

    getCategoryById(id: string): Observable<ProductCategory | null> {
        return from(this.fetchCategoryById(id)).pipe(
            catchError(error => {
                console.error('Error fetching category:', error);
                return of(null);
            })
        );
    }

    getCategoryBySlug(slug: string): Observable<ProductCategory | null> {
        return from(this.fetchCategoryBySlug(slug)).pipe(
            catchError(error => {
                console.error('Error fetching category by slug:', error);
                return of(null);
            })
        );
    }

    getTopLevelCategories(): Observable<ProductCategory[]> {
        return from(this.fetchTopLevelCategories()).pipe(
            catchError(error => {
                console.error('Error fetching top level categories:', error);
                return of([]);
            })
        );
    }

    getNestedCategories(): Observable<ProductCategory[]> {
        return from(this.fetchNestedCategories()).pipe(
            catchError(error => {
                console.error('Error fetching nested categories:', error);
                return of([]);
            })
        );
    }

    getSubCategories(parentId: string): Observable<ProductCategory[]> {
        return from(this.fetchSubCategories(parentId)).pipe(
            catchError(error => {
                console.error('Error fetching subcategories:', error);
                return of([]);
            })
        );
    }

    private async fetchCategoriesFromSupabase(filters?: CategoryFilters): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(filters?.isActive ?? true);

            let filteredCategories = supabaseCategories;

            if (filters?.parentId !== undefined) {
                filteredCategories = filteredCategories.filter(category =>
                    category.parent_id === filters.parentId
                );
            }

            if (filters?.limit) {
                filteredCategories = filteredCategories.slice(0, filters.limit);
            }

            return await this.convertSupabaseCategoriesToLocal(filteredCategories);
        } catch (error) {
            console.error('Error in fetchCategoriesFromSupabase:', error);
            return [];
        }
    }

    private async fetchActiveCategories(): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(true);
            return await this.convertSupabaseCategoriesToLocal(supabaseCategories);
        } catch (error) {
            console.error('Error in fetchActiveCategories:', error);
            return [];
        }
    }

    private async fetchCategoryById(id: string): Promise<ProductCategory | null> {
        try {
            const category = await this.supabaseService.getTableById('categories', id);
            if (!category) return null;

            return await this.convertSupabaseCategoryToLocal(category);
        } catch (error) {
            console.error('Error in fetchCategoryById:', error);
            return null;
        }
    }

    private async fetchCategoryBySlug(slug: string): Promise<ProductCategory | null> {
        try {
            const categories = await this.supabaseService.getCategories(true);
            const category = categories.find(c => c.slug === slug);

            if (!category) return null;

            return await this.convertSupabaseCategoryToLocal(category);
        } catch (error) {
            console.error('Error in fetchCategoryBySlug:', error);
            return null;
        }
    }

    private async fetchTopLevelCategories(): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(true);
            
            const topLevelCategories = supabaseCategories.filter(category => 
                !category.parent_id && category.is_active === true
            );

            const converted = await this.convertSupabaseCategoriesToLocal(topLevelCategories);
            
            return converted;
        } catch (error) {
            console.error('Error in fetchTopLevelCategories:', error);
            return [];
        }
    }

    private async fetchNestedCategories(): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(true);
            
            // Get all categories and organize them in hierarchical structure
            const allCategories = await this.convertSupabaseCategoriesToLocal(supabaseCategories);
            
            // Get top-level categories
            const topLevelCategories = allCategories.filter(category => !category.parentId);
            
            // For each top-level category, find its subcategories and calculate hierarchical product counts
            const nestedCategories = await Promise.all(topLevelCategories.map(async parent => {
                const subcategories = allCategories.filter(category => category.parentId === parent.id);
                
                // For parent categories: show distinct count of products that would be returned when filtering
                // This ensures display count matches exactly what users see when they click on the category
                if (subcategories.length > 0) {
                    // Get distinct count across parent + all subcategories (matches filtering logic)
                    const hierarchicalCount = await this.getHierarchicalProductCount(parent.id, subcategories.map(sub => sub.id));
                    
                    return {
                        ...parent,
                        productCount: hierarchicalCount, // Distinct count that matches filtering
                        ownProductCount: parent.productCount || 0, // Keep track of parent's own products
                        subcategories: subcategories
                    };
                } else {
                    // For categories without subcategories, just use their own count
                    return {
                        ...parent,
                        productCount: parent.productCount || 0,
                        ownProductCount: parent.productCount || 0,
                        subcategories: undefined
                    };
                }
            }));
            
            return nestedCategories;
        } catch (error) {
            console.error('Error in fetchNestedCategories:', error);
            return [];
        }
    }

    private async getHierarchicalProductCount(parentCategoryId: string, subcategoryIds: string[]): Promise<number> {
        try {
            // Get distinct product count for parent category + all its subcategories
            // This matches the filtering logic used in the components
            const { data: result, error } = await this.supabaseService.client
                .rpc('get_hierarchical_product_count', { 
                    parent_category_id: parentCategoryId,
                    subcategory_ids: subcategoryIds
                });

            if (error) {
                console.warn('Error getting hierarchical product count, falling back:', error);
                return await this.getFallbackHierarchicalCount(parentCategoryId, subcategoryIds);
            }

            return result || 0;
        } catch (error) {
            console.warn('Error in getHierarchicalProductCount:', error);
            return await this.getFallbackHierarchicalCount(parentCategoryId, subcategoryIds);
        }
    }

    private async getFallbackHierarchicalCount(parentCategoryId: string, subcategoryIds: string[]): Promise<number> {
        try {
            const allCategoryIds = [parentCategoryId, ...subcategoryIds];
            
            // Get all products that match any of these categories (main or additional)
            const { data: products, error } = await this.supabaseService.client
                .from('products')
                .select(`
                    id,
                    category_id,
                    product_categories!left(category_id)
                `)
                .eq('is_active', true);

            if (error || !products) {
                return 0;
            }

            // Use Set to ensure distinct product IDs
            const distinctProductIds = new Set<string>();
            
            products.forEach((product: any) => {
                // Check if main category matches any target category
                if (allCategoryIds.includes(product.category_id)) {
                    distinctProductIds.add(product.id);
                }
                
                // Check if any additional categories match
                if (product.product_categories) {
                    const additionalCategories = Array.isArray(product.product_categories) 
                        ? product.product_categories 
                        : [product.product_categories];
                    
                    if (additionalCategories.some((pc: any) => allCategoryIds.includes(pc.category_id))) {
                        distinctProductIds.add(product.id);
                    }
                }
            });
            
            return distinctProductIds.size;
        } catch (error) {
            console.warn('Error in getFallbackHierarchicalCount:', error);
            return 0;
        }
    }

    private async fetchSubCategories(parentId: string): Promise<ProductCategory[]> {
        try {
            const supabaseCategories = await this.supabaseService.getCategories(true);
            const subCategories = supabaseCategories.filter(category => category.parent_id === parentId);

            return await this.convertSupabaseCategoriesToLocal(subCategories);
        } catch (error) {
            console.error('Error in fetchSubCategories:', error);
            return [];
        }
    }

    private async convertSupabaseCategoriesToLocal(categories: any[]): Promise<ProductCategory[]> {
        const convertedCategories: ProductCategory[] = [];

        // Get all product counts at once for better performance
        const productCountsByCategory = await this.getProductCountsForCategories(categories.map(c => c.id));

        for (const category of categories) {
            const converted = await this.convertSupabaseCategoryToLocal(category, productCountsByCategory[category.id] || 0);
            if (converted) {
                convertedCategories.push(converted);
            }
        }

        return convertedCategories;
    }

    private async convertSupabaseCategoryToLocal(category: any, productCount: number = 0): Promise<ProductCategory | null> {
        try {
            const converted = {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                imageUrl: category.image_url || this.getDefaultCategoryImage(category.slug),
                parentId: category.parent_id,
                isActive: category.is_active,
                sortOrder: category.sort_order,
                productCount,
                createdAt: new Date(category.created_at),
                updatedAt: new Date(category.updated_at)
            };
            
            return converted;
        } catch (error) {
            console.error('Error converting category:', category.name, error);
            return null;
        }
    }

    private async getProductCountsForCategories(categoryIds: string[]): Promise<{ [categoryId: string]: number }> {
        try {
            const productCounts: { [categoryId: string]: number } = {};
            
            // Initialize all categories to 0
            categoryIds.forEach(id => {
                productCounts[id] = 0;
            });

            // Use a single query with UNION to get DISTINCT product counts per category
            // This avoids double-counting products that exist in both main category and additional categories
            const { data: categoryProductCounts, error } = await this.supabaseService.client
                .rpc('get_distinct_product_counts_by_categories', { 
                    category_ids: categoryIds 
                });

            if (error) {
                console.warn('Error getting distinct product counts, falling back to legacy method:', error);
                return await this.getFallbackProductCounts(categoryIds);
            }

            // Map the results
            if (categoryProductCounts) {
                categoryProductCounts.forEach((result: any) => {
                    if (result.category_id && categoryIds.includes(result.category_id)) {
                        productCounts[result.category_id] = result.product_count || 0;
                    }
                });
            }

            return productCounts;
        } catch (error) {
            console.error('Error getting product counts for categories:', error);
            return await this.getFallbackProductCounts(categoryIds);
        }
    }

    private async getFallbackProductCounts(categoryIds: string[]): Promise<{ [categoryId: string]: number }> {
        const productCounts: { [categoryId: string]: number } = {};
        
        // Initialize all categories to 0
        categoryIds.forEach(id => {
            productCounts[id] = 0;
        });

        // For each category, get distinct product count using manual DISTINCT logic
        for (const categoryId of categoryIds) {
            try {
                // Get all distinct product IDs for this category (both main and additional)
                const { data: distinctProducts, error } = await this.supabaseService.client
                    .from('products')
                    .select(`
                        id,
                        category_id,
                        product_categories!left(category_id)
                    `)
                    .eq('is_active', true)
                    .or(`category_id.eq.${categoryId},product_categories.category_id.eq.${categoryId}`);

                if (!error && distinctProducts) {
                    // Use Set to ensure distinct product IDs
                    const distinctProductIds = new Set<string>();
                    
                    distinctProducts.forEach((product: any) => {
                        // Add if main category matches
                        if (product.category_id === categoryId) {
                            distinctProductIds.add(product.id);
                        }
                        // Add if additional category matches
                        if (product.product_categories) {
                            const additionalCategories = Array.isArray(product.product_categories) 
                                ? product.product_categories 
                                : [product.product_categories];
                            
                            if (additionalCategories.some((pc: any) => pc.category_id === categoryId)) {
                                distinctProductIds.add(product.id);
                            }
                        }
                    });
                    
                    productCounts[categoryId] = distinctProductIds.size;
                }
            } catch (categoryError) {
                console.warn(`Error getting count for category ${categoryId}:`, categoryError);
                productCounts[categoryId] = 0;
            }
        }

        return productCounts;
    }

    private async getProductCountForCategory(categoryId: string): Promise<number> {
        try {
            const products = await this.supabaseService.getProducts({ categoryId });
            return products.length;
        } catch (error) {
            console.error('Error getting product count for category:', categoryId, error);
            return 0;
        }
    }

    private getDefaultCategoryImage(slug: string): string {
        const imageMap: { [key: string]: string } = {
            'solar-panels': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
            'inverters': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
            'batteries': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=500&fit=crop',
            'mounting-systems': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&h=500&fit=crop',
            'monitoring': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=500&fit=crop'
        };

        return imageMap[slug] || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop';
    }
} 