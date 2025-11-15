#!/usr/bin/env python3
"""
Comprehensive Test Suite for Agency Data Repository
Tests data integrity, structure, and analysis-ready files
"""

import os
import csv
import json
from pathlib import Path
from typing import Dict, List, Tuple
import sys

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

class AgencyDataTester:
    def __init__(self, base_path: str = "/Users/adrianstiermbp2023/derrick-leadmodel/agency_data"):
        self.base_path = Path(base_path)
        self.results = {
            'passed': 0,
            'failed': 0,
            'warnings': 0,
            'tests': []
        }

    def print_header(self, text: str):
        """Print formatted header"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{text.center(80)}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

    def print_test(self, name: str, passed: bool, details: str = ""):
        """Print test result"""
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"{status} | {name}")
        if details:
            print(f"      {details}")

        self.results['tests'].append({
            'name': name,
            'passed': passed,
            'details': details
        })

        if passed:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1

    def print_warning(self, message: str):
        """Print warning message"""
        print(f"{Colors.YELLOW}⚠ WARNING{Colors.END} | {message}")
        self.results['warnings'] += 1

    def test_directory_structure(self) -> bool:
        """Test that all required directories exist"""
        self.print_header("TESTING DIRECTORY STRUCTURE")

        required_dirs = [
            "01_current_performance",
            "02_strategic_research",
            "03_implementation_frameworks",
            "04_raw_reports",
            "05_analysis_ready"
        ]

        all_passed = True
        for dir_name in required_dirs:
            dir_path = self.base_path / dir_name
            exists = dir_path.exists() and dir_path.is_dir()
            self.print_test(
                f"Directory exists: {dir_name}",
                exists,
                f"Path: {dir_path}" if exists else f"Missing: {dir_path}"
            )
            all_passed = all_passed and exists

        return all_passed

    def test_csv_file(self, file_path: Path) -> Dict:
        """Test a CSV file for integrity and return statistics"""
        results = {
            'exists': False,
            'readable': False,
            'rows': 0,
            'columns': 0,
            'headers': [],
            'empty_cells': 0,
            'errors': []
        }

        if not file_path.exists():
            results['errors'].append("File does not exist")
            return results

        results['exists'] = True

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                rows = list(reader)

                if len(rows) == 0:
                    results['errors'].append("File is empty")
                    return results

                results['readable'] = True
                results['headers'] = rows[0]
                results['columns'] = len(rows[0])
                results['rows'] = len(rows) - 1  # Exclude header

                # Count empty cells
                for row in rows[1:]:
                    for cell in row:
                        if not cell or cell.strip() == "":
                            results['empty_cells'] += 1

        except Exception as e:
            results['errors'].append(f"Error reading file: {str(e)}")

        return results

    def test_analysis_ready_files(self) -> bool:
        """Test all analysis-ready CSV files"""
        self.print_header("TESTING ANALYSIS-READY CSV FILES")

        csv_files = {
            "key_metrics_summary.csv": {
                "min_rows": 20,
                "required_columns": ["Category", "Metric", "Value", "Source", "Date"]
            },
            "lead_generation_vendors.csv": {
                "min_rows": 10,
                "required_columns": ["Vendor", "Lead Type", "Price Per Lead"]
            },
            "cross_sell_opportunities.csv": {
                "min_rows": 10,
                "required_columns": ["Customer Segment", "Current Coverage", "Cross-Sell Product", "Conversion Rate"]
            },
            "bonus_structure_reference.csv": {
                "min_rows": 10,
                "required_columns": ["Bonus Type", "Tier Level", "Goal Threshold", "Bonus Percentage"]
            },
            "operational_benchmarks.csv": {
                "min_rows": 15,
                "required_columns": ["Category", "Metric", "Best Practice", "Average", "Below Average"]
            },
            "product_economics.csv": {
                "min_rows": 12,
                "required_columns": ["Product Line", "Average Annual Premium", "First Year Commission %"]
            },
            "santa_barbara_market_analysis.csv": {
                "min_rows": 15,
                "required_columns": ["Category", "Metric", "Value", "Context"]
            }
        }

        all_passed = True
        analysis_dir = self.base_path / "05_analysis_ready"

        for filename, requirements in csv_files.items():
            file_path = analysis_dir / filename
            results = self.test_csv_file(file_path)

            # Test: File exists and is readable
            passed = results['exists'] and results['readable']
            self.print_test(
                f"{filename} - File integrity",
                passed,
                f"Rows: {results['rows']}, Columns: {results['columns']}" if passed else f"Errors: {', '.join(results['errors'])}"
            )
            all_passed = all_passed and passed

            if passed:
                # Test: Minimum row count
                has_min_rows = results['rows'] >= requirements['min_rows']
                self.print_test(
                    f"{filename} - Row count (min {requirements['min_rows']})",
                    has_min_rows,
                    f"Found {results['rows']} rows"
                )
                all_passed = all_passed and has_min_rows

                # Test: Required columns present
                missing_cols = [col for col in requirements['required_columns']
                               if col not in results['headers']]
                has_required_cols = len(missing_cols) == 0
                self.print_test(
                    f"{filename} - Required columns",
                    has_required_cols,
                    f"All present" if has_required_cols else f"Missing: {', '.join(missing_cols)}"
                )
                all_passed = all_passed and has_required_cols

                # Warning for empty cells
                if results['empty_cells'] > 0:
                    self.print_warning(
                        f"{filename} has {results['empty_cells']} empty cells"
                    )

        return all_passed

    def test_file_organization(self) -> bool:
        """Test that files are properly organized in correct directories"""
        self.print_header("TESTING FILE ORGANIZATION")

        expected_files = {
            "01_current_performance": [
                "2025-09_Bonus_Dashboard.pdf",
                "Bonus_Structure_Reference.pdf",
                "Agency_Business_Plan.docx"
            ],
            "02_strategic_research": [
                "CAC_LTV_Retention_Benchmarks_2024.pdf",
                "Operational_Efficiency_Benchmarks.pdf",
                "Product_Mix_Revenue_Optimization_2025.pdf",
                "Allstate_Compensation_Structure_Analysis.pdf",
                "Lead_Generation_Strategy_Santa_Barbara.md"
            ],
            "03_implementation_frameworks": [
                "Claims_Based_CrossSell_PRD.md",
                "CrossSell_Implementation_Playbook.pdf"
            ],
            "04_raw_reports": [
                "2025-10_Claims_Detail_Report.xlsx",
                "All_Purpose_Audit.xlsx",
                "Renewal_Audit_Report.xlsx",
                "2025-11-14_Business_Metrics.xlsx",
                "2025-10_Policy_Growth_Retention_Report.xlsx"
            ]
        }

        all_passed = True
        for dir_name, files in expected_files.items():
            dir_path = self.base_path / dir_name
            for filename in files:
                file_path = dir_path / filename
                exists = file_path.exists()
                self.print_test(
                    f"{dir_name}/{filename}",
                    exists,
                    f"Size: {file_path.stat().st_size if exists else 0} bytes"
                )
                all_passed = all_passed and exists

        return all_passed

    def test_readme_exists(self) -> bool:
        """Test that README.md exists and has content"""
        self.print_header("TESTING DOCUMENTATION")

        readme_path = self.base_path / "README.md"
        exists = readme_path.exists()

        size = 0
        lines = 0
        if exists:
            size = readme_path.stat().st_size
            with open(readme_path, 'r') as f:
                lines = len(f.readlines())

        self.print_test(
            "README.md exists",
            exists,
            f"Size: {size} bytes, Lines: {lines}"
        )

        has_content = size > 1000  # Should be substantial
        self.print_test(
            "README.md has substantial content",
            has_content,
            f"Size: {size} bytes (expected >1000)"
        )

        return exists and has_content

    def test_data_consistency(self) -> bool:
        """Test consistency across different data files"""
        self.print_header("TESTING DATA CONSISTENCY")

        all_passed = True

        # Test 1: Check that key metrics in key_metrics_summary match expected ranges
        metrics_file = self.base_path / "05_analysis_ready" / "key_metrics_summary.csv"

        if metrics_file.exists():
            with open(metrics_file, 'r') as f:
                reader = csv.DictReader(f)
                metrics = list(reader)

            # Check for specific critical metrics
            critical_metrics = [
                "Written Premium",
                "Portfolio Growth Rate",
                "Target EBITDA Margin",
                "Bundled Customer Retention"
            ]

            found_metrics = [row['Metric'] for row in metrics]
            missing = [m for m in critical_metrics if m not in found_metrics]

            has_critical = len(missing) == 0
            self.print_test(
                "Key metrics contains all critical metrics",
                has_critical,
                f"All present" if has_critical else f"Missing: {', '.join(missing)}"
            )
            all_passed = all_passed and has_critical

        # Test 2: Verify lead vendors count
        vendors_file = self.base_path / "05_analysis_ready" / "lead_generation_vendors.csv"
        if vendors_file.exists():
            with open(vendors_file, 'r') as f:
                reader = csv.DictReader(f)
                vendors = list(reader)

            vendor_count = len(vendors)
            expected_min = 10
            has_vendors = vendor_count >= expected_min

            self.print_test(
                f"Lead generation vendors (min {expected_min})",
                has_vendors,
                f"Found {vendor_count} vendors"
            )
            all_passed = all_passed and has_vendors

        # Test 3: Verify cross-sell opportunities have conversion rates
        crosssell_file = self.base_path / "05_analysis_ready" / "cross_sell_opportunities.csv"
        if crosssell_file.exists():
            with open(crosssell_file, 'r') as f:
                reader = csv.DictReader(f)
                opportunities = list(reader)

            opportunities_with_rates = sum(
                1 for opp in opportunities
                if opp.get('Conversion Rate', '').strip() != ''
            )

            has_rates = opportunities_with_rates == len(opportunities)
            self.print_test(
                "Cross-sell opportunities have conversion rates",
                has_rates,
                f"{opportunities_with_rates}/{len(opportunities)} have rates"
            )
            all_passed = all_passed and has_rates

        return all_passed

    def test_file_sizes(self) -> bool:
        """Test that files have reasonable sizes (not empty or corrupted)"""
        self.print_header("TESTING FILE SIZES")

        all_passed = True

        # Check all files in analysis_ready directory
        analysis_dir = self.base_path / "05_analysis_ready"
        if analysis_dir.exists():
            for file_path in analysis_dir.glob("*.csv"):
                size = file_path.stat().st_size
                is_reasonable = 100 < size < 1000000  # Between 100 bytes and 1MB

                self.print_test(
                    f"{file_path.name} - File size",
                    is_reasonable,
                    f"{size} bytes" + (" - suspiciously small" if size <= 100 else " - suspiciously large" if size >= 1000000 else "")
                )
                all_passed = all_passed and is_reasonable

        return all_passed

    def generate_summary_report(self):
        """Generate and print summary report"""
        self.print_header("TEST SUMMARY REPORT")

        total_tests = self.results['passed'] + self.results['failed']
        pass_rate = (self.results['passed'] / total_tests * 100) if total_tests > 0 else 0

        print(f"Total Tests: {total_tests}")
        print(f"{Colors.GREEN}Passed: {self.results['passed']}{Colors.END}")
        print(f"{Colors.RED}Failed: {self.results['failed']}{Colors.END}")
        print(f"{Colors.YELLOW}Warnings: {self.results['warnings']}{Colors.END}")
        print(f"\nPass Rate: {pass_rate:.1f}%")

        if self.results['failed'] == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Repository is ready for analysis.{Colors.END}")
            return True
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}❌ Some tests failed. Please review the results above.{Colors.END}")
            return False

    def run_all_tests(self):
        """Run all test suites"""
        print(f"\n{Colors.BOLD}{'='*80}")
        print(f"COMPREHENSIVE AGENCY DATA REPOSITORY TEST SUITE")
        print(f"{'='*80}{Colors.END}")

        # Run all test suites
        self.test_directory_structure()
        self.test_file_organization()
        self.test_readme_exists()
        self.test_analysis_ready_files()
        self.test_data_consistency()
        self.test_file_sizes()

        # Generate summary
        all_passed = self.generate_summary_report()

        # Save detailed report
        self.save_detailed_report()

        return all_passed

    def save_detailed_report(self):
        """Save detailed test report to JSON file"""
        report_path = self.base_path / "test_report.json"

        report = {
            'summary': {
                'total_tests': self.results['passed'] + self.results['failed'],
                'passed': self.results['passed'],
                'failed': self.results['failed'],
                'warnings': self.results['warnings'],
                'pass_rate': (self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100)
                            if (self.results['passed'] + self.results['failed']) > 0 else 0
            },
            'tests': self.results['tests']
        }

        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n{Colors.BLUE}Detailed report saved to: {report_path}{Colors.END}")

def main():
    """Main test execution"""
    tester = AgencyDataTester()
    success = tester.run_all_tests()

    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
