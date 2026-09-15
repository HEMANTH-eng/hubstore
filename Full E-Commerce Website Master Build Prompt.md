# MASTER PROMPT — FULL-STACK E-COMMERCE PLATFORM

You are an expert **senior full-stack engineer, UI/UX designer, product architect, database engineer, security engineer, and QA engineer**.

Your task is to design and build a complete, production-quality, modern **full-stack e-commerce platform** inspired by the functionality and scale of major marketplaces such as Amazon and Flipkart.

Do NOT copy their branding, logos, proprietary assets, exact layouts, or copyrighted visual identity. Build an original product with its own design system, components, branding, and UX.

---

# 1. CORE OBJECTIVE

Build a complete e-commerce marketplace with:

- Modern responsive storefront
- Product discovery
- Product search
- Advanced filtering
- Product categories
- Product detail pages
- Shopping cart
- Wishlist
- User accounts
- Authentication
- Address management
- Checkout
- Payment integration architecture
- Order management
- Order tracking
- Product reviews
- Ratings
- Coupons
- Offers
- Inventory management
- Admin dashboard
- Seller/vendor architecture
- Product management
- Customer management
- Order management
- Analytics
- Notifications
- Responsive mobile/tablet/desktop experience
- Secure backend
- Database integration
- Proper error handling
- Loading states
- Empty states
- Skeleton loaders
- SEO
- Performance optimization
- Accessibility

The final application should feel like a **real commercial e-commerce product**, not a demo or static template.

---

# 2. FIRST STEP — INSPECT THE PROJECT

Before changing anything:

1. Inspect the entire existing project.
2. Identify the framework.
3. Identify the package manager.
4. Inspect package.json.
5. Inspect the folder structure.
6. Inspect existing components.
7. Inspect database configuration.
8. Inspect authentication configuration.
9. Inspect environment variables.
10. Inspect existing API routes.
11. Inspect Prisma/database schema if present.
12. Identify existing bugs.
13. Identify duplicated components.
14. Identify unused dependencies.
15. Identify incomplete features.

DO NOT blindly overwrite an existing project.

Reuse working code where appropriate.

Before implementing major changes, create a clear internal implementation plan.

---

# 3. REQUIRED UI/UX SYSTEM

Use the following UI/UX skill as the primary design reference:

https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Follow the principles and capabilities of this skill throughout the project.

The website must have:

- Strong visual hierarchy
- Consistent spacing
- Consistent typography
- Professional component design
- Clear CTAs
- Good contrast
- Responsive layouts
- Proper hover states
- Proper focus states
- Smooth but restrained animations
- Excellent mobile UX
- Clear feedback after actions
- Professional empty states
- Professional loading states
- Professional error states

Do not create generic AI-generated-looking UI.

Avoid excessive gradients.

Avoid unnecessary glassmorphism.

Avoid excessive rounded cards.

Avoid excessive animations.

Avoid visual clutter.

The interface should feel like a polished commercial application.

---

# 4. TECH STACK

Prefer the following stack unless the existing project requires a compatible alternative:

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui where appropriate
- Lucide icons
- Server Components where beneficial
- Client Components only when interaction requires them

Backend:

- Next.js server-side architecture/API routes/server actions
- TypeScript
- Prisma ORM

Database:

- PostgreSQL

Authentication:

- Auth.js/NextAuth or an equivalent secure authentication architecture.

State management:

- React state for local state
- Zustand or an equivalent lightweight solution where global client state is required.

Forms:

- React Hook Form
- Zod validation

Images:

- Next.js Image optimization

Payments:

Create a payment abstraction layer so payment providers can be changed later.

Support architecture for:

- Stripe
- Razorpay
- Cash on Delivery

For an India-focused store, make Razorpay + COD first-class options.

---

# 5. BRANDING

Create an original brand identity.

Do not use:

- Amazon
- Flipkart
- Their logos
- Their colors as an exact copy
- Their proprietary slogans

Use a temporary original brand name such as:

"NovaCart"

You may replace it later.

Create:

- Logo concept
- Brand typography
- Primary color
- Secondary color
- Accent color
- Neutral palette
- Success color
- Warning color
- Error color

