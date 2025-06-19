import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FooterData } from '../footer.component';

export const FooterActions = createActionGroup({
    source: 'Footer',
    events: {
        'Load Footer Data': emptyProps(),
        'Load Footer Data Success': props<{ data: FooterData }>(),
        'Load Footer Data Failure': props<{ error: string }>(),
        'Subscribe Newsletter': props<{ email: string }>(),
        'Subscribe Newsletter Success': props<{ message: string }>(),
        'Subscribe Newsletter Failure': props<{ error: string }>(),
        'Reset Newsletter State': emptyProps(),
    },
}); 