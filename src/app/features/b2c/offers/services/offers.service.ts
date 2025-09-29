import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { SupabaseService } from '../../../../services/supabase.service';
import { OfferFilters, Offer } from '../../../../shared/models/offer.model';
@Injectable({
    providedIn: 'root'
})
export class OffersService {

    constructor(private supabaseService: SupabaseService) { }

    getOffers(filters?: OfferFilters): Observable<Offer[]> {
        return from(this.fetchOffersFromSupabase(filters)).pipe(
            catchError(error => {
                console.error('Error fetching offers:', error);
                return of([]);
            })
        );
    }

    getActiveOffers(limit?: number): Observable<Offer[]> {
        return from(this.fetchActiveOffers(limit)).pipe(
            catchError(error => {
                console.error('Error fetching active offers:', error);
                return of([]);
            })
        );
    }

    getFeaturedOffers(limit?: number): Observable<Offer[]> {
        return from(this.fetchFeaturedOffers(limit)).pipe(
            catchError(error => {
                console.error('Error fetching featured offers:', error);
                return of([]);
            })
        );
    }

    getOfferById(id: string): Observable<Offer | null> {
        return from(this.fetchOfferById(id)).pipe(
            catchError(error => {
                console.error('Error fetching offer:', error);
                return of(null);
            })
        );
    }

    private async fetchOffersFromSupabase(filters?: OfferFilters): Promise<Offer[]> {
        try {
            const supabaseOffers = await this.supabaseService.getActiveOffers();

            let filteredOffers = supabaseOffers.filter(offer => !offer.is_b2b); // Only B2C offers

            if (filters?.featured !== undefined) {
                filteredOffers = filteredOffers.filter(offer => offer.featured === filters.featured);
            }

            if (filters?.limit) {
                filteredOffers = filteredOffers.slice(0, filters.limit);
            }

            return await this.convertSupabaseOffersToLocal(filteredOffers);
        } catch (error) {
            console.error('Error in fetchOffersFromSupabase:', error);
            return [];
        }
    }

    private async fetchActiveOffers(limit?: number): Promise<Offer[]> {
        try {
            const supabaseOffers = await this.supabaseService.getActiveOffers();

            let offers = supabaseOffers.filter(offer => !offer.is_b2b); // Only B2C offers
            if (limit) {
                offers = offers.slice(0, limit);
            }

            return await this.convertSupabaseOffersToLocal(offers);
        } catch (error) {
            console.error('Error in fetchActiveOffers:', error);
            return [];
        }
    }

    private async fetchFeaturedOffers(limit?: number): Promise<Offer[]> {
        try {
            const supabaseOffers = await this.supabaseService.getActiveOffers();

            let offers = supabaseOffers.filter(offer => !offer.is_b2b && offer.featured); // Only B2C featured offers
            if (limit) {
                offers = offers.slice(0, limit);
            }

            return await this.convertSupabaseOffersToLocal(offers);
        } catch (error) {
            console.error('Error in fetchFeaturedOffers:', error);
            return [];
        }
    }

    private async fetchOfferById(id: string): Promise<Offer | null> {
        try {
            const offer = await this.supabaseService.getTableById('offers', id);
            if (!offer || offer.is_b2b) return null; // Only return B2C offers

            return await this.convertSupabaseOfferToLocal(offer);
        } catch (error) {
            console.error('Error in fetchOfferById:', error);
            return null;
        }
    }

    private async convertSupabaseOffersToLocal(offers: any[]): Promise<Offer[]> {
        const offerPromises = offers.map(offer => this.convertSupabaseOfferToLocal(offer));
        const convertedOffers = await Promise.all(offerPromises);
        return convertedOffers.filter(Boolean) as Offer[];
    }

    private async convertSupabaseOfferToLocal(offer: any): Promise<Offer | null> {
        try {
            // Get offer products to calculate real pricing
            const { originalPrice, discountedPrice } = await this.calculateOfferPricing(offer);
            let discountPercentage = 0;

            console.log('Offers Service - Converting offer:', {
                offerId: offer.id,
                title: offer.title,
                discount_type: offer.discount_type,
                discount_value: offer.discount_value,
                calculatedOriginal: originalPrice,
                calculatedDiscounted: discountedPrice,
                difference: originalPrice - discountedPrice
            });

            if (originalPrice > 0) {
                if (offer.discount_type === 'percentage') {
                    discountPercentage = offer.discount_value;
                } else if (offer.discount_type === 'fixed_amount') {
                    discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
                }
            }

            return {
                id: offer.id,
                title: offer.title,
                originalPrice: Math.round(originalPrice * 100) / 100,
                discountedPrice: Math.round(discountedPrice * 100) / 100,
                discountPercentage: Math.round(discountPercentage),
                imageUrl: offer.image_url || this.getDefaultOfferImage(),
                description: offer.description,
                shortDescription: offer.short_description,
                status: offer.status,
                couponCode: offer.code,
                startDate: offer.start_date,
                endDate: offer.end_date,
                featured: offer.featured,
                discount_type: offer.discount_type,
                discount_value: offer.discount_value
            };
        } catch (error) {
            console.error('Error converting offer:', error);
            return null;
        }
    }

