import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, timer } from 'rxjs';
import { map, switchMap, catchError, startWith } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';

export interface NotificationCounts {
  orders: number;
  partnerOrders: number;
  contacts: number;
  users: number;
  wishlists: number;
  companies: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationsService {
  private supabaseService = inject(SupabaseService);

  private notificationCounts$ = new BehaviorSubject<NotificationCounts>({
    orders: 0,
    partnerOrders: 0,
    contacts: 0,
    users: 0,
    wishlists: 0,
    companies: 0
  });

  constructor() {
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

  private async fetchAllCounts(): Promise<NotificationCounts> {
    try {
      const [
        pendingOrders,
        pendingPartnerOrders,
        unreadContacts,
        newUsers,
        activeWishlists,
        pendingCompanies
      ] = await Promise.all([
        this.getNewOrdersCount(),
        this.getNewPartnerOrdersCount(),
        this.getUnreadContactsCount(),
        this.getNewUsersCount(),
        this.getActiveWishlistsCount(),
        this.getPendingCompaniesCount()
      ]);

      return {
        orders: pendingOrders,
        partnerOrders: pendingPartnerOrders,
        contacts: unreadContacts,
        users: newUsers,
        wishlists: activeWishlists,
        companies: pendingCompanies
      };
    } catch (error) {
      console.error('Error fetching counts:', error);
      return {
        orders: 0,
        partnerOrders: 0,
        contacts: 0,
        users: 0,
        wishlists: 0,
        companies: 0
      };
    }
  }

  private async getNewOrdersCount(): Promise<number> {
    try {
      // Count orders with status 'pending' from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count } = await this.supabaseService['supabase']
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('created_at', sevenDaysAgo.toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error fetching new orders count:', error);
      return 0;
    }
  }

  private async getNewPartnerOrdersCount(): Promise<number> {
    try {
      // Count B2B orders with status 'pending' from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count } = await this.supabaseService['supabase']
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .not('company_id', 'is', null)
        .gte('created_at', sevenDaysAgo.toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error fetching new partner orders count:', error);
      return 0;
    }
  }

  private async getUnreadContactsCount(): Promise<number> {
    try {
      // Count unread contact messages
      const { count } = await this.supabaseService['supabase']
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread contacts count:', error);
      return 0;
    }
  }

  private async getNewUsersCount(): Promise<number> {
    try {
      // Count users registered in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count } = await this.supabaseService['supabase']
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      return count || 0;
    } catch (error) {
      console.error('Error fetching new users count:', error);
      return 0;
    }
  }

  private async getActiveWishlistsCount(): Promise<number> {
    try {
      // Count non-empty wishlists
      const { count } = await this.supabaseService['supabase']
        .from('wishlist_items')
        .select('user_id', { count: 'exact', head: true });

      return count || 0;
    } catch (error) {
      console.error('Error fetching active wishlists count:', error);
      return 0;
    }
  }

  private async getPendingCompaniesCount(): Promise<number> {
    try {
      // Count companies with status 'pending' approval
      const { count } = await this.supabaseService['supabase']
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return count || 0;
    } catch (error) {
      console.error('Error fetching pending companies count:', error);
      return 0;
    }
  }
}