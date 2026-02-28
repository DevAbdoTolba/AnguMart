# AnguMart — Sitemap

## Folder Structure

```
docs/layout/
├── styles.css                ← shared design system
├── sitemap.md                ← this file
│
├── public/                   ← Guest / Public pages (9 pages)
│   ├── home.html             ← Browse products, search, filters, pagination
│   ├── product-detail.html   ← Product info, reviews, add-to-cart
│   ├── cart.html             ← Guest cart with qty controls
│   ├── guest-checkout.html   ← Email, phone, shipping address form
│   ├── payment.html          ← PayPal / COD / Wallet selector
│   ├── order-success.html    ← "Thank You!" confirmation
│   ├── login.html            ← Email + password login
│   ├── signup.html           ← Name, email, phone, password registration
│   └── email-confirmed.html  ← Email verification success
│
├── customer/                 ← Authenticated Customer pages (7 pages)
│   ├── cart.html             ← Full cart with tax breakdown
│   ├── checkout.html         ← Saved address + payment method
│   ├── profile.html          ← Edit profile, wallet, delete account
│   ├── order-history.html    ← Past orders table
│   ├── order-detail.html     ← Order items, tracking, payment summary
│   ├── wishlist.html         ← Favorited products grid
│   └── write-review.html     ← Star rating + text review form
│
└── admin/                    ← Admin Dashboard pages (6 pages)
    ├── dashboard.html        ← Stats cards, quick actions, recent orders
    ├── users.html            ← User table, block/unblock, role badges
    ├── products.html         ← Add/edit form, product table, stock badges
    ├── categories.html       ← Add/edit/delete categories
    ├── orders.html           ← Status dropdown, tracking #, cancel
    └── reviews.html          ← Review cards, spam flagging, delete
```

**Total: 22 pages · 3 folders · 1 shared stylesheet**