Keep the visual identity professional and scalable.

---

# 6. APPLICATION STRUCTURE

Create a clean architecture similar to:

app/
  (store)/
  products/
  categories/
  cart/
  checkout/
  account/
  orders/
  wishlist/
  search/
  admin/
  api/

components/
  ui/
  layout/
  product/
  cart/
  checkout/
  account/
  admin/
  forms/
  navigation/

lib/
  auth/
  db/
  payments/
  validation/
  utils/
  search/
  inventory/

prisma/
  schema.prisma
  seed.ts

public/
  images/
  icons/

types/
  index.ts

hooks/

services/

Do not create unnecessarily complicated abstractions.

---

# 7. DATABASE DESIGN

Design a normalized PostgreSQL database using Prisma.

At minimum include models for:

User
Account
Session
VerificationToken
Address
Product
ProductImage
Category
Subcategory
Brand
ProductVariant
ProductAttribute
ProductAttributeValue
Inventory
Cart
CartItem
Wishlist
WishlistItem
Order
OrderItem
Payment
Shipment
Coupon
CouponUsage
Review
ReviewImage
Rating
Notification
Seller
SellerProduct
Store
SearchHistory

Include appropriate:

- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Cascading rules
- Created timestamps
- Updated timestamps

Use appropriate enums for:

UserRole
OrderStatus
PaymentStatus
ShipmentStatus
ProductStatus
CouponType
PaymentMethod

---

# 8. USER SYSTEM

Users should be able to:

- Register
- Login
- Logout
- Reset password
- Verify email where supported
- Manage profile
- Upload profile image
- Change password
- Manage addresses
- Set default address
- View orders
- View order details
- Track orders
- Manage wishlist
- Write reviews
- Manage notifications

User roles:

CUSTOMER
SELLER
ADMIN

Implement role-based authorization on the server.

Never rely only on client-side role checks.

---

# 9. HOME PAGE

Build a professional marketplace homepage.

Sections should include:

1. Announcement bar
2. Header
3. Search bar
4. Category navigation
5. Hero section
6. Promotional banners
7. Featured categories
8. Trending products
9. Best sellers
10. Flash deals
11. Recommended products
12. Recently viewed products
13. Brand showcase
14. Promotional section
15. Newsletter
16. Footer

The homepage should not feel overloaded.

Use proper spacing and visual hierarchy.

---

# 10. HEADER

Desktop header:

- Logo
- Location/delivery selector
- Search
- Account
- Wishlist
- Cart
- Navigation

Mobile header:

- Menu
- Logo
- Search
- Cart

Use a responsive navigation system.

Search should remain easy to access on mobile.

---

# 11. SEARCH

Implement real product search.

Features:

- Search suggestions
- Search history
- Product matching
- Category matching
- Brand matching
- Fuzzy matching where possible
- Search result count
- Sorting
- Filters

Search should support:

- Product name
- SKU
- Brand
- Category
- Description

Debounce client-side requests.

Do not make unnecessary database requests.

---

# 12. PRODUCT LISTING PAGE

Create pages such as:

/products
/category/[slug]
/brand/[slug]
/search

Product listing must include:

- Breadcrumbs
- Page title
- Product count
- Filters
- Sorting
- Grid/list option
- Product cards
- Pagination or infinite scrolling
- Loading skeletons
- Empty state

Desktop:

4–5 product columns depending on screen width.

Tablet:

2–3 columns.

Mobile:

2 columns where appropriate.

---

# 13. FILTER SYSTEM

Support:

- Category
- Subcategory
- Brand
- Price
- Rating
- Availability
- Discount
- Attributes
- Size
- Color
- Storage
- RAM
- Other category-specific attributes

Filters should update URL query parameters.

Example:

?brand=apple,samsung&minPrice=10000&maxPrice=50000&rating=4

This makes filtered pages shareable and SEO-friendly.

---

# 14. PRODUCT CARD

Create a reusable ProductCard.

Include:

- Product image
- Discount badge
- Product name
- Brand
- Rating
- Review count
- Current price
- Original price
- Discount percentage
- Wishlist button
- Quick add/cart action
- Stock status

