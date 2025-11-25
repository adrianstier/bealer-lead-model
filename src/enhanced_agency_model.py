#!/usr/bin/env python3
"""
Enhanced Agency Model - Phase 1 Integration
Integrates: Loss Ratios, Rate Environment, Cash Flow, Customer Segmentation
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional

# Import our new models
from loss_ratio_model import LossRatioModel
from rate_environment_model import RateEnvironmentModel
from cash_flow_model import CashFlowModel
from customer_segmentation_model import CustomerSegmentationModel


@dataclass
class EnhancedAgencyModel:
    """
    Comprehensive agency modeling with all Phase 1 enhancements

    This integrates:
    1. Loss ratio & profitability tracking
    2. Rate increase & price elasticity
    3. Cash flow timing (commission lag)
    4. Customer segmentation (Elite/Premium/Standard/Low-Value)
    """

    # Sub-models
    loss_ratio: LossRatioModel = field(default_factory=LossRatioModel)
    rate_environment: RateEnvironmentModel = field(default_factory=RateEnvironmentModel)
    cash_flow: CashFlowModel = field(default_factory=CashFlowModel)
    segmentation: CustomerSegmentationModel = field(default_factory=CustomerSegmentationModel)

    # Current state
    current_monthly_premium: float = 500000  # $500k/month premium written
    current_monthly_expenses: float = 42000   # $42k/month expenses
    current_customer_count: int = 500

    def simulate_month_enhanced(self,
                               new_premium_written: float,
                               prior_month_premium: float,
                               two_months_ago_premium: float,
                               current_month_expenses: float,
                               cancellations_premium: float,
                               product_mix: Dict[str, Dict],
                               new_customers: List[Dict],
                               rate_increase_this_month: float = 0.0) -> Dict:
        """
        Simulate one month with all enhancements

        Args:
            new_premium_written: New premium written this month (accrual)
            prior_month_premium: Premium written 1 month ago
            two_months_ago_premium: Premium written 2 months ago
            current_month_expenses: Operating expenses
            cancellations_premium: Premium that cancelled
            product_mix: Product breakdown {"auto": {"premium": X, "claims": Y, "policies": Z}}
            new_customers: List of new customers acquired
            rate_increase_this_month: Rate increase % this month

        Returns:
            Comprehensive month results with all metrics
        """

        # 1. LOSS RATIO ANALYSIS
        portfolio_profitability = self.loss_ratio.calculate_portfolio_metrics(product_mix)

        # 2. RATE ENVIRONMENT IMPACT
        # If there was a rate increase, calculate retention impact
        if rate_increase_this_month > 0:
            base_retention = 0.85  # Assume 85% base
            rate_impact = self.rate_environment.calculate_rate_driven_churn(
                rate_increase_this_month, base_retention
            )
            adjusted_retention = rate_impact["adjusted_retention"]
        else:
            adjusted_retention = 0.85
            rate_impact = None

        # 3. CASH FLOW ANALYSIS
        cash_flow_result = self.cash_flow.calculate_monthly_cash_flow(
            current_month_revenue_accrual=new_premium_written,
            current_month_expenses=current_month_expenses,
            prior_month_revenue_accrual=prior_month_premium,
            two_months_ago_revenue=two_months_ago_premium,
            current_month_cancellations_premium=cancellations_premium
        )

        # 4. CUSTOMER SEGMENTATION
        segmentation_result = self.segmentation.analyze_customer_portfolio(new_customers)

        # 5. WORKING CAPITAL REQUIREMENT
        monthly_growth = (new_premium_written / prior_month_premium - 1) if prior_month_premium > 0 else 0
        wc_requirement = self.cash_flow.calculate_working_capital_need(
            current_month_expenses, monthly_growth
        )

        # COMBINED RESULTS
        return {
            "profitability": {
                "combined_ratio": portfolio_profitability["portfolio_combined_ratio"],
                "loss_ratio": portfolio_profitability["portfolio_loss_ratio"],
                "bonus_status": portfolio_profitability["bonus_eligibility"]["status"],
                "bonus_multiplier": portfolio_profitability["bonus_eligibility"]["multiplier"],
                "agency_profit": portfolio_profitability["portfolio_agency_profit"],
                "profitable": portfolio_profitability["profitability_status"] == "profitable"
            },
            "retention": {
                "base_retention": 0.85,
                "adjusted_retention": adjusted_retention,
                "rate_increase": rate_increase_this_month,
                "rate_impact": rate_impact
            },
            "cash_flow": {
                "net_cash_flow": cash_flow_result["cash_flow"]["net_cash_flow"],
                "accrual_profit": cash_flow_result["accrual_accounting"]["profit"],
                "cash_burn_warning": cash_flow_result["comparison"]["cash_flow_warning"],
                "working_capital_needed": wc_requirement["total_working_capital_need"]
            },
            "customer_quality": {
                "total_customers": segmentation_result["total_customers"],
                "avg_ltv": segmentation_result["avg_ltv"],
                "elite_percentage": segmentation_result["segments"]["elite"]["percentage_of_book"],
                "premium_percentage": segmentation_result["segments"]["premium"]["percentage_of_book"],
                "top_tier_ltv_contribution": (
                    segmentation_result["segments"]["elite"]["ltv_contribution_pct"] +
                    segmentation_result["segments"]["premium"]["ltv_contribution_pct"]
                )
            }
        }

    def generate_comprehensive_report(self,
                                     historical_months: List[Dict],
                                     current_customer_portfolio: List[Dict]) -> Dict:
        """
        Generate comprehensive agency health report

        Args:
            historical_months: List of monthly data
            current_customer_portfolio: Current customer base

        Returns:
            Executive health report
        """

        # Calculate current state
        latest_month = historical_months[-1] if historical_months else {}

        # Segmentation analysis
        portfolio_analysis = self.segmentation.analyze_customer_portfolio(
            current_customer_portfolio
        )

        # Marketing allocation recommendation
        marketing_allocation = self.segmentation.recommend_marketing_allocation(
            total_marketing_budget=50000,  # Example $50k
            current_segment_distribution=portfolio_analysis["segments"]
        )

        # LTV with inflation
        ltv_inflation = self.rate_environment.calculate_ltv_with_inflation(
            base_premium=1500,
            base_retention=0.85,
            years=10,
            annual_rate_increase=0.08
        )

        return {
            "executive_summary": {
                "total_customers": portfolio_analysis["total_customers"],
                "total_portfolio_ltv": portfolio_analysis["total_ltv"],
                "avg_customer_ltv": portfolio_analysis["avg_ltv"],
                "elite_tier_percentage": portfolio_analysis["segments"]["elite"]["percentage_of_book"],
                "top_tier_value_concentration": (
                    portfolio_analysis["segments"]["elite"]["ltv_contribution_pct"] +
                    portfolio_analysis["segments"]["premium"]["ltv_contribution_pct"]
                )
            },
            "profitability_health": {
                "combined_ratio": latest_month.get("combined_ratio", 0.90),
                "bonus_eligible": latest_month.get("combined_ratio", 0.90) < 0.95,
                "agency_profit_margin": latest_month.get("profit_margin", 0.20)
            },
            "customer_segmentation": portfolio_analysis,
            "marketing_recommendations": marketing_allocation,
            "ltv_projection_with_inflation": ltv_inflation,
            "key_insights": self._generate_key_insights(portfolio_analysis, latest_month)
        }

    def _generate_key_insights(self, portfolio_analysis: Dict, latest_month: Dict) -> List[str]:
        """Generate strategic insights"""

        insights = []

        # Customer concentration
        top_tier_pct = (
            portfolio_analysis["segments"]["elite"]["percentage_of_book"] +
            portfolio_analysis["segments"]["premium"]["percentage_of_book"]
        )

        top_tier_value = (
            portfolio_analysis["segments"]["elite"]["ltv_contribution_pct"] +
            portfolio_analysis["segments"]["premium"]["ltv_contribution_pct"]
        )

        insights.append(
            f"✅ Top {top_tier_pct:.0f}% of customers (Elite + Premium) drive "
            f"{top_tier_value:.0f}% of lifetime value"
        )

        # Low-value warning
        low_value_pct = portfolio_analysis["segments"]["low_value"]["percentage_of_book"]
        if low_value_pct > 15:
            insights.append(
                f"⚠️ {low_value_pct:.0f}% of book is low-value customers - "
                f"review lead sources and acquisition strategy"
            )

        # Combined ratio health
        combined_ratio = latest_month.get("combined_ratio", 0.90)
        if combined_ratio < 0.90:
            insights.append(f"✅ Excellent underwriting with {combined_ratio:.0%} combined ratio")
        elif combined_ratio < 0.95:
            insights.append(f"✅ Good underwriting with {combined_ratio:.0%} combined ratio (bonus eligible)")
        elif combined_ratio < 1.00:
            insights.append(f"⚠️ Marginal underwriting at {combined_ratio:.0%} - bonus at risk")
        else:
            insights.append(f"🔴 CRITICAL: Unprofitable underwriting at {combined_ratio:.0%}")

        # Upgrade opportunity
        standard_count = portfolio_analysis["segments"]["standard"]["count"]
        if standard_count > 0:
            standard_to_premium_value = standard_count * 4500  # Avg value difference
            insights.append(
                f"💰 Cross-sell opportunity: {standard_count} Standard customers "
                f"= ${standard_to_premium_value:,.0f} potential LTV lift"
            )

        return insights


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

def demo_enhanced_model():
    """Demonstrate enhanced comprehensive model"""

    print("=" * 80)
    print("ENHANCED AGENCY MODEL - PHASE 1 INTEGRATION DEMO")
    print("=" * 80)

    # Initialize
    model = EnhancedAgencyModel()

    # Simulate one month
    print("\n📊 MONTHLY SIMULATION (All Models Integrated)")
    print("-" * 80)

    result = model.simulate_month_enhanced(
        new_premium_written=500000,
        prior_month_premium=480000,
        two_months_ago_premium=460000,
        current_month_expenses=42000,
        cancellations_premium=40000,
        product_mix={
            "auto": {"premium": 300000, "claims": 204000, "policies": 250},
            "home": {"premium": 150000, "claims": 93000, "policies": 100},
            "umbrella": {"premium": 50000, "claims": 17500, "policies": 150}
        },
        new_customers=[
            {"product_count": 3, "annual_premium": 3500} for _ in range(10)
        ] + [
            {"product_count": 2, "annual_premium": 2200} for _ in range(25)
        ] + [
            {"product_count": 1, "annual_premium": 1200} for _ in range(40)
        ],
        rate_increase_this_month=0.10  # 10% rate increase
    )

    print("PROFITABILITY:")
    print(f"  Combined Ratio:     {result['profitability']['combined_ratio']:.1%}")
    print(f"  Loss Ratio:         {result['profitability']['loss_ratio']:.1%}")
    print(f"  Bonus Status:       {result['profitability']['bonus_status'].upper()}")
    print(f"  Bonus Multiplier:   {result['profitability']['bonus_multiplier']:.0%}")
    print(f"  Agency Profit:      ${result['profitability']['agency_profit']:,.0f}")
    print(f"  Profitable:         {'✅ YES' if result['profitability']['profitable'] else '❌ NO'}")

    print("\nRETENTION:")
    print(f"  Rate Increase:      {result['retention']['rate_increase']:.1%}")
    print(f"  Base Retention:     {result['retention']['base_retention']:.1%}")
    print(f"  Adjusted Retention: {result['retention']['adjusted_retention']:.1%}")

    print("\nCASH FLOW:")
    print(f"  Net Cash Flow:      ${result['cash_flow']['net_cash_flow']:,.0f}")
    print(f"  Accrual Profit:     ${result['cash_flow']['accrual_profit']:,.0f}")
    print(f"  WC Needed:          ${result['cash_flow']['working_capital_needed']:,.0f}")
    print(f"  Cash Burn Warning:  {'⚠️ YES' if result['cash_flow']['cash_burn_warning'] else '✅ NO'}")

    print("\nCUSTOMER QUALITY:")
    print(f"  Total Customers:    {result['customer_quality']['total_customers']}")
    print(f"  Avg LTV:            ${result['customer_quality']['avg_ltv']:,.0f}")
    print(f"  Elite %:            {result['customer_quality']['elite_percentage']:.1f}%")
    print(f"  Premium %:          {result['customer_quality']['premium_percentage']:.1f}%")
    print(f"  Top Tier Value:     {result['customer_quality']['top_tier_ltv_contribution']:.0f}%")

    # Comprehensive report
    print("\n\n📋 COMPREHENSIVE AGENCY HEALTH REPORT")
    print("=" * 80)

    # Generate sample customer portfolio
    np.random.seed(42)
    sample_customers = []
    for i in range(500):
        if i < 60:  # 12% elite
            products = np.random.randint(3, 6)
            premium = np.random.uniform(3000, 6000)
        elif i < 200:  # 28% premium
            products = 2
            premium = np.random.uniform(2000, 3500)
        elif i < 425:  # 45% standard
            products = 1
            premium = np.random.uniform(800, 2000)
        else:  # 15% low-value
            products = 1
            premium = np.random.uniform(300, 800)

        sample_customers.append({
            "customer_id": f"CUST{i:04d}",
            "product_count": products,
            "annual_premium": premium
        })

    report = model.generate_comprehensive_report(
        historical_months=[{"combined_ratio": 0.88, "profit_margin": 0.22}],
        current_customer_portfolio=sample_customers
    )

    print("\nEXECUTIVE SUMMARY:")
    exec_sum = report["executive_summary"]
    print(f"  Total Customers:        {exec_sum['total_customers']}")
    print(f"  Portfolio LTV:          ${exec_sum['total_portfolio_ltv']:,.0f}")
    print(f"  Avg Customer LTV:       ${exec_sum['avg_customer_ltv']:,.0f}")
    print(f"  Elite Tier %:           {exec_sum['elite_tier_percentage']:.1f}%")
    print(f"  Top Tier Value Concentration: {exec_sum['top_tier_value_concentration']:.0f}%")

    print("\nKEY INSIGHTS:")
    for insight in report["key_insights"]:
        print(f"  {insight}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    demo_enhanced_model()
