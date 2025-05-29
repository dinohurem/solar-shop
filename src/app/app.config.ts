import { ApplicationConfig, provideZoneChangeDetection, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { AuthEffects } from './core/auth/store/auth.effects';
import { ProductListEffects } from './features/b2c/products/product-list/store/product-list.effects';
import { ProductDetailsEffects } from './features/b2c/products/product-details/store/product-details.effects';
import { CartEffects } from './features/b2c/cart/store/cart.effects';
import { reducers, metaReducers } from './reducers';
import { provideLottieOptions } from 'ngx-lottie';
import { playerFactory } from './shared/components/loader/loader.component';
import { environment } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'top'
    })),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'en-US' },
    provideStore(reducers, { metaReducers }),
    provideEffects([AuthEffects, ProductListEffects, ProductDetailsEffects, CartEffects]),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      trace: true, // enable tracing
      traceLimit: 25, // maximum stack trace frames to be stored (default is 10)
      features: {
        pause: true, // start/pause recording of dispatched actions
        lock: true, // lock/unlock dispatching actions and side effects
        persist: true, // persist states on page reloading
        export: true, // export history of actions in a file
        import: 'custom', // import history of actions from a file
        jump: true, // jump back and forth (time travelling)
        skip: true, // skip (cancel) actions
        reorder: true, // drag and drop actions in the history list
        dispatch: true, // dispatch custom actions or action creators
        test: true, // generate tests for the selected actions
      }
    }),
    provideLottieOptions({
      player: playerFactory,
    }),
  ]
};