Use proper image aspect ratios.

Do not distort product images.

Add hover interactions on desktop.

Make the card fully usable on touch devices.

---

# 15. PRODUCT DETAIL PAGE

Create a premium product detail page.

Include:

- Image gallery
- Thumbnail navigation
- Zoom
- Product title
- Brand
- Rating
- Review count
- SKU
- Price
- Original price
- Discount
- Offers
- Product variants
- Quantity selector
- Stock status
- Delivery location
- Delivery estimate
- Add to cart
- Buy now
- Wishlist
- Share
- Seller information
- Product highlights
- Description
- Specifications
- Reviews
- Related products
- Frequently bought together

On mobile, make the primary purchase actions easy to access.

---

# 16. PRODUCT VARIANTS

Support variants such as:

- Color
- Size
- Storage
- RAM
- Capacity
- Model

Variant selection must dynamically update:

- Price
- Stock
- Images
- SKU
- Availability

Do not allow users to add an unavailable variant to cart.

---

# 17. CART

Build a complete shopping cart.

Features:

- Add product
- Remove product
- Update quantity
- Variant selection
- Save for later
- Move to wishlist
- Stock validation
- Price calculation
- Discount calculation
- Coupon
- Tax
- Shipping
- Grand total

Show:

Subtotal
Discount
Shipping
Tax
Total

Validate cart again on the server during checkout.

Never trust client-side prices.

---

# 18. WISHLIST

Users can:

- Add/remove products
- View wishlist
- Move item to cart
- Remove item
- See stock status
- See current price

Wishlist must persist to the database for authenticated users.

---

# 19. CHECKOUT

Build a multi-step checkout.

Step 1:

Address

Step 2:

Delivery method

Step 3:

Payment

Step 4:

Order review

Step 5:

Confirmation

Support:

- Saved addresses
- New address
- Default address
- Delivery options
- Coupon
- Payment method
- Order summary

Prevent checkout when:

- Product is unavailable
- Quantity exceeds inventory
- Product price changed
- Cart is empty

Show appropriate messages.

---

# 20. PAYMENTS

Create a payment service abstraction.

Support:

- Razorpay
- Stripe architecture
- Cash on Delivery

Payment lifecycle:

1. Create order intent
2. Validate cart
3. Reserve/check inventory
4. Create payment
5. Redirect/open payment interface
6. Verify payment server-side
7. Update order
8. Reduce inventory
9. Generate confirmation
10. Send notification

Never trust payment success data directly from the browser.

Verify payment server-side.

---

# 21. CASH ON DELIVERY

COD should support:

- COD eligibility
- Maximum COD amount
- Delivery restrictions
- COD fee if configured

Make configuration available through admin settings.

---

# 22. ORDERS

Users can view:

- All orders
- Pending
- Processing
- Shipped
- Delivered
- Cancelled
- Returned

Order detail should show:

- Order number
- Date
- Items
- Quantity
- Price
- Address
- Payment
- Shipping
- Status
- Tracking information

---

# 23. ORDER TRACKING

Create a timeline:

Order placed
↓
Confirmed
↓
Packed
↓
Shipped
↓
Out for delivery
↓
Delivered

Include:

- Timestamp
- Status
- Tracking ID
- Carrier
- Estimated delivery

---

# 24. REVIEWS

Users can review products they purchased.

Support:

- 1–5 star rating
- Written review
- Images
- Verified purchase badge
- Helpful/unhelpful voting
- Review sorting
- Review filtering

Prevent duplicate reviews for the same order item unless explicitly allowed.

---

# 25. RATINGS

Display:

★★★★★

Average rating

Rating distribution:

5 ★ █████████
4 ★ ██████
3 ★ ███
2 ★
1 ★

Calculate ratings efficiently.

Cache/aggregate where appropriate.

---

# 26. COUPONS

Create coupon functionality.

Support:

- Percentage discount
- Fixed discount
- Minimum order amount
- Maximum discount
- Expiration date
- Usage limit
- Per-user limit
- Product-specific coupon
- Category-specific coupon
- First-order coupon

