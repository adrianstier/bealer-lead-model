#!/usr/bin/env python3
"""
Comprehensive Integration Test Suite
Tests all components of the Agency Growth Modeling Platform
"""

import subprocess
import sys
import json
import os
from pathlib import Path
import time

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

class ComprehensiveIntegrationTester:
    def __init__(self):
        self.base_path = Path("/Users/adrianstiermbp2023/derrick-leadmodel")
        self.results = {
            'passed': 0,
            'failed': 0,
            'warnings': 0,
            'skipped': 0,
            'suites': []
        }

    def print_header(self, text: str):
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{text.center(80)}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")

    def print_test(self, name: str, passed: bool, details: str = "", skipped: bool = False):
        if skipped:
            status = f"{Colors.YELLOW}⊘ SKIP{Colors.END}"
            self.results['skipped'] += 1
        elif passed:
            status = f"{Colors.GREEN}✓ PASS{Colors.END}"
            self.results['passed'] += 1
        else:
            status = f"{Colors.RED}✗ FAIL{Colors.END}"
            self.results['failed'] += 1

        print(f"{status} | {name}")
        if details:
            print(f"      {details}")

    def test_python_files_syntax(self) -> bool:
        """Test Python files for syntax errors"""
        self.print_header("TESTING PYTHON FILE SYNTAX")

        python_files = list(self.base_path.glob("*.py"))
        all_passed = True

        for py_file in python_files:
            if py_file.name.startswith('.'):
                continue

            try:
                result = subprocess.run(
                    ['python3', '-m', 'py_compile', str(py_file)],
                    capture_output=True,
                    timeout=10
                )
                passed = result.returncode == 0
                self.print_test(
                    f"Syntax check: {py_file.name}",
                    passed,
                    "Valid Python syntax" if passed else f"Syntax error: {result.stderr.decode()[:100]}"
                )
                all_passed = all_passed and passed
            except Exception as e:
                self.print_test(f"Syntax check: {py_file.name}", False, str(e))
                all_passed = False

        return all_passed

    def test_python_simulator_exists(self) -> bool:
        """Test that Python simulator files exist and are valid"""
        self.print_header("TESTING PYTHON SIMULATOR")

        files_to_check = [
            "agency_simulator_v3.py",
            "streamlit_v3_benchmarks.py"
        ]

        all_passed = True
        for filename in files_to_check:
            file_path = self.base_path / filename
            exists = file_path.exists()

            if exists:
                size = file_path.stat().st_size
                has_content = size > 1000
                self.print_test(
                    f"{filename} exists and has content",
                    has_content,
                    f"{size} bytes"
                )
                all_passed = all_passed and has_content
            else:
                self.print_test(f"{filename} exists", False, "File not found")
                all_passed = False

        return all_passed

    def test_react_project_structure(self) -> bool:
        """Test React project structure and configuration"""
        self.print_header("TESTING REACT PROJECT STRUCTURE")

        react_dir = self.base_path / "agency-growth-platform"
        all_passed = True

        # Check directory exists
        exists = react_dir.exists()
        self.print_test("React directory exists", exists, str(react_dir))
        all_passed = all_passed and exists

        if not exists:
            return False

        # Check critical files
        critical_files = {
            "package.json": "Package configuration",
            "vite.config.ts": "Vite configuration",
            "tsconfig.json": "TypeScript configuration",
            "index.html": "HTML entry point",
            "src/App.tsx": "Main React component",
            "src/AppV3Enhanced.tsx": "Enhanced V3 component"
        }

        for filename, description in critical_files.items():
            file_path = react_dir / filename
            exists = file_path.exists()
            self.print_test(
                f"{filename} - {description}",
                exists,
                f"Size: {file_path.stat().st_size if exists else 0} bytes"
            )
            all_passed = all_passed and exists

        # Check node_modules exists
        node_modules = react_dir / "node_modules"
        has_deps = node_modules.exists()
        self.print_test(
            "Dependencies installed (node_modules)",
            has_deps,
            "Run 'npm install' if missing" if not has_deps else "Dependencies present"
        )

        return all_passed

    def test_package_json_validity(self) -> bool:
        """Test that package.json is valid JSON and has required scripts"""
        self.print_header("TESTING PACKAGE.JSON")

        package_json = self.base_path / "agency-growth-platform" / "package.json"
        all_passed = True

        if not package_json.exists():
            self.print_test("package.json exists", False, "File not found")
            return False

        try:
            with open(package_json, 'r') as f:
                data = json.load(f)

            self.print_test("package.json is valid JSON", True, "Parsed successfully")

            # Check required scripts
            required_scripts = ["dev", "build", "preview"]
            scripts = data.get('scripts', {})

            for script in required_scripts:
                has_script = script in scripts
                self.print_test(
                    f"Script '{script}' defined",
                    has_script,
                    scripts.get(script, "Missing")
                )
                all_passed = all_passed and has_script

            # Check dependencies
            has_deps = 'dependencies' in data
            self.print_test(
                "Has dependencies defined",
                has_deps,
                f"{len(data.get('dependencies', {}))} dependencies" if has_deps else "No dependencies"
            )
            all_passed = all_passed and has_deps

        except json.JSONDecodeError as e:
            self.print_test("package.json is valid JSON", False, str(e))
            all_passed = False

        return all_passed

    def test_data_json_validity(self) -> bool:
        """Test that derrick_agency_data.json is valid"""
        self.print_header("TESTING DATA JSON FILES")

        data_file = self.base_path / "derrick_agency_data.json"
        all_passed = True

        if not data_file.exists():
            self.print_test("derrick_agency_data.json exists", False, "File not found")
            return False

        try:
            with open(data_file, 'r') as f:
                data = json.load(f)

            self.print_test("derrick_agency_data.json is valid JSON", True, "Parsed successfully")

            # Check for expected structure
            expected_keys = ["agency_info", "current_state", "growth_opportunities"]
            for key in expected_keys:
                has_key = key in data
                self.print_test(
                    f"Has '{key}' section",
                    has_key,
                    f"Present" if has_key else "Missing"
                )
                all_passed = all_passed and has_key

        except json.JSONDecodeError as e:
            self.print_test("derrick_agency_data.json is valid JSON", False, str(e))
            all_passed = False

        return all_passed

    def test_markdown_documentation(self) -> bool:
        """Test that documentation files exist and have content"""
        self.print_header("TESTING DOCUMENTATION FILES")

        doc_files = [
            "README.md",
            "QUICK_START_GUIDE.md",
            "COMPREHENSIVE_EVALUATION_REPORT.md",
            "V3_IMPLEMENTATION_SUMMARY.md"
        ]

        all_passed = True
        for filename in doc_files:
            file_path = self.base_path / filename
            exists = file_path.exists()

            if exists:
                size = file_path.stat().st_size
                has_content = size > 500
                self.print_test(
                    f"{filename}",
                    has_content,
                    f"{size} bytes" + (" - needs more content" if not has_content else "")
                )
                all_passed = all_passed and has_content
            else:
                self.print_test(f"{filename}", False, "File not found")
                all_passed = False

        return all_passed

    def test_typescript_components(self) -> bool:
        """Test that TypeScript component files exist"""
        self.print_header("TESTING TYPESCRIPT COMPONENTS")

        components_dir = self.base_path / "agency-growth-platform" / "src" / "components"
        all_passed = True

        if not components_dir.exists():
            self.print_test("Components directory exists", False, str(components_dir))
            return False

        self.print_test("Components directory exists", True, str(components_dir))

        # Check for component files
        component_files = list(components_dir.glob("*.tsx"))
        has_components = len(component_files) > 0

        self.print_test(
            "Has React components",
            has_components,
            f"Found {len(component_files)} component files"
        )

        # List found components
        for comp_file in component_files[:10]:  # Show first 10
            size = comp_file.stat().st_size
            self.print_test(
                f"  → {comp_file.name}",
                size > 100,
                f"{size} bytes"
            )

        return has_components

    def test_git_repository(self) -> bool:
        """Test Git repository status"""
        self.print_header("TESTING GIT REPOSITORY")

        all_passed = True

        # Check if .git exists
        git_dir = self.base_path / ".git"
        is_git_repo = git_dir.exists()
        self.print_test("Is Git repository", is_git_repo, str(git_dir))

        if not is_git_repo:
            return False

        # Check git status
        try:
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=self.base_path,
                capture_output=True,
                timeout=10
            )

            if result.returncode == 0:
                modified_files = result.stdout.decode().strip().split('\n')
                clean = len(modified_files) == 1 and modified_files[0] == ''

                self.print_test(
                    "Git status check",
                    True,
                    f"Clean working directory" if clean else f"{len(modified_files)} files modified/untracked"
                )
            else:
                self.print_test("Git status check", False, "Error running git status")
                all_passed = False

        except Exception as e:
            self.print_test("Git status check", False, str(e))
            all_passed = False

        return all_passed

    def test_playwright_config(self) -> bool:
        """Test Playwright testing configuration"""
        self.print_header("TESTING PLAYWRIGHT CONFIGURATION")

        playwright_config = self.base_path / "agency-growth-platform" / "playwright.config.ts"
        all_passed = True

        exists = playwright_config.exists()
        self.print_test(
            "playwright.config.ts exists",
            exists,
            f"Size: {playwright_config.stat().st_size if exists else 0} bytes"
        )

        if exists:
            # Check for test directory
            tests_dir = self.base_path / "agency-growth-platform" / "tests"
            has_tests = tests_dir.exists()
            self.print_test(
                "Tests directory exists",
                has_tests,
                f"Path: {tests_dir}"
            )

            if has_tests:
                test_files = list(tests_dir.glob("*.spec.ts"))
                has_test_files = len(test_files) > 0
                self.print_test(
                    "Has test spec files",
                    has_test_files,
                    f"Found {len(test_files)} test files"
                )
                all_passed = all_passed and has_test_files
        else:
            all_passed = False

        return all_passed

    def generate_summary_report(self):
        """Generate comprehensive summary report"""
        self.print_header("COMPREHENSIVE TEST SUMMARY")

        total = self.results['passed'] + self.results['failed']
        pass_rate = (self.results['passed'] / total * 100) if total > 0 else 0

        print(f"Total Tests Run: {total}")
        print(f"{Colors.GREEN}Passed: {self.results['passed']}{Colors.END}")
        print(f"{Colors.RED}Failed: {self.results['failed']}{Colors.END}")
        print(f"{Colors.YELLOW}Skipped: {self.results['skipped']}{Colors.END}")
        print(f"{Colors.YELLOW}Warnings: {self.results['warnings']}{Colors.END}")
        print(f"\nPass Rate: {pass_rate:.1f}%")

        if self.results['failed'] == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL INTEGRATION TESTS PASSED!{Colors.END}")
            print(f"{Colors.GREEN}Repository is fully configured and ready for development.{Colors.END}")
            return True
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}❌ Some integration tests failed.{Colors.END}")
            print(f"{Colors.YELLOW}Please review the results above and fix any issues.{Colors.END}")
            return False

    def run_all_tests(self):
        """Run all integration test suites"""
        print(f"\n{Colors.BOLD}{'='*80}")
        print(f"COMPREHENSIVE INTEGRATION TEST SUITE")
        print(f"Agency Growth Modeling Platform - Full Stack Testing")
        print(f"{'='*80}{Colors.END}")

        # Run all test suites
        self.test_python_files_syntax()
        self.test_python_simulator_exists()
        self.test_react_project_structure()
        self.test_package_json_validity()
        self.test_data_json_validity()
        self.test_markdown_documentation()
        self.test_typescript_components()
        self.test_git_repository()
        self.test_playwright_config()

        # Generate summary
        success = self.generate_summary_report()

        # Save report
        self.save_report()

        return success

    def save_report(self):
        """Save detailed test report"""
        report_path = self.base_path / "integration_test_report.json"

        report = {
            'summary': {
                'total': self.results['passed'] + self.results['failed'],
                'passed': self.results['passed'],
                'failed': self.results['failed'],
                'skipped': self.results['skipped'],
                'warnings': self.results['warnings'],
                'pass_rate': (self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100)
                            if (self.results['passed'] + self.results['failed']) > 0 else 0
            }
        }

        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n{Colors.BLUE}Integration test report saved to: {report_path}{Colors.END}")

def main():
    tester = ComprehensiveIntegrationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
