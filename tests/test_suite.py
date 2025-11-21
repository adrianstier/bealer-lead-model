"""
Comprehensive Test Suite for Derek's Agency Growth Simulator
Tests edge cases, validation, and business logic
"""

import sys
import numpy as np
import pandas as pd
from colorama import init, Fore, Style
import traceback
from agency_simulator import SimulationParameters, AgencySimulator

# Initialize colorama for colored output
init()

class TestRunner:
    """Test runner with colored output and detailed reporting"""

    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.results = []

    def run_test(self, test_name, test_func):
        """Run a single test and track results"""
        try:
            result, message = test_func()
            if result == "pass":
                self.passed += 1
                print(f"{Fore.GREEN}✓{Style.RESET_ALL} {test_name}")
                if message:
                    print(f"  {Fore.CYAN}{message}{Style.RESET_ALL}")
            elif result == "warning":
                self.warnings += 1
                print(f"{Fore.YELLOW}⚠{Style.RESET_ALL} {test_name}")
                print(f"  {Fore.YELLOW}{message}{Style.RESET_ALL}")
            else:
                self.failed += 1
                print(f"{Fore.RED}✗{Style.RESET_ALL} {test_name}")
                print(f"  {Fore.RED}{message}{Style.RESET_ALL}")
            self.results.append((test_name, result, message))
        except Exception as e:
            self.failed += 1
            print(f"{Fore.RED}✗{Style.RESET_ALL} {test_name}")
            print(f"  {Fore.RED}Exception: {str(e)}{Style.RESET_ALL}")
            self.results.append((test_name, "fail", str(e)))

    def print_summary(self):
        """Print test summary"""
        total = self.passed + self.failed + self.warnings
        print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Test Summary:{Style.RESET_ALL}")
        print(f"  {Fore.GREEN}Passed: {self.passed}/{total}{Style.RESET_ALL}")
        if self.warnings > 0:
            print(f"  {Fore.YELLOW}Warnings: {self.warnings}/{total}{Style.RESET_ALL}")
        if self.failed > 0:
            print(f"  {Fore.RED}Failed: {self.failed}/{total}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")

        if self.failed == 0:
            print(f"\n{Fore.GREEN}🎉 All critical tests passed!{Style.RESET_ALL}")
        else:
            print(f"\n{Fore.RED}❌ Some tests failed. Please review.{Style.RESET_ALL}")


# Edge Case Tests
def test_zero_leads():
    """Test with zero lead spend"""
    params = SimulationParameters(baseline_lead_spend=0)
    sim = AgencySimulator(params)
    results = sim.simulate_scenario(12, lead_spend_monthly=0)

    # Should still have policies from retention
    if results['policies_end'].iloc[-1] > 0:
        return "pass", f"Handles zero leads correctly (retention only)"
    return "fail", "Zero leads breaks simulation"


def test_zero_staff():
    """Test with zero staff"""
    params = SimulationParameters(current_staff_fte=0)
    sim = AgencySimulator(params)
    results = sim.simulate_scenario(12, lead_spend_monthly=1000, additional_staff_fte=0)

    # Should have zero new policies with no staff
    if results['new_policies'].sum() == 0:
        return "pass", "Zero staff correctly prevents new business"
    return "fail", "Zero staff doesn't prevent new policies"


def test_extreme_retention():
    """Test with 100% and 0% retention"""
    # 100% retention
    params_high = SimulationParameters(annual_retention_base=1.0)
    sim_high = AgencySimulator(params_high)
    results_high = sim_high.simulate_scenario(12, lead_spend_monthly=0)

    # 0% retention
    params_low = SimulationParameters(annual_retention_base=0.0)
    sim_low = AgencySimulator(params_low)
    results_low = sim_low.simulate_scenario(12, lead_spend_monthly=0)

    high_ok = results_high['policies_end'].iloc[-1] >= params_high.current_policies
    low_ok = results_low['policies_end'].iloc[-1] == 0

    if high_ok and low_ok:
        return "pass", "Extreme retention values handled correctly"
    return "fail", f"Retention edge cases failed (100%: {high_ok}, 0%: {low_ok})"


def test_negative_inputs():
    """Test that negative inputs are handled"""
    try:
        params = SimulationParameters(
            current_policies=500,
            baseline_lead_spend=1000
        )
        sim = AgencySimulator(params)

        # Negative lead spend should be treated as 0
        results = sim.simulate_scenario(12, lead_spend_monthly=-1000)

        if results is not None and len(results) > 0:
            return "warning", "Negative inputs should be validated (currently allowed)"
        return "fail", "Negative inputs crash simulation"
    except:
        return "fail", "Negative inputs not handled properly"


