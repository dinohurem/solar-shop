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
    createdAt: Date;
    updatedAt: Date;
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

            // Get all products at once
            const allProducts = await this.supabaseService.getProducts({});
            
            // Count products per category
            allProducts.forEach(product => {
                if (product.category_id && categoryIds.includes(product.category_id)) {
                    productCounts[product.category_id] = (productCounts[product.category_id] || 0) + 1;
                }
            });

            return productCounts;
        } catch (error) {
            console.error('Error getting product counts for categories:', error);
            return {};
        }
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