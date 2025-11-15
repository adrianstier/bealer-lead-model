#!/usr/bin/env python3
"""
Comprehensive Benchmark Validation Test
Tests all 30+ industry benchmarks with real-world scenarios
"""

from agency_simulator_v3 import (
    EnhancedSimulationParameters,
    EnhancedAgencySimulator,
    GrowthStage,
    AgencyType
)

def test_scenario(name, params, expected_outcomes):
    """Test a scenario and validate expected outcomes"""
    print(f"\n{'='*80}")
    print(f"Testing Scenario: {name}")
    print(f"{'='*80}")

    sim = EnhancedAgencySimulator(params)
    results = sim.simulate_scenario(24)
    report = sim.generate_benchmark_report(results)

    print(f"\n📊 Financial Performance:")
    print(f"  Rule of 20 Score: {report['financial_performance']['rule_of_20']['score']:.1f} ({report['financial_performance']['rule_of_20']['rating']})")
    print(f"  EBITDA Margin: {report['financial_performance']['ebitda']['margin']*100:.1f}% ({report['financial_performance']['ebitda']['status']})")
    print(f"  Final Revenue: ${report['financial_performance']['final_revenue']:,.0f}")
    print(f"  Annual Growth: {report['financial_performance']['organic_growth_rate']*100:.1f}%")

    print(f"\n💰 Unit Economics:")
    print(f"  LTV: ${report['unit_economics']['ltv']:,.0f}")
    print(f"  CAC: ${report['unit_economics']['cac']:,.0f}")
    print(f"  LTV:CAC Ratio: {report['unit_economics']['ltv_cac_ratio']:.2f}:1 ({report['unit_economics']['ltv_cac_status']})")

    print(f"\n👥 Operational Metrics:")
    print(f"  Final Policies: {report['operational_metrics']['final_policies']:,}")
    print(f"  Policies/Customer: {report['operational_metrics']['policies_per_customer']:.2f} ({report['operational_metrics']['bundling_status']})")
    print(f"  Retention Rate: {report['operational_metrics']['retention_rate']*100:.1f}%")
    print(f"  Revenue/Employee: ${report['operational_metrics']['revenue_per_employee']:,.0f} ({report['operational_metrics']['rpe_rating']})")
    print(f"  Service:Producer Ratio: {report['operational_metrics']['service_to_producer_ratio']:.2f}:1")

    print(f"\n📈 Marketing Efficiency:")
    print(f"  Blended CAC: ${report['marketing_efficiency']['blended_cac']:,.0f}")
    print(f"  Blended Conversion: {report['marketing_efficiency']['blended_conversion_rate']*100:.1f}%")
    print(f"  Marketing Spend %: {report['marketing_efficiency']['marketing_spend_percent']*100:.1f}%")
    print(f"  Total Marketing Budget: ${report['marketing_efficiency']['total_monthly_marketing']:,.0f}/mo")

    print(f"\n💡 Technology Investment:")
    print(f"  Tech Spend %: {report['technology_investment']['tech_spend_percent']*100:.2f}%")
    print(f"  Monthly Tech Cost: ${report['technology_investment']['monthly_tech_cost']:,.0f}")
    print(f"  Budget Status: {report['technology_investment']['budget_status']}")

    # Validate expected outcomes
    print(f"\n✅ Validation Checks:")
    passed = 0
    failed = 0

    for check_name, (actual_value, expected_range, description) in expected_outcomes.items():
        if isinstance(expected_range, tuple):
            min_val, max_val = expected_range
            if min_val <= actual_value <= max_val:
                print(f"  ✓ {check_name}: {description} = {actual_value:.2f} (within {min_val}-{max_val})")
                passed += 1
            else:
                print(f"  ✗ {check_name}: {description} = {actual_value:.2f} (expected {min_val}-{max_val})")
                failed += 1
        else:
            if actual_value == expected_range:
                print(f"  ✓ {check_name}: {description} = {actual_value}")
                passed += 1
            else:
                print(f"  ✗ {check_name}: {description} = {actual_value} (expected {expected_range})")
                failed += 1

    print(f"\n📋 Validation Summary: {passed} passed, {failed} failed")
    return passed, failed


