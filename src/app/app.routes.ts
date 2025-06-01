import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ForgotPasswordComponent } from './core/auth/components/forgot-password/forgot-password.component';
import { LoginComponent } from './core/auth/components/login/login.component';
import { RegisterComponent } from './core/auth/components/register/register.component';
import { ResetPasswordComponent } from './core/auth/components/reset-password/reset-password.component';
import { ConfirmationComponent } from './core/auth/components/confirmation/confirmation.component';
import { LoginGuard } from './core/auth/guards/login.guard';
import { PageLayoutComponent } from './core/page-layout/page-layout.component';
import { CompanyComponent } from './features/b2c/company/company.component';
import { BlogComponent } from './features/b2c/blog/blog.component';
import { BlogDetailComponent } from './features/b2c/blog/blog-detail.component';
import { ProductListComponent } from './features/b2c/products/product-list/product-list.component';
import { HomeComponent } from './features/b2c/home/home.component';
import { ProductDetailsComponent } from './features/b2c/products/product-details/product-details.component';
import { OffersPageComponent } from './features/b2c/offers/offers-page.component';
import { OfferDetailsComponent } from './features/b2c/offers/offer-details.component';
import { MissionComponent } from './features/b2c/mission/mission.component';
import { ContactComponent } from './features/b2c/contact/contact.component';
import { CheckoutComponent } from './features/b2c/checkout/checkout.component';
import { OrderReviewComponent } from './features/b2c/checkout/steps/order-review/order-review.component';
import { ShippingComponent } from './features/b2c/checkout/steps/shipping/shipping.component';
import { PaymentComponent } from './features/b2c/checkout/steps/payment/payment.component';
import { ProfileComponent } from './features/b2c/profile/profile.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './features/admin/products/admin-products.component';
import { AdminBlogComponent } from './features/admin/blog/admin-blog.component';

export const routes: Routes = [
    // Authentication routes (no layout)
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
    { path: 'confirmation', component: ConfirmationComponent, canActivate: [LoginGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [LoginGuard] },
    { path: 'reset-password', component: ResetPasswordComponent, canActivate: [LoginGuard] },

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
            { path: 'mission', component: MissionComponent },
            { path: 'blog', component: BlogComponent },
            { path: 'blog/:id', component: BlogDetailComponent },
            { path: 'company', component: CompanyComponent },
            { path: 'contact', component: ContactComponent },

            // Protected routes
            { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

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
            { path: 'products', component: AdminProductsComponent },
            { path: 'blog', component: AdminBlogComponent }
        ]
    },

    // Fallback route
    { path: '**', redirectTo: '' }
];
