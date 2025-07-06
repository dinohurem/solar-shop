import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import * as AuthActions from '../../store/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth.selectors';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: true,
    schemas: [NO_ERRORS_SCHEMA],
    imports: [CommonModule, RouterModule, LoaderComponent, ReactiveFormsModule, TranslatePipe],
    providers: [],
})
export class RegisterComponent {
    showPassword = false;
    showConfirmPassword = false;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    registerForm: FormGroup;

    constructor(
        private store: Store,
        private fb: FormBuilder,
        private router: Router,
        private translateService: TranslationService
    ) {
        this.loading$ = this.store.select(selectAuthLoading);
        this.error$ = this.store.select(selectAuthError);

        this.registerForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            phoneNumber: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
            address: ['', [Validators.minLength(10)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    // Custom validator to check if passwords match
    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        if (confirmPassword?.errors?.['passwordMismatch']) {
            delete confirmPassword.errors['passwordMismatch'];
            if (Object.keys(confirmPassword.errors).length === 0) {
                confirmPassword.setErrors(null);
            }
        }

        return null;
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            const formData = this.registerForm.value;
            const registerRequest: AuthActions.RegisterRequest = {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phoneNumber || '',
                address: formData.address || '',
                confirmPassword: formData.confirmPassword
            };

            this.store.dispatch(AuthActions.register({ registerRequest }));
        } else {
            // Mark all fields as touched to show validation errors
            this.registerForm.markAllAsTouched();
        }
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    // Helper methods for form validation
    isFieldInvalid(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.registerForm.get(fieldName);
        if (field && field.errors && (field.dirty || field.touched)) {
            if (field.errors['required']) {
                return this.translateService.translate('auth.fieldRequired', { field: this.getFieldDisplayName(fieldName) });
            }
            if (field.errors['email']) {
                return this.translateService.translate('register.emailInvalid');
            }
            if (field.errors['minlength']) {
                const requiredLength = field.errors['minlength'].requiredLength;
                return this.translateService.translate('register.fieldMinLength', { field: this.getFieldDisplayName(fieldName), min: requiredLength });
            }
            if (field.errors['pattern']) {
                if (fieldName === 'phoneNumber') {
                    return this.translateService.translate('register.phoneNumberInvalid');
                }
            }
            if (field.errors['passwordMismatch']) {
                return this.translateService.translate('register.passwordMismatch');
            }
        }
        return '';
    }

    private getFieldDisplayName(fieldName: string): string {
        const displayNames: { [key: string]: string } = {
            email: this.translateService.translate('register.email'),
            firstName: this.translateService.translate('register.firstName'),
            lastName: this.translateService.translate('register.lastName'),
            phoneNumber: this.translateService.translate('register.phoneNumber'),
            address: this.translateService.translate('register.address'),
            password: this.translateService.translate('register.password'),
            confirmPassword: this.translateService.translate('register.confirmPassword')
        };
        return displayNames[fieldName] || fieldName;
    }
} 