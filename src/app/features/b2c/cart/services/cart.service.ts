import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';
import { CartItem, Cart } from '../../../../shared/models/cart.model';
import { Coupon } from '../../../../shared/models/coupon.model';

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
    private readonly CART_STORAGE_KEY = 'solar_shop_cart';
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    private cartSummary = new BehaviorSubject<CartSummary>({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
    });

    constructor(private supabaseService: SupabaseService) {
        this.loadCartFromStorage();
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
            map(items => this.createCartFromItems(items))
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
        const currentItems = this.getCartItemsArray();
        const item = currentItems.find(i => i.id === itemId);

        if (item) {
            this.updateQuantity(item.productId, quantity);
        }

        return of(this.createCartFromItems(this.getCartItemsArray()));
    }

    // Remove from cart - returns Cart for NgRx compatibility
    removeFromCart(itemId: string): Observable<Cart> {
        const currentItems = this.getCartItemsArray();
        const item = currentItems.find(i => i.id === itemId);

        if (item) {
            this.removeFromCartByProductId(item.productId);
        }

        return of(this.createCartFromItems(this.getCartItemsArray()));
    }

    // Apply coupon - returns Cart for NgRx compatibility
    applyCoupon(code: string): Observable<Cart> {
        // Mock implementation - in real app, this would validate and apply coupon
        console.log('Applying coupon:', code);
        return of(this.createCartFromItems(this.getCartItemsArray()));
    }

    // Remove coupon - returns Cart for NgRx compatibility
    removeCoupon(couponId: string): Observable<Cart> {
        // Mock implementation - in real app, this would remove applied coupon
        console.log('Removing coupon:', couponId);
        return of(this.createCartFromItems(this.getCartItemsArray()));
    }

    // Load available coupons
    loadAvailableCoupons(): Observable<Coupon[]> {
        // Mock implementation - in real app, this would fetch from Supabase
        return of([]);
    }

    // Clear cart - returns void for compatibility
    clearCart(): Observable<void> {
        this.updateCartItems([]);
        return of(undefined);
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
                // Update quantity of existing item - create a proper copy to avoid readonly issues
                const updatedItems = [...currentItems];
                const existingItem = updatedItems[existingItemIndex];
                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity,
                    updatedAt: new Date().toISOString()
                };
                this.updateCartItems(updatedItems);
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
            }

            // Also add to Supabase cart if user is authenticated
            const currentUser = await this.supabaseService.getCurrentUser().pipe(
                map(user => user),
                catchError(() => of(null))
            ).toPromise();

            if (currentUser) {
                await this.supabaseService.addToCart(productId, quantity, product.price, currentUser.id);
            }

        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        }
    }

    // Remove item from cart by product ID
    removeFromCartByProductId(productId: string): void {
        const currentItems = this.getCartItemsArray();
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        this.updateCartItems(updatedItems);
    }

    // Update item quantity
    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCartByProductId(productId);
            return;
        }

        const currentItems = this.getCartItemsArray();
        const updatedItems = currentItems.map(item =>
            item.productId === productId
                ? {
                    ...item,
                    quantity: Math.min(quantity, item.maxQuantity || 999),
                    updatedAt: new Date().toISOString()
                }
                : item
        );
        this.updateCartItems(updatedItems);
    }

    // Get cart item count
    getCartItemCount(): Observable<number> {
        return this.cartItems.pipe(
            map(items => {
                // Ensure items is an array
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
                // Ensure items is an array
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
                // Ensure items is an array
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
            id: 'local-cart',
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
        // Ensure items is an array
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

    // Sync cart with Supabase for authenticated users
    async syncCartWithSupabase(): Promise<void> {
        try {
            const currentUser = await this.supabaseService.getCurrentUser().pipe(
                map(user => user),
                catchError(() => of(null))
            ).toPromise();

            if (currentUser) {
                const supabaseCartItems = await this.supabaseService.getCartItems(currentUser.id);

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
            }
        } catch (error) {
            console.error('Error syncing cart with Supabase:', error);
        }
    }

    private updateCartItems(items: CartItem[]): void {
        this.cartItems.next(items);
        this.updateCartSummary(items);
        this.saveCartToStorage(items);
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

    private loadCartFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.CART_STORAGE_KEY);
            if (stored) {
                const parsedData = JSON.parse(stored);

                // Validate that the parsed data is an array
                if (Array.isArray(parsedData)) {
                    const items: CartItem[] = parsedData;
                    this.cartItems.next(items);
                    this.updateCartSummary(items);
                } else {
                    console.warn('Invalid cart data in localStorage, clearing cart');
                    // Clear invalid data and start with empty cart
                    localStorage.removeItem(this.CART_STORAGE_KEY);
                    this.cartItems.next([]);
                    this.updateCartSummary([]);
                }
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            // Clear corrupted data and start with empty cart
            localStorage.removeItem(this.CART_STORAGE_KEY);
            this.cartItems.next([]);
            this.updateCartSummary([]);
        }
    }

    private saveCartToStorage(items: CartItem[]): void {
        try {
            localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
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