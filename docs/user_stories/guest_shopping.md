# Guest Shopping Flows (Frontend Updated)

## Add Product To Cart
**As a** Guest  
**I want to** Add Product To Cart  
**So that** I can Shop  

**Acceptance Criteria:**
- I can click "Add to Cart" on any product.
- The frontend saves my cart items in Local Storage or uses a quick temporary session so I don't lose them.
- I cannot add more items than the store currently has in stock.

## Remove Product from Cart
**As a** Guest  
**I want to** Remove Product from Cart  
**So that** I can manage my cart  

**Acceptance Criteria:**
- Click a trash icon next to the item to remove it.
- The cart total updates instantly on the screen.

## View Cart
**As a** Guest  
**I want to** View Cart  
**So that** I can monitor my selected products  

**Acceptance Criteria:**
- See all items, their prices, and the total cost.
- See a big "Checkout" button, but it asks me to provide details or login first.

## Create an Order
**As a** Guest  
**I want to** create an order  
**So that** I can checkout  

**Acceptance Criteria:**
- Provide my email, phone, and shipping address on a simple checkout form.
- Review my cart one last time before paying.

## Pay for Order
**As a** Guest  
**I want to** pay for order  
**So that** I can have my items delivered  

**Acceptance Criteria:**
- Pay using PayPal or choose Cash on Delivery.
- See a "Thank you for your order!" success page after payment.

## Upgrade into a Customer (Sign up)
**As a** Guest  
**I want to** Upgrade into a Customer (Sign up)  
**So that** I can save my sessions to different devices  

**Acceptance Criteria:**
- **[NEW FRONTEND LOGIC]** If I have items in my guest cart and decide to create an account, those items automatically move into my new official account cart when I log in.
- I do not lose the products I was looking at while browsing as a guest.

## Add/Edit a Review for a Product
**As a** Guest  
**I want to** add/edit a review for a product  
**So that** I can give my honest opinion  

**Acceptance Criteria:**
- If I try to review a product, a popup tells me "Please log in or sign up to leave a review."
- If I sign up and use the same email I used to buy the product previously as a guest, I am allowed to review it.
