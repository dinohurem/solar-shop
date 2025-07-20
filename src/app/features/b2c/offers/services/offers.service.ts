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
                discount_type: offer.discount_type
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

                if (offer.discount_type === 'percentage') {
                    discountedPrice = originalPrice * (1 - offer.discount_value / 100);
                } else if (offer.discount_type === 'fixed_amount') {
                    discountedPrice = Math.max(0, originalPrice - offer.discount_value);
                }

                return { originalPrice, discountedPrice };
            }

            // Calculate total original price first
            let totalOriginalPrice = 0;
            for (const offerProduct of offerProducts) {
                const productPrice = offerProduct.products?.price || 0;
                totalOriginalPrice += productPrice;
            }

            // Calculate discounted price based on discount type
            let totalDiscountedPrice = 0;
            if (offer.discount_type === 'percentage') {
                totalDiscountedPrice = totalOriginalPrice * (1 - offer.discount_value / 100);
            } else if (offer.discount_type === 'fixed_amount') {
                totalDiscountedPrice = Math.max(0, totalOriginalPrice - offer.discount_value);
            } else {
                totalDiscountedPrice = totalOriginalPrice;
            }

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