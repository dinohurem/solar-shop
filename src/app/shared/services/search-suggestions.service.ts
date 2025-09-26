import { Injectable, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { SupabaseService } from '../../services/supabase.service';

export interface SearchSuggestion {
  type: 'search' | 'filter' | 'category';
  value: string;
  displayText: string;
  timestamp: number;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchSuggestionsService {
  private translationService = inject(TranslationService);
  private supabaseService = inject(SupabaseService);
  private readonly STORAGE_KEY = 'search_suggestions';
  private readonly MAX_SUGGESTIONS = 10;
  private readonly MAX_AGE_DAYS = 30;

  /**
   * Add a search suggestion to both localStorage and global database
   */
  addSearchSuggestion(type: 'search' | 'filter' | 'category', value: string, displayText?: string): void {
    const normalizedValue = value.toLowerCase().trim();
    if (!normalizedValue) return;

    // Add to localStorage (for immediate user experience)
    this.addToLocalStorage(type, normalizedValue, displayText || value);

    // Add to global database (for cross-user suggestions)
    this.addToGlobalDatabase(type, normalizedValue, displayText || value);
  }

  /**
   * Add suggestion to localStorage for immediate user experience
   */
  private addToLocalStorage(type: 'search' | 'filter' | 'category', normalizedValue: string, displayText: string): void {
    const suggestions = this.getSuggestions();
    const existingIndex = suggestions.findIndex(s =>
      s.type === type && s.value.toLowerCase() === normalizedValue
    );

    const suggestion: SearchSuggestion = {
      type,
      value: normalizedValue,
      displayText,
      timestamp: Date.now(),
      count: existingIndex >= 0 ? suggestions[existingIndex].count + 1 : 1
    };

    if (existingIndex >= 0) {
      suggestions[existingIndex] = suggestion;
    } else {
      suggestions.push(suggestion);
    }

    suggestions.sort((a, b) => {
      if (a.count === b.count) {
        return b.timestamp - a.timestamp;
      }
      return b.count - a.count;
    });

    const trimmedSuggestions = suggestions.slice(0, this.MAX_SUGGESTIONS);
    this.saveSuggestions(trimmedSuggestions);
  }

  /**
   * Add suggestion to global database
   */
  private async addToGlobalDatabase(type: 'search' | 'filter' | 'category', normalizedValue: string, displayText: string): Promise<void> {
    try {
      // First try to update existing record
      const { data: existing } = await this.supabaseService.client
        .from('global_search_suggestions')
        .select('*')
        .eq('type', type)
        .eq('value', normalizedValue)
        .single();

      if (existing) {
        // Update existing record
        await this.supabaseService.client
          .from('global_search_suggestions')
          .update({
            count: existing.count + 1,
            display_text: displayText
          })
          .eq('id', existing.id);
      } else {
        // Insert new record
        await this.supabaseService.client
          .from('global_search_suggestions')
          .insert({
            type,
            value: normalizedValue,
            display_text: displayText,
            count: 1
          });
      }
    } catch (error) {
      console.error('Error adding global search suggestion:', error);
    }
  }

  /**
   * Get suggestions filtered by type and search query
   */
  getSuggestionsByQuery(query: string = '', types?: ('search' | 'filter' | 'category')[]): SearchSuggestion[] {
    const suggestions = this.getSuggestions();
    const normalizedQuery = query.toLowerCase().trim();

    let filtered = suggestions;

    // Filter by types if specified
    if (types && types.length > 0) {
      filtered = filtered.filter(s => types.includes(s.type));
    }

    // Filter by query if provided
    if (normalizedQuery) {
      filtered = filtered.filter(s =>
        s.value.toLowerCase().includes(normalizedQuery) ||
        s.displayText.toLowerCase().includes(normalizedQuery)
      );
    }

    // Remove old suggestions
    const cutoffTime = Date.now() - (this.MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(s => s.timestamp > cutoffTime);

    return filtered.slice(0, 8); // Limit display suggestions
  }

  /**
   * Get popular search suggestions (most used globally)
   */
  async getPopularSuggestions(limit: number = 5): Promise<SearchSuggestion[]> {
    try {
      // First try to get truly popular suggestions (count >= 2)
      let { data } = await this.supabaseService.client
        .from('global_search_suggestions')
        .select('*')
        .gte('count', 2)
        .order('count', { ascending: false })
        .limit(limit);

      // If no popular suggestions found, get any suggestions with count >= 1
      if (!data || data.length === 0) {
        const { data: fallbackData } = await this.supabaseService.client
          .from('global_search_suggestions')
          .select('*')
          .gte('count', 1)
          .order('count', { ascending: false })
          .limit(limit);
        data = fallbackData;
      }

      // If still no data, seed with default popular categories
      if (!data || data.length === 0) {
        await this.seedPopularSuggestions();

        // Try once more after seeding
        const { data: seededData } = await this.supabaseService.client
          .from('global_search_suggestions')
          .select('*')
          .gte('count', 1)
          .order('count', { ascending: false })
          .limit(limit);
        data = seededData;
      }

      return (data || []).map(item => ({
        type: item.type as 'search' | 'filter' | 'category',
        value: item.value,
        displayText: item.display_text,
        timestamp: new Date(item.updated_at).getTime(),
        count: item.count
      }));
    } catch (error) {
      console.error('Error fetching popular suggestions:', error);
      // Fallback to localStorage
      const suggestions = this.getSuggestions();
      return suggestions
        .filter(s => s.count >= 1) // Lowered threshold for fallback too
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }
  }

  /**
   * Get recent search suggestions (globally)
   */
  async getRecentSuggestions(limit: number = 5): Promise<SearchSuggestion[]> {
    try {
      const { data } = await this.supabaseService.client
        .from('global_search_suggestions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit);

      return (data || []).map(item => ({
        type: item.type as 'search' | 'filter' | 'category',
        value: item.value,
        displayText: item.display_text,
        timestamp: new Date(item.updated_at).getTime(),
        count: item.count
      }));
    } catch (error) {
      console.error('Error fetching recent suggestions:', error);
      // Fallback to localStorage
      const suggestions = this.getSuggestions();
      return suggestions
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    }
  }

  /**
   * Get default category suggestions based on current language
   */
  getDefaultCategorySuggestions(): SearchSuggestion[] {
    const timestamp = Date.now();
    return [
      {
        type: 'category',
        value: 'solar-panels',
        displayText: this.translationService.translate('search.solarPanels'),
        timestamp,
        count: 1
      },
      {
        type: 'category',
        value: 'inverters',
        displayText: this.translationService.translate('search.inverters'),
        timestamp,
        count: 1
      },
      {
        type: 'category',
        value: 'batteries',
        displayText: this.translationService.translate('search.batteries'),
        timestamp,
        count: 1
      },
      {
        type: 'category',
        value: 'klima-uredaji',
        displayText: 'Klima uređaji',
        timestamp,
        count: 1
      },
      {
        type: 'category',
        value: 'peci',
        displayText: 'Peći',
        timestamp,
        count: 1
      }
    ];
  }

  /**
   * Clear all suggestions
   */
  clearSuggestions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Clear old suggestions (older than MAX_AGE_DAYS)
   */
  clearOldSuggestions(): void {
    const suggestions = this.getSuggestions();
    const cutoffTime = Date.now() - (this.MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

    const validSuggestions = suggestions.filter(s => s.timestamp > cutoffTime);
    this.saveSuggestions(validSuggestions);
  }

  /**
   * Seed popular suggestions with default categories
   */
  private async seedPopularSuggestions(): Promise<void> {
    try {
      const defaultSuggestions = [
        {
          type: 'category',
          value: 'solar-panels',
          display_text: this.translationService.translate('search.solarPanels'),
          count: 3
        },
        {
          type: 'category',
          value: 'inverters',
          display_text: this.translationService.translate('search.inverters'),
          count: 3
        },
        {
          type: 'category',
          value: 'batteries',
          display_text: this.translationService.translate('search.batteries'),
          count: 2
        },
        {
          type: 'category',
          value: 'klima-uredaji',
          display_text: 'Klima uređaji',
          count: 2
        },
        {
          type: 'category',
          value: 'peci',
          display_text: 'Peći',
          count: 2
        }
      ];

      // Insert the seeded suggestions
      for (const suggestion of defaultSuggestions) {
        await this.supabaseService.client
          .from('global_search_suggestions')
          .upsert(suggestion);
      }
    } catch (error) {
      console.error('Error seeding popular suggestions:', error);
    }
  }

  private getSuggestions(): SearchSuggestion[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading search suggestions from localStorage:', error);
      return [];
    }
  }

  private saveSuggestions(suggestions: SearchSuggestion[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(suggestions));
    } catch (error) {
      console.error('Error saving search suggestions to localStorage:', error);
    }
  }
}