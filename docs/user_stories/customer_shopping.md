# Customer Shopping Flows (Frontend Updated)

## Add Product To Cart
**As a** Customer  
**I want to** Add Product To Cart  
**So that** I can buy things  

**Acceptance Criteria:**
- Click "Add to Cart" and see a little pop-up or animation confirming it was added.
- Cannot add more items than what is currently in stock.

## Remove Product from Cart
**As a** Customer  
**I want to** Remove Product from Cart  
**So that** I can change my mind  

**Acceptance Criteria:**
- Click a minus button to reduce the quantity, or a trash button to remove it completely.
- The cart total updates instantly.

## View Cart
**As a** Customer  
**I want to** View Cart  
**So that** I can see what I'm buying  

**Acceptance Criteria:**
- See a list of my items, the subtotal, taxes, shipping, and the final total price.

## Create an Order
**As a** Customer  
**I want to** create an order  
**So that** I can place my request  

**Acceptance Criteria:**
- The cart must have at least one item.
- Pick a shipping address from my profile and choose my payment method (PayPal, Wallet, or COD).

## Pay for Order (PayPal)
**As a** Customer  
**I want to** pay via PayPal  
**So that** my transaction is secure  

**Acceptance Criteria:**
- Get redirected nicely to PayPal's screen to approve the payment.
- Once approved, the store clears my cart and says "Payment Successful!"

## Pay for Order (Wallet)
**As a** Customer  
**I want to** pay using my Wallet balance  
**So that** checkout is instant  

**Acceptance Criteria:**
- Click "Pay with Wallet".
- If I have enough balance, the order is placed immediately and my cart is cleared.
- Shows an error if my balance is too low.

## View Order History and Details
**As a** Customer  
**I want to** view my past orders  
**So that** I know what I bought before  

**Acceptance Criteria:**
- See a list of my previous orders on my profile page.
- Click on an order to see the exact items, the price I paid, and the current shipping status.

## Write or Edit a Review
**As a** Customer  
**I want to** review a product  
**So that** I can share my thoughts  

**Acceptance Criteria:**
- Can only review products I actually bought and paid for.
- See a 5-star rating system and a text box for my review.
- I can go back and edit my review later if I change my mind.
- Only one review allowed per product.

## Manage Wishlist
**As a** Customer  
**I want to** add or remove from my wishlist  
**So that** I can save items for later  

**Acceptance Criteria:**
- Click a "Heart" icon on a product to add it to the wishlist.
- The heart turns red.
- Click the red heart again to remove it.
- View a separate page that lists all my favorited items.
