# AnguMart — Sitemap

## Public / Guest Pages

```
Home (Browse Products)          → home.html
├── Product Detail              → product-detail.html
├── Cart                        → cart.html
│   ├── Guest Checkout          → guest-checkout.html
│   │   └── Payment             → payment.html
│   │       └── Order Success   → order-success.html
│   └── Customer Checkout       → customer-checkout.html
│       └── Payment             → payment.html
│           └── Order Success   → order-success.html
├── Login                       → login.html
├── Sign Up                     → signup.html
│   └── Email Confirmed         → email-confirmed.html
```

## Customer Pages (Authenticated)

```
Customer Cart                   → customer-cart.html
Customer Checkout               → customer-checkout.html
Profile / Account               → profile.html
├── Order History               → order-history.html
│   └── Order Detail            → order-detail.html
├── Wishlist                    → wishlist.html
└── Write / Edit Review         → write-review.html
```

## Admin Dashboard Pages

```
Dashboard Home                  → admin-dashboard.html
├── Manage Users                → admin-users.html
├── Manage Products             → admin-products.html
├── Manage Categories           → admin-categories.html
├── Manage Orders               → admin-orders.html
└── Manage Reviews              → admin-reviews.html
```

---

**Total: 22 pages · 1 shared stylesheet (`styles.css`)**
