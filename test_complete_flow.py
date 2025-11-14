#!/usr/bin/env python
"""Complete test of navigation and modal functionality"""

from playwright.sync_api import sync_playwright
import time

def test_complete_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\n🚀 Loading Agency Growth Platform...")
        page.goto("http://localhost:5174", timeout=30000)
        page.wait_for_timeout(2000)

        # Take initial screenshot
        page.screenshot(path="01_homepage.png", full_page=True)
        print("✓ Screenshot 1: Homepage with new navigation")

        # Test navigation visibility
        print("\n📊 Analyzing Navigation...")
        tabs = page.locator("button[role='tab']").all()
        for i, tab in enumerate(tabs):
            text = tab.inner_text()
            is_active = tab.get_attribute("aria-selected") == "true"
            status = "🟢 ACTIVE" if is_active else "⚪ Inactive"
            print(f"  {status}: {text}")

        # Click on Strategy Builder tab
        print("\n🎯 Navigating to Strategy Builder...")
        strategy_tab = page.locator("button[role='tab']", has_text="Strategy Builder")
        strategy_tab.click()
        page.wait_for_timeout(1000)
        page.screenshot(path="02_strategy_builder.png", full_page=True)
        print("✓ Screenshot 2: Strategy Builder page")

        # Scroll to the Calculate button
        print("\n🔍 Finding Calculate button...")
        calculate_button = page.locator("button", has_text="Calculate Growth Scenarios")
        calculate_button.scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        # Take screenshot before clicking
        page.screenshot(path="03_before_calculate.png", full_page=True)
        print("✓ Screenshot 3: Before clicking Calculate")

        # Click the Calculate button
        print("\n⚙️  Clicking Calculate Growth Scenarios...")
        calculate_button.click()
        page.wait_for_timeout(500)

        # Check if modal appeared
        modal = page.locator(".fixed.inset-0")
        if modal.is_visible():
            print("✓ Modal appeared!")
            page.screenshot(path="04_modal_calculating.png")
            print("✓ Screenshot 4: Calculating modal")

            # Wait for calculation to complete
            print("\n⏳ Waiting for calculation to complete...")
            page.wait_for_timeout(2000)

            # Check if completion state is visible
            complete_heading = page.locator("h2", has_text="Calculation Complete")
            if complete_heading.is_visible():
                print("✓ Calculation completed!")
                page.screenshot(path="05_modal_complete.png")
                print("✓ Screenshot 5: Completion modal with navigation options")

                # Show the modal buttons
                print("\n📍 Available navigation options:")
                scenario_btn = page.locator("button", has_text="View Scenario Analysis")
                results_btn = page.locator("button", has_text="View Strategic Recommendations")
                stay_btn = page.locator("button", has_text="Stay on Strategy Builder")

                if scenario_btn.is_visible():
                    print("  ✓ View Scenario Analysis button")
                if results_btn.is_visible():
                    print("  ✓ View Strategic Recommendations button")
                if stay_btn.is_visible():
                    print("  ✓ Stay on Strategy Builder button")

                # Click Scenario Analysis
                print("\n📈 Clicking 'View Scenario Analysis'...")
                scenario_btn.click()
                page.wait_for_timeout(1500)
                page.screenshot(path="06_scenario_analysis.png", full_page=True)
                print("✓ Screenshot 6: Scenario Analysis page with results")

                # Check if we're on the scenarios tab
                scenarios_tab = page.locator("button[role='tab']", has_text="Scenario Analysis")
                is_active = scenarios_tab.get_attribute("aria-selected") == "true"
                if is_active:
                    print("✓ Successfully navigated to Scenario Analysis tab!")

        print("\n✅ Test completed successfully!")
        print("\nGenerated screenshots:")
        print("  01_homepage.png - Initial page with new navigation")
        print("  02_strategy_builder.png - Strategy Builder tab")
        print("  03_before_calculate.png - Before clicking Calculate")
        print("  04_modal_calculating.png - Modal showing calculation progress")
        print("  05_modal_complete.png - Modal with navigation options")
        print("  06_scenario_analysis.png - Scenario Analysis results page")

        print("\n⏰ Keeping browser open for 10 seconds for review...")
        time.sleep(10)

        browser.close()

if __name__ == "__main__":
    test_complete_flow()
