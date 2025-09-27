import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { filter, take } from 'rxjs/operators';

export interface NotificationCounts {
  orders: number;
  partnerOrders: number;
  contacts: number;
  users: number;
  wishlists: number;
  companies: number;
  reviews: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationsService {
  private supabaseService = inject(SupabaseService);
  private store = inject(Store);
  private currentAdminId: string | null = null;

  private notificationCounts$ = new BehaviorSubject<NotificationCounts>({
    orders: 0,
    partnerOrders: 0,
    contacts: 0,
    users: 0,
    wishlists: 0,
    companies: 0,
    reviews: 0
  });

  constructor() {
    // Get current admin ID
    this.store.select(selectCurrentUser).pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.currentAdminId = user!.id;
    });

    // Refresh counts every 30 seconds
    timer(0, 30000).pipe(
      switchMap(() => this.fetchAllCounts()),
      catchError(error => {
        console.error('Error fetching notification counts:', error);
        return [this.notificationCounts$.value];
      })
    ).subscribe(counts => {
      this.notificationCounts$.next(counts);
    });
  }

  getNotificationCounts(): Observable<NotificationCounts> {
    return this.notificationCounts$.asObservable();
  }

  async refreshCounts(): Promise<void> {
    try {
      const counts = await this.fetchAllCounts();
      this.notificationCounts$.next(counts);
    } catch (error) {
      console.error('Error refreshing notification counts:', error);
    }
  }

  /**
   * Mark a section as viewed by updating the last_viewed_at timestamp
   */
  async markSectionAsViewed(section: 'orders' | 'partner_orders' | 'contacts' | 'users' | 'companies' | 'wishlists' | 'reviews'): Promise<void> {
    if (!this.currentAdminId) return;

    try {
      await this.supabaseService.client
        .from('admin_last_viewed')
        .upsert({
          admin_id: this.currentAdminId,
          section: section,
          last_viewed_at: new Date().toISOString()
        }, { onConflict: 'admin_id,section' });

      // Refresh counts after marking section as viewed
      await this.refreshCounts();
    } catch (error) {
      console.error('Error marking section as viewed:', error);
    }
  }

  /**
   * Get the last viewed timestamp for a section
   */
  private async getLastViewedTimestamp(section: string): Promise<string | null> {
    if (!this.currentAdminId) return null;

    try {
      const { data } = await this.supabaseService.client
        .from('admin_last_viewed')
        .select('last_viewed_at')
        .eq('admin_id', this.currentAdminId)
        .eq('section', section)
        .single();

      return data?.last_viewed_at || null;
    } catch (error) {
      // If no record exists, return null (will count all items)
      return null;
    }
  }

  private async fetchAllCounts(): Promise<NotificationCounts> {
    try {
      const [
        orders,
        partnerOrders,
        contacts,
        users,
        wishlists,
        companies,
        reviews
      ] = await Promise.all([
        this.getOrdersCount(),
        this.getPartnerOrdersCount(),
        this.getContactsCount(),
        this.getUsersCount(),
        this.getWishlistsCount(),
        this.getCompaniesCount(),
        this.getReviewsCount()
      ]);

      return {
        orders,
        partnerOrders,
        contacts,
        users,
        wishlists,
        companies,
        reviews
      };
    } catch (error) {
      console.error('Error fetching counts:', error);
      return {
        orders: 0,
        partnerOrders: 0,
        contacts: 0,
        users: 0,
        wishlists: 0,
        companies: 0,
        reviews: 0
      };
    }
  }

  private async getOrdersCount(): Promise<number> {
    try {
      if (!this.currentAdminId) return 0;

      const lastViewed = await this.getLastViewedTimestamp('orders');

      const query = this.supabaseService.client
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('is_b2b', false); // B2C orders only

      if (lastViewed) {
        query.gt('created_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error fetching orders count:', error);
      return 0;
    }
  }

  private async getPartnerOrdersCount(): Promise<number> {
    try {
      if (!this.currentAdminId) return 0;

      const lastViewed = await this.getLastViewedTimestamp('partner_orders');

      const query = this.supabaseService.client
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('is_b2b', true); // B2B orders only

      if (lastViewed) {
        query.gt('created_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error fetching partner orders count:', error);
      return 0;
    }
  }

  private async getContactsCount(): Promise<number> {
    try {
      if (!this.currentAdminId) return 0;

      const lastViewed = await this.getLastViewedTimestamp('contacts');

      const query = this.supabaseService.client
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      if (lastViewed) {
        query.gt('created_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error fetching contacts count:', error);
      return 0;
    }
  }

  private async getUsersCount(): Promise<number> {
    try {
      if (!this.currentAdminId) return 0;

      const lastViewed = await this.getLastViewedTimestamp('users');

      // If never viewed, only show users from last 7 days to avoid overwhelming count
      const compareDate = lastViewed || (() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sevenDaysAgo.toISOString();
      })();

      const { count } = await this.supabaseService.client
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', compareDate);

      return count || 0;
    } catch (error) {
      console.error('Error fetching users count:', error);
      return 0;
    }
  }

  private async getWishlistsCount(): Promise<number> {
    try {
      if (!this.currentAdminId) return 0;

      const lastViewed = await this.getLastViewedTimestamp('wishlists');

      const query = this.supabaseService.client
        .from('wishlist_items')
        .select('*', { count: 'exact', head: true });

      if (lastViewed) {
        query.gt('created_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error fetching wishlists count:', error);
      return 0;
    }
  }

  private async getCompaniesCount(): Promise<number> {
    try {
      if (!this.currentAdminId) return 0;

      const lastViewed = await this.getLastViewedTimestamp('companies');

      const query = this.supabaseService.client
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (lastViewed) {
        query.gt('created_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error fetching companies count:', error);
      return 0;
    }
  }

  private async getReviewsCount(): Promise<number> {
    try {
      if (!this.currentAdminId) return 0;

      const lastViewed = await this.getLastViewedTimestamp('reviews');

      const query = this.supabaseService.client
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (lastViewed) {
        query.gt('created_at', lastViewed);
      }

      const { count } = await query;
      return count || 0;
    } catch (error) {
      console.error('Error fetching reviews count:', error);
      return 0;
    }
  }
}