import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from '../../services/supabase.service';
import { TranslationService } from './translation.service';

export interface SortField {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SortOption {
  id?: string;
  code: string;
  label_hr: string;
  label_en: string;
  field: string; // Legacy single field (kept for backwards compatibility)
  direction: 'asc' | 'desc'; // Legacy single direction
  sort_fields: SortField[]; // New multi-field sorting
  is_default: boolean;
  is_enabled: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface SortOptionDisplay {
  code: string;
  label: string;
  sortFields: SortField[]; // Multiple sort fields
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SortOptionsService {
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);

  private sortOptionsSubject = new BehaviorSubject<SortOption[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public sortOptions$ = this.sortOptionsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  // Observable that returns enabled sort options with translated labels
  public enabledSortOptions$: Observable<SortOptionDisplay[]> = this.sortOptions$.pipe(
    map(options => this.getEnabledSortOptionsWithLabels(options))
  );

  constructor() {
    // Load sort options on service initialization
    this.loadSortOptions();

    // Re-calculate labels when language changes
    this.translationService.currentLanguage$.subscribe(() => {
      // Trigger re-emit to update labels
      const currentOptions = this.sortOptionsSubject.value;
      this.sortOptionsSubject.next([...currentOptions]);
    });
  }

  /**
   * Load all sort options from database
   */
  async loadSortOptions(): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const { data, error } = await this.supabaseService.client
        .from('sort_options')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('[SortOptions] Error loading sort options:', error);
        // Use default options if database fails
        this.sortOptionsSubject.next(this.getDefaultSortOptions());
        return;
      }

      if (data && data.length > 0) {
        this.sortOptionsSubject.next(data);
        console.log('[SortOptions] Loaded sort options:', data);
      } else {
        // No options in database, use defaults
        this.sortOptionsSubject.next(this.getDefaultSortOptions());
        console.log('[SortOptions] Using default sort options');
      }
    } catch (error) {
      console.error('[SortOptions] Error loading sort options:', error);
      this.sortOptionsSubject.next(this.getDefaultSortOptions());
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Get enabled sort options with translated labels
   */
  private getEnabledSortOptionsWithLabels(options: SortOption[]): SortOptionDisplay[] {
    const currentLang = this.translationService.getCurrentLanguage();
    return options
      .filter(opt => opt.is_enabled)
      .sort((a, b) => a.display_order - b.display_order)
      .map(opt => ({
        code: opt.code,
        label: currentLang === 'en' ? opt.label_en : opt.label_hr,
        sortFields: opt.sort_fields && opt.sort_fields.length > 0
          ? opt.sort_fields
          : [{ field: opt.field, direction: opt.direction }], // Fallback to legacy single field
        isDefault: opt.is_default
      }));
  }

  /**
   * Get the default sort option code
   */
  getDefaultSortOptionCode(): string {
    const options = this.sortOptionsSubject.value;
    const defaultOption = options.find(opt => opt.is_default && opt.is_enabled);
    return defaultOption?.code || 'featured';
  }

  /**
   * Get all sort options (including disabled)
   */
  getAllSortOptions(): SortOption[] {
    return this.sortOptionsSubject.value;
  }

  /**
   * Get enabled sort options with labels for the current language
   */
  getEnabledSortOptions(): SortOptionDisplay[] {
    return this.getEnabledSortOptionsWithLabels(this.sortOptionsSubject.value);
  }

  /**
   * Create a new sort option
   */
  async createSortOption(sortOption: Omit<SortOption, 'id' | 'created_at' | 'updated_at'>): Promise<SortOption | null> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('sort_options')
        .insert([sortOption])
        .select()
        .single();

      if (error) {
        console.error('[SortOptions] Error creating sort option:', error);
        return null;
      }

      if (data) {
        await this.loadSortOptions();
        console.log('[SortOptions] Created sort option:', data);
        return data;
      }

      return null;
    } catch (error) {
      console.error('[SortOptions] Error creating sort option:', error);
      return null;
    }
  }

