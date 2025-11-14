#!/usr/bin/env python
"""Test navigation visibility and take screenshots"""

from playwright.sync_api import sync_playwright
import time

def test_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("\nLoading app at http://localhost:5174...")
        page.goto("http://localhost:5174", timeout=30000)
        page.wait_for_timeout(2000)

        # Take full page screenshot
        page.screenshot(path="navigation_full.png", full_page=True)
        print("✓ Saved full page screenshot: navigation_full.png")

        # Take screenshot of just the navigation area
        nav = page.locator("nav")
        if nav.is_visible():
            nav.screenshot(path="navigation_only.png")
            print("✓ Saved navigation screenshot: navigation_only.png")

        # Get navigation colors and styles
        print("\n=== NAVIGATION ANALYSIS ===")
        tabs = page.locator("button[role='tab']").all()
        print(f"Found {len(tabs)} tabs")

        for i, tab in enumerate(tabs):
            text = tab.inner_text()
            is_active = tab.get_attribute("aria-selected") == "true"
            bg_color = tab.evaluate("el => window.getComputedStyle(el).backgroundColor")
            color = tab.evaluate("el => window.getComputedStyle(el).color")
            print(f"\nTab {i+1}: {text}")
            print(f"  Active: {is_active}")
            print(f"  Background: {bg_color}")
            print(f"  Text Color: {color}")

        print("\n\nWaiting 5 seconds for you to review...")
        time.sleep(5)

        browser.close()

if __name__ == "__main__":
    test_navigation()
