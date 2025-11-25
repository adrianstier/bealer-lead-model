#!/usr/bin/env python3
"""
Cash Flow Timing Model
Models commission payment lag and working capital requirements
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta


@dataclass
class CashFlowModel:
    """
    Model cash flow vs accrual revenue accounting

    Key Realities:
    - Commission paid 45-60 days after policy effective date
    - Chargebacks occur when policies cancel in first 60-90 days
    - Growth requires working capital buffer
    - Cash flow ≠ Profit (timing mismatch)
    """

    # Commission payment timing (Allstate-specific, verify with agent)
    commission_payment_lag_days: int = 48  # Typical 45-60 days

    # Chargeback provisions
    chargeback_rate_first_60_days: float = 0.08  # 8% of new policies cancel early
    chargeback_recovery_rate: float = 0.95  # Carrier recoups 95% of commission paid

    # Working capital requirements
    min_cash_buffer_months: float = 2.0  # Minimum 2 months operating expenses
    growth_buffer_months_per_10pct_growth: float = 1.0  # Add 1 month per 10% monthly growth

    # Payment assumptions
    avg_commission_rate: float = 0.07  # 7% blended

    def calculate_monthly_cash_flow(self,
                                    current_month_revenue_accrual: float,
                                    current_month_expenses: float,
                                    prior_month_revenue_accrual: float,
                                    two_months_ago_revenue: float,
                                    current_month_cancellations_premium: float) -> Dict:
        """
        Calculate actual cash in/out vs accrual accounting

        Args:
            current_month_revenue_accrual: New premium written this month (accrual)
            current_month_expenses: Operating expenses this month (cash out)
            prior_month_revenue_accrual: Premium written 1 month ago
            two_months_ago_revenue: Premium written 2 months ago
            current_month_cancellations_premium: Premium cancelled this month

        Returns:
            Cash flow analysis
        """
        # CASH IN: Commission from prior month(s) policies
        # Assuming 48-day lag ≈ 1.5 months, use weighted average
        if self.commission_payment_lag_days <= 30:
            cash_in_commissions = prior_month_revenue_accrual * self.avg_commission_rate
        elif self.commission_payment_lag_days <= 45:
            # Weight between 1 and 2 months ago
            cash_in_commissions = (prior_month_revenue_accrual * 0.7 +
                                  two_months_ago_revenue * 0.3) * self.avg_commission_rate
        else:
            # Primarily 2 months ago
            cash_in_commissions = two_months_ago_revenue * self.avg_commission_rate

        # CASH OUT: Commission chargebacks (early cancellations)
        cash_out_chargebacks = (current_month_cancellations_premium *
                               self.avg_commission_rate *
                               self.chargeback_recovery_rate)

        # CASH OUT: Operating expenses (paid immediately)
        cash_out_expenses = current_month_expenses

        # Net cash flow
        total_cash_in = cash_in_commissions
        total_cash_out = cash_out_chargebacks + cash_out_expenses
        net_cash_flow = total_cash_in - total_cash_out

        # Accrual accounting (for comparison)
        accrual_revenue = current_month_revenue_accrual * self.avg_commission_rate
        accrual_profit = accrual_revenue - current_month_expenses

        # Cash vs accrual gap
        cash_accrual_gap = net_cash_flow - accrual_profit

        return {
            "cash_flow": {
                "cash_in_commissions": cash_in_commissions,
                "cash_out_chargebacks": cash_out_chargebacks,
                "cash_out_expenses": cash_out_expenses,
                "total_cash_in": total_cash_in,
                "total_cash_out": total_cash_out,
                "net_cash_flow": net_cash_flow
            },
            "accrual_accounting": {
                "revenue": accrual_revenue,
                "expenses": current_month_expenses,
                "profit": accrual_profit
            },
            "comparison": {
                "cash_vs_accrual_gap": cash_accrual_gap,
                "cash_flow_warning": net_cash_flow < 0,
                "warning_message": "⚠️ CASH BURN: Negative cash flow despite positive accrual profit" if (net_cash_flow < 0 and accrual_profit > 0) else None
            }
        }

    def calculate_working_capital_need(self,
                                      monthly_operating_expenses: float,
                                      monthly_growth_rate: float = 0.05) -> Dict:
        """
        Calculate working capital buffer needed to sustain operations and growth

        Args:
            monthly_operating_expenses: Monthly operating expenses
            monthly_growth_rate: Expected monthly revenue growth rate

        Returns:
            Working capital requirement analysis
        """
        # Base buffer: Cover X months of expenses
        base_buffer = self.min_cash_buffer_months * monthly_operating_expenses

        # Growth buffer: Higher growth = more working capital needed
        # 10% monthly growth = additional 1 month buffer
        growth_buffer = (monthly_growth_rate / 0.10) * self.growth_buffer_months_per_10pct_growth * monthly_operating_expenses

        # Commission lag buffer: Premium in flight
        lag_months = self.commission_payment_lag_days / 30
        lag_buffer = lag_months * (monthly_operating_expenses * 0.5)  # Conservative estimate

        # Total working capital need
        total_working_capital = base_buffer + growth_buffer + lag_buffer

        # Monthly cash reserve burn rate (if growing rapidly)
        monthly_cash_burn_during_growth = monthly_operating_expenses * (1 + monthly_growth_rate) - (
            monthly_operating_expenses * 0.7  # Assume 70% comes in from lag
        )

        return {
            "monthly_expenses": monthly_operating_expenses,
            "monthly_growth_rate": monthly_growth_rate,
            "base_buffer": base_buffer,
            "growth_buffer": growth_buffer,
            "lag_buffer": lag_buffer,
            "total_working_capital_need": total_working_capital,
            "months_of_runway": total_working_capital / monthly_operating_expenses if monthly_operating_expenses > 0 else 0,
            "monthly_cash_burn_during_growth": max(0, monthly_cash_burn_during_growth),
            "recommendation": self._generate_working_capital_recommendation(
                total_working_capital, monthly_operating_expenses, monthly_growth_rate
            )
        }

    def _generate_working_capital_recommendation(self,
                                                total_wc: float,
                                                monthly_exp: float,
                                                growth_rate: float) -> str:
        """Generate working capital recommendation"""

        months_runway = total_wc / monthly_exp if monthly_exp > 0 else 0

        if growth_rate > 0.10:
            return (f"🚀 HIGH GROWTH MODE: Maintain ${total_wc:,.0f} working capital "
                   f"({months_runway:.1f} months runway). Rapid growth requires significant "
                   f"cash buffer due to commission lag.")
        elif growth_rate > 0.05:
            return (f"📈 MODERATE GROWTH: Maintain ${total_wc:,.0f} working capital "
                   f"({months_runway:.1f} months runway). Growth is sustainable with proper "
                   f"cash management.")
        else:
            return (f"✅ STABLE OPERATIONS: Maintain ${total_wc:,.0f} working capital "
                   f"({months_runway:.1f} months runway). Current cash buffer is adequate.")

    def project_cash_flow_12_months(self,
                                   starting_monthly_revenue: float,
                                   monthly_growth_rate: float,
                                   monthly_expenses: float,
                                   expense_growth_rate: float = 0.02) -> pd.DataFrame:
        """
        Project 12-month cash flow with growth

        Args:
            starting_monthly_revenue: Starting monthly premium written
            monthly_growth_rate: Monthly revenue growth rate
            monthly_expenses: Starting monthly expenses
            expense_growth_rate: Monthly expense growth rate

        Returns:
            DataFrame with monthly projections
        """
        months = []

        # Initialize with Month 0 and Month -1 for lag calculations
        revenue_history = [starting_monthly_revenue * 0.95, starting_monthly_revenue]

        for month in range(1, 13):
            # Revenue (accrual)
            current_revenue = revenue_history[-1] * (1 + monthly_growth_rate)
            prior_month_revenue = revenue_history[-1]
            two_months_ago_revenue = revenue_history[-2] if len(revenue_history) >= 2 else revenue_history[-1]

            # Expenses (grow more slowly)
            current_expenses = monthly_expenses * ((1 + expense_growth_rate) ** month)

            # Assume 8% of new premium cancels (chargebacks)
            cancellations = current_revenue * self.chargeback_rate_first_60_days

            # Calculate cash flow
            cash_flow = self.calculate_monthly_cash_flow(
                current_month_revenue_accrual=current_revenue,
                current_month_expenses=current_expenses,
                prior_month_revenue_accrual=prior_month_revenue,
                two_months_ago_revenue=two_months_ago_revenue,
                current_month_cancellations_premium=cancellations
            )

            # Cumulative cash balance (starting from $0)
            cumulative_cash = (
                sum([m["net_cash_flow"] for m in months]) + cash_flow["cash_flow"]["net_cash_flow"]
            ) if months else cash_flow["cash_flow"]["net_cash_flow"]

            months.append({
                "month": month,
                "premium_written_accrual": current_revenue,
                "commission_revenue_accrual": current_revenue * self.avg_commission_rate,
                "expenses": current_expenses,
                "accrual_profit": cash_flow["accrual_accounting"]["profit"],
                "cash_in": cash_flow["cash_flow"]["total_cash_in"],
                "cash_out": cash_flow["cash_flow"]["total_cash_out"],
                "net_cash_flow": cash_flow["cash_flow"]["net_cash_flow"],
                "cumulative_cash": cumulative_cash,
                "cash_vs_accrual_gap": cash_flow["comparison"]["cash_vs_accrual_gap"]
            })

            revenue_history.append(current_revenue)

        df = pd.DataFrame(months)
        return df

    def analyze_cash_flow_stress_test(self,
                                      monthly_revenue: float,
                                      monthly_expenses: float,
                                      growth_scenarios: List[float] = [0.05, 0.10, 0.15]) -> Dict:
        """
        Stress test cash flow under different growth scenarios

        Args:
            monthly_revenue: Current monthly revenue
            monthly_expenses: Current monthly expenses
            growth_scenarios: List of monthly growth rates to test

        Returns:
            Stress test results
        """
        results = {}

        for growth_rate in growth_scenarios:
            # Project 12 months
            projection = self.project_cash_flow_12_months(
                starting_monthly_revenue=monthly_revenue,
                monthly_growth_rate=growth_rate,
                monthly_expenses=monthly_expenses
            )

            # Calculate metrics
            min_cash_balance = projection["cumulative_cash"].min()
            max_cash_balance = projection["cumulative_cash"].max()
            months_cash_negative = (projection["cumulative_cash"] < 0).sum()
            total_cash_burn = abs(min_cash_balance) if min_cash_balance < 0 else 0

            # Working capital needed
            wc_need = self.calculate_working_capital_need(
                monthly_expenses, growth_rate
            )

            results[f"{growth_rate:.0%}_growth"] = {
                "growth_rate": growth_rate,
                "min_cash_balance": min_cash_balance,
                "max_cash_balance": max_cash_balance,
                "months_cash_negative": months_cash_negative,
                "total_cash_burn": total_cash_burn,
                "working_capital_needed": wc_need["total_working_capital_need"],
                "sustainable": min_cash_balance > -wc_need["total_working_capital_need"],
                "projection": projection
            }

        return results


# ============================================================================
# EXAMPLE USAGE & TESTING
# ============================================================================

def demo_cash_flow_model():
    """Demonstrate cash flow modeling"""

    print("=" * 80)
    print("CASH FLOW TIMING MODEL DEMO")
    print("=" * 80)

    # Initialize model
    model = CashFlowModel(
        commission_payment_lag_days=48,  # Allstate typical
        chargeback_rate_first_60_days=0.08
    )

    # Example 1: Single month cash flow
    print("\n💵 MONTHLY CASH FLOW ANALYSIS")
    print("-" * 80)

    cash_flow = model.calculate_monthly_cash_flow(
        current_month_revenue_accrual=500_000,  # $500k premium written this month
        current_month_expenses=42_000,          # $42k in expenses
        prior_month_revenue_accrual=480_000,    # $480k written last month
        two_months_ago_revenue=460_000,         # $460k written 2 months ago
        current_month_cancellations_premium=40_000  # $40k in cancellations
    )

    print("ACCRUAL ACCOUNTING (P&L):")
    print(f"  Revenue:           ${cash_flow['accrual_accounting']['revenue']:,.0f}")
    print(f"  Expenses:          ${cash_flow['accrual_accounting']['expenses']:,.0f}")
    print(f"  Profit:            ${cash_flow['accrual_accounting']['profit']:,.0f}")

    print("\nCASH FLOW (ACTUAL):")
    print(f"  Cash IN:           ${cash_flow['cash_flow']['total_cash_in']:,.0f}")
    print(f"    Commissions:     ${cash_flow['cash_flow']['cash_in_commissions']:,.0f}")
    print(f"  Cash OUT:          ${cash_flow['cash_flow']['total_cash_out']:,.0f}")
    print(f"    Expenses:        ${cash_flow['cash_flow']['cash_out_expenses']:,.0f}")
    print(f"    Chargebacks:     ${cash_flow['cash_flow']['cash_out_chargebacks']:,.0f}")
    print(f"  NET CASH FLOW:     ${cash_flow['cash_flow']['net_cash_flow']:,.0f}")

    print("\nCOMPARISON:")
    print(f"  Cash vs Accrual Gap: ${cash_flow['comparison']['cash_vs_accrual_gap']:,.0f}")
    if cash_flow['comparison']['warning_message']:
        print(f"  {cash_flow['comparison']['warning_message']}")

    # Example 2: Working capital requirement
    print("\n\n💰 WORKING CAPITAL REQUIREMENTS")
    print("-" * 80)

    wc = model.calculate_working_capital_need(
        monthly_operating_expenses=42_000,
        monthly_growth_rate=0.10  # 10% monthly growth
    )

    print(f"Monthly Expenses:    ${wc['monthly_expenses']:,.0f}")
    print(f"Monthly Growth:      {wc['monthly_growth_rate']:.1%}")
    print(f"\nBuffer Breakdown:")
    print(f"  Base Buffer:       ${wc['base_buffer']:,.0f} ({model.min_cash_buffer_months:.1f} months)")
    print(f"  Growth Buffer:     ${wc['growth_buffer']:,.0f}")
    print(f"  Commission Lag:    ${wc['lag_buffer']:,.0f}")
    print(f"  TOTAL NEEDED:      ${wc['total_working_capital_need']:,.0f}")
    print(f"\nMonths of Runway:    {wc['months_of_runway']:.1f} months")
    print(f"\n{wc['recommendation']}")

    # Example 3: 12-month projection
    print("\n\n📅 12-MONTH CASH FLOW PROJECTION")
    print("-" * 80)

    projection = model.project_cash_flow_12_months(
        starting_monthly_revenue=500_000,
        monthly_growth_rate=0.08,  # 8% monthly growth
        monthly_expenses=42_000
    )

    print(f"{'Month':<8} {'Revenue':<12} {'Profit':<12} {'Cash Flow':<12} {'Cumulative':<12}")
    print("-" * 80)
    for _, row in projection.head(6).iterrows():
        print(f"Month {row['month']:<2} "
              f"${row['commission_revenue_accrual']:>10,.0f}  "
              f"${row['accrual_profit']:>10,.0f}  "
              f"${row['net_cash_flow']:>10,.0f}  "
              f"${row['cumulative_cash']:>10,.0f}")

    print(f"\nFinal Month (12):")
    final = projection.iloc[-1]
    print(f"  Cumulative Cash:   ${final['cumulative_cash']:,.0f}")
    print(f"  Total Accrual Profit: ${projection['accrual_profit'].sum():,.0f}")
    print(f"  Total Cash Generated: ${projection['net_cash_flow'].sum():,.0f}")

    # Example 4: Stress test
    print("\n\n🧪 GROWTH SCENARIO STRESS TEST")
    print("-" * 80)

    stress_test = model.analyze_cash_flow_stress_test(
        monthly_revenue=500_000,
        monthly_expenses=42_000,
        growth_scenarios=[0.05, 0.10, 0.15]
    )

    print(f"{'Scenario':<20} {'Min Cash':<15} {'WC Needed':<15} {'Sustainable'}")
    print("-" * 80)
    for scenario_name, result in stress_test.items():
        sustainable = "✅ YES" if result["sustainable"] else "❌ NO"
        print(f"{scenario_name:<20} "
              f"${result['min_cash_balance']:>12,.0f}  "
              f"${result['working_capital_needed']:>12,.0f}  "
              f"{sustainable}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    demo_cash_flow_model()