Validate coupons on the server.

---

# 27. INVENTORY

Inventory system must support:

- Stock quantity
- Reserved quantity
- Available quantity
- Low-stock threshold
- Out-of-stock state
- Inventory updates
- Inventory history

Prevent overselling.

Use database transactions for critical inventory operations.

---

# 28. ADMIN DASHBOARD

Create a complete admin panel.

Dashboard:

- Revenue
- Orders
- Customers
- Products
- Inventory
- Sales
- Conversion
- Average order value

Charts:

- Revenue over time
- Orders over time
- Top products
- Top categories
- Customer growth

Cards:

Revenue
Orders
Customers
Products

---

# 29. ADMIN PRODUCT MANAGEMENT

Admin can:

- Create product
- Edit product
- Delete product
- Publish/unpublish
- Upload images
- Manage variants
- Manage inventory
- Assign category
- Assign brand
- Set price
- Set discount
- Set tax
- Set SKU

Include confirmation dialogs for destructive operations.

---

# 30. ADMIN ORDER MANAGEMENT

Admin can:

- View orders
- Search orders
- Filter orders
- View order details
- Change status
- Update shipment
- Add tracking number
- Cancel orders
- Process returns/refunds where supported

Protect every admin action server-side.

---

# 31. ADMIN USER MANAGEMENT

Admin can:

- View users
- Search users
- Filter users
- View user details
- Change roles where authorized
- Disable accounts
- View order history

Never expose sensitive authentication data.

---

# 32. SELLER ARCHITECTURE

Design the system so multiple sellers can eventually operate on the platform.

Seller features:

- Seller registration
- Seller profile
- Store
- Product management
- Inventory
- Orders
- Sales analytics
- Earnings
- Seller status

Seller dashboard:

- Revenue
- Orders
- Products
- Inventory
- Sales chart

Use authorization so sellers can only access their own resources.

---

# 33. CATEGORY SYSTEM

Create hierarchical categories.

Example:

Electronics
  Smartphones
  Laptops
  Tablets
  Accessories

Fashion
  Men
  Women
  Kids

Home
  Furniture
  Kitchen
  Decor

Create category pages with:

- Banner
- Subcategories
- Featured products
- Filters
- Sorting

---

# 34. RESPONSIVE DESIGN

The application must work correctly at:

320px
375px
425px
768px
1024px
1280px
1440px
1920px+

Do not simply shrink the desktop design.

Design mobile layouts intentionally.

Check:

- Navigation
- Product grids
- Product details
- Checkout
- Tables
- Admin dashboard
- Forms
- Dialogs
- Filters

---

# 35. ACCESSIBILITY

Follow WCAG principles.

Implement:

- Semantic HTML
- Keyboard navigation
- Focus indicators
- ARIA labels where needed
- Accessible dialogs
- Accessible forms
- Proper color contrast
- Screen-reader-friendly labels
- Alt text
- Reduced-motion support

Never use color alone to communicate important information.

---

# 36. PERFORMANCE

Optimize:

- Server rendering
- Database queries
- Images
- Fonts
- JavaScript bundles
- API calls
- Caching

Use:

- Next.js Image
- Lazy loading
- Pagination
- Proper database indexes
- Server Components
- Streaming where useful

Avoid unnecessary client-side JavaScript.

---

# 37. SEO

Implement:

- Dynamic metadata
- Product metadata
- Category metadata
- Open Graph
- Twitter/X cards
- Canonical URLs
- Sitemap
- Robots.txt
- Structured data

Product schema should include:

- Name
- Image
- Description
- Brand
- SKU
- Offers
- Price
- Availability
- Rating

---

# 38. ERROR HANDLING

Every important operation must handle:

- Network errors
- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- Payment errors
- Inventory errors
- Not found errors

Create:

- 404 page
- Error page
- Loading states
- Empty states

Messages should be understandable to normal users.

Do not expose stack traces or sensitive server errors.

---

# 39. TOAST NOTIFICATIONS

Use notifications for:

