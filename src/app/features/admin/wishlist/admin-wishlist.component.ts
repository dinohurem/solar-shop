import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, from } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

interface UserWishlistSummary {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    itemCount: number;
    lastUpdated: string;
}

interface WishlistItemDetail {
    id: string;
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    addedAt: string;
}

@Component({
    selector: 'app-admin-wishlist',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <!-- Page Header -->
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Wishlist Management</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">View and manage user wishlists</p>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="w-full overflow-hidden">
          <app-data-table
            title="User Wishlists"
            [data]="(userWishlists$ | async) || []"
            [config]="tableConfig"
            [loading]="(loading$ | async) || false"
            (actionClicked)="onTableAction($event)"
            (rowClicked)="onRowClick($event)">
          </app-data-table>
        </div>
      </div>
    </div>

    <!-- User Wishlist Details Modal -->
    <div *ngIf="selectedUserWishlist" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xl font-medium text-gray-900">
                {{ selectedUserWishlist.userName }}'s Wishlist
              </h3>
              <p class="text-sm text-gray-600 mt-1">{{ selectedUserWishlist.userEmail }}</p>
            </div>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Wishlist Items -->
          <div *ngIf="(wishlistItems$ | async)?.length; else noItems">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">
              Wishlist Items ({{ (wishlistItems$ | async)?.length }})
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let item of (wishlistItems$ | async)" 
                   class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <!-- Product Image -->
                <div class="aspect-w-1 aspect-h-1 mb-3">
                  <img [src]="item.productImage || '/assets/images/placeholder-product.jpg'" 
                       [alt]="item.productName"
                       class="w-full h-32 object-cover rounded-lg">
                </div>
                
                <!-- Product Info -->
                <div class="space-y-2">
                  <h5 class="font-semibold text-gray-900 text-sm">{{ item.productName }}</h5>
                  <p class="text-lg font-bold text-green-600">€{{ item.productPrice.toFixed(2) }}</p>
                  <p class="text-xs text-gray-500">Added: {{ formatDate(item.addedAt) }}</p>
                </div>
                
                <!-- Actions -->
                <div class="mt-3 flex space-x-2">
                  <button (click)="viewProduct(item.productId)" 
                          class="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    View Product
                  </button>
                  <button (click)="removeFromWishlist(item.id)" 
                          class="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Items State -->
          <ng-template #noItems>
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No wishlist items</h3>
              <p class="text-gray-600">This user hasn't added any items to their wishlist yet.</p>
            </div>
          </ng-template>

          <!-- Modal Footer -->
          <div class="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button (click)="closeModal()" 
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminWishlistComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    private title = inject(Title);

    private userWishlistsSubject = new BehaviorSubject<UserWishlistSummary[]>([]);
    private wishlistItemsSubject = new BehaviorSubject<WishlistItemDetail[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    userWishlists$ = this.userWishlistsSubject.asObservable();
    wishlistItems$ = this.wishlistItemsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    selectedUserWishlist: UserWishlistSummary | null = null;

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'userName',
                label: 'User Name',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'userEmail',
                label: 'Email',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'itemCount',
                label: 'Items',
                type: 'number',
                sortable: true
            },
            {
                key: 'lastUpdated',
                label: 'Last Updated',
                type: 'date',
                sortable: true
            }
        ],
        actions: [
            {
                label: 'View Details',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>',
                action: 'details',
                class: 'text-blue-600 hover:text-blue-900'
            },
            {
                label: 'Delete All',
                icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
                action: 'delete',
                class: 'text-red-600 hover:text-red-900'
            }
        ],
        searchable: true,
        sortable: true,
        paginated: true,
        pageSize: 20,
        allowCsvImport: false,
        allowExport: true,
        rowClickable: true
    };

    ngOnInit(): void {
        this.title.setTitle('Wishlist Management - Solar Shop Admin');
        this.loadUserWishlists();
    }

    onTableAction(event: { action: string, item: UserWishlistSummary }): void {
        const { action, item } = event;

        switch (action) {
            case 'details':
                this.viewWishlistDetails(item);
                break;
            case 'delete':
                this.deleteUserWishlist(item);
                break;
        }
    }

    onRowClick(item: UserWishlistSummary): void {
        this.viewWishlistDetails(item);
    }

    private async loadUserWishlists(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            // Get all wishlist items using direct client call
            const { data: wishlistData, error: wishlistError } = await this.supabaseService.client
                .from('wishlist')
                .select('*');

            if (wishlistError) {
                throw wishlistError;
            }

            if (!wishlistData || wishlistData.length === 0) {
                this.userWishlistsSubject.next([]);
                return;
            }

            // Get all users
            const users = await this.supabaseService.getTable('profiles');

            // Group wishlist items by user
            const userWishlistMap = new Map<string, any[]>();

            wishlistData.forEach((item: any) => {
                if (!userWishlistMap.has(item.user_id)) {
                    userWishlistMap.set(item.user_id, []);
                }
                userWishlistMap.get(item.user_id)!.push(item);
            });

            // Create summary data
            const summaries: UserWishlistSummary[] = [];

            userWishlistMap.forEach((items, userId) => {
                const user = users?.find((u: any) => u.user_id === userId);

                if (user) {
                    const lastUpdated = items.reduce((latest, current) => {
                        const currentDate = new Date(current.updated_at || current.created_at);
                        const latestDate = new Date(latest);
                        return currentDate > latestDate ? current.updated_at || current.created_at : latest;
                    }, items[0].created_at);

                    summaries.push({
                        id: `user_${userId}`,
                        userId: userId,
                        userName: user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.full_name || 'Unknown User',
                        userEmail: user.full_name || 'No email',
                        itemCount: items.length,
                        lastUpdated: lastUpdated
                    });
                }
            });

            // Sort by item count (descending)
            summaries.sort((a, b) => b.itemCount - a.itemCount);

            this.userWishlistsSubject.next(summaries);
        } catch (error) {
            console.error('Error loading user wishlists:', error);
            this.userWishlistsSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async viewWishlistDetails(userSummary: UserWishlistSummary): Promise<void> {
        this.selectedUserWishlist = userSummary;

        try {
            // Get wishlist items for this user using direct client call
            const { data: wishlistData, error: wishlistError } = await this.supabaseService.client
                .from('wishlist')
                .select('*')
                .eq('user_id', userSummary.userId);

            if (wishlistError) {
                throw wishlistError;
            }

            if (!wishlistData || wishlistData.length === 0) {
                this.wishlistItemsSubject.next([]);
                return;
            }

            // Load product details for each wishlist item
            const itemDetails: WishlistItemDetail[] = [];

            for (const wishlistItem of wishlistData) {
                try {
                    const products = await this.supabaseService.getTable('products', {
                        id: wishlistItem.product_id
                    });

                    const product = products && products.length > 0 ? products[0] : null;

                    if (product) {
                        // Get the first image from the images array
                        const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;

                        itemDetails.push({
                            id: wishlistItem.id,
                            productId: product.id,
                            productName: product.name || 'Unknown Product',
                            productPrice: product.price || 0,
                            productImage: firstImage?.url || '',
                            addedAt: wishlistItem.created_at
                        });
                    }
                } catch (productError) {
                    console.warn('Could not load product details for:', wishlistItem.product_id);
                    // Add item even if product details couldn't be loaded
                    itemDetails.push({
                        id: wishlistItem.id,
                        productId: wishlistItem.product_id,
                        productName: 'Product not found',
                        productPrice: 0,
                        productImage: '',
                        addedAt: wishlistItem.created_at
                    });
                }
            }

            this.wishlistItemsSubject.next(itemDetails);
        } catch (error) {
            console.error('Error loading wishlist details:', error);
            this.wishlistItemsSubject.next([]);
        }
    }

    closeModal(): void {
        this.selectedUserWishlist = null;
        this.wishlistItemsSubject.next([]);
    }

    viewProduct(productId: string): void {
        this.router.navigate(['/admin/products/edit', productId]);
    }

    async removeFromWishlist(wishlistItemId: string): Promise<void> {
        if (!confirm('Are you sure you want to remove this item from the wishlist?')) {
            return;
        }

        try {
            const { error } = await this.supabaseService.client
                .from('wishlist')
                .delete()
                .eq('id', wishlistItemId);

            if (error) {
                throw error;
            }

            // Refresh the current wishlist items
            if (this.selectedUserWishlist) {
                await this.viewWishlistDetails(this.selectedUserWishlist);

                // Update the summary count
                this.selectedUserWishlist.itemCount--;

                // Refresh the main list
                await this.loadUserWishlists();
            }

            alert('Item removed from wishlist successfully');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            alert('Error removing item from wishlist');
        }
    }

    private async deleteUserWishlist(userSummary: UserWishlistSummary): Promise<void> {
        if (!confirm(`Are you sure you want to delete all wishlist items for ${userSummary.userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            // Delete all wishlist items for this user using direct client call
            const { error } = await this.supabaseService.client
                .from('wishlist')
                .delete()
                .eq('user_id', userSummary.userId);

            if (error) {
                throw error;
            }

            // Close modal if it's open for this user
            if (this.selectedUserWishlist?.userId === userSummary.userId) {
                this.closeModal();
            }

            // Refresh the list
            await this.loadUserWishlists();

            alert(`All wishlist items deleted for ${userSummary.userName}`);
        } catch (error) {
            console.error('Error deleting user wishlist:', error);
            alert('Error deleting wishlist');
        }
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
} 