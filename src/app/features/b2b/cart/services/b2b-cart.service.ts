import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { B2BCartItem } from '../models/b2b-cart.model';
import { SupabaseService } from '../../../../services/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class B2BCartService {
    private readonly STORAGE_KEY = 'b2b_cart_';

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Load cart for a specific company
     */
    loadCart(companyId: string): Observable<{ items: B2BCartItem[]; companyName: string }> {
        const storageKey = this.STORAGE_KEY + companyId;
        const storedCart = localStorage.getItem(storageKey);
        const items: B2BCartItem[] = storedCart ? JSON.parse(storedCart) : [];

        const parsedItems = items.map(item => ({
            ...item,
            addedAt: new Date(item.addedAt)
        }));

        return from(this.getCompanyName(companyId)).pipe(
            map(companyName => ({ items: parsedItems, companyName })),
            delay(300)
        );
    }

    /**
     * Add item to cart
     */
    addToCart(productId: string, quantity: number, companyId: string): Observable<B2BCartItem> {
        return from(this.getProductWithPricing(productId, companyId)).pipe(
            map(product => {
                if (!product) {
                    throw new Error('Product not found');
                }

                const unitPrice = product.company_price || product.price;
                const savings = product.price - unitPrice;

                const newItem: B2BCartItem = {
                    id: this.generateId(),
                    productId,
                    name: product.name,
                    sku: product.sku,
                    imageUrl: this.getProductImageUrl(product.images) || 'assets/images/product-placeholder.svg',
                    quantity,
                    unitPrice,
                    retailPrice: product.price,
                    totalPrice: unitPrice * quantity,
                    minimumOrder: product.minimum_order || 1,
                    companyPrice: product.company_price,
                    partnerPrice: product.partner_price,
                    savings: savings * quantity,
                    category: product.category,
                    inStock: (product.stock_quantity || 0) > 0,
                    addedAt: new Date()
                };

                this.saveCartItem(companyId, newItem);
                return newItem;
            }),
            delay(200)
        );
    }

    /**
     * Update cart item quantity
     */
    updateCartItem(productId: string, quantity: number, companyId: string): Observable<boolean> {
        const storageKey = this.STORAGE_KEY + companyId;
        const storedCart = localStorage.getItem(storageKey);
        let items: B2BCartItem[] = storedCart ? JSON.parse(storedCart) : [];

        const itemIndex = items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            throw new Error('Item not found in cart');
        }

        if (quantity === 0) {
            items = items.filter(item => item.productId !== productId);
        } else {
            items[itemIndex] = {
                ...items[itemIndex],
                quantity,
                totalPrice: items[itemIndex].unitPrice * quantity,
                savings: (items[itemIndex].retailPrice - items[itemIndex].unitPrice) * quantity,
                addedAt: new Date()
            };
        }

        localStorage.setItem(storageKey, JSON.stringify(items));
        return of(true).pipe(delay(200));
    }

    /**
     * Remove item from cart
     */
    removeFromCart(productId: string, companyId: string): Observable<boolean> {
        const storageKey = this.STORAGE_KEY + companyId;
        const storedCart = localStorage.getItem(storageKey);
        let items: B2BCartItem[] = storedCart ? JSON.parse(storedCart) : [];

        items = items.filter(item => item.productId !== productId);
        localStorage.setItem(storageKey, JSON.stringify(items));

        return of(true).pipe(delay(200));
    }

    /**
     * Clear entire cart
     */
    clearCart(companyId: string): Observable<boolean> {
        const storageKey = this.STORAGE_KEY + companyId;
        localStorage.removeItem(storageKey);
        return of(true).pipe(delay(200));
    }

    /**
     * Sync cart with server (for now just returns current cart)
     */
    syncCart(companyId: string): Observable<B2BCartItem[]> {
        return this.loadCart(companyId).pipe(
            map(({ items }) => items),
            delay(300)
        );
    }

    /**
     * Save single cart item to localStorage
     */
    private saveCartItem(companyId: string, newItem: B2BCartItem): void {
        const storageKey = this.STORAGE_KEY + companyId;
        const storedCart = localStorage.getItem(storageKey);
        let items: B2BCartItem[] = storedCart ? JSON.parse(storedCart) : [];

        const existingIndex = items.findIndex(item => item.productId === newItem.productId);
        if (existingIndex >= 0) {
            items[existingIndex] = {
                ...items[existingIndex],
                quantity: items[existingIndex].quantity + newItem.quantity,
                totalPrice: (items[existingIndex].quantity + newItem.quantity) * items[existingIndex].unitPrice,
                addedAt: new Date()
            };
        } else {
            items.push(newItem);
        }

        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    /**
     * Generate unique ID for cart items
     */
    private generateId(): string {
        return 'cart_item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get company name from database
     */
    private async getCompanyName(companyId: string): Promise<string> {
        try {
            const { data: company, error } = await this.supabaseService.client
                .from('companies')
                .select('company_name')
                .eq('id', companyId)
                .eq('status', 'approved')
                .single();

            if (error || !company) {
                return 'Unknown Company';
            }

            return company.company_name;
        } catch (error) {
            console.error('Error fetching company name:', error);
            return 'Unknown Company';
        }
    }

    /**
     * Get product image URL from images array
     */
    private getProductImageUrl(images: any): string {
        if (images && Array.isArray(images) && images.length > 0) {
            return images[0].url || images[0];
        }
        return '';
    }

    /**
     * Get product with pricing information from database
     */
    private async getProductWithPricing(productId: string, companyId: string): Promise<any> {
        // Get product details (try with is_active first, fallback without it)
        let product, productError;
        try {
            const result = await this.supabaseService.client
                .from('products')
                .select('*')
                .eq('id', productId)
                .eq('is_active', true)
                .single();
            product = result.data;
            productError = result.error;
        } catch (error) {
            // Fallback query without is_active filter
            console.warn('Falling back to query without is_active filter');
            const result = await this.supabaseService.client
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            product = result.data;
            productError = result.error;
        }

        if (productError || !product) {
            throw new Error('Product not found');
        }

        // Get company-specific pricing (handle gracefully if table doesn't exist or no permissions)
        let companyPricing = null;
        try {
            const { data, error } = await this.supabaseService.client
                .from('company_pricing')
                .select('price, minimum_order')
                .eq('company_id', companyId)
                .eq('product_id', productId)
                .single();
            
            if (!error) {
                companyPricing = data;
            }
        } catch (error) {
            console.warn('Company pricing not available for product:', productId, error);
            // Continue without company pricing
        }

        return {
            ...product,
            company_price: companyPricing?.price,
            minimum_order: companyPricing?.minimum_order || 1,
            partner_price: undefined // TODO: Add partner pricing logic
        };
    }
} 