    private async calculateOfferPricing(offer: any): Promise<{ originalPrice: number; discountedPrice: number }> {
        try {
            // Get products associated with this offer
            const { data: offerProducts, error } = await this.supabaseService.client
                .from('offer_products')
                .select(`
                    *,
                    products (
                        id,
                        name,
                        price
                    )
                `)
                .eq('offer_id', offer.id);

            if (error || !offerProducts || offerProducts.length === 0) {
                // If no products, use placeholder values for general offers
                const originalPrice = 100;
                let discountedPrice = originalPrice;

                console.log('calculateOfferPricing - No products, using placeholder logic:', {
                    offerId: offer.id,
                    discount_type: offer.discount_type,
                    discount_value: offer.discount_value,
                    originalPrice
                });

                if (offer.discount_type === 'percentage') {
                    discountedPrice = originalPrice * (1 - offer.discount_value / 100);
                    console.log('Applied percentage discount to placeholder:', discountedPrice);
                } else if (offer.discount_type === 'fixed_amount') {
                    discountedPrice = Math.max(0, originalPrice - offer.discount_value);
                    console.log('Applied fixed amount discount to placeholder:', discountedPrice);
                } else {
                    console.log('NO DISCOUNT APPLIED to placeholder - discount_type not recognized:', offer.discount_type);
                }

                return { originalPrice, discountedPrice };
            }

            // Calculate pricing based on specific product discounts or general offer discount
            let totalOriginalPrice = 0;
            let totalDiscountAmount = 0;

            console.log('calculateOfferPricing - analyzing offer products:', {
                offerId: offer.id,
                offerProductsCount: offerProducts.length,
                products: offerProducts.map(op => ({
                    productId: op.product_id,
                    productPrice: op.products?.price,
                    discountType: op.discount_type,
                    discountAmount: op.discount_amount,
                    discountPercentage: op.discount_percentage
                }))
            });

            // Calculate original price and total discount
            for (const offerProduct of offerProducts) {
                const productPrice = offerProduct.products?.price || 0;
                totalOriginalPrice += productPrice;

                // Check if this product has individual discount settings
                const hasIndividualDiscount = offerProduct.discount_amount > 0 || offerProduct.discount_percentage > 0;

                if (hasIndividualDiscount) {
                    // Use individual product discount
                    if (offerProduct.discount_type === 'fixed_amount' && offerProduct.discount_amount > 0) {
                        totalDiscountAmount += offerProduct.discount_amount;
                        console.log(`Product ${offerProduct.product_id} has individual fixed discount: €${offerProduct.discount_amount}`);
                    } else if (offerProduct.discount_type === 'percentage' && offerProduct.discount_percentage > 0) {
                        const productDiscount = productPrice * (offerProduct.discount_percentage / 100);
                        totalDiscountAmount += productDiscount;
                        console.log(`Product ${offerProduct.product_id} has individual percentage discount: ${offerProduct.discount_percentage}% = €${productDiscount}`);
                    }
                } else {
                    // Use general offer discount
                    if (offer.discount_type === 'percentage') {
                        const productDiscount = productPrice * (offer.discount_value / 100);
                        totalDiscountAmount += productDiscount;
                        console.log(`Product ${offerProduct.product_id} uses general percentage discount: ${offer.discount_value}% = €${productDiscount}`);
                    } else if (offer.discount_type === 'fixed_amount') {
                        // For fixed amount, divide equally among products (or could be applied differently based on business logic)
                        const discountPerProduct = offer.discount_value / offerProducts.length;
                        totalDiscountAmount += discountPerProduct;
                        console.log(`Product ${offerProduct.product_id} uses general fixed discount: €${discountPerProduct} (€${offer.discount_value} / ${offerProducts.length} products)`);
                    }
                }
            }

            const totalDiscountedPrice = Math.max(0, totalOriginalPrice - totalDiscountAmount);

            console.log('calculateOfferPricing final calculation:', {
                offerId: offer.id,
                totalOriginalPrice,
                totalDiscountAmount,
                totalDiscountedPrice,
                discountType: offer.discount_type,
                discountValue: offer.discount_value
            });

            return {
                originalPrice: totalOriginalPrice,
                discountedPrice: totalDiscountedPrice
            };
        } catch (error) {
            console.error('Error calculating offer pricing:', error);
            // Fallback to placeholder values
            const originalPrice = 100;
            let discountedPrice = originalPrice;

            if (offer.discount_type === 'percentage') {
                discountedPrice = originalPrice * (1 - offer.discount_value / 100);
            }

            return { originalPrice, discountedPrice };
        }
    }

    private getDefaultOfferImage(): string {
        return 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop';
    }
} 