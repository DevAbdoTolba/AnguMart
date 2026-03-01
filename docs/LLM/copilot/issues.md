# GitHub Issues Generator Prompt (For GitHub Copilot Cloud)

You are a GitHub Issues generator acting as a Scrum Master with expertise in Agile methodology.

Your task is to create GitHub Issues for ALL user stories listed below. Do NOT skip any story. Do NOT hallucinate any feature that is not listed. Be strict, accurate, and complete.

---

## INSTRUCTIONS

For EACH user story below, create a GitHub Issue with:

- **Title**: Formatted as: `[ROLE] Short action-based title` (e.g., `[Admin] Manage Users Dashboard`)
- **Body**: A strict markdown body containing:
  - **User Story** (As a / I want to / So that)
  - **Acceptance Criteria** (bullet list, copied exactly from specs — no additions)
  - **Notes** if marked `[NEW LOGIC]` or `[ALTER / NEW LOGIC]`
- **Labels**: Assign ALL applicable labels from this list:
  - `user-story`
  - `frontend`
  - `auth` (if related to login/signup/email/account)
  - `admin` (if actor is Admin)
  - `customer` (if actor is Customer)
  - `guest` (if actor is Guest)
  - `cart` (if related to cart actions)
  - `orders` (if related to orders/checkout/payment)
  - `products` (if related to products/categories/reviews/wishlist)
  - `dashboard` (if related to admin dashboard/stats)
  - `new-logic` (if marked [NEW LOGIC] or [ALTER / NEW LOGIC])

> [!IMPORTANT]
> Create each label first if it does not already exist in the repository.

---

## USER STORIES

### FILE 1: User Auth & Browsing

**[Browse Products]**
As a USER, I want to Browse, So that I can shop.
Acceptance Criteria:
- See a nice grid of products on the home page.
- Load more products as I scroll or click "Next Page".
- Show product image, name, price, and stars.
Labels: user-story, frontend, products

---

**[Search Products]**
As a USER, I want to Search, So that I can get results faster.
Acceptance Criteria:
- Type in a search bar to find products by name.
- Show a friendly "Oops, no items found!" if nothing matches.
Labels: user-story, frontend, products

---

**[Filter Products]**
As a USER, I want to Filter products, So that I can navigate in fewer results.
Acceptance Criteria:
- Click checkboxes for categories or price ranges to narrow down the list.
- Click a "Clear Filters" button to see everything again.
Labels: user-story, frontend, products

---

**[Signup]**
As a USER, I want to Signup, So that I can have an account.
Acceptance Criteria:
- Fill out a simple form with Name, Email, Phone, and Password.
- Show red error text if I forget a field or enter a weak password.
- Send a confirmation email after clicking submit.
Labels: user-story, frontend, auth

---

**[Confirm Email]**
As a USER, I want to Confirm my Email, So that my account becomes active.
Acceptance Criteria:
- Click the link in the email.
- See a "Success!" message on the frontend and get redirected to the login page.
Labels: user-story, frontend, auth

---

**[Login]**
As a USER, I want to Login, So that I can Shop securely.
Acceptance Criteria:
- Needs a valid, verified account.
- Show "Invalid email or password" if I type it wrong.
- Save my login token so I don't have to log in every time I open the app.
Labels: user-story, frontend, auth

---

**[Manage Account]**
As a USER, I want to Manage my account, So that I can update my data.
Acceptance Criteria:
- See a profile page where I can change my name or phone number.
- Have a button to permanently delete my account if I want to leave.
Labels: user-story, frontend, auth

---

### FILE 2: Guest Shopping

**[Guest - Add Product To Cart]**
As a Guest, I want to Add Product To Cart, So that I can Shop.
Acceptance Criteria:
- I can click "Add to Cart" on any product.
- The frontend saves my cart items in Local Storage or uses a quick temporary session so I don't lose them.
- I cannot add more items than the store currently has in stock.
Labels: user-story, frontend, guest, cart

---

