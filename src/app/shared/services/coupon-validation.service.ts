import { Injectable, inject } from '@angular/core';
import { Observable, from, catchError, of } from 'rxjs';
import { SupabaseService } from '../../services/supabase.service';
import { Coupon, CouponValidationResult } from '../models/coupon.model';
import { CartItem } from '../models/cart.model';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class CouponValidationService {
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);

  /**
   * Validate if a coupon can be applied to the current cart items
   */
  validateCoupon(code: string, cartItems: CartItem[], _userId?: string): Observable<CouponValidationResult> {
    return from(this.validateCouponAsync(code, cartItems)).pipe(
      catchError(error => {
        console.error('Error validating coupon:', error);
        return of({
          isValid: false,
          errorMessage: this.translationService.translate('cart.couponValidationError')
        });
      })
    );
  }

  private async validateCouponAsync(code: string, cartItems: CartItem[]): Promise<CouponValidationResult> {
    try {
      // Step 1: Find the coupon by code
      const coupon = await this.getCouponByCode(code);
      
      if (!coupon) {
        return {
          isValid: false,
          errorMessage: this.translationService.translate('cart.couponNotFound')
        };
      }

      // Step 2: Basic coupon validation
      const basicValidation = this.validateBasicCouponRules(coupon, cartItems);
      if (!basicValidation.isValid) {
        return basicValidation;
      }

      // Step 3: Offer-based validation
      const offerValidation = await this.validateOfferBasedRules(coupon, cartItems);
      if (!offerValidation.isValid) {
        return offerValidation;
      }

      // Step 4: Product and category validation
      const productValidation = this.validateProductAndCategoryRules(coupon, cartItems);
      if (!productValidation.isValid) {
        return productValidation;
      }

      // Step 5: Calculate discount amount
      const discountAmount = this.calculateDiscountAmount(coupon, cartItems);

      return {
        isValid: true,
        discountAmount
      };

    } catch (error) {
      console.error('Error in coupon validation:', error);
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponValidationError')
      };
    }
  }

  private async getCouponByCode(code: string): Promise<Coupon | null> {
    try {
      console.log('Looking for coupon with code:', code);
      
      // Try both the original case and uppercase
      const { data, error } = await this.supabaseService.client
        .from('offers')
        .select('*')
        .or(`code.eq.${code},code.eq.${code.toUpperCase()},code.eq.${code.toLowerCase()}`)
        .eq('is_active', true)
        .not('code', 'is', null);

      console.log('Database query result:', { data, error });

      if (error) {
        console.error('Database error when fetching coupon:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No coupon found with code:', code);
        
        // Debug: Let's see what coupon codes are available
        const { data: allCoupons } = await this.supabaseService.client
          .from('offers')
          .select('code, title, is_active')
          .not('code', 'is', null)
          .limit(10);
        
        console.log('Available coupon codes in database:', allCoupons);
        return null;
      }

      // Use the first matching coupon if multiple exist
      const couponData = Array.isArray(data) ? data[0] : data;

      // Convert database format to Coupon interface
      console.log('Converting coupon data:', couponData);
      
      const coupon = {
        id: couponData.id,
        code: couponData.code,
        title: couponData.title,
        description: couponData.description,
        discountType: couponData.discount_type,
        discountValue: couponData.discount_value,
        maxDiscountAmount: couponData.max_discount_amount,
        minOrderAmount: couponData.min_order_amount,
        maxOrderAmount: couponData.max_order_amount,
        applicableProductIds: couponData.applicable_product_ids,
        excludedProductIds: couponData.excluded_product_ids,
        applicableOfferIds: [], // Not available in offers table
        excludedOfferIds: [], // Not available in offers table
        applicableCategories: couponData.applicable_category_ids || [],
        excludedCategories: couponData.excluded_category_ids || [],
        maxUsage: couponData.max_usage,
        currentUsage: couponData.current_usage || 0,
        maxUsagePerCustomer: couponData.max_usage_per_customer,
        startDate: new Date(couponData.start_date),
        endDate: couponData.end_date ? new Date(couponData.end_date) : undefined,
        isActive: couponData.is_active,
        autoApply: couponData.auto_apply || false,
        featured: couponData.featured || false,
        createdAt: new Date(couponData.created_at),
        updatedAt: new Date(couponData.updated_at)
      };
      
      console.log('Converted coupon:', coupon);
      return coupon;
    } catch (error) {
      console.error('Error fetching coupon:', error);
      return null;
    }
  }

  private validateBasicCouponRules(coupon: Coupon, cartItems: CartItem[]): CouponValidationResult {
    console.log('Validating basic coupon rules for:', coupon.code);
    
    // Check if coupon is active
    if (!coupon.isActive) {
      console.log('Coupon is not active:', coupon.isActive);
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponInactive')
      };
    }

    // Check date validity
    const now = new Date();
    console.log('Date validation - Now:', now, 'Start:', coupon.startDate, 'End:', coupon.endDate);
    
    if (coupon.startDate > now) {
      console.log('Coupon start date is in the future');
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponNotYetValid')
      };
    }

    if (coupon.endDate && coupon.endDate < now) {
      console.log('Coupon has expired');
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponExpired')
      };
    }

    // Check usage limits
    if (coupon.maxUsage && coupon.currentUsage >= coupon.maxUsage) {
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponUsageLimitReached')
      };
    }

    // Calculate cart total
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check minimum order amount
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponMinOrderNotMet', {
          amount: coupon.minOrderAmount.toFixed(2)
        })
      };
    }

    // Check maximum order amount
    if (coupon.maxOrderAmount && cartTotal > coupon.maxOrderAmount) {
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponMaxOrderExceeded', {
          amount: coupon.maxOrderAmount.toFixed(2)
        })
      };
    }

    return { isValid: true };
  }

  private async validateOfferBasedRules(coupon: Coupon, cartItems: CartItem[]): Promise<CouponValidationResult> {
    // If coupon has offer restrictions, validate them
    if (coupon.applicableOfferIds?.length || coupon.excludedOfferIds?.length) {
      const cartOfferIds = cartItems
        .filter(item => item.offerId)
        .map(item => item.offerId!)
        .filter((offerId, index, array) => array.indexOf(offerId) === index); // Remove duplicates

      // Check if cart has any products from applicable offers
      if (coupon.applicableOfferIds?.length) {
        const hasApplicableOffer = cartOfferIds.some(offerId => 
          coupon.applicableOfferIds!.includes(offerId)
        );
        
        if (!hasApplicableOffer) {
          return {
            isValid: false,
            errorMessage: this.translationService.translate('cart.couponNotApplicableToOffers')
          };
        }
      }

      // Check if cart has any products from excluded offers
      if (coupon.excludedOfferIds?.length) {
        const hasExcludedOffer = cartOfferIds.some(offerId => 
          coupon.excludedOfferIds!.includes(offerId)
        );
        
        if (hasExcludedOffer) {
          return {
            isValid: false,
            errorMessage: this.translationService.translate('cart.couponExcludedFromOffers')
          };
        }
      }
    }

    return { isValid: true };
  }

  private validateProductAndCategoryRules(coupon: Coupon, cartItems: CartItem[]): CouponValidationResult {
    // Check applicable products
    if (coupon.applicableProductIds?.length) {
      const hasApplicableProduct = cartItems.some(item => 
        coupon.applicableProductIds!.includes(item.productId)
      );
      
      if (!hasApplicableProduct) {
        return {
          isValid: false,
          errorMessage: this.translationService.translate('cart.couponNotApplicableToProducts')
        };
      }
    }

    // Check excluded products
    if (coupon.excludedProductIds?.length) {
      const hasExcludedProduct = cartItems.some(item => 
        coupon.excludedProductIds!.includes(item.productId)
      );
      
      if (hasExcludedProduct) {
        return {
          isValid: false,
          errorMessage: this.translationService.translate('cart.couponExcludedFromProducts')
        };
      }
    }

    // Check applicable categories
    if (coupon.applicableCategories?.length) {
      const hasApplicableCategory = cartItems.some(item => 
        coupon.applicableCategories!.includes(item.category)
      );
      
      if (!hasApplicableCategory) {
        return {
          isValid: false,
          errorMessage: this.translationService.translate('cart.couponNotApplicableToCategories')
        };
      }
    }

    // Check excluded categories
    if (coupon.excludedCategories?.length) {
      const hasExcludedCategory = cartItems.some(item => 
        coupon.excludedCategories!.includes(item.category)
      );
      
      if (hasExcludedCategory) {
        return {
          isValid: false,
          errorMessage: this.translationService.translate('cart.couponExcludedFromCategories')
        };
      }
    }

    return { isValid: true };
  }

  private calculateDiscountAmount(coupon: Coupon, cartItems: CartItem[]): number {
    // Calculate eligible items total (considering restrictions)
    const eligibleItems = this.getEligibleItems(coupon, cartItems);
    const eligibleTotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountAmount = 0;

    switch (coupon.discountType) {
      case 'percentage':
        discountAmount = eligibleTotal * (coupon.discountValue / 100);
        break;
      case 'fixed_amount':
        discountAmount = Math.min(coupon.discountValue, eligibleTotal);
        break;
      case 'free_shipping':
        discountAmount = 0; // Shipping discount handled separately
        break;
    }

    // Apply maximum discount amount if specified
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }

  private getEligibleItems(coupon: Coupon, cartItems: CartItem[]): CartItem[] {
    return cartItems.filter(item => {
      // Check product restrictions
      if (coupon.applicableProductIds?.length && !coupon.applicableProductIds.includes(item.productId)) {
        return false;
      }
      if (coupon.excludedProductIds?.length && coupon.excludedProductIds.includes(item.productId)) {
        return false;
      }

      // Check category restrictions
      if (coupon.applicableCategories?.length && !coupon.applicableCategories.includes(item.category)) {
        return false;
      }
      if (coupon.excludedCategories?.length && coupon.excludedCategories.includes(item.category)) {
        return false;
      }

      // Check offer restrictions
      if (coupon.applicableOfferIds?.length) {
        if (!item.offerId || !coupon.applicableOfferIds.includes(item.offerId)) {
          return false;
        }
      }
      if (coupon.excludedOfferIds?.length && item.offerId && coupon.excludedOfferIds.includes(item.offerId)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get available coupons for current cart
   */
  getAvailableCoupons(cartItems: CartItem[]): Observable<Coupon[]> {
    return from(this.getAvailableCouponsAsync(cartItems)).pipe(
      catchError(error => {
        console.error('Error fetching available coupons:', error);
        return of([]);
      })
    );
  }

  private async getAvailableCouponsAsync(cartItems: CartItem[]): Promise<Coupon[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.supabaseService.client
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .not('code', 'is', null) // Only get offers with coupon codes
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('featured', { ascending: false });

      if (error || !data) {
        return [];
      }

      // Convert and filter coupons based on cart compatibility
      const coupons: Coupon[] = data.map(item => ({
        id: item.id,
        code: item.code,
        title: item.title,
        description: item.description,
        discountType: item.discount_type,
        discountValue: item.discount_value,
        maxDiscountAmount: item.max_discount_amount,
        minOrderAmount: item.min_order_amount,
        maxOrderAmount: item.max_order_amount,
        applicableProductIds: item.applicable_product_ids,
        excludedProductIds: item.excluded_product_ids,
        applicableOfferIds: [], // Not available in offers table
        excludedOfferIds: [], // Not available in offers table
        applicableCategories: item.applicable_category_ids || [],
        excludedCategories: item.excluded_category_ids || [],
        maxUsage: item.max_usage,
        currentUsage: item.current_usage || 0,
        maxUsagePerCustomer: item.max_usage_per_customer,
        startDate: new Date(item.start_date),
        endDate: item.end_date ? new Date(item.end_date) : undefined,
        isActive: item.is_active,
        autoApply: item.auto_apply || false,
        featured: item.featured || false,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      // Filter coupons that are potentially applicable to the current cart
      return coupons.filter(coupon => this.isPotentiallyApplicable(coupon, cartItems));
    } catch (error) {
      console.error('Error fetching available coupons:', error);
      return [];
    }
  }

  private isPotentiallyApplicable(coupon: Coupon, cartItems: CartItem[]): boolean {
    // Quick check to see if coupon could potentially apply to cart items
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Check minimum order amount
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return false;
    }

    // Check if coupon has product restrictions and cart has compatible products
    if (coupon.applicableProductIds?.length) {
      const cartProductIds = cartItems.map(item => item.productId);
      const hasCompatibleProduct = cartProductIds.some(productId => 
        coupon.applicableProductIds!.includes(productId)
      );
      if (!hasCompatibleProduct) {
        return false;
      }
    }

    // Check if coupon has category restrictions and cart has compatible categories
    if (coupon.applicableCategories?.length) {
      const cartCategories = cartItems.map(item => item.category);
      const hasCompatibleCategory = cartCategories.some(category => 
        coupon.applicableCategories!.includes(category)
      );
      if (!hasCompatibleCategory) {
        return false;
      }
    }

    return true;
  }
}