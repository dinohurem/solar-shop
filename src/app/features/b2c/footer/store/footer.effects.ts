import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { FooterActions } from './footer.actions';
import { SupabaseService } from '../../../../services/supabase.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { FooterData } from '../footer.component';

@Injectable()
export class FooterEffects {
    loadFooterData$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(FooterActions.loadFooterData),
            map(() => {
                // Since we have the data in the initial state, we can just return success
                const data: FooterData = {
                    sections: [
                        {
                            title: 'Products',
                            links: [
                                { label: 'Building Materials', url: '/products/building-materials' },
                                { label: 'Electrical Systems', url: '/products/electrical-systems' },
                                { label: 'Energy Solutions', url: '/products/energy-solutions' },
                                { label: 'Finishes & Coatings', url: '/products/finishes-coatings' },
                                { label: 'Tools & Accessories', url: '/products/tools-accessories' },
                            ]
                        },
                        {
                            title: 'Services',
                            links: [
                                { label: 'Energy Consulting', url: '/services/energy-consulting' },
                                { label: 'Installation', url: '/services/installation' },
                                { label: 'Maintenance', url: '/services/maintenance' },
                                { label: 'Certifications', url: '/services/certifications' },
                                { label: 'Technical Support', url: '/services/technical-support' },
                            ]
                        },
                        {
                            title: 'Company',
                            links: [
                                { label: 'About Us', url: '/company' },
                                { label: 'Our Mission', url: '/mission' },
                                { label: 'Offers & Promotions', url: '/offers' },
                                { label: 'Blog & Guides', url: '/blog' },
                                { label: 'Contact', url: '/contact' },
                            ]
                        }
                    ],
                    socialLinks: [
                        {
                            platform: 'Facebook',
                            url: 'https://facebook.com/heyhome',
                            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.162.038 1.466.074v3.297h-1.254c-1.454 0-1.726.703-1.726 1.833v2.354h3.39l-.477 3.667h-2.913v7.98H9.101z"/></svg>'
                        },
                        {
                            platform: 'Instagram',
                            url: 'https://instagram.com/heyhome',
                            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>'
                        },
                        {
                            platform: 'LinkedIn',
                            url: 'https://linkedin.com/company/heyhome',
                            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
                        },
                        {
                            platform: 'YouTube',
                            url: 'https://youtube.com/heyhome',
                            icon: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
                        }
                    ],
                    contactInfo: {
                        address: 'Zagreb, Croatia',
                        phone: '+385 91 123 4567',
                        email: 'info@solarshop.hr',
                        hours: 'Mon-Fri: 8:00-18:00, Sat: 9:00-13:00'
                    },
                    newsletter: {
                        title: 'Newsletter',
                        description: 'Get the latest news on sustainable products, energy efficiency tips and exclusive offers.'
                    }
                };
                return FooterActions.loadFooterDataSuccess({ data });
            }),
            catchError((error) => {
                console.error('Error loading footer data:', error);
                return of(FooterActions.loadFooterDataFailure({ error: 'Failed to load footer data' }));
            })
        );
    });

    subscribeNewsletter$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FooterActions.subscribeNewsletter),
            mergeMap(({ email }) =>
                from(this.supabaseService.createRecord('contacts', { email, is_newsletter: true })).pipe(
                    map(() => FooterActions.subscribeNewsletterSuccess({ message: this.translationService.translate('footer.subscribed') })),
                    catchError(error => of(FooterActions.subscribeNewsletterFailure({ error: error.message || 'Subscription failed' })))
                )
            )
        )
    );

    constructor(
        private actions$: Actions,
        private store: Store,
        private supabaseService: SupabaseService,
        private translationService: TranslationService
    ) { }
}
