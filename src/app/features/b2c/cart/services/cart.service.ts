import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map, catchError, of, take } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';
import { CartItem, Cart } from '../../../../shared/models/cart.model';
import { Coupon } from '../../../../shared/models/coupon.model';
import { Store } from '@ngrx/store';
import * as CartActions from '../store/cart.actions';

export interface CartSummary {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    itemCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    private cartSummary = new BehaviorSubject<CartSummary>({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
    });
    private isAuthenticated = false;
    private currentUserId: string | null = null;

    private store = inject(Store);

    constructor(private supabaseService: SupabaseService) { }

    // Initialize cart based on authentication status
    async initializeCart(): Promise<void> {
        try {
            console.log('CartService - initializeCart started');
            const user = await this.supabaseService.getCurrentUser().pipe(
                map(user => {
                    this.store.dispatch(CartActions.stopCartLoading());
                    return user;
                }),
                catchError((error) => {
                    return of(null);
                })
            ).toPromise();

            this.isAuthenticated = !!user;
            this.currentUserId = user?.id || null;

            if (this.isAuthenticated && this.currentUserId) {
                await this.loadCartFromSupabase();
            } else {
                // For guest users, start with empty cart
                this.updateCartItems([]);
            }
        } catch (error) {
            console.error('Error initializing cart:', error);
            this.updateCartItems([]);
        }
    }

    // Handle user login - migrate guest cart to Supabase
    async handleUserLogin(userId: string): Promise<void> {
        try {
            this.isAuthenticated = true;
            this.currentUserId = userId;

            // Load user's existing cart from Supabase
            await this.loadCartFromSupabase();
        } catch (error) {
            console.error('Error handling user login:', error);
            await this.loadCartFromSupabase();
        }
    }

    // Handle user logout - clear cart
    async handleUserLogout(): Promise<void> {
        this.isAuthenticated = false;
        this.currentUserId = null;
        this.updateCartItems([]);
    }

    // Observable streams
    getCartItems(): Observable<CartItem[]> {
        return this.cartItems.asObservable();
    }

    getCartSummary(): Observable<CartSummary> {
        return this.cartSummary.asObservable();
    }

    // Load cart - returns a Cart object for NgRx compatibility
    loadCart(): Observable<Cart> {
        return this.cartItems.pipe(
            map(items => {
                return this.createCartFromItems(items);
            }),
            catchError(error => {
                return of(this.createCartFromItems([]));
            })
        );
    }

    // Add item to cart - returns Cart for NgRx compatibility
    addToCart(productId: string, quantity: number = 1, variantId?: string): Observable<Cart> {
        return from(this.addToCartAsync(productId, quantity)).pipe(
            map(() => this.createCartFromItems(this.getCartItemsArray())),
            catchError(error => {
                console.error('Error adding to cart:', error);
                return of(this.createCartFromItems(this.getCartItemsArray()));
            })
        );
    }

    // Update cart item - returns Cart for NgRx compatibility
    updateCartItem(itemId: string, quantity: number): Observable<Cart> {
        return from(this.updateCartItemAsync(itemId, quantity)).pipe(
            map(() => this.createCartFromItems(this.getCartItemsArray())),
            catchError(error => {
                console.error('Error updating cart item:', error);
                return of(this.createCartFromItems(this.getCartItemsArray()));
            })
        );
    }

    // Remove from cart - returns Cart for NgRx compatibility
    removeFromCart(itemId: string): Observable<Cart> {
        return from(this.removeFromCartAsync(itemId)).pipe(
            map(() => this.createCartFromItems(this.getCartItemsArray())),
            catchError(error => {
                console.error('Error removing from cart:', error);
                return of(this.createCartFromItems(this.getCartItemsArray()));
            })
        );
    }

    // Apply coupon - returns Cart for NgRx compatibility
    applyCoupon(code: string): Observable<Cart> {
        // Mock implementation - in real app, this would validate and apply coupon
        return of(this.createCartFromItems(this.getCartItemsArray()));
    }

    // Remove coupon - returns Cart for NgRx compatibility
    removeCoupon(couponId: string): Observable<Cart> {
        // Mock implementation - in real app, this would remove applied coupon
        return of(this.createCartFromItems(this.getCartItemsArray()));
    }

    // Load available coupons
    loadAvailableCoupons(): Observable<Coupon[]> {
        // Mock implementation - in real app, this would fetch from Supabase
        return of([]);
    }

    // Clear cart - returns void for compatibility
    clearCart(): Observable<void> {
        return from(this.clearCartAsync()).pipe(
            map(() => undefined),
            catchError(error => {
                console.error('Error clearing cart:', error);
                return of(undefined);
            })
        );
    }

