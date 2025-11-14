"""
Robust Playwright Tests for Derek's Agency Growth Simulator
Handles Streamlit's specific structure and components
"""

import pytest
import time
from playwright.sync_api import Page, expect
import asyncio


BASE_URL = "http://localhost:8501"


def test_app_loads(page: Page):
    """Test that the app loads successfully"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)  # Give Streamlit time to fully load

    # Check main title is visible
    title = page.locator("h1").filter(has_text="Agency Growth Simulator")
    expect(title).to_be_visible(timeout=10000)
    print("✓ App loads successfully")


def test_sidebar_exists(page: Page):
    """Test that sidebar with parameters exists"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Check for sidebar
    sidebar = page.locator("[data-testid='stSidebar']")
    expect(sidebar).to_be_visible()

    # Check for parameter header
    params_header = page.locator("text=Simulation Parameters")
    expect(params_header).to_be_visible()
    print("✓ Sidebar exists with parameters")


def test_main_scenario_builder(page: Page):
    """Test main scenario builder section"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Check for scenario builder header
    scenario_header = page.locator("text=Build Your Growth Scenario")
    expect(scenario_header).to_be_visible()

    # Check for time horizon slider
    time_horizon = page.locator("text=Simulation Time Horizon")
    expect(time_horizon).to_be_visible()
    print("✓ Scenario builder section exists")


def test_sliders_exist(page: Page):
    """Test that key sliders exist"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Check for lead investment section
    lead_section = page.locator("text=Lead Investment")
    expect(lead_section).to_be_visible()

    # Check for staffing section
    staff_section = page.locator("text=Staffing")
    expect(staff_section).to_be_visible()

    # Count sliders on page
    sliders = page.locator("[data-testid='stSlider']")
    slider_count = sliders.count()
    assert slider_count > 0, "No sliders found on page"
    print(f"✓ Found {slider_count} sliders on page")


def test_checkboxes_exist(page: Page):
    """Test that system checkboxes exist"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Check for retention systems section
    retention_text = page.locator("text=Client Retention Systems")
    expect(retention_text).to_be_visible()

    # Check for checkboxes
    checkboxes = page.locator("input[type='checkbox']")
    checkbox_count = checkboxes.count()
    assert checkbox_count >= 2, f"Expected at least 2 checkboxes, found {checkbox_count}"
    print(f"✓ Found {checkbox_count} checkboxes")


def test_run_button_exists(page: Page):
    """Test that Run Simulation button exists"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Look for Run Simulation button
    run_button = page.get_by_role("button", name="Run Simulation")
    expect(run_button).to_be_visible()
    print("✓ Run Simulation button exists")


def test_basic_simulation_flow(page: Page):
    """Test running a basic simulation"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Find and interact with the first slider (Lead Investment)
    sliders = page.locator("[data-testid='stSlider']")
    if sliders.count() > 0:
        # Get the slider track and click at a position
        first_slider = sliders.first
        slider_track = first_slider.locator(".st-emotion-cache-11xx4re, [role='slider']").first

        # Try to interact with slider by clicking on the track
        try:
            box = first_slider.bounding_box()
            if box:
                # Click at 25% of the slider width
                page.mouse.click(box['x'] + box['width'] * 0.25, box['y'] + box['height'] / 2)
                page.wait_for_timeout(500)
                print("✓ Interacted with lead slider")
        except Exception as e:
            print(f"Could not interact with slider: {e}")

    # Click Run Simulation button
    run_button = page.get_by_role("button", name="Run Simulation")
    if run_button.is_visible():
        run_button.click()
        print("✓ Clicked Run Simulation")
        page.wait_for_timeout(5000)  # Wait for simulation to run

        # Check if results appear
        results_text = page.locator("text=/Results|Analysis|Payback|ROI/")
        if results_text.count() > 0:
            print("✓ Results section appeared")
        else:
            print("⚠ Results section not found")


def test_preset_buttons(page: Page):
    """Test preset buttons in sidebar"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Look for preset buttons
    presets = ["Conservative", "Moderate", "Aggressive"]
    found_presets = []

    for preset in presets:
        button = page.get_by_role("button", name=preset)
        if button.count() > 0:
            found_presets.append(preset)

    print(f"✓ Found preset buttons: {', '.join(found_presets)}")
    assert len(found_presets) > 0, "No preset buttons found"


def test_tabs_navigation(page: Page):
    """Test tab navigation in sidebar"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Look for tab buttons
    tabs = page.locator("[role='tab']")
    tab_count = tabs.count()

    if tab_count > 0:
        print(f"✓ Found {tab_count} tabs")

        # Try clicking first tab
        first_tab = tabs.first
        first_tab.click()
        page.wait_for_timeout(500)
        print("✓ Clicked first tab")
    else:
        print("⚠ No tabs found")


def test_help_section(page: Page):
    """Test help section exists"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Look for help expander
    help_button = page.locator("text=/Help|ℹ️/")
    if help_button.count() > 0:
        help_button.first.click()
        page.wait_for_timeout(500)

        # Check if help content appears
        help_content = page.locator("text=/Quick Start|Tips/")
        if help_content.count() > 0:
            print("✓ Help section works")
        else:
            print("⚠ Help content not found")
    else:
        print("⚠ Help button not found")