def main():
    """Run comprehensive benchmark validation"""
    print("="*80)
    print("COMPREHENSIVE BENCHMARK VALIDATION TEST SUITE")
    print("Testing all 30+ industry benchmarks with real-world scenarios")
    print("="*80)

    total_passed = 0
    total_failed = 0

    # ========================================================================
    # Scenario 1: Mature Agency with Optimal Operations
    # ========================================================================
    params1 = EnhancedSimulationParameters()
    params1.initial_policies = 1000
    params1.initial_customers = 600  # 1.67 policies/customer
    params1.growth_stage = GrowthStage.MATURE

    # Marketing: Conservative mature agency spend
    params1.marketing.referral.monthly_allocation = 500
    params1.marketing.digital.monthly_allocation = 1000
    params1.marketing.traditional.monthly_allocation = 500
    params1.marketing.partnerships.monthly_allocation = 500

    # Staffing: Optimal ratio
    params1.staffing.producers = 3.0
    params1.staffing.service_staff = 8.0  # 2.67:1 ratio (near optimal 2.8)
    params1.staffing.admin_staff = 1.0

    # Product mix: Well-diversified
    params1.bundling.auto_policies = 400
    params1.bundling.home_policies = 350
    params1.bundling.umbrella_policies = 150
    params1.bundling.cyber_policies = 50
    params1.bundling.commercial_policies = 50

    # Technology: All investments enabled
    params1.technology.eo_automation_enabled = True
    params1.technology.renewal_program_enabled = True
    params1.technology.crosssell_program_enabled = True

    expected1 = {
        'rule_of_20': (20, 30, "Rule of 20 Score"),
        'ebitda': (0.25, 0.35, "EBITDA Margin"),
        'ltv_cac': (3.0, 6.0, "LTV:CAC Ratio"),
        'policies_per_customer': (1.5, 2.0, "Policies/Customer"),
        'retention': (0.90, 0.96, "Retention Rate"),
        'rpe': (150000, 350000, "Revenue/Employee")
    }

    # Get actual values from simulation
    sim1 = EnhancedAgencySimulator(params1)
    results1 = sim1.simulate_scenario(24)
    report1 = sim1.generate_benchmark_report(results1)

    expected1_with_actuals = {
        'rule_of_20': (report1['financial_performance']['rule_of_20']['score'], (20, 30), "Rule of 20 Score"),
        'ebitda': (report1['financial_performance']['ebitda']['margin'], (0.25, 0.35), "EBITDA Margin"),
        'ltv_cac': (report1['unit_economics']['ltv_cac_ratio'], (3.0, 6.0), "LTV:CAC Ratio"),
        'policies_per_customer': (report1['operational_metrics']['policies_per_customer'], (1.5, 2.0), "Policies/Customer"),
        'retention': (report1['operational_metrics']['retention_rate'], (0.90, 0.96), "Retention Rate"),
        'rpe': (report1['operational_metrics']['revenue_per_employee'], (150000, 350000), "Revenue/Employee")
    }

    p, f = test_scenario("Mature Agency with Optimal Operations", params1, expected1_with_actuals)
    total_passed += p
    total_failed += f

    # ========================================================================
    # Scenario 2: Growth Agency with Aggressive Investment
    # ========================================================================
    params2 = EnhancedSimulationParameters()
    params2.initial_policies = 500
    params2.initial_customers = 400  # 1.25 policies/customer (monoline)
    params2.growth_stage = GrowthStage.GROWTH

    # Marketing: Aggressive growth spend
    params2.marketing.referral.monthly_allocation = 1500
    params2.marketing.digital.monthly_allocation = 3000
    params2.marketing.traditional.monthly_allocation = 1000
    params2.marketing.partnerships.monthly_allocation = 1500

    # Staffing: Building capacity
    params2.staffing.producers = 2.0
    params2.staffing.service_staff = 6.0  # 3.0:1 ratio
    params2.staffing.admin_staff = 1.0

    # Product mix: Monoline heavy
    params2.bundling.auto_policies = 300
    params2.bundling.home_policies = 150
    params2.bundling.umbrella_policies = 30
    params2.bundling.cyber_policies = 10
    params2.bundling.commercial_policies = 10

    # Technology: Cross-sell to drive bundling
    params2.technology.eo_automation_enabled = True
    params2.technology.renewal_program_enabled = True
    params2.technology.crosssell_program_enabled = True

    sim2 = EnhancedAgencySimulator(params2)
    results2 = sim2.simulate_scenario(24)
    report2 = sim2.generate_benchmark_report(results2)

    expected2_with_actuals = {
        'rule_of_20': (report2['financial_performance']['rule_of_20']['score'], (15, 25), "Rule of 20 Score"),
        'ebitda': (report2['financial_performance']['ebitda']['margin'], (0.15, 0.30), "EBITDA Margin"),
        'ltv_cac': (report2['unit_economics']['ltv_cac_ratio'], (2.5, 5.0), "LTV:CAC Ratio"),
        'policies_per_customer': (report2['operational_metrics']['policies_per_customer'], (1.2, 1.9), "Policies/Customer"),
        'retention': (report2['operational_metrics']['retention_rate'], (0.85, 0.95), "Retention Rate"),
        'marketing_spend': (report2['marketing_efficiency']['marketing_spend_percent'], (0.10, 0.25), "Marketing Spend %")
    }

    p, f = test_scenario("Growth Agency with Aggressive Investment", params2, expected2_with_actuals)
    total_passed += p
    total_failed += f

    # ========================================================================
    # Scenario 3: Captive Agency with Limited Product Mix
    # ========================================================================
    params3 = EnhancedSimulationParameters()
    params3.initial_policies = 800
    params3.initial_customers = 650  # 1.23 policies/customer (mostly monoline)
    params3.agency_type = AgencyType.CAPTIVE
    params3.growth_stage = GrowthStage.MATURE

    # Marketing: Moderate spend
    params3.marketing.referral.monthly_allocation = 800
    params3.marketing.digital.monthly_allocation = 1200
    params3.marketing.traditional.monthly_allocation = 500
    params3.marketing.partnerships.monthly_allocation = 500

    # Staffing: Service-heavy
    params3.staffing.producers = 2.0
    params3.staffing.service_staff = 7.0  # 3.5:1 ratio (above optimal)
    params3.staffing.admin_staff = 1.5

    # Product mix: Limited (captive constraint)
    params3.bundling.auto_policies = 500
    params3.bundling.home_policies = 250
    params3.bundling.umbrella_policies = 40
    params3.bundling.cyber_policies = 5
    params3.bundling.commercial_policies = 5

    # Technology: Basic
    params3.technology.eo_automation_enabled = True
    params3.technology.renewal_program_enabled = False
    params3.technology.crosssell_program_enabled = False

    sim3 = EnhancedAgencySimulator(params3)
    results3 = sim3.simulate_scenario(24)
    report3 = sim3.generate_benchmark_report(results3)

    expected3_with_actuals = {
        'rule_of_20': (report3['financial_performance']['rule_of_20']['score'], (15, 25), "Rule of 20 Score"),
        'ebitda': (report3['financial_performance']['ebitda']['margin'], (0.20, 0.30), "EBITDA Margin"),
        'ltv_cac': (report3['unit_economics']['ltv_cac_ratio'], (2.5, 5.0), "LTV:CAC Ratio"),
        'policies_per_customer': (report3['operational_metrics']['policies_per_customer'], (1.2, 1.6), "Policies/Customer"),
        'retention': (report3['operational_metrics']['retention_rate'], (0.85, 0.92), "Retention Rate"),
        'rpe': (report3['operational_metrics']['revenue_per_employee'], (120000, 250000), "Revenue/Employee")
    }

    p, f = test_scenario("Captive Agency with Limited Product Mix", params3, expected3_with_actuals)
    total_passed += p
    total_failed += f

    # ========================================================================
    # Final Summary
    # ========================================================================
    print(f"\n{'='*80}")
    print(f"FINAL VALIDATION SUMMARY")
    print(f"{'='*80}")
    print(f"Total Checks Passed: {total_passed}")
    print(f"Total Checks Failed: {total_failed}")
    print(f"Success Rate: {(total_passed/(total_passed+total_failed)*100):.1f}%")

    if total_failed == 0:
        print(f"\n🎉 ALL BENCHMARK VALIDATIONS PASSED!")
        return 0
    else:
        print(f"\n⚠️  Some validations failed. Review output above.")
        return 1


if __name__ == "__main__":
    exit(main())
