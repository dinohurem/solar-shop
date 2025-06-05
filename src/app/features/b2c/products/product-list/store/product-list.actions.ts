import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product, ProductFilters, SortOption } from '../product-list.component';

export const ProductListActions = createActionGroup({
    source: 'Product List',
    events: {
        'Load Products': emptyProps(),
        'Load Products Success': props<{ products: Product[] }>(),
        'Load Products Failure': props<{ error: string }>(),

        'Toggle Category Filter': props<{ category: string; checked: boolean }>(),
        'Update Price Range': props<{ rangeType: 'min' | 'max'; value: number }>(),
        'Toggle Certificate Filter': props<{ certificate: string; checked: boolean }>(),
        'Toggle Manufacturer Filter': props<{ manufacturer: string; checked: boolean }>(),
        'Clear Filters': emptyProps(),

        'Update Sort Option': props<{ sortOption: SortOption }>(),
        'Search Products': props<{ query: string }>(),
    }
}); 