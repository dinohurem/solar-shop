import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map, catchError, of, take, switchMap } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';
import { CartItem, Cart } from '../../../../shared/models/cart.model';
import { Coupon, CouponValidationResult } from '../../../../shared/models/coupon.model';
import { CouponValidationService } from '../../../../shared/services/coupon-validation.service';
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
    private couponValidationService = inject(CouponValidationService);

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
        const currentItems = this.getCartItemsArray();
        
        return this.couponValidationService.validateCoupon(code, currentItems, this.currentUserId || undefined).pipe(
            switchMap((validationResult: CouponValidationResult) => {
                if (!validationResult.isValid) {
                    throw new Error(validationResult.errorMessage || 'Invalid coupon');
                }

                // Apply the coupon to the cart
                return from(this.applyCouponAsync(code, validationResult.discountAmount || 0)).pipe(
                    map(() => this.createCartFromItems(this.getCartItemsArray()))
                );
            }),
            catchError(error => {
                console.error('Error applying coupon:', error);
                throw error;
            })
        );
    }

    // Remove coupon - returns Cart for NgRx compatibility
    removeCoupon(couponId: string): Observable<Cart> {
        return from(this.removeCouponAsync(couponId)).pipe(
            map(() => this.createCartFromItems(this.getCartItemsArray())),
            catchError(error => {
                console.error('Error removing coupon:', error);
                return of(this.createCartFromItems(this.getCartItemsArray()));
            })
        );
    }

    // Load available coupons
    loadAvailableCoupons(): Observable<Coupon[]> {
        const currentItems = this.getCartItemsArray();
        return this.couponValidationService.getAvailableCoupons(currentItems);
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
                        quantity: product.stock_quantity,
                        stockStatus: product.stock_status,
                    },
                    shippingInfo: {
                        weight: product.weight || 0,
                        dimensions: product.dimensions || '',
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
                            quantity: product.stock_quantity,
                            stockStatus: product.stock_status,
                        },
                        shippingInfo: {
                            weight: product.weight || 0,
                            dimensions: product.dimensions || '',
                            shippingClass: 'standard',
                            freeShipping: product.free_shipping
                        },
                        taxInfo: {
                            taxable: true,
                            taxClass: 'standard',
                            taxRate: 0.10,
                            taxAmount: item.price * 0.10 * item.quantity
                        },
                        // Preserve offer-related fields from cart_items table
                        offerId: item.offer_id || undefined,
                        offerName: item.offer_name || undefined,
                        offerType: item.offer_type || undefined,
                        offerDiscount: item.offer_discount || undefined,
                        offerOriginalPrice: item.offer_original_price || undefined,
                        offerValidUntil: item.offer_valid_until || undefined,
                        offerAppliedAt: item.offer_applied_at || undefined,
                        offerSavings: item.offer_savings || undefined
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

    // Sync offer item to Supabase with all offer-related fields
    private async syncOfferItemToSupabase(
        productId: string, 
        quantity: number, 
        price: number,
        offerId?: string,
        offerName?: string,
        offerType?: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
        offerDiscount?: number,
        offerOriginalPrice?: number,
        offerValidUntil?: string,
        offerSavings?: number
    ): Promise<void> {
        try {
            if (!this.currentUserId) return;

            // Check if item exists in Supabase
            const existingItems = await this.supabaseService.getCartItems(this.currentUserId);
            const existingItem = existingItems.find(item => item.product_id === productId && item.offer_id === offerId);

            const offerData = {
                quantity: quantity,
                price: price,
                offer_id: offerId || null,
                offer_name: offerName || null,
                offer_type: offerType || null,
                offer_discount: offerDiscount || null,
                offer_original_price: offerOriginalPrice || null,
                offer_valid_until: offerValidUntil || null,
                offer_applied_at: new Date().toISOString(),
                offer_savings: offerSavings || null,
                updated_at: new Date().toISOString()
            };

            if (existingItem) {
                // Update existing item with offer data
                await this.supabaseService.updateRecord('cart_items', existingItem.id, offerData);
            } else {
                // Add new item with offer data
                await this.supabaseService.client
                    .from('cart_items')
                    .insert({
                        user_id: this.currentUserId,
                        product_id: productId,
                        ...offerData,
                        created_at: new Date().toISOString()
                    });
            }
        } catch (error) {
            console.error('Error syncing offer item to Supabase:', error);
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
    private calculateCartSummary(items: CartItem[], discountAmount: number = 0): CartSummary {
        if (!Array.isArray(items)) {
            console.warn('calculateCartSummary received non-array items:', items);
            items = [];
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10; // 10% tax
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over €100
        const discount = discountAmount;
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

    private updateCartSummary(items: CartItem[], discount: number = 0): void {
        const summary = this.calculateCartSummary(items, discount);
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

    // Apply coupon async helper
    private async applyCouponAsync(code: string, discountAmount: number): Promise<void> {
        try {
            // In a real implementation, you would:
            // 1. Save the applied coupon to the database
            // 2. Update the cart summary with discount
            // 3. Track coupon usage
            
            if (this.isAuthenticated && this.currentUserId) {
                // Save applied coupon to user's cart in database
                await this.supabaseService.client
                    .from('applied_coupons')
                    .insert({
                        user_id: this.currentUserId,
                        coupon_code: code,
                        discount_amount: discountAmount,
                        applied_at: new Date().toISOString()
                    });
            }

            // Update cart summary with discount
            const currentItems = this.getCartItemsArray();
            this.updateCartSummary(currentItems, discountAmount);
            
        } catch (error) {
            console.error('Error applying coupon async:', error);
            throw error;
        }
    }

    // Remove coupon async helper
    private async removeCouponAsync(couponId: string): Promise<void> {
        try {
            if (this.isAuthenticated && this.currentUserId) {
                // Remove applied coupon from database
                await this.supabaseService.client
                    .from('applied_coupons')
                    .delete()
                    .eq('id', couponId)
                    .eq('user_id', this.currentUserId);
            }

            // Update cart summary without discount
            const currentItems = this.getCartItemsArray();
            this.updateCartSummary(currentItems, 0);
            
        } catch (error) {
            console.error('Error removing coupon async:', error);
            throw error;
        }
    }

    // Add single product to cart from offer
    addToCartFromOffer(
        productId: string, 
        quantity: number, 
        variantId?: string, 
        offerId?: string,
        offerName?: string, 
        offerType?: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle', 
        offerDiscount?: number, 
        offerOriginalPrice?: number, 
        offerValidUntil?: string
    ): Observable<Cart> {
        return from(this.addToCartFromOfferAsync(productId, quantity, variantId, offerId, offerName, offerType, offerDiscount, offerOriginalPrice, offerValidUntil)).pipe(
            map(() => this.createCartFromItems(this.getCartItemsArray())),
            catchError(error => {
                console.error('Error adding to cart from offer:', error);
                throw error;
            })
        );
    }

    // Add multiple products to cart from offer
    addAllToCartFromOffer(
        products: Array<{ productId: string; quantity: number; variantId?: string }>, 
        offerId: string,
        offerName: string, 
        offerType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle', 
        offerDiscount: number, 
        offerValidUntil?: string
    ): Observable<{ cart: Cart; addedCount: number; skippedCount: number }> {
        return from(this.addAllToCartFromOfferAsync(products, offerId, offerName, offerType, offerDiscount, offerValidUntil)).pipe(
            map(({ addedCount, skippedCount }) => ({
                cart: this.createCartFromItems(this.getCartItemsArray()),
                addedCount,
                skippedCount
            })),
            catchError(error => {
                console.error('Error adding all to cart from offer:', error);
                throw error;
            })
        );
    }

    // Add single product to cart from offer (async version)
    private async addToCartFromOfferAsync(
        productId: string, 
        quantity: number = 1, 
        variantId?: string, 
        offerId?: string,
        offerName?: string, 
        offerType?: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle', 
        offerDiscount?: number, 
        offerOriginalPrice?: number, 
        offerValidUntil?: string
    ): Promise<void> {
        try {
            // Get product details from Supabase
            const product = await this.supabaseService.getTableById('products', productId);

            if (!product) {
                throw new Error('Product not found');
            }

            const currentItems = this.getCartItemsArray();
            const existingItemIndex = currentItems.findIndex(item => 
                item.productId === productId && item.offerId === offerId
            );

            // Calculate offer pricing
            const originalPrice = offerOriginalPrice || product.price;
            let discountedPrice = product.price;
            let savings = 0;

            if (offerType === 'percentage' && offerDiscount) {
                discountedPrice = originalPrice * (1 - offerDiscount / 100);
                savings = originalPrice - discountedPrice;
            } else if (offerType === 'fixed_amount' && offerDiscount) {
                discountedPrice = Math.max(originalPrice - offerDiscount, 0);
                savings = originalPrice - discountedPrice;
            }

            if (existingItemIndex > -1) {
                // Update quantity of existing offer item
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
                    await this.syncOfferItemToSupabase(productId, newQuantity, discountedPrice, offerId, offerName, offerType, offerDiscount, originalPrice, offerValidUntil, savings * newQuantity);
                }
            } else {
                // Add new offer item
                const now = new Date().toISOString();
                const cartItem: CartItem = {
                    id: this.generateCartItemId(),
                    productId,
                    variantId,
                    name: product.name,
                    description: product.description,
                    sku: product.sku || '',
                    price: discountedPrice,
                    originalPrice: originalPrice,
                    quantity,
                    minQuantity: 1,
                    maxQuantity: product.stock_quantity || 999,
                    weight: product.weight,
                    dimensions: product.dimensions,
                    image: this.getProductImage(product.images),
                    category: 'General',
                    brand: product.brand || '',
                    addedAt: now,
                    updatedAt: now,
                    availability: {
                        quantity: product.stock_quantity || 0,
                        stockStatus: product.stock_quantity > 0 ? 'in_stock' : 'out_of_stock',
                        estimatedDelivery: product.estimated_delivery_days ? `${product.estimated_delivery_days} days` : undefined
                    },
                    shippingInfo: {
                        weight: product.weight || 0,
                        dimensions: product.dimensions || '',
                        shippingClass: 'standard',
                        freeShipping: product.free_shipping || false,
                        restrictions: []
                    },
                    taxInfo: {
                        taxable: true,
                        taxClass: 'standard',
                        taxRate: 0,
                        taxAmount: 0
                    },
                    // Offer-specific fields
                    offerId,
                    offerName,
                    offerType,
                    offerDiscount,
                    offerOriginalPrice: originalPrice,
                    offerValidUntil,
                    offerAppliedAt: now,
                    offerSavings: savings * quantity
                };

                const updatedItems = [...currentItems, cartItem];
                this.updateCartItems(updatedItems);

                // Sync to Supabase if authenticated
                if (this.isAuthenticated && this.currentUserId) {
                    await this.syncOfferItemToSupabase(productId, quantity, discountedPrice, offerId, offerName, offerType, offerDiscount, originalPrice, offerValidUntil, savings * quantity);
                }
            }

            console.log('Successfully added product to cart from offer:', { productId, offerId, offerName });
        } catch (error) {
            console.error('Error adding product to cart from offer:', error);
            throw error;
        }
    }

    // Add multiple products to cart from offer (async version)
    private async addAllToCartFromOfferAsync(
        products: Array<{ productId: string; quantity: number; variantId?: string }>, 
        offerId: string,
        offerName: string, 
        offerType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle', 
        offerDiscount: number, 
        offerValidUntil?: string
    ): Promise<{ addedCount: number; skippedCount: number }> {
        let addedCount = 0;
        let skippedCount = 0;

        for (const productData of products) {
            try {
                // Get product details to calculate original price
                const product = await this.supabaseService.getTableById('products', productData.productId);
                
                if (!product) {
                    skippedCount++;
                    continue;
                }

                await this.addToCartFromOfferAsync(
                    productData.productId,
                    productData.quantity,
                    productData.variantId,
                    offerId,
                    offerName,
                    offerType,
                    offerDiscount,
                    product.price, // Use actual product price as original price
                    offerValidUntil
                );

                addedCount++;
            } catch (error) {
                console.error(`Error adding product ${productData.productId} from offer:`, error);
                skippedCount++;
            }
        }

        return { addedCount, skippedCount };
    }
} 