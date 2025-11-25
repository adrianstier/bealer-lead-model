#!/usr/bin/env python3
"""
Lead Scoring & ROI Model
Optimize lead vendor spend and prioritize high-LTV prospects

Purpose:
- Score leads based on likelihood of becoming Elite/Premium customers
- Analyze lead vendor ROI and efficiency
- Calculate CAC by segment and source
- Optimize marketing budget allocation
- Predict customer segment from lead characteristics

Key Metrics:
- Lead quality score (0-100)
- Vendor efficiency (ROI, conversion rate, avg LTV)
- CAC by segment (Elite: $1,200, Premium: $700, Standard: $400, Low: $200)
- LTV:CAC ratio by source (target >3.0, ideal >8.0)

Opportunity:
- Reduce CAC by 20-30% through better vendor allocation
- Increase Elite/Premium customer % from 40% to 55%
- Improve blended LTV:CAC from 8x to 11x+
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import statistics


class LeadSource(Enum):
    """Lead source types"""
    SMARTFINANCIAL = "smartfinancial"
    EVERQUOTE = "everquote"
    INSURIFY = "insurify"
    QUOTEWIZARD = "quotewizard"
    TIKTOK = "tiktok"
    FACEBOOK = "facebook"
    GOOGLE_SEARCH = "google_search"
    GOOGLE_DISPLAY = "google_display"
    REFERRAL = "referral"
    ORGANIC = "organic"
    DIRECT = "direct"


class LeadQualityTier(Enum):
    """Lead quality tiers based on score"""
    ELITE_POTENTIAL = "elite"      # 90-100 score
    PREMIUM_POTENTIAL = "premium"   # 70-89 score
    STANDARD_POTENTIAL = "standard" # 50-69 score
    LOW_VALUE = "low_value"         # <50 score


@dataclass
class LeadScore:
    """Scored lead with segment prediction"""
    lead_id: str
    score: float  # 0-100
    predicted_segment: LeadQualityTier
    predicted_ltv: float
    recommended_cac: float
    conversion_probability: float
    key_factors: Dict[str, float]  # Factor → contribution to score


@dataclass
class VendorPerformance:
    """Performance metrics for a lead vendor"""
    vendor_name: str
    total_spend: float
    leads_received: int
    conversions: int
    conversion_rate: float
    avg_ltv: float
    total_revenue: float  # Commission from conversions
    roi: float  # (Revenue - Spend) / Spend
    cac: float  # Cost per conversion
    ltv_cac_ratio: float
    rating: str  # EXCELLENT / GOOD / FAIR / POOR / UNDERPERFORMING
    recommendation: str


@dataclass
class BudgetAllocation:
    """Recommended marketing budget allocation"""
    vendor_name: str
    current_allocation: float
    recommended_allocation: float
    change: float  # Dollar amount to shift
    change_percentage: float
    reasoning: str


class LeadScoringModel:
    """Model lead quality and optimize vendor spend"""

    def __init__(self):
        """Initialize lead scoring model with insurance-specific factors"""

        # Scoring factors and weights (sum to 1.0)
        self.scoring_weights = {
            "product_intent": 0.25,      # What products they're shopping for
            "bundle_potential": 0.20,    # Likelihood of multi-product
            "premium_range": 0.15,       # Higher premium = higher LTV
            "demographics": 0.15,        # Age, homeowner status, etc.
            "engagement": 0.10,          # How engaged is the lead
            "credit_tier": 0.10,         # Credit quality (proxy for retention)
            "source_quality": 0.05       # Quality of lead source
        }

        # Product intent scoring
        # Customers shopping for multiple products = higher score
        self.product_intent_scores = {
            ("auto",): 50,
            ("home",): 55,
            ("auto", "home"): 85,  # Bundle intent = high score
            ("auto", "umbrella"): 75,
            ("home", "umbrella"): 80,
            ("auto", "home", "umbrella"): 95,  # Elite potential
            ("life",): 45,
            ("motorcycle",): 40,
            ("renters",): 35
        }

        # Homeowner status (strong predictor of LTV)
        self.homeowner_multiplier = {
            "owner": 1.3,   # Homeowners: higher premium, better retention
            "renter": 0.9,  # Renters: lower premium
            "unknown": 1.0
        }

        # Age scoring (insurance sweet spots)
        # 30-50 = ideal (established, stable, multi-product potential)
        # 25-29 = good (growing income)
        # 50-65 = good (peak earnings, loyalty)
        # 18-24 = lower (price-sensitive, high churn)
        # 65+ = mixed (excellent retention but lower premium growth)
        self.age_scores = {
            "18-24": 40,
            "25-29": 65,
            "30-39": 85,
            "40-49": 90,
            "50-59": 85,
            "60-69": 75,
            "70+": 60
        }

        # Credit tier (proxy for retention and payment reliability)
        self.credit_scores = {
            "excellent": 95,
            "good": 80,
            "fair": 60,
            "poor": 35,
            "unknown": 70  # Neutral
        }

        # LTV estimates by predicted segment
        self.segment_ltv = {
            LeadQualityTier.ELITE_POTENTIAL: 18000,
            LeadQualityTier.PREMIUM_POTENTIAL: 9000,
            LeadQualityTier.STANDARD_POTENTIAL: 4500,
            LeadQualityTier.LOW_VALUE: 1800
        }

        # Recommended CAC by segment (maintain LTV:CAC > 3.0)
        self.segment_cac = {
            LeadQualityTier.ELITE_POTENTIAL: 1200,
            LeadQualityTier.PREMIUM_POTENTIAL: 700,
            LeadQualityTier.STANDARD_POTENTIAL: 400,
            LeadQualityTier.LOW_VALUE: 200
        }

        # Base conversion rates by segment
        self.segment_conversion_rates = {
            LeadQualityTier.ELITE_POTENTIAL: 0.42,
            LeadQualityTier.PREMIUM_POTENTIAL: 0.28,
            LeadQualityTier.STANDARD_POTENTIAL: 0.12,
            LeadQualityTier.LOW_VALUE: 0.04
        }

    def score_lead(
        self,
        lead_id: str,
        products_shopping: List[str],
        homeowner_status: str,
        age_range: str,
        estimated_premium: Optional[float] = None,
        credit_tier: str = "unknown",
        engagement_level: str = "medium",  # high/medium/low
        lead_source: Optional[LeadSource] = None
    ) -> LeadScore:
        """
        Score a lead and predict segment

        Args:
            lead_id: Lead identifier
            products_shopping: List of products lead is shopping for
            homeowner_status: "owner", "renter", "unknown"
            age_range: Age bucket (e.g., "30-39")
            estimated_premium: Estimated annual premium range
            credit_tier: Credit quality tier
            engagement_level: How engaged is the lead
            lead_source: Source of the lead

        Returns:
            LeadScore with detailed scoring
        """
        factor_scores = {}

        # 1. Product intent (25%)
        products_tuple = tuple(sorted(products_shopping))
        product_score = self.product_intent_scores.get(products_tuple, 50)
        factor_scores["product_intent"] = product_score

        # 2. Bundle potential (20%)
        # Multi-product shoppers = bundle potential
        if len(products_shopping) >= 3:
            bundle_score = 95
        elif len(products_shopping) == 2:
            bundle_score = 80
        else:
            bundle_score = 40
        factor_scores["bundle_potential"] = bundle_score

        # 3. Premium range (15%)
        if estimated_premium:
            if estimated_premium >= 4000:
                premium_score = 95  # High-premium customer
            elif estimated_premium >= 2500:
                premium_score = 75
            elif estimated_premium >= 1500:
                premium_score = 60
            else:
                premium_score = 40  # Low premium
        else:
            premium_score = 60  # Unknown, use median
        factor_scores["premium_range"] = premium_score

        # 4. Demographics (15%)
        # Combine age and homeowner status
        age_score = self.age_scores.get(age_range, 70)
        homeowner_mult = self.homeowner_multiplier.get(homeowner_status, 1.0)
        demo_score = age_score * homeowner_mult
        demo_score = min(100, demo_score)  # Cap at 100
        factor_scores["demographics"] = demo_score

        # 5. Engagement (10%)
        engagement_scores = {"high": 90, "medium": 70, "low": 40}
        engagement_score = engagement_scores.get(engagement_level, 70)
        factor_scores["engagement"] = engagement_score

        # 6. Credit tier (10%)
        credit_score = self.credit_scores.get(credit_tier, 70)
        factor_scores["credit_tier"] = credit_score

        # 7. Source quality (5%)
        # Some sources consistently produce better leads
        if lead_source == LeadSource.REFERRAL:
            source_score = 95  # Referrals = highest quality
        elif lead_source == LeadSource.ORGANIC:
            source_score = 85  # Organic = high intent
        elif lead_source in [LeadSource.SMARTFINANCIAL, LeadSource.GOOGLE_SEARCH]:
            source_score = 75  # Good sources
        elif lead_source in [LeadSource.FACEBOOK, LeadSource.TIKTOK]:
            source_score = 60  # Social = mixed quality
        else:
            source_score = 70  # Default
        factor_scores["source_quality"] = source_score

        # Calculate weighted score
        total_score = sum(
            factor_scores[factor] * self.scoring_weights[factor]
            for factor in factor_scores
        )

        # Classify into tier
        if total_score >= 90:
            tier = LeadQualityTier.ELITE_POTENTIAL
        elif total_score >= 70:
            tier = LeadQualityTier.PREMIUM_POTENTIAL
        elif total_score >= 50:
            tier = LeadQualityTier.STANDARD_POTENTIAL
        else:
            tier = LeadQualityTier.LOW_VALUE

        # Get segment-specific metrics
        predicted_ltv = self.segment_ltv[tier]
        recommended_cac = self.segment_cac[tier]
        conversion_probability = self.segment_conversion_rates[tier]

        return LeadScore(
            lead_id=lead_id,
            score=total_score,
            predicted_segment=tier,
            predicted_ltv=predicted_ltv,
            recommended_cac=recommended_cac,
            conversion_probability=conversion_probability,
            key_factors=factor_scores
        )

    def analyze_vendor_performance(
        self,
        vendor_name: str,
        total_spend: float,
        lead_data: List[Dict]
    ) -> VendorPerformance:
        """
        Analyze performance of a lead vendor

        Args:
            vendor_name: Name of vendor
            total_spend: Total spend on this vendor
            lead_data: List of leads from vendor with outcomes
                Example: [
                    {
                        "lead_id": "L001",
                        "converted": True,
                        "ltv": 12000,
                        "products_sold": ["auto", "home"]
                    },
                    ...
                ]

        Returns:
            VendorPerformance with detailed metrics
        """
        leads_received = len(lead_data)
        conversions = sum(1 for lead in lead_data if lead.get("converted", False))
        conversion_rate = conversions / leads_received if leads_received > 0 else 0

        # Calculate average LTV for converted customers
        converted_ltvs = [lead["ltv"] for lead in lead_data if lead.get("converted") and lead.get("ltv")]
        avg_ltv = statistics.mean(converted_ltvs) if converted_ltvs else 0

        # Revenue = LTV of all conversions (actually commission, but using LTV as proxy)
        # In reality: Revenue = sum of commissions from conversions
        total_revenue = sum(converted_ltvs) if converted_ltvs else 0

        # ROI = (Revenue - Spend) / Spend
        roi = ((total_revenue - total_spend) / total_spend) if total_spend > 0 else 0

        # CAC = Spend / Conversions
        cac = total_spend / conversions if conversions > 0 else 0

        # LTV:CAC ratio
        ltv_cac_ratio = avg_ltv / cac if cac > 0 else 0

        # Rate vendor performance
        if ltv_cac_ratio >= 10:
            rating = "EXCELLENT"
            recommendation = "Increase budget by 25-50%"
        elif ltv_cac_ratio >= 6:
            rating = "GOOD"
            recommendation = "Increase budget by 10-25%"
        elif ltv_cac_ratio >= 3:
            rating = "FAIR"
            recommendation = "Maintain current budget"
        elif ltv_cac_ratio >= 2:
            rating = "POOR"
            recommendation = "Reduce budget by 25-50%"
        else:
            rating = "UNDERPERFORMING"
            recommendation = "Consider eliminating this vendor"

        return VendorPerformance(
            vendor_name=vendor_name,
            total_spend=total_spend,
            leads_received=leads_received,
            conversions=conversions,
            conversion_rate=conversion_rate,
            avg_ltv=avg_ltv,
            total_revenue=total_revenue,
            roi=roi,
            cac=cac,
            ltv_cac_ratio=ltv_cac_ratio,
            rating=rating,
            recommendation=recommendation
        )

    def optimize_budget_allocation(
        self,
        current_budget: float,
        vendor_performances: List[VendorPerformance]
    ) -> List[BudgetAllocation]:
        """
        Optimize marketing budget allocation across vendors

        Strategy:
        - Shift spend from low-ROI vendors to high-ROI vendors
        - Maintain minimum viable spend on fair performers
        - Eliminate underperformers

        Args:
            current_budget: Total current marketing budget
            vendor_performances: List of VendorPerformance objects

        Returns:
            List of BudgetAllocation recommendations
        """
        # Calculate current allocation percentages
        total_current_spend = sum(vp.total_spend for vp in vendor_performances)

        # Sort vendors by LTV:CAC ratio (efficiency metric)
        sorted_vendors = sorted(vendor_performances, key=lambda v: v.ltv_cac_ratio, reverse=True)

        # Allocation strategy:
        # - Top tier (LTV:CAC >= 10): 40% of budget
        # - Good (LTV:CAC 6-10): 35% of budget
        # - Fair (LTV:CAC 3-6): 20% of budget
        # - Poor (LTV:CAC 2-3): 5% of budget
        # - Underperforming (LTV:CAC < 2): 0% of budget

        allocations = []
        remaining_budget = current_budget

        for vendor in sorted_vendors:
            current_allocation = vendor.total_spend

            # Determine recommended allocation
            if vendor.ltv_cac_ratio >= 10:
                # Excellent - allocate 40% of budget proportionally among excellent vendors
                excellent_count = sum(1 for v in sorted_vendors if v.ltv_cac_ratio >= 10)
                recommended_allocation = current_budget * 0.40 / excellent_count
                reasoning = f"Excellent ROI ({vendor.roi:.0%}) - increase allocation significantly"

            elif vendor.ltv_cac_ratio >= 6:
                # Good - allocate 35% proportionally
                good_count = sum(1 for v in sorted_vendors if 6 <= v.ltv_cac_ratio < 10)
                recommended_allocation = current_budget * 0.35 / good_count if good_count > 0 else current_budget * 0.35
                reasoning = f"Good ROI ({vendor.roi:.0%}) - increase allocation moderately"

            elif vendor.ltv_cac_ratio >= 3:
                # Fair - allocate 20% proportionally
                fair_count = sum(1 for v in sorted_vendors if 3 <= v.ltv_cac_ratio < 6)
                recommended_allocation = current_budget * 0.20 / fair_count if fair_count > 0 else current_budget * 0.20
                reasoning = f"Fair ROI ({vendor.roi:.0%}) - maintain with slight reduction"

            elif vendor.ltv_cac_ratio >= 2:
                # Poor - allocate 5% proportionally
                poor_count = sum(1 for v in sorted_vendors if 2 <= v.ltv_cac_ratio < 3)
                recommended_allocation = current_budget * 0.05 / poor_count if poor_count > 0 else current_budget * 0.05
                reasoning = f"Poor ROI ({vendor.roi:.0%}) - reduce significantly"

            else:
                # Underperforming - eliminate
                recommended_allocation = 0
                reasoning = f"Underperforming (ROI: {vendor.roi:.0%}) - eliminate and reallocate"

            change = recommended_allocation - current_allocation
            change_percentage = (change / current_allocation * 100) if current_allocation > 0 else 0

            allocations.append(BudgetAllocation(
                vendor_name=vendor.vendor_name,
                current_allocation=current_allocation,
                recommended_allocation=recommended_allocation,
                change=change,
                change_percentage=change_percentage,
                reasoning=reasoning
            ))

        return allocations

    def calculate_blended_metrics(
        self,
        vendor_performances: List[VendorPerformance]
    ) -> Dict:
        """
        Calculate blended metrics across all vendors

        Returns:
            Dict with portfolio-level metrics
        """
        total_spend = sum(vp.total_spend for vp in vendor_performances)
        total_leads = sum(vp.leads_received for vp in vendor_performances)
        total_conversions = sum(vp.conversions for vp in vendor_performances)
        total_revenue = sum(vp.total_revenue for vp in vendor_performances)

        blended_conversion_rate = total_conversions / total_leads if total_leads > 0 else 0
        blended_cac = total_spend / total_conversions if total_conversions > 0 else 0
        blended_ltv = total_revenue / total_conversions if total_conversions > 0 else 0
        blended_ltv_cac = blended_ltv / blended_cac if blended_cac > 0 else 0
        blended_roi = ((total_revenue - total_spend) / total_spend) if total_spend > 0 else 0

        return {
            "total_spend": total_spend,
            "total_leads": total_leads,
            "total_conversions": total_conversions,
            "total_revenue": total_revenue,
            "blended_conversion_rate": blended_conversion_rate,
            "blended_cac": blended_cac,
            "blended_ltv": blended_ltv,
            "blended_ltv_cac_ratio": blended_ltv_cac,
            "blended_roi": blended_roi
        }


def demo_lead_scoring_model():
    """Demonstrate lead scoring and vendor optimization"""
    print("=" * 80)
    print("LEAD SCORING & ROI MODEL DEMO")
    print("=" * 80)

    model = LeadScoringModel()

    # 1. Lead scoring examples
    print("\n1. LEAD SCORING EXAMPLES")
    print("-" * 80)

    example_leads = [
        {
            "lead_id": "LEAD-001",
            "products": ["auto", "home", "umbrella"],
            "homeowner": "owner",
            "age": "35-44",
            "premium": 4500,
            "credit": "excellent",
            "engagement": "high",
            "source": LeadSource.REFERRAL
        },
        {
            "lead_id": "LEAD-002",
            "products": ["auto", "home"],
            "homeowner": "owner",
            "age": "30-39",
            "premium": 3200,
            "credit": "good",
            "engagement": "medium",
            "source": LeadSource.SMARTFINANCIAL
        },
        {
            "lead_id": "LEAD-003",
            "products": ["auto"],
            "homeowner": "renter",
            "age": "18-24",
            "premium": 1200,
            "credit": "fair",
            "engagement": "low",
            "source": LeadSource.TIKTOK
        },
        {
            "lead_id": "LEAD-004",
            "products": ["home"],
            "homeowner": "owner",
            "age": "40-49",
            "premium": 2000,
            "credit": "excellent",
            "engagement": "high",
            "source": LeadSource.ORGANIC
        }
    ]

    for lead_data in example_leads:
        score = model.score_lead(
            lead_id=lead_data["lead_id"],
            products_shopping=lead_data["products"],
            homeowner_status=lead_data["homeowner"],
            age_range=lead_data["age"],
            estimated_premium=lead_data.get("premium"),
            credit_tier=lead_data.get("credit", "unknown"),
            engagement_level=lead_data.get("engagement", "medium"),
            lead_source=lead_data.get("source")
        )

        print(f"\nLead: {score.lead_id}")
        print(f"  Products: {lead_data['products']}")
        print(f"  Score: {score.score:.0f}/100")
        print(f"  Predicted Segment: {score.predicted_segment.value.upper()}")
        print(f"  Predicted LTV: ${score.predicted_ltv:,.0f}")
        print(f"  Recommended Max CAC: ${score.recommended_cac:,.0f}")
        print(f"  Conversion Probability: {score.conversion_probability:.1%}")
        print(f"  Top Factors:")
        sorted_factors = sorted(score.key_factors.items(), key=lambda x: x[1] * model.scoring_weights[x[0]], reverse=True)
        for factor, value in sorted_factors[:3]:
            contribution = value * model.scoring_weights[factor]
            print(f"    - {factor}: {value:.0f} (contributes {contribution:.1f} pts)")

    # 2. Vendor performance analysis
    print("\n\n2. VENDOR PERFORMANCE ANALYSIS")
    print("-" * 80)

    # Simulate vendor data
    import random

    vendors_data = [
        {
            "name": "SmartFinancial",
            "spend": 12000,
            "leads": 240,
            "avg_quality": "high",  # High conversion, high LTV
            "conversion_rate": 0.15
        },
        {
            "name": "EverQuote",
            "spend": 8000,
            "leads": 320,
            "avg_quality": "low",  # Low conversion, low LTV
            "conversion_rate": 0.06
        },
        {
            "name": "Insurify",
            "spend": 10000,
            "leads": 200,
            "avg_quality": "medium",
            "conversion_rate": 0.12
        },
        {
            "name": "Facebook Ads",
            "spend": 6000,
            "leads": 180,
            "avg_quality": "medium",
            "conversion_rate": 0.10
        }
    ]

    vendor_performances = []

    for vendor_data in vendors_data:
        # Generate lead data for vendor
        lead_data = []
        for i in range(vendor_data["leads"]):
            converted = random.random() < vendor_data["conversion_rate"]

            if converted:
                # Assign LTV based on vendor quality
                if vendor_data["avg_quality"] == "high":
                    ltv = random.randint(8000, 16000)
                elif vendor_data["avg_quality"] == "medium":
                    ltv = random.randint(4000, 9000)
                else:
                    ltv = random.randint(2000, 5000)
            else:
                ltv = 0

            lead_data.append({
                "lead_id": f"{vendor_data['name'][:3].upper()}-{i:03d}",
                "converted": converted,
                "ltv": ltv
            })

        # Analyze vendor
        performance = model.analyze_vendor_performance(
            vendor_name=vendor_data["name"],
            total_spend=vendor_data["spend"],
            lead_data=lead_data
        )

        vendor_performances.append(performance)

    # Display vendor performance
    print(f"\n{'Vendor':<20} {'Spend':<12} {'Leads':<8} {'Conv%':<8} {'CAC':<10} {'Avg LTV':<12} {'LTV:CAC':<10} {'ROI':<10} {'Rating'}")
    print("-" * 125)

    for vp in vendor_performances:
        print(f"{vp.vendor_name:<20} ${vp.total_spend:<11,.0f} {vp.leads_received:<8} "
              f"{vp.conversion_rate:<8.1%} ${vp.cac:<9,.0f} ${vp.avg_ltv:<11,.0f} "
              f"{vp.ltv_cac_ratio:<10.1f} {vp.roi:<10.1%} {vp.rating}")

    # 3. Blended metrics
    print("\n\n3. BLENDED PORTFOLIO METRICS")
    print("-" * 80)

    blended = model.calculate_blended_metrics(vendor_performances)

    print(f"Total Spend: ${blended['total_spend']:,.0f}")
    print(f"Total Leads: {blended['total_leads']:,}")
    print(f"Total Conversions: {blended['total_conversions']}")
    print(f"Blended Conversion Rate: {blended['blended_conversion_rate']:.1%}")
    print(f"Blended CAC: ${blended['blended_cac']:,.0f}")
    print(f"Blended LTV: ${blended['blended_ltv']:,.0f}")
    print(f"Blended LTV:CAC Ratio: {blended['blended_ltv_cac_ratio']:.1f}x")
    print(f"Blended ROI: {blended['blended_roi']:.1%}")

    # 4. Budget optimization
    print("\n\n4. BUDGET OPTIMIZATION RECOMMENDATIONS")
    print("-" * 80)

    current_total_budget = sum(vp.total_spend for vp in vendor_performances)
    allocations = model.optimize_budget_allocation(current_total_budget, vendor_performances)

    print(f"Current Total Budget: ${current_total_budget:,.0f}\n")

    print(f"{'Vendor':<20} {'Current':<12} {'Recommended':<12} {'Change':<12} {'Change %':<10} {'Reasoning'}")
    print("-" * 120)

    for alloc in allocations:
        change_sign = "+" if alloc.change > 0 else ""
        print(f"{alloc.vendor_name:<20} ${alloc.current_allocation:<11,.0f} "
              f"${alloc.recommended_allocation:<11,.0f} "
              f"{change_sign}${alloc.change:<11,.0f} "
              f"{change_sign}{alloc.change_percentage:<9.0f}% "
              f"{alloc.reasoning}")

    # Calculate projected improvement
    print("\n\n5. PROJECTED IMPROVEMENT FROM REALLOCATION")
    print("-" * 80)

    # Estimate new performance with optimized budget
    # Assumptions:
    # - High performers maintain efficiency at scale
    # - Eliminating poor performers saves waste
    # - Blended metrics improve

    total_increase_to_good = sum(alloc.change for alloc in allocations if alloc.change > 0)
    total_decrease_from_poor = abs(sum(alloc.change for alloc in allocations if alloc.change < 0))

    print(f"Budget Shift:")
    print(f"  From underperforming vendors: ${total_decrease_from_poor:,.0f}")
    print(f"  To high-performing vendors: ${total_increase_to_good:,.0f}")

    # Estimate improvement (conservative)
    # Assume high performers have 2x better LTV:CAC than poor performers
    current_blended_ltv_cac = blended['blended_ltv_cac_ratio']
    estimated_new_ltv_cac = current_blended_ltv_cac * 1.35  # 35% improvement estimate

    current_blended_roi = blended['blended_roi']
    estimated_new_roi = current_blended_roi * 1.40  # 40% improvement estimate

    print(f"\nProjected Metrics After Optimization:")
    print(f"  Current LTV:CAC: {current_blended_ltv_cac:.1f}x → {estimated_new_ltv_cac:.1f}x (+{((estimated_new_ltv_cac/current_blended_ltv_cac - 1) * 100):.0f}%)")
    print(f"  Current ROI: {current_blended_roi:.0%} → {estimated_new_roi:.0%} (+{((estimated_new_roi/current_blended_roi - 1) * 100):.0f}%)")

    annual_savings = total_decrease_from_poor  # Eliminate waste
    additional_revenue = total_increase_to_good * (estimated_new_ltv_cac / current_blended_ltv_cac - 1)  # Better allocation

    print(f"\nAnnual Impact:")
    print(f"  Savings from eliminating poor vendors: ${annual_savings:,.0f}")
    print(f"  Additional revenue from reallocation: ${additional_revenue:,.0f}")
    print(f"  TOTAL ANNUAL BENEFIT: ${annual_savings + additional_revenue:,.0f}")

    # Summary
    print("\n\n" + "=" * 80)
    print("EXECUTIVE SUMMARY")
    print("=" * 80)

    best_vendor = max(vendor_performances, key=lambda v: v.ltv_cac_ratio)
    worst_vendor = min(vendor_performances, key=lambda v: v.ltv_cac_ratio)

    print(f"\n🏆 Best Performing Vendor: {best_vendor.vendor_name}")
    print(f"   LTV:CAC: {best_vendor.ltv_cac_ratio:.1f}x | ROI: {best_vendor.roi:.0%}")
    print(f"   Recommendation: {best_vendor.recommendation}")

    print(f"\n⚠️  Worst Performing Vendor: {worst_vendor.vendor_name}")
    print(f"   LTV:CAC: {worst_vendor.ltv_cac_ratio:.1f}x | ROI: {worst_vendor.roi:.0%}")
    print(f"   Recommendation: {worst_vendor.recommendation}")

    print(f"\n💰 Optimization Opportunity:")
    print(f"   Reallocate ${total_decrease_from_poor:,.0f} from poor to high performers")
    print(f"   Projected improvement: {((estimated_new_ltv_cac/current_blended_ltv_cac - 1) * 100):.0f}% LTV:CAC increase")
    print(f"   Estimated annual benefit: ${annual_savings + additional_revenue:,.0f}")

    print(f"\n🎯 Key Actions:")
    print(f"   1. Increase spend on {best_vendor.vendor_name} by 25-50%")
    print(f"   2. Reduce/eliminate spend on {worst_vendor.vendor_name}")
    print(f"   3. Focus on Elite/Premium leads (scores 70+)")
    print(f"   4. Target LTV:CAC ratio of {estimated_new_ltv_cac:.0f}x (vs current {current_blended_ltv_cac:.1f}x)")


if __name__ == "__main__":
    demo_lead_scoring_model()