def test_extreme_overload():
    """Test staff overload with extreme lead volumes"""
    params = SimulationParameters(
        max_leads_per_fte_per_month=100,
        current_staff_fte=1
    )
    sim = AgencySimulator(params)

    # 10x overload
    results = sim.simulate_scenario(
        12,
        lead_spend_monthly=25000,  # 1000 leads/month with 1 FTE
        additional_staff_fte=0
    )

    # Efficiency should be significantly degraded
    avg_bind_rate = results['effective_bind_rate'].mean()
    base_bind_rate = params.contact_rate * params.quote_rate * params.bind_rate

    if avg_bind_rate < base_bind_rate * 0.8:  # At least 20% degradation
        return "pass", f"Overload penalty working (efficiency: {avg_bind_rate:.2%})"
    return "warning", f"Overload may not be penalizing enough (efficiency: {avg_bind_rate:.2%})"


def test_very_long_simulation():
    """Test simulation over long time periods"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    # 10 year simulation
    results = sim.simulate_scenario(120, lead_spend_monthly=2000)

    if len(results) == 120 and results['policies_end'].iloc[-1] > 0:
        final_policies = results['policies_end'].iloc[-1]
        return "pass", f"Long simulation works (10 years, {final_policies:.0f} policies)"
    return "fail", "Long simulation fails"


def test_cost_exceeds_revenue():
    """Test scenarios where costs always exceed revenue"""
    params = SimulationParameters(
        commission_rate=0.05,  # Low commission
        staff_monthly_cost_per_fte=10000,  # High staff cost
        lead_cost_per_lead=100  # High lead cost
    )
    sim = AgencySimulator(params)
    results = sim.simulate_scenario(24, lead_spend_monthly=5000)

    total_profit = results['net_profit'].sum()
    if total_profit < 0:
        return "pass", f"Handles unprofitable scenarios (loss: ${-total_profit:,.0f})"
    return "warning", "Expected loss but showing profit"


def test_payback_calculation():
    """Test payback period calculation accuracy"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    baseline = sim.run_baseline(36)
    test = sim.simulate_scenario(36, lead_spend_monthly=2000, additional_staff_fte=1)
    comparison = sim.compare_scenarios(baseline, test)

    if comparison['payback_month'] is not None:
        # Verify payback month is correct
        cumulative = comparison['incremental_cumulative_profit']
        payback_month = comparison['payback_month']

        if payback_month > 0 and payback_month <= len(cumulative):
            before_positive = cumulative[payback_month - 2] if payback_month > 1 else 0
            at_payback = cumulative[payback_month - 1]

            if before_positive <= 0 and at_payback > 0:
                return "pass", f"Payback calculation correct (month {payback_month})"
        return "fail", "Payback month calculation incorrect"
    return "warning", "No payback within simulation period"


def test_roi_calculation():
    """Test ROI calculation accuracy"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    baseline = sim.run_baseline(24)
    test = sim.simulate_scenario(24, lead_spend_monthly=3000, additional_staff_fte=1)
    comparison = sim.compare_scenarios(baseline, test)

    # Manually calculate ROI
    incremental_costs = (test['total_costs'] - baseline['total_costs']).sum()
    incremental_profit = comparison['total_incremental_profit']
    manual_roi = (incremental_profit / incremental_costs * 100) if incremental_costs > 0 else 0

    if abs(comparison['roi_percent'] - manual_roi) < 0.1:  # Within 0.1%
        return "pass", f"ROI calculation accurate ({comparison['roi_percent']:.1f}%)"
    return "fail", f"ROI mismatch: {comparison['roi_percent']:.1f}% vs {manual_roi:.1f}%"


def test_system_boost_stacking():
    """Test that concierge and newsletter boosts stack correctly"""
    params = SimulationParameters(
        annual_retention_base=0.85,
        concierge_retention_boost=0.03,
        newsletter_retention_boost=0.02
    )
    sim = AgencySimulator(params)

    # Test each system separately and together
    no_systems = sim.simulate_scenario(12, lead_spend_monthly=1000)
    concierge_only = sim.simulate_scenario(12, lead_spend_monthly=1000, has_concierge=True)
    newsletter_only = sim.simulate_scenario(12, lead_spend_monthly=1000, has_newsletter=True)
    both_systems = sim.simulate_scenario(12, lead_spend_monthly=1000,
                                        has_concierge=True, has_newsletter=True)

    retention_base = no_systems['monthly_retention'].iloc[0]
    retention_concierge = concierge_only['monthly_retention'].iloc[0]
    retention_newsletter = newsletter_only['monthly_retention'].iloc[0]
    retention_both = both_systems['monthly_retention'].iloc[0]

    # Convert to annual for easier comparison
    annual_base = retention_base ** 12
    annual_both = retention_both ** 12

    expected_annual = min(0.95, 0.85 + 0.03 + 0.02)  # Should be 0.90
    actual_annual = annual_both

    if abs(expected_annual - actual_annual) < 0.001:
        return "pass", f"System boosts stack correctly ({actual_annual:.1%} annual)"
    return "fail", f"System boost stacking error: expected {expected_annual:.1%}, got {actual_annual:.1%}"


def test_extreme_conversion_rates():
    """Test with 100% and 0% conversion rates"""
    # 100% conversion
    params_high = SimulationParameters(
        contact_rate=1.0,
        quote_rate=1.0,
        bind_rate=1.0
    )
    sim_high = AgencySimulator(params_high)
    results_high = sim_high.simulate_scenario(1, lead_spend_monthly=1000)
    leads_high = results_high['leads'].iloc[0]
    new_policies_high = results_high['new_policies'].iloc[0]

    # 0% conversion
    params_low = SimulationParameters(
        contact_rate=0.0,
        quote_rate=0.0,
        bind_rate=0.0
    )
    sim_low = AgencySimulator(params_low)
    results_low = sim_low.simulate_scenario(1, lead_spend_monthly=1000)
    new_policies_low = results_low['new_policies'].iloc[0]

    if new_policies_high == leads_high and new_policies_low == 0:
        return "pass", "Extreme conversion rates handled correctly"
    return "fail", f"Conversion extremes failed (100%: {new_policies_high}/{leads_high}, 0%: {new_policies_low})"


def test_decimal_staff():
    """Test with fractional FTE values"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    # Test various fractional FTE values
    results_half = sim.simulate_scenario(6, lead_spend_monthly=1000, additional_staff_fte=0.5)
    results_quarter = sim.simulate_scenario(6, lead_spend_monthly=1000, additional_staff_fte=0.25)

    if len(results_half) == 6 and len(results_quarter) == 6:
        return "pass", "Fractional FTE values handled correctly"
    return "fail", "Fractional FTE causes issues"


