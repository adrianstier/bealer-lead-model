"""
Agency Growth Simulator v3.0
Enhanced with comprehensive industry benchmarks and analytics

Features:
- Marketing channel-specific modeling
- Staffing ratio optimization (2.8:1 service:producer)
- Revenue per employee tracking
- Technology investment ROI
- Bundling dynamics (1.8 policies per customer threshold)
- Commission structure comparisons
- EBITDA and Rule of 20 calculations
- LTV:CAC ratio benchmarking
- High-ROI investment modeling
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional, Literal
from enum import Enum


# ============================================================================
# ENUMS & CONSTANTS
# ============================================================================

class AgencyType(Enum):
    INDEPENDENT = "independent"
    CAPTIVE = "captive"
    HYBRID = "hybrid"


class GrowthStage(Enum):
    MATURE = "mature"  # 3-7% marketing spend
    GROWTH = "growth"  # 10-25% marketing spend


# ============================================================================
# DATA CLASSES - MARKETING
# ============================================================================

@dataclass
class MarketingChannel:
    """Marketing channel with specific performance characteristics"""
    name: str
    monthly_allocation: float = 0  # Dollar amount allocated
    cost_per_lead: float = 25
    conversion_rate: float = 0.15  # Lead to policy conversion
    quality_score: float = 5.0  # 1-10 scale

    def get_monthly_leads(self) -> float:
        """Calculate monthly leads from allocation"""
        return self.monthly_allocation / self.cost_per_lead if self.cost_per_lead > 0 else 0

    def get_monthly_policies(self) -> float:
        """Calculate expected monthly policies"""
        return self.get_monthly_leads() * self.conversion_rate


@dataclass
class MarketingMix:
    """Complete marketing channel mix with benchmarks"""

    # Channel definitions with industry benchmarks
    referral: MarketingChannel = field(default_factory=lambda: MarketingChannel(
        name="Referral Program",
        cost_per_lead=50,
        conversion_rate=0.60,  # 60% vs 15% industry (4x better)
        quality_score=9.0
    ))

    digital: MarketingChannel = field(default_factory=lambda: MarketingChannel(
        name="Digital (Google/Facebook)",
        cost_per_lead=25,  # 30% lower than traditional
        conversion_rate=0.18,
        quality_score=6.0
    ))

    traditional: MarketingChannel = field(default_factory=lambda: MarketingChannel(
        name="Traditional Marketing",
        cost_per_lead=35,
        conversion_rate=0.15,
        quality_score=5.0
    ))

    partnerships: MarketingChannel = field(default_factory=lambda: MarketingChannel(
        name="Strategic Partnerships",
        cost_per_lead=40,
        conversion_rate=0.25,
        quality_score=7.5
    ))

    def get_total_allocation(self) -> float:
        """Total monthly marketing spend"""
        return (self.referral.monthly_allocation +
                self.digital.monthly_allocation +
                self.traditional.monthly_allocation +
                self.partnerships.monthly_allocation)

    def get_total_leads(self) -> float:
        """Total monthly leads across all channels"""
        return (self.referral.get_monthly_leads() +
                self.digital.get_monthly_leads() +
                self.traditional.get_monthly_leads() +
                self.partnerships.get_monthly_leads())

    def get_weighted_conversion_rate(self) -> float:
        """Calculate weighted average conversion rate"""
        total_leads = self.get_total_leads()
        if total_leads == 0:
            return 0

        weighted_conversions = (
            self.referral.get_monthly_leads() * self.referral.conversion_rate +
            self.digital.get_monthly_leads() * self.digital.conversion_rate +
            self.traditional.get_monthly_leads() * self.traditional.conversion_rate +
            self.partnerships.get_monthly_leads() * self.partnerships.conversion_rate
        )

        return weighted_conversions / total_leads

    def get_blended_cac(self, commission_rate: float, avg_premium: float) -> float:
        """Calculate blended customer acquisition cost"""
        total_policies = (self.referral.get_monthly_policies() +
                         self.digital.get_monthly_policies() +
                         self.traditional.get_monthly_policies() +
                         self.partnerships.get_monthly_policies())

        if total_policies == 0:
            return 0

        return self.get_total_allocation() / total_policies


# ============================================================================
# DATA CLASSES - STAFFING
# ============================================================================

@dataclass
class StaffingModel:
    """Staffing model with industry benchmarks"""

    # Staff composition
    producers: float = 1.0
    service_staff: float = 2.8  # Benchmark: 2.8 service per producer
    admin_staff: float = 0.5

    # Compensation
    producer_avg_comp: float = 80000  # Annual
    service_staff_avg_comp: float = 45000  # Annual
    admin_staff_avg_comp: float = 40000  # Annual
    benefits_multiplier: float = 1.3  # 30% overhead for benefits

    # Productivity benchmarks
    supported_producer_accounts_per_week: float = 1.5  # With support staff
    unsupported_producer_accounts_per_week: float = 0.375  # Without (1.5/month) - 4x worse

    # Revenue per employee targets
    rpe_target_min: float = 150000  # $150k minimum
    rpe_target_good: float = 200000  # $200k good
    rpe_target_excellent: float = 300000  # $300k+ excellent

    def get_total_fte(self) -> float:
        """Total full-time equivalents"""
        return self.producers + self.service_staff + self.admin_staff

    def get_producer_to_service_ratio(self) -> float:
        """Calculate service staff per producer"""
        if self.producers == 0:
            return 0
        return self.service_staff / self.producers

    def get_total_monthly_cost(self) -> float:
        """Calculate total monthly staff cost including benefits"""
        annual_cost = (
            self.producers * self.producer_avg_comp +
            self.service_staff * self.service_staff_avg_comp +
            self.admin_staff * self.admin_staff_avg_comp
        ) * self.benefits_multiplier

        return annual_cost / 12

    def get_producer_productivity_multiplier(self) -> float:
        """
        Calculate productivity multiplier based on support ratio
        Optimal ratio is 2.8:1, productivity drops below this
        """
        ratio = self.get_producer_to_service_ratio()
        optimal_ratio = 2.8

        if ratio >= optimal_ratio:
            return 1.0  # Full productivity
        else:
            # Linear degradation down to 0.25 (4x worse) with no support
            return max(0.25, ratio / optimal_ratio)

    def evaluate_rpe(self, total_revenue: float) -> Dict:
        """Evaluate revenue per employee against benchmarks"""
        total_fte = self.get_total_fte()
        if total_fte == 0:
            return {"rpe": 0, "rating": "N/A", "status": "error"}

        rpe = total_revenue / total_fte

        if rpe >= self.rpe_target_excellent:
            rating = "Excellent"
            status = "excellent"
        elif rpe >= self.rpe_target_good:
            rating = "Good"
            status = "good"
        elif rpe >= self.rpe_target_min:
            rating = "Acceptable"
            status = "acceptable"
        else:
            rating = "Below Target"
            status = "warning"

        return {
            "rpe": rpe,
            "rating": rating,
            "status": status,
            "target_min": self.rpe_target_min,
            "target_good": self.rpe_target_good,
            "target_excellent": self.rpe_target_excellent
        }


# ============================================================================
# DATA CLASSES - TECHNOLOGY
# ============================================================================

@dataclass
class TechnologyInvestment:
    """Technology investment with ROI tracking"""

    # Monthly costs
    ams_cost: float = 500  # Agency Management System
    crm_cost: float = 200  # CRM
    rating_platform_cost: float = 150  # Comparative rating
    eo_automation_cost: float = 150  # Certificate of Insurance automation
    esignature_cost: float = 100  # E-signature solution
    renewal_automation_cost: float = 200  # Renewal workflow automation
    marketing_automation_cost: float = 150  # Marketing automation

    # Efficiency gains (time savings as decimal)
    rating_platform_time_savings: float = 0.85  # 85% time savings
    esignature_time_savings: float = 0.85  # 85% time savings
    renewal_automation_time_savings: float = 0.60  # 60% time savings

    # Risk reduction
    eo_claim_prevention_rate: float = 0.40  # Prevents 40% of E&O claims
    avg_eo_claim_cost: float = 75000  # Average claim defense cost

    def get_total_monthly_cost(self) -> float:
        """Total monthly technology spend"""
        return (self.ams_cost + self.crm_cost + self.rating_platform_cost +
                self.eo_automation_cost + self.esignature_cost +
                self.renewal_automation_cost + self.marketing_automation_cost)

    def get_target_budget(self, annual_revenue: float) -> Dict:
        """
        Calculate target technology budget
        Benchmark: 2.5-3.5% of annual revenue
        """
        target_min = annual_revenue * 0.025
        target_max = annual_revenue * 0.035
        target_mid = annual_revenue * 0.030

        annual_cost = self.get_total_monthly_cost() * 12
        percent_of_revenue = (annual_cost / annual_revenue * 100) if annual_revenue > 0 else 0

        if annual_cost < target_min:
            status = "under_invested"
            message = f"Below target range (2.5-3.5%). Consider adding technology."
        elif annual_cost > target_max:
            status = "over_invested"
            message = f"Above target range. Review for optimization opportunities."
        else:
            status = "optimal"
            message = f"Within optimal range (2.5-3.5% of revenue)."

        return {
            "annual_cost": annual_cost,
            "percent_of_revenue": percent_of_revenue,
            "target_min": target_min,
            "target_max": target_max,
            "status": status,
            "message": message
        }

    def calculate_eo_automation_roi(self, expected_claims_per_year: float = 0.5) -> Dict:
        """
        Calculate ROI for E&O automation
        Benchmark: Prevents 40% of claims, avg claim cost $50k-$100k
        """
        annual_cost = self.eo_automation_cost * 12
        claims_prevented = expected_claims_per_year * self.eo_claim_prevention_rate
        expected_savings = claims_prevented * self.avg_eo_claim_cost

        roi_percent = ((expected_savings - annual_cost) / annual_cost * 100) if annual_cost > 0 else 0
        payback_months = (annual_cost / (expected_savings / 12)) if expected_savings > 0 else float('inf')

        return {
            "annual_cost": annual_cost,
            "expected_annual_savings": expected_savings,
            "roi_percent": roi_percent,
            "payback_months": payback_months,
            "claims_prevented": claims_prevented,
            "recommendation": "Highest-impact investment for risk management"
        }


# ============================================================================
# DATA CLASSES - BUNDLING & RETENTION
# ============================================================================

@dataclass
class BundlingDynamics:
    """
    Bundling and retention dynamics
    Critical threshold: 1.8 policies per customer = 95% retention
    """

    # Policy counts by type
    auto_policies: int = 0
    home_policies: int = 0
    umbrella_policies: int = 0  # High margin, excellent retention aid
    cyber_policies: int = 0  # 15-25% commission
    commercial_policies: int = 0
    life_policies: int = 0

    # Commission rates by product
    auto_home_commission: float = 0.12  # 12%
    umbrella_commission: float = 0.15  # 15% (high margin)
    cyber_commission: float = 0.20  # 15-25% range
    commercial_commission: float = 0.15  # 10-25% range
    life_commission: float = 0.50  # 50-100% first year

    # Retention benchmarks
    monoline_retention: float = 0.67  # 67% for single policy
    bundled_base_retention: float = 0.91  # 91% for 1.5+ policies
    optimal_bundled_retention: float = 0.95  # 95% for 1.8+ policies
    critical_threshold: float = 1.8  # Critical policies per customer threshold

    def get_total_policies(self) -> int:
        """Total policy count"""
        return (self.auto_policies + self.home_policies + self.umbrella_policies +
                self.cyber_policies + self.commercial_policies + self.life_policies)

    def get_unique_customers(self) -> int:
        """
        Estimate unique customers
        Assumption: auto and home typically go to same customer when bundled
        """
        # Simple estimate: max of auto or home, plus other standalone
        base_customers = max(self.auto_policies, self.home_policies)
        other_customers = self.commercial_policies + self.life_policies

        # Umbrella and cyber typically attach to existing customers
        return max(1, base_customers + other_customers)

    def get_policies_per_customer(self) -> float:
        """Calculate average policies per customer"""
        customers = self.get_unique_customers()
        return self.get_total_policies() / customers if customers > 0 else 0

    def get_retention_rate(self) -> float:
        """
        Calculate retention based on policies per customer
        Critical threshold: 1.8 policies = 95% retention
        """
        ppc = self.get_policies_per_customer()

        if ppc >= self.critical_threshold:
            return self.optimal_bundled_retention  # 95%
        elif ppc >= 1.5:
            # Interpolate between bundled base and optimal
            return self.bundled_base_retention + \
                   (self.optimal_bundled_retention - self.bundled_base_retention) * \
                   ((ppc - 1.5) / (self.critical_threshold - 1.5))
        elif ppc > 1.0:
            # Interpolate between monoline and bundled
            return self.monoline_retention + \
                   (self.bundled_base_retention - self.monoline_retention) * \
                   ((ppc - 1.0) / 0.5)
        else:
            return self.monoline_retention  # 67%

    def calculate_retention_profit_multiplier(self,
                                             retention_improvement: float,
                                             years: int = 5) -> float:
        """
        Calculate profit multiplier from retention improvement
        Benchmark: 5% retention improvement can double profits in 5 years
        """
        if years == 5 and retention_improvement >= 0.05:
            return 2.0  # Double profits
        else:
            # Linear approximation for other scenarios
            # 5% improvement = 2x, so each 1% improvement = 1.2x
            return 1.0 + (retention_improvement * 20)

    def get_ltv_multiplier(self) -> float:
        """
        Calculate LTV multiplier based on bundling
        Bundled customers have significantly higher LTV
        """
        ppc = self.get_policies_per_customer()

        if ppc >= self.critical_threshold:
            return 3.5  # 3.5x LTV for highly bundled customers
        elif ppc >= 1.5:
            return 2.5  # 2.5x LTV for bundled customers
        else:
            return 1.0  # Baseline LTV


# ============================================================================
# DATA CLASSES - COMMISSION STRUCTURES
# ============================================================================

@dataclass
class CommissionStructure:
    """Commission structure comparison - Independent vs Captive"""

    structure_type: AgencyType = AgencyType.INDEPENDENT

    # Independent agent benchmarks
    independent_new_business: float = 0.125  # 12-15% for auto/home
    independent_renewal: float = 0.11  # 10-12% for auto/home
    independent_commercial: float = 0.15  # 10-25% range

    # Captive/high-pressure benchmarks
    captive_new_business: float = 0.30  # 20-40% (acquisition-focused)
    captive_renewal: float = 0.07  # As low as 7% (sacrifices retention)

    # Compensation caps (best practices)
    total_producer_owner_comp_max: float = 0.35  # 30-35% of revenue
    total_payroll_max: float = 0.65  # 65% of revenue max

    def get_commission_rate(self, is_new_business: bool, is_commercial: bool = False) -> float:
        """Get commission rate based on structure type and business type"""
        if self.structure_type == AgencyType.INDEPENDENT:
            if is_commercial:
                return self.independent_commercial
            elif is_new_business:
                return self.independent_new_business
            else:
                return self.independent_renewal

        elif self.structure_type == AgencyType.CAPTIVE:
            if is_new_business:
                return self.captive_new_business
            else:
                return self.captive_renewal

        else:  # Hybrid
            # Average of independent and captive
            if is_new_business:
                return (self.independent_new_business + self.captive_new_business) / 2
            else:
                return (self.independent_renewal + self.captive_renewal) / 2

    def calculate_annual_revenue(self,
                                new_business_premium: float,
                                renewal_premium: float,
                                commercial_premium: float = 0) -> float:
        """Calculate total annual commission revenue"""
        if self.structure_type == AgencyType.INDEPENDENT:
            return (new_business_premium * self.independent_new_business +
                   renewal_premium * self.independent_renewal +
                   commercial_premium * self.independent_commercial)

        elif self.structure_type == AgencyType.CAPTIVE:
            return (new_business_premium * self.captive_new_business +
                   renewal_premium * self.captive_renewal +
                   commercial_premium * self.independent_commercial)

        else:
            # Hybrid approach
            return ((new_business_premium + renewal_premium) *
                   ((self.independent_new_business + self.independent_renewal) / 2) +
                   commercial_premium * self.independent_commercial)

    def validate_compensation(self,
                             total_compensation: float,
                             total_revenue: float) -> Dict:
        """Validate compensation ratios against best practices"""
        if total_revenue == 0:
            return {"status": "error", "message": "No revenue to evaluate"}

        comp_ratio = total_compensation / total_revenue

        if comp_ratio > self.total_payroll_max:
            status = "critical"
            message = f"Total payroll {comp_ratio:.1%} exceeds 65% best practice. Profitability at risk."
        elif comp_ratio > self.total_producer_owner_comp_max:
            status = "warning"
            message = f"Compensation {comp_ratio:.1%} above 30-35% target. Review structure."
        else:
            status = "healthy"
            message = f"Compensation ratio {comp_ratio:.1%} within healthy range."

        return {
            "comp_ratio": comp_ratio,
            "status": status,
            "message": message,
            "target_max_producer": self.total_producer_owner_comp_max,
            "target_max_total": self.total_payroll_max
        }


# ============================================================================
# DATA CLASSES - FINANCIAL METRICS
# ============================================================================

@dataclass
class FinancialMetrics:
    """Financial performance metrics and benchmarks"""

    # EBITDA targets
    ebitda_target_min: float = 0.25  # 25% for $1-5M agencies
    ebitda_target_max: float = 0.30  # 30% for top performers

    # LTV:CAC ratio targets
    ltv_cac_good: float = 3.0  # 3:1 good
    ltv_cac_great: float = 4.0  # 4:1 great
    ltv_cac_underinvested: float = 5.0  # 5:1+ may indicate under-investment

    # Industry CAC benchmark
    independent_agent_avg_cac: float = 900  # $900 average

    def calculate_ebitda(self,
                        total_revenue: float,
                        operating_expenses: float) -> float:
        """
        Calculate EBITDA
        EBITDA = Revenue - Operating Expenses
        """
        return total_revenue - operating_expenses

    def calculate_ebitda_margin(self,
                               total_revenue: float,
                               operating_expenses: float) -> float:
        """Calculate EBITDA margin %"""
        if total_revenue == 0:
            return 0

        ebitda = self.calculate_ebitda(total_revenue, operating_expenses)
        return ebitda / total_revenue

    def evaluate_ebitda_margin(self,
                              margin: float,
                              premium_volume: float) -> Dict:
        """
        Evaluate EBITDA margin against benchmarks
        Target: 25-30% for agencies writing $1-5M premium
        """
        if 1_000_000 <= premium_volume <= 5_000_000:
            if margin >= self.ebitda_target_max:
                status = "excellent"
                message = "Excellent margins for agency size"
            elif margin >= self.ebitda_target_min:
                status = "target"
                message = "Within target range for well-run agencies"
            elif margin >= 0.20:
                status = "acceptable"
                message = "Acceptable but room for improvement"
            else:
                status = "below_target"
                message = "Below industry benchmarks. Review expenses."
        else:
            # Outside benchmark range
            if margin >= 0.25:
                status = "good"
                message = "Strong margins"
            else:
                status = "review"
                message = "Margins warrant review"

        return {
            "margin": margin,
            "status": status,
            "message": message,
            "target_range": "25-30%",
            "target_min": self.ebitda_target_min,
            "target_max": self.ebitda_target_max
        }

    def calculate_ltv(self,
                     avg_annual_revenue: float,
                     avg_retention_rate: float,
                     avg_cac: float,
                     servicing_cost: float = 0) -> float:
        """
        Calculate Customer Lifetime Value (industry standard formula)
        LTV = (Average annual revenue × Retention rate) / (1 - Retention rate) - CAC
        """
        if avg_retention_rate >= 1.0:
            # Perfect retention = infinite LTV, cap at reasonable value
            ltv_base = avg_annual_revenue * 20  # 20 years
        else:
            ltv_base = (avg_annual_revenue * avg_retention_rate) / (1 - avg_retention_rate)

        # Subtract acquisition cost and servicing
        ltv = ltv_base - avg_cac - servicing_cost

        return max(0, ltv)

    def calculate_ltv_cac_ratio(self, ltv: float, cac: float) -> float:
        """Calculate LTV:CAC ratio"""
        if cac == 0:
            return 0
        return ltv / cac

    def evaluate_ltv_cac_ratio(self, ratio: float) -> Dict:
        """
        Evaluate LTV:CAC ratio against benchmarks
        3:1 = good, 4:1 = great, 5:1+ = may indicate under-investment
        """
        if ratio >= self.ltv_cac_underinvested:
            status = "underinvested"
            message = "Strong economics but may indicate under-investment in growth"
            recommendation = "Consider increasing marketing spend"
            color = "yellow"
        elif ratio >= self.ltv_cac_great:
            status = "great"
            message = "Great business model"
            recommendation = "Excellent unit economics, maintain course"
            color = "green"
        elif ratio >= self.ltv_cac_good:
            status = "good"
            message = "Good benchmark"
            recommendation = "Healthy unit economics"
            color = "green"
        elif ratio >= 2.0:
            status = "acceptable"
            message = "Acceptable but room for improvement"
            recommendation = "Optimize retention or reduce CAC"
            color = "yellow"
        else:
            status = "poor"
            message = "Below target"
            recommendation = "Critical: Improve retention or significantly reduce CAC"
            color = "red"

        return {
            "ratio": ratio,
            "status": status,
            "message": message,
            "recommendation": recommendation,
            "color": color,
            "benchmark_good": self.ltv_cac_good,
            "benchmark_great": self.ltv_cac_great
        }

    def calculate_rule_of_20(self,
                           organic_growth_percent: float,
                           ebitda_percent: float) -> Dict:
        """
        Calculate Rule of 20
        Rule of 20 = Organic Growth % + (50% × EBITDA %)

        Scoring:
        - 25+: Top performers
        - 20-25: Healthy agencies
        - <20: Needs improvement
        """
        score = organic_growth_percent + (0.5 * ebitda_percent * 100)

        if score >= 25:
            rating = "Top Performer"
            color = "green"
            message = "Elite agency performance"
        elif score >= 20:
            rating = "Healthy Agency"
            color = "green"
            message = "Strong balanced growth and profitability"
        elif score >= 15:
            rating = "Needs Improvement"
            color = "yellow"
            message = "Focus on growth or profitability improvement"
        else:
            rating = "Critical"
            color = "red"
            message = "Immediate attention required for growth and margins"

        return {
            "score": score,
            "rating": rating,
            "color": color,
            "message": message,
            "target": 20,
            "calculation": f"{organic_growth_percent:.1f}% + (50% × {ebitda_percent*100:.1f}%) = {score:.1f}"
        }


# ============================================================================
# DATA CLASSES - HIGH-ROI INVESTMENTS
# ============================================================================

@dataclass
class HighROIInvestments:
    """Model high-ROI investment opportunities"""

    # E&O Automation
    eo_automation_monthly_cost: float = 150
    eo_claim_prevention_rate: float = 0.40  # 40% of claims prevented
    eo_avg_claim_cost: float = 75000  # $50k-$100k range
    eo_baseline_claims_per_year: float = 0.5  # 1 every 2 years

    # Renewal Review Program
    renewal_review_hours_per_policy: float = 0.25  # 15 minutes each
    renewal_staff_hourly_cost: float = 25
    renewal_retention_improvement: float = 0.015  # 1.5% improvement
    renewal_improvement_timeline_months: int = 6  # Improvement seen in 6 months

    # Cross-selling Program
    crosssell_program_monthly_cost: float = 500  # CRM + training
    crosssell_umbrella_attachment_rate: float = 0.15  # 15% of customers
    crosssell_cyber_attachment_rate: float = 0.10  # 10% of commercial customers
    umbrella_avg_premium: float = 500  # Annual
    cyber_avg_premium: float = 1200  # Annual

    def calculate_eo_automation_roi(self) -> Dict:
        """Calculate ROI for E&O Certificate of Insurance automation"""
        annual_cost = self.eo_automation_monthly_cost * 12
        claims_prevented = self.eo_baseline_claims_per_year * self.eo_claim_prevention_rate
        expected_savings = claims_prevented * self.eo_avg_claim_cost

        net_benefit = expected_savings - annual_cost
        roi_percent = (net_benefit / annual_cost * 100) if annual_cost > 0 else 0

        return {
            "investment": "E&O Certificate Automation",
            "monthly_cost": self.eo_automation_monthly_cost,
            "annual_cost": annual_cost,
            "expected_annual_savings": expected_savings,
            "net_annual_benefit": net_benefit,
            "roi_percent": roi_percent,
            "claims_prevented_per_year": claims_prevented,
            "payback_months": (annual_cost / (expected_savings / 12)) if expected_savings > 0 else float('inf'),
            "recommendation": "Highest-impact investment - prevents 40% of E&O claims"
        }

    def calculate_renewal_program_roi(self,
                                     total_policies: int,
                                     avg_commission_per_policy: float) -> Dict:
        """Calculate ROI for proactive renewal review program"""
        # Annual labor cost
        total_hours = total_policies * self.renewal_review_hours_per_policy
        annual_labor_cost = total_hours * self.renewal_staff_hourly_cost

        # Benefit: Improved retention
        policies_saved_year_1 = total_policies * self.renewal_retention_improvement
        revenue_saved_year_1 = policies_saved_year_1 * avg_commission_per_policy

        # 5-year compounding benefit (saved policies continue generating revenue)
        year_1_benefit = revenue_saved_year_1
        year_2_benefit = revenue_saved_year_1 * 1.015  # Compounds
        year_3_benefit = revenue_saved_year_1 * 1.030
        year_4_benefit = revenue_saved_year_1 * 1.045
        year_5_benefit = revenue_saved_year_1 * 1.060

        five_year_benefit = (year_1_benefit + year_2_benefit + year_3_benefit +
                            year_4_benefit + year_5_benefit)
        five_year_cost = annual_labor_cost * 5

        roi_percent = ((five_year_benefit - five_year_cost) / five_year_cost * 100) if five_year_cost > 0 else 0

        return {
            "investment": "Proactive Renewal Review Program",
            "annual_labor_hours": total_hours,
            "annual_labor_cost": annual_labor_cost,
            "year_1_retention_improvement": f"{self.renewal_retention_improvement:.1%}",
            "policies_saved_year_1": policies_saved_year_1,
            "year_1_revenue_impact": year_1_benefit,
            "five_year_benefit": five_year_benefit,
            "five_year_cost": five_year_cost,
            "five_year_roi_percent": roi_percent,
            "timeline_to_results": f"{self.renewal_improvement_timeline_months} months",
            "recommendation": "Retention improves 1.5-2% within 6 months"
        }

    def calculate_crosssell_program_roi(self,
                                       total_customers: int,
                                       commercial_customers: int,
                                       umbrella_commission_rate: float = 0.15,
                                       cyber_commission_rate: float = 0.20) -> Dict:
        """Calculate ROI for cross-selling program (Umbrella + Cyber)"""
        annual_cost = self.crosssell_program_monthly_cost * 12

        # Umbrella policy opportunity
        umbrella_policies_sold = total_customers * self.crosssell_umbrella_attachment_rate
        umbrella_annual_revenue = umbrella_policies_sold * self.umbrella_avg_premium * umbrella_commission_rate

        # Cyber policy opportunity
        cyber_policies_sold = commercial_customers * self.crosssell_cyber_attachment_rate
        cyber_annual_revenue = cyber_policies_sold * self.cyber_avg_premium * cyber_commission_rate

        total_annual_revenue = umbrella_annual_revenue + cyber_annual_revenue
        net_benefit = total_annual_revenue - annual_cost
        roi_percent = (net_benefit / annual_cost * 100) if annual_cost > 0 else 0

        return {
            "investment": "Cross-Sell Program (Umbrella + Cyber)",
            "annual_cost": annual_cost,
            "umbrella_policies_sold": umbrella_policies_sold,
            "umbrella_annual_revenue": umbrella_annual_revenue,
            "cyber_policies_sold": cyber_policies_sold,
            "cyber_annual_revenue": cyber_annual_revenue,
            "total_annual_revenue": total_annual_revenue,
            "net_annual_benefit": net_benefit,
            "roi_percent": roi_percent,
            "payback_months": (annual_cost / (total_annual_revenue / 12)) if total_annual_revenue > 0 else float('inf'),
            "recommendation": "High-margin products with excellent retention benefits"
        }


# ============================================================================
# MAIN SIMULATION PARAMETERS
# ============================================================================

@dataclass
class EnhancedSimulationParameters:
    """Enhanced simulation parameters with all benchmarks"""

    # Current State
    current_policies: int = 500
    current_customers: int = 400  # May differ from policies due to bundling
    baseline_lead_spend: float = 2000

    # Sub-models
    marketing: MarketingMix = field(default_factory=MarketingMix)
    staffing: StaffingModel = field(default_factory=StaffingModel)
    technology: TechnologyInvestment = field(default_factory=TechnologyInvestment)
    bundling: BundlingDynamics = field(default_factory=BundlingDynamics)
    commission: CommissionStructure = field(default_factory=CommissionStructure)
    financials: FinancialMetrics = field(default_factory=FinancialMetrics)
    investments: HighROIInvestments = field(default_factory=HighROIInvestments)

    # Financial Parameters
    avg_premium_annual: float = 1500
    fixed_monthly_overhead: float = 3000  # Rent, utilities, etc. (separate from staff/tech)

    # Growth stage
    growth_stage: GrowthStage = GrowthStage.GROWTH

    def get_marketing_budget_benchmark(self, annual_revenue: float) -> Dict:
        """
        Evaluate marketing spend against benchmarks
        Mature: 3-7%, Growth: 10-25%
        """
        annual_marketing = self.marketing.get_total_allocation() * 12

        if self.growth_stage == GrowthStage.MATURE:
            min_target = annual_revenue * 0.03
            max_target = annual_revenue * 0.07
            range_label = "3-7%"
        else:  # GROWTH
            min_target = annual_revenue * 0.10
            max_target = annual_revenue * 0.25
            range_label = "10-25%"

        percent_of_revenue = (annual_marketing / annual_revenue * 100) if annual_revenue > 0 else 0

        if annual_marketing < min_target:
            status = "under_invested"
            message = f"Below {range_label} target for {self.growth_stage.value} stage"
        elif annual_marketing > max_target:
            status = "over_invested"
            message = f"Above {range_label} range. Verify ROI justifies spend."
        else:
            status = "optimal"
            message = f"Within {range_label} target range"

        return {
            "annual_marketing_spend": annual_marketing,
            "percent_of_revenue": percent_of_revenue,
            "target_range": range_label,
            "min_target": min_target,
            "max_target": max_target,
            "status": status,
            "message": message
        }


# ============================================================================
# ENHANCED SIMULATOR
# ============================================================================

class EnhancedAgencySimulator:
    """Enhanced agency simulator with comprehensive benchmarks"""

    def __init__(self, params: EnhancedSimulationParameters):
        self.params = params

    def simulate_month(self, month_data: Dict) -> Dict:
        """
        Simulate one month with enhanced calculations

        Args:
            month_data: Dictionary with:
                - policies_start: Starting policies
                - customers_start: Starting customers
                - marketing_allocation: Marketing spend allocation
                - and other monthly inputs

        Returns:
            Dictionary with comprehensive month results
        """
        policies_start = month_data.get('policies_start', self.params.current_policies)
        customers_start = month_data.get('customers_start', self.params.current_customers)

        # Marketing & Lead Generation
        total_leads = self.params.marketing.get_total_leads()
        weighted_conversion = self.params.marketing.get_weighted_conversion_rate()

        # Adjust for producer productivity
        productivity_multiplier = self.params.staffing.get_producer_productivity_multiplier()
        effective_conversion = weighted_conversion * productivity_multiplier

        # New policies
        new_policies = total_leads * effective_conversion

        # Retention with bundling dynamics
        current_ppc = policies_start / customers_start if customers_start > 0 else 1.0

        # Calculate retention based on current policies per customer
        # Use a simpler model for now - base retention with bundling factor
        base_retention_annual = 0.85  # 85% annual
        if current_ppc >= 1.8:
            retention_annual = 0.95
        elif current_ppc >= 1.5:
            retention_annual = 0.91
        else:
            retention_annual = base_retention_annual

        # Convert to monthly
        retention_rate = retention_annual ** (1/12)
        retained_policies = policies_start * retention_rate

        # End state
        policies_end = retained_policies + new_policies

        # Estimate customers (some new policies = new customers, some = cross-sells)
        crosssell_rate = 0.20  # Assume 20% of new policies are cross-sells to existing customers
        new_customers = new_policies * (1 - crosssell_rate)
        customers_lost = customers_start * (1 - retention_rate)
        customers_end = customers_start - customers_lost + new_customers

        # Revenue calculations
        monthly_premium_per_policy = self.params.avg_premium_annual / 12

        # Total monthly premium in force
        total_monthly_premium = policies_end * monthly_premium_per_policy

        # Split revenue: new vs renewal premiums (annual values for commission calc)
        new_business_annual_premium = new_policies * self.params.avg_premium_annual
        renewal_annual_premium = retained_policies * self.params.avg_premium_annual

        # Commission revenue based on structure
        new_biz_commission = self.params.commission.get_commission_rate(is_new_business=True)
        renewal_commission = self.params.commission.get_commission_rate(is_new_business=False)

        # Monthly commission revenue
        commission_revenue = (new_business_annual_premium * new_biz_commission / 12) + \
                           (renewal_annual_premium * renewal_commission / 12)

        # Costs
        marketing_cost = self.params.marketing.get_total_allocation()
        staff_cost = self.params.staffing.get_total_monthly_cost()
        technology_cost = self.params.technology.get_total_monthly_cost()
        overhead_cost = self.params.fixed_monthly_overhead

        total_costs = marketing_cost + staff_cost + technology_cost + overhead_cost

        # Operating expenses (excluding D&A for EBITDA)
        operating_expenses = total_costs

        # EBITDA
        ebitda = commission_revenue - operating_expenses
        ebitda_margin = ebitda / commission_revenue if commission_revenue > 0 else 0

        # Net Profit (same as EBITDA for agencies typically)
        net_profit = ebitda

        # Unit Economics
        blended_cac = self.params.marketing.get_blended_cac(
            new_biz_commission,
            self.params.avg_premium_annual
        )

        avg_annual_revenue_per_customer = commission_revenue * 12 / customers_end if customers_end > 0 else 0

        ltv = self.params.financials.calculate_ltv(
            avg_annual_revenue_per_customer,
            retention_rate,
            blended_cac
        )

        ltv_cac_ratio = self.params.financials.calculate_ltv_cac_ratio(ltv, blended_cac)

        return {
            'policies_start': policies_start,
            'policies_end': policies_end,
            'customers_start': customers_start,
            'customers_end': customers_end,
            'policies_per_customer': policies_end / customers_end if customers_end > 0 else 0,
            'new_policies': new_policies,
            'retained_policies': retained_policies,
            'retention_rate': retention_rate,
            'total_leads': total_leads,
            'weighted_conversion': weighted_conversion,
            'effective_conversion': effective_conversion,
            'productivity_multiplier': productivity_multiplier,
            'commission_revenue': commission_revenue,
            'marketing_cost': marketing_cost,
            'staff_cost': staff_cost,
            'technology_cost': technology_cost,
            'overhead_cost': overhead_cost,
            'total_costs': total_costs,
            'operating_expenses': operating_expenses,
            'ebitda': ebitda,
            'ebitda_margin': ebitda_margin,
            'net_profit': net_profit,
            'ltv': ltv,
            'cac': blended_cac,
            'ltv_cac_ratio': ltv_cac_ratio
        }

    def simulate_scenario(self, months: int) -> pd.DataFrame:
        """Run multi-month simulation"""
        results = []

        policies = self.params.current_policies
        customers = self.params.current_customers

        for month in range(1, months + 1):
            month_result = self.simulate_month({
                'policies_start': policies,
                'customers_start': customers
            })

            month_result['month'] = month
            results.append(month_result)

            # Update for next month
            policies = month_result['policies_end']
            customers = month_result['customers_end']

        return pd.DataFrame(results)

    def generate_benchmark_report(self, simulation_results: pd.DataFrame) -> Dict:
        """Generate comprehensive benchmark comparison report"""

        final_month = simulation_results.iloc[-1]
        first_month = simulation_results.iloc[0]

        # Calculate annual figures from final month
        annual_revenue = final_month['commission_revenue'] * 12
        annual_operating_expenses = final_month['operating_expenses'] * 12

        # EBITDA evaluation
        ebitda_eval = self.params.financials.evaluate_ebitda_margin(
            final_month['ebitda_margin'],
            annual_revenue  # Using revenue as proxy for premium volume
        )

        # LTV:CAC evaluation
        ltv_cac_eval = self.params.financials.evaluate_ltv_cac_ratio(
            final_month['ltv_cac_ratio']
        )

        # Calculate organic growth
        months_elapsed = len(simulation_results)
        policies_growth = ((final_month['policies_end'] / first_month['policies_start']) - 1) * 100
        annualized_growth = (policies_growth / months_elapsed) * 12

        # Rule of 20
        rule_of_20 = self.params.financials.calculate_rule_of_20(
            annualized_growth,
            final_month['ebitda_margin']
        )

        # Marketing spend benchmark
        marketing_benchmark = self.params.get_marketing_budget_benchmark(annual_revenue)

        # Technology spend benchmark
        tech_benchmark = self.params.technology.get_target_budget(annual_revenue)

        # Staffing evaluation
        rpe_eval = self.params.staffing.evaluate_rpe(annual_revenue)

        # Commission structure validation
        total_staff_comp = self.params.staffing.get_total_monthly_cost() * 12
        comp_validation = self.params.commission.validate_compensation(
            total_staff_comp,
            annual_revenue
        )

        # High-ROI investment opportunities
        eo_roi = self.params.investments.calculate_eo_automation_roi()
        renewal_roi = self.params.investments.calculate_renewal_program_roi(
            int(final_month['policies_end']),
            annual_revenue / final_month['policies_end'] if final_month['policies_end'] > 0 else 0
        )
        crosssell_roi = self.params.investments.calculate_crosssell_program_roi(
            int(final_month['customers_end']),
            int(final_month['customers_end'] * 0.3)  # Assume 30% commercial
        )

        return {
            "financial_performance": {
                "annual_revenue": annual_revenue,
                "ebitda_margin": final_month['ebitda_margin'],
                "ebitda_evaluation": ebitda_eval,
                "rule_of_20": rule_of_20
            },
            "unit_economics": {
                "ltv": final_month['ltv'],
                "cac": final_month['cac'],
                "ltv_cac_ratio": final_month['ltv_cac_ratio'],
                "ltv_cac_evaluation": ltv_cac_eval
            },
            "growth_metrics": {
                "policies_growth_percent": policies_growth,
                "annualized_growth_percent": annualized_growth,
                "final_policies": final_month['policies_end'],
                "policies_per_customer": final_month['policies_per_customer'],
                "retention_rate": final_month['retention_rate']
            },
            "operational_benchmarks": {
                "marketing_spend": marketing_benchmark,
                "technology_spend": tech_benchmark,
                "revenue_per_employee": rpe_eval,
                "compensation_validation": comp_validation
            },
            "high_roi_investments": {
                "eo_automation": eo_roi,
                "renewal_program": renewal_roi,
                "crosssell_program": crosssell_roi
            }
        }


# ============================================================================
# TESTING & DEMO
# ============================================================================

def run_enhanced_demo():
    """Run demo of enhanced simulator"""
    print("=" * 80)
    print("AGENCY GROWTH SIMULATOR v3.0 - ENHANCED DEMO")
    print("=" * 80)

    # Create parameters
    params = EnhancedSimulationParameters()

    # Set baseline
    params.current_policies = 500
    params.current_customers = 350  # Some bundling already
    params.avg_premium_annual = 1500

    # Configure marketing mix
    params.marketing.referral.monthly_allocation = 500
    params.marketing.digital.monthly_allocation = 1500
    params.marketing.traditional.monthly_allocation = 500
    params.marketing.partnerships.monthly_allocation = 500

    # Configure staffing (more reasonable)
    params.staffing.producers = 2.0
    params.staffing.service_staff = 5.0  # Close to 2.8:1 ratio (2.5:1)
    params.staffing.admin_staff = 1.0
    params.staffing.producer_avg_comp = 70000
    params.staffing.service_staff_avg_comp = 45000
    params.staffing.admin_staff_avg_comp = 40000

    # Configure bundling (current state)
    params.bundling.auto_policies = 300
    params.bundling.home_policies = 200
    params.bundling.umbrella_policies = 80
    params.bundling.commercial_policies = 50
    params.bundling.cyber_policies = 20

    # Create simulator
    sim = EnhancedAgencySimulator(params)

    # Run 24-month simulation
    results = sim.simulate_scenario(24)

    # Generate benchmark report
    report = sim.generate_benchmark_report(results)

    # Display results
    print("\n" + "=" * 80)
    print("SIMULATION RESULTS (24 Months)")
    print("=" * 80)

    print(f"\n📊 FINANCIAL PERFORMANCE")
    print(f"   Annual Revenue: ${report['financial_performance']['annual_revenue']:,.0f}")
    print(f"   EBITDA Margin: {report['financial_performance']['ebitda_margin']:.1%}")
    print(f"   EBITDA Status: {report['financial_performance']['ebitda_evaluation']['status'].upper()}")
    print(f"   {report['financial_performance']['ebitda_evaluation']['message']}")

    print(f"\n🎯 RULE OF 20")
    r20 = report['financial_performance']['rule_of_20']
    print(f"   Score: {r20['score']:.1f} ({r20['rating']})")
    print(f"   {r20['calculation']}")
    print(f"   {r20['message']}")

    print(f"\n💰 UNIT ECONOMICS")
    print(f"   LTV: ${report['unit_economics']['ltv']:,.0f}")
    print(f"   CAC: ${report['unit_economics']['cac']:,.0f}")
    print(f"   LTV:CAC Ratio: {report['unit_economics']['ltv_cac_ratio']:.1f}:1")
    ltv_eval = report['unit_economics']['ltv_cac_evaluation']
    print(f"   Status: {ltv_eval['status'].upper()} - {ltv_eval['message']}")
    print(f"   {ltv_eval['recommendation']}")

    print(f"\n📈 GROWTH METRICS")
    print(f"   Final Policies: {report['growth_metrics']['final_policies']:.0f}")
    print(f"   Policies Per Customer: {report['growth_metrics']['policies_per_customer']:.2f}")
    print(f"   Retention Rate: {report['growth_metrics']['retention_rate']:.1%}")
    print(f"   Annualized Growth: {report['growth_metrics']['annualized_growth_percent']:.1f}%")

    print(f"\n⚙️  OPERATIONAL BENCHMARKS")

    mkt = report['operational_benchmarks']['marketing_spend']
    print(f"   Marketing Spend: ${mkt['annual_marketing_spend']:,.0f}/year ({mkt['percent_of_revenue']:.1f}%)")
    print(f"   Target Range: {mkt['target_range']} - Status: {mkt['status'].upper()}")

    tech = report['operational_benchmarks']['technology_spend']
    print(f"   Technology Spend: ${tech['annual_cost']:,.0f}/year ({tech['percent_of_revenue']:.1f}%)")
    print(f"   Status: {tech['status'].upper()}")

    rpe = report['operational_benchmarks']['revenue_per_employee']
    print(f"   Revenue Per Employee: ${rpe['rpe']:,.0f} ({rpe['rating']})")

    comp = report['operational_benchmarks']['compensation_validation']
    print(f"   Compensation Ratio: {comp['comp_ratio']:.1%} - {comp['status'].upper()}")

    print(f"\n🚀 HIGH-ROI INVESTMENT OPPORTUNITIES")

    eo = report['high_roi_investments']['eo_automation']
    print(f"\n   1. {eo['investment']}")
    print(f"      Cost: ${eo['annual_cost']:,.0f}/year")
    print(f"      Expected Savings: ${eo['expected_annual_savings']:,.0f}/year")
    print(f"      ROI: {eo['roi_percent']:.0f}%")
    print(f"      {eo['recommendation']}")

    renewal = report['high_roi_investments']['renewal_program']
    print(f"\n   2. {renewal['investment']}")
    print(f"      Cost: ${renewal['annual_labor_cost']:,.0f}/year")
    print(f"      5-Year Benefit: ${renewal['five_year_benefit']:,.0f}")
    print(f"      5-Year ROI: {renewal['five_year_roi_percent']:.0f}%")
    print(f"      {renewal['recommendation']}")

    cross = report['high_roi_investments']['crosssell_program']
    print(f"\n   3. {cross['investment']}")
    print(f"      Cost: ${cross['annual_cost']:,.0f}/year")
    print(f"      Revenue Opportunity: ${cross['total_annual_revenue']:,.0f}/year")
    print(f"      ROI: {cross['roi_percent']:.0f}%")
    print(f"      {cross['recommendation']}")

    print("\n" + "=" * 80)
    print("END OF DEMO")
    print("=" * 80)

    return results, report


if __name__ == "__main__":
    results, report = run_enhanced_demo()
