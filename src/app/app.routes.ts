import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AdminLayout } from './feature/dashboard/admin-layout/admin-layout';

export const routes: Routes = [
    // public / customer-facing routes
    { path: '', redirectTo: '/products', pathMatch: 'full' },
    {
        path: 'products',
        loadComponent: () => import('./feature/product/product-list/product-list').then((m) => m.ProductList)
    },
    {
        path: 'products/:id',
        loadComponent: () => import('./feature/product/product-detail/product-detail').then((m) => m.ProductDetail)
    },
    {
        path: 'cart',
        loadComponent: () => import('./feature/cart/cart-view/cart-view').then((m) => m.CartView),
        canActivate: [authGuard]
    },
    {
        path: 'wishlist',
        loadComponent: () => import('./feature/wishlist/wishlist-view/wishlist-view').then((m) => m.WishlistView),
        canActivate: [authGuard]
    },
    {
        path: 'checkout',
        loadComponent: () => import('./feature/checkout/checkout-flow/checkout-flow').then((m) => m.CheckoutFlow),
        canActivate: [authGuard]
    },
    {
        path: 'payment',
        loadComponent: () => import('./feature/payment/payment-gateway/payment-gateway').then((m) => m.PaymentGateway),
        canActivate: [authGuard]
    },
    {
        path: 'payment/paypal',
        loadComponent: () => import('./feature/payment/paypal-payment/paypal-payment').then((m) => m.PaypalPayment),
        canActivate: [authGuard]
    },
    {
        path: 'payment/wallet',
        loadComponent: () => import('./feature/payment/wallet-payment/wallet-payment').then((m) => m.WalletPayment),
        canActivate: [authGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./feature/auth/login/login').then((m) => m.Login)
    },
    {
        path: 'signup',
        loadComponent: () => import('./feature/auth/signup/signup').then((m) => m.Signup)
    },
    {
        path: 'confirm-email/:token',
        loadComponent: () => import('./feature/auth/confirm-email/confirm-email').then((m) => m.ConfirmEmail)
    },
    {
        path: 'profile',
        loadComponent: () => import('./feature/profile/profile-details/profile-details').then((m) => m.ProfileDetailsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'my-orders',
        loadComponent: () => import('./feature/profile/order-history/order-history').then((m) => m.OrderHistory),
        canActivate: [authGuard]
    },
    // admin/dashboard routes
    {
        path: 'dashboard',
        component: AdminLayout,
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'stats', pathMatch: 'full' },
            {
                path: 'stats',
                loadComponent: () => import('./feature/dashboard/store-stats/store-stats').then((m) => m.StoreStats),
            },
            {
                path: 'users',
                loadComponent: () => import('./feature/dashboard/manage-users/manage-users').then((m) => m.ManageUsers),
            },
            {
                path: 'users/:id',
                loadComponent: () => import('./feature/dashboard/manage-users/manage-users').then((m) => m.ManageUsers),
            },
            {
                path: 'products',
                loadComponent: () => import('./feature/dashboard/manage-products/manage-products').then((m) => m.ManageProductsComponent),
            },
            {
                path: 'categories',
                loadComponent: () => import('./feature/dashboard/manage-categories/manage-categories').then((m) => m.ManageCategoriesComponent),
            },
            {
                path: 'orders',
                loadComponent: () => import('./feature/dashboard/manage-orders/manage-orders').then((m) => m.ManageOrders),
            },
            {
                path: 'reviews',
                loadComponent: () => import('./feature/dashboard/manage-reviews/manage-reviews').then((m) => m.ManageReviews),
            },
        ]
    },
    // catch-all fallback
    {
        path: '**',
        loadComponent: () => import('./feature/shared/not-found/not-found').then((m) => m.NotFound)
    }
];
