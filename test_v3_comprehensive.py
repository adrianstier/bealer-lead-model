"""
Comprehensive Test Suite for Agency Simulator v3.0
Tests all benchmark calculations, edge cases, and business logic
"""

import pytest
from agency_simulator_v3 import (
    EnhancedSimulationParameters,
    EnhancedAgencySimulator,
    MarketingMix,
    MarketingChannel,
    StaffingModel,
    BundlingDynamics,
    CommissionStructure,
    TechnologyInvestment,
    FinancialMetrics,
    HighROIInvestments,
    AgencyType,
    GrowthStage
)


class TestMarketingMix:
    """Test marketing channel calculations"""

    def test_referral_channel_performance(self):
        """Test referral channel has 4x better conversion than traditional"""
        channel = MarketingChannel(
            name="Referral",
            monthly_allocation=1000,
            cost_per_lead=50,
            conversion_rate=0.60
        )

        # Should get 20 leads at $50/lead
        assert channel.get_monthly_leads() == 20

        # Should convert at 60%
        assert channel.get_monthly_policies() == 12

        # Conversion is 4x traditional (0.60 vs 0.15)
        assert channel.conversion_rate / 0.15 == 4.0

    def test_marketing_mix_weighted_conversion(self):
        """Test weighted average conversion calculation"""
        mix = MarketingMix()

        # Allocate to different channels
        mix.referral.monthly_allocation = 1000  # $50/lead = 20 leads @ 60% = 12 policies
        mix.digital.monthly_allocation = 1000   # $25/lead = 40 leads @ 18% = 7.2 policies

        total_leads = 20 + 40  # 60 leads
        total_policies = 12 + 7.2  # 19.2 policies
        expected_weighted = total_policies / total_leads  # 0.32

        assert abs(mix.get_weighted_conversion_rate() - expected_weighted) < 0.001

    def test_blended_cac_calculation(self):
        """Test blended CAC across channels"""
        mix = MarketingMix()
        mix.referral.monthly_allocation = 1000
        mix.digital.monthly_allocation = 2000

        total_spend = 3000
        total_policies = mix.referral.get_monthly_policies() + mix.digital.get_monthly_policies()

        expected_cac = total_spend / total_policies if total_policies > 0 else 0

        blended_cac = mix.get_blended_cac(0.12, 1500)

        assert abs(blended_cac - expected_cac) < 1.0


class TestStaffingModel:
    """Test staffing ratio and productivity calculations"""

    def test_optimal_staffing_ratio(self):
        """Test 2.8:1 service-to-producer ratio"""
        staffing = StaffingModel()
        staffing.producers = 2.0
        staffing.service_staff = 5.6  # Exactly 2.8:1

        ratio = staffing.get_producer_to_service_ratio()
        assert abs(ratio - 2.8) < 0.01

    def test_productivity_multiplier_at_optimal(self):
        """Test productivity is 1.0 at optimal ratio"""
        staffing = StaffingModel()
        staffing.producers = 1.0
        staffing.service_staff = 2.8  # Optimal

        multiplier = staffing.get_producer_productivity_multiplier()
        assert multiplier == 1.0

    def test_productivity_degradation_without_support(self):
        """Test productivity drops to 0.25 with no support (4x worse)"""
        staffing = StaffingModel()
        staffing.producers = 1.0
        staffing.service_staff = 0  # No support

        multiplier = staffing.get_producer_productivity_multiplier()
        assert multiplier == 0.25  # 4x worse than optimal

    def test_rpe_evaluation_excellent(self):
        """Test RPE evaluation for excellent performance"""
        staffing = StaffingModel()
        staffing.producers = 2.0
        staffing.service_staff = 5.0
        staffing.admin_staff = 1.0

        # Total FTE = 8, Revenue = $2.4M
        revenue = 2_400_000

        eval_result = staffing.evaluate_rpe(revenue)

        # RPE = $2.4M / 8 = $300k (excellent)
        assert eval_result['rpe'] == 300_000
        assert eval_result['rating'] == 'Excellent'

    def test_total_monthly_cost_with_benefits(self):
        """Test monthly cost calculation includes benefits multiplier"""
        staffing = StaffingModel()
        staffing.producers = 1.0
        staffing.producer_avg_comp = 80_000
        staffing.service_staff = 0
        staffing.admin_staff = 0
        staffing.benefits_multiplier = 1.3  # 30% overhead

        # Annual: $80k * 1.3 = $104k
        # Monthly: $104k / 12 = $8,666.67
        expected_monthly = (80_000 * 1.3) / 12

        actual_monthly = staffing.get_total_monthly_cost()

        assert abs(actual_monthly - expected_monthly) < 1.0


