import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule, LoaderComponent]
})
export class ConfirmationComponent implements OnInit, OnDestroy {
    email: string = '';
    loading = false;
    resendLoading = false;
    successMessage = '';
    errorMessage = '';
    resendCooldown = 0;
    private cooldownInterval?: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private supabaseService: SupabaseService
    ) { }

    ngOnInit(): void {
        // Get email from query params
        this.route.queryParams.subscribe(params => {
            this.email = params['email'] || '';
        });
    }

    ngOnDestroy(): void {
        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
        }
    }

    async resendConfirmationEmail(): Promise<void> {
        if (!this.email || this.resendCooldown > 0) {
            return;
        }

        this.resendLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        try {
            const { error } = await this.supabaseService.resendConfirmationEmail(this.email);

            if (error) {
                this.errorMessage = error;
            } else {
                this.successMessage = 'Confirmation email sent successfully! Please check your inbox.';
                this.startCooldown();
            }
        } catch (error: any) {
            this.errorMessage = error.message || 'Failed to resend confirmation email';
        } finally {
            this.resendLoading = false;
        }
    }

    private startCooldown(): void {
        this.resendCooldown = 60; // 60 seconds cooldown
        this.cooldownInterval = setInterval(() => {
            this.resendCooldown--;
            if (this.resendCooldown <= 0) {
                clearInterval(this.cooldownInterval);
            }
        }, 1000);
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }
} 