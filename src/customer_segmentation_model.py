#!/usr/bin/env python3
"""
Customer Segmentation & LTV Stratification Model
Segment customers by profitability and lifetime value
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Literal, Tuple


@dataclass
class CustomerSegment:
    """Define customer segment characteristics"""
    name: str
    min_products: int
    min_annual_premium: float
    avg_ltv: float
    avg_retention: float
    avg_products: float
    claims_frequency: float  # Claims per policy per year
    recommended_cac: float   # Target customer acquisition cost
    service_tier: Literal["white_glove", "standard", "automated"]
    value_drivers: List[str]


@dataclass
class CustomerSegmentationModel:
    """
    Customer segmentation by profitability

    Key Insight: Top 40% of customers = 83% of profit
    Not all customers are created equal!
    """

    # Segment definitions
    segments: Dict[str, CustomerSegment] = field(default_factory=lambda: {
        "elite": CustomerSegment(
            name="Elite",
            min_products=3,
            min_annual_premium=3000,
            avg_ltv=18000,
            avg_retention=0.97,
            avg_products=3.8,
            claims_frequency=0.12,  # Low claims
            recommended_cac=1200,   # Can afford higher CAC
            service_tier="white_glove",
            value_drivers=["bundling", "low_claims", "high_premium", "longevity"]
        ),
        "premium": CustomerSegment(
            name="Premium",
            min_products=2,
            min_annual_premium=2000,
            avg_ltv=9000,
            avg_retention=0.91,
            avg_products=2.2,
            claims_frequency=0.18,
            recommended_cac=700,
            service_tier="standard",
            value_drivers=["bundling", "acceptable_claims", "moderate_premium"]
        ),
        "standard": CustomerSegment(
            name="Standard",
            min_products=1,
            min_annual_premium=800,
            avg_ltv=4500,
            avg_retention=0.72,
            avg_products=1.1,
            claims_frequency=0.22,
            recommended_cac=400,
            service_tier="standard",
            value_drivers=["volume", "cross_sell_potential"]
        ),
        "low_value": CustomerSegment(
            name="Low-Value",
            min_products=1,
            min_annual_premium=0,
            avg_ltv=1800,
            avg_retention=0.65,
            avg_products=1.0,
            claims_frequency=0.28,  # Higher claims
            recommended_cac=200,    # Very low CAC or avoid
            service_tier="automated",
            value_drivers=[]  # No strong value drivers
        )
    })

    # Commission and cost assumptions
    avg_commission_rate: float = 0.07
    servicing_cost_per_policy_per_year: float = 50

    def classify_customer(self,
                         product_count: int,
                         annual_premium: float,
                         claims_last_5_years: Optional[int] = None) -> str:
        """
        Classify customer into segment

        Args:
            product_count: Number of products customer has
            annual_premium: Total annual premium
            claims_last_5_years: Claims filed in last 5 years (optional)

        Returns:
            Segment name
        """
        # Elite tier
        if (product_count >= self.segments["elite"].min_products and
            annual_premium >= self.segments["elite"].min_annual_premium):
            return "elite"

        # Premium tier
        elif (product_count >= self.segments["premium"].min_products and
              annual_premium >= self.segments["premium"].min_annual_premium):
            return "premium"

        # Standard tier
        elif annual_premium >= self.segments["standard"].min_annual_premium:
            return "standard"

        # Low-value tier
        else:
            return "low_value"

    def calculate_segment_ltv(self,
                             segment_name: str,
                             actual_premium: float,
                             actual_product_count: int,
                             claims_history: Optional[List] = None) -> float:
        """
        Calculate LTV for a specific customer based on their segment

        Args:
            segment_name: Customer segment
            actual_premium: Customer's actual annual premium
            actual_product_count: Actual products
            claims_history: Claims history (optional adjustment)

        Returns:
            Customer-specific LTV
        """
        segment = self.segments[segment_name]

        # Expected years as customer (geometric series based on retention)
        retention = segment.avg_retention
        expected_years = -1 / np.log(retention) if retention < 1.0 else 20

        # Annual commission revenue
        annual_commission = actual_premium * self.avg_commission_rate

        # Lifetime commission revenue
        lifetime_revenue = annual_commission * expected_years

        # Lifetime servicing cost
        servicing_cost = (self.servicing_cost_per_policy_per_year *
                         actual_product_count *
                         expected_years)

        # Claims cost impact (optional - for more sophisticated model)
        claims_cost_impact = 0
        if claims_history and len(claims_history) > segment.avg_products * segment.claims_frequency * 5:
            # Customer has higher claims than expected
            claims_cost_impact = 500  # Penalty for high claims

        # Calculate LTV
        ltv = lifetime_revenue - servicing_cost - claims_cost_impact

        return max(0, ltv)

    def analyze_customer_portfolio(self,
                                  customers: List[Dict]) -> Dict:
        """
        Analyze entire customer portfolio by segment

        Args:
            customers: List of customer dictionaries with:
                {
                    "customer_id": str,
                    "product_count": int,
                    "annual_premium": float,
                    "claims_history": List (optional)
                }

        Returns:
            Portfolio segmentation analysis
        """
        segments_summary = {
            "elite": [],
            "premium": [],
            "standard": [],
            "low_value": []
        }

        for customer in customers:
            segment = self.classify_customer(
                customer["product_count"],
                customer["annual_premium"],
                customer.get("claims_history")
            )

            ltv = self.calculate_segment_ltv(
                segment,
                customer["annual_premium"],
                customer["product_count"],
                customer.get("claims_history")
            )

            segments_summary[segment].append({
                "customer_id": customer.get("customer_id"),
                "ltv": ltv,
                "premium": customer["annual_premium"],
                "products": customer["product_count"]
            })

        # Calculate segment statistics
        results = {}
        total_customers = len(customers)
        total_ltv = 0
        total_premium = 0

        for segment_name, segment_customers in segments_summary.items():
            count = len(segment_customers)
            if count > 0:
                segment_ltv = sum(c["ltv"] for c in segment_customers)
                segment_premium = sum(c["premium"] for c in segment_customers)
                total_ltv += segment_ltv
                total_premium += segment_premium

                results[segment_name] = {
                    "count": count,
                    "percentage_of_book": (count / total_customers * 100) if total_customers > 0 else 0,
                    "total_ltv": segment_ltv,
                    "total_premium": segment_premium,
                    "avg_ltv": segment_ltv / count,
                    "avg_premium": segment_premium / count,
                    "recommended_cac": self.segments[segment_name].recommended_cac,
                    "service_tier": self.segments[segment_name].service_tier
                }
            else:
                results[segment_name] = {
                    "count": 0,
                    "percentage_of_book": 0,
                    "total_ltv": 0,
                    "total_premium": 0,
                    "avg_ltv": 0,
                    "avg_premium": 0,
                    "recommended_cac": self.segments[segment_name].recommended_cac,
                    "service_tier": "standard"
                }

        # Calculate contribution to profit
        for segment_name in results:
            if total_ltv > 0:
                results[segment_name]["ltv_contribution_pct"] = (
                    results[segment_name]["total_ltv"] / total_ltv * 100
                )
            else:
                results[segment_name]["ltv_contribution_pct"] = 0

        # Summary statistics
        summary = {
            "total_customers": total_customers,
            "total_ltv": total_ltv,
            "total_premium": total_premium,
            "avg_ltv": total_ltv / total_customers if total_customers > 0 else 0,
            "avg_premium": total_premium / total_customers if total_customers > 0 else 0,
            "segments": results,
            "key_insights": self._generate_insights(results, total_customers)
        }

        return summary

    def _generate_insights(self, segment_results: Dict, total_customers: int) -> List[str]:
        """Generate strategic insights from segmentation"""

        insights = []

        # Elite + Premium concentration
        elite_premium_count = (segment_results["elite"]["count"] +
                              segment_results["premium"]["count"])
        elite_premium_pct = (elite_premium_count / total_customers * 100) if total_customers > 0 else 0

        elite_premium_ltv = (segment_results["elite"]["ltv_contribution_pct"] +
                            segment_results["premium"]["ltv_contribution_pct"])

        insights.append(
            f"Top tier (Elite + Premium) = {elite_premium_pct:.0f}% of customers "
            f"but {elite_premium_ltv:.0f}% of lifetime value"
        )

        # Low-value warning
        low_value_pct = segment_results["low_value"]["percentage_of_book"]
        if low_value_pct > 20:
            insights.append(
                f"⚠️ {low_value_pct:.0f}% of book is low-value customers - "
                f"review acquisition channels"
            )

        # Upgrade opportunity
        standard_count = segment_results["standard"]["count"]
        if standard_count > 0:
            upgrade_revenue_opportunity = standard_count * (
                self.segments["premium"].avg_ltv - self.segments["standard"].avg_ltv
            )
            insights.append(
                f"💰 Upgrading Standard → Premium = ${upgrade_revenue_opportunity:,.0f} "
                f"LTV opportunity (${upgrade_revenue_opportunity/standard_count:,.0f} per customer)"
            )

        return insights

    def recommend_marketing_allocation(self,
                                      total_marketing_budget: float,
                                      current_segment_distribution: Dict) -> Dict:
        """
        Recommend marketing budget allocation by target segment

        Args:
            total_marketing_budget: Total marketing budget
            current_segment_distribution: Current customer distribution by segment

        Returns:
            Recommended allocation
        """
        # Target distribution (optimal)
        target_distribution = {
            "elite": 0.15,      # 15% of new customers
            "premium": 0.35,    # 35% of new customers
            "standard": 0.40,   # 40% of new customers
            "low_value": 0.10   # 10% of new customers (minimize)
        }

        # Calculate budget allocation based on recommended CAC
        total_weighted_cac = sum(
            target_distribution[seg] * self.segments[seg].recommended_cac
            for seg in target_distribution
        )

        allocation = {}
        for segment_name, target_pct in target_distribution.items():
            segment = self.segments[segment_name]

            # Budget proportional to (target % × CAC)
            budget = (target_pct * segment.recommended_cac / total_weighted_cac) * total_marketing_budget

            # Expected customers from this budget
            expected_customers = budget / segment.recommended_cac if segment.recommended_cac > 0 else 0

            # Expected LTV return
            expected_ltv_return = expected_customers * segment.avg_ltv

            # ROI
            roi = ((expected_ltv_return - budget) / budget * 100) if budget > 0 else 0

            allocation[segment_name] = {
                "target_percentage": target_pct * 100,
                "recommended_budget": budget,
                "recommended_cac": segment.recommended_cac,
                "expected_customers": expected_customers,
                "expected_ltv_return": expected_ltv_return,
                "roi_percent": roi
            }

        return {
            "total_budget": total_marketing_budget,
            "allocations": allocation,
            "total_expected_customers": sum(a["expected_customers"] for a in allocation.values()),
            "total_expected_ltv": sum(a["expected_ltv_return"] for a in allocation.values()),
            "blended_roi": ((sum(a["expected_ltv_return"] for a in allocation.values()) - total_marketing_budget) /
                           total_marketing_budget * 100) if total_marketing_budget > 0 else 0
        }


# ============================================================================
# EXAMPLE USAGE & TESTING
# ============================================================================

def demo_customer_segmentation():
    """Demonstrate customer segmentation"""

    print("=" * 80)
    print("CUSTOMER SEGMENTATION & LTV STRATIFICATION DEMO")
    print("=" * 80)

    # Initialize model
    model = CustomerSegmentationModel()

    # Example 1: Classify individual customers
    print("\n👥 CUSTOMER CLASSIFICATION")
    print("-" * 80)

    test_customers = [
        {"product_count": 4, "annual_premium": 4500, "label": "High-value bundled"},
        {"product_count": 2, "annual_premium": 2800, "label": "Good bundled"},
        {"product_count": 1, "annual_premium": 1200, "label": "Single auto"},
        {"product_count": 1, "annual_premium": 600, "label": "Low premium single"}
    ]

    for cust in test_customers:
        segment = model.classify_customer(cust["product_count"], cust["annual_premium"])
        ltv = model.calculate_segment_ltv(segment, cust["annual_premium"], cust["product_count"])

        print(f"\n{cust['label']}:")
        print(f"  Products: {cust['product_count']}, Premium: ${cust['annual_premium']:,.0f}")
        print(f"  Segment: {segment.upper()}")
        print(f"  LTV: ${ltv:,.0f}")
        print(f"  Recommended CAC: ${model.segments[segment].recommended_cac:,.0f}")

    # Example 2: Portfolio analysis
    print("\n\n📊 PORTFOLIO ANALYSIS")
    print("-" * 80)

    # Simulate customer portfolio
    np.random.seed(42)
    portfolio = []

    # Generate realistic distribution
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

        portfolio.append({
            "customer_id": f"CUST{i:04d}",
            "product_count": products,
            "annual_premium": premium
        })

    analysis = model.analyze_customer_portfolio(portfolio)

    print(f"Total Customers:     {analysis['total_customers']}")
    print(f"Total LTV:           ${analysis['total_ltv']:,.0f}")
    print(f"Average LTV:         ${analysis['avg_ltv']:,.0f}")
    print(f"Total Premium:       ${analysis['total_premium']:,.0f}")

    print(f"\n{'Segment':<12} {'Count':<8} {'% of Book':<12} {'Avg LTV':<12} {'% of LTV':<12} {'CAC Target'}")
    print("-" * 80)
    for seg_name in ["elite", "premium", "standard", "low_value"]:
        seg = analysis['segments'][seg_name]
        print(f"{seg_name.title():<12} "
              f"{seg['count']:<8} "
              f"{seg['percentage_of_book']:>6.1f}%      "
              f"${seg['avg_ltv']:>9,.0f}   "
              f"{seg['ltv_contribution_pct']:>6.1f}%      "
              f"${seg['recommended_cac']:>6,.0f}")

    print("\n📈 KEY INSIGHTS:")
    for insight in analysis['key_insights']:
        print(f"  • {insight}")

    # Example 3: Marketing allocation
    print("\n\n💰 RECOMMENDED MARKETING ALLOCATION")
    print("-" * 80)

    marketing_plan = model.recommend_marketing_allocation(
        total_marketing_budget=50000,  # $50k monthly budget
        current_segment_distribution=analysis['segments']
    )

    print(f"Total Budget:        ${marketing_plan['total_budget']:,.0f}")
    print(f"Expected Customers:  {marketing_plan['total_expected_customers']:.0f}")
    print(f"Expected LTV Return: ${marketing_plan['total_expected_ltv']:,.0f}")
    print(f"Blended ROI:         {marketing_plan['blended_roi']:.0f}%")

    print(f"\n{'Segment':<12} {'Target %':<10} {'Budget':<12} {'CAC':<8} {'Expected':<10} {'ROI'}")
    print("-" * 80)
    for seg_name in ["elite", "premium", "standard", "low_value"]:
        alloc = marketing_plan['allocations'][seg_name]
        print(f"{seg_name.title():<12} "
              f"{alloc['target_percentage']:>6.0f}%     "
              f"${alloc['recommended_budget']:>9,.0f}  "
              f"${alloc['recommended_cac']:>6,.0f}  "
              f"{alloc['expected_customers']:>7.0f}    "
              f"{alloc['roi_percent']:>6.0f}%")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    demo_customer_segmentation()
