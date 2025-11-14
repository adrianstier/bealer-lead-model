#!/usr/bin/env python
"""Test the new Unit Economics dashboard in Results tab"""

from playwright.sync_api import sync_playwright
import time

def test_unit_economics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\n🚀 Loading Agency Growth Platform...")
        page.goto("http://localhost:5174", timeout=30000)
        page.wait_for_timeout(2000)

        # Navigate to Strategy Builder
        print("\n🎯 Navigating to Strategy Builder...")
        strategy_tab = page.locator("button[role='tab']", has_text="Strategy Builder")
        strategy_tab.click()
        page.wait_for_timeout(1000)

        # Scroll to Calculate button
        print("\n🔍 Finding Calculate button...")
        calculate_button = page.locator("button", has_text="Calculate Growth Scenarios")
        calculate_button.scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        # Click Calculate
        print("\n⚙️  Clicking Calculate Growth Scenarios...")
        calculate_button.click()
        page.wait_for_timeout(2500)  # Wait for calculation

        # Click to view Results
        print("\n📈 Navigating to Results tab...")
        results_btn = page.locator("button", has_text="View Strategic Recommendations")
        results_btn.click()
        page.wait_for_timeout(1500)

        # Check if Results tab is active
        results_tab = page.locator("button[role='tab']", has_text="Results")
        is_active = results_tab.get_attribute("aria-selected") == "true"
        if is_active:
            print("✓ Successfully navigated to Results tab!")

        # Scroll to Unit Economics section
        print("\n🔍 Looking for Unit Economics Dashboard...")
        unit_econ_heading = page.locator("h3", has_text="Unit Economics Analysis")

        if unit_econ_heading.is_visible():
            print("✓ Unit Economics Dashboard found!")
            unit_econ_heading.scroll_into_view_if_needed()
            page.wait_for_timeout(500)

            # Check for key metrics
            print("\n📊 Checking for key metrics...")
            metrics = [
                "Customer Lifetime Value",
                "Customer Acquisition Cost",
                "LTV:CAC Ratio",
                "Break-Even Point"
            ]

            for metric in metrics:
                metric_elem = page.locator("text=" + metric).first
                if metric_elem.is_visible():
                    print(f"  ✓ {metric}")
                else:
                    print(f"  ✗ {metric} NOT FOUND")

            # Take screenshot of Unit Economics
            page.screenshot(path="unit_economics_dashboard.png", full_page=True)
            print("\n✓ Screenshot saved: unit_economics_dashboard.png")

            # Get actual values
            print("\n📈 Unit Economics Values:")
            try:
                # Try to extract the actual displayed values
                ltv_value = page.locator("text=Customer Lifetime Value").locator("..").locator("..").locator("div").filter(has_text="$").first.inner_text()
                print(f"  LTV: {ltv_value}")
            except:
                print("  LTV: (value extraction skipped)")

        else:
            print("✗ Unit Economics Dashboard NOT FOUND!")
            page.screenshot(path="results_page_error.png", full_page=True)
            print("Saved error screenshot: results_page_error.png")

        print("\n✅ Test completed!")
        print("\n⏰ Keeping browser open for 10 seconds for review...")
        time.sleep(10)

        browser.close()

if __name__ == "__main__":
    test_unit_economics()
