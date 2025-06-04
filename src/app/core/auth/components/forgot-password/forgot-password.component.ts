import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { State } from '../../../../reducers';
import { sendResetPasswordEmail } from '../../store/auth.actions';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  loading$: Observable<boolean>;
  resetPasswordRequestSent: boolean = false;
  resetPasswordMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private store: Store<State>) {
    this.loading$ = this.store.pipe(select(state => state.auth.loading));
  }

  onResetPassword(email: string): void {
    this.resetPasswordRequestSent = true;
    this.resetPasswordMessage = "We have sent password reset instructions to your email. Please check your inbox.";
    this.errorMessage = null; // Clear any previous errors
    this.store.dispatch(sendResetPasswordEmail({ email }));
  }
}