**[Guest - Remove Product from Cart]**
As a Guest, I want to Remove Product from Cart, So that I can manage my cart.
Acceptance Criteria:
- Click a trash icon next to the item to remove it.
- The cart total updates instantly on the screen.
Labels: user-story, frontend, guest, cart

---

**[Guest - View Cart]**
As a Guest, I want to View Cart, So that I can monitor my selected products.
Acceptance Criteria:
- See all items, their prices, and the total cost.
- See a big "Checkout" button, but it asks me to provide details or login first.
Labels: user-story, frontend, guest, cart

---

**[Guest - Create an Order]**
As a Guest, I want to create an order, So that I can checkout.
Acceptance Criteria:
- Provide my email, phone, and shipping address on a simple checkout form.
- Review my cart one last time before paying.
Labels: user-story, frontend, guest, orders

---

**[Guest - Pay for Order]**
As a Guest, I want to pay for order, So that I can have my items delivered.
Acceptance Criteria:
- Pay using PayPal or choose Cash on Delivery.
- See a "Thank you for your order!" success page after payment.
Labels: user-story, frontend, guest, orders

---

**[Guest - Upgrade into a Customer (Sign up)]**
As a Guest, I want to Upgrade into a Customer, So that I can save my sessions to different devices.
Note: [NEW FRONTEND LOGIC]
Acceptance Criteria:
- If I have items in my guest cart and decide to create an account, those items automatically move into my new official account cart when I log in.
- I do not lose the products I was looking at while browsing as a guest.
Labels: user-story, frontend, guest, cart, auth, new-logic

---

**[Guest - Add/Edit a Review for a Product]**
As a Guest, I want to add/edit a review for a product, So that I can give my honest opinion.
Acceptance Criteria:
- If I try to review a product, a popup tells me "Please log in or sign up to leave a review."
- If I sign up and use the same email I used to buy the product previously as a guest, I am allowed to review it.
Labels: user-story, frontend, guest, products

---

### FILE 3: Customer Shopping

**[Customer - Add Product To Cart]**
As a Customer, I want to Add Product To Cart, So that I can buy things.
Acceptance Criteria:
- Click "Add to Cart" and see a little pop-up or animation confirming it was added.
- Cannot add more items than what is currently in stock.
Labels: user-story, frontend, customer, cart

---

**[Customer - Remove Product from Cart]**
As a Customer, I want to Remove Product from Cart, So that I can change my mind.
Acceptance Criteria:
- Click a minus button to reduce the quantity, or a trash button to remove it completely.
- The cart total updates instantly.
Labels: user-story, frontend, customer, cart

---

**[Customer - View Cart]**
As a Customer, I want to View Cart, So that I can see what I'm buying.
Acceptance Criteria:
- See a list of my items, the subtotal, taxes, shipping, and the final total price.
Labels: user-story, frontend, customer, cart

---

**[Customer - Create an Order]**
As a Customer, I want to create an order, So that I can place my request.
Acceptance Criteria:
- The cart must have at least one item.
- Pick a shipping address from my profile and choose my payment method (PayPal, Wallet, or COD).
Labels: user-story, frontend, customer, orders

---

**[Customer - Pay for Order via PayPal]**
As a Customer, I want to pay via PayPal, So that my transaction is secure.
Acceptance Criteria:
- Get redirected nicely to PayPal's screen to approve the payment.
- Once approved, the store clears my cart and says "Payment Successful!"
Labels: user-story, frontend, customer, orders

---

**[Customer - Pay for Order via Wallet]**
As a Customer, I want to pay using my Wallet balance, So that checkout is instant.
Acceptance Criteria:
- Click "Pay with Wallet".
- If I have enough balance, the order is placed immediately and my cart is cleared.
- Shows an error if my balance is too low.
Labels: user-story, frontend, customer, orders

---

**[Customer - View Order History and Details]**
As a Customer, I want to view my past orders, So that I know what I bought before.
Acceptance Criteria:
- See a list of my previous orders on my profile page.
- Click on an order to see the exact items, the price I paid, and the current shipping status.
Labels: user-story, frontend, customer, orders

---

