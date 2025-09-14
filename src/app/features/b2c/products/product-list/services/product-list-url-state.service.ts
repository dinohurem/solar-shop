import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { ProductFilters, SortOption, PaginationState } from '../product-list.component';

export interface ProductListUrlState {
  filters: ProductFilters;
  searchQuery: string;
  sortOption: SortOption;
  currentPage: number;
  itemsPerPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductListUrlStateService {

  /**
   * Serialize the current state to URL query parameters
   */
  serializeToQueryParams(state: ProductListUrlState): Params {
    const params: Params = {};

    // Search query
    if (state.searchQuery && state.searchQuery.trim()) {
      params['search'] = state.searchQuery.trim();
    }

    // Categories (comma-separated)
    if (state.filters.categories && state.filters.categories.length > 0) {
      params['categories'] = state.filters.categories.join(',');
    }

    // Manufacturers (comma-separated)
    if (state.filters.manufacturers && state.filters.manufacturers.length > 0) {
      params['manufacturers'] = state.filters.manufacturers.join(',');
    }

    // Certificates (comma-separated)
    if (state.filters.certificates && state.filters.certificates.length > 0) {
      params['certificates'] = state.filters.certificates.join(',');
    }

    // Price range (only if not default values)
    if (state.filters.priceRange.min > 0) {
      params['priceMin'] = state.filters.priceRange.min.toString();
    }
    if (state.filters.priceRange.max > 0) {
      params['priceMax'] = state.filters.priceRange.max.toString();
    }

    // Sort option (only if not default)
    if (state.sortOption && state.sortOption !== 'featured') {
      params['sort'] = state.sortOption;
    }

    // Current page (only if not first page)
    if (state.currentPage && state.currentPage > 1) {
      params['page'] = state.currentPage.toString();
    }

    // Items per page (only if not default)
    if (state.itemsPerPage && state.itemsPerPage !== 12) {
      params['itemsPerPage'] = state.itemsPerPage.toString();
    }

    return params;
  }

  /**
   * Deserialize URL query parameters to state
   */
  deserializeFromQueryParams(params: Params): Partial<ProductListUrlState> {
    const state: Partial<ProductListUrlState> = {};

    // Search query
    if (params['search']) {
      state.searchQuery = params['search'];
    }

    // Initialize filters object
    state.filters = {
      categories: [],
      manufacturers: [],
      certificates: [],
      priceRange: { min: 0, max: 0 }
    };

    // Categories
    if (params['categories']) {
      state.filters.categories = this.parseCommaSeparatedString(params['categories']);
    }

    // Handle legacy 'category' parameter for backwards compatibility
    if (params['category'] && !params['categories']) {
      state.filters.categories = [params['category']];
    }

    // Manufacturers
    if (params['manufacturers']) {
      state.filters.manufacturers = this.parseCommaSeparatedString(params['manufacturers']);
    }

    // Certificates
    if (params['certificates']) {
      state.filters.certificates = this.parseCommaSeparatedString(params['certificates']);
    }

    // Price range
    if (params['priceMin']) {
      const minPrice = this.parseNumber(params['priceMin']);
      if (minPrice !== null && minPrice >= 0) {
        state.filters.priceRange.min = minPrice;
      }
    }

    if (params['priceMax']) {
      const maxPrice = this.parseNumber(params['priceMax']);
      if (maxPrice !== null && maxPrice >= 0) {
        state.filters.priceRange.max = maxPrice;
      }
    }

    // Sort option
    if (params['sort']) {
      const sortOption = this.validateSortOption(params['sort']);
      if (sortOption) {
        state.sortOption = sortOption;
      }
    }

    // Current page
    if (params['page']) {
      const page = this.parseNumber(params['page']);
      if (page !== null && page >= 1) {
        state.currentPage = page;
      }
    }

    // Items per page
    if (params['itemsPerPage']) {
      const itemsPerPage = this.parseNumber(params['itemsPerPage']);
      if (itemsPerPage !== null && this.validateItemsPerPage(itemsPerPage)) {
        state.itemsPerPage = itemsPerPage;
      }
    }

    return state;
  }

  /**
   * Create a query parameters object that preserves current state for navigation
   */
  createStatePreservingParams(currentState: ProductListUrlState): Params {
    return this.serializeToQueryParams(currentState);
  }

  /**
   * Check if the current URL parameters represent a clean/empty state
   */
  isCleanState(params: Params): boolean {
    const significantParams = ['search', 'categories', 'category', 'manufacturers', 'certificates', 'priceMin', 'priceMax', 'sort', 'page', 'itemsPerPage'];
    return !significantParams.some(param => params[param]);
  }

  /**
   * Validate and clean query parameters
   */
  validateAndCleanParams(params: Params): Params {
    const cleanParams: Params = {};

    // Only include valid, non-empty parameters
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        switch (key) {
          case 'search':
            if (typeof value === 'string' && value.trim()) {
              cleanParams[key] = value.trim();
            }
            break;
          case 'categories':
          case 'manufacturers':
          case 'certificates':
            if (typeof value === 'string' && value.trim()) {
              const items = this.parseCommaSeparatedString(value);
              if (items.length > 0) {
                cleanParams[key] = items.join(',');
              }
            }
            break;
          case 'priceMin':
          case 'priceMax':
            const price = this.parseNumber(value);
            if (price !== null && price >= 0) {
              cleanParams[key] = price.toString();
            }
            break;
          case 'sort':
            if (this.validateSortOption(value)) {
              cleanParams[key] = value;
            }
            break;
          case 'page':
            const page = this.parseNumber(value);
            if (page !== null && page >= 1) {
              cleanParams[key] = page.toString();
            }
            break;
          case 'itemsPerPage':
            const itemsPerPage = this.parseNumber(value);
            if (itemsPerPage !== null && this.validateItemsPerPage(itemsPerPage)) {
              cleanParams[key] = itemsPerPage.toString();
            }
            break;
        }
      }
    });

    return cleanParams;
  }

  /**
   * Parse comma-separated string into array of trimmed, non-empty strings
   */
  private parseCommaSeparatedString(value: string): string[] {
    if (!value || typeof value !== 'string') {
      return [];
    }
    return value.split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Parse string to number with validation
   */
  private parseNumber(value: any): number | null {
    if (typeof value === 'number') {
      return isNaN(value) ? null : value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  /**
   * Validate sort option
   */
  private validateSortOption(value: any): SortOption | null {
    const validSortOptions: SortOption[] = ['featured', 'newest', 'name-asc', 'name-desc', 'price-low', 'price-high'];
    return validSortOptions.includes(value) ? value : null;
  }

  /**
   * Validate items per page
   */
  private validateItemsPerPage(value: number): boolean {
    const validOptions = [12, 30, 60];
    return validOptions.includes(value);
  }
}