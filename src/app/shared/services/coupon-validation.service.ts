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
  private usedCouponsInSession = new Set<string>(); // Track coupons used in current session

  /**
   * Validate if a coupon can be applied to the current cart items
   */
  validateCoupon(code: string, cartItems: CartItem[], _userId?: string): Observable<CouponValidationResult> {
    return from(this.validateCouponAsync(code, cartItems)).pipe(
      catchError(error => {
        console.error('Error validating coupon:', error);
        return of({
          isValid: false,
          errorMessage: this.translationService.translate('cart.couponValidationError'),
          discountAmount: undefined,
          coupon: undefined
        } as CouponValidationResult);
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
          errorMessage: this.translationService.translate('cart.couponNotFound'),
          discountAmount: undefined,
          coupon: undefined
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
      const discountAmount = await this.calculateDiscountAmount(coupon, cartItems);

      return {
        isValid: true,
        discountAmount,
        coupon
      };

    } catch (error) {
      console.error('Error in coupon validation:', error);
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponValidationError'),
        discountAmount: undefined,
        coupon: undefined
      };
    }
  }

  private async getCouponByCode(code: string): Promise<Coupon | null> {
    try {
      console.log('Looking for coupon with code:', code);

      // Fix the query syntax - Supabase expects each condition in the OR to be a full filter
      // First, let's check what columns exist by doing a simple query
      const { data, error } = await this.supabaseService.client
        .from('offers')
        .select('*')
        .or(`code.eq."${code}",code.eq."${code.toUpperCase()}",code.eq."${code.toLowerCase()}"`)
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
          .select('code, title, *')
          .not('code', 'is', null)
          .limit(10);

        console.log('Available coupon codes in database:', allCoupons);
        return null;
      }

      // Use the first matching coupon if multiple exist
      const couponData = Array.isArray(data) ? data[0] : data;

      // Convert database format to Coupon interface
      console.log('Converting coupon data:', couponData);
      console.log('Raw usage fields:', {
        max_usage: couponData.max_usage,
        current_usage: couponData.current_usage,
        usage_limit: couponData.usage_limit,
        times_used: couponData.times_used
      });
      
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
        maxUsage: couponData.max_usage !== null && couponData.max_usage !== undefined ? couponData.max_usage : (couponData.usage_limit !== null && couponData.usage_limit !== undefined ? couponData.usage_limit : null),
        currentUsage: couponData.current_usage || couponData.times_used || 0,
        maxUsagePerCustomer: couponData.max_usage_per_customer,
        startDate: new Date(couponData.start_date),
        endDate: couponData.end_date ? new Date(couponData.end_date) : undefined,
        isActive: couponData.active !== false, // Default to true if not specified
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

    // Allow reapplying coupons - users can apply the same coupon multiple times
    // to discount newly added products (for regular offers) or to complete bundles
    // The cart service will handle ensuring products don't get double-discounted
    if (this.usedCouponsInSession.has(coupon.code.toLowerCase())) {
      console.log('Coupon already applied - allowing reapplication for new products:', coupon.code);
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      console.log('Coupon is not active:', coupon.isActive);
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponInactive'),
        discountAmount: undefined,
        coupon: undefined
      };
    }

    // Check date validity
    const now = new Date();
    console.log('Date validation - Now:', now, 'Start:', coupon.startDate, 'End:', coupon.endDate);
    
    if (coupon.startDate > now) {
      console.log('Coupon start date is in the future');
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponNotYetValid'),
        discountAmount: undefined,
        coupon: undefined
      };
    }

    if (coupon.endDate && coupon.endDate < now) {
      console.log('Coupon has expired');
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponExpired'),
        discountAmount: undefined,
        coupon: undefined
      };
    }

    // Check usage limits
    // Note: maxUsage represents "uses left", not total limit
    // If maxUsage is null, the offer has unlimited usage
    const usagesLeft = coupon.maxUsage;
    const currentUsage = Number(coupon.currentUsage) || 0;

    console.log('Usage validation - Uses left:', usagesLeft, 'Times used:', currentUsage);

    // Check if there are any uses left (null means unlimited)
    if (usagesLeft !== null && usagesLeft !== undefined && Number(usagesLeft) <= 0) {
      console.log('Coupon has no uses left:', { usagesLeft, currentUsage });
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponUsageLimitReached'),
        discountAmount: undefined,
        coupon: undefined
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
        }),
        discountAmount: undefined,
        coupon: undefined
      };
    }

    // Check maximum order amount
    if (coupon.maxOrderAmount && cartTotal > coupon.maxOrderAmount) {
      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponMaxOrderExceeded', {
          amount: coupon.maxOrderAmount.toFixed(2)
        }),
        discountAmount: undefined,
        coupon: undefined
      };
    }

    return { isValid: true };
  }

  private async validateOfferBasedRules(coupon: Coupon, cartItems: CartItem[]): Promise<CouponValidationResult> {
    // Check if cart contains products that already have OTHER offer discounts applied
    // Allow re-applying the same coupon (to newly added products)
    const itemsWithOtherOffers = cartItems.filter(item => {
      const hasOffer = item.offerId || item.offerName || item.offerSavings;
      if (!hasOffer) return false;

      // Allow if it's the same coupon/offer being reapplied
      const isSameCoupon = item.offerName && item.offerName.toLowerCase().includes(coupon.code.toLowerCase());
      if (isSameCoupon) return false;

      return true; // Different offer exists
    });

    if (itemsWithOtherOffers.length > 0) {
      console.log('Cart contains items with DIFFERENT offer discounts:', itemsWithOtherOffers.map(item => ({
        name: item.name,
        offerId: item.offerId,
        offerName: item.offerName,
        offerSavings: item.offerSavings
      })));

      return {
        isValid: false,
        errorMessage: this.translationService.translate('cart.couponCannotApplyToDiscountedProducts') || 'Cannot apply coupon to products that already have offer discounts',
        discountAmount: undefined,
        coupon: undefined
      };
    }

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
            errorMessage: this.translationService.translate('cart.couponNotApplicableToOffers'),
            discountAmount: undefined,
            coupon: undefined
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
            errorMessage: this.translationService.translate('cart.couponExcludedFromOffers'),
            discountAmount: undefined,
            coupon: undefined
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
          errorMessage: this.translationService.translate('cart.couponNotApplicableToProducts'),
          discountAmount: undefined,
          coupon: undefined
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
          errorMessage: this.translationService.translate('cart.couponExcludedFromProducts'),
          discountAmount: undefined,
          coupon: undefined
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
          errorMessage: this.translationService.translate('cart.couponNotApplicableToCategories'),
          discountAmount: undefined,
          coupon: undefined
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

  private async calculateDiscountAmount(coupon: Coupon, cartItems: CartItem[]): Promise<number> {
    // Calculate eligible items total (considering restrictions)
    const eligibleItems = this.getEligibleItems(coupon, cartItems);

    let discountAmount = 0;

    // Priority 1: Check if this coupon has specific product discounts
    const individualDiscountAmount = await this.calculateIndividualProductDiscounts(coupon.id, cartItems);
    if (individualDiscountAmount > 0) {
      console.log('Applied individual product discounts:', individualDiscountAmount);
      return individualDiscountAmount;
    }

    // Priority 2: Apply category-based or general discount to eligible items
    console.log('No individual product discounts found, applying general discount to eligible items');
    const eligibleTotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    switch (coupon.discountType) {
      case 'percentage':
        discountAmount = eligibleTotal * (coupon.discountValue / 100);
        console.log(`Percentage discount: ${coupon.discountValue}% of €${eligibleTotal} = €${discountAmount}`);
        break;
      case 'fixed_amount':
        discountAmount = Math.min(coupon.discountValue, eligibleTotal);
        console.log(`Fixed amount discount: €${coupon.discountValue} (limited to total €${eligibleTotal}) = €${discountAmount}`);
        break;
      case 'free_shipping':
        discountAmount = 0; // Shipping discount handled separately
        console.log('Free shipping discount applied');
        break;
    }

    // Apply maximum discount amount if specified
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      console.log(`Discount capped at maximum: €${coupon.maxDiscountAmount} (was €${discountAmount})`);
      discountAmount = coupon.maxDiscountAmount;
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }

  private getEligibleItems(coupon: Coupon, cartItems: CartItem[]): CartItem[] {
    console.log('Filtering eligible items for general discount application');
    console.log('Coupon restrictions:', {
      applicableProductIds: coupon.applicableProductIds,
      excludedProductIds: coupon.excludedProductIds,
      applicableCategories: coupon.applicableCategories,
      excludedCategories: coupon.excludedCategories
    });

    const eligibleItems = cartItems.filter(item => {
      // Check product restrictions
      if (coupon.applicableProductIds?.length && !coupon.applicableProductIds.includes(item.productId)) {
        console.log(`Item ${item.name} excluded: not in applicable products`);
        return false;
      }
      if (coupon.excludedProductIds?.length && coupon.excludedProductIds.includes(item.productId)) {
        console.log(`Item ${item.name} excluded: in excluded products`);
        return false;
      }

      // Check category restrictions
      if (coupon.applicableCategories?.length && !coupon.applicableCategories.includes(item.category)) {
        console.log(`Item ${item.name} excluded: category ${item.category} not in applicable categories`);
        return false;
      }
      if (coupon.excludedCategories?.length && coupon.excludedCategories.includes(item.category)) {
        console.log(`Item ${item.name} excluded: category ${item.category} in excluded categories`);
        return false;
      }

      // Check offer restrictions
      if (coupon.applicableOfferIds?.length) {
        if (!item.offerId || !coupon.applicableOfferIds.includes(item.offerId)) {
          console.log(`Item ${item.name} excluded: not from applicable offers`);
          return false;
        }
      }
      if (coupon.excludedOfferIds?.length && item.offerId && coupon.excludedOfferIds.includes(item.offerId)) {
        console.log(`Item ${item.name} excluded: from excluded offers`);
        return false;
      }

      console.log(`Item ${item.name} is eligible for general discount`);
      return true;
    });

    console.log(`Found ${eligibleItems.length} eligible items for general discount out of ${cartItems.length} total items`);
    return eligibleItems;
  }

  /**
   * Calculate individual product discounts for a coupon linked to an offer
   * Returns both the total discount amount and details for individual application
   */
  private async calculateIndividualProductDiscounts(couponId: string, cartItems: CartItem[]): Promise<number> {
    try {
      console.log('=== CALCULATING INDIVIDUAL PRODUCT DISCOUNTS ===');
      console.log('Coupon ID:', couponId);
      console.log('Cart items:', cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })));

      // Query offer_products to get individual product discounts for this offer
      // First try to get all columns to see what exists
      const { data: offerProducts, error } = await this.supabaseService.client
        .from('offer_products')
        .select('*')
        .eq('offer_id', couponId);

      if (error) {
        console.error('Error fetching offer products:', error);
        return 0;
      }

      if (!offerProducts || offerProducts.length === 0) {
        console.log('✅ No specific product discounts found - will use category/general discount');
        return 0;
      }

      console.log('📋 Raw offer_products data:', offerProducts);
      console.log('📋 Available columns:', Object.keys(offerProducts[0] || {}));

      console.log('📋 Available product discounts in database:', offerProducts.map(op => ({
        productId: op.product_id,
        type: op.discount_type || op.type || 'unknown',
        amount: op.discount_amount || op.amount,
        percentage: op.discount_percentage || op.percentage
      })));

      let totalDiscount = 0;
      let hasMatchingProducts = false;

      // Calculate discount ONLY for cart items that match specific product discounts
      console.log('🔍 Checking which cart items match specific product discounts...');

      for (const cartItem of cartItems) {
        const productDiscount = offerProducts.find(op => op.product_id === cartItem.productId);

        if (productDiscount) {
          hasMatchingProducts = true;
          let itemDiscount = 0;

          console.log(`✅ MATCH FOUND: ${cartItem.name} (ID: ${cartItem.productId})`);
          console.log(`   Discount data:`, {
            type: productDiscount.discount_type,
            amount: productDiscount.discount_amount,
            percentage: productDiscount.discount_percentage
          });

          // Handle discount types - if type is undefined, check amounts to determine type
          const discountType = productDiscount.discount_type || productDiscount.type ||
            (productDiscount.discount_amount > 0 ? 'fixed_amount' :
             productDiscount.discount_percentage > 0 ? 'percentage' : 'unknown');

          const discountAmount = productDiscount.discount_amount || productDiscount.amount || 0;
          const discountPercentage = productDiscount.discount_percentage || productDiscount.percentage || 0;

          console.log(`   Determined type: ${discountType}, amount: ${discountAmount}, percentage: ${discountPercentage}`);

          if (discountType === 'fixed_amount' && discountAmount > 0) {
            // Fixed amount discount per unit - multiply by quantity
            // If you have 4 units of a product with 50 EUR discount, total discount = 4 × 50 EUR = 200 EUR
            itemDiscount = discountAmount * cartItem.quantity;
            console.log(`   💰 Fixed discount: €${discountAmount} × ${cartItem.quantity} units = €${itemDiscount}`);
          } else if (discountType === 'percentage' && discountPercentage > 0) {
            // Percentage discount on the item's total price (quantity considered for percentage)
            const itemTotal = cartItem.price * cartItem.quantity;
            itemDiscount = itemTotal * (discountPercentage / 100);
            console.log(`   📊 Percentage discount: ${discountPercentage}% of €${itemTotal} = €${itemDiscount}`);
          } else {
            console.log(`   ❌ No valid discount found: type=${discountType}, amount=${discountAmount}, percentage=${discountPercentage}`);
          }

          totalDiscount += itemDiscount;
          console.log(`   📈 Running total after ${cartItem.name}: €${totalDiscount}`);
        } else {
          console.log(`❌ NO MATCH: ${cartItem.name} (ID: ${cartItem.productId}) - not in specific product discounts`);
        }
      }

      if (hasMatchingProducts) {
        const matchingCount = cartItems.filter(item =>
          offerProducts.some(op => op.product_id === item.productId)
        ).length;

        console.log(`🎯 FINAL RESULT: €${totalDiscount}`);
        console.log(`   Applied to ${matchingCount} out of ${cartItems.length} cart items`);
        console.log(`   Discount source: SPECIFIC PRODUCT DISCOUNTS`);
        console.log('=== END INDIVIDUAL PRODUCT CALCULATION ===');

        return Math.round(totalDiscount * 100) / 100;
      } else {
        console.log('❌ No cart items match ANY specific products - will use category/general discount');
        console.log('=== END INDIVIDUAL PRODUCT CALCULATION ===');
        return 0;
      }
    } catch (error) {
      console.error('Error calculating individual product discounts:', error);
      return 0;
    }
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
        maxUsage: item.max_usage !== null && item.max_usage !== undefined ? item.max_usage : (item.usage_limit !== null && item.usage_limit !== undefined ? item.usage_limit : null),
        currentUsage: item.current_usage || item.times_used || 0,
        maxUsagePerCustomer: item.max_usage_per_customer,
        startDate: new Date(item.start_date),
        endDate: item.end_date ? new Date(item.end_date) : undefined,
        isActive: item.active !== false, // Default to true if not specified
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

  /**
   * Increment the usage count for an offer when it's successfully used
   */
  incrementOfferUsage(offerId: string): Observable<boolean> {
    return from(this.incrementOfferUsageAsync(offerId)).pipe(
      catchError(error => {
        console.error('Error incrementing offer usage:', error);
        return of(false);
      })
    );
  }

  private async incrementOfferUsageAsync(offerId: string): Promise<boolean> {
    try {
      console.log('Using coupon for offer:', offerId);

      // First get current usage data
      const { data: offerData, error: fetchError } = await this.supabaseService.client
        .from('offers')
        .select('current_usage, max_usage')
        .eq('id', offerId)
        .single();

      if (fetchError) {
        console.error('Error fetching current offer usage:', fetchError);
        return false;
      }

      const currentUsage = offerData.current_usage || 0;
      const usagesLeft = offerData.max_usage;

      // Check if there are any uses left (null means unlimited)
      if (usagesLeft !== null && usagesLeft !== undefined && Number(usagesLeft) <= 0) {
        console.warn('No uses left for offer:', { currentUsage, usagesLeft });
        return false;
      }

      // Increment current_usage and decrement max_usage (uses left) only if not unlimited
      const updateData: any = {
        current_usage: currentUsage + 1,
        updated_at: new Date().toISOString()
      };

      // Only decrement max_usage if it's not null (unlimited)
      if (usagesLeft !== null && usagesLeft !== undefined) {
        updateData.max_usage = Number(usagesLeft) - 1;
      }

      const { error: updateError } = await this.supabaseService.client
        .from('offers')
        .update(updateData)
        .eq('id', offerId);

      if (updateError) {
        console.error('Error updating offer usage:', updateError);
        return false;
      }

      console.log('Successfully used coupon:', {
        offerId,
        oldCurrentUsage: currentUsage,
        newCurrentUsage: currentUsage + 1,
        oldUsagesLeft: usagesLeft,
        newUsagesLeft: usagesLeft !== null && usagesLeft !== undefined ? Number(usagesLeft) - 1 : 'unlimited'
      });

      return true;
    } catch (error) {
      console.error('Error in incrementOfferUsageAsync:', error);
      return false;
    }
  }

  /**
   * Mark a coupon as used in the current session
   */
  markCouponAsUsedInSession(code: string): void {
    this.usedCouponsInSession.add(code.toLowerCase());
    console.log('Marked coupon as used in session:', code);
  }

  /**
   * Remove a coupon from the session tracking
   */
  removeCouponFromSession(code: string): void {
    this.usedCouponsInSession.delete(code.toLowerCase());
    console.log('Removed coupon from session tracking:', code);
  }

  /**
   * Clear all session coupon tracking (useful for cart clear or checkout completion)
   */
  clearSessionCouponTracking(): void {
    this.usedCouponsInSession.clear();
    console.log('Cleared all session coupon tracking');
  }
}