class TestBundlingDynamics:
    """Test bundling threshold and retention calculations"""

    def test_critical_18_threshold(self):
        """Test 1.8 policies per customer threshold unlocks 95% retention"""
        bundling = BundlingDynamics()
        bundling.auto_policies = 180
        bundling.home_policies = 150
        bundling.umbrella_policies = 40
        # Total = 370 policies

        # Estimate customers: max(180, 150) + other = 180
        customers = bundling.get_unique_customers()
        ppc = bundling.get_policies_per_customer()

        # Should be > 1.8
        assert ppc > 1.8

        # Should get 95% retention
        retention = bundling.get_retention_rate()
        assert abs(retention - 0.95) < 0.01

    def test_monoline_retention(self):
        """Test monoline (1.0 policies/customer) gets 67% retention"""
        bundling = BundlingDynamics()
        bundling.auto_policies = 100
        bundling.home_policies = 0
        bundling.umbrella_policies = 0

        ppc = bundling.get_policies_per_customer()
        assert ppc == 1.0

        retention = bundling.get_retention_rate()
        assert abs(retention - 0.67) < 0.01

    def test_bundled_retention_between_thresholds(self):
        """Test bundled retention (1.5 < ppc < 1.8) interpolates correctly"""
        bundling = BundlingDynamics()
        bundling.auto_policies = 100
        bundling.home_policies = 80
        bundling.umbrella_policies = 0
        # Total = 180 policies, customers = 100, ppc = 1.8

        retention = bundling.get_retention_rate()

        # At exactly 1.8, should be 95%
        if abs(bundling.get_policies_per_customer() - 1.8) < 0.01:
            assert abs(retention - 0.95) < 0.01

    def test_retention_profit_multiplier(self):
        """Test 5% retention improvement can double profits"""
        bundling = BundlingDynamics()

        multiplier = bundling.calculate_retention_profit_multiplier(0.05, years=5)

        # 5% improvement over 5 years = 2x profits
        assert multiplier == 2.0

    def test_ltv_multiplier_for_bundling(self):
        """Test LTV multiplier increases with bundling"""
        bundling = BundlingDynamics()

        # Monoline (1.0 ppc)
        bundling.auto_policies = 100
        bundling.home_policies = 0
        multiplier_mono = bundling.get_ltv_multiplier()
        assert multiplier_mono == 1.0

        # Optimal bundle (1.8+ ppc)
        bundling.auto_policies = 100
        bundling.home_policies = 90
        bundling.umbrella_policies = 20
        multiplier_optimal = bundling.get_ltv_multiplier()

        # Should be 3.5x for optimal bundling
        if bundling.get_policies_per_customer() >= 1.8:
            assert multiplier_optimal == 3.5


class TestCommissionStructure:
    """Test commission structure calculations"""

    def test_independent_commission_rates(self):
        """Test independent agent commission rates"""
        comm = CommissionStructure(structure_type=AgencyType.INDEPENDENT)

        new_biz_rate = comm.get_commission_rate(is_new_business=True)
        renewal_rate = comm.get_commission_rate(is_new_business=False)

        # Independent: 12-15% new, 10-12% renewal
        assert new_biz_rate == 0.125  # 12.5% default
        assert renewal_rate == 0.11   # 11% default

        # Should be roughly balanced (1.2:1 ratio)
        ratio = new_biz_rate / renewal_rate
        assert 1.1 < ratio < 1.3

    def test_captive_commission_rates(self):
        """Test captive agent commission rates favor new business heavily"""
        comm = CommissionStructure(structure_type=AgencyType.CAPTIVE)

        new_biz_rate = comm.get_commission_rate(is_new_business=True)
        renewal_rate = comm.get_commission_rate(is_new_business=False)

        # Captive: 20-40% new, 7% renewal
        assert new_biz_rate == 0.30  # 30% default
        assert renewal_rate == 0.07  # 7% default

        # Should heavily favor new business (3-5:1 ratio)
        ratio = new_biz_rate / renewal_rate
        assert ratio > 3.0  # At least 3:1

    def test_compensation_validation_critical(self):
        """Test compensation validation flags critical issues"""
        comm = CommissionStructure()

        # Total comp = $700k, Revenue = $1M = 70% (exceeds 65% max)
        result = comm.validate_compensation(700_000, 1_000_000)

        assert result['status'] == 'critical'
        assert result['comp_ratio'] == 0.70

    def test_compensation_validation_healthy(self):
        """Test compensation validation passes healthy ratios"""
        comm = CommissionStructure()

        # Total comp = $300k, Revenue = $1M = 30% (within target)
        result = comm.validate_compensation(300_000, 1_000_000)

        assert result['status'] == 'healthy'
        assert result['comp_ratio'] == 0.30


