import { Injectable, inject } from '@angular/core';
import { TranslationService } from './translation.service';

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
  private readonly STORAGE_KEY = 'search_suggestions';
  private readonly MAX_SUGGESTIONS = 10;
  private readonly MAX_AGE_DAYS = 30;

  /**
   * Add a search suggestion to localStorage
   */
  addSearchSuggestion(type: 'search' | 'filter' | 'category', value: string, displayText?: string): void {
    const suggestions = this.getSuggestions();
    const normalizedValue = value.toLowerCase().trim();

    if (!normalizedValue) return;

    const existingIndex = suggestions.findIndex(s =>
      s.type === type && s.value.toLowerCase() === normalizedValue
    );

    const suggestion: SearchSuggestion = {
      type,
      value: normalizedValue,
      displayText: displayText || value,
      timestamp: Date.now(),
      count: existingIndex >= 0 ? suggestions[existingIndex].count + 1 : 1
    };

    if (existingIndex >= 0) {
      // Update existing suggestion
      suggestions[existingIndex] = suggestion;
    } else {
      // Add new suggestion
      suggestions.push(suggestion);
    }

    // Sort by count (descending) and then by timestamp (most recent first)
    suggestions.sort((a, b) => {
      if (a.count === b.count) {
        return b.timestamp - a.timestamp;
      }
      return b.count - a.count;
    });

    // Keep only the most relevant suggestions
    const trimmedSuggestions = suggestions.slice(0, this.MAX_SUGGESTIONS);

    this.saveSuggestions(trimmedSuggestions);
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
   * Get popular search suggestions (most used)
   */
  getPopularSuggestions(limit: number = 5): SearchSuggestion[] {
    const suggestions = this.getSuggestions();

    return suggestions
      .filter(s => s.count > 1) // Only show frequently used
      .slice(0, limit);
  }

  /**
   * Get recent search suggestions
   */
  getRecentSuggestions(limit: number = 5): SearchSuggestion[] {
    const suggestions = this.getSuggestions();

    return suggestions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
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
        value: 'mounting-systems',
        displayText: this.translationService.translate('search.mountingSystems'),
        timestamp,
        count: 1
      },
      {
        type: 'category',
        value: 'cables',
        displayText: this.translationService.translate('search.cables'),
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