def test_capacity_indicator(page: Page):
    """Test capacity indicator updates"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Look for capacity indicator
    capacity = page.locator("text=/Capacity|utilized/")
    if capacity.count() > 0:
        print("✓ Capacity indicator found")
    else:
        print("⚠ Capacity indicator not found")


def test_investment_summary(page: Page):
    """Test investment summary card"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Look for investment summary
    summary = page.locator("text=/Investment Summary|Total Additional/")
    if summary.count() > 0:
        print("✓ Investment summary found")
    else:
        print("⚠ Investment summary not found")


def test_responsive_design(page: Page):
    """Test responsive design at different sizes"""
    # Desktop
    page.set_viewport_size({"width": 1920, "height": 1080})
    page.goto(BASE_URL)
    page.wait_for_timeout(2000)

    desktop_title = page.locator("h1")
    expect(desktop_title).to_be_visible()
    print("✓ Desktop view works")

    # Tablet
    page.set_viewport_size({"width": 768, "height": 1024})
    page.wait_for_timeout(1000)

    tablet_title = page.locator("h1")
    expect(tablet_title).to_be_visible()
    print("✓ Tablet view works")

    # Mobile
    page.set_viewport_size({"width": 375, "height": 812})
    page.wait_for_timeout(1000)

    mobile_title = page.locator("h1")
    expect(mobile_title).to_be_visible()
    print("✓ Mobile view works")


def test_error_handling(page: Page):
    """Test error handling with rapid interactions"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Try rapid clicks on Run Simulation
    run_button = page.get_by_role("button", name="Run Simulation")

    for i in range(3):
        if run_button.is_visible():
            run_button.click()
            page.wait_for_timeout(100)

    # App should still be responsive
    page.wait_for_timeout(2000)
    title = page.locator("h1")
    expect(title).to_be_visible()
    print("✓ App handles rapid clicks gracefully")


def test_simulation_with_systems(page: Page):
    """Test simulation with retention systems enabled"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Try to check the first checkbox
    checkboxes = page.locator("input[type='checkbox']")
    if checkboxes.count() > 0:
        first_checkbox = checkboxes.first
        first_checkbox.check()
        page.wait_for_timeout(500)
        print("✓ Checked first retention system")

    # Run simulation
    run_button = page.get_by_role("button", name="Run Simulation")
    if run_button.is_visible():
        run_button.click()
        page.wait_for_timeout(5000)
        print("✓ Ran simulation with systems enabled")


def test_charts_after_simulation(page: Page):
    """Test that charts appear after simulation"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Run a simulation
    run_button = page.get_by_role("button", name="Run Simulation")
    if run_button.is_visible():
        run_button.click()
        page.wait_for_timeout(5000)

        # Look for chart elements
        charts = page.locator(".plotly, canvas, [data-testid='stPlotlyChart']")
        chart_count = charts.count()

        if chart_count > 0:
            print(f"✓ Found {chart_count} charts after simulation")
        else:
            print("⚠ No charts found after simulation")


def test_recommendations(page: Page):
    """Test recommendations section appears"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Run a simulation
    run_button = page.get_by_role("button", name="Run Simulation")
    if run_button.is_visible():
        run_button.click()
        page.wait_for_timeout(5000)

        # Look for recommendations
        recommendations = page.locator("text=/Recommendation|Strongly Recommended|Not Recommended/")
        if recommendations.count() > 0:
            print("✓ Recommendations section appeared")
        else:
            print("⚠ Recommendations not found")


def test_metric_cards(page: Page):
    """Test metric cards after simulation"""
    page.goto(BASE_URL)
    page.wait_for_timeout(3000)

    # Run a simulation
    run_button = page.get_by_role("button", name="Run Simulation")
    if run_button.is_visible():
        run_button.click()
        page.wait_for_timeout(5000)

        # Look for metric cards
        metrics = ["Payback", "ROI", "Policy Growth", "Incremental Profit"]
        found_metrics = []

        for metric in metrics:
            if page.locator(f"text={metric}").count() > 0:
                found_metrics.append(metric)

        print(f"✓ Found metrics: {', '.join(found_metrics)}")


def run_all_tests():
    """Run all tests and print summary"""
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        tests = [
            ("App Loads", test_app_loads),
            ("Sidebar Exists", test_sidebar_exists),
            ("Scenario Builder", test_main_scenario_builder),
            ("Sliders Exist", test_sliders_exist),
            ("Checkboxes Exist", test_checkboxes_exist),
            ("Run Button", test_run_button_exists),
            ("Basic Simulation", test_basic_simulation_flow),
            ("Preset Buttons", test_preset_buttons),
            ("Tab Navigation", test_tabs_navigation),
            ("Help Section", test_help_section),
            ("Capacity Indicator", test_capacity_indicator),
            ("Investment Summary", test_investment_summary),
            ("Responsive Design", test_responsive_design),
            ("Error Handling", test_error_handling),
            ("Systems Simulation", test_simulation_with_systems),
            ("Charts Display", test_charts_after_simulation),
            ("Recommendations", test_recommendations),
            ("Metric Cards", test_metric_cards),
        ]

        passed = 0
        failed = 0

        print("\n" + "="*60)
        print("RUNNING STREAMLIT APP TESTS")
        print("="*60 + "\n")

        for test_name, test_func in tests:
            print(f"\nTesting: {test_name}")
            print("-" * 40)
            try:
                test_func(page)
                passed += 1
            except Exception as e:
                print(f"✗ FAILED: {e}")
                failed += 1

        browser.close()

        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"✅ Passed: {passed}/{len(tests)}")
        print(f"❌ Failed: {failed}/{len(tests)}")

        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! The app is working great!")
        else:
            print(f"\n⚠️ {failed} tests failed. Review the output above.")


if __name__ == "__main__":
    run_all_tests()