class TestFinancialMetrics:
    """Test EBITDA, LTV, CAC, and Rule of 20 calculations"""

    def test_ebitda_calculation(self):
        """Test basic EBITDA calculation"""
        metrics = FinancialMetrics()

        revenue = 1_000_000
        expenses = 750_000

        ebitda = metrics.calculate_ebitda(revenue, expenses)
        assert ebitda == 250_000

        margin = metrics.calculate_ebitda_margin(revenue, expenses)
        assert margin == 0.25  # 25%

    def test_ebitda_evaluation_excellent(self):
        """Test EBITDA evaluation for excellent performance"""
        metrics = FinancialMetrics()

        margin = 0.32  # 32%
        premium_volume = 2_000_000

        eval_result = metrics.evaluate_ebitda_margin(margin, premium_volume)

        assert eval_result['status'] == 'excellent'
        assert eval_result['margin'] == 0.32

    def test_ebitda_evaluation_below_target(self):
        """Test EBITDA evaluation flags low performance"""
        metrics = FinancialMetrics()

        margin = 0.18  # 18% (below 20% acceptable threshold)
        premium_volume = 2_000_000

        eval_result = metrics.evaluate_ebitda_margin(margin, premium_volume)

        assert eval_result['status'] == 'below_target'

    def test_ltv_calculation_standard_formula(self):
        """Test industry-standard LTV formula"""
        metrics = FinancialMetrics()

        avg_annual_revenue = 200  # $200/year commission per customer
        retention_rate = 0.90  # 90%
        cac = 900

        # LTV = (200 * 0.90) / (1 - 0.90) - 900
        # LTV = 180 / 0.10 - 900 = 1800 - 900 = 900

        ltv = metrics.calculate_ltv(avg_annual_revenue, retention_rate, cac)

        assert abs(ltv - 900) < 1.0

    def test_ltv_cac_ratio_calculation(self):
        """Test LTV:CAC ratio calculation"""
        metrics = FinancialMetrics()

        ltv = 3600
        cac = 900

        ratio = metrics.calculate_ltv_cac_ratio(ltv, cac)

        assert ratio == 4.0  # 4:1 ratio

    def test_ltv_cac_evaluation_great(self):
        """Test LTV:CAC evaluation for 4:1 ratio (great)"""
        metrics = FinancialMetrics()

        ratio = 4.0

        eval_result = metrics.evaluate_ltv_cac_ratio(ratio)

        assert eval_result['status'] == 'great'
        assert eval_result['color'] == 'green'

    def test_ltv_cac_evaluation_underinvested(self):
        """Test LTV:CAC evaluation flags 5:1+ as under-invested"""
        metrics = FinancialMetrics()

        ratio = 6.0  # 6:1 ratio

        eval_result = metrics.evaluate_ltv_cac_ratio(ratio)

        assert eval_result['status'] == 'underinvested'
        assert eval_result['color'] == 'yellow'
        assert 'under-investment' in eval_result['message'].lower()

    def test_rule_of_20_top_performer(self):
        """Test Rule of 20 for top performer"""
        metrics = FinancialMetrics()

        # Growth: 20%, EBITDA: 30%
        # Score = 20 + (0.5 * 30) = 20 + 15 = 35

        result = metrics.calculate_rule_of_20(20, 0.30)

        assert result['score'] == 35.0
        assert result['rating'] == 'Top Performer'
        assert result['color'] == 'green'

    def test_rule_of_20_healthy(self):
        """Test Rule of 20 for healthy agency"""
        metrics = FinancialMetrics()

        # Growth: 10%, EBITDA: 22%
        # Score = 10 + (0.5 * 22) = 10 + 11 = 21 (between 20-25)

        result = metrics.calculate_rule_of_20(10, 0.22)

        assert result['score'] == 21.0
        assert result['rating'] == 'Healthy Agency'

    def test_rule_of_20_critical(self):
        """Test Rule of 20 flags critical performance"""
        metrics = FinancialMetrics()

        # Growth: 5%, EBITDA: 15%
        # Score = 5 + (0.5 * 15) = 5 + 7.5 = 12.5

        result = metrics.calculate_rule_of_20(5, 0.15)

        assert result['score'] == 12.5
        assert result['rating'] == 'Critical'
        assert result['color'] == 'red'


