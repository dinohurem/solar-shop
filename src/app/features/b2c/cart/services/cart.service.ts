import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map, catchError, of, take, switchMap } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';
import { CartItem, Cart, AppliedCoupon } from '../../../../shared/models/cart.model';
import { Coupon, CouponValidationResult } from '../../../../shared/models/coupon.model';
import { CouponValidationService } from '../../../../shared/services/coupon-validation.service';
import { TranslationService } from '../../../../shared/services/translation.service';
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
    private appliedCoupons = new BehaviorSubject<AppliedCoupon[]>([]);
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
    private translationService = inject(TranslationService);

    constructor(private supabaseService: SupabaseService) { }

    // Generate translated coupon name
    private getCouponOfferName(couponCode: string): string {
        const couponText = this.translationService.translate('cart.coupon');
        return `${couponText}: ${couponCode}`;
    }

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
                await this.loadAppliedCoupons();
            } else {
                // For guest users, start with empty cart
                this.updateCartItems([]);
                this.appliedCoupons.next([]);
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
            await this.loadAppliedCoupons();
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
        this.appliedCoupons.next([]);
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
                return from(
                    this.applyCouponAsync(
                        code,
                        validationResult.discountAmount || 0,
                        validationResult.coupon?.discountType || 'fixed_amount',
                        validationResult.coupon || null
                    )
                ).pipe(
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
                // Fix price hierarchy: use actual selling price as main price, compareAt as original
                const actualSellingPrice = product.price; // The real price customers pay (current/discounted price)
                const compareAtPrice = product.original_price; // The higher "compare at" price for marketing

                console.log(`🏷️ Price debugging for ${product.name}:`);
                console.log(`   product.price: €${product.price}`);
                console.log(`   product.original_price: €${product.original_price}`);
                console.log(`   Using as cart price: €${actualSellingPrice}`);
                console.log(`   Using as originalPrice: €${compareAtPrice}`);

                const cartItem: CartItem = {
                    id: this.generateCartItemId(),
                    productId: product.id,
                    name: product.name,
                    description: product.short_description,
                    sku: product.sku,
                    price: actualSellingPrice, // Use the lower/actual selling price
                    originalPrice: compareAtPrice, // Use the higher "compare at" price
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
                        taxAmount: actualSellingPrice * 0.10 * quantity // Use actual selling price for tax
                    }
                };

                const updatedItems = [...currentItems, cartItem];
                this.updateCartItems(updatedItems);

                // Sync to Supabase if authenticated
                if (this.isAuthenticated && this.currentUserId) {
                    await this.supabaseService.addToCart(productId, quantity, actualSellingPrice, this.currentUserId);
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
            this.appliedCoupons.next([]);

            // Clear session coupon tracking
            this.couponValidationService.clearSessionCouponTracking();

            // Clear from Supabase if authenticated
            if (this.isAuthenticated && this.currentUserId) {
                await this.clearCartFromSupabase();
                await this.clearAppliedCouponsFromSupabase();
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

    // Clear applied coupons from Supabase
    private async clearAppliedCouponsFromSupabase(): Promise<void> {
        try {
            if (!this.currentUserId) return;

            await this.supabaseService.client
                .from('applied_coupons')
                .delete()
                .eq('user_id', this.currentUserId);
        } catch (error) {
            console.error('Error clearing applied coupons from Supabase:', error);
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

    // Helper method to get total discount amount from applied coupons and offers
    private getTotalDiscountAmount(coupons: AppliedCoupon[]): number {
        // Check if any cart items have individual discounts (offerSavings)
        // This applies to both coupon-based individual discounts and offer-based individual discounts
        const cartItems = this.getCartItemsArray();
        const itemsWithIndividualDiscounts = cartItems.filter(item => item.offerSavings && item.offerSavings > 0);

        if (itemsWithIndividualDiscounts.length > 0) {
            // Calculate total discount from individual item savings
            // offerSavings is the per-unit savings, so we need to multiply by quantity
            const totalDiscount = itemsWithIndividualDiscounts.reduce((total, item) => {
                const perUnitSavings = item.offerSavings || 0;
                return total + (perUnitSavings * item.quantity);
            }, 0);

            console.log('💰 DISCOUNT CALCULATION DEBUG (Individual Discounts):');
            console.log('Items with individual discounts:', itemsWithIndividualDiscounts.map(item => ({
                name: item.name,
                offerSavings: item.offerSavings,
                quantity: item.quantity,
                totalSavings: (item.offerSavings || 0) * item.quantity
            })));
            console.log('Total discount amount:', totalDiscount.toFixed(2));
            return totalDiscount;
        }

        // Otherwise, use the coupon discount amount (for general coupons without individual discounts)
        const totalDiscount = coupons.reduce((total, coupon) => total + coupon.discountAmount, 0);
        console.log('💰 DISCOUNT CALCULATION DEBUG (General Coupons):');
        console.log('Applied coupons:', coupons.map(c => ({ code: c.code, discountAmount: c.discountAmount })));
        console.log('Total discount amount:', totalDiscount.toFixed(2));
        return totalDiscount;
    }

    // Create Cart object from items for NgRx compatibility
    private createCartFromItems(items: CartItem[]): Cart {
        const coupons = this.appliedCoupons.value;
        const totalDiscount = this.getTotalDiscountAmount(coupons);
        const summary = this.calculateCartSummary(items, totalDiscount);

        return {
            id: this.isAuthenticated ? `user-${this.currentUserId}` : 'guest-cart',
            items: items,
            subtotal: summary.subtotal,
            tax: summary.tax,
            shipping: summary.shipping,
            discount: summary.discount,
            total: summary.total,
            currency: 'EUR',
            appliedCoupons: coupons,
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
        const tax = 0; // No tax
        const shipping = 0; // No shipping fees
        const discount = discountAmount;
        const total = subtotal - discount;
        const itemCount = items.reduce((count, item) => count + item.quantity, 0);

        console.log('🧮 CART CALCULATION DEBUG:');
        console.log('Items:', items.map(item => ({ name: item.name, price: item.price, qty: item.quantity, subtotal: item.price * item.quantity })));
        console.log('Subtotal calculation:', subtotal.toFixed(2));
        console.log('Shipping:', shipping.toFixed(2));
        console.log('Discount amount:', discount.toFixed(2));
        console.log('Total calculation:', `${subtotal.toFixed(2)} - ${discount.toFixed(2)} = ${total.toFixed(2)}`);
        console.log('Expected total:', (subtotal - discount).toFixed(2));

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

        // If cart becomes empty, clear applied coupons to allow fresh coupon application
        if (items.length === 0 && this.appliedCoupons.value.length > 0) {
            console.log('Cart is empty, clearing applied coupons for fresh session');
            this.appliedCoupons.next([]);

            // Clear session coupon tracking
            this.couponValidationService.clearSessionCouponTracking();

            // Clear from database if authenticated
            if (this.isAuthenticated && this.currentUserId) {
                // Clear applied coupons from database (fire and forget)
                this.clearAppliedCouponsFromSupabase().catch(error => {
                    console.error('Error clearing applied coupons from database:', error);
                });
            }
        }

        this.updateCartSummary(items);
    }

    private updateCartSummary(items: CartItem[], discount?: number): void {
        // If discount is not provided, calculate from current applied coupons
        const discountAmount = discount !== undefined ? discount : this.getTotalDiscountAmount(this.appliedCoupons.value);
        const summary = this.calculateCartSummary(items, discountAmount);
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
    private async applyCouponAsync(
        code: string,
        discountAmount: number,
        discountType: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y',
        couponDetails?: Coupon | null
    ): Promise<void> {
        try {
            // RESTRICTION: Only allow one coupon at a time
            const currentCoupons = this.appliedCoupons.value;
            if (currentCoupons.length > 0) {
                throw new Error('Only one coupon can be applied at a time. Please remove the existing coupon first.');
            }

            let appliedCouponId: string | null = null;
            const couponValue = couponDetails?.discountValue ?? discountAmount;

            if (this.isAuthenticated && this.currentUserId) {
                // Save applied coupon to user's cart in database
                const { data, error } = await this.supabaseService.client
                    .from('applied_coupons')
                    .insert({
                        user_id: this.currentUserId,
                        coupon_code: code,
                        coupon_type: discountType,
                        coupon_value: couponValue,
                        discount_amount: discountAmount,
                        applied_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                appliedCouponId = data?.id;
            } else {
                // For guest users, generate a temporary ID
                appliedCouponId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }

            // Check if this coupon corresponds to an offer with individual product discounts
            const updatedItems = await this.applyIndividualCouponDiscounts(code, discountType);

            // Mark coupon as used in session
            this.couponValidationService.markCouponAsUsedInSession(code);

            // Add to local applied coupons state
            const newCoupon: AppliedCoupon = {
                id: appliedCouponId || `temp_${Date.now()}`,
                code: code,
                type: discountType,
                value: couponValue,
                discountAmount: discountAmount,
                appliedAt: new Date().toISOString()
            };

            // Replace all existing coupons with this single coupon
            this.appliedCoupons.next([newCoupon]);

            // Increment usage count for the offer (if it's an offer-based coupon)
            try {
                const { data: offerData, error: offerError } = await this.supabaseService.client
                    .from('offers')
                    .select('id')
                    .eq('code', code)
                    .single();

                if (!offerError && offerData) {
                    console.log('Incrementing usage for offer:', offerData.id);
                    // Use the couponValidationService to increment usage
                    this.couponValidationService.incrementOfferUsage(offerData.id).subscribe({
                        next: (success) => {
                            if (success) {
                                console.log('Successfully incremented offer usage');
                            } else {
                                console.warn('Failed to increment offer usage');
                            }
                        },
                        error: (error) => console.error('Error incrementing offer usage:', error)
                    });
                }
            } catch (error) {
                console.warn('Could not increment offer usage:', error);
                // Don't fail the whole operation if usage increment fails
            }

            // Update cart items if individual discounts were applied
            if (updatedItems) {
                this.updateCartItems(updatedItems);
            } else {
                // Update cart summary with all applied discounts (for general coupons)
                const currentItems = this.getCartItemsArray();
                const allCoupons = this.appliedCoupons.value;
                this.updateCartSummary(currentItems, this.getTotalDiscountAmount(allCoupons));
            }

        } catch (error) {
            console.error('Error applying coupon async:', error);
            throw error;
        }
    }

    // Apply individual product discounts from coupon
    private async applyIndividualCouponDiscounts(couponCode: string, discountType: string): Promise<CartItem[] | null> {
        try {
            console.log('=== CART SERVICE: APPLYING INDIVIDUAL DISCOUNTS ===');
            console.log('Coupon code:', couponCode);
            console.log('Discount type:', discountType);

            // First, find the offer by coupon code
            const { data: offerData, error: offerError } = await this.supabaseService.client
                .from('offers')
                .select('id, bundle')
                .eq('code', couponCode)
                .single();

            if (offerError || !offerData) {
                console.log('❌ No offer found for coupon code:', couponCode);
                return null;
            }

            console.log('✅ Found offer for coupon:', offerData);

            // Check if this is a bundle offer
            const isBundle = offerData.bundle || false;

            // Get individual product discounts for this offer
            // First try to get all columns to see what exists
            const { data: offerProducts, error: productsError } = await this.supabaseService.client
                .from('offer_products')
                .select('*')
                .eq('offer_id', offerData.id);

            if (productsError || !offerProducts || offerProducts.length === 0) {
                console.log('❌ No individual product discounts found for offer');
                return null;
            }

            console.log('📋 Available product discounts:', offerProducts.map(op => ({
                productId: op.product_id,
                type: op.discount_type,
                amount: op.discount_amount,
                percentage: op.discount_percentage
            })));

            // Reset all cart items to original prices first
            const currentItems = this.getCartItemsArray();
            console.log('🛒 Current cart items:', currentItems.map(item => ({
                id: item.productId,
                name: item.name,
                price: item.price,
                originalPrice: item.originalPrice
            })));

            // If this is a bundle offer, check if all bundle products are in the cart
            if (isBundle) {
                const bundleProductIds = offerProducts.map(op => op.product_id);
                const bundleItemsInCart = currentItems.filter(item =>
                    bundleProductIds.includes(item.productId)
                );

                const bundleComplete = bundleItemsInCart.length === bundleProductIds.length;

                console.log('🎁 Bundle offer validation:', {
                    bundleProductIds,
                    itemsInCart: bundleItemsInCart.map(i => i.productId),
                    bundleComplete
                });

                if (!bundleComplete) {
                    console.log('❌ Bundle is incomplete - not all products are in cart. Skipping discount application.');
                    throw new Error('All products from the bundle offer must be in the cart to apply the discount.');
                }
            }

            const resetItems = this.resetCartItemsToOriginalPrices(currentItems);
            console.log('🔄 Reset items to original prices');

            // Apply individual discounts to appropriate items
            const updatedItems = resetItems.map(item => {
                const productDiscount = offerProducts.find(op => op.product_id === item.productId);

                if (productDiscount) {
                    console.log(`✅ MATCH: Applying individual discount to ${item.name} (ID: ${item.productId})`);
                    console.log(`   Current price: €${item.price}, Original price: €${item.originalPrice || item.price}`);
                    console.log(`   Discount data:`, productDiscount);

                    // Apply discount to the CURRENT/LOWEST price, not the original/highest price
                    const basePrice = item.price; // Use current price (lowest)
                    let discountedPrice = basePrice;
                    let offerDiscount = 0;
                    let offerType: 'percentage' | 'fixed_amount' = 'fixed_amount';

                    // Handle discount types - same logic as validation service
                    const discountType = productDiscount.discount_type ||
                        (productDiscount.discount_amount > 0 ? 'fixed_amount' :
                         productDiscount.discount_percentage > 0 ? 'percentage' : 'unknown');

                    const discountAmount = productDiscount.discount_amount || 0;
                    const discountPercentage = productDiscount.discount_percentage || 0;

                    console.log(`   Determined type: ${discountType}, amount: ${discountAmount}, percentage: ${discountPercentage}`);

                    if (discountType === 'fixed_amount' && discountAmount > 0) {
                        offerDiscount = discountAmount;
                        discountedPrice = Math.max(0, basePrice - offerDiscount); // Can't go below 0
                        offerType = 'fixed_amount';
                        console.log(`   💰 Fixed discount: €${offerDiscount} from €${basePrice} = €${discountedPrice}`);
                    } else if (discountType === 'percentage' && discountPercentage > 0) {
                        offerDiscount = discountPercentage;
                        discountedPrice = basePrice * (1 - offerDiscount / 100);
                        offerType = 'percentage';
                        console.log(`   📊 Percentage discount: ${offerDiscount}% from €${basePrice} = €${discountedPrice}`);
                    } else {
                        console.log(`   ❌ No valid discount applied`);
                        return item; // Return unchanged if no valid discount
                    }

                    const actualSavings = basePrice - discountedPrice; // Savings from current price

                    console.log(`   ✅ Applied discount: €${basePrice} → €${discountedPrice} (saved €${actualSavings})`);

                    return {
                        ...item,
                        // Keep the original price - don't modify it
                        // The discount will be shown separately in the cart summary
                        price: basePrice,
                        originalPrice: item.originalPrice || basePrice,
                        offerId: offerData.id,
                        offerName: this.getCouponOfferName(couponCode),
                        offerType,
                        offerDiscount,
                        offerOriginalPrice: basePrice, // The price before this discount
                        offerValidUntil: undefined,
                        offerAppliedAt: new Date().toISOString(),
                        offerSavings: Math.round(actualSavings * 100) / 100
                    };
                } else {
                    console.log(`❌ NO MATCH: ${item.name} (ID: ${item.productId}) - keeping original price`);
                }

                return item;
            });

            console.log('🎯 FINAL: Updated cart items with individual discounts');
            console.log('=== END CART SERVICE INDIVIDUAL DISCOUNTS ===');
            return updatedItems;

        } catch (error) {
            console.error('Error applying individual coupon discounts:', error);
            return null;
        }
    }

    // Helper method to reset cart items to their original prices
    private resetCartItemsToOriginalPrices(items: CartItem[]): CartItem[] {
        return items.map(item => ({
            ...item,
            // DON'T change the price - keep it as the actual selling price
            // Only reset offer-related fields
            offerId: undefined,
            offerName: undefined,
            offerType: undefined,
            offerDiscount: undefined,
            offerOriginalPrice: undefined,
            offerValidUntil: undefined,
            offerAppliedAt: undefined,
            offerSavings: undefined
        }));
    }

    // Remove coupon async helper
    private async removeCouponAsync(couponId: string): Promise<void> {
        try {
            if (this.isAuthenticated && this.currentUserId && !couponId.startsWith('guest_')) {
                // Remove applied coupon from database (only for authenticated users)
                await this.supabaseService.client
                    .from('applied_coupons')
                    .delete()
                    .eq('id', couponId)
                    .eq('user_id', this.currentUserId);
            }

            // Find the coupon being removed
            const currentCoupons = this.appliedCoupons.value;
            const removedCoupon = currentCoupons.find(c => c.id === couponId);

            // Remove individual product discounts if this was a coupon with individual discounts
            if (removedCoupon) {
                await this.removeIndividualCouponDiscounts(removedCoupon.code);
                // Remove from session tracking
                this.couponValidationService.removeCouponFromSession(removedCoupon.code);
            }

            // Remove from local applied coupons state
            const updatedCoupons = currentCoupons.filter(c => c.id !== couponId);
            this.appliedCoupons.next(updatedCoupons);

            // Update cart summary with remaining discounts
            const currentItems = this.getCartItemsArray();
            this.updateCartSummary(currentItems, this.getTotalDiscountAmount(updatedCoupons));

        } catch (error) {
            console.error('Error removing coupon async:', error);
            throw error;
        }
    }

    // Remove individual product discounts when coupon is removed
    private async removeIndividualCouponDiscounts(couponCode: string): Promise<void> {
        try {
            console.log('Removing individual product discounts for coupon:', couponCode);

            // Reset cart items to their original prices (remove offer-related fields)
            const currentItems = this.getCartItemsArray();
            const resetItems = currentItems.map(item => {
                // If this item has an offer applied from the coupon, reset it
                if (item.offerName && item.offerName.includes(this.getCouponOfferName(couponCode))) {
                    console.log(`Resetting discount for ${item.name}`);
                    return {
                        ...item,
                        price: item.originalPrice || item.price,
                        originalPrice: undefined,
                        offerId: undefined,
                        offerName: undefined,
                        offerType: undefined,
                        offerDiscount: undefined,
                        offerOriginalPrice: undefined,
                        offerValidUntil: undefined,
                        offerAppliedAt: undefined,
                        offerSavings: undefined
                    };
                }
                return item;
            });

            console.log('Reset cart items after removing coupon discounts:', resetItems);
            this.updateCartItems(resetItems);

        } catch (error) {
            console.error('Error removing individual coupon discounts:', error);
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
        offerValidUntil?: string,
        individualDiscount?: number,
        individualDiscountType?: 'percentage' | 'fixed_amount'
    ): Observable<Cart> {
        return from(this.addToCartFromOfferAsync(productId, quantity, variantId, offerId, offerName, offerType, offerDiscount, offerOriginalPrice, offerValidUntil, individualDiscount, individualDiscountType)).pipe(
            map(() => this.createCartFromItems(this.getCartItemsArray())),
            catchError(error => {
                console.error('Error adding to cart from offer:', error);
                throw error;
            })
        );
    }

    // Add multiple products to cart from offer
    addAllToCartFromOffer(
        products: Array<{
            productId: string;
            quantity: number;
            variantId?: string;
            individualDiscount?: number;
            individualDiscountType?: 'percentage' | 'fixed_amount';
            originalPrice?: number;
        }>,
        offerId: string,
        offerName: string,
        offerType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
        offerDiscount: number,
        offerValidUntil?: string,
        isBundle?: boolean,
        bundleProductIds?: string[]
    ): Observable<{ cart: Cart; addedCount: number; skippedCount: number }> {
        return from(this.addAllToCartFromOfferAsync(products, offerId, offerName, offerType, offerDiscount, offerValidUntil, isBundle, bundleProductIds)).pipe(
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
        offerValidUntil?: string,
        individualDiscount?: number,
        individualDiscountType?: 'percentage' | 'fixed_amount'
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
            let discountedPrice = originalPrice; // Start with original price, not product.price
            let savings = 0;

            // Use individual discount if available, otherwise use general offer discount
            const effectiveDiscount = individualDiscount !== undefined ? individualDiscount : offerDiscount;
            const effectiveDiscountType = individualDiscountType || offerType;

            console.log('Cart Service - Adding product with discount:', {
                productId,
                individualDiscount,
                individualDiscountType,
                offerDiscount,
                offerType,
                effectiveDiscount,
                effectiveDiscountType
            });

            if (effectiveDiscountType === 'percentage' && effectiveDiscount) {
                discountedPrice = originalPrice * (1 - effectiveDiscount / 100);
                savings = originalPrice - discountedPrice;
                console.log('Percentage discount calculation:', {
                    originalPrice,
                    effectiveDiscount,
                    discountedPrice,
                    savings
                });
            } else if (effectiveDiscountType === 'fixed_amount' && effectiveDiscount) {
                discountedPrice = Math.max(originalPrice - effectiveDiscount, 0);
                savings = effectiveDiscount; // For fixed amount, savings IS the discount amount
                console.log('Fixed amount discount calculation:', {
                    originalPrice,
                    effectiveDiscount,
                    discountedPrice,
                    savings
                });
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
                    // Keep the original price - don't modify it
                    // The discount will be shown separately via offerSavings
                    price: originalPrice,
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
                    offerType: effectiveDiscountType,
                    offerDiscount: effectiveDiscount,
                    offerOriginalPrice: originalPrice,
                    offerValidUntil,
                    offerAppliedAt: now,
                    offerSavings: savings
                };

                console.log('Cart Item created with offer data:', {
                    offerId: cartItem.offerId,
                    offerType: cartItem.offerType,
                    offerDiscount: cartItem.offerDiscount,
                    offerSavings: cartItem.offerSavings,
                    price: cartItem.price,
                    originalPrice: cartItem.originalPrice
                });

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
        products: Array<{
            productId: string;
            quantity: number;
            variantId?: string;
            individualDiscount?: number;
            individualDiscountType?: 'percentage' | 'fixed_amount';
            originalPrice?: number;
        }>,
        offerId: string,
        offerName: string,
        offerType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
        offerDiscount: number,
        offerValidUntil?: string,
        isBundle?: boolean,
        bundleProductIds?: string[]
    ): Promise<{ addedCount: number; skippedCount: number }> {
        console.log('addAllToCartFromOfferAsync - Starting with offer:', {
            offerId,
            offerName,
            offerType,
            offerDiscount,
            isBundle,
            bundleProductIds,
            products: products.map(p => ({
                productId: p.productId,
                individualDiscount: p.individualDiscount,
                individualDiscountType: p.individualDiscountType
            }))
        });

        // Clear any existing coupons since we're applying an offer
        const existingCoupons = this.appliedCoupons.value;
        if (existingCoupons.length > 0) {
            console.log('Clearing existing coupons before applying offer');
            this.appliedCoupons.next([]);

            // Also reset cart items to original prices
            const currentItems = this.getCartItemsArray();
            const resetItems = this.resetCartItemsToOriginalPrices(currentItems);
            this.updateCartItems(resetItems);
        }

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

                // Use individual discount if available, otherwise use general offer discount
                const discountToApply = productData.individualDiscount !== undefined ? productData.individualDiscount : offerDiscount;
                const discountType = productData.individualDiscountType || offerType;
                const originalPrice = productData.originalPrice || product.price;

                console.log('addAllToCartFromOfferAsync - Processing product:', {
                    productId: productData.productId,
                    productName: product.name,
                    individualDiscount: productData.individualDiscount,
                    individualDiscountType: productData.individualDiscountType,
                    offerDiscount,
                    offerType,
                    discountToApply,
                    discountType,
                    originalPrice,
                    productPrice: product.price
                });

                // For bundle offers, don't apply discount when adding products
                // Discount will be validated and applied based on bundle completion
                const discountForAdd = isBundle ? 0 : discountToApply;
                const discountTypeForAdd = isBundle ? undefined : (discountType as 'percentage' | 'fixed_amount');

                await this.addToCartFromOfferAsync(
                    productData.productId,
                    productData.quantity,
                    productData.variantId,
                    offerId,
                    offerName,
                    discountType as 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
                    discountForAdd, // 0 for bundles, actual discount for non-bundles
                    originalPrice,
                    offerValidUntil,
                    discountForAdd, // Individual discount amount (0 for bundles)
                    discountTypeForAdd // Individual discount type (undefined for bundles)
                );

                addedCount++;
            } catch (error) {
                console.error(`Error adding product ${productData.productId} from offer:`, error);
                skippedCount++;
            }
        }

        // For bundle offers, apply discount after all products are added if bundle is complete
        if (isBundle && bundleProductIds && addedCount > 0) {
            await this.applyBundleDiscount(offerId, offerName, offerType, offerDiscount, bundleProductIds, offerValidUntil);
        }

        // Increment usage count for the offer if at least one product was added
        if (addedCount > 0) {
            try {
                console.log('Incrementing usage for offer:', offerId);
                this.couponValidationService.incrementOfferUsage(offerId).subscribe({
                    next: (success) => {
                        if (success) {
                            console.log('Successfully incremented offer usage after adding products to cart');
                        } else {
                            console.warn('Failed to increment offer usage after adding products to cart');
                        }
                    },
                    error: (error) => console.error('Error incrementing offer usage after adding products:', error)
                });
            } catch (error) {
                console.warn('Could not increment offer usage after adding products:', error);
                // Don't fail the operation if usage increment fails
            }
        }

        console.log('addAllToCartFromOfferAsync - Completed:', { addedCount, skippedCount });
        return { addedCount, skippedCount };
    }

    // Apply bundle discount if all bundle products are in cart
    private async applyBundleDiscount(
        offerId: string,
        offerName: string,
        offerType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle',
        offerDiscount: number,
        bundleProductIds: string[],
        offerValidUntil?: string
    ): Promise<void> {
        console.log('Checking bundle completion for offer:', offerId, {
            bundleProductIds,
            offerDiscount,
            offerType
        });

        const currentItems = this.getCartItemsArray();

        // Check if all bundle products are in the cart
        const bundleItemsInCart = currentItems.filter(item =>
            bundleProductIds.includes(item.productId) && item.offerId === offerId
        );

        const bundleComplete = bundleItemsInCart.length === bundleProductIds.length;

        console.log('Bundle status:', {
            bundleProductIds,
            bundleItemsInCart: bundleItemsInCart.map(i => i.productId),
            bundleComplete
        });

        // Update all bundle items with bundle information and apply discount if complete
        const updatedItems = currentItems.map(item => {
            if (bundleProductIds.includes(item.productId) && item.offerId === offerId) {
                // Calculate discount for this item if bundle is complete
                let discountedPrice = item.price;
                let savings = 0;

                if (bundleComplete) {
                    if (offerType === 'percentage') {
                        discountedPrice = item.price * (1 - offerDiscount / 100);
                        savings = item.price - discountedPrice;
                    } else if (offerType === 'fixed_amount') {
                        // For fixed amount in bundles, distribute proportionally
                        const totalOriginalPrice = bundleItemsInCart.reduce((sum, i) => sum + i.price, 0);
                        const proportionalDiscount = (item.price / totalOriginalPrice) * offerDiscount;
                        discountedPrice = Math.max(0, item.price - proportionalDiscount);
                        savings = proportionalDiscount;
                    }
                }

                return {
                    ...item,
                    isBundle: true,
                    bundleProductIds,
                    bundleComplete,
                    price: bundleComplete ? discountedPrice : item.price,
                    offerDiscount: bundleComplete ? offerDiscount : undefined,
                    offerSavings: bundleComplete ? savings : undefined,
                    updatedAt: new Date().toISOString()
                };
            }
            return item;
        });

        this.updateCartItems(updatedItems);

        console.log('Bundle discount application completed:', {
            bundleComplete,
            itemsUpdated: updatedItems.filter(i => i.isBundle).length
        });
    }

    // Load applied coupons from database
    private async loadAppliedCoupons(): Promise<void> {
        try {
            if (!this.isAuthenticated || !this.currentUserId) {
                this.appliedCoupons.next([]);
                return;
            }

            const { data, error } = await this.supabaseService.client
                .from('applied_coupons')
                .select('*')
                .eq('user_id', this.currentUserId)
                .order('applied_at', { ascending: false });

            if (error) {
                console.error('Error loading applied coupons:', error);
                return;
            }

            const appliedCoupons: AppliedCoupon[] = (data || []).map(item => ({
                id: item.id,
                code: item.coupon_code,
                type: item.coupon_type || 'fixed_amount',
                value: item.coupon_value || 0,
                discountAmount: item.discount_amount,
                appliedAt: item.applied_at,
                expiresAt: item.expires_at
            }));

            this.appliedCoupons.next(appliedCoupons);
        } catch (error) {
            console.error('Error loading applied coupons:', error);
            this.appliedCoupons.next([]);
        }
    }
} 