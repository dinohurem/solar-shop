import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './core/auth/guards/admin.guard';
import { ForgotPasswordComponent } from './core/auth/components/forgot-password/forgot-password.component';
import { LoginComponent } from './core/auth/components/login/login.component';
import { RegisterComponent } from './core/auth/components/register/register.component';
import { ResetPasswordComponent } from './core/auth/components/reset-password/reset-password.component';
import { ConfirmationComponent } from './core/auth/components/confirmation/confirmation.component';
import { PageLayoutComponent } from './core/page-layout/page-layout.component';
import { CompanyComponent } from './features/b2c/company/company.component';
import { BlogComponent } from './features/b2c/blog/blog.component';
import { BlogDetailComponent } from './features/b2c/blog/blog-detail.component';
import { ProductListComponent } from './features/b2c/products/product-list/product-list.component';
import { HomeComponent } from './features/b2c/home/home.component';
import { ProductDetailsComponent } from './features/b2c/products/product-details/product-details.component';
import { OffersPageComponent } from './features/b2c/offers/offers-page.component';
import { OfferDetailsComponent } from './features/b2c/offers/offer-details.component';
import { ContactComponent } from './features/b2c/contact/contact.component';
import { PrivacyPolicyComponent } from './features/b2c/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './features/b2c/terms-of-service/terms-of-service.component';
import { CookiePolicyComponent } from './features/b2c/cookie-policy/cookie-policy.component';
import { PartnersComponent } from './features/b2b/partners/partners.component';
import { CheckoutComponent } from './features/b2c/checkout/checkout.component';
import { OrderReviewComponent } from './features/b2c/checkout/steps/order-review/order-review.component';
import { ShippingComponent } from './features/b2c/checkout/steps/shipping/shipping.component';
import { PaymentComponent } from './features/b2c/checkout/steps/payment/payment.component';
import { ProfileComponent } from './features/b2c/profile/profile.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './features/admin/products/admin-products.component';
import { AdminBlogComponent } from './features/admin/blog/admin-blog.component';
import { AdminCategoriesComponent } from './features/admin/categories/admin-categories.component';
import { AdminOffersComponent } from './features/admin/offers/admin-offers.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders.component';
import { AdminReviewsComponent } from './features/admin/reviews/admin-reviews.component';
import { AdminCompanyPricingComponent } from './features/admin/company-pricing/admin-company-pricing.component';
import { CompanyPricingFormComponent } from './features/admin/company-pricing/company-pricing-form/company-pricing-form.component';
import { CategoryFormComponent } from './features/admin/categories/category-form/category-form.component';
import { ProductFormComponent } from './features/admin/products/product-form/product-form.component';
import { OfferFormComponent } from './features/admin/offers/offer-form/offer-form.component';
import { BlogFormComponent } from './features/admin/blog/blog-form/blog-form.component';
import { UserFormComponent } from './features/admin/users/user-form/user-form.component';
import { OrderFormComponent } from './features/admin/orders/order-form/order-form.component';
import { OrderDetailsComponent } from './features/b2c/order-details/order-details.component';

export const routes: Routes = [
    // Authentication routes (no layout) - no guards needed, Supabase handles auth state
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'confirmation', component: ConfirmationComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },

    // Main application routes (with layout)
    {
        path: '',
        component: PageLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'products', component: ProductListComponent },
            { path: 'products/:id', component: ProductDetailsComponent },
            { path: 'offers', component: OffersPageComponent },
            { path: 'offers/:id', component: OfferDetailsComponent },
            { path: 'blog', component: BlogComponent },
            { path: 'blog/:id', component: BlogDetailComponent },
            { path: 'company', component: CompanyComponent },
            { path: 'contact', component: ContactComponent },
            { path: 'privacy', component: PrivacyPolicyComponent },
            { path: 'terms', component: TermsOfServiceComponent },
            { path: 'cookies', component: CookiePolicyComponent },
            { path: 'partners', component: PartnersComponent },

            // Protected routes
            { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
            { path: 'order-details/:id', component: OrderDetailsComponent, canActivate: [AuthGuard] },

            // Checkout routes
            {
                path: 'checkout',
                component: CheckoutComponent,
                children: [
                    { path: '', redirectTo: 'order-review', pathMatch: 'full' },
                    { path: 'order-review', component: OrderReviewComponent },
                    { path: 'shipping', component: ShippingComponent },
                    { path: 'payment', component: PaymentComponent }
                ]
            }
        ]
    },

    // Admin routes
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AdminGuard],
        children: [
            { path: '', component: AdminDashboardComponent },

            // Products
            { path: 'products', component: AdminProductsComponent },
            { path: 'products/create', component: ProductFormComponent },
            { path: 'products/edit/:id', component: ProductFormComponent },

            // Categories
            { path: 'categories', component: AdminCategoriesComponent },
            { path: 'categories/create', component: CategoryFormComponent },
            { path: 'categories/edit/:id', component: CategoryFormComponent },

            // Blog
            { path: 'blog', component: AdminBlogComponent },
            { path: 'blog/create', component: BlogFormComponent },
            { path: 'blog/edit/:id', component: BlogFormComponent },

            // Offers
            { path: 'offers', component: AdminOffersComponent },
            { path: 'offers/create', component: OfferFormComponent },
            { path: 'offers/edit/:id', component: OfferFormComponent },

            // Users
            { path: 'users', component: AdminUsersComponent },
            { path: 'users/create', component: UserFormComponent },
            { path: 'users/edit/:id', component: UserFormComponent },

            // Orders
            { path: 'orders', component: AdminOrdersComponent },
            { path: 'orders/create', component: OrderFormComponent },
            { path: 'orders/edit/:id', component: OrderFormComponent },

            // Company Pricing
            { path: 'company-pricing', component: AdminCompanyPricingComponent },
            { path: 'company-pricing/create', component: CompanyPricingFormComponent },
            { path: 'company-pricing/edit/:id', component: CompanyPricingFormComponent },

            // Reviews
            { path: 'reviews', component: AdminReviewsComponent }
        ]
    },

    // Fallback route
    { path: '**', redirectTo: '' }
];
