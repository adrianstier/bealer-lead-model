#!/usr/bin/env python3
"""
Rate Environment & Price Elasticity Model
Models impact of premium rate increases on retention and revenue
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Literal, Tuple


@dataclass
class RateEnvironmentModel:
    """
    Model premium rate environment dynamics

    Key Economics:
    - Insurance premiums are inflating 8-12% annually (2024-2025)
    - Rate increases cause additional churn (price elasticity)
    - Revenue growth = Policy Growth + Rate Growth - Rate-Driven Churn
    """

    # Rate trend assumptions
    baseline_annual_rate_increase: float = 0.08  # 8% baseline
    auto_rate_increase: float = 0.10  # Auto seeing 10% increases
    home_rate_increase: float = 0.12  # Home seeing 12% (CAT-driven)
    umbrella_rate_increase: float = 0.05  # Umbrella more stable
    life_rate_increase: float = 0.03  # Life very stable

    # Price elasticity coefficients
    # Elasticity = % change in retention / % change in price
    # -0.30 = 10% price increase causes 3% additional churn
    retention_elasticity: float = -0.30
    quote_elasticity: float = -0.45  # Quotes decline faster than retention

    # Competitive environment
    market_competitiveness: Literal["soft", "moderate", "hard"] = "hard"

    # Rate shock thresholds
    moderate_increase_threshold: float = 0.10  # 10%+ = noticeable
    severe_increase_threshold: float = 0.15   # 15%+ = severe sticker shock

    def calculate_rate_driven_churn(self,
                                    rate_increase: float,
                                    base_retention: float) -> Dict:
        """
        Calculate additional churn from rate increases

        Args:
            rate_increase: Percentage rate increase (e.g., 0.10 for 10%)
            base_retention: Base retention rate without rate increase

        Returns:
            Dictionary with adjusted retention and churn breakdown
        """
        # Additional churn from price elasticity
        # Formula: Additional churn = (rate_increase / 0.10) * |elasticity|
        # Example: 10% increase with -0.30 elasticity = 3% additional churn
        additional_churn = (rate_increase / 0.10) * abs(self.retention_elasticity) / 100

        # Adjust for market competitiveness
        competitiveness_multiplier = {
            "soft": 0.7,      # Less competition = less rate shopping
            "moderate": 1.0,  # Normal
            "hard": 1.3       # More competition = more rate sensitivity
        }
        multiplier = competitiveness_multiplier[self.market_competitiveness]
        additional_churn = additional_churn * multiplier

        # Calculate adjusted retention
        adjusted_retention = base_retention - additional_churn

        # Floor retention at realistic minimum (customers have inertia)
        adjusted_retention = max(0.60, adjusted_retention)

        # Categorize rate increase severity
        if rate_increase >= self.severe_increase_threshold:
            severity = "severe"
            customer_reaction = "High shopping activity, significant losses expected"
        elif rate_increase >= self.moderate_increase_threshold:
            severity = "moderate"
            customer_reaction = "Moderate shopping, proactive communication needed"
        else:
            severity = "mild"
            customer_reaction = "Minimal impact, normal retention expected"

        return {
            "rate_increase_pct": rate_increase * 100,
            "base_retention": base_retention,
            "additional_churn": additional_churn,
            "adjusted_retention": adjusted_retention,
            "retention_decline_pct": (base_retention - adjusted_retention) * 100,
            "severity": severity,
            "customer_reaction": customer_reaction,
            "elasticity_used": self.retention_elasticity,
            "market_environment": self.market_competitiveness
        }

    def decompose_revenue_growth(self,
                                policies_year1: int,
                                policies_year2: int,
                                premium_year1: float,
                                premium_year2: float) -> Dict:
        """
        Decompose revenue growth into organic (policy count) vs rate components

        This is critical for understanding TRUE business growth vs inflation

        Args:
            policies_year1: Policy count year 1
            policies_year2: Policy count year 2
            premium_year1: Average premium year 1
            premium_year2: Average premium year 2

        Returns:
            Growth decomposition analysis
        """
        # Revenue calculations
        revenue_y1 = policies_year1 * premium_year1
        revenue_y2 = policies_year2 * premium_year2

        # Growth rates
        total_revenue_growth = (revenue_y2 / revenue_y1 - 1) if revenue_y1 > 0 else 0
        policy_growth = (policies_year2 / policies_year1 - 1) if policies_year1 > 0 else 0
        rate_growth = (premium_year2 / premium_year1 - 1) if premium_year1 > 0 else 0

        # Contribution analysis
        # Revenue growth ≈ policy growth + rate growth (approximate, not exact due to compounding)
        organic_contribution = policy_growth
        rate_contribution = rate_growth

        # What % of growth came from organic vs rate?
        total_growth_absolute = policy_growth + rate_growth
        if total_growth_absolute != 0:
            organic_percentage = policy_growth / total_growth_absolute
            rate_percentage = rate_growth / total_growth_absolute
        else:
            organic_percentage = 0
            rate_percentage = 0

        return {
            "year_1": {
                "policies": policies_year1,
                "avg_premium": premium_year1,
                "total_revenue": revenue_y1
            },
            "year_2": {
                "policies": policies_year2,
                "avg_premium": premium_year2,
                "total_revenue": revenue_y2
            },
            "growth_rates": {
                "total_revenue_growth": total_revenue_growth,
                "policy_count_growth": policy_growth,
                "premium_rate_growth": rate_growth
            },
            "contribution": {
                "organic_contribution_pct": organic_contribution * 100,
                "rate_contribution_pct": rate_contribution * 100,
                "organic_percentage_of_growth": organic_percentage * 100,
                "rate_percentage_of_growth": rate_percentage * 100
            },
            "interpretation": self._interpret_growth_decomposition(
                organic_percentage, total_revenue_growth
            )
        }

    def _interpret_growth_decomposition(self,
                                       organic_pct: float,
                                       total_growth: float) -> str:
        """Generate interpretation of growth decomposition"""

        if total_growth < 0:
            return "DECLINING: Business is shrinking despite rate increases"
        elif organic_pct < 0:
            return "RATE-DRIVEN: Growth entirely from rate, policy count declining"
        elif organic_pct < 0.3:
            return "MOSTLY RATE: <30% organic, heavily dependent on rate increases"
        elif organic_pct < 0.6:
            return "BALANCED: Mix of organic and rate-driven growth"
        elif organic_pct < 0.9:
            return "MOSTLY ORGANIC: Healthy policy count growth, some rate tailwind"
        else:
            return "FULLY ORGANIC: Growth driven by policy count, minimal rate impact"

    def project_retention_with_rate_change(self,
                                          base_retention: float,
                                          planned_rate_increase: float,
                                          product: str = "auto") -> Dict:
        """
        Project retention given a planned rate increase

        Args:
            base_retention: Current retention rate
            planned_rate_increase: Planned rate increase (0.10 = 10%)
            product: Product line

        Returns:
            Retention projection with scenarios
        """
        # Get product-specific rate increase if not provided
        product_rates = {
            "auto": self.auto_rate_increase,
            "home": self.home_rate_increase,
            "umbrella": self.umbrella_rate_increase,
            "life": self.life_rate_increase
        }

        if planned_rate_increase is None:
            planned_rate_increase = product_rates.get(product, self.baseline_annual_rate_increase)

        # Calculate impact
        impact = self.calculate_rate_driven_churn(planned_rate_increase, base_retention)

        # Scenario analysis
        scenarios = {
            "no_rate_increase": {
                "rate_increase": 0.0,
                "retention": base_retention,
                "policies_retained_per_1000": base_retention * 1000
            },
            "planned_increase": {
                "rate_increase": planned_rate_increase,
                "retention": impact["adjusted_retention"],
                "policies_retained_per_1000": impact["adjusted_retention"] * 1000
            },
            "severe_increase": {
                "rate_increase": self.severe_increase_threshold,
                "retention": self.calculate_rate_driven_churn(
                    self.severe_increase_threshold, base_retention
                )["adjusted_retention"],
                "policies_retained_per_1000": self.calculate_rate_driven_churn(
                    self.severe_increase_threshold, base_retention
                )["adjusted_retention"] * 1000
            }
        }

        return {
            "product": product,
            "base_retention": base_retention,
            "planned_rate_increase": planned_rate_increase,
            "projected_retention": impact["adjusted_retention"],
            "policies_lost_per_1000": (base_retention - impact["adjusted_retention"]) * 1000,
            "severity": impact["severity"],
            "scenarios": scenarios,
            "recommendation": self._generate_rate_recommendation(impact)
        }

    def _generate_rate_recommendation(self, impact: Dict) -> str:
        """Generate recommendation based on rate impact"""

        severity = impact["severity"]
        retention_decline = impact["retention_decline_pct"]

        if severity == "severe":
            return (f"⚠️ HIGH RISK: {retention_decline:.1f}% additional churn expected. "
                   "Consider: (1) Phased rate increases, (2) Proactive customer communication, "
                   "(3) Retention offers for high-value customers")
        elif severity == "moderate":
            return (f"⚠️ MODERATE RISK: {retention_decline:.1f}% additional churn. "
                   "Recommend: (1) Clear renewal communication, (2) Bundle incentives, "
                   "(3) Monitor shopping activity")
        else:
            return (f"✅ LOW RISK: {retention_decline:.1f}% minimal impact. "
                   "Standard renewal process appropriate.")

    def calculate_ltv_with_inflation(self,
                                    base_premium: float,
                                    base_retention: float,
                                    years: int = 10,
                                    annual_rate_increase: Optional[float] = None) -> Dict:
        """
        Calculate LTV accounting for premium inflation over time

        Traditional LTV assumes static premiums - this is wrong in insurance!
        Premiums inflate 8-12% annually, increasing LTV significantly.

        Args:
            base_premium: Current premium
            base_retention: Retention rate
            years: Years to project
            annual_rate_increase: Annual premium inflation

        Returns:
            LTV calculation with inflation
        """
        if annual_rate_increase is None:
            annual_rate_increase = self.baseline_annual_rate_increase

        # Year-by-year projection
        ltv_without_inflation = 0
        ltv_with_inflation = 0
        commission_rate = 0.07  # 7% avg

        cumulative_retention = 1.0
        current_premium = base_premium

        yearly_breakdown = []

        for year in range(1, years + 1):
            # Retention compounds
            cumulative_retention *= base_retention

            # Premium inflates
            if year > 1:
                current_premium *= (1 + annual_rate_increase)

            # Commission this year (only if customer retained)
            commission_without_inflation = base_premium * commission_rate * cumulative_retention
            commission_with_inflation = current_premium * commission_rate * cumulative_retention

            ltv_without_inflation += commission_without_inflation
            ltv_with_inflation += commission_with_inflation

            yearly_breakdown.append({
                "year": year,
                "retention_probability": cumulative_retention,
                "premium_without_inflation": base_premium,
                "premium_with_inflation": current_premium,
                "commission_without_inflation": commission_without_inflation,
                "commission_with_inflation": commission_with_inflation
            })

        # LTV multiplier from inflation
        ltv_multiplier = ltv_with_inflation / ltv_without_inflation if ltv_without_inflation > 0 else 1.0

        return {
            "base_premium": base_premium,
            "annual_rate_increase": annual_rate_increase,
            "years_projected": years,
            "ltv_without_inflation": ltv_without_inflation,
            "ltv_with_inflation": ltv_with_inflation,
            "inflation_lift": ltv_with_inflation - ltv_without_inflation,
            "ltv_multiplier": ltv_multiplier,
            "interpretation": (f"Premium inflation adds {(ltv_multiplier - 1) * 100:.0f}% "
                             f"to customer lifetime value")
        }


# ============================================================================
# EXAMPLE USAGE & TESTING
# ============================================================================

def demo_rate_environment_model():
    """Demonstrate rate environment modeling"""

    print("=" * 80)
    print("RATE ENVIRONMENT & PRICE ELASTICITY MODEL DEMO")
    print("=" * 80)

    # Initialize model
    model = RateEnvironmentModel(
        market_competitiveness="hard"  # Santa Barbara is competitive
    )

    # Example 1: Calculate rate-driven churn
    print("\n📉 RATE-DRIVEN CHURN ANALYSIS")
    print("-" * 80)

    result = model.calculate_rate_driven_churn(
        rate_increase=0.12,  # 12% rate increase
        base_retention=0.85  # 85% base retention
    )

    print(f"Rate Increase:       {result['rate_increase_pct']:.1f}%")
    print(f"Base Retention:      {result['base_retention']:.1%}")
    print(f"Additional Churn:    {result['additional_churn']:.1%}")
    print(f"Adjusted Retention:  {result['adjusted_retention']:.1%}")
    print(f"Retention Decline:   {result['retention_decline_pct']:.1f}%")
    print(f"Severity:            {result['severity'].upper()}")
    print(f"Customer Reaction:   {result['customer_reaction']}")

    # Example 2: Revenue growth decomposition
    print("\n\n📊 REVENUE GROWTH DECOMPOSITION")
    print("-" * 80)

    decomp = model.decompose_revenue_growth(
        policies_year1=1000,
        policies_year2=1050,  # 5% policy growth
        premium_year1=1500,
        premium_year2=1650    # 10% rate increase
    )

    print(f"Year 1 Revenue:      ${decomp['year_1']['total_revenue']:,.0f}")
    print(f"Year 2 Revenue:      ${decomp['year_2']['total_revenue']:,.0f}")
    print(f"Total Growth:        {decomp['growth_rates']['total_revenue_growth']:.1%}")
    print(f"\nGrowth Breakdown:")
    print(f"  Policy Count:      {decomp['growth_rates']['policy_count_growth']:.1%}")
    print(f"  Premium Rate:      {decomp['growth_rates']['premium_rate_growth']:.1%}")
    print(f"\nContribution:")
    print(f"  Organic:           {decomp['contribution']['organic_percentage_of_growth']:.0f}%")
    print(f"  Rate-Driven:       {decomp['contribution']['rate_percentage_of_growth']:.0f}%")
    print(f"\nInterpretation: {decomp['interpretation']}")

    # Example 3: Retention projection with scenarios
    print("\n\n🔮 RETENTION PROJECTION (Auto Product)")
    print("-" * 80)

    projection = model.project_retention_with_rate_change(
        base_retention=0.85,
        planned_rate_increase=0.10,  # 10% planned increase
        product="auto"
    )

    print(f"Product:             {projection['product'].upper()}")
    print(f"Base Retention:      {projection['base_retention']:.1%}")
    print(f"Planned Rate Inc:    {projection['planned_rate_increase']:.1%}")
    print(f"Projected Retention: {projection['projected_retention']:.1%}")
    print(f"Policies Lost/1000:  {projection['policies_lost_per_1000']:.0f}")
    print(f"\nScenarios:")
    for scenario_name, scenario in projection['scenarios'].items():
        print(f"  {scenario_name.replace('_', ' ').title()}:")
        print(f"    Rate: {scenario['rate_increase']:.1%}, "
              f"Retention: {scenario['retention']:.1%}, "
              f"Lost/1000: {1000 - scenario['policies_retained_per_1000']:.0f}")
    print(f"\n{projection['recommendation']}")

    # Example 4: LTV with inflation
    print("\n\n💰 LIFETIME VALUE WITH PREMIUM INFLATION")
    print("-" * 80)

    ltv = model.calculate_ltv_with_inflation(
        base_premium=1500,
        base_retention=0.85,
        years=10,
        annual_rate_increase=0.08  # 8% annual inflation
    )

    print(f"Base Premium:        ${ltv['base_premium']:,.0f}")
    print(f"Annual Rate Inc:     {ltv['annual_rate_increase']:.1%}")
    print(f"Years Projected:     {ltv['years_projected']}")
    print(f"\nLTV Comparison:")
    print(f"  Without Inflation: ${ltv['ltv_without_inflation']:,.0f}")
    print(f"  With Inflation:    ${ltv['ltv_with_inflation']:,.0f}")
    print(f"  Inflation Lift:    ${ltv['inflation_lift']:,.0f}")
    print(f"  LTV Multiplier:    {ltv['ltv_multiplier']:.2f}x")
    print(f"\n{ltv['interpretation']}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    demo_rate_environment_model()
