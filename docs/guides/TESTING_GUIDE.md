# Testing Guide

## Quick Start

Run all tests with one command:
```bash
python3 run_all_tests.py
```

Expected output: **112 tests passed, 0 failed** ✅

---

## Individual Test Suites

### 1. Agency Data Repository Tests
Tests all data files, directory structure, and CSV integrity.

```bash
python3 test_agency_data.py
```

**What it tests:**
- ✅ 5 directory structure checks
- ✅ 15 file organization checks
- ✅ 2 documentation checks
- ✅ 21 CSV file integrity checks
- ✅ 3 data consistency checks
- ✅ 7 file size validations

**Total:** 53 tests

---

### 2. Comprehensive Integration Tests
Tests Python files, React frontend, and full-stack integration.

```bash
python3 test_comprehensive_integration.py
```

**What it tests:**
- ✅ 27 Python syntax checks
- ✅ 2 Python simulator checks
- ✅ 8 React project structure checks
- ✅ 5 package.json validation checks
- ✅ 4 data JSON file checks
- ✅ 4 documentation file checks
- ✅ 3 TypeScript component checks
- ✅ 2 Git repository checks
- ✅ 3 Playwright configuration checks

**Total:** 59 tests

---

## Understanding Test Output

### Success Output
```
[1m[92m✓ PASS[0m | Test name
      Details about the test
```

Green checkmark = Test passed ✅

### Failure Output
```
[1m[91m✗ FAIL[0m | Test name
      Error details
```

Red X = Test failed ❌

### Warning Output
```
[1m[93m⚠ WARNING[0m | Warning message
```

Yellow warning triangle = Non-critical issue ⚠️

---

## Test Reports

After running tests, check these JSON files for detailed results:

### 1. Data Repository Report
**File:** `agency_data/test_report.json`

```json
{
  "summary": {
    "total_tests": 53,
    "passed": 53,
    "failed": 0,
    "warnings": 0,
    "pass_rate": 100.0
  },
  "tests": [...]
}
```

### 2. Integration Test Report
**File:** `integration_test_report.json`

```json
{
  "summary": {
    "total": 59,
    "passed": 59,
    "failed": 0,
    "skipped": 0,
    "pass_rate": 100.0
  }
}
```

### 3. Master Test Report
**File:** `master_test_report.json`

```json
{
  "suites": [
    {
      "name": "Agency Data Repository Tests",
      "success": true,
      "duration": 0.8,
      "exit_code": 0
    },
    ...
  ],
  "total_passed": 112,
  "total_failed": 0
}
```

---

## Common Issues and Fixes

### Issue: "ModuleNotFoundError"
**Solution:** Install required Python packages
```bash
pip install pandas numpy
```

### Issue: "Permission denied"
**Solution:** Make test scripts executable
```bash
chmod +x test_agency_data.py
chmod +x test_comprehensive_integration.py
chmod +x run_all_tests.py
```

### Issue: "File not found"
**Solution:** Run tests from repository root directory
```bash
cd /Users/adrianstiermbp2023/derrick-leadmodel
python3 run_all_tests.py
```

---

## What Gets Tested

### Data Integrity
- All CSV files are readable and properly formatted
- Required columns are present in each CSV
- Minimum row counts are met
- No corrupted or empty files

### File Organization
- All directories exist in the correct structure
- Files are in the right directories
- File sizes are reasonable (not empty or corrupted)
- Naming conventions are followed

### Code Quality
- All Python files have valid syntax
- No syntax errors in any .py file
- All imports can be resolved

### React/Frontend
- package.json is valid JSON
- Required npm scripts are defined
- Dependencies are installed
- TypeScript files exist and are sized correctly
- React components are present

### Documentation
- README files exist and have content
- Documentation is substantial (>500 bytes)
- Guide files are present

### Data Consistency
- Metrics reference the same sources across files
- Vendor counts match expected values
- Cross-sell opportunities have required data fields

---

## Expected Results

### ✅ 100% Pass Rate
When everything is working correctly:

```
================================================================================
                              FINAL TEST REPORT
================================================================================

Test Suite Results:

✓ PASS | Agency Data Repository Tests         | 0.8s | Exit: 0
✓ PASS | Comprehensive Integration Tests      | 0.9s | Exit: 0

Overall Summary:
  • Total Tests: 112
  • Passed: 112
  • Failed: 0
  • Overall Pass Rate: 100.0%

  ██████╗  █████╗ ███████╗███████╗███████╗██████╗
  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗
  ██████╔╝███████║███████╗███████╗█████╗  ██║  ██║
  ██╔═══╝ ██╔══██║╚════██║╚════██║██╔══╝  ██║  ██║
  ██║     ██║  ██║███████║███████║███████╗██████╔╝
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═════╝

🎉 ALL TESTS PASSED! Repository is production-ready.
```

---

## Continuous Testing

### Before Making Changes
Run tests to establish baseline:
```bash
python3 run_all_tests.py
```

### After Making Changes
Run tests again to verify nothing broke:
```bash
python3 run_all_tests.py
```

### Before Committing to Git
Always run the full test suite:
```bash
python3 run_all_tests.py && git add . && git commit -m "Your message"
```

---

## Test Coverage Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| **Data Repository** | 53 | 100% |
| Directory Structure | 5 | All 5 directories |
| File Organization | 15 | All 15 expected files |
| CSV Integrity | 21 | All 7 CSV files |
| Data Consistency | 3 | Critical metrics validated |
| File Sizes | 7 | All CSV files |
| Documentation | 2 | README validated |
| **Integration** | 59 | 100% |
| Python Syntax | 27 | All .py files |
| React Structure | 8 | All critical files |
| package.json | 5 | Complete validation |
| Data JSON | 4 | Structure validated |
| Documentation | 4 | All guide files |
| Components | 3 | All components |
| Git | 2 | Repository status |
| Playwright | 3 | Test framework |
| **TOTAL** | **112** | **100%** |

---

## Next Steps After Tests Pass

1. ✅ **Analyze Data**
   - Open CSV files in `agency_data/05_analysis_ready/`
   - Import into Excel, Google Sheets, or Python

2. ✅ **Run Simulators**
   - Execute `python3 agency_simulator_v3.py`
   - Launch `streamlit run streamlit_v3_benchmarks.py`

3. ✅ **Start React Frontend**
   ```bash
   cd agency-growth-platform
   npm run dev
   ```

4. ✅ **Execute Cross-Sell Campaigns**
   - Use SQL queries from `cross_sell_opportunities.csv`
   - Follow `CrossSell_Implementation_Playbook.pdf`

---

## Support

### Test Failures
If tests fail, check:
1. File paths are correct
2. All dependencies installed
3. Running from repository root
4. Python 3 is being used (not Python 2)

### Adding New Tests
To add new tests, edit:
- `test_agency_data.py` for data validation
- `test_comprehensive_integration.py` for integration tests
- `run_all_tests.py` to add new test suites

---

**Last Updated:** November 15, 2025
**Test Version:** 1.0
**Pass Rate:** 100% (112/112 tests)
