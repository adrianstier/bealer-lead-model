#!/usr/bin/env python3
"""
Master Test Runner
Runs all test suites and generates comprehensive report
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    BOLD = '\033[1m'
    END = '\033[0m'

class MasterTestRunner:
    def __init__(self):
        self.base_path = Path("/Users/adrianstiermbp2023/derrick-leadmodel")
        self.results = {
            'suites': [],
            'total_passed': 0,
            'total_failed': 0,
            'start_time': datetime.now().isoformat(),
            'end_time': None
        }

    def print_banner(self):
        """Print test suite banner"""
        start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}")
        print(f"║{'AGENCY GROWTH MODELING PLATFORM'.center(78)}║")
        print(f"║{'COMPREHENSIVE TEST SUITE'.center(78)}║")
        print(f"║{f'Started: {start_time}'.center(78)}║")
        print(f"{'='*80}{Colors.END}\n")

    def print_suite_header(self, name: str):
        """Print test suite header"""
        print(f"\n{Colors.BOLD}{Colors.MAGENTA}{'─'*80}")
        print(f"▶ Running: {name}")
        print(f"{'─'*80}{Colors.END}\n")

    def run_test_suite(self, name: str, script: str) -> dict:
        """Run a test suite and return results"""
        self.print_suite_header(name)

        result = {
            'name': name,
            'script': script,
            'success': False,
            'exit_code': None,
            'duration': 0
        }

        script_path = self.base_path / script

        if not script_path.exists():
            print(f"{Colors.RED}✗ Test script not found: {script}{Colors.END}")
            result['exit_code'] = -1
            return result

        try:
            start_time = datetime.now()
            process = subprocess.run(
                ['python3', str(script_path)],
                cwd=self.base_path,
                capture_output=False,  # Show output in real-time
                timeout=300  # 5 minute timeout
            )
            end_time = datetime.now()

            result['exit_code'] = process.returncode
            result['success'] = process.returncode == 0
            result['duration'] = (end_time - start_time).total_seconds()

            if result['success']:
                print(f"\n{Colors.GREEN}✓ {name} completed successfully ({result['duration']:.1f}s){Colors.END}")
            else:
                print(f"\n{Colors.RED}✗ {name} failed with exit code {process.returncode} ({result['duration']:.1f}s){Colors.END}")

        except subprocess.TimeoutExpired:
            print(f"\n{Colors.RED}✗ {name} timed out after 300 seconds{Colors.END}")
            result['exit_code'] = -2
            result['duration'] = 300
        except Exception as e:
            print(f"\n{Colors.RED}✗ {name} error: {str(e)}{Colors.END}")
            result['exit_code'] = -3

        return result

    def load_test_report(self, report_file: str) -> dict:
        """Load test report JSON if it exists"""
        report_path = self.base_path / report_file

        if not report_path.exists():
            return {}

        try:
            with open(report_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"{Colors.YELLOW}Warning: Could not load {report_file}: {str(e)}{Colors.END}")
            return {}

    def generate_final_report(self):
        """Generate and display final comprehensive report"""
        self.results['end_time'] = datetime.now().isoformat()

        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}")
        print(f"║{'FINAL TEST REPORT'.center(78)}║")
        print(f"{'='*80}{Colors.END}\n")

        # Load individual test reports
        agency_data_report = self.load_test_report('agency_data/test_report.json')
        integration_report = self.load_test_report('integration_test_report.json')

        # Display suite-by-suite results
        print(f"{Colors.BOLD}Test Suite Results:{Colors.END}\n")
        for suite in self.results['suites']:
            status = f"{Colors.GREEN}✓ PASS{Colors.END}" if suite['success'] else f"{Colors.RED}✗ FAIL{Colors.END}"
            print(f"{status} | {suite['name']:<50} | {suite['duration']:.1f}s | Exit: {suite['exit_code']}")

        # Aggregate statistics
        print(f"\n{Colors.BOLD}Detailed Test Statistics:{Colors.END}\n")

        if agency_data_report and 'summary' in agency_data_report:
            summary = agency_data_report['summary']
            print(f"{Colors.BLUE}Agency Data Tests:{Colors.END}")
            print(f"  • Total: {summary.get('total_tests', 0)}")
            print(f"  • Passed: {Colors.GREEN}{summary.get('passed', 0)}{Colors.END}")
            print(f"  • Failed: {Colors.RED}{summary.get('failed', 0)}{Colors.END}")
            print(f"  • Pass Rate: {summary.get('pass_rate', 0):.1f}%")
            self.results['total_passed'] += summary.get('passed', 0)
            self.results['total_failed'] += summary.get('failed', 0)

        if integration_report and 'summary' in integration_report:
            summary = integration_report['summary']
            print(f"\n{Colors.BLUE}Integration Tests:{Colors.END}")
            print(f"  • Total: {summary.get('total', 0)}")
            print(f"  • Passed: {Colors.GREEN}{summary.get('passed', 0)}{Colors.END}")
            print(f"  • Failed: {Colors.RED}{summary.get('failed', 0)}{Colors.END}")
            print(f"  • Skipped: {Colors.YELLOW}{summary.get('skipped', 0)}{Colors.END}")
            print(f"  • Pass Rate: {summary.get('pass_rate', 0):.1f}%")
            self.results['total_passed'] += summary.get('passed', 0)
            self.results['total_failed'] += summary.get('failed', 0)

        # Overall summary
        total = self.results['total_passed'] + self.results['total_failed']
        overall_pass_rate = (self.results['total_passed'] / total * 100) if total > 0 else 0

        print(f"\n{Colors.BOLD}Overall Summary:{Colors.END}")
        print(f"  • Total Tests: {total}")
        print(f"  • Passed: {Colors.GREEN}{self.results['total_passed']}{Colors.END}")
        print(f"  • Failed: {Colors.RED}{self.results['total_failed']}{Colors.END}")
        print(f"  • Overall Pass Rate: {overall_pass_rate:.1f}%")

        # Success/failure determination
        all_suites_passed = all(suite['success'] for suite in self.results['suites'])
        all_tests_passed = self.results['total_failed'] == 0

        print(f"\n{Colors.BOLD}{'─'*80}{Colors.END}")

        if all_suites_passed and all_tests_passed:
            print(f"{Colors.GREEN}{Colors.BOLD}")
            print("  ██████╗  █████╗ ███████╗███████╗███████╗██████╗ ")
            print("  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗")
            print("  ██████╔╝███████║███████╗███████╗█████╗  ██║  ██║")
            print("  ██╔═══╝ ██╔══██║╚════██║╚════██║██╔══╝  ██║  ██║")
            print("  ██║     ██║  ██║███████║███████║███████╗██████╔╝")
            print("  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═════╝ ")
            print(f"{Colors.END}")
            print(f"{Colors.GREEN}🎉 ALL TESTS PASSED! Repository is production-ready.{Colors.END}")
            success = True
        else:
            print(f"{Colors.RED}{Colors.BOLD}")
            print("  ███████╗ █████╗ ██╗██╗     ███████╗██████╗ ")
            print("  ██╔════╝██╔══██╗██║██║     ██╔════╝██╔══██╗")
            print("  █████╗  ███████║██║██║     █████╗  ██║  ██║")
            print("  ██╔══╝  ██╔══██║██║██║     ██╔══╝  ██║  ██║")
            print("  ██║     ██║  ██║██║███████╗███████╗██████╔╝")
            print("  ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝")
            print(f"{Colors.END}")
            print(f"{Colors.RED}❌ Some tests failed. Please review the output above.{Colors.END}")
            success = False

        print(f"{Colors.BOLD}{'─'*80}{Colors.END}\n")

        # Save master report
        self.save_master_report()

        return success

    def save_master_report(self):
        """Save master test report"""
        report_path = self.base_path / "master_test_report.json"

        with open(report_path, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"{Colors.BLUE}Master report saved to: {report_path}{Colors.END}")

    def run_all(self):
        """Run all test suites"""
        self.print_banner()

        # Define test suites in order
        test_suites = [
            ("Agency Data Repository Tests", "test_agency_data.py"),
            ("Comprehensive Integration Tests", "test_comprehensive_integration.py")
        ]

        # Run each suite
        for name, script in test_suites:
            result = self.run_test_suite(name, script)
            self.results['suites'].append(result)

        # Generate final report
        success = self.generate_final_report()

        return success

def main():
    """Main entry point"""
    runner = MasterTestRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
