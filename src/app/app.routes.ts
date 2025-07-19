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
import { PartnersAboutComponent } from './features/b2b/partners/about/partners-about.component';
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
    { path: 'prijava', component: LoginComponent },
    { path: 'registracija', component: RegisterComponent },
    { path: 'potvrda', component: ConfirmationComponent },
    { path: 'zaboravljena-lozinka', component: ForgotPasswordComponent },
    { path: 'reset-lozinka', component: ResetPasswordComponent },

    // Main application routes (with layout)
    {
        path: '',
        component: PageLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'proizvodi', component: ProductListComponent },
            { path: 'proizvodi/:id', component: ProductDetailsComponent },
            { path: 'ponude', component: OffersPageComponent },
            { path: 'ponude/:id', component: OfferDetailsComponent },
            { path: 'blog', component: BlogComponent },
            { path: 'blog/:id', component: BlogDetailComponent },
            { path: 'tvrtka', component: CompanyComponent },
            { path: 'kontakt', component: ContactComponent },
            { path: 'privatnost', component: PrivacyPolicyComponent },
            { path: 'uvjeti', component: TermsOfServiceComponent },
            { path: 'kolacici', component: CookiePolicyComponent },


            // Protected routes
            { path: 'profil', component: ProfileComponent, canActivate: [AuthGuard] },
            { path: 'detalji-narudzbe/:id', component: OrderDetailsComponent, canActivate: [AuthGuard] },

            // Checkout routes
            {
                path: 'blagajna',
                component: CheckoutComponent,
                children: [
                    { path: '', redirectTo: 'pregled-narudzbe', pathMatch: 'full' },
                    { path: 'pregled-narudzbe', component: OrderReviewComponent },
                    { path: 'dostava', component: ShippingComponent },
                    { path: 'placanje', component: PaymentComponent }
                ]
            }
        ]
    },

    // B2B routes (with B2B layout)
    {
        path: 'partneri',
        component: B2bLayoutComponent,
        children: [
            { path: '', component: PartnersComponent },
            { path: 'o-nama', component: PartnersAboutComponent },
            { path: 'registracija', component: PartnersRegisterComponent },
            { path: 'proizvodi', component: PartnersProductsComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'proizvodi/:id', component: PartnersProductDetailsComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'ponude', component: PartnersOffersComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'ponude/:id', component: PartnersOfferDetailsComponent, canActivate: [CompanyApprovedGuard] },
            { path: 'profil', component: PartnerProfileComponent, canActivate: [AuthGuard] },
            { path: 'detalji-narudzbe/:id', component: B2bOrderDetailsComponent, canActivate: [AuthGuard] },
            { path: 'kontakt', component: PartnersContactComponent },

            // B2B Checkout routes
            {
                path: 'blagajna',
                component: B2bCheckoutComponent,
                canActivate: [CompanyApprovedGuard],
                children: [
                    { path: '', redirectTo: 'pregled-narudzbe', pathMatch: 'full' },
                    { path: 'pregled-narudzbe', component: B2bOrderReviewComponent },
                    { path: 'dostava', component: B2bShippingComponent },
                    { path: 'placanje', component: B2bPaymentComponent }
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
            { path: 'proizvodi', component: AdminProductsComponent },
            { path: 'proizvodi/kreiraj', component: ProductFormComponent },
            { path: 'proizvodi/uredi/:id', component: ProductFormComponent },
            { path: 'proizvodi/detalji/:id', component: ProductFormComponent },

            // Categories
            { path: 'kategorije', component: AdminCategoriesComponent },
            { path: 'kategorije/kreiraj', component: CategoryFormComponent },
            { path: 'kategorije/uredi/:id', component: CategoryFormComponent },
            { path: 'kategorije/detalji/:id', component: CategoryFormComponent },

            // Blog
            { path: 'blog', component: AdminBlogComponent },
            { path: 'blog/kreiraj', component: BlogFormComponent },
            { path: 'blog/uredi/:id', component: BlogFormComponent },
            { path: 'blog/detalji/:id', component: BlogFormComponent },

            // Offers
            { path: 'ponude', component: AdminOffersComponent },
            { path: 'ponude/kreiraj', component: OfferFormComponent },
            { path: 'ponude/uredi/:id', component: OfferFormComponent },
            { path: 'ponude/detalji/:id', component: AdminOfferDetailsComponent },

            // Users
            { path: 'korisnici', component: AdminUsersComponent },
            { path: 'korisnici/kreiraj', component: UserFormComponent },
            { path: 'korisnici/uredi/:id', component: UserFormComponent },
            { path: 'korisnici/detalji/:id', component: UserFormComponent },

            // Orders
            { path: 'narudzbe', component: AdminOrdersComponent },
            { path: 'narudzbe/kreiraj', component: OrderFormComponent },
            { path: 'narudzbe/uredi/:id', component: OrderFormComponent },
            { path: 'narudzbe/detalji/:id', component: AdminOrderDetailsComponent },

            // Partner Orders (B2B)
            { path: 'narudzbe-partneri', component: AdminOrdersPartnersComponent },

            // Company Pricing
            { path: 'cijene-tvrtki', component: AdminCompanyPricingComponent },
            { path: 'cijene-tvrtki/kreiraj', component: CompanyPricingFormComponent },
            { path: 'cijene-tvrtki/uredi/:id', component: CompanyPricingFormComponent },
            { path: 'cijene-tvrtki/detalji/:id', component: CompanyPricingFormComponent },

            // Companies
            { path: 'tvrtke', component: AdminCompaniesComponent },
            { path: 'tvrtke/kreiraj', component: AdminCompanyEditComponent },
            { path: 'tvrtke/uredi/:id', component: AdminCompanyEditComponent },
            { path: 'tvrtke/detalji/:id', component: AdminCompanyEditComponent },

            // Contacts
            { path: 'kontakti', component: AdminContactsComponent },

            // Wishlist
            { path: 'lista-zelja', component: AdminWishlistComponent },

            // Reviews
            { path: 'recenzije', component: AdminReviewsComponent },

            // Email Test
            { path: 'email-test', component: EmailTestComponent }
        ]
    },

    // Fallback route
    { path: '**', redirectTo: '' }
];
