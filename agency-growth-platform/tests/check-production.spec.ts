import { test, expect } from '@playwright/test';

test.describe('Verify Production Deployment', () => {
  const PROD_URL = 'https://bealer-lead-model.vercel.app';

  test('Production site loads and has latest features', async ({ page }) => {
    // Go to production
    await page.goto(PROD_URL);
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="password"]', 'bealer2025');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    console.log('✅ Login successful');

    // Navigate to Lead Analysis
    await page.click('text=Lead Analysis');
    await page.waitForTimeout(1000);

    // Verify Data tab is FIRST
    const tabs = await page.locator('.bg-gray-100 button').allTextContents();
    console.log('Tab order:', tabs.join(' | '));
    expect(tabs[0]).toBe('Data');
    console.log('✅ Data tab is first');

    // Click Data tab
    await page.click('button:has-text("Data")');
    await page.waitForTimeout(500);

    // Verify Export Documentation button
    const exportDocBtn = page.locator('button:has-text("Export Documentation")');
    await expect(exportDocBtn).toBeVisible();
    console.log('✅ Export Documentation button visible');

    // Verify Export PDF button in header
    const exportPdfBtn = page.locator('button:has-text("Export PDF")');
    await expect(exportPdfBtn).toBeVisible();
    console.log('✅ Export PDF button visible');

    // Navigate to Customer Lookup
    await page.click('text=Customer Lookup');
    await page.waitForTimeout(1000);

    // Verify example customer loads
    const exampleBanner = page.locator('text=This is an example customer');
    await expect(exampleBanner).toBeVisible();
    console.log('✅ Example customer banner visible');

    const sarahName = page.locator('text=Example: Sarah Johnson');
    await expect(sarahName).toBeVisible();
    console.log('✅ Sarah Johnson example customer loaded');

    // Check for the high-risk indicators
    const singlePolicy = page.locator('text=single policy');
    await expect(singlePolicy).toBeVisible();
    console.log('✅ High-risk description visible');

    console.log('\n🎉 ALL PRODUCTION CHECKS PASSED!');
    console.log(`\nProduction URL: ${PROD_URL}`);
  });
});