    // Add item to cart (async version)
    async addToCartAsync(productId: string, quantity: number = 1): Promise<void> {
        try {
            // Get product details from Supabase
            const product = await this.supabaseService.getTableById('products', productId);

            if (!product) {
                throw new Error('Product not found');
            }

            const currentItems = this.getCartItemsArray();
            const existingItemIndex = currentItems.findIndex(item => item.productId === productId);

            if (existingItemIndex > -1) {
                // Update quantity of existing item
                const updatedItems = [...currentItems];
                const existingItem = updatedItems[existingItemIndex];
                const newQuantity = existingItem.quantity + quantity;

                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: newQuantity,
                    updatedAt: new Date().toISOString()
                };

                this.updateCartItems(updatedItems);

                // Sync to Supabase if authenticated
                if (this.isAuthenticated && this.currentUserId) {
                    await this.syncItemToSupabase(productId, newQuantity, product.price);
                }
            } else {
                // Add new item
                const now = new Date().toISOString();
                const cartItem: CartItem = {
                    id: this.generateCartItemId(),
                    productId: product.id,
                    name: product.name,
                    description: product.short_description,
                    sku: product.sku,
                    price: product.price,
                    originalPrice: product.original_price || undefined,
                    quantity: quantity,
                    minQuantity: 1,
                    maxQuantity: product.stock_quantity,
                    image: this.getProductImage(product.images),
                    category: await this.getCategoryName(product.category_id),
                    brand: product.brand,
                    addedAt: now,
                    updatedAt: now,
                    availability: {
                        inStock: product.in_stock,
                        quantity: product.stock_quantity,
                        stockStatus: product.stock_status,
                        backorderAllowed: false
                    },
                    shippingInfo: {
                        weight: product.weight || 0,
                        dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
                        shippingClass: 'standard',
                        freeShipping: product.free_shipping
                    },
                    taxInfo: {
                        taxable: true,
                        taxClass: 'standard',
                        taxRate: 0.10,
                        taxAmount: product.price * 0.10 * quantity
                    }
                };

                const updatedItems = [...currentItems, cartItem];
                this.updateCartItems(updatedItems);

                // Sync to Supabase if authenticated
                if (this.isAuthenticated && this.currentUserId) {
                    await this.supabaseService.addToCart(productId, quantity, product.price, this.currentUserId);
                }
            }

        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        }
    }

    // Update cart item (async version)
    async updateCartItemAsync(itemId: string, quantity: number): Promise<void> {
        try {
            const currentItems = this.getCartItemsArray();
            const item = currentItems.find(i => i.id === itemId);

            if (!item) {
                throw new Error('Cart item not found');
            }

            if (quantity <= 0) {
                await this.removeFromCartAsync(itemId);
                return;
            }

            const updatedItems = currentItems.map(cartItem =>
                cartItem.id === itemId
                    ? {
                        ...cartItem,
                        quantity: Math.min(quantity, cartItem.maxQuantity || 999),
                        updatedAt: new Date().toISOString()
                    }
                    : cartItem
            );

            this.updateCartItems(updatedItems);

            // Sync to Supabase if authenticated
            if (this.isAuthenticated && this.currentUserId) {
                await this.syncItemToSupabase(item.productId, quantity, item.price);
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw error;
        }
    }

    // Remove from cart (async version)
    async removeFromCartAsync(itemId: string): Promise<void> {
        try {
            const currentItems = this.getCartItemsArray();
            const item = currentItems.find(i => i.id === itemId);

            if (!item) {
                throw new Error('Cart item not found');
            }

            const updatedItems = currentItems.filter(cartItem => cartItem.id !== itemId);
            this.updateCartItems(updatedItems);

            // Sync to Supabase if authenticated
            if (this.isAuthenticated && this.currentUserId) {
                await this.removeItemFromSupabase(itemId);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }

    // Clear cart (async version)
    async clearCartAsync(): Promise<void> {
        try {
            this.updateCartItems([]);

            // Clear from Supabase if authenticated
            if (this.isAuthenticated && this.currentUserId) {
                await this.clearCartFromSupabase();
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    // Load cart from Supabase
    private async loadCartFromSupabase(): Promise<void> {
        try {
            if (!this.currentUserId) return;

            const supabaseCartItems = await this.supabaseService.getCartItems(this.currentUserId);

            // Convert Supabase cart items to local cart format
            const cartItems: CartItem[] = [];

            for (const item of supabaseCartItems) {
                const product = await this.supabaseService.getTableById('products', item.product_id);
                if (product) {
                    const now = new Date().toISOString();
                    cartItems.push({
                        id: item.id,
                        productId: product.id,
                        name: product.name,
                        description: product.short_description,
                        sku: product.sku,
                        price: item.price,
                        originalPrice: product.original_price || undefined,
                        quantity: item.quantity,
                        minQuantity: 1,
                        maxQuantity: product.stock_quantity,
                        image: this.getProductImage(product.images),
                        category: await this.getCategoryName(product.category_id),
                        brand: product.brand,
                        addedAt: item.created_at,
                        updatedAt: item.updated_at,
                        availability: {
                            inStock: product.in_stock,
                            quantity: product.stock_quantity,
                            stockStatus: product.stock_status,
                            backorderAllowed: false
                        },
                        shippingInfo: {
                            weight: product.weight || 0,
                            dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
                            shippingClass: 'standard',
                            freeShipping: product.free_shipping
                        },
                        taxInfo: {
                            taxable: true,
                            taxClass: 'standard',
                            taxRate: 0.10,
                            taxAmount: item.price * 0.10 * item.quantity
                        }
                    });
                }
            }

            this.updateCartItems(cartItems);
        } catch (error) {
            console.error('Error loading cart from Supabase:', error);
            // Fallback to empty cart
            this.updateCartItems([]);
        }
    }

    // Sync item to Supabase
    private async syncItemToSupabase(productId: string, quantity: number, price: number): Promise<void> {
        try {
            if (!this.currentUserId) return;

            // Check if item exists in Supabase
            const existingItems = await this.supabaseService.getCartItems(this.currentUserId);
            const existingItem = existingItems.find(item => item.product_id === productId);

            if (existingItem) {
                // Update existing item
                await this.supabaseService.updateRecord('cart_items', existingItem.id, {
                    quantity: quantity,
                    updated_at: new Date().toISOString()
                });
            } else {
                // Add new item
                await this.supabaseService.addToCart(productId, quantity, price, this.currentUserId);
            }
        } catch (error) {
            console.error('Error syncing item to Supabase:', error);
        }
    }

    // Remove item from Supabase
    private async removeItemFromSupabase(itemId: string): Promise<void> {
        try {
            if (!this.currentUserId) return;

            await this.supabaseService.deleteRecord('cart_items', itemId);
        } catch (error) {
            console.error('Error removing item from Supabase:', error);
        }
    }

    // Clear cart from Supabase
    private async clearCartFromSupabase(): Promise<void> {
        try {
            if (!this.currentUserId) return;

            const cartItems = await this.supabaseService.getCartItems(this.currentUserId);
            for (const item of cartItems) {
                await this.supabaseService.deleteRecord('cart_items', item.id);
            }
        } catch (error) {
            console.error('Error clearing cart from Supabase:', error);
        }
    }

    // Get cart item count
    getCartItemCount(): Observable<number> {
        return this.cartItems.pipe(
            map(items => {
                if (!Array.isArray(items)) {
                    console.warn('getCartItemCount received non-array items:', items);
                    return 0;
                }
                return items.reduce((total, item) => total + item.quantity, 0);
            })
        );
    }

    // Check if product is in cart
    isInCart(productId: string): Observable<boolean> {
        return this.cartItems.pipe(
            map(items => {
                if (!Array.isArray(items)) {
                    console.warn('isInCart received non-array items:', items);
                    return false;
                }
                return items.some(item => item.productId === productId);
            })
        );
    }

    // Get specific cart item
    getCartItem(productId: string): Observable<CartItem | undefined> {
        return this.cartItems.pipe(
            map(items => {
                if (!Array.isArray(items)) {
                    console.warn('getCartItem received non-array items:', items);
                    return undefined;
                }
                return items.find(item => item.productId === productId);
            })
        );
    }

    // Create Cart object from items for NgRx compatibility
    private createCartFromItems(items: CartItem[]): Cart {
        const summary = this.calculateCartSummary(items);

        return {
            id: this.isAuthenticated ? `user-${this.currentUserId}` : 'guest-cart',
            items: items,
            subtotal: summary.subtotal,
            tax: summary.tax,
            shipping: summary.shipping,
            discount: summary.discount,
            total: summary.total,
            currency: 'EUR',
            appliedCoupons: [],
            shippingAddress: undefined,
            billingAddress: undefined,
            paymentMethod: undefined,
            status: 'active',
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // Calculate cart summary
    private calculateCartSummary(items: CartItem[]): CartSummary {
        if (!Array.isArray(items)) {
            console.warn('calculateCartSummary received non-array items:', items);
            items = [];
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10; // 10% tax
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over €100
        const discount = 0; // No discount applied
        const total = subtotal + tax + shipping - discount;
        const itemCount = items.reduce((count, item) => count + item.quantity, 0);

        return {
            subtotal,
            tax,
            shipping,
            discount,
            total,
            itemCount
        };
    }

    private updateCartItems(items: CartItem[]): void {
        this.cartItems.next(items);
        this.updateCartSummary(items);
    }

    private updateCartSummary(items: CartItem[]): void {
        const summary = this.calculateCartSummary(items);
        this.cartSummary.next(summary);
    }

    // Helper method to safely get cart items as array
    private getCartItemsArray(): CartItem[] {
        const items = this.cartItems.value;
        if (!Array.isArray(items)) {
            console.warn('Cart items is not an array, returning empty array:', items);
            return [];
        }
        return items;
    }

    private generateCartItemId(): string {
        return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private getProductImage(images: any[]): string {
        if (images && images.length > 0) {
            const primaryImage = images.find(img => img.is_primary);
            return primaryImage ? primaryImage.url : images[0].url;
        }
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop';
    }

    private async getCategoryName(categoryId: string): Promise<string> {
        try {
            const category = await this.supabaseService.getTableById('categories', categoryId);
            return category ? category.name : 'Unknown Category';
        } catch (error) {
            console.error('Error getting category name:', error);
            return 'Unknown Category';
        }
    }
} 