#!/usr/bin/env python3
"""
Loss Ratio & Profitability Model
Integrates claims data to calculate true profitability
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Literal
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Repository root
REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = REPO_ROOT / "data" / "04_raw_reports"


@dataclass
class LossRatioModel:
    """
    Loss ratio modeling for profitability analysis

    Key Insurance Economics:
    - Loss Ratio = Claims Paid / Premium Earned
    - Expense Ratio = Operating Expenses / Premium Earned
    - Combined Ratio = Loss Ratio + Expense Ratio
    - Target: <95% for bonus eligibility, <100% for profitability
    """

    # Industry benchmark loss ratios by product
    auto_loss_ratio_benchmark: float = 0.68  # 68% industry avg
    home_loss_ratio_benchmark: float = 0.62  # 62% industry avg
    umbrella_loss_ratio_benchmark: float = 0.35  # Very profitable
    life_loss_ratio_benchmark: float = 0.0  # Commission-only, no underwriting

    # Expense ratio (agency operating costs as % of premium)
    expense_ratio: float = 0.25  # 25% typical for agencies

    # Bonus eligibility thresholds (Allstate-specific)
    bonus_eligible_combined_ratio: float = 0.95  # <95% = full bonus
    warning_combined_ratio: float = 1.00  # 95-100% = reduced bonus
    critical_combined_ratio: float = 1.05  # >105% = no bonus

    # CAT (Catastrophe) loading for Santa Barbara
    wildfire_cat_load: float = 0.05  # Additional 5% expected loss from wildfires

    # Actual loss ratios (loaded from data, defaults to benchmarks)
    actual_loss_ratios: Dict[str, float] = field(default_factory=dict)

    def calculate_combined_ratio(self,
                                 loss_ratio: float,
                                 expense_ratio: Optional[float] = None) -> float:
        """
        Calculate Combined Ratio
        Combined Ratio = Loss Ratio + Expense Ratio

        < 100% = Underwriting profit
        > 100% = Underwriting loss
        """
        if expense_ratio is None:
            expense_ratio = self.expense_ratio

        return loss_ratio + expense_ratio

    def get_bonus_multiplier(self, combined_ratio: float) -> Dict:
        """
        Calculate bonus eligibility based on combined ratio

        Returns:
            Dictionary with multiplier and status
        """
        if combined_ratio <= self.bonus_eligible_combined_ratio:
            multiplier = 1.0
            status = "full_bonus"
            message = "Full bonus eligible - excellent underwriting"
        elif combined_ratio <= self.warning_combined_ratio:
            multiplier = 0.75
            status = "reduced_bonus"
            message = "Reduced bonus (75%) - underwriting needs improvement"
        elif combined_ratio <= self.critical_combined_ratio:
            multiplier = 0.50
            status = "warning"
            message = "Minimal bonus (50%) - critical underwriting issues"
        else:
            multiplier = 0.0
            status = "ineligible"
            message = "No bonus - unprofitable book of business"

        return {
            "multiplier": multiplier,
            "status": status,
            "message": message,
            "combined_ratio": combined_ratio,
            "threshold_full": self.bonus_eligible_combined_ratio,
            "threshold_warning": self.warning_combined_ratio,
            "threshold_critical": self.critical_combined_ratio
        }

    def calculate_product_profitability(self,
                                       product: str,
                                       premium_earned: float,
                                       claims_paid: float,
                                       policy_count: int) -> Dict:
        """
        Calculate profitability metrics for a specific product line

        Args:
            product: Product type (auto, home, umbrella, etc.)
            premium_earned: Total premium earned for period
            claims_paid: Total claims paid for period
            policy_count: Number of policies

        Returns:
            Dictionary with profitability metrics
        """
        # Loss ratio
        loss_ratio = claims_paid / premium_earned if premium_earned > 0 else 0

        # Combined ratio
        combined_ratio = self.calculate_combined_ratio(loss_ratio)

        # Commission revenue (assuming 7% avg)
        commission_rate = 0.07
        commission_revenue = premium_earned * commission_rate

        # Underwriting profit/loss (carrier perspective)
        underwriting_result = premium_earned - claims_paid - (premium_earned * self.expense_ratio)

        # Agency profit (commission minus servicing costs)
        avg_servicing_cost_per_policy = {"auto": 45, "home": 65, "umbrella": 25, "life": 40}.get(product, 50)
        total_servicing_cost = policy_count * avg_servicing_cost_per_policy
        agency_profit = commission_revenue - total_servicing_cost

        # Profitability per policy
        profit_per_policy = agency_profit / policy_count if policy_count > 0 else 0

        return {
            "product": product,
            "premium_earned": premium_earned,
            "claims_paid": claims_paid,
            "loss_ratio": loss_ratio,
            "expense_ratio": self.expense_ratio,
            "combined_ratio": combined_ratio,
            "policy_count": policy_count,
            "commission_revenue": commission_revenue,
            "servicing_cost": total_servicing_cost,
            "agency_profit": agency_profit,
            "profit_per_policy": profit_per_policy,
            "underwriting_result": underwriting_result,
            "status": "profitable" if combined_ratio < 1.0 else "loss"
        }

    def calculate_portfolio_metrics(self,
                                    product_mix: Dict[str, Dict]) -> Dict:
        """
        Calculate blended portfolio-level metrics

        Args:
            product_mix: Dictionary of products with their metrics
                {
                    "auto": {"premium": 1000000, "claims": 680000, "policies": 500},
                    "home": {"premium": 800000, "claims": 496000, "policies": 300},
                    ...
                }

        Returns:
            Portfolio-level profitability summary
        """
        total_premium = 0
        total_claims = 0
        total_policies = 0
        total_commission = 0
        total_servicing_cost = 0

        product_results = []

        for product, metrics in product_mix.items():
            premium = metrics.get("premium", 0)
            claims = metrics.get("claims", 0)
            policies = metrics.get("policies", 0)

            result = self.calculate_product_profitability(
                product, premium, claims, policies
            )
            product_results.append(result)

            total_premium += premium
            total_claims += claims
            total_policies += policies
            total_commission += result["commission_revenue"]
            total_servicing_cost += result["servicing_cost"]

        # Portfolio-level metrics
        portfolio_loss_ratio = total_claims / total_premium if total_premium > 0 else 0
        portfolio_combined_ratio = self.calculate_combined_ratio(portfolio_loss_ratio)
        portfolio_agency_profit = total_commission - total_servicing_cost

        # Bonus eligibility
        bonus_info = self.get_bonus_multiplier(portfolio_combined_ratio)

        return {
            "total_premium_earned": total_premium,
            "total_claims_paid": total_claims,
            "total_policies": total_policies,
            "total_commission_revenue": total_commission,
            "total_servicing_cost": total_servicing_cost,
            "portfolio_loss_ratio": portfolio_loss_ratio,
            "portfolio_combined_ratio": portfolio_combined_ratio,
            "portfolio_agency_profit": portfolio_agency_profit,
            "profit_per_policy": portfolio_agency_profit / total_policies if total_policies > 0 else 0,
            "bonus_eligibility": bonus_info,
            "product_breakdown": product_results,
            "profitability_status": "profitable" if portfolio_combined_ratio < 1.0 else "unprofitable"
        }

    def project_claims_cost(self,
                           projected_premium: float,
                           product: str,
                           use_actual_loss_ratio: bool = True) -> Dict:
        """
        Project expected claims cost for planning/budgeting

        Args:
            projected_premium: Expected premium volume
            product: Product line
            use_actual_loss_ratio: Use actual vs benchmark loss ratio

        Returns:
            Expected claims and profitability
        """
        # Determine loss ratio to use
        if use_actual_loss_ratio and product in self.actual_loss_ratios:
            loss_ratio = self.actual_loss_ratios[product]
        else:
            loss_ratio_map = {
                "auto": self.auto_loss_ratio_benchmark,
                "home": self.home_loss_ratio_benchmark,
                "umbrella": self.umbrella_loss_ratio_benchmark,
                "life": self.life_loss_ratio_benchmark
            }
            loss_ratio = loss_ratio_map.get(product, 0.65)

        # Add CAT loading for home in Santa Barbara
        if product == "home":
            loss_ratio += self.wildfire_cat_load

        # Project claims
        expected_claims = projected_premium * loss_ratio
        combined_ratio = self.calculate_combined_ratio(loss_ratio)

        # Commission revenue
        commission_revenue = projected_premium * 0.07

        # Expected profit/loss
        underwriting_result = projected_premium * (1 - combined_ratio)

        return {
            "projected_premium": projected_premium,
            "expected_loss_ratio": loss_ratio,
            "expected_claims": expected_claims,
            "combined_ratio": combined_ratio,
            "commission_revenue": commission_revenue,
            "underwriting_result": underwriting_result,
            "profitable": combined_ratio < 1.0
        }

    def load_claims_data(self, claims_file_path: Path) -> pd.DataFrame:
        """
        Load and parse claims detail report

        Args:
            claims_file_path: Path to Excel claims report

        Returns:
            Parsed claims DataFrame
        """
        try:
            df = pd.read_excel(claims_file_path)

            # Basic validation
            required_cols = ["Policy Type", "Premium", "Claims Paid"]
            # Column names may vary - try to detect

            return df
        except Exception as e:
            print(f"Error loading claims data: {e}")
            return pd.DataFrame()

    def calculate_actual_loss_ratios_from_data(self,
                                               claims_file: Optional[Path] = None) -> Dict[str, float]:
        """
        Calculate actual loss ratios from claims data file

        Args:
            claims_file: Path to claims Excel file

        Returns:
            Dictionary of actual loss ratios by product
        """
        if claims_file is None:
            claims_file = DATA_DIR / "2025-10_Claims_Detail_Report.xlsx"

        if not claims_file.exists():
            print(f"Claims file not found: {claims_file}")
            print("Using benchmark loss ratios instead")
            return {}

        try:
            # This would need to be customized based on actual file structure
            # For now, return empty dict to use benchmarks
            print(f"Claims data parsing not yet implemented for: {claims_file}")
            print("Using industry benchmark loss ratios")
            return {}

        except Exception as e:
            print(f"Error calculating loss ratios: {e}")
            return {}


# ============================================================================
# EXAMPLE USAGE & TESTING
# ============================================================================

def demo_loss_ratio_model():
    """Demonstrate loss ratio modeling"""

    print("=" * 80)
    print("LOSS RATIO & PROFITABILITY MODEL DEMO")
    print("=" * 80)

    # Initialize model
    model = LossRatioModel()

    # Example: Calculate profitability for auto product
    print("\n📊 PRODUCT PROFITABILITY: AUTO")
    print("-" * 80)

    auto_result = model.calculate_product_profitability(
        product="auto",
        premium_earned=1_000_000,  # $1M in auto premium
        claims_paid=680_000,        # $680k in claims (68% loss ratio)
        policy_count=500            # 500 auto policies
    )

    print(f"Premium Earned:      ${auto_result['premium_earned']:,.0f}")
    print(f"Claims Paid:         ${auto_result['claims_paid']:,.0f}")
    print(f"Loss Ratio:          {auto_result['loss_ratio']:.1%}")
    print(f"Combined Ratio:      {auto_result['combined_ratio']:.1%}")
    print(f"Commission Revenue:  ${auto_result['commission_revenue']:,.0f}")
    print(f"Agency Profit:       ${auto_result['agency_profit']:,.0f}")
    print(f"Profit/Policy:       ${auto_result['profit_per_policy']:,.0f}")
    print(f"Status:              {auto_result['status'].upper()}")

    # Example: Portfolio-level analysis
    print("\n\n📈 PORTFOLIO PROFITABILITY ANALYSIS")
    print("-" * 80)

    portfolio = {
        "auto": {
            "premium": 1_000_000,
            "claims": 680_000,
            "policies": 500
        },
        "home": {
            "premium": 800_000,
            "claims": 496_000,  # 62% loss ratio
            "policies": 300
        },
        "umbrella": {
            "premium": 150_000,
            "claims": 52_500,  # 35% loss ratio
            "policies": 250
        }
    }

    portfolio_result = model.calculate_portfolio_metrics(portfolio)

    print(f"Total Premium:       ${portfolio_result['total_premium_earned']:,.0f}")
    print(f"Total Claims:        ${portfolio_result['total_claims_paid']:,.0f}")
    print(f"Portfolio Loss Ratio: {portfolio_result['portfolio_loss_ratio']:.1%}")
    print(f"Combined Ratio:      {portfolio_result['portfolio_combined_ratio']:.1%}")
    print(f"Commission Revenue:  ${portfolio_result['total_commission_revenue']:,.0f}")
    print(f"Agency Profit:       ${portfolio_result['portfolio_agency_profit']:,.0f}")
    print(f"Status:              {portfolio_result['profitability_status'].upper()}")

    # Bonus eligibility
    bonus = portfolio_result['bonus_eligibility']
    print(f"\n💰 BONUS ELIGIBILITY")
    print(f"Status:              {bonus['status'].upper()}")
    print(f"Multiplier:          {bonus['multiplier']:.0%}")
    print(f"Message:             {bonus['message']}")

    # Product breakdown
    print(f"\n📦 PRODUCT BREAKDOWN")
    print("-" * 80)
    for prod in portfolio_result['product_breakdown']:
        print(f"\n{prod['product'].upper()}:")
        print(f"  Loss Ratio:        {prod['loss_ratio']:.1%}")
        print(f"  Combined Ratio:    {prod['combined_ratio']:.1%}")
        print(f"  Profit/Policy:     ${prod['profit_per_policy']:,.0f}")

    # Projection example
    print("\n\n🔮 CLAIMS PROJECTION (Planning)")
    print("-" * 80)

    projection = model.project_claims_cost(
        projected_premium=1_500_000,  # $1.5M projected auto premium
        product="auto"
    )

    print(f"Projected Premium:   ${projection['projected_premium']:,.0f}")
    print(f"Expected Loss Ratio: {projection['expected_loss_ratio']:.1%}")
    print(f"Expected Claims:     ${projection['expected_claims']:,.0f}")
    print(f"Commission Revenue:  ${projection['commission_revenue']:,.0f}")
    print(f"Profitable:          {'✅ YES' if projection['profitable'] else '❌ NO'}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    demo_loss_ratio_model()