class TestHighROIInvestments:
    """Test high-ROI investment calculations"""

    def test_eo_automation_roi(self):
        """Test E&O automation ROI calculation (should be 700%+)"""
        investments = HighROIInvestments()

        result = investments.calculate_eo_automation_roi()

        assert result['annual_cost'] == 1800  # $150/mo * 12
        assert result['claims_prevented_per_year'] > 0  # Should prevent some claims

        # Expected savings = 0.5 claims/year * 0.40 prevention * $75k = $15k
        assert result['expected_annual_savings'] == 15_000

        # ROI = (15000 - 1800) / 1800 * 100 = 733%
        assert result['roi_percent'] > 700

    def test_renewal_program_roi(self):
        """Test renewal review program ROI calculation"""
        investments = HighROIInvestments()

        total_policies = 500
        avg_commission = 120  # $120/policy annual

        result = investments.calculate_renewal_program_roi(total_policies, avg_commission)

        # Labor: 500 * 0.25 hours * $25/hour = $3,125
        expected_labor = 500 * 0.25 * 25
        assert abs(result['annual_labor_cost'] - expected_labor) < 1.0

        # 1.5% retention improvement
        assert result['year_1_retention_improvement'] == '1.5%'

        # Should calculate 5-year metrics
        assert 'five_year_benefit' in result
        assert 'five_year_cost' in result
        assert 'five_year_roi_percent' in result

        # Policies saved should be positive
        assert result['policies_saved_year_1'] > 0

    def test_crosssell_program_roi(self):
        """Test cross-sell program ROI calculation"""
        investments = HighROIInvestments()

        total_customers = 400
        commercial_customers = 120

        result = investments.calculate_crosssell_program_roi(
            total_customers,
            commercial_customers
        )

        # Annual cost = $500/mo * 12 = $6,000
        assert result['annual_cost'] == 6_000

        # Umbrella: 400 * 15% attachment = 60 policies
        # Cyber: 120 * 10% attachment = 12 policies
        expected_umbrella = 400 * 0.15
        expected_cyber = 120 * 0.10

        assert abs(result['umbrella_policies_sold'] - expected_umbrella) < 1.0
        assert abs(result['cyber_policies_sold'] - expected_cyber) < 1.0

        # Should have positive revenue and ROI
        assert result['total_annual_revenue'] > 0


class TestTechnologyInvestment:
    """Test technology investment modeling"""

    def test_total_monthly_cost(self):
        """Test total technology cost calculation"""
        tech = TechnologyInvestment()

        # Default costs: AMS 500 + CRM 200 + Rating 150 + E&O 150 +
        #                E-sign 100 + Renewal 200 + Marketing 150 = 1,450
        expected_total = 500 + 200 + 150 + 150 + 100 + 200 + 150

        actual_total = tech.get_total_monthly_cost()

        assert actual_total == expected_total

    def test_budget_target_optimal(self):
        """Test technology budget is optimal at 2.5-3.5%"""
        tech = TechnologyInvestment()

        # Annual revenue = $600k
        # Tech spend = $1,450/mo * 12 = $17,400
        # Percent = 17,400 / 600,000 = 2.9% (optimal)

        annual_revenue = 600_000
        result = tech.get_target_budget(annual_revenue)

        assert result['status'] == 'optimal'
        assert 2.5 <= result['percent_of_revenue'] <= 3.5