  /**
   * Update an existing sort option
   */
  async updateSortOption(id: string, updates: Partial<SortOption>): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('sort_options')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('[SortOptions] Error updating sort option:', error);
        return false;
      }

      await this.loadSortOptions();
      console.log('[SortOptions] Updated sort option:', id);
      return true;
    } catch (error) {
      console.error('[SortOptions] Error updating sort option:', error);
      return false;
    }
  }

  /**
   * Delete a sort option
   */
  async deleteSortOption(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('sort_options')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[SortOptions] Error deleting sort option:', error);
        return false;
      }

      await this.loadSortOptions();
      console.log('[SortOptions] Deleted sort option:', id);
      return true;
    } catch (error) {
      console.error('[SortOptions] Error deleting sort option:', error);
      return false;
    }
  }

  /**
   * Set a sort option as default
   */
  async setDefaultSortOption(id: string): Promise<boolean> {
    try {
      // The database trigger will handle unsetting other defaults
      const { error } = await this.supabaseService.client
        .from('sort_options')
        .update({ is_default: true })
        .eq('id', id);

      if (error) {
        console.error('[SortOptions] Error setting default sort option:', error);
        return false;
      }

      await this.loadSortOptions();
      console.log('[SortOptions] Set default sort option:', id);
      return true;
    } catch (error) {
      console.error('[SortOptions] Error setting default sort option:', error);
      return false;
    }
  }

  /**
   * Toggle sort option enabled state
   */
  async toggleSortOptionEnabled(id: string, enabled: boolean): Promise<boolean> {
    return this.updateSortOption(id, { is_enabled: enabled });
  }

  /**
   * Update display order for multiple sort options
   */
  async updateDisplayOrder(updates: { id: string; display_order: number }[]): Promise<boolean> {
    try {
      for (const update of updates) {
        const { error } = await this.supabaseService.client
          .from('sort_options')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) {
          console.error('[SortOptions] Error updating display order:', error);
          return false;
        }
      }

      await this.loadSortOptions();
      console.log('[SortOptions] Updated display order');
      return true;
    } catch (error) {
      console.error('[SortOptions] Error updating display order:', error);
      return false;
    }
  }

  /**
   * Get default sort options (fallback when database is unavailable)
   */
  private getDefaultSortOptions(): SortOption[] {
    return [
      { code: 'featured', label_hr: 'Istaknuto', label_en: 'Featured', field: 'is_featured', direction: 'desc', sort_fields: [{ field: 'is_featured', direction: 'desc' }, { field: 'created_at', direction: 'desc' }], is_default: true, is_enabled: true, display_order: 0 },
      { code: 'newest', label_hr: 'Najnovije', label_en: 'Newest Arrivals', field: 'created_at', direction: 'desc', sort_fields: [{ field: 'created_at', direction: 'desc' }], is_default: false, is_enabled: true, display_order: 1 },
      { code: 'name-asc', label_hr: 'Naziv A-Ž', label_en: 'Name A-Z', field: 'name', direction: 'asc', sort_fields: [{ field: 'name', direction: 'asc' }], is_default: false, is_enabled: true, display_order: 2 },
      { code: 'name-desc', label_hr: 'Naziv Ž-A', label_en: 'Name Z-A', field: 'name', direction: 'desc', sort_fields: [{ field: 'name', direction: 'desc' }], is_default: false, is_enabled: true, display_order: 3 },
      { code: 'price-low', label_hr: 'Cijena: od najniže', label_en: 'Price: Low to High', field: 'price', direction: 'asc', sort_fields: [{ field: 'price', direction: 'asc' }], is_default: false, is_enabled: true, display_order: 4 },
      { code: 'price-high', label_hr: 'Cijena: od najviše', label_en: 'Price: High to Low', field: 'price', direction: 'desc', sort_fields: [{ field: 'price', direction: 'desc' }], is_default: false, is_enabled: true, display_order: 5 }
    ];
  }

  /**
   * Get available field options for creating sort options
   */
  getAvailableFields(): { value: string; label_hr: string; label_en: string }[] {
    return [
      { value: 'name', label_hr: 'Naziv', label_en: 'Name' },
      { value: 'price', label_hr: 'Cijena', label_en: 'Price' },
      { value: 'created_at', label_hr: 'Datum', label_en: 'Date' },
      { value: 'brand', label_hr: 'Proizvođač', label_en: 'Manufacturer' },
      { value: 'is_featured', label_hr: 'Istaknuto', label_en: 'Featured' },
      { value: 'stock_quantity', label_hr: 'Zalihe', label_en: 'Stock' }
    ];
  }
}