- Added to cart
- Removed from cart
- Added to wishlist
- Removed from wishlist
- Coupon applied
- Coupon failed
- Profile updated
- Address saved
- Order placed
- Payment failed

Avoid excessive notifications.

---

# 40. LOADING STATES

Create polished skeleton loaders for:

- Product cards
- Product detail
- Cart
- Orders
- Dashboard
- Tables

Do not show blank screens while loading.

---

# 41. EMPTY STATES

Create useful empty states.

Examples:

Empty cart:

"Your cart is empty."

CTA:

"Start shopping"

Empty wishlist:

"No saved products yet."

No search results:

"No products found."

Provide useful suggestions.

---

# 42. SECURITY

Implement:

- Input validation
- Zod schemas
- Authentication
- Authorization
- Secure cookies
- CSRF protection where required
- Rate limiting architecture
- Server-side validation
- SQL injection prevention through Prisma
- XSS protection
- Secure file upload validation
- Payment verification
- Environment variable protection

Never expose:

- Database credentials
- API secrets
- Payment secrets
- Authentication secrets

Do not commit .env files.

Create:

.env.example

---

# 43. API DESIGN

Create clean APIs/server actions.

Examples:

GET /api/products
GET /api/products/[id]
POST /api/products

GET /api/categories
POST /api/categories

GET /api/cart
POST /api/cart
PATCH /api/cart
DELETE /api/cart

GET /api/orders
POST /api/orders
GET /api/orders/[id]

POST /api/checkout

POST /api/payments/create
POST /api/payments/verify

POST /api/reviews

POST /api/coupons/validate

Follow consistent response formats.

Validate every request.

---

# 44. DATABASE SEEDING

Create realistic seed data.

Include:

- Multiple categories
- Multiple brands
- At least 30 products
- Product images
- Variants
- Inventory
- Customers
- Admin account
- Sample orders
- Reviews
- Coupons

Use realistic but clearly fictional product data.

Do not depend on external APIs just to populate the demo.

---

# 45. IMAGE HANDLING

Build a proper image architecture.

Support:

- Product gallery
- Multiple product images
- Variant-specific images
- Profile images
- Category banners

Validate:

- File type
- File size
- Dimensions where appropriate

Never trust uploaded file extensions alone.

---

# 46. SEARCH UX

Search should feel fast.

Desktop:

Large central search bar.

Mobile:

Dedicated search experience.

Suggestions can contain:

Products
Categories
Brands
Recent searches

Keyboard support:

Arrow up
Arrow down
Enter
Escape

---

# 47. NAVIGATION

Create:

- Main navigation
- Category navigation
- Breadcrumbs
- Account navigation
- Admin navigation
- Seller navigation

Navigation should clearly communicate current location.

---

# 48. MOBILE EXPERIENCE

Mobile should be treated as a first-class experience.

Use:

- Bottom navigation where useful
- Sticky purchase CTA on product pages
- Mobile filter drawer
- Mobile sorting controls
- Touch-friendly buttons
- Swipeable product galleries
- Compact checkout

Minimum touch target should generally be around 44px.

---

# 49. ANIMATIONS

Use animation sparingly.

Good uses:

- Modal transitions
- Dropdowns
- Toasts
- Cart updates
- Product hover
- Page transitions
- Skeleton shimmer

Avoid:

- Excessive bouncing
- Distracting backgrounds
- Constant movement
- Long animations

Respect prefers-reduced-motion.

---

# 50. DESIGN DETAILS

Use:

- Professional typography
- Consistent border radius
- Consistent shadows
- Strong spacing system
- Consistent iconography
- Clear hierarchy

Do not randomly mix:

- Different button styles
- Different radius values
- Different shadows
- Different font families

Create reusable design tokens.

---

# 51. DARK MODE

If appropriate, support:

Light mode
Dark mode
System mode

Ensure every component works correctly in both modes.

Do not simply invert colors.

Check:

- Contrast
- Borders
- Cards
- Inputs
- Tables
- Charts
- Dialogs

---

# 52. ADMIN TABLES

Tables should support:

- Search
- Sorting
- Filtering
- Pagination
- Row actions
- Bulk actions where appropriate
- Responsive behavior

