import { isDevMode } from '@angular/core';
import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { authReducer } from '../core/auth/store/auth.reducer';
import { AuthState } from '../core/auth/store/auth.state';
import { navbarReducer } from '../features/b2c/navbar/store/navbar.reducer';
import { NavbarState } from '../features/b2c/navbar/store/navbar.state';
import { heroReducer } from '../features/b2c/hero/store/hero.reducer';
import { HeroState } from '../features/b2c/hero/store/hero.state';
import { offersReducer } from '../features/b2c/offers/store/offers.reducer';
import { OffersState } from '../features/b2c/offers/store/offers.state';
import { productsReducer } from '../features/b2c/products/store/products.reducer';
import { ProductsState } from '../features/b2c/products/store/products.state';
import { productListReducer } from '../features/b2c/products/product-list/store/product-list.reducer';
import { ProductListState } from '../features/b2c/products/product-list/store/product-list.reducer';
import { productDetailsReducer } from '../features/b2c/products/product-details/store/product-details.reducer';
import { ProductDetailsState } from '../features/b2c/products/product-details/store/product-details.reducer';
import { sustainabilityReducer } from '../features/b2c/sustainability/store/sustainability.reducer';
import { SustainabilityState } from '../features/b2c/sustainability/store/sustainability.state';
import { blogReducer } from '../features/b2c/blog/store/blog.reducer';
import { BlogState } from '../features/b2c/blog/store/blog.state';
import { footerReducer } from '../features/b2c/footer/store/footer.reducer';
import { FooterState } from '../features/b2c/footer/store/footer.state';
import { cartReducer } from '../features/b2c/cart/store/cart.reducer';
import { CartState } from '../features/b2c/cart/store/cart.state';
import { wishlistReducer } from '../features/b2c/wishlist/store/wishlist.reducer';
import { WishlistState } from '../shared/models/wishlist.model';
import { companiesReducer } from '../features/admin/companies/store/companies.reducer';
import { CompaniesState } from '../features/admin/companies/store/companies.state';
import { ordersReducer } from '../features/admin/orders/store/orders.reducer';
import { OrdersState } from '../features/admin/orders/store/orders.state';
import { reviewsReducer } from '../features/admin/reviews/store/reviews.reducer';
import { ReviewsState } from '../features/admin/reviews/store/reviews.state';

export interface State {
  auth: AuthState;
  navbar: NavbarState;
  hero: HeroState;
  offers: OffersState;
  products: ProductsState;
  productList: ProductListState;
  productDetails: ProductDetailsState;
  sustainability: SustainabilityState;
  blog: BlogState;
  footer: FooterState;
  cart: CartState;
  wishlist: WishlistState;
  companies: CompaniesState;
  adminOrders: OrdersState;
  reviews: ReviewsState;
}

export const reducers: ActionReducerMap<State> = {
  auth: authReducer,
  navbar: navbarReducer,
  hero: heroReducer,
  offers: offersReducer,
  products: productsReducer,
  productList: productListReducer,
  productDetails: productDetailsReducer,
  sustainability: sustainabilityReducer,
  blog: blogReducer,
  footer: footerReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  companies: companiesReducer,
  adminOrders: ordersReducer,
  reviews: reviewsReducer,
};

export const metaReducers: MetaReducer<State>[] = isDevMode() ? [] : [];