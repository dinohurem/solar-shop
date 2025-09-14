import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product, ProductFilters, SortOption } from '../product-list.component';
import { CategoryCountFilters, ManufacturerCountFilters } from '../services/product-list.service';

export interface ProductsQuery {
    page?: number;
    itemsPerPage?: number;
    searchQuery?: string;
    categories?: string[];
    manufacturers?: string[];
    certificates?: string[];
    priceRange?: { min: number; max: number };
    sortOption?: SortOption;
}

export interface ProductsResponse {
    products: Product[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export const ProductListActions = createActionGroup({
    source: 'Product List',
    events: {
        'Load Products': props<{ query?: ProductsQuery }>(),
        'Load Products Success': props<{ response: ProductsResponse }>(),
        'Load Products Failure': props<{ error: string }>(),
        'Load Products From Cache': props<{ products: Product[], currentPage: number }>(),

        'Toggle Category Filter': props<{ category: string; checked: boolean }>(),
        'Update Price Range': props<{ rangeType: 'min' | 'max'; value: number }>(),
        'Toggle Certificate Filter': props<{ certificate: string; checked: boolean }>(),
        'Toggle Manufacturer Filter': props<{ manufacturer: string; checked: boolean }>(),
        'Clear Filters': emptyProps(),

        'Update Sort Option': props<{ sortOption: SortOption }>(),
        'Search Products': props<{ query: string }>(),

        // Pagination actions
        'Set Current Page': props<{ page: number }>(),
        'Set Items Per Page': props<{ itemsPerPage: number }>(),
        'Update Total Items': props<{ totalItems: number }>(),

        // Filter metadata actions
        'Load All Manufacturers': emptyProps(),
        'Load All Manufacturers Success': props<{ manufacturers: string[] }>(),
        'Load All Manufacturers Failure': props<{ error: string }>(),
        'Load Category Counts': props<{ filters?: CategoryCountFilters }>(),
        'Load Category Counts Success': props<{ categoryCounts: { [categoryName: string]: number } }>(),
        'Load Category Counts Failure': props<{ error: string }>(),
        'Load Manufacturer Counts': props<{ filters?: ManufacturerCountFilters }>(),
        'Load Manufacturer Counts Success': props<{ manufacturerCounts: { [manufacturerName: string]: number } }>(),
        'Load Manufacturer Counts Failure': props<{ error: string }>(),
    }
}); 