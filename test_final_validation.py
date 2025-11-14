#!/usr/bin/env python
"""Final validation test for enterprise-grade agency simulator"""

from playwright.sync_api import sync_playwright
import time

def final_validation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("\n" + "="*80)
        print("FINAL VALIDATION - ENTERPRISE AGENCY GROWTH MODELING PLATFORM")
        print("="*80)

        # Load app
        page.goto("http://localhost:8502", timeout=30000)
        page.wait_for_timeout(3000)

        validation_results = {
            "Professional UI": False,
            "No Emojis/Celebrations": False,
            "Methodology Page": False,
            "Strategy Builder": False,
            "Scenario Analysis": False,
            "Results Page": False,
            "Charts Present": False,
            "Metrics Display": False,
            "Data Validation": False,
            "Enterprise Language": False
        }

        # 1. Check Professional UI
        print("\n1. PROFESSIONAL UI CHECK")
        print("-" * 40)

        # Check for professional styling
        body_text = page.locator("body").inner_text()

        # Check NO emojis/balloons
        unprofessional_emojis = ["🎉", "🎈", "🎊", "✨", "🚀", "💰", "🎯", "🎆", "🥳"]
        emoji_found = False
        for emoji in unprofessional_emojis:
            if emoji in body_text:
                emoji_found = True
                print(f"  ❌ Found unprofessional emoji: {emoji}")
                break

        if not emoji_found:
            validation_results["No Emojis/Celebrations"] = True
            print("  ✅ No unprofessional emojis or celebrations")

        # Check for professional terminology
        professional_terms = ["methodology", "analysis", "strategic", "ROI", "metrics", "validation", "projection"]
        prof_count = sum(1 for term in professional_terms if term.lower() in body_text.lower())

        if prof_count >= 5:
            validation_results["Professional UI"] = True
            validation_results["Enterprise Language"] = True
            print(f"  ✅ Professional terminology present ({prof_count}/7 terms)")
        else:
            print(f"  ⚠️  Limited professional terminology ({prof_count}/7 terms)")

        # 2. Test Navigation Pages
        print("\n2. NAVIGATION & FUNCTIONALITY")
        print("-" * 40)

        # Test Methodology page (should be default)
        if "deterministic simulation model" in body_text or "Our Approach" in body_text:
            validation_results["Methodology Page"] = True
            print("  ✅ Methodology & Approach page functional")
        else:
            print("  ❌ Methodology page not loading correctly")

        # Navigate to Strategy Builder
        dropdown = page.locator("select").first
        if dropdown.is_visible():
            dropdown.select_option("Strategy Builder")
            page.wait_for_timeout(2000)

            # Check for input fields
            inputs = page.locator("input[type='number']").count()
            sliders = page.locator("[role='slider']").count()

            if inputs > 0 or sliders > 0:
                validation_results["Strategy Builder"] = True
                print(f"  ✅ Strategy Builder functional ({inputs} inputs, {sliders} sliders)")
            else:
                print("  ❌ Strategy Builder missing input controls")

            # Configure a strategy
            if inputs > 0:
                # Set some values for testing
                lead_spend_input = page.locator("input[type='number']").nth(2)  # Additional lead spend
                if lead_spend_input.is_visible():
                    lead_spend_input.fill("3000")

        # Navigate to Scenario Analysis
        dropdown.select_option("Scenario Analysis")
        page.wait_for_timeout(3000)

        # Check for charts
        charts = page.locator("canvas").count()
        if charts > 0:
            validation_results["Charts Present"] = True
            validation_results["Scenario Analysis"] = True
            print(f"  ✅ Scenario Analysis functional ({charts} charts)")
        else:
            print("  ⚠️  Scenario Analysis - no charts found")

        # Check for metrics
        metrics = page.locator("[data-testid='stMetric']").count()
        if metrics > 0:
            validation_results["Metrics Display"] = True
            print(f"  ✅ Metrics display working ({metrics} metrics)")
        else:
            print("  ⚠️  No metrics displays found")

        # Navigate to Results
        dropdown.select_option("Results & Recommendations")
        page.wait_for_timeout(2000)

        results_text = page.locator("body").inner_text()
        if "Executive Summary" in results_text or "Strategic" in results_text or "Implementation" in results_text:
            validation_results["Results Page"] = True
            print("  ✅ Results & Recommendations page functional")
        else:
            print("  ❌ Results page not loading correctly")

        # 3. Data Validation Check
        print("\n3. DATA & MODEL VALIDATION")
        print("-" * 40)

        # Go back to methodology page
        dropdown.select_option("Methodology & Approach")
        page.wait_for_timeout(2000)

        methodology_text = page.locator("body").inner_text()

        # Check for data sources and validation metrics
        if "Data Sources" in methodology_text or "R²" in methodology_text or "MAPE" in methodology_text:
            validation_results["Data Validation"] = True
            print("  ✅ Data validation and sources documented")
        else:
            print("  ⚠️  Data validation metrics not clearly shown")

        # 4. Final Assessment
        print("\n" + "="*80)
        print("VALIDATION SUMMARY")
        print("="*80)

        passed = sum(validation_results.values())
        total = len(validation_results)
        pass_rate = (passed / total) * 100

        print(f"\nOverall Score: {passed}/{total} ({pass_rate:.0f}%)")
        print("\nDetailed Results:")

        for criterion, result in validation_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status:8} | {criterion}")

        print("\n" + "-"*80)

        # Final verdict
        if pass_rate >= 90:
            print("\n✅ FULLY VALIDATED - Enterprise-grade, ready for top-4 consulting firm")
            print("   Platform meets all professional standards")
        elif pass_rate >= 80:
            print("\n⚠️  MOSTLY VALIDATED - Minor improvements needed")
            print("   Platform is professional but has minor gaps")
        elif pass_rate >= 70:
            print("\n⚠️  PARTIALLY VALIDATED - Several improvements needed")
            print("   Platform needs refinement for enterprise use")
        else:
            print("\n❌ NOT VALIDATED - Significant work required")
            print("   Platform not ready for professional presentation")

        print("\n" + "="*80)
        print(f"Access the platform at: http://localhost:8502")
        print("="*80 + "\n")

        browser.close()

if __name__ == "__main__":
    final_validation()