On mobile, convert wide tables into usable cards or horizontal scrolling.

---

# 53. FORMS

Every form must have:

- Labels
- Validation
- Error messages
- Loading state
- Success state
- Disabled state
- Proper keyboard navigation

Use React Hook Form + Zod where appropriate.

---

# 54. TRANSACTIONS

Critical operations must use database transactions.

Especially:

- Checkout
- Order creation
- Inventory reduction
- Coupon usage
- Payment confirmation

Avoid partial order creation.

---

# 55. ORDER CREATION LOGIC

When placing an order:

1. Authenticate user.
2. Retrieve cart from database.
3. Validate cart.
4. Recalculate prices.
5. Validate inventory.
6. Validate coupon.
7. Calculate taxes.
8. Calculate shipping.
9. Create order transaction.
10. Create order items.
11. Reserve/reduce inventory.
12. Create payment record.
13. Clear cart.
14. Return order confirmation.

Never trust:

- Client price
- Client discount
- Client stock
- Client total

---

# 56. ADMIN SETTINGS

Create configurable settings for:

- Store name
- Currency
- Tax
- Shipping
- COD
- Payment providers
- Coupon rules
- Low-stock threshold
- Order settings

Do not hard-code values that should be configurable.

---

# 57. INDIA-FOCUSED SUPPORT

Since this application may target Indian customers, support:

Currency:

INR ₹

Address fields:

Name
Phone
Address
Apartment/Flat
Area
City
State
Pincode
Country

Payment:

Razorpay
UPI architecture
Cards
Net Banking
Wallets
COD

Make the system extensible for other countries.

---

# 58. CURRENCY

Use a proper money representation.

Do not rely on floating point for financial calculations.

Prefer integer smallest units where appropriate.

Example:

₹999.99 should not be represented as an unsafe floating-point calculation.

---

# 59. PRODUCT DATA

Each product should support:

name
slug
description
shortDescription
brand
category
subcategory
sku
price
compareAtPrice
discount
tax
images
variants
attributes
inventory
rating
reviewCount
status
featured
createdAt
updatedAt

---

# 60. PRODUCT SEO

Each product should generate:

Title:

Product Name | Brand | Store

Description:

SEO-friendly product description.

Slug:

/products/product-name

Generate structured data.

---

# 61. CATEGORY SEO

Category pages should include:

- SEO title
- SEO description
- Canonical URL
- Breadcrumb schema
- Product listing schema where appropriate

---

# 62. ADMIN ANALYTICS

Provide useful metrics:

Revenue
Orders
Average Order Value
Customers
Conversion
Top Products
Top Categories
Inventory alerts

Allow date ranges:

Today
7 days
30 days
90 days
Year

---

# 63. DASHBOARD DESIGN

Dashboard should immediately answer:

How much did we sell?
How many orders?
How many customers?
What products are performing?
What needs attention?

Create:

Metric cards
Charts
Recent orders
Low-stock alerts
Top products

---

# 64. NOTIFICATIONS

Create a notification system.

Examples:

Order confirmed
Payment successful
Order shipped
Order delivered
Price drop
Back in stock
Coupon available

Users should be able to mark notifications as read.

---

# 65. EMAIL ARCHITECTURE

Create an email service abstraction.

Potential emails:

Welcome
Email verification
Password reset
Order confirmation
Payment confirmation
Shipping update
Delivery confirmation
Cancellation
Refund

Do not hard-code one email provider into business logic.

---

# 66. CODE QUALITY

Follow:

- TypeScript strict mode
- ESLint
- Clean component architecture
- Small reusable components
- Meaningful names
- No unnecessary duplication
- No any unless absolutely necessary
- Proper error handling
- Server/client boundary awareness

Avoid giant components.

---

# 67. DO NOT CHEAT

Do NOT:

- Build only a static frontend
- Fake backend functionality
- Fake payment success
- Store everything in localStorage
- Hard-code product pages
- Hard-code dashboard numbers
- Ignore authentication
- Ignore authorization
- Ignore database validation
- Use placeholder buttons that do nothing
- Leave obvious TODOs
- Claim something is implemented when it is not

