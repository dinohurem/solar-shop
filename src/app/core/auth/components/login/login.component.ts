// core/auth/login.component.ts
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { LoginRequest } from '../../../../shared/models/auth.model';
import * as AuthActions from '../../store/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth.selectors';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [CommonModule, RouterModule, LoaderComponent, ReactiveFormsModule, TranslatePipe],
  providers: [],
})
export class LoginComponent {
  showPassword = false;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  loginForm: FormGroup;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private router: Router,
    private translationService: TranslationService
  ) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginRequest: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.store.dispatch(AuthActions.login({ loginRequest }));
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        const displayName = this.getFieldDisplayName(fieldName);
        return this.translationService.translate('auth.required', { field: displayName });
      }
      if (field.errors['email']) {
        return this.translationService.translate('auth.invalidEmail');
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        const displayName = this.getFieldDisplayName(fieldName);
        return this.translationService.translate('auth.passwordMinLength', {
          field: displayName,
          length: requiredLength
        });
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const translationKey = `auth.${fieldName}`;
    return this.translationService.translate(translationKey);
  }
}
