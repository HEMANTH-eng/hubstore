import { test, expect } from '@playwright/test';

test.describe('Cart, Coupon & Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Customer
    await page.goto('/login');
    const customerBtn = page.locator('button:has-text("Customer")');
    if (await customerBtn.isVisible()) {
      await customerBtn.click();
      await page.locator('button[type="submit"]:has-text("Sign In")').click();
      await page.waitForURL(/\//, { timeout: 10000 });
    }
  });

  test('should navigate to PDP, add product to cart, apply promo coupon, and view in checkout', async ({ page }) => {
    // 1. Visit homepage (server-rendered products)
    await page.goto('/');
    
    // 2. Click on the first product link
    const firstProduct = page.locator('main a[href^="/products/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();

    // 3. Verify Product Details Page loaded and click Add to Cart
    const addToCartBtn = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // 4. Check feedback toast
    await expect(page.locator('text=Added 1 item(s) to your cart!')).toBeVisible();

    // 5. Verify Checkout button in the opened Cart Drawer or Page
    const checkoutBtn = page.locator('button:has-text("Proceed to Checkout"), a:has-text("Proceed to Checkout")').first();
    
    // If the drawer didn't auto-open, click header cart trigger
    if (!(await checkoutBtn.isVisible())) {
      const headerCartBtn = page.locator('header button').filter({ hasText: 'Cart' });
      await headerCartBtn.click();
    }
    await expect(checkoutBtn).toBeVisible({ timeout: 5000 });

    // 6. Test applying coupon in cart drawer
    const couponInput = page.locator('input[placeholder*="promo" i], input[placeholder*="coupon" i]').first();
    if (await couponInput.isVisible()) {
      await couponInput.fill('WELCOME50');
      const applyBtn = page.locator('button:has-text("Apply")').first();
      await applyBtn.click();
      await page.waitForTimeout(1000);
    }

    // 7. Proceed to checkout
    await page.locator('a[href="/checkout"]:has-text("Proceed to Checkout")').first().click();

    // 8. Verify Checkout page loaded with Delivery Address section
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('text=Select Delivery Address')).toBeVisible();

    // 9. Verify Price Details summary is present with applied coupon
    await expect(page.locator('text=Price Details')).toBeVisible();
    await expect(page.getByText('Coupon Discount (WELCOME50)')).toBeVisible();
  });
});
