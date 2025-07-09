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
import { PartnersRegisterComponent } from './features/b2b/partners/register/partners-register.component';
import { PartnersProductsComponent } from './features/b2b/partners/products/partners-products.component';
import { PartnersProductDetailsComponent } from './features/b2b/partners/products/partners-product-details.component';
import { PartnersOffersComponent } from './features/b2b/partners/offers/partners-offers.component';
import { PartnersOfferDetailsComponent } from './features/b2b/partners/offers/partners-offer-details.component';
import { PartnersContactComponent } from './features/b2b/partners/contact/partners-contact.component';
import { PartnerProfileComponent } from './features/b2b/partners/profile/partner-profile.component';
import { B2bLayoutComponent } from './features/b2b/shared/layout/b2b-layout.component';
import { B2bCheckoutComponent } from './features/b2b/checkout/b2b-checkout.component';
import { B2bOrderReviewComponent } from './features/b2b/checkout/steps/b2b-order-review/b2b-order-review.component';
import { B2bShippingComponent } from './features/b2b/checkout/steps/b2b-shipping/b2b-shipping.component';
import { B2bPaymentComponent } from './features/b2b/checkout/steps/b2b-payment/b2b-payment.component';
import { B2bOrderDetailsComponent } from './features/b2b/order-details/b2b-order-details.component';
import { CompanyApprovedGuard } from './guards/company-approved.guard';
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
import { AdminOrdersPartnersComponent } from './features/admin/orders-partners/admin-orders-partners.component';
import { AdminReviewsComponent } from './features/admin/reviews/admin-reviews.component';
import { AdminCompanyPricingComponent } from './features/admin/company-pricing/admin-company-pricing.component';
import { CompanyPricingFormComponent } from './features/admin/company-pricing/company-pricing-form/company-pricing-form.component';

import { AdminCompaniesComponent } from './features/admin/companies/admin-companies.component';
import { AdminCompanyEditComponent } from './features/admin/companies/admin-company-edit.component';
import { AdminWishlistComponent } from './features/admin/wishlist/admin-wishlist.component';
import { AdminContactsComponent } from './features/admin/contacts/admin-contacts.component';
import { CategoryFormComponent } from './features/admin/categories/category-form/category-form.component';
import { ProductFormComponent } from './features/admin/products/product-form/product-form.component';
import { OfferFormComponent } from './features/admin/offers/offer-form/offer-form.component';
import { BlogFormComponent } from './features/admin/blog/blog-form/blog-form.component';
import { UserFormComponent } from './features/admin/users/user-form/user-form.component';
import { OrderFormComponent } from './features/admin/orders/order-form/order-form.component';
import { OrderDetailsComponent } from './features/b2c/order-details/order-details.component';
// Import admin detail components
import { OfferDetailsComponent as AdminOfferDetailsComponent } from './features/admin/offers/offer-details/offer-details.component';
import { OrderDetailsComponent as AdminOrderDetailsComponent } from './features/admin/orders/order-details/order-details.component';
import { EmailTestComponent } from './shared/components/email-test/email-test.component';

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

    // B2B routes (with B2B layout)
    {
        path: 'partners',
        component: B2bLayoutComponent,
        children: [
            { path: '', component: PartnersComponent },
            { path: 'register', component: PartnersRegisterComponent },
            { path: 'products', component: PartnersProductsComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'products/:id', component: PartnersProductDetailsComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'offers', component: PartnersOffersComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'offers/:id', component: PartnersOfferDetailsComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'profile', component: PartnerProfileComponent, canActivate: [AuthGuard] },
            { path: 'order-details/:id', component: B2bOrderDetailsComponent, canActivate: [AuthGuard] },
            { path: 'contact', component: PartnersContactComponent },

            // B2B Checkout routes
            {
                path: 'checkout',
                component: B2bCheckoutComponent,
                canActivate: [CompanyApprovedGuard],
                children: [
                    { path: '', redirectTo: 'order-review', pathMatch: 'full' },
                    { path: 'order-review', component: B2bOrderReviewComponent },
                    { path: 'shipping', component: B2bShippingComponent },
                    { path: 'payment', component: B2bPaymentComponent }
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
            { path: 'offers/details/:id', component: AdminOfferDetailsComponent },

            // Users
            { path: 'users', component: AdminUsersComponent },
            { path: 'users/create', component: UserFormComponent },
            { path: 'users/edit/:id', component: UserFormComponent },

            // Orders
            { path: 'orders', component: AdminOrdersComponent },
            { path: 'orders/create', component: OrderFormComponent },
            { path: 'orders/edit/:id', component: OrderFormComponent },
            { path: 'orders/details/:id', component: AdminOrderDetailsComponent },

            // Partner Orders (B2B)
            { path: 'orders-partners', component: AdminOrdersPartnersComponent },

            // Company Pricing
            { path: 'company-pricing', component: AdminCompanyPricingComponent },
            { path: 'company-pricing/create', component: CompanyPricingFormComponent },
            { path: 'company-pricing/edit/:id', component: CompanyPricingFormComponent },

            // Companies
            { path: 'companies', component: AdminCompaniesComponent },
            { path: 'companies/create', component: AdminCompanyEditComponent },
            { path: 'companies/edit/:id', component: AdminCompanyEditComponent },

            // Contacts
            { path: 'contacts', component: AdminContactsComponent },

            // Wishlist
            { path: 'wishlist', component: AdminWishlistComponent },

            // Reviews
            { path: 'reviews', component: AdminReviewsComponent },

            // Email Test
            { path: 'email-test', component: EmailTestComponent }
        ]
    },

    // Fallback route
    { path: '**', redirectTo: '' }
];
