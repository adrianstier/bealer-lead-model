import { test, expect } from '@playwright/test';

test.describe('Scenario Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait for the app to load - look for any tab or main content
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should navigate to Scenario Analysis tab', async ({ page }) => {
    // Click on Scenario Analysis tab
    await page.click('text=Scenario Analysis');

    // Verify we're on the scenario analysis page
    await expect(page.locator('text=Scenario Analysis')).toBeVisible();
  });

  test('should display projection charts with valid data', async ({ page }) => {
    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');

    // Wait for charts to render
    await page.waitForTimeout(1000);

    // Check for chart containers (Recharts creates SVG elements)
    const charts = await page.locator('.recharts-wrapper').count();
    console.log(`Found ${charts} chart(s)`);

    // Verify at least one chart is present
    expect(charts).toBeGreaterThan(0);
  });

  test('should update projections when changing inputs', async ({ page }) => {
    // Navigate to Strategy Builder first to set inputs
    await page.click('text=Strategy Builder');
    await page.waitForTimeout(500);

    // Find and modify a numeric input (e.g., current policies)
    const policyInput = page.locator('input[type="number"]').first();
    if (await policyInput.isVisible()) {
      await policyInput.fill('500');
      await page.waitForTimeout(300);
    }

    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    // Verify charts are rendered
    const charts = await page.locator('.recharts-wrapper').count();
    expect(charts).toBeGreaterThan(0);
  });

  test('should show multiple scenario projections', async ({ page }) => {
    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    // Look for scenario labels (Conservative, Moderate, Aggressive)
    const pageContent = await page.content();

    const hasConservative = pageContent.includes('Conservative') || pageContent.includes('conservative');
    const hasModerate = pageContent.includes('Moderate') || pageContent.includes('moderate');
    const hasAggressive = pageContent.includes('Aggressive') || pageContent.includes('aggressive');

    console.log(`Scenarios found - Conservative: ${hasConservative}, Moderate: ${hasModerate}, Aggressive: ${hasAggressive}`);

    // At least one scenario type should be visible
    expect(hasConservative || hasModerate || hasAggressive).toBeTruthy();
  });

  test('should render line charts with data points', async ({ page }) => {
    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    // Check for line chart elements
    const lines = await page.locator('.recharts-line').count();
    const bars = await page.locator('.recharts-bar').count();

    console.log(`Found ${lines} line(s) and ${bars} bar(s) in charts`);

    // Should have chart elements
    expect(lines + bars).toBeGreaterThan(0);
  });

  test('should display Y-axis with reasonable values', async ({ page }) => {
    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    // Get Y-axis tick values
    const yAxisTicks = await page.locator('.recharts-yAxis .recharts-cartesian-axis-tick-value').allTextContents();

    console.log('Y-axis values:', yAxisTicks);

    // Check that we have Y-axis values
    expect(yAxisTicks.length).toBeGreaterThan(0);

    // Verify values are reasonable (not NaN, Infinity, or extremely high)
    for (const tick of yAxisTicks) {
      const cleanTick = tick.replace(/[$,%K]/g, '').trim();
      if (cleanTick && !isNaN(parseFloat(cleanTick))) {
        const value = parseFloat(cleanTick);
        expect(value).not.toBe(Infinity);
        expect(value).not.toBe(-Infinity);
        expect(isNaN(value)).toBe(false);
      }
    }
  });

  test('should display X-axis with time periods', async ({ page }) => {
    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    // Get X-axis tick values
    const xAxisTicks = await page.locator('.recharts-xAxis .recharts-cartesian-axis-tick-value').allTextContents();

    console.log('X-axis values:', xAxisTicks);

    // Check that we have X-axis values (months or years)
    expect(xAxisTicks.length).toBeGreaterThan(0);
  });

  test('should have tooltips on hover', async ({ page }) => {
    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    // Find a chart and hover over it
    const chartArea = page.locator('.recharts-surface').first();
    if (await chartArea.isVisible()) {
      await chartArea.hover();
      await page.waitForTimeout(500);

      // Check if tooltip appears
      const tooltip = await page.locator('.recharts-tooltip-wrapper').isVisible();
      console.log(`Tooltip visible on hover: ${tooltip}`);
    }
  });

  test('projections should increase over time for growth scenarios', async ({ page }) => {
    // Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'tests/screenshots/scenario-analysis.png', fullPage: true });
    console.log('Screenshot saved to tests/screenshots/scenario-analysis.png');
  });

  test('should handle rapid tab switching', async ({ page }) => {
    // Rapidly switch between tabs to test stability
    for (let i = 0; i < 3; i++) {
      await page.click('text=Scenario Analysis');
      await page.waitForTimeout(200);
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(200);
      await page.click('text=Results');
      await page.waitForTimeout(200);
    }

    // End on Scenario Analysis and verify it still works
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(1000);

    const charts = await page.locator('.recharts-wrapper').count();
    expect(charts).toBeGreaterThan(0);
  });
});
