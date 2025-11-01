import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SupabaseService } from '../../services/supabase.service';

export interface AppSettings {
  id?: string;
  credit_card_payment_enabled: boolean;
  updated_at?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private supabaseService = inject(SupabaseService);
  private settingsSubject = new BehaviorSubject<AppSettings>({ credit_card_payment_enabled: true });

  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    // Load settings on service initialization
    this.loadSettings();
  }

  /**
   * Load settings from database
   */
  async loadSettings(): Promise<void> {
    try {
      // First, get all settings to see what we have
      const { data: allSettings, error: selectError } = await this.supabaseService.client
        .from('settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectError) {
        console.error('[Settings] Error loading settings:', selectError);
        return;
      }

      console.log('[Settings] Found settings records:', allSettings);

      // If no settings exist, create default
      if (!allSettings || allSettings.length === 0) {
        console.log('[Settings] No settings found, creating default...');
        await this.createDefaultSettings();
        return;
      }

      // Use the most recent settings record
      const latestSettings = allSettings[0];
      this.settingsSubject.next(latestSettings);
      console.log('[Settings] Loaded latest settings:', latestSettings);

      // If there are multiple settings records, warn about it
      if (allSettings.length > 1) {
        console.warn('[Settings] Multiple settings records found. Using the most recent one. Consider cleaning up old records.');
      }
    } catch (error) {
      console.error('[Settings] Error loading settings:', error);
    }
  }

  /**
   * Create default settings
   */
  private async createDefaultSettings(): Promise<void> {
    try {
      const defaultSettings: AppSettings = {
        credit_card_payment_enabled: true
      };

      const { data, error } = await this.supabaseService.client
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (error) {
        console.error('[Settings] Error creating default settings:', error);
        return;
      }

      if (data) {
        this.settingsSubject.next(data);
        console.log('[Settings] Created default settings:', data);
      }
    } catch (error) {
      console.error('[Settings] Error creating default settings:', error);
    }
  }

  /**
   * Update credit card payment enabled setting
   */
  async updateCreditCardPaymentEnabled(enabled: boolean): Promise<boolean> {
    try {
      // ALWAYS reload settings from database first to get current ID
      console.log('[Settings] Reloading settings from database before update...');
      await this.loadSettings();

      const currentSettings = this.settingsSubject.value;
      console.log('[Settings] Current settings after reload:', currentSettings);

      // If we have an ID, use update. Otherwise, use insert
      if (currentSettings.id) {
        const { data, error } = await this.supabaseService.client
          .from('settings')
          .update({
            credit_card_payment_enabled: enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSettings.id)
          .select()
          .single();

        if (error) {
          console.error('[Settings] Error updating credit card payment setting:', error);
          return false;
        }

        if (data) {
          this.settingsSubject.next(data);
          console.log('[Settings] Updated credit card payment enabled:', enabled);
          return true;
        }
      } else {
        // No settings exist yet, create new one
        const { data, error } = await this.supabaseService.client
          .from('settings')
          .insert({
            credit_card_payment_enabled: enabled
          })
          .select()
          .single();

        if (error) {
          console.error('[Settings] Error creating settings:', error);
          return false;
        }

        if (data) {
          this.settingsSubject.next(data);
          console.log('[Settings] Created settings with credit card payment:', enabled);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[Settings] Error updating credit card payment setting:', error);
      return false;
    }
  }

  /**
   * Get current settings
   */
  getCurrentSettings(): AppSettings {
    return this.settingsSubject.value;
  }

  /**
   * Check if credit card payment is enabled
   */
  isCreditCardPaymentEnabled(): boolean {
    return this.settingsSubject.value.credit_card_payment_enabled;
  }
}