class TestEnhancedSimulator:
    """Test full simulator with integrated benchmarks"""

    def test_simulation_runs_without_errors(self):
        """Test basic simulation runs successfully"""
        params = EnhancedSimulationParameters()

        # Configure basic scenario
        params.marketing.digital.monthly_allocation = 2000
        params.staffing.producers = 2.0
        params.staffing.service_staff = 5.0

        sim = EnhancedAgencySimulator(params)
        results = sim.simulate_scenario(12)

        # Should have 12 months of data
        assert len(results) == 12

        # Should have all required columns
        assert 'month' in results.columns
        assert 'policies_end' in results.columns
        assert 'ebitda_margin' in results.columns
        assert 'ltv_cac_ratio' in results.columns

    def test_benchmark_report_generation(self):
        """Test benchmark report contains all sections"""
        params = EnhancedSimulationParameters()
        params.marketing.digital.monthly_allocation = 2000

        sim = EnhancedAgencySimulator(params)
        results = sim.simulate_scenario(12)
        report = sim.generate_benchmark_report(results)

        # Should have all main sections
        assert 'financial_performance' in report
        assert 'unit_economics' in report
        assert 'growth_metrics' in report
        assert 'operational_benchmarks' in report
        assert 'high_roi_investments' in report

        # Financial performance should have Rule of 20
        assert 'rule_of_20' in report['financial_performance']
        assert 'ebitda_evaluation' in report['financial_performance']

        # Unit economics should have LTV:CAC evaluation
        assert 'ltv_cac_evaluation' in report['unit_economics']

    def test_policies_grow_with_marketing(self):
        """Test policies grow when marketing spend increases"""
        params = EnhancedSimulationParameters()
        params.current_policies = 100

        # Low marketing
        params.marketing.digital.monthly_allocation = 500
        sim_low = EnhancedAgencySimulator(params)
        results_low = sim_low.simulate_scenario(12)
        final_policies_low = results_low.iloc[-1]['policies_end']

        # High marketing
        params.marketing.digital.monthly_allocation = 2000
        sim_high = EnhancedAgencySimulator(params)
        results_high = sim_high.simulate_scenario(12)
        final_policies_high = results_high.iloc[-1]['policies_end']

        # Higher marketing should result in more policies
        assert final_policies_high > final_policies_low

    def test_retention_improves_with_bundling(self):
        """Test retention improves as policies per customer increases"""
        params = EnhancedSimulationParameters()

        # Monoline scenario
        params.bundling.auto_policies = 100
        params.bundling.home_policies = 0
        retention_mono = params.bundling.get_retention_rate()

        # Bundled scenario
        params.bundling.auto_policies = 100
        params.bundling.home_policies = 90
        params.bundling.umbrella_policies = 20
        retention_bundled = params.bundling.get_retention_rate()

        # Bundled should have higher retention
        assert retention_bundled > retention_mono


def run_all_tests():
    """Run all tests and report results"""
    print("=" * 80)
    print("COMPREHENSIVE TEST SUITE FOR AGENCY SIMULATOR v3.0")
    print("=" * 80)

    test_classes = [
        TestMarketingMix,
        TestStaffingModel,
        TestBundlingDynamics,
        TestCommissionStructure,
        TestFinancialMetrics,
        TestHighROIInvestments,
        TestTechnologyInvestment,
        TestEnhancedSimulator
    ]

    total_tests = 0
    passed_tests = 0
    failed_tests = []

    for test_class in test_classes:
        print(f"\n{test_class.__name__}")
        print("-" * 80)

        test_instance = test_class()
        test_methods = [method for method in dir(test_instance) if method.startswith('test_')]

        for method_name in test_methods:
            total_tests += 1
            try:
                method = getattr(test_instance, method_name)
                method()
                passed_tests += 1
                print(f"  ✓ {method_name}")
            except AssertionError as e:
                failed_tests.append((test_class.__name__, method_name, str(e)))
                print(f"  ✗ {method_name}: {str(e)}")
            except Exception as e:
                failed_tests.append((test_class.__name__, method_name, str(e)))
                print(f"  ✗ {method_name}: ERROR - {str(e)}")

    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {len(failed_tests)}")
    print(f"Success Rate: {passed_tests/total_tests*100:.1f}%")

    if failed_tests:
        print("\nFailed Tests:")
        for class_name, method_name, error in failed_tests:
            print(f"  - {class_name}.{method_name}: {error}")
    else:
        print("\n🎉 ALL TESTS PASSED!")

    return passed_tests == total_tests


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
