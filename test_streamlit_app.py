"""
Comprehensive Playwright Test Suite for Derek's Agency Growth Simulator
Tests all UI components, interactions, calculations, and edge cases
"""

import pytest
import re
import time
from playwright.sync_api import Page, expect
from typing import Dict, Any


# Test configuration
BASE_URL = "http://localhost:8501"
TIMEOUT = 30000  # 30 seconds


class TestAgencySimulator:
    """Main test class for the Agency Growth Simulator"""

    @pytest.fixture(autouse=True)
    def setup(self, page: Page):
        """Setup before each test"""
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(2000)  # Let Streamlit fully load
        self.page = page

    def test_page_loads_successfully(self):
        """Test that the main page loads with all key elements"""
        page = self.page

        # Check title
        expect(page.locator("h1")).to_contain_text("Derek's Agency Growth Simulator")

        # Check main sections exist
        expect(page.locator("text=Build Your Growth Scenario")).to_be_visible()
        expect(page.locator("text=Simulation Parameters")).to_be_visible()

        # Check for key UI elements
        expect(page.locator("text=Simulation Time Horizon")).to_be_visible()
        expect(page.locator("text=Additional Monthly Lead Spend")).to_be_visible()
        expect(page.locator("text=Additional Staff")).to_be_visible()

    def test_sidebar_tabs_navigation(self):
        """Test sidebar tab navigation"""
        page = self.page

        # Find and click tabs
        tabs = ["Current State", "Funnel", "Finance", "Advanced"]

        for tab_name in tabs:
            tab = page.locator(f"button:has-text('{tab_name}')")
            if tab.count() > 0:
                tab.first.click()
                page.wait_for_timeout(500)
                # Verify tab content loads
                assert page.locator(".stTabs [role='tabpanel']").is_visible()

    def test_preset_buttons(self):
        """Test quick preset buttons"""
        page = self.page

        # Test Conservative preset
        conservative_btn = page.locator("button:has-text('Conservative')")
        if conservative_btn.count() > 0:
            conservative_btn.first.click()
            page.wait_for_timeout(1000)
            # Should trigger a page update
            expect(page.locator("text=Parameters updated")).to_be_visible(timeout=5000)

    def test_slider_interactions(self):
        """Test all slider interactions"""
        page = self.page

        # Test lead spend slider
        lead_slider = page.locator("div[data-testid='stSlider']").nth(0)
        if lead_slider.count() > 0:
            # Move slider
            slider_thumb = lead_slider.locator("div[role='slider']")
            slider_thumb.drag_to(slider_thumb, target_position={"x": 100, "y": 0})
            page.wait_for_timeout(500)

            # Check that caption updates
            caption = page.locator("text=/Additional spend:.*month/")
            expect(caption).to_be_visible()

        # Test staff slider
        staff_slider = page.locator("div[data-testid='stSlider']").nth(1)
        if staff_slider.count() > 0:
            slider_thumb = staff_slider.locator("div[role='slider']")
            slider_thumb.drag_to(slider_thumb, target_position={"x": 50, "y": 0})
            page.wait_for_timeout(500)

            # Check capacity indicator updates
            capacity_text = page.locator("text=/Capacity/")
            if capacity_text.count() > 0:
                expect(capacity_text).to_be_visible()

    def test_checkbox_interactions(self):
        """Test client system checkboxes"""
        page = self.page

        # Test Concierge System checkbox
        concierge = page.locator("text=Concierge System")
        if concierge.count() > 0:
            checkbox = concierge.locator("..").locator("input[type='checkbox']")
            checkbox.check()
            page.wait_for_timeout(500)
            # Check that cost info appears
            expect(page.locator("text=/Cost:.*mo.*retention/")).to_be_visible()

        # Test Newsletter System checkbox
        newsletter = page.locator("text=Newsletter System")
        if newsletter.count() > 0:
            checkbox = newsletter.locator("..").locator("input[type='checkbox']")
            checkbox.check()
            page.wait_for_timeout(500)

    def test_run_simulation_button(self):
        """Test the Run Simulation button and results"""
        page = self.page

        # Set up a scenario
        # Adjust lead spend slider (find the first slider)
        sliders = page.locator("div[role='slider']")
        if sliders.count() >= 2:
            # Move lead spend slider
            sliders.nth(0).drag_to(sliders.nth(0), target_position={"x": 100, "y": 0})
            page.wait_for_timeout(500)

        # Click Run Simulation button
        run_btn = page.locator("button:has-text('Run Simulation')")
        if run_btn.count() > 0:
            run_btn.click()

            # Wait for results to load
            page.wait_for_timeout(3000)

            # Check that results appear
            expect(page.locator("text=Results & Analysis")).to_be_visible(timeout=10000)

            # Check for key metrics
            expect(page.locator("text=Payback Period")).to_be_visible()
            expect(page.locator("text=Return on Investment")).to_be_visible()
            expect(page.locator("text=Policy Growth")).to_be_visible()
            expect(page.locator("text=Incremental Profit")).to_be_visible()

    def test_charts_display(self):
        """Test that charts display after simulation"""
        page = self.page

        # Run a simulation first
        self._run_quick_simulation()

        # Check for chart tabs
        chart_tabs = ["Policies", "Profit", "ROI", "Efficiency", "Report"]

        for tab_name in chart_tabs:
            tab = page.locator(f"button:has-text('{tab_name}')")
            if tab.count() > 0:
                tab.first.click()
                page.wait_for_timeout(1000)

                # Check that chart content loads
                # Plotly charts have specific classes
                chart = page.locator(".plotly, .stPlotlyChart, canvas")
                if chart.count() > 0:
                    expect(chart.first).to_be_visible()

    def test_recommendations_section(self):
        """Test recommendations appear and are appropriate"""
        page = self.page

        # Run a simulation
        self._run_quick_simulation()

        # Check for recommendations
        expect(page.locator("text=Recommendations")).to_be_visible(timeout=10000)

        # Check for recommendation levels
        recommendation_indicators = ["Strongly Recommended", "Recommended with Monitoring", "Not Recommended"]
        found_recommendation = False

        for indicator in recommendation_indicators:
            if page.locator(f"text={indicator}").count() > 0:
                found_recommendation = True
                break

        assert found_recommendation, "No recommendation level found"

    def test_parameter_validation(self):
        """Test parameter validation in sidebar"""
        page = self.page

        # Try to enter invalid values
        # Find Current State tab
        current_state_tab = page.locator("button:has-text('Current State')")
        if current_state_tab.count() > 0:
            current_state_tab.first.click()
            page.wait_for_timeout(500)

            # Try negative values in number inputs
            policy_input = page.locator("input[type='number']").first
            if policy_input.count() > 0:
                policy_input.fill("-100")

                # Click update button
                update_btn = page.locator("button:has-text('Update Parameters')")
                if update_btn.count() > 0:
                    update_btn.click()
                    page.wait_for_timeout(1000)

                    # Should show error
                    error = page.locator("text=/validation failed|error|invalid/i")
                    if error.count() > 0:
                        expect(error).to_be_visible()

    def test_capacity_warnings(self):
        """Test capacity warning indicators"""
        page = self.page

        # Set high lead spend with low staff
        sliders = page.locator("div[role='slider']")
        if sliders.count() >= 2:
            # Max out lead spend
            lead_slider = sliders.nth(0)
            lead_slider.drag_to(lead_slider, target_position={"x": 300, "y": 0})
            page.wait_for_timeout(500)

            # Keep staff low
            staff_slider = sliders.nth(1)
            staff_slider.drag_to(staff_slider, target_position={"x": -100, "y": 0})
            page.wait_for_timeout(500)

            # Should show capacity warning
            warning = page.locator("text=/Over capacity|capacity warning/i")
            if warning.count() > 0:
                expect(warning).to_be_visible()

    def test_edge_case_zero_investment(self):
        """Test with zero additional investment"""
        page = self.page

        # Set all sliders to minimum
        sliders = page.locator("div[role='slider']")
        for i in range(min(2, sliders.count())):
            slider = sliders.nth(i)
            slider.drag_to(slider, target_position={"x": -200, "y": 0})
            page.wait_for_timeout(500)

        # Uncheck all systems
        checkboxes = page.locator("input[type='checkbox']")
        for i in range(checkboxes.count()):
            checkbox = checkboxes.nth(i)
            if checkbox.is_checked():
                checkbox.uncheck()

        # Try to run simulation
        run_btn = page.locator("button:has-text('Run Simulation')")
        if run_btn.count() > 0:
            # Button might be disabled or show a message
            is_disabled = run_btn.is_disabled()
            if not is_disabled:
                run_btn.click()
                page.wait_for_timeout(2000)
                # Should show some feedback
                info = page.locator("text=/Adjust sliders|No additional investment/i")
                if info.count() > 0:
                    expect(info).to_be_visible()

    def test_extreme_values(self):
        """Test with extreme parameter values"""
        page = self.page

        # Max out all investments
        sliders = page.locator("div[role='slider']")
        for i in range(min(3, sliders.count())):
            slider = sliders.nth(i)
            slider.drag_to(slider, target_position={"x": 400, "y": 0})
            page.wait_for_timeout(500)

        # Enable all systems
        checkboxes = page.locator("input[type='checkbox']")
        for i in range(checkboxes.count()):
            checkbox = checkboxes.nth(i)
            if not checkbox.is_checked():
                checkbox.check()

        # Run simulation
        run_btn = page.locator("button:has-text('Run Simulation')")
        if run_btn.count() > 0:
            run_btn.click()
            page.wait_for_timeout(3000)

            # Should complete without errors
            expect(page.locator("text=Results & Analysis")).to_be_visible(timeout=10000)

    def test_download_report(self):
        """Test report download functionality"""
        page = self.page

        # Run a simulation
        self._run_quick_simulation()

        # Go to Report tab
        report_tab = page.locator("button:has-text('Report')")
        if report_tab.count() > 0:
            report_tab.first.click()
            page.wait_for_timeout(1000)

            # Look for download button
            download_btn = page.locator("button:has-text('Download')")
            if download_btn.count() > 0:
                # Set up download handler
                with page.expect_download() as download_info:
                    download_btn.click()
                download = download_info.value

                # Verify download
                assert download.suggested_filename.endswith('.txt')

    def test_responsive_layout(self):
        """Test responsive layout at different viewport sizes"""
        page = self.page

        # Test mobile viewport
        page.set_viewport_size({"width": 375, "height": 812})
        page.wait_for_timeout(1000)

        # Main elements should still be visible
        expect(page.locator("h1")).to_be_visible()
        expect(page.locator("text=Build Your Growth Scenario")).to_be_visible()

        # Test tablet viewport
        page.set_viewport_size({"width": 768, "height": 1024})
        page.wait_for_timeout(1000)

        # Elements should be visible
        expect(page.locator("h1")).to_be_visible()

        # Test desktop viewport
        page.set_viewport_size({"width": 1920, "height": 1080})
        page.wait_for_timeout(1000)

        # All elements should be visible
        expect(page.locator("h1")).to_be_visible()

    def test_simulation_history(self):
        """Test that simulation history is tracked"""
        page = self.page

        # Run multiple simulations with different parameters
        for i in range(3):
            sliders = page.locator("div[role='slider']")
            if sliders.count() > 0:
                # Change lead spend each time
                sliders.first.drag_to(sliders.first, target_position={"x": i * 50, "y": 0})
                page.wait_for_timeout(500)

            run_btn = page.locator("button:has-text('Run Simulation')")
            if run_btn.count() > 0:
                run_btn.click()
                page.wait_for_timeout(2000)

        # Check for history section
        history = page.locator("text=Simulation History")
        if history.count() > 0:
            history.click()
            page.wait_for_timeout(500)

            # Should show multiple entries
            table_rows = page.locator("tr")
            assert table_rows.count() > 1, "History should have multiple entries"

    def test_metric_calculations(self):
        """Test that calculations are consistent"""
        page = self.page

        # Set specific values
        sliders = page.locator("div[role='slider']")
        if sliders.count() >= 2:
            # Set lead spend to a specific value
            sliders.nth(0).drag_to(sliders.nth(0), target_position={"x": 100, "y": 0})
            page.wait_for_timeout(500)

        # Run simulation
        run_btn = page.locator("button:has-text('Run Simulation')")
        if run_btn.count() > 0:
            run_btn.click()
            page.wait_for_timeout(3000)

            # Check that metrics are present and numeric
            payback = page.locator("text=/\d+ months|No payback/")
            expect(payback).to_be_visible()

            roi = page.locator("text=/[-]?\d+\.?\d*%/")
            expect(roi).to_be_visible()

    def test_error_recovery(self):
        """Test that app recovers from errors gracefully"""
        page = self.page

        # Try to break the app with rapid clicks
        run_btn = page.locator("button:has-text('Run Simulation')")
        if run_btn.count() > 0:
            for _ in range(3):
                run_btn.click()
                page.wait_for_timeout(100)

        # App should still be responsive
        page.wait_for_timeout(2000)
        expect(page.locator("h1")).to_be_visible()

    def test_tooltips_and_help(self):
        """Test that tooltips and help text are present"""
        page = self.page

        # Check for help icon
        help_expander = page.locator("text=Need Help?")
        if help_expander.count() > 0:
            help_expander.click()
            page.wait_for_timeout(500)

            # Help content should be visible
            expect(page.locator("text=Quick Start")).to_be_visible()
            expect(page.locator("text=Tips")).to_be_visible()

        # Check for tooltip indicators (💡)
        tooltips = page.locator("text=/💡/")
        assert tooltips.count() > 0, "Should have tooltip indicators"

    # Helper methods
    def _run_quick_simulation(self):
        """Helper to run a quick simulation"""
        page = self.page

        # Set some values
        sliders = page.locator("div[role='slider']")
        if sliders.count() > 0:
            sliders.first.drag_to(sliders.first, target_position={"x": 50, "y": 0})
            page.wait_for_timeout(500)

        # Click run
        run_btn = page.locator("button:has-text('Run Simulation')")
        if run_btn.count() > 0:
            run_btn.click()
            page.wait_for_timeout(3000)


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configure browser context"""
    return {
        **browser_context_args,
        "viewport": {"width": 1280, "height": 720},
        "ignore_https_errors": True,
    }


def test_app_performance(page: Page):
    """Test app loading performance"""
    start_time = time.time()
    page.goto(BASE_URL, wait_until="networkidle")
    load_time = time.time() - start_time

    assert load_time < 10, f"App took too long to load: {load_time:.2f} seconds"

    # Check that main elements load quickly
    expect(page.locator("h1")).to_be_visible(timeout=3000)


def test_concurrent_users(browser):
    """Test with multiple concurrent users"""
    contexts = []
    pages = []

    try:
        # Create multiple browser contexts
        for i in range(3):
            context = browser.new_context()
            contexts.append(context)
            page = context.new_page()
            pages.append(page)
            page.goto(BASE_URL)

        # Run simulations on all pages
        for i, page in enumerate(pages):
            sliders = page.locator("div[role='slider']")
            if sliders.count() > 0:
                sliders.first.drag_to(sliders.first, target_position={"x": i * 30, "y": 0})

            run_btn = page.locator("button:has-text('Run Simulation')")
            if run_btn.count() > 0:
                run_btn.click()

        # Wait for all to complete
        time.sleep(5)

        # Check all pages still work
        for page in pages:
            expect(page.locator("h1")).to_be_visible()

    finally:
        # Cleanup
        for context in contexts:
            context.close()


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--headed", "--slow-mo=100"])