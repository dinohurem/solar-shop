import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { ProductFilters, PaginationState } from '../../../shared/store/products.reducer';

export interface B2BProductListUrlState {
  filters: ProductFilters;
  currentPage: number;
  itemsPerPage: number;
}

export type SortOption = 'newest' | 'name-asc' | 'name-desc' | 'price-low' | 'price-high' | 'featured';

@Injectable({
  providedIn: 'root'
})
export class B2BProductsUrlStateService {

  /**
   * Serialize the current state to URL query parameters
   */
  serializeToQueryParams(state: B2BProductListUrlState): Params {
    const params: Params = {};

    // Search query
    if (state.filters.searchQuery && state.filters.searchQuery.trim()) {
      params['search'] = state.filters.searchQuery.trim();
    }

    // Categories (comma-separated)
    if (state.filters.categories && state.filters.categories.length > 0) {
      params['categories'] = state.filters.categories.join(',');
    }

    // Manufacturers (comma-separated)
    if (state.filters.manufacturers && state.filters.manufacturers.length > 0) {
      params['manufacturers'] = state.filters.manufacturers.join(',');
    }

    // Availability
    if (state.filters.availability && state.filters.availability !== '') {
      params['availability'] = state.filters.availability;
    }

    // Sort option (only if not default)
    if (state.filters.sortBy && state.filters.sortBy !== 'featured') {
      params['sort'] = state.filters.sortBy;
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
  deserializeFromQueryParams(params: Params): Partial<B2BProductListUrlState> {
    const state: Partial<B2BProductListUrlState> = {};

    // Initialize filters object
    state.filters = {
      categories: [],
      manufacturers: [],
      searchQuery: '',
      availability: '',
      sortBy: 'featured'
    };

    // Search query
    if (params['search']) {
      state.filters.searchQuery = params['search'];
    }

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

    // Availability
    if (params['availability']) {
      const availability = this.validateAvailability(params['availability']);
      if (availability) {
        state.filters.availability = availability;
      }
    }

    // Sort option
    if (params['sort']) {
      const sortOption = this.validateSortOption(params['sort']);
      if (sortOption) {
        state.filters.sortBy = sortOption;
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
  createStatePreservingParams(currentState: B2BProductListUrlState): Params {
    return this.serializeToQueryParams(currentState);
  }

  /**
   * Check if the current URL parameters represent a clean/empty state
   */
  isCleanState(params: Params): boolean {
    const significantParams = ['search', 'categories', 'category', 'manufacturers', 'availability', 'sort', 'page', 'itemsPerPage'];
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
            if (typeof value === 'string' && value.trim()) {
              const items = this.parseCommaSeparatedString(value);
              if (items.length > 0) {
                cleanParams[key] = items.join(',');
              }
            }
            break;
          case 'availability':
            if (this.validateAvailability(value)) {
              cleanParams[key] = value;
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
   * Validate availability option
   */
  private validateAvailability(value: any): string | null {
    const validAvailabilityOptions = ['', 'in-stock', 'low-stock', 'out-of-stock'];
    return validAvailabilityOptions.includes(value) ? value : null;
  }

  /**
   * Validate items per page
   */
  private validateItemsPerPage(value: number): boolean {
    const validOptions = [12, 30, 60];
    return validOptions.includes(value);
  }
}