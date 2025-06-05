import { Offer } from '../../../../shared/models/offer.model';

export interface OffersState {
    offers: Offer[];
    isLoading: boolean;
    error: string | null;
}

export const initialOffersState: OffersState = {
    offers: [],
    isLoading: false,
    error: null,
}; 