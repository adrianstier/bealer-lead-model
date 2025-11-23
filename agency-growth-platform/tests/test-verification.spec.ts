import { test, expect } from '@playwright/test';

test('Lead Analysis Data tab is first and has Export Documentation button', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('input[type="password"]', 'bealer2025');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Navigate to Lead Analysis
  await page.click('text=Lead Analysis');
  await page.waitForTimeout(500);

  // Check Data tab is first in the tab list
  const tabs = await page.locator('.bg-gray-100 button').allTextContents();
  expect(tabs[0]).toBe('Data');

  // Click on Data tab
  await page.click('text=Data');
  await page.waitForTimeout(500);

  // Verify Export Documentation button exists
  const exportBtn = page.locator('text=Export Documentation');
  await expect(exportBtn).toBeVisible();

  console.log('✅ Data tab is first');
  console.log('✅ Export Documentation button visible');
});

test('Customer Lookup shows example customer on load', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('input[type="password"]', 'bealer2025');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Navigate to Customer Lookup
  await page.click('text=Customer Lookup');
  await page.waitForTimeout(500);

  // Check example customer is shown
  const exampleBanner = page.locator('text=This is an example customer');
  await expect(exampleBanner).toBeVisible();

  // Check Sarah Johnson name is shown
  const customerName = page.locator('text=Example: Sarah Johnson');
  await expect(customerName).toBeVisible();

  console.log('✅ Example customer banner visible');
  console.log('✅ Sarah Johnson example customer loaded');
});

test('Lead Analysis Export PDF button exists', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('input[type="password"]', 'bealer2025');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Navigate to Lead Analysis
  await page.click('text=Lead Analysis');
  await page.waitForTimeout(500);

  // Verify Export PDF button exists in header
  const exportPdfBtn = page.locator('button:has-text("Export PDF")');
  await expect(exportPdfBtn).toBeVisible();

  console.log('✅ Export PDF button visible in Lead Analysis header');
});
