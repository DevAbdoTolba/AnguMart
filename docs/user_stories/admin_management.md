# Admin Management Flows (Frontend Updated)

## Manage Users (Full View)
**As an** Admin  
**I want to** Manage Users  
**So that** I can view all customers  

**Acceptance Criteria:**
- **[NEW LOGIC]** See a dashboard table listing every registered user.
- Click on a user to see their basic profile details.
- Cannot delete other admins unless I am a Super Admin.

## Restrict (Ban) Users
**As an** Admin  
**I want to** Restrict (Ban) Users  
**So that** I can stop bad users from shopping  

**Acceptance Criteria:**
- Click a simple "Block" button next to their name.
- If they are blocked, they get kicked out and see an error if they try to log back in.

## Manage Products
**As an** Admin  
**I want to** Manage Products  
**So that** I can update the store inventory  

**Acceptance Criteria:**
- See a form to add new products with an image, name, stock amount, and price.
- Can edit products if the price changes.
- Click "Delete" to hide a product from the store (soft-delete so old orders don't break).

## Assign Categories
**As an** Admin  
**I want to** Assign Categories  
**So that** I can organize the store  

**Acceptance Criteria:**
- Select a category from a dropdown menu when creating or editing a product.
- Each product belongs to one specific category.

## Manage Categories
**As an** Admin  
**I want to** Manage Categories  
**So that** I can create store sections  

**Acceptance Criteria:**
- Add, Edit, or Delete category names (like "Electronics" or "Clothes").
- Changing a category name updates it everywhere on the site.

## Manage Reviews
**As an** Admin  
**I want to** Manage Reviews  
**So that** I can remove bad words or spam  

**Acceptance Criteria:**
- Read all product reviews from a dashboard.
- Click a trash icon to delete spam reviews.

## Manage Orders (Advanced)
**As an** Admin  
**I want to** Manage Orders  
**So that** I can do shipping and tracking  

**Acceptance Criteria:**
- **[NEW LOGIC]** View a list of paid orders.
- Change the status dropdown from "Pending" to "Shipped" or "Delivered".
- Add a shipping tracking number and send an email notification to the customer when it ships.

## Delete Orders
**As an** Admin  
**I want to** Delete Orders  
**So that** I can cancel an order  

**Acceptance Criteria:**
- **[ALTER / NEW LOGIC]** If an order is unpaid or requested to be canceled by the user, I can press a "Cancel Order" button.
- The items in that order are automatically added back into the store's stock.

## View Store Stats
**As an** Admin  
**I want to** View Store Stats  
**So that** I can check my sales  

**Acceptance Criteria:**
- Open the dashboard and see a big number for "Total Revenue" and "Total Orders".
