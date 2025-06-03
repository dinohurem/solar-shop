import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, } from '@angular/router';
import { Store } from '@ngrx/store';
import { CartSidebarComponent } from './features/b2c/cart/components/cart-sidebar/cart-sidebar.component';
import * as AuthActions from './core/auth/store/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, CartSidebarComponent]
})
export class AppComponent implements OnInit {
  title = 'solar-shop';

  private store = inject(Store);

  ngOnInit(): void {
    // Check for existing auth token on app initialization
    this.store.dispatch(AuthActions.checkAuthToken());
  }
}
