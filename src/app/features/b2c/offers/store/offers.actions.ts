import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Offer } from '../../../../shared/models/offer.model';

export const OffersActions = createActionGroup({
    source: 'Offers',
    events: {
        'Load Offers': emptyProps(),
        'Load Offers Success': props<{ offers: Offer[] }>(),
        'Load Offers Failure': props<{ error: string }>(),
    },
}); 