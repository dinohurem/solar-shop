import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { B2BCartItem, B2BAppliedCoupon } from '../models/b2b-cart.model';
import { SupabaseService } from '../../../../services/supabase.service';
import { CouponValidationService } from '../../../../shared/services/coupon-validation.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { CartItem } from '../../../../shared/models/cart.model';
import { Coupon } from '../../../../shared/models/coupon.model';

interface AddToCartOptions {
    partnerOfferId?: string;
    partnerOfferName?: string;
    partnerOfferType?: 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle' | 'buy_x_get_y';
    partnerOfferDiscount?: number;
    partnerOfferValidUntil?: string;
    individualDiscount?: number;
    individualDiscountType?: 'percentage' | 'fixed_amount';
    originalPrice?: number;
}

@Injectable({
    providedIn: 'root'
})
export class B2BCartService {
    private readonly STORAGE_KEY = 'b2b_cart_';
    private readonly COUPON_STORAGE_KEY = 'b2b_cart_coupons_';

    constructor(
        private supabaseService: SupabaseService,
        private couponValidationService: CouponValidationService,
        private translationService: TranslationService
    ) { }

    /**
     * Load cart for a specific company
     */
    loadCart(companyId: string): Observable<{ items: B2BCartItem[]; companyName: string; appliedCoupons: B2BAppliedCoupon[]; couponDiscount: number }> {
        const storedItems = this.loadStoredCart(companyId);
        const parsedItems = storedItems.map(item => this.parseStoredCartItem(item));
        const appliedCoupons = this.loadStoredCoupons(companyId);
        const couponDiscount = this.calculateCouponDiscount(appliedCoupons);

        return from(this.getCompanyName(companyId)).pipe(
            map(companyName => ({ items: parsedItems, companyName, appliedCoupons, couponDiscount })),
            delay(300)
        );
    }

