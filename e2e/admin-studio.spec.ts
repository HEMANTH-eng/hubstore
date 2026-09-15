import { test, expect } from '@playwright/test';

test.describe('Admin Control Center & Studios', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Admin using one-click demo credentials
    await page.goto('/login');
    const adminDemoBtn = page.locator('button:has-text("Admin")');
    if (await adminDemoBtn.isVisible()) {
      await adminDemoBtn.click();
      await page.locator('button[type="submit"]:has-text("Sign In")').click();
      await page.waitForURL(/\/admin/, { timeout: 10000 });
    }
  });

  test('should view admin dashboard metrics', async ({ page }) => {
    await page.goto('/admin');
    
    // Verify Admin Header / Dashboard
    await expect(page.locator('h1, h2:has-text("Dashboard"), h1, h2:has-text("Admin")').first()).toBeVisible();
    
    // Check metric cards exist (Revenue, Orders, Products, Customers)
    const statCards = page.locator('div:has-text("Total Revenue"), div:has-text("Total Orders")');
    await expect(statCards.first()).toBeVisible();
  });

  test('should view products management and access New Product Studio', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Check "Add New Product" button
    const addProductBtn = page.locator('a[href="/admin/products/new"], button:has-text("Add New Product")').first();
    await expect(addProductBtn).toBeVisible();
    await addProductBtn.click();
    
    // Verify Product Studio loaded
    await page.waitForURL(/\/admin\/products\/new/);
    await expect(page.locator('h1:has-text("Create New Marketplace Product")')).toBeVisible();
    await expect(page.locator('button:has-text("Publish Product Listing")')).toBeVisible();
  });

  test('should display active coupons management console', async ({ page }) => {
    await page.goto('/admin/coupons');
    
    // Expect coupons header
    await expect(page.locator('h1:has-text("Promotional Coupons")')).toBeVisible();
    
    // Check for seeded coupon codes in the table
    const table = page.locator('table');
    await expect(table.getByText('WELCOME50').first()).toBeVisible();
    
    // Check "Create Coupon" trigger button exists
    const createCouponBtn = page.locator('button:has-text("Create Coupon")').first();
    await expect(createCouponBtn).toBeVisible();
  });
});
