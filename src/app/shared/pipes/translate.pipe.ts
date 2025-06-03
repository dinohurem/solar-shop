import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslationService, SupportedLanguage } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
    name: 'translate',
    pure: false,
    standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
    private subscription: Subscription;
    private lastKey: string = '';
    private lastParams: Record<string, string | number> | undefined;
    private lastValue: string = '';
    private lastLanguage: SupportedLanguage = 'hr';
    private forceUpdate: boolean = false;

    constructor(
        private translationService: TranslationService,
        private cdr: ChangeDetectorRef
    ) {
        this.subscription = this.translationService.currentLanguage$.subscribe((language) => {
            // Update the last language and force an update when language changes
            if (this.lastLanguage !== language) {
                this.lastLanguage = language;
                this.forceUpdate = true;
                this.cdr.markForCheck();
            }
        });
    }

    transform(key: string, params?: Record<string, string | number>): string {
        const currentLanguage = this.translationService.getCurrentLanguage();

        // Check if we need to update the translation
        if (key !== this.lastKey ||
            JSON.stringify(params) !== JSON.stringify(this.lastParams) ||
            currentLanguage !== this.lastLanguage ||
            this.forceUpdate) {

            this.lastKey = key;
            this.lastParams = params;
            this.lastLanguage = currentLanguage;
            this.lastValue = this.translationService.translate(key, params);
            this.forceUpdate = false;
        }

        return this.lastValue;
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
} 