**[Customer - Write or Edit a Review]**
As a Customer, I want to review a product, So that I can share my thoughts.
Acceptance Criteria:
- Can only review products I actually bought and paid for.
- See a 5-star rating system and a text box for my review.
- I can go back and edit my review later if I change my mind.
- Only one review allowed per product.
Labels: user-story, frontend, customer, products

---

**[Customer - Manage Wishlist]**
As a Customer, I want to add or remove from my wishlist, So that I can save items for later.
Acceptance Criteria:
- Click a "Heart" icon on a product to add it to the wishlist.
- The heart turns red.
- Click the red heart again to remove it.
- View a separate page that lists all my favorited items.
Labels: user-story, frontend, customer, products

---

### FILE 4: Admin Management

**[Admin - Manage Users Dashboard]**
As an Admin, I want to Manage Users, So that I can view all customers.
Note: [NEW LOGIC]
Acceptance Criteria:
- See a dashboard table listing every registered user.
- Click on a user to see their basic profile details.
- Cannot delete other admins unless I am a Super Admin.
Labels: user-story, frontend, admin, dashboard, new-logic

---

**[Admin - Restrict (Ban) Users]**
As an Admin, I want to Restrict (Ban) Users, So that I can stop bad users from shopping.
Acceptance Criteria:
- Click a simple "Block" button next to their name.
- If they are blocked, they get kicked out and see an error if they try to log back in.
Labels: user-story, frontend, admin, dashboard

---

**[Admin - Manage Products]**
As an Admin, I want to Manage Products, So that I can update the store inventory.
Acceptance Criteria:
- See a form to add new products with an image, name, stock amount, and price.
- Can edit products if the price changes.
- Click "Delete" to hide a product from the store (soft-delete so old orders don't break).
Labels: user-story, frontend, admin, products

---

**[Admin - Assign Categories to Products]**
As an Admin, I want to Assign Categories, So that I can organize the store.
Acceptance Criteria:
- Select a category from a dropdown menu when creating or editing a product.
- Each product belongs to one specific category.
Labels: user-story, frontend, admin, products

---

**[Admin - Manage Categories]**
As an Admin, I want to Manage Categories, So that I can create store sections.
Acceptance Criteria:
- Add, Edit, or Delete category names (like "Electronics" or "Clothes").
- Changing a category name updates it everywhere on the site.
Labels: user-story, frontend, admin, products

---

**[Admin - Manage Reviews]**
As an Admin, I want to Manage Reviews, So that I can remove bad words or spam.
Acceptance Criteria:
- Read all product reviews from a dashboard.
- Click a trash icon to delete spam reviews.
Labels: user-story, frontend, admin, products, dashboard

---

**[Admin - Manage Orders]**
As an Admin, I want to Manage Orders, So that I can do shipping and tracking.
Note: [NEW LOGIC]
Acceptance Criteria:
- View a list of paid orders.
- Change the status dropdown from "Pending" to "Shipped" or "Delivered".
- Add a shipping tracking number and send an email notification to the customer when it ships.
Labels: user-story, frontend, admin, orders, dashboard, new-logic

---

**[Admin - Delete / Cancel Orders]**
As an Admin, I want to Delete Orders, So that I can cancel an order.
Note: [ALTER / NEW LOGIC]
Acceptance Criteria:
- If an order is unpaid or requested to be canceled by the user, I can press a "Cancel Order" button.
- The items in that order are automatically added back into the store's stock.
Labels: user-story, frontend, admin, orders, new-logic

---

**[Admin - View Store Stats]**
As an Admin, I want to View Store Stats, So that I can check my sales.
Acceptance Criteria:
- Open the dashboard and see a big number for "Total Revenue" and "Total Orders".
Labels: user-story, frontend, admin, dashboard

---

## OUTPUT RULES

- Create all **32** issues. Do not skip any.
- Do not add any acceptance criteria not listed above.
- Do not merge issues together.
- Use exact label names as defined above (lowercase, hyphenated).
- Issue body must use markdown formatting.
- Each issue must be created separately.
