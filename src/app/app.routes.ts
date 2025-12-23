import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './core/auth/guards/admin.guard';
import { CompanyApprovedGuard } from './guards/company-approved.guard';
import { PageLayoutComponent } from './core/page-layout/page-layout.component';
import { B2bLayoutComponent } from './features/b2b/shared/layout/b2b-layout.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';

// Eagerly loaded components (critical for initial page load)
import { HomeComponent } from './features/b2c/home/home.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
    // Authentication routes - Lazy loaded
    {
        path: 'prijava',
        loadComponent: () => import('./core/auth/components/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'registracija',
        loadComponent: () => import('./core/auth/components/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'potvrda',
        loadComponent: () => import('./core/auth/components/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
    },
    {
        path: 'confirm',
        loadComponent: () => import('./core/auth/components/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
    },
    {
        path: 'zaboravljena-lozinka',
        loadComponent: () => import('./core/auth/components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'reset-lozinka',
        loadComponent: () => import('./core/auth/components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },

    // Payment callback - Lazy loaded
    {
        path: 'payment-callback',
        loadComponent: () => import('./features/b2c/checkout/payment-callback/payment-callback.component').then(m => m.PaymentCallbackComponent)
    },

    // Order confirmation - Lazy loaded
    {
        path: 'order-confirmation',
        loadComponent: () => import('./features/b2c/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
    },

    // Main application routes (with layout)
    {
        path: '',
        component: PageLayoutComponent,
        children: [
            // Home - Eagerly loaded (critical path)
            { path: '', component: HomeComponent },

            // Products - Lazy loaded
            {
                path: 'proizvodi',
                loadComponent: () => import('./features/b2c/products/product-list/product-list.component').then(m => m.ProductListComponent)
            },
            {
                path: 'proizvodi/:id',
                loadComponent: () => import('./features/b2c/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
            },

            // Offers - Lazy loaded
            {
                path: 'ponude',
                loadComponent: () => import('./features/b2c/offers/offers-page.component').then(m => m.OffersPageComponent)
            },
            {
                path: 'ponude/:id',
                loadComponent: () => import('./features/b2c/offers/offer-details.component').then(m => m.OfferDetailsComponent)
            },

            // Blog - Lazy loaded
            {
                path: 'blog',
                loadComponent: () => import('./features/b2c/blog/blog.component').then(m => m.BlogComponent)
            },
            {
                path: 'blog/:id',
                loadComponent: () => import('./features/b2c/blog/blog-detail.component').then(m => m.BlogDetailComponent)
            },

            // Company/About - Lazy loaded
            {
                path: 'tvrtka',
                loadComponent: () => import('./features/b2c/company/company.component').then(m => m.CompanyComponent)
            },

            // Contact - Lazy loaded
            {
                path: 'kontakt',
                loadComponent: () => import('./features/b2c/contact/contact.component').then(m => m.ContactComponent)
            },

            // Legal pages - Lazy loaded
            {
                path: 'privatnost',
                loadComponent: () => import('./features/b2c/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
            },
            {
                path: 'uvjeti',
                loadComponent: () => import('./features/b2c/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent)
            },
            {
                path: 'kolacici',
                loadComponent: () => import('./features/b2c/cookie-policy/cookie-policy.component').then(m => m.CookiePolicyComponent)
            },
            {
                path: 'sigurnost-kupovine',
                loadComponent: () => import('./features/b2c/safety-payment/safety-payment.component').then(m => m.SafetyPaymentComponent)
            },

            // Protected routes - Lazy loaded
            {
                path: 'profil',
                loadComponent: () => import('./features/b2c/profile/profile.component').then(m => m.ProfileComponent),
                canActivate: [AuthGuard]
            },
            {
                path: 'detalji-narudzbe/:id',
                loadComponent: () => import('./features/b2c/order-details/order-details.component').then(m => m.OrderDetailsComponent),
                canActivate: [AuthGuard]
            },

            // Checkout routes - Lazy loaded
            {
                path: 'blagajna',
                loadComponent: () => import('./features/b2c/checkout/checkout.component').then(m => m.CheckoutComponent),
                children: [
                    { path: '', redirectTo: 'pregled-narudzbe', pathMatch: 'full' },
                    {
                        path: 'pregled-narudzbe',
                        loadComponent: () => import('./features/b2c/checkout/steps/order-review/order-review.component').then(m => m.OrderReviewComponent)
                    },
                    {
                        path: 'dostava',
                        loadComponent: () => import('./features/b2c/checkout/steps/shipping/shipping.component').then(m => m.ShippingComponent)
                    },
                    {
                        path: 'placanje',
                        loadComponent: () => import('./features/b2c/checkout/steps/payment/payment.component').then(m => m.PaymentComponent)
                    }
                ]
            }
        ]
    },

    // B2B routes - Lazy loaded children
    {
        path: 'partneri',
        component: B2bLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/b2b/partners/partners.component').then(m => m.PartnersComponent)
            },
            {
                path: 'o-nama',
                loadComponent: () => import('./features/b2b/partners/about/partners-about.component').then(m => m.PartnersAboutComponent)
            },
            {
                path: 'registracija',
                loadComponent: () => import('./features/b2b/partners/register/partners-register.component').then(m => m.PartnersRegisterComponent)
            },
            {
                path: 'proizvodi',
                loadComponent: () => import('./features/b2b/partners/products/partners-products.component').then(m => m.PartnersProductsComponent),
                canActivate: [CompanyApprovedGuard]
            },
            {
                path: 'proizvodi/:id',
                loadComponent: () => import('./features/b2b/partners/products/partners-product-details.component').then(m => m.PartnersProductDetailsComponent),
                canActivate: [CompanyApprovedGuard]
            },
            {
                path: 'ponude',
                loadComponent: () => import('./features/b2b/partners/offers/partners-offers.component').then(m => m.PartnersOffersComponent),
                canActivate: [CompanyApprovedGuard]
            },
            {
                path: 'ponude/:id',
                loadComponent: () => import('./features/b2b/partners/offers/partners-offer-details.component').then(m => m.PartnersOfferDetailsComponent),
                canActivate: [CompanyApprovedGuard]
            },
            {
                path: 'profil',
                loadComponent: () => import('./features/b2b/partners/profile/partner-profile.component').then(m => m.PartnerProfileComponent),
                canActivate: [AuthGuard]
            },
            {
                path: 'detalji-narudzbe/:id',
                loadComponent: () => import('./features/b2b/order-details/b2b-order-details.component').then(m => m.B2bOrderDetailsComponent),
                canActivate: [AuthGuard]
            },
            {
                path: 'kontakt',
                loadComponent: () => import('./features/b2b/partners/contact/partners-contact.component').then(m => m.PartnersContactComponent)
            },

            // B2B Checkout routes - Lazy loaded
            {
                path: 'blagajna',
                loadComponent: () => import('./features/b2b/checkout/b2b-checkout.component').then(m => m.B2bCheckoutComponent),
                canActivate: [CompanyApprovedGuard],
                children: [
                    { path: '', redirectTo: 'pregled-narudzbe', pathMatch: 'full' },
                    {
                        path: 'pregled-narudzbe',
                        loadComponent: () => import('./features/b2b/checkout/steps/b2b-order-review/b2b-order-review.component').then(m => m.B2bOrderReviewComponent)
                    },
                    {
                        path: 'dostava',
                        loadComponent: () => import('./features/b2b/checkout/steps/b2b-shipping/b2b-shipping.component').then(m => m.B2bShippingComponent)
                    },
                    {
                        path: 'placanje',
                        loadComponent: () => import('./features/b2b/checkout/steps/b2b-payment/b2b-payment.component').then(m => m.B2bPaymentComponent)
                    }
                ]
            }
        ]
    },

    // Admin routes - Lazy loaded children
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AdminGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },

            // Products
            {
                path: 'proizvodi',
                loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent)
            },
            {
                path: 'proizvodi/kreiraj',
                loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent)
            },
            {
                path: 'proizvodi/uredi/:id',
                loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent)
            },
            {
                path: 'proizvodi/detalji/:id',
                loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent)
            },

            // Categories
            {
                path: 'kategorije',
                loadComponent: () => import('./features/admin/categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
            },
            {
                path: 'kategorije/kreiraj',
                loadComponent: () => import('./features/admin/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
            },
            {
                path: 'kategorije/uredi/:id',
                loadComponent: () => import('./features/admin/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
            },
            {
                path: 'kategorije/detalji/:id',
                loadComponent: () => import('./features/admin/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
            },

            // Blog
            {
                path: 'blog',
                loadComponent: () => import('./features/admin/blog/admin-blog.component').then(m => m.AdminBlogComponent)
            },
            {
                path: 'blog/kreiraj',
                loadComponent: () => import('./features/admin/blog/blog-form/blog-form.component').then(m => m.BlogFormComponent)
            },
            {
                path: 'blog/uredi/:id',
                loadComponent: () => import('./features/admin/blog/blog-form/blog-form.component').then(m => m.BlogFormComponent)
            },
            {
                path: 'blog/detalji/:id',
                loadComponent: () => import('./features/admin/blog/blog-form/blog-form.component').then(m => m.BlogFormComponent)
            },

            // Offers
            {
                path: 'ponude',
                loadComponent: () => import('./features/admin/offers/admin-offers.component').then(m => m.AdminOffersComponent)
            },
            {
                path: 'ponude/kreiraj',
                loadComponent: () => import('./features/admin/offers/offer-form/offer-form.component').then(m => m.OfferFormComponent)
            },
            {
                path: 'ponude/uredi/:id',
                loadComponent: () => import('./features/admin/offers/offer-form/offer-form.component').then(m => m.OfferFormComponent)
            },
            {
                path: 'ponude/detalji/:id',
                loadComponent: () => import('./features/admin/offers/offer-details/offer-details.component').then(m => m.OfferDetailsComponent)
            },

            // Users
            {
                path: 'korisnici',
                loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
            },
            {
                path: 'korisnici/kreiraj',
                loadComponent: () => import('./features/admin/users/user-form/user-form.component').then(m => m.UserFormComponent)
            },
            {
                path: 'korisnici/uredi/:id',
                loadComponent: () => import('./features/admin/users/user-form/user-form.component').then(m => m.UserFormComponent)
            },
            {
                path: 'korisnici/detalji/:id',
                loadComponent: () => import('./features/admin/users/user-form/user-form.component').then(m => m.UserFormComponent)
            },

            // Orders
            {
                path: 'narudzbe',
                loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent)
            },
            {
                path: 'narudzbe/kreiraj',
                loadComponent: () => import('./features/admin/orders/order-form/order-form.component').then(m => m.OrderFormComponent)
            },
            {
                path: 'narudzbe/uredi/:id',
                loadComponent: () => import('./features/admin/orders/order-form/order-form.component').then(m => m.OrderFormComponent)
            },
            {
                path: 'narudzbe/detalji/:id',
                loadComponent: () => import('./features/admin/orders/order-details/order-details.component').then(m => m.OrderDetailsComponent)
            },

            // Partner Orders (B2B)
            {
                path: 'narudzbe-partneri',
                loadComponent: () => import('./features/admin/orders-partners/admin-orders-partners.component').then(m => m.AdminOrdersPartnersComponent)
            },

            // Company Pricing
            {
                path: 'cijene-tvrtki',
                loadComponent: () => import('./features/admin/company-pricing/admin-company-pricing.component').then(m => m.AdminCompanyPricingComponent)
            },
            {
                path: 'cijene-tvrtki/kreiraj',
                loadComponent: () => import('./features/admin/company-pricing/company-pricing-form/company-pricing-form.component').then(m => m.CompanyPricingFormComponent)
            },
            {
                path: 'cijene-tvrtki/uredi/:id',
                loadComponent: () => import('./features/admin/company-pricing/company-pricing-form/company-pricing-form.component').then(m => m.CompanyPricingFormComponent)
            },
            {
                path: 'cijene-tvrtki/detalji/:id',
                loadComponent: () => import('./features/admin/company-pricing/company-pricing-form/company-pricing-form.component').then(m => m.CompanyPricingFormComponent)
            },

            // Companies
            {
                path: 'tvrtke',
                loadComponent: () => import('./features/admin/companies/admin-companies.component').then(m => m.AdminCompaniesComponent)
            },
            {
                path: 'tvrtke/kreiraj',
                loadComponent: () => import('./features/admin/companies/admin-company-edit.component').then(m => m.AdminCompanyEditComponent)
            },
            {
                path: 'tvrtke/uredi/:id',
                loadComponent: () => import('./features/admin/companies/admin-company-edit.component').then(m => m.AdminCompanyEditComponent)
            },
            {
                path: 'tvrtke/detalji/:id',
                loadComponent: () => import('./features/admin/companies/admin-company-edit.component').then(m => m.AdminCompanyEditComponent)
            },

            // Contacts
            {
                path: 'kontakti',
                loadComponent: () => import('./features/admin/contacts/admin-contacts.component').then(m => m.AdminContactsComponent)
            },

            // Wishlist
            {
                path: 'lista-zelja',
                loadComponent: () => import('./features/admin/wishlist/admin-wishlist.component').then(m => m.AdminWishlistComponent)
            },

            // Reviews
            {
                path: 'recenzije',
                loadComponent: () => import('./features/admin/reviews/admin-reviews.component').then(m => m.AdminReviewsComponent)
            },

            // Email Test
            {
                path: 'email-test',
                loadComponent: () => import('./shared/components/email-test/email-test.component').then(m => m.EmailTestComponent)
            }
        ]
    },

    // 404 Not Found route
    { path: '**', component: NotFoundComponent }
];