def test_optimization_function():
    """Test the optimization function"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    optimal = sim.optimize_investment(
        months=12,
        max_additional_spend=3000,
        spend_increment=500
    )

    if optimal and 'scenario' in optimal and 'metrics' in optimal:
        scenario = optimal['scenario']
        metrics = optimal['metrics']

        if scenario and metrics:
            return "pass", f"Optimization found solution (ROI: {metrics.get('roi_percent', 0):.1f}%)"
    return "fail", "Optimization function failed"


def test_memory_efficiency():
    """Test memory usage with large simulations"""
    import psutil
    import os

    process = psutil.Process(os.getpid())
    memory_before = process.memory_info().rss / 1024 / 1024  # MB

    params = SimulationParameters()
    sim = AgencySimulator(params)

    # Run multiple large simulations
    for _ in range(10):
        results = sim.simulate_scenario(120, lead_spend_monthly=2000)

    memory_after = process.memory_info().rss / 1024 / 1024  # MB
    memory_increase = memory_after - memory_before

    if memory_increase < 100:  # Less than 100MB increase
        return "pass", f"Memory efficient (increase: {memory_increase:.1f}MB)"
    return "warning", f"High memory usage (increase: {memory_increase:.1f}MB)"


def test_boundary_months():
    """Test with boundary values for months"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    # Test 1 month
    results_1 = sim.simulate_scenario(1, lead_spend_monthly=1000)

    # Test 0 months (should handle gracefully)
    try:
        results_0 = sim.simulate_scenario(0, lead_spend_monthly=1000)
        if len(results_0) == 0:
            one_month_ok = len(results_1) == 1
            zero_month_ok = True
        else:
            one_month_ok = False
            zero_month_ok = False
    except:
        one_month_ok = len(results_1) == 1
        zero_month_ok = False  # Should handle 0 months gracefully

    if one_month_ok:
        if zero_month_ok:
            return "pass", "Boundary months handled correctly"
        return "warning", "Zero months not handled gracefully"
    return "fail", "Boundary month values cause issues"


def test_data_consistency():
    """Test that data remains consistent throughout simulation"""
    params = SimulationParameters()
    sim = AgencySimulator(params)
    results = sim.simulate_scenario(24, lead_spend_monthly=2000)

    # Check that policies_end[i-1] ≈ policies_start[i]
    for i in range(1, len(results)):
        prev_end = results.iloc[i-1]['policies_end']
        curr_start = results.iloc[i]['policies_start']

        if abs(prev_end - curr_start) > 0.01:  # Allow tiny floating point differences
            return "fail", f"Data inconsistency at month {i}: {prev_end} != {curr_start}"

    # Check that new_policies + retained_policies = policies_end
    for i in range(len(results)):
        new = results.iloc[i]['new_policies']
        retained = results.iloc[i]['retained_policies']
        end = results.iloc[i]['policies_end']

        if abs((new + retained) - end) > 0.01:
            return "fail", f"Policy math inconsistent at month {i}"

    return "pass", "Data consistency maintained throughout simulation"