If a feature cannot be fully integrated because credentials are unavailable, implement the architecture properly and clearly isolate the configuration requirement.

---

# 68. DEVELOPMENT PROCESS

Work in phases.

PHASE 1:

Inspect project and establish architecture.

PHASE 2:

Create database schema.

PHASE 3:

Create authentication.

PHASE 4:

Create core UI/design system.

PHASE 5:

Build storefront.

PHASE 6:

Build products/categories/search.

PHASE 7:

Build cart/wishlist.

PHASE 8:

Build checkout/payment architecture.

PHASE 9:

Build orders/tracking/reviews.

PHASE 10:

Build admin dashboard.

PHASE 11:

Build seller architecture.

PHASE 12:

SEO/performance/accessibility.

PHASE 13:

Testing.

PHASE 14:

Final audit.

---

# 69. TESTING

Before considering the project complete, test:

Authentication
Registration
Login
Logout
Password reset
Product browsing
Search
Filters
Sorting
Product details
Variants
Cart
Quantity
Wishlist
Coupons
Checkout
COD
Payment architecture
Orders
Order tracking
Reviews
Admin
Seller permissions
Mobile UI
Desktop UI
Dark mode
Error states

---

# 70. BUILD VALIDATION

Run:

- TypeScript check
- ESLint
- Build
- Tests where configured

Fix all errors.

Do not stop after the first error.

After every major phase:

1. Check code.
2. Check types.
3. Check build.
4. Fix errors.
5. Continue.

---

# 71. FINAL QUALITY AUDIT

Before finishing, inspect the application as if you were a real customer.

Ask:

Can I easily find products?

Can I search?

Can I filter?

Can I understand pricing?

Can I add variants?

Can I add to cart?

Can I checkout?

Can I see my order?

Can I manage my account?

Does mobile work?

Are errors understandable?

Does the UI look professional?

Then inspect it as an administrator.

Ask:

Can I manage products?

Can I manage inventory?

Can I manage orders?

Can I manage users?

Can I see analytics?

Are permissions secure?

---

# 72. IMPORTANT AGENT BEHAVIOR

You are not merely generating snippets.

You are responsible for implementing the complete project.

When you encounter an issue:

1. Investigate the root cause.
2. Explain it briefly internally.
3. Implement the correct solution.
4. Verify it.
5. Continue.

Do not repeatedly ask for permission for normal development operations.

You may create/edit project files, install required dependencies, modify schemas, create components, and run development commands when the environment permits.

However, do not delete important existing functionality without first understanding its purpose.

---

# 73. EXISTING PROJECT RULE

If this is an existing project:

DO NOT restart from zero unless absolutely necessary.

First inspect.

Then improve.

Preserve:

- Existing working features
- Existing database data
- Existing configuration
- Existing authentication
- Existing integrations

Only replace architecture when there is a strong technical reason.

---

# 74. UI CONSISTENCY RULE

Every page must look like it belongs to the same product.

Use the same:

- Header
- Footer
- Typography
- Buttons
- Cards
- Inputs
- Dialogs
- Badges
- Tables
- Spacing
- Colors
- Icons

Do not make every page look like a separate template.

---

# 75. FINAL OUTPUT

When development is complete, provide:

1. What was implemented.
2. Project architecture.
3. Database models.
4. Authentication setup.
5. Payment setup.
6. Environment variables required.
7. Seed instructions.
8. Development command.
9. Production build command.
10. Known limitations.
11. Remaining optional improvements.

Most importantly:

**DO NOT claim the application is complete until the project builds successfully and the major flows have been checked.**

---

# FINAL INSTRUCTION

Start by inspecting the existing repository.

Do not immediately start writing random components.

First understand the project.

Then create an implementation plan.

Then implement the application systematically.

Use the UI/UX Pro Max skill throughout the design and development process:

https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Build a **real, scalable, responsive, secure, production-quality e-commerce platform**, not a mockup.

Prioritize:

**Functionality → Security → UX → Performance → Accessibility → SEO → Visual polish.**

If an implementation decision is ambiguous, choose the option that produces the most maintainable and production-ready architecture.