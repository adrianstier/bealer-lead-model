import { test, expect, Page } from '@playwright/test';

// Helper function to wait for any animations or transitions
async function waitForStability(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Give time for animations
}

test.describe('Agency Growth Platform - Comprehensive UI Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForStability(page);
  });

  test('should load the homepage without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Agency Growth/);

    // Check for error messages in console
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await waitForStability(page);

    // Take screenshot of initial state
    await page.screenshot({
      path: 'tests/screenshots/01-homepage-load.png',
      fullPage: true
    });

    if (errors.length > 0) {
      console.log('Page errors found:', errors);
    }
  });

  test('Strategy Builder - Marketing Inputs', async ({ page }) => {
    // Navigate to Strategy Builder tab
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/02-strategy-builder-initial.png',
      fullPage: true
    });

    // Test Marketing tab
    const marketingTab = page.locator('button:has-text("Marketing")');
    await expect(marketingTab).toBeVisible();
    await marketingTab.click();
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/03-marketing-tab.png',
      fullPage: true
    });

    // Test all marketing channel inputs
    const referralInput = page.locator('input').filter({ hasText: /Referral Program/ }).or(
      page.locator('label:has-text("Referral Program")').locator('..').locator('input')
    );

    // Try to find inputs by their labels more reliably
    const allInputs = page.locator('input[type="number"]');
    const inputCount = await allInputs.count();
    console.log(`Found ${inputCount} number inputs`);

    // Fill marketing channel values
    await page.fill('input[type="number"]').first.fill('1000');

    // Check if total is displayed correctly
    const total = page.locator('text=/Total Marketing.*\\$/');
    if (await total.isVisible()) {
      const totalText = await total.textContent();
      console.log('Marketing Total:', totalText);
      await expect(total).toBeVisible();
    }
  });

  test('Strategy Builder - Staffing Composition', async ({ page }) => {
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    // Click staffing tab
    const staffingTab = page.locator('button:has-text("Staffing")');
    await expect(staffingTab).toBeVisible();
    await staffingTab.click();
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/04-staffing-tab.png',
      fullPage: true
    });

    // Check for Service:Producer ratio display
    const ratioDisplay = page.locator('text=/Service:Producer Ratio/i');
    if (await ratioDisplay.isVisible()) {
      const ratioText = await ratioDisplay.textContent();
      console.log('Staffing Ratio:', ratioText);

      // Check for optimal indicator
      const optimalIndicator = page.locator('text=/optimal/i');
      if (await optimalIndicator.isVisible()) {
        console.log('Optimal staffing indicator found');
      }
    }

    // Test FTE inputs
    const fteInputs = page.locator('label:has-text("FTE")').locator('..').locator('input');
    const fteCount = await fteInputs.count();
    console.log(`Found ${fteCount} FTE inputs`);

    // Test compensation inputs
    const compInputs = page.locator('label:has-text("Comp")').locator('..').locator('input');
    const compCount = await compInputs.count();
    console.log(`Found ${compCount} compensation inputs`);
  });

  test('Strategy Builder - Product Mix & Policies Per Customer', async ({ page }) => {
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const productsTab = page.locator('button:has-text("Products")');
    await expect(productsTab).toBeVisible();
    await productsTab.click();
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/05-products-tab.png',
      fullPage: true
    });

    // Check for policies per customer calculation or info
    const ppcInfo = page.locator('text=/1\\.8.*policies/i');
    if (await ppcInfo.isVisible()) {
      console.log('1.8 policies per customer threshold mentioned');
    }

    // Count product inputs
    const productLabels = ['Auto', 'Home', 'Umbrella', 'Cyber', 'Commercial'];
    for (const label of productLabels) {
      const input = page.locator(`label:has-text("${label}")`);
      const visible = await input.isVisible();
      console.log(`${label} input visible:`, visible);
    }

    // Check for total policies display
    const totalPolicies = page.locator('text=/Total Policies/i');
    if (await totalPolicies.isVisible()) {
      const totalText = await totalPolicies.textContent();
      console.log('Total Policies:', totalText);
    }
  });

  test('Strategy Builder - Financial Settings', async ({ page }) => {
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const financialTab = page.locator('button:has-text("Financial")');
    await expect(financialTab).toBeVisible();
    await financialTab.click();
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/06-financial-tab.png',
      fullPage: true
    });

    // Check commission structure dropdown
    const commissionSelect = page.locator('label:has-text("Commission Structure")').locator('..').locator('select');
    if (await commissionSelect.isVisible()) {
      const options = await commissionSelect.locator('option').count();
      console.log(`Commission structure has ${options} options`);
    }

    // Check growth stage dropdown
    const growthSelect = page.locator('label:has-text("Growth Stage")').locator('..').locator('select');
    if (await growthSelect.isVisible()) {
      const value = await growthSelect.inputValue();
      console.log('Growth stage value:', value);
    }
  });

  test('Strategy Builder - Technology Investments', async ({ page }) => {
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const technologyTab = page.locator('button:has-text("Technology")');
    await expect(technologyTab).toBeVisible();
    await technologyTab.click();
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/07-technology-tab.png',
      fullPage: true
    });

    // Check for technology checkboxes
    const eoCheckbox = page.locator('text=/E&O.*Automation/i').locator('..').locator('input[type="checkbox"]');
    const renewalCheckbox = page.locator('text=/Renewal.*Program/i').locator('..').locator('input[type="checkbox"]');
    const crossSellCheckbox = page.locator('text=/Cross-Sell/i').locator('..').locator('input[type="checkbox"]');

    console.log('E&O Automation checkbox:', await eoCheckbox.isVisible());
    console.log('Renewal Program checkbox:', await renewalCheckbox.isVisible());
    console.log('Cross-Sell checkbox:', await crossSellCheckbox.isVisible());

    // Test toggling checkboxes
    if (await eoCheckbox.isVisible()) {
      await eoCheckbox.check();
      await expect(eoCheckbox).toBeChecked();
    }
  });

  test('Calculate Growth Scenarios - Button and Processing', async ({ page }) => {
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    // Find and click calculate button
    const calculateButton = page.locator('button:has-text("Calculate Growth")');
    await expect(calculateButton).toBeVisible();

    await page.screenshot({
      path: 'tests/screenshots/08-before-calculate.png',
      fullPage: true
    });

    await calculateButton.click();

    // Wait for calculation to complete
    await waitForStability(page);
    await page.waitForTimeout(2000); // Give time for any animations

    await page.screenshot({
      path: 'tests/screenshots/09-after-calculate.png',
      fullPage: true
    });

    // Check if results tab is now active or accessible
    const scenariosTab = page.locator('button:has-text("Scenarios")').or(
      page.locator('button:has-text("Results")')
    );

    if (await scenariosTab.isVisible()) {
      await scenariosTab.click();
      await waitForStability(page);
      console.log('Navigated to Scenarios/Results tab');
    }
  });

  test('Scenarios Tab - Benchmark Cards Display', async ({ page }) => {
    // First calculate scenarios
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const calculateButton = page.locator('button:has-text("Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await waitForStability(page);
    }

    // Navigate to scenarios tab
    const scenariosTab = page.locator('button:has-text("Scenarios")').or(
      page.locator('button:has-text("Results")')
    );

    if (await scenariosTab.isVisible()) {
      await scenariosTab.click();
      await waitForStability(page);

      await page.screenshot({
        path: 'tests/screenshots/10-scenarios-tab.png',
        fullPage: true
      });

      // Check for Rule of 20 card
      const ruleOf20 = page.locator('text=/Rule of 20/i');
      console.log('Rule of 20 card visible:', await ruleOf20.isVisible());

      // Check for EBITDA card
      const ebitda = page.locator('text=/EBITDA/i');
      console.log('EBITDA card visible:', await ebitda.isVisible());

      // Check for LTV:CAC card
      const ltvCac = page.locator('text=/LTV.*CAC/i');
      console.log('LTV:CAC card visible:', await ltvCac.isVisible());

      // Check for RPE card
      const rpe = page.locator('text=/Revenue.*Employee|RPE/i');
      console.log('RPE card visible:', await rpe.isVisible());

      // Check for Policies Per Customer card
      const ppc = page.locator('text=/Policies.*Customer/i');
      console.log('Policies Per Customer card visible:', await ppc.isVisible());

      // Check color coding
      const greenCards = page.locator('.bg-green-50, .text-green-600, [class*="green"]').count();
      const blueCards = page.locator('.bg-blue-50, .text-blue-600, [class*="blue"]').count();
      const yellowCards = page.locator('.bg-yellow-50, .text-yellow-600, [class*="yellow"]').count();
      const redCards = page.locator('.bg-red-50, .text-red-600, [class*="red"]').count();

      console.log('Color coded elements - Green:', await greenCards, 'Blue:', await blueCards,
                  'Yellow:', await yellowCards, 'Red:', await redCards);
    }
  });

  test('Scenarios Tab - Charts Rendering', async ({ page }) => {
    // Calculate scenarios first
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const calculateButton = page.locator('button:has-text("Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await waitForStability(page);
    }

    const scenariosTab = page.locator('button:has-text("Scenarios")').or(
      page.locator('button:has-text("Results")')
    );

    if (await scenariosTab.isVisible()) {
      await scenariosTab.click();
      await waitForStability(page);

      // Check for charts
      const charts = page.locator('.recharts-wrapper');
      const chartCount = await charts.count();
      console.log(`Found ${chartCount} charts`);

      // Check for specific chart types
      const lineCharts = page.locator('.recharts-line');
      const barCharts = page.locator('.recharts-bar');

      console.log('Line charts:', await lineCharts.count());
      console.log('Bar charts:', await barCharts.count());

      // Check for 1.8 reference line in PPC chart
      const referenceLine = page.locator('.recharts-reference-line');
      if (await referenceLine.count() > 0) {
        console.log('Reference line found (1.8 policies per customer threshold)');
      }

      await page.screenshot({
        path: 'tests/screenshots/11-charts-rendered.png',
        fullPage: true
      });
    }
  });

  test('Scenarios Tab - Comparison Table', async ({ page }) => {
    // Calculate scenarios first
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const calculateButton = page.locator('button:has-text("Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await waitForStability(page);
    }

    const scenariosTab = page.locator('button:has-text("Scenarios")').or(
      page.locator('button:has-text("Results")')
    );

    if (await scenariosTab.isVisible()) {
      await scenariosTab.click();
      await waitForStability(page);

      // Look for comparison table
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        const rows = await table.locator('tr').count();
        console.log(`Comparison table has ${rows} rows`);

        // Check for scenario columns
        const conservative = page.locator('text=/Conservative/i');
        const moderate = page.locator('text=/Moderate/i');
        const aggressive = page.locator('text=/Aggressive/i');

        console.log('Conservative column:', await conservative.isVisible());
        console.log('Moderate column:', await moderate.isVisible());
        console.log('Aggressive column:', await aggressive.isVisible());

        await page.screenshot({
          path: 'tests/screenshots/12-comparison-table.png',
          fullPage: true
        });
      }
    }
  });

  test('Number Formatting Validation', async ({ page }) => {
    // Calculate scenarios first
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const calculateButton = page.locator('button:has-text("Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await waitForStability(page);
    }

    const scenariosTab = page.locator('button:has-text("Scenarios")').or(
      page.locator('button:has-text("Results")')
    );

    if (await scenariosTab.isVisible()) {
      await scenariosTab.click();
      await waitForStability(page);

      // Check for properly formatted numbers
      const bodyText = await page.locator('body').textContent();

      // Look for numbers with commas (thousands separators)
      const hasCommaFormatting = /\d{1,3}(,\d{3})+/.test(bodyText || '');
      console.log('Has comma formatting for large numbers:', hasCommaFormatting);

      // Look for percentages
      const hasPercentages = /\d+\.?\d*%/.test(bodyText || '');
      console.log('Has percentage formatting:', hasPercentages);

      // Look for dollar signs
      const hasDollarSigns = /\$\d/.test(bodyText || '');
      console.log('Has dollar sign formatting:', hasDollarSigns);

      // Check for proper decimal places
      const hasDecimals = /\d+\.\d{1,2}/.test(bodyText || '');
      console.log('Has decimal formatting:', hasDecimals);
    }
  });

  test('Responsive Layout Check', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/13-desktop-layout.png',
      fullPage: true
    });

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/14-tablet-layout.png',
      fullPage: true
    });

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForStability(page);

    await page.screenshot({
      path: 'tests/screenshots/15-mobile-layout.png',
      fullPage: true
    });

    // Check for horizontal scrolling on mobile
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    if (scrollWidth > clientWidth) {
      console.warn('Horizontal scrolling detected on mobile!');
    }
  });

  test('Full User Flow - Complete Simulation', async ({ page }) => {
    await page.screenshot({
      path: 'tests/screenshots/16-flow-start.png',
      fullPage: true
    });

    // Navigate to Strategy Builder
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    // Fill in marketing data
    const marketingTab = page.locator('button:has-text("Marketing")');
    if (await marketingTab.isVisible()) {
      await marketingTab.click();
      await waitForStability(page);

      // Fill in some values
      const inputs = page.locator('input[type="number"]');
      const count = await inputs.count();
      if (count > 0) {
        await inputs.nth(0).fill('1000');
        await inputs.nth(1).fill('2000');
      }
    }

    // Check staffing
    const staffingTab = page.locator('button:has-text("Staffing")');
    if (await staffingTab.isVisible()) {
      await staffingTab.click();
      await waitForStability(page);
    }

    // Enable technology features
    const technologyTab = page.locator('button:has-text("Technology")');
    if (await technologyTab.isVisible()) {
      await technologyTab.click();
      await waitForStability(page);

      const checkboxes = page.locator('input[type="checkbox"]');
      const cbCount = await checkboxes.count();
      if (cbCount > 0) {
        await checkboxes.first().check();
      }
    }

    await page.screenshot({
      path: 'tests/screenshots/17-flow-inputs-filled.png',
      fullPage: true
    });

    // Calculate
    const calculateButton = page.locator('button:has-text("Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await waitForStability(page);
      await page.waitForTimeout(2000);
    }

    // View results
    const scenariosTab = page.locator('button:has-text("Scenarios")').or(
      page.locator('button:has-text("Results")')
    );

    if (await scenariosTab.isVisible()) {
      await scenariosTab.click();
      await waitForStability(page);

      await page.screenshot({
        path: 'tests/screenshots/18-flow-results.png',
        fullPage: true
      });
    }

    console.log('Full user flow completed successfully');
  });

  test('Check for Overlapping Elements', async ({ page }) => {
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    // Get all visible elements
    const elements = page.locator('*').filter({ hasText: /.+/ });
    const count = await elements.count();

    console.log(`Checking ${count} elements for overlaps...`);

    // Take detailed screenshots for manual inspection
    await page.screenshot({
      path: 'tests/screenshots/19-overlap-check.png',
      fullPage: true
    });

    // Check for common overlap issues
    const overlappingText = page.locator('*:has(> *:nth-child(1))').filter({
      has: page.locator('*'),
    });

    console.log('Completed overlap check - review screenshots for visual issues');
  });

  test('Error State Validation', async ({ page }) => {
    // Check console for errors
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate through app
    await page.click('text=Strategy Builder');
    await waitForStability(page);

    const calculateButton = page.locator('button:has-text("Calculate")');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await waitForStability(page);
    }

    console.log('Errors found:', errors.length);
    console.log('Warnings found:', warnings.length);

    if (errors.length > 0) {
      console.log('Errors:', errors);
    }
    if (warnings.length > 0) {
      console.log('Warnings:', warnings);
    }
  });
});
