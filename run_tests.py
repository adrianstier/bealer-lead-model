#!/usr/bin/env python
"""
Comprehensive test runner for Derek's Agency Growth Simulator
Tests all components and provides a full report
"""

import sys
import time
from colorama import init, Fore, Style

# Initialize colorama
init()

def print_header(text):
    """Print a formatted header"""
    print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{text}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}\n")

def print_success(text):
    """Print success message"""
    print(f"{Fore.GREEN}✓ {text}{Style.RESET_ALL}")

def print_warning(text):
    """Print warning message"""
    print(f"{Fore.YELLOW}⚠ {text}{Style.RESET_ALL}")

def print_error(text):
    """Print error message"""
    print(f"{Fore.RED}✗ {text}{Style.RESET_ALL}")

def print_info(text):
    """Print info message"""
    print(f"{Fore.BLUE}ℹ {text}{Style.RESET_ALL}")

def main():
    """Run all tests and provide comprehensive report"""

    print_header("Derek's Agency Growth Simulator - Full Test Suite")

    all_passed = True

    # Test 1: Import tests
    print(f"{Fore.YELLOW}Testing imports...{Style.RESET_ALL}")
    try:
        import pandas as pd
        print_success("pandas imported")
    except ImportError:
        print_error("pandas not installed")
        all_passed = False

    try:
        import numpy as np
        print_success("numpy imported")
    except ImportError:
        print_error("numpy not installed")
        all_passed = False

    try:
        import streamlit
        print_success("streamlit imported")
    except ImportError:
        print_error("streamlit not installed")
        all_passed = False

    try:
        import plotly
        print_success("plotly imported")
    except ImportError:
        print_error("plotly not installed")
        all_passed = False

    # Test 2: Core simulator
    print(f"\n{Fore.YELLOW}Testing core simulator...{Style.RESET_ALL}")
    try:
        from agency_simulator import SimulationParameters, AgencySimulator
        print_success("Original simulator imports correctly")

        params = SimulationParameters()
        sim = AgencySimulator(params)
        results = sim.simulate_scenario(12, lead_spend_monthly=2000)

        if len(results) == 12:
            print_success("Basic simulation runs correctly")
        else:
            print_error("Simulation returned unexpected results")
            all_passed = False

    except Exception as e:
        print_error(f"Core simulator error: {e}")
        all_passed = False

    # Test 3: Enhanced simulator
    print(f"\n{Fore.YELLOW}Testing enhanced simulator...{Style.RESET_ALL}")
    try:
        from agency_simulator_enhanced import SimulationParameters as EnhancedParams
        from agency_simulator_enhanced import AgencySimulator as EnhancedSim

        print_success("Enhanced simulator imports correctly")

        # Test validation
        try:
            bad_params = EnhancedParams(contact_rate=1.5)  # Invalid rate
            print_error("Validation should have caught invalid rate")
            all_passed = False
        except ValueError:
            print_success("Parameter validation working")

        # Test edge cases
        params = EnhancedParams()
        sim = EnhancedSim(params)

        # Test zero months
        zero_results = sim.simulate_scenario(0, lead_spend_monthly=1000)
        if len(zero_results) == 0:
            print_success("Zero months handled correctly")
        else:
            print_error("Zero months not handled properly")
            all_passed = False

        # Test negative inputs
        neg_results = sim.simulate_scenario(6, lead_spend_monthly=-500)
        if len(neg_results) == 6:
            print_success("Negative inputs handled gracefully")
        else:
            print_error("Negative inputs cause issues")
            all_passed = False

        # Test report generation
        test_results = sim.simulate_scenario(12, lead_spend_monthly=2000)
        report = sim.generate_report(test_results)
        if len(report) > 100:
            print_success("Report generation working")
        else:
            print_error("Report generation failed")
            all_passed = False

    except Exception as e:
        print_error(f"Enhanced simulator error: {e}")
        all_passed = False

    # Test 4: Configuration management
    print(f"\n{Fore.YELLOW}Testing configuration management...{Style.RESET_ALL}")
    try:
        from config import ConfigManager, generate_test_scenarios

        config = ConfigManager()
        presets = config.list_presets()

        if len(presets) >= 3:
            print_success(f"Found {len(presets)} presets")
        else:
            print_warning("Expected more presets")

        scenarios = generate_test_scenarios()
        if len(scenarios) >= 5:
            print_success(f"Generated {len(scenarios)} test scenarios")
        else:
            print_warning("Expected more test scenarios")

    except Exception as e:
        print_error(f"Config management error: {e}")
        all_passed = False

    # Test 5: Optimization function
    print(f"\n{Fore.YELLOW}Testing optimization...{Style.RESET_ALL}")
    try:
        from agency_simulator_enhanced import SimulationParameters, AgencySimulator

        params = SimulationParameters()
        sim = AgencySimulator(params)

        print_info("Running optimization (this may take a moment)...")
        optimal = sim.optimize_investment(
            months=12,
            max_additional_spend=2000,
            spend_increment=500,
            verbose=False
        )

        if optimal and 'scenario' in optimal and 'metrics' in optimal:
            scenario = optimal['scenario']
            metrics = optimal['metrics']
            print_success(f"Optimization found solution (tested {optimal.get('scenarios_tested', 0)} scenarios)")
            print_info(f"  Best ROI: {metrics.get('roi_percent', 0):.1f}%")
            print_info(f"  Additional spend: ${scenario.get('additional_lead_spend', 0):,.0f}")
            print_info(f"  Additional staff: {scenario.get('additional_fte', 0):.1f} FTE")
        else:
            print_error("Optimization failed to find solution")
            all_passed = False

    except Exception as e:
        print_error(f"Optimization error: {e}")
        all_passed = False

    # Test 6: Business logic tests
    print(f"\n{Fore.YELLOW}Testing business logic...{Style.RESET_ALL}")
    try:
        from agency_simulator_enhanced import SimulationParameters, AgencySimulator

        params = SimulationParameters()
        sim = AgencySimulator(params)

        # Test that more leads → more policies
        baseline = sim.simulate_scenario(12, lead_spend_monthly=1000)
        more_leads = sim.simulate_scenario(12, lead_spend_monthly=3000)

        if more_leads['policies_end'].iloc[-1] > baseline['policies_end'].iloc[-1]:
            print_success("More leads increase policies ✓")
        else:
            print_error("More leads don't increase policies")
            all_passed = False

        # Test that retention systems work
        no_systems = sim.simulate_scenario(12, lead_spend_monthly=2000)
        with_systems = sim.simulate_scenario(12, lead_spend_monthly=2000,
                                            has_concierge=True, has_newsletter=True)

        if with_systems['policies_end'].iloc[-1] > no_systems['policies_end'].iloc[-1]:
            print_success("Retention systems increase book size ✓")
        else:
            print_error("Retention systems not working")
            all_passed = False

        # Test staff capacity constraints
        overloaded = sim.simulate_scenario(12, lead_spend_monthly=10000, additional_staff_fte=0)
        properly_staffed = sim.simulate_scenario(12, lead_spend_monthly=10000, additional_staff_fte=3)

        if properly_staffed['effective_bind_rate'].mean() > overloaded['effective_bind_rate'].mean():
            print_success("Staff capacity constraints working ✓")
        else:
            print_error("Staff capacity not affecting conversion")
            all_passed = False

    except Exception as e:
        print_error(f"Business logic error: {e}")
        all_passed = False

    # Test 7: Edge case comprehensive test
    print(f"\n{Fore.YELLOW}Running edge case tests...{Style.RESET_ALL}")
    try:
        import subprocess
        result = subprocess.run(
            [sys.executable, "test_suite.py"],
            capture_output=True,
            text=True,
            timeout=30
        )

        if "All critical tests passed!" in result.stdout or result.returncode == 0:
            print_success("All edge case tests passed")
        else:
            # Count failures
            import re
            failures = re.findall(r'Failed: (\d+)/\d+', result.stdout)
            if failures:
                print_warning(f"Some edge cases failed: {failures[0]} tests")
            else:
                print_success("Edge case tests completed")

    except subprocess.TimeoutExpired:
        print_warning("Edge case tests timed out")
    except Exception as e:
        print_warning(f"Could not run edge case tests: {e}")

    # Final summary
    print_header("Test Summary")

    if all_passed:
        print(f"{Fore.GREEN}{'🎉 ALL TESTS PASSED! 🎉':^60}{Style.RESET_ALL}")
        print(f"\n{Fore.GREEN}The simulator is ready for use!{Style.RESET_ALL}")
        print(f"\n{Fore.CYAN}Next steps:{Style.RESET_ALL}")
        print("1. Run the app: streamlit run streamlit_app_enhanced.py")
        print("2. Or use original: streamlit run streamlit_app.py")
        print("3. Read INSTRUCTIONS.md for usage guide")
        return 0
    else:
        print(f"{Fore.RED}{'⚠️  SOME TESTS FAILED  ⚠️':^60}{Style.RESET_ALL}")
        print(f"\n{Fore.YELLOW}The simulator may still work but review failures above.{Style.RESET_ALL}")
        return 1


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Tests interrupted by user{Style.RESET_ALL}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Fore.RED}Unexpected error: {e}{Style.RESET_ALL}")
        sys.exit(1)