def test_commission_calculation():
    """Test commission revenue calculations"""
    params = SimulationParameters(
        current_policies=100,
        avg_premium_annual=1200,  # $100/month
        commission_rate=0.10,  # 10% commission
        annual_retention_base=1.0,  # 100% retention for simplicity
        baseline_lead_spend=0  # No new business
    )
    sim = AgencySimulator(params)
    results = sim.simulate_scenario(1, lead_spend_monthly=0)

    expected_monthly_revenue = 100 * 100 * 0.10  # 100 policies * $100/mo * 10%
    actual_revenue = results.iloc[0]['commission_revenue']

    if abs(expected_monthly_revenue - actual_revenue) < 1:  # Within $1
        return "pass", f"Commission calculation accurate (${actual_revenue:.2f})"
    return "fail", f"Commission error: expected ${expected_monthly_revenue:.2f}, got ${actual_revenue:.2f}"


# UX Tests
def test_reasonable_defaults():
    """Test that default parameters are reasonable"""
    params = SimulationParameters()

    checks = [
        (params.current_policies > 0, "Current policies positive"),
        (params.lead_cost_per_lead > 0 and params.lead_cost_per_lead < 200, "Lead cost reasonable"),
        (params.contact_rate >= 0.5 and params.contact_rate <= 1.0, "Contact rate reasonable"),
        (params.annual_retention_base >= 0.7 and params.annual_retention_base <= 0.95, "Retention reasonable"),
        (params.avg_premium_annual >= 500 and params.avg_premium_annual <= 5000, "Premium reasonable"),
        (params.commission_rate >= 0.05 and params.commission_rate <= 0.25, "Commission reasonable"),
    ]

    failed = [desc for check, desc in checks if not check]

    if not failed:
        return "pass", "All defaults are reasonable"
    return "warning", f"Unreasonable defaults: {', '.join(failed)}"


def test_scenario_comparison():
    """Test that scenario comparisons make sense"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    baseline = sim.run_baseline(12)
    more_leads = sim.simulate_scenario(12, lead_spend_monthly=2000)

    comparison = sim.compare_scenarios(baseline, more_leads)

    # More leads should generally increase policies
    if comparison['policy_growth'] > 0:
        return "pass", "Scenario comparisons logical"
    return "warning", "More leads didn't increase policies - check parameters"


def run_all_tests():
    """Run all tests"""
    runner = TestRunner()

    print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}Running Comprehensive Test Suite{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}\n")

    # Edge Case Tests
    print(f"{Fore.YELLOW}Edge Case Tests:{Style.RESET_ALL}")
    runner.run_test("Zero leads scenario", test_zero_leads)
    runner.run_test("Zero staff scenario", test_zero_staff)
    runner.run_test("Extreme retention values", test_extreme_retention)
    runner.run_test("Negative inputs", test_negative_inputs)
    runner.run_test("Extreme staff overload", test_extreme_overload)
    runner.run_test("Very long simulation", test_very_long_simulation)
    runner.run_test("Costs exceed revenue", test_cost_exceeds_revenue)
    runner.run_test("Extreme conversion rates", test_extreme_conversion_rates)
    runner.run_test("Decimal staff values", test_decimal_staff)
    runner.run_test("Boundary month values", test_boundary_months)

    print(f"\n{Fore.YELLOW}Calculation Tests:{Style.RESET_ALL}")
    runner.run_test("Payback calculation", test_payback_calculation)
    runner.run_test("ROI calculation", test_roi_calculation)
    runner.run_test("System boost stacking", test_system_boost_stacking)
    runner.run_test("Commission calculation", test_commission_calculation)
    runner.run_test("Data consistency", test_data_consistency)

    print(f"\n{Fore.YELLOW}Function Tests:{Style.RESET_ALL}")
    runner.run_test("Optimization function", test_optimization_function)
    runner.run_test("Memory efficiency", test_memory_efficiency)

    print(f"\n{Fore.YELLOW}UX Tests:{Style.RESET_ALL}")
    runner.run_test("Reasonable defaults", test_reasonable_defaults)
    runner.run_test("Scenario comparison logic", test_scenario_comparison)

    runner.print_summary()

    return runner.failed == 0


if __name__ == "__main__":
    try:
        # Check if required modules are installed
        import psutil
        import colorama
    except ImportError:
        print("Installing required test dependencies...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psutil", "colorama"])
        print("Dependencies installed. Please run again.")
        sys.exit(0)

    success = run_all_tests()
    sys.exit(0 if success else 1)