#!/usr/bin/env python
"""Quick test to check what's actually displaying in the enterprise app"""

from playwright.sync_api import sync_playwright
import time

def quick_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("\nLoading app...")
        page.goto("http://localhost:8503", timeout=30000)
        page.wait_for_timeout(3000)

        # Take screenshot
        page.screenshot(path="final_screenshot.png")
        print("Screenshot saved to enterprise_screenshot.png")

        # Get all visible text
        print("\n=== VISIBLE TEXT ===")
        all_text = page.locator("body").inner_text()
        print(all_text[:2000])  # First 2000 chars

        # Check for navigation
        print("\n=== NAVIGATION ===")
        selects = page.locator("select").all()
        print(f"Found {len(selects)} select elements")

        buttons = page.locator("button").all()
        print(f"Found {len(buttons)} buttons")

        # Check sidebar
        sidebar = page.locator("[data-testid='stSidebar']")
        if sidebar.is_visible():
            sidebar_text = sidebar.inner_text()
            print("\nSidebar content:")
            print(sidebar_text[:500])


        browser.close()

if __name__ == "__main__":
    quick_test()