    /**
     * Add item to cart
     */
    addToCart(productId: string, quantity: number, companyId: string, options: AddToCartOptions = {}): Observable<B2BCartItem> {
        return from(this.getProductWithPricing(productId, companyId)).pipe(
            map(product => {
                if (!product) {
                    throw new Error('Product not found');
                }

                const retailPrice = options.originalPrice ?? product.price ?? 0;
                const baseCompanyPrice = product.company_price ?? product.partner_price ?? product.price ?? retailPrice;
                const offerPrice = options.partnerOfferId
                    ? this.calculateOfferUnitPrice(retailPrice, options.partnerOfferType, options.partnerOfferDiscount, options.individualDiscount, options.individualDiscountType)
                    : baseCompanyPrice;

                const unitPrice = options.partnerOfferId ? Math.min(baseCompanyPrice, offerPrice) : baseCompanyPrice;
                const totalPrice = unitPrice * quantity;
                const totalSavingsPerUnit = retailPrice - unitPrice;
                const standardSavingsPerUnit = Math.max(0, retailPrice - baseCompanyPrice);
                const additionalSavingsPerUnit = Math.max(0, totalSavingsPerUnit - standardSavingsPerUnit);

                const newItem: B2BCartItem = {
                    id: this.generateId(),
                    productId,
                    name: product.name,
                    sku: product.sku,
                    imageUrl: this.getProductImageUrl(product.images) || 'assets/images/product-placeholder.svg',
                    quantity,
                    unitPrice,
                    retailPrice,
                    totalPrice,
                    minimumOrder: product.minimum_order || 1,
                    companyPrice: product.company_price,
                    partnerPrice: product.partner_price,
                    savings: totalSavingsPerUnit * quantity,
                    category: product.category,
                    inStock: (product.stock_quantity || 0) > 0,
                    addedAt: new Date(),
                    partnerOfferId: options.partnerOfferId,
                    partnerOfferName: options.partnerOfferName,
                    partnerOfferType: options.partnerOfferType,
                    partnerOfferDiscount: options.partnerOfferDiscount,
                    partnerOfferOriginalPrice: options.partnerOfferId ? retailPrice : undefined,
                    partnerOfferValidUntil: options.partnerOfferValidUntil,
                    partnerOfferAppliedAt: options.partnerOfferId ? new Date() : undefined,
                    additionalSavings: additionalSavingsPerUnit * quantity
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
            const retailPrice = items[itemIndex].retailPrice;
            const unitPrice = items[itemIndex].unitPrice;
            const companyPrice = items[itemIndex].companyPrice ?? items[itemIndex].partnerPrice ?? retailPrice;
            const totalSavingsPerUnit = retailPrice - unitPrice;
            const standardSavingsPerUnit = Math.max(0, retailPrice - companyPrice);
            const additionalSavingsPerUnit = Math.max(0, totalSavingsPerUnit - standardSavingsPerUnit);

            items[itemIndex] = {
                ...items[itemIndex],
                quantity,
                totalPrice: unitPrice * quantity,
                savings: totalSavingsPerUnit * quantity,
                additionalSavings: additionalSavingsPerUnit * quantity,
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
        this.clearStoredCoupons(companyId);
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
     * Apply coupon to the current cart
     */
    applyCoupon(code: string, cartItems: B2BCartItem[], companyId: string): Observable<{ coupon: Coupon; discount: number }> {
        return from(this.applyCouponAsync(code, cartItems, companyId));
    }

    /**
     * Remove applied coupon
     */
    removeCoupon(couponId: string, companyId: string): Observable<boolean> {
        return new Observable<boolean>(observer => {
            try {
                const coupons = this.loadStoredCoupons(companyId);
                const updatedCoupons = coupons.filter(coupon => coupon.id !== couponId);

                if (updatedCoupons.length === coupons.length) {
                    throw new Error(this.translationService.translate('cart.couponNotFound'));
                }

                this.saveStoredCoupons(companyId, updatedCoupons);
                observer.next(true);
                observer.complete();
            } catch (error: any) {
                observer.error(error);
            }
        }).pipe(delay(150));
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
            const existingItem = this.parseStoredCartItem(items[existingIndex]);
            const updatedQuantity = existingItem.quantity + newItem.quantity;
            const useNewPricing = newItem.unitPrice <= existingItem.unitPrice;
            const pricingSource = useNewPricing ? newItem : existingItem;
            const retailPrice = Math.max(existingItem.retailPrice, newItem.retailPrice);
            const unitPrice = Math.min(existingItem.unitPrice, newItem.unitPrice);
            const companyPrice = pricingSource.companyPrice ?? existingItem.companyPrice ?? existingItem.partnerPrice ?? retailPrice;
            const totalSavingsPerUnit = retailPrice - unitPrice;
            const standardSavingsPerUnit = Math.max(0, retailPrice - companyPrice);
            const additionalSavingsPerUnit = Math.max(0, totalSavingsPerUnit - standardSavingsPerUnit);

            const updatedItem: B2BCartItem = {
                ...existingItem,
                ...pricingSource,
                quantity: updatedQuantity,
                unitPrice,
                retailPrice,
                totalPrice: unitPrice * updatedQuantity,
                savings: totalSavingsPerUnit * updatedQuantity,
                additionalSavings: additionalSavingsPerUnit * updatedQuantity,
                addedAt: new Date()
            };

            items[existingIndex] = updatedItem;
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

    private loadStoredCart(companyId: string): B2BCartItem[] {
        const storageKey = this.STORAGE_KEY + companyId;
        const storedCart = localStorage.getItem(storageKey);
        return storedCart ? JSON.parse(storedCart) : [];
    }

    private parseStoredCartItem(item: any): B2BCartItem {
        return {
            ...item,
            addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
            partnerOfferAppliedAt: item.partnerOfferAppliedAt ? new Date(item.partnerOfferAppliedAt) : item.partnerOfferAppliedAt,
            totalPrice: Number(item.totalPrice ?? 0),
            unitPrice: Number(item.unitPrice ?? 0),
            retailPrice: Number(item.retailPrice ?? 0),
            savings: Number(item.savings ?? 0),
            quantity: Number(item.quantity ?? 0),
            minimumOrder: Number(item.minimumOrder ?? 1),
            additionalSavings: Number(item.additionalSavings ?? 0)
        };
    }

    private calculateOfferUnitPrice(
        retailPrice: number,
        offerType?: 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle' | 'buy_x_get_y',
        offerDiscount?: number,
        individualDiscount?: number,
        individualDiscountType?: 'percentage' | 'fixed_amount'
    ): number {
        let price = retailPrice;

        if (offerType === 'percentage') {
            price = retailPrice * (1 - (offerDiscount ?? 0) / 100);
        } else if (offerType === 'fixed_amount') {
            price = Math.max(0, retailPrice - (offerDiscount ?? 0));
        }

        if (individualDiscount) {
            if (individualDiscountType === 'percentage') {
                price = Math.max(0, price * (1 - individualDiscount / 100));
            } else if (individualDiscountType === 'fixed_amount') {
                price = Math.max(0, price - individualDiscount);
            }
        }

        return Math.max(0, price);
    }

    private async applyCouponAsync(code: string, cartItems: B2BCartItem[], companyId: string): Promise<{ coupon: Coupon; discount: number }> {
        try {
            const mappedItems: CartItem[] = cartItems.map(item => this.mapB2BItemToCartItem(item));
            const validationResult = await firstValueFrom(this.couponValidationService.validateCoupon(code, mappedItems));

            if (!validationResult.isValid || !validationResult.coupon || !validationResult.discountAmount) {
                throw new Error(validationResult.errorMessage || this.translationService.translate('cart.couponValidationError'));
            }

            const storedCoupons = this.loadStoredCoupons(companyId);
            if (storedCoupons.length > 0) {
                throw new Error(this.translationService.translate('cart.singleCouponOnly'));
            }

            const duplicateCoupon = storedCoupons.some(coupon => coupon.code.toLowerCase() === validationResult.coupon!.code.toLowerCase());
            if (duplicateCoupon) {
                throw new Error(this.translationService.translate('cart.couponAlreadyApplied'));
            }

            const appliedCoupon: B2BAppliedCoupon = {
                id: validationResult.coupon.id,
                code: validationResult.coupon.code,
                type: validationResult.coupon.discountType,
                value: validationResult.coupon.discountValue,
                discountAmount: validationResult.discountAmount,
                appliedAt: new Date().toISOString(),
                title: validationResult.coupon.title,
                description: validationResult.coupon.description
            };

            this.saveStoredCoupons(companyId, [appliedCoupon]);

            if (validationResult.coupon.id) {
                try {
                    await firstValueFrom(this.couponValidationService.incrementOfferUsage(validationResult.coupon.id));
                } catch (error) {
                    console.warn('Failed to increment coupon usage', error);
                }
            }

            return {
                coupon: validationResult.coupon,
                discount: validationResult.discountAmount
            };
        } catch (error: any) {
            throw new Error(error?.message || this.translationService.translate('cart.couponValidationError'));
        }
    }

    private mapB2BItemToCartItem(item: B2BCartItem): CartItem {
        const addedAt = item.addedAt instanceof Date ? item.addedAt : new Date(item.addedAt);
        const offerType = item.partnerOfferType;
        const mappedOfferType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle' | undefined =
            offerType === 'percentage' || offerType === 'fixed_amount'
                ? offerType
                : offerType === 'bundle'
                    ? 'bundle'
                    : offerType === 'tier_based'
                        ? 'bundle'
                        : offerType === 'buy_x_get_y'
                            ? 'buy_x_get_y'
                            : undefined;

        return {
            id: item.id,
            productId: item.productId,
            variantId: undefined,
            name: item.name,
            description: undefined,
            sku: item.sku,
            price: item.unitPrice,
            originalPrice: item.retailPrice,
            quantity: item.quantity,
            minQuantity: item.minimumOrder ?? 1,
            maxQuantity: Math.max(item.quantity, item.minimumOrder ?? 1) * 10,
            weight: 0,
            dimensions: '',
            image: item.imageUrl,
            category: item.category || 'general',
            brand: '',
            customizations: [],
            addedAt: addedAt.toISOString(),
            updatedAt: addedAt.toISOString(),
            availability: {
                quantity: item.quantity,
                stockStatus: item.inStock ? 'in_stock' : 'out_of_stock'
            },
            shippingInfo: {
                weight: 0,
                dimensions: '',
                shippingClass: '',
                freeShipping: false
            },
            taxInfo: {
                taxable: false,
                taxClass: '',
                taxRate: 0,
                taxAmount: 0
            },
            offerId: item.partnerOfferId,
            offerName: item.partnerOfferName,
            offerType: mappedOfferType,
            offerDiscount: item.partnerOfferDiscount,
            offerOriginalPrice: item.partnerOfferOriginalPrice,
            offerValidUntil: item.partnerOfferValidUntil,
            offerAppliedAt: item.partnerOfferAppliedAt ? (item.partnerOfferAppliedAt instanceof Date ? item.partnerOfferAppliedAt.toISOString() : item.partnerOfferAppliedAt) : undefined,
            offerSavings: item.additionalSavings
        };
    }

    private getCouponStorageKey(companyId: string): string {
        return this.COUPON_STORAGE_KEY + companyId;
    }

    private loadStoredCoupons(companyId: string): B2BAppliedCoupon[] {
        const stored = localStorage.getItem(this.getCouponStorageKey(companyId));
        if (!stored) {
            return [];
        }

        try {
            const parsed = JSON.parse(stored) as B2BAppliedCoupon[];
            return parsed.map(coupon => ({
                ...coupon,
                discountAmount: Number(coupon.discountAmount ?? 0)
            }));
        } catch (error) {
            console.error('Failed to parse stored coupons', error);
            return [];
        }
    }

    private saveStoredCoupons(companyId: string, coupons: B2BAppliedCoupon[]): void {
        localStorage.setItem(this.getCouponStorageKey(companyId), JSON.stringify(coupons));
    }

    private clearStoredCoupons(companyId: string): void {
        localStorage.removeItem(this.getCouponStorageKey(companyId));
    }

    private calculateCouponDiscount(coupons: B2BAppliedCoupon[]): number {
        const total = coupons.reduce((sum, coupon) => sum + (coupon.discountAmount || 0), 0);
        return Math.round(total * 100) / 100;
    }
}
