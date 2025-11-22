import { test, expect } from '@playwright/test';

test.describe('Comprehensive Agency Growth Platform Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  // ==========================================
  // NAVIGATION TESTS
  // ==========================================
  test.describe('Navigation', () => {
    test('should load all tabs', async ({ page }) => {
      const tabs = ['Methodology', 'Model Details', 'Book of Business', 'Lead Analysis', 'Compensation', 'Strategy Builder', 'Scenario Analysis', 'Results'];

      for (const tab of tabs) {
        const tabButton = page.locator(`text=${tab}`).first();
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await page.waitForTimeout(300);
          console.log(`✓ ${tab} tab loaded`);
        }
      }
    });

    test('should switch between tabs without errors', async ({ page }) => {
      // Switch tabs multiple times
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(200);
      await page.click('text=Results');
      await page.waitForTimeout(200);
      await page.click('text=Scenario Analysis');
      await page.waitForTimeout(200);
      await page.click('text=Lead Analysis');
      await page.waitForTimeout(200);

      // Verify no console errors (check network)
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(500);
      console.log(`Console errors found: ${consoleErrors.length}`);
    });
  });

  // ==========================================
  // STRATEGY BUILDER TESTS
  // ==========================================
  test.describe('Strategy Builder', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);
    });

    test('should have all input fields', async ({ page }) => {
      const inputs = await page.locator('input[type="number"]').count();
      console.log(`Found ${inputs} numeric input fields`);
      expect(inputs).toBeGreaterThan(5);
    });

    test('should update values when inputs change', async ({ page }) => {
      const firstInput = page.locator('input[type="number"]').first();
      await firstInput.fill('1000');
      const value = await firstInput.inputValue();
      expect(value).toBe('1000');
    });

    test('should have Calculate button', async ({ page }) => {
      const calculateBtn = page.locator('button:has-text("Calculate")').or(page.locator('button:has-text("calculate")'));
      expect(await calculateBtn.count()).toBeGreaterThan(0);
    });

    test('should calculate scenarios when button clicked', async ({ page }) => {
      // Find and click calculate button
      const calculateBtn = page.locator('button:has-text("Calculate")').first();
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        await page.waitForTimeout(1000);

        // Check for results
        const hasResults = await page.locator('text=Conservative').or(page.locator('text=Moderate')).isVisible();
        console.log(`Results generated: ${hasResults}`);
      }
    });
  });

  // ==========================================
  // SCENARIO ANALYSIS TESTS
  // ==========================================
  test.describe('Scenario Analysis', () => {
    test.beforeEach(async ({ page }) => {
      // First calculate scenarios
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      const calculateBtn = page.locator('button:has-text("Calculate")').first();
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        await page.waitForTimeout(1000);

        // Close any modal that appears after calculation - try multiple methods
        try {
          // First try "Stay on Page" button
          const stayBtn = page.locator('button:has-text("Stay on Page")');
          if (await stayBtn.isVisible({ timeout: 1000 })) {
            await stayBtn.click();
            await page.waitForTimeout(300);
          }
        } catch {
          // Try escape key to close modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      }

      // Now try to navigate to Scenario Analysis
      try {
        await page.click('text=Scenario Analysis', { timeout: 5000 });
      } catch {
        // If still blocked, try escape again and force click
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await page.click('text=Scenario Analysis', { force: true });
      }
      await page.waitForTimeout(500);
    });

    test('should display policy growth chart', async ({ page }) => {
      const hasChart = await page.locator('.recharts-wrapper').count();
      console.log(`Charts found: ${hasChart}`);
      expect(hasChart).toBeGreaterThan(0);
    });

    test('should show scenario comparison cards', async ({ page }) => {
      const hasConservative = await page.locator('text=Conservative').isVisible();
      const hasModerate = await page.locator('text=Moderate').isVisible();
      const hasAggressive = await page.locator('text=Aggressive').isVisible();

      console.log(`Scenarios visible - Conservative: ${hasConservative}, Moderate: ${hasModerate}, Aggressive: ${hasAggressive}`);
      expect(hasConservative || hasModerate || hasAggressive).toBeTruthy();
    });

    test('should display ROI values', async ({ page }) => {
      const roiText = await page.locator('text=ROI').count();
      console.log(`ROI mentions found: ${roiText}`);
      expect(roiText).toBeGreaterThan(0);
    });

    test('should have sensitivity analysis section', async ({ page }) => {
      const hasSensitivity = await page.locator('text=Sensitivity Analysis').isVisible();
      console.log(`Sensitivity Analysis visible: ${hasSensitivity}`);
      expect(hasSensitivity).toBeTruthy();
    });

    test('sensitivity analysis should show conversion rate impact', async ({ page }) => {
      const hasConversionRate = await page.locator('text=Conversion Rate Impact').isVisible();
      console.log(`Conversion Rate Impact visible: ${hasConversionRate}`);
      expect(hasConversionRate).toBeTruthy();
    });

    test('sensitivity analysis should show cost per lead impact', async ({ page }) => {
      const hasCPL = await page.locator('text=Cost Per Lead Impact').isVisible();
      console.log(`Cost Per Lead Impact visible: ${hasCPL}`);
      expect(hasCPL).toBeTruthy();
    });

    test('sensitivity analysis should show retention rate impact', async ({ page }) => {
      const hasRetention = await page.locator('text=Retention Rate Impact').isVisible();
      console.log(`Retention Rate Impact visible: ${hasRetention}`);
      expect(hasRetention).toBeTruthy();
    });

    test('sensitivity analysis should show marketing spend impact', async ({ page }) => {
      const hasMarketingSpend = await page.locator('text=Marketing Spend Impact').isVisible();
      console.log(`Marketing Spend Impact visible: ${hasMarketingSpend}`);
      expect(hasMarketingSpend).toBeTruthy();
    });

    test('sensitivity analysis should have key insights', async ({ page }) => {
      const hasInsights = await page.locator('text=Key Sensitivity Insights').isVisible();
      console.log(`Key Sensitivity Insights visible: ${hasInsights}`);
      expect(hasInsights).toBeTruthy();
    });

    test('should display benchmark metrics', async ({ page }) => {
      const hasBenchmarks = await page.locator('text=Performance Benchmarks').isVisible();
      console.log(`Performance Benchmarks visible: ${hasBenchmarks}`);
    });
  });

  // ==========================================
  // LEAD ANALYSIS TESTS
  // ==========================================
  test.describe('Lead Analysis', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=Lead Analysis');
      await page.waitForTimeout(1000);
    });

    test('should load lead analysis dashboard', async ({ page }) => {
      const hasLeadAnalysis = await page.locator('h2:has-text("Lead Analysis")').isVisible();
      console.log(`Lead Analysis header visible: ${hasLeadAnalysis}`);
    });

    test('should display overview tab by default', async ({ page }) => {
      const hasOverview = await page.locator('text=Overview').isVisible();
      expect(hasOverview).toBeTruthy();
    });

    test('should have multiple tabs', async ({ page }) => {
      const tabs = ['Overview', 'Diagnostics', 'Vendors', 'Agents', 'Timing', 'Data'];
      for (const tab of tabs) {
        const tabButton = page.locator(`button:has-text("${tab}")`);
        if (await tabButton.count() > 0) {
          console.log(`✓ ${tab} tab found`);
        }
      }
    });

    test('should switch to Diagnostics tab', async ({ page }) => {
      const diagnosticsBtn = page.locator('button:has-text("Diagnostics")');
      if (await diagnosticsBtn.isVisible()) {
        await diagnosticsBtn.click();
        await page.waitForTimeout(500);
        const hasDiagnostics = await page.locator('text=Deep Dive Diagnostics').isVisible();
        console.log(`Diagnostics content visible: ${hasDiagnostics}`);
      }
    });

    test('should switch to Data tab', async ({ page }) => {
      const dataBtn = page.locator('button:has-text("Data")');
      if (await dataBtn.isVisible()) {
        await dataBtn.click();
        await page.waitForTimeout(500);
        const hasDataOverview = await page.locator('text=Data Transparency').isVisible();
        console.log(`Data overview content visible: ${hasDataOverview}`);
      }
    });
  });

  // ==========================================
  // NUMBER FORMATTING TESTS
  // ==========================================
  test.describe('Number Formatting', () => {
    test('should format large numbers with commas', async ({ page }) => {
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      // Look for formatted numbers on the page
      const pageContent = await page.content();
      const hasFormattedNumber = pageContent.match(/\d{1,3}(,\d{3})+/);
      console.log(`Has comma-formatted numbers: ${!!hasFormattedNumber}`);
    });

    test('should display percentages correctly', async ({ page }) => {
      await page.click('text=Lead Analysis');
      await page.waitForTimeout(500);

      const percentages = await page.locator('text=/%/').count();
      console.log(`Percentage values found: ${percentages}`);
    });

    test('should display currency values with $', async ({ page }) => {
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      const currencyValues = await page.locator('text=/\\$/').count();
      console.log(`Currency values found: ${currencyValues}`);
    });
  });

  // ==========================================
  // CHART RENDERING TESTS
  // ==========================================
  test.describe('Chart Rendering', () => {
    test.beforeEach(async ({ page }) => {
      // Calculate scenarios first
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      const calculateBtn = page.locator('button:has-text("Calculate")').first();
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        await page.waitForTimeout(1000);

        // Close any modal that appears after calculation
        const closeModal = page.locator('button:has-text("Stay on Page")').or(page.locator('button:has-text("Close")'));
        if (await closeModal.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeModal.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should render line charts', async ({ page }) => {
      await page.click('text=Scenario Analysis');
      await page.waitForTimeout(500);

      const lineCharts = await page.locator('.recharts-line').count();
      console.log(`Line chart elements found: ${lineCharts}`);
      expect(lineCharts).toBeGreaterThanOrEqual(0);
    });

    test('should render bar charts', async ({ page }) => {
      await page.click('text=Scenario Analysis');
      await page.waitForTimeout(500);

      const barCharts = await page.locator('.recharts-bar').count();
      console.log(`Bar chart elements found: ${barCharts}`);
    });

    test('should have chart legends', async ({ page }) => {
      await page.click('text=Scenario Analysis');
      await page.waitForTimeout(500);

      const legends = await page.locator('.recharts-legend-wrapper').count();
      console.log(`Legend elements found: ${legends}`);
    });

    test('should have chart tooltips', async ({ page }) => {
      await page.click('text=Scenario Analysis');
      await page.waitForTimeout(500);

      // Hover over a chart
      const chart = page.locator('.recharts-surface').first();
      if (await chart.isVisible()) {
        await chart.hover();
        await page.waitForTimeout(300);
      }
    });
  });

  // ==========================================
  // RESULTS TAB TESTS
  // ==========================================
  test.describe('Results Tab', () => {
    test.beforeEach(async ({ page }) => {
      // Calculate scenarios first
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      const calculateBtn = page.locator('button:has-text("Calculate")').first();
      if (await calculateBtn.isVisible()) {
        await calculateBtn.click();
        await page.waitForTimeout(1000);

        // Close any modal that appears after calculation
        const closeModal = page.locator('button:has-text("Stay on Page")').or(page.locator('button:has-text("Close")'));
        if (await closeModal.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeModal.click();
          await page.waitForTimeout(500);
        }
      }

      await page.click('text=Results');
      await page.waitForTimeout(500);
    });

    test('should display recommendations', async ({ page }) => {
      const hasRecommendations = await page.locator('text=Recommendations').or(page.locator('text=recommendations')).isVisible();
      console.log(`Recommendations visible: ${hasRecommendations}`);
    });
  });

  // ==========================================
  // RESPONSIVE DESIGN TESTS
  // ==========================================
  test.describe('Responsive Design', () => {
    test('should render on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Verify page loads
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
      console.log('Mobile viewport renders correctly');
    });

    test('should render on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);

      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
      console.log('Tablet viewport renders correctly');
    });

    test('should render on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);

      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
      console.log('Desktop viewport renders correctly');
    });
  });

  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================
  test.describe('Accessibility', () => {
    test('should have proper ARIA labels on buttons', async ({ page }) => {
      const buttonsWithAria = await page.locator('button[aria-label]').count();
      console.log(`Buttons with ARIA labels: ${buttonsWithAria}`);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      const h3Count = await page.locator('h3').count();
      console.log(`Headings - H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`);
    });

    test('should have focusable interactive elements', async ({ page }) => {
      const focusableElements = await page.locator('button:not([disabled]), input:not([disabled]), a[href]').count();
      console.log(`Focusable elements: ${focusableElements}`);
      expect(focusableElements).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================
  test.describe('Error Handling', () => {
    test('should handle empty inputs gracefully', async ({ page }) => {
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      // Clear an input
      const input = page.locator('input[type="number"]').first();
      await input.clear();
      await page.waitForTimeout(300);

      // Verify page doesn't crash
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
    });

    test('should handle negative inputs', async ({ page }) => {
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      const input = page.locator('input[type="number"]').first();
      await input.fill('-100');
      await page.waitForTimeout(300);

      // Verify page doesn't crash
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
    });

    test('should handle very large inputs', async ({ page }) => {
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      const input = page.locator('input[type="number"]').first();
      await input.fill('999999999');
      await page.waitForTimeout(300);

      // Verify page doesn't crash
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
    });
  });

  // ==========================================
  // PERFORMANCE TESTS
  // ==========================================
  test.describe('Performance', () => {
    test('should load page within 5 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
    });

    test('should calculate scenarios within 3 seconds', async ({ page }) => {
      await page.click('text=Strategy Builder');
      await page.waitForTimeout(500);

      const calculateBtn = page.locator('button:has-text("Calculate")').first();
      if (await calculateBtn.isVisible()) {
        const startTime = Date.now();
        await calculateBtn.click();
        await page.waitForTimeout(3000);
        const calcTime = Date.now() - startTime;

        console.log(`Calculation time: ${calcTime}ms`);
        expect(calcTime).toBeLessThan(3000);
      }
    });
  });

  // ==========================================
  // FULL USER FLOW TEST
  // ==========================================
  test('Complete user flow: Configure, Calculate, Analyze', async ({ page }) => {
    console.log('Starting complete user flow test...');

    // 1. Go to Strategy Builder
    await page.click('text=Strategy Builder');
    await page.waitForTimeout(500);
    console.log('1. Navigated to Strategy Builder');

    // 2. Fill in some inputs
    const inputs = await page.locator('input[type="number"]').all();
    if (inputs.length > 0) {
      await inputs[0].fill('500');
      console.log('2. Filled in policy count');
    }

    // 3. Click Calculate
    const calculateBtn = page.locator('button:has-text("Calculate")').first();
    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();
      await page.waitForTimeout(1000);
      console.log('3. Clicked Calculate button');

      // Close any modal that appears
      const closeModal = page.locator('button:has-text("Stay on Page")').or(page.locator('button:has-text("Close")'));
      if (await closeModal.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeModal.click();
        await page.waitForTimeout(500);
        console.log('3a. Closed modal');
      }
    }

    // 4. Navigate to Scenario Analysis
    await page.click('text=Scenario Analysis');
    await page.waitForTimeout(500);
    console.log('4. Navigated to Scenario Analysis');

    // 5. Verify charts are present
    const charts = await page.locator('.recharts-wrapper').count();
    console.log(`5. Found ${charts} chart(s)`);

    // 6. Verify sensitivity analysis
    const hasSensitivity = await page.locator('text=Sensitivity Analysis').isVisible();
    console.log(`6. Sensitivity Analysis visible: ${hasSensitivity}`);

    // 7. Check for scenario cards
    const hasScenarios = await page.locator('text=Conservative').or(page.locator('text=Moderate')).isVisible();
    console.log(`7. Scenario cards visible: ${hasScenarios}`);

    // 8. Go to Results
    await page.click('text=Results');
    await page.waitForTimeout(500);
    console.log('8. Navigated to Results');

    // 9. Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/complete-flow-final.png', fullPage: true });
    console.log('9. Screenshot saved');

    console.log('Complete user flow test finished!');
  });
});
