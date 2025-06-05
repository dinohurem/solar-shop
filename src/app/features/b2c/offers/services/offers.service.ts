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

            let filteredOffers = supabaseOffers;

            if (filters?.featured !== undefined) {
                filteredOffers = filteredOffers.filter(offer => offer.featured === filters.featured);
            }

            if (filters?.type) {
                filteredOffers = filteredOffers.filter(offer => offer.type === filters.type);
            }

            if (filters?.limit) {
                filteredOffers = filteredOffers.slice(0, filters.limit);
            }

            return this.convertSupabaseOffersToLocal(filteredOffers);
        } catch (error) {
            console.error('Error in fetchOffersFromSupabase:', error);
            return [];
        }
    }

    private async fetchActiveOffers(limit?: number): Promise<Offer[]> {
        try {
            const supabaseOffers = await this.supabaseService.getActiveOffers();

            let offers = supabaseOffers;
            if (limit) {
                offers = offers.slice(0, limit);
            }

            return this.convertSupabaseOffersToLocal(offers);
        } catch (error) {
            console.error('Error in fetchActiveOffers:', error);
            return [];
        }
    }

    private async fetchFeaturedOffers(limit?: number): Promise<Offer[]> {
        try {
            const supabaseOffers = await this.supabaseService.getActiveOffers();

            let offers = supabaseOffers.filter(offer => offer.featured);
            if (limit) {
                offers = offers.slice(0, limit);
            }

            return this.convertSupabaseOffersToLocal(offers);
        } catch (error) {
            console.error('Error in fetchFeaturedOffers:', error);
            return [];
        }
    }

    private async fetchOfferById(id: string): Promise<Offer | null> {
        try {
            const offer = await this.supabaseService.getTableById('offers', id);
            if (!offer) return null;

            return this.convertSupabaseOfferToLocal(offer);
        } catch (error) {
            console.error('Error in fetchOfferById:', error);
            return null;
        }
    }

    private convertSupabaseOffersToLocal(offers: any[]): Offer[] {
        return offers.map(offer => this.convertSupabaseOfferToLocal(offer)).filter(Boolean) as Offer[];
    }

    private convertSupabaseOfferToLocal(offer: any): Offer | null {
        try {
            // Calculate discounted price based on discount type and value
            let originalPrice = 100; // Default base price for percentage calculations
            let discountedPrice = originalPrice;
            let discountPercentage = 0;

            if (offer.discount_type === 'percentage') {
                discountPercentage = offer.discount_value;
                discountedPrice = originalPrice * (1 - discountPercentage / 100);
            } else if (offer.discount_type === 'fixed_amount') {
                discountedPrice = Math.max(0, originalPrice - offer.discount_value);
                discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
            }

            // For display purposes, we'll use reasonable price ranges based on offer type
            if (offer.type === 'seasonal_sale' || offer.type === 'flash_sale') {
                originalPrice = 1000;
                discountedPrice = originalPrice * (1 - offer.discount_value / 100);
            } else if (offer.type === 'free_shipping') {
                originalPrice = 50; // Shipping cost
                discountedPrice = 0;
                discountPercentage = 100;
            }

            return {
                id: offer.id,
                title: offer.title,
                originalPrice: Math.round(originalPrice * 100) / 100,
                discountedPrice: Math.round(discountedPrice * 100) / 100,
                discountPercentage: Math.round(discountPercentage),
                imageUrl: offer.image_url || this.getDefaultOfferImage(offer.type),
                description: offer.description,
                shortDescription: offer.short_description,
                type: offer.type,
                status: offer.status,
                couponCode: offer.coupon_code,
                startDate: offer.start_date,
                endDate: offer.end_date,
                featured: offer.featured
            };
        } catch (error) {
            console.error('Error converting offer:', error);
            return null;
        }
    }

    private getDefaultOfferImage(offerType: string): string {
        const imageMap: { [key: string]: string } = {
            'seasonal_sale': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
            'flash_sale': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
            'free_shipping': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=500&fit=crop',
            'bundle_deal': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&h=500&fit=crop',
            'percentage_discount': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop',
            'fixed_amount_discount': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop'
        };

        return imageMap[offerType] || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop';
    }
} 