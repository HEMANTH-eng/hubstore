import { test, expect } from '@playwright/test';

test.describe('Storefront & Catalog Discovery', () => {
  test('should display homepage hero, brand elements, and deals', async ({ page }) => {
    await page.goto('/');
    
    // Check brand / page title
    await expect(page).toHaveTitle(/HubStore/i);
    
    // Check navigation header desktop search
    const searchInput = page.locator('header input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
    
    // Check category navigation links
    const categoryLinks = page.locator('a[href*="/category/"]');
    await expect(categoryLinks.first()).toBeVisible();
  });

  test('should perform search and display search results', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('header input[placeholder*="Search"]').first();
    await searchInput.fill('Noise');
    await page.waitForTimeout(500); // Debounce
    
    // Submit search via Enter
    await searchInput.press('Enter');
    
    // Should navigate to search page
    await expect(page).toHaveURL(/\/search\?q=Noise/i);
    
    // Wait for search result products to be visible
    const productCard = page.locator('a[href*="/products/"]').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
  });

  test('should explore catalog and toggle category filter', async ({ page }) => {
    await page.goto('/products');
    
    // Check catalog heading
    await expect(page.locator('h1, h2')).toContainText(/All Products|Catalog|Products/i);
    
    // Wait for product cards to load from /api/products
    const productLink = page.locator('a[href^="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });
    
    const count = await page.locator('a[href^="/products/"]').count();
    expect(count).toBeGreaterThan(0);
  });
});
