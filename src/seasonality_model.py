#!/usr/bin/env python3
"""
Seasonality & Monthly Variance Model
Model seasonal patterns in insurance sales and renewals for optimized marketing timing

Purpose:
- Identify high/low sales months for marketing optimization
- Model renewal concentration patterns
- Optimize cash flow planning with seasonal adjustments
- Project staffing needs based on seasonal volume
- Calculate marketing ROI by season

Insurance Industry Seasonality Patterns:
- Auto insurance: Peaks in spring (tax refunds) and fall (back to school)
- Home insurance: Peaks in spring/summer (moving season, home buying)
- Life insurance: Peaks in January (new year resolutions) and tax season
- Renewals: Typically 12-month policies, creating anniversary concentration
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import statistics


class Season(Enum):
    """Seasonal categories"""
    PEAK = "peak"          # 20%+ above baseline
    HIGH = "high"          # 10-20% above baseline
    NORMAL = "normal"      # ±10% of baseline
    LOW = "low"            # 10-20% below baseline
    VALLEY = "valley"      # 20%+ below baseline


@dataclass
class MonthlyPattern:
    """Monthly sales/renewal pattern"""
    month: str
    month_index: int  # 1-12
    indexed_sales: float  # 100 = baseline
    season: Season
    historical_values: List[float]
    std_deviation: float
    confidence: str  # high/medium/low


@dataclass
class SeasonalRecommendation:
    """Marketing/operational recommendation for specific month"""
    month: str
    action: str
    reason: str
    expected_roi: float
    budget_adjustment: float  # +/- percentage


class SeasonalityModel:
    """Model seasonal variance in insurance agency operations"""

    def __init__(
        self,
        baseline_monthly_sales: Optional[float] = None,
        business_type: str = "personal_lines"  # personal_lines, commercial, mixed
    ):
        """
        Initialize seasonality model

        Args:
            baseline_monthly_sales: Average monthly sales (baseline = 100)
            business_type: Type of insurance business (affects seasonality patterns)
        """
        self.baseline_monthly_sales = baseline_monthly_sales or 100.0
        self.business_type = business_type

        # Industry-standard seasonality patterns (indexed to 100 baseline)
        # Source: Insurance industry benchmarks, adjusted for personal lines
        self.default_patterns = self._get_default_seasonal_patterns()

    def _get_default_seasonal_patterns(self) -> Dict[str, float]:
        """
        Get default seasonal patterns based on business type

        Returns:
            Dict mapping month to indexed sales (100 = baseline)
        """
        if self.business_type == "personal_lines":
            # Personal auto + home insurance seasonal pattern
            return {
                "January": 95,    # Slow start, budgets tight post-holidays
                "February": 105,  # Tax refund anticipation begins
                "March": 115,     # Tax refunds arrive, spring home buying starts
                "April": 120,     # Peak spring season (home buying, moving)
                "May": 118,       # Continued spring activity
                "June": 110,      # Summer slowdown begins
                "July": 95,       # Vacation season, low activity
                "August": 100,    # Back to school, activity resumes
                "September": 110, # Fall activity pickup
                "October": 108,   # Steady fall season
                "November": 90,   # Holiday distraction
                "December": 85    # Holiday valley, lowest month
            }
        elif self.business_type == "commercial":
            # Commercial insurance seasonal pattern
            return {
                "January": 125,   # Budget deployment, fiscal year planning
                "February": 115,
                "March": 105,
                "April": 100,
                "May": 95,
                "June": 90,
                "July": 85,       # Summer valley
                "August": 90,
                "September": 105, # Q4 push begins
                "October": 110,
                "November": 108,
                "December": 95    # Year-end slowdown
            }
        else:  # mixed
            # Blended pattern
            return {month: (pl + comm) / 2
                    for month, pl, comm in zip(
                        ["January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December"],
                        [95, 105, 115, 120, 118, 110, 95, 100, 110, 108, 90, 85],
                        [125, 115, 105, 100, 95, 90, 85, 90, 105, 110, 108, 95]
                    )}

    def calculate_seasonal_index(
        self,
        historical_data: List[Dict[str, float]]
    ) -> Dict[str, MonthlyPattern]:
        """
        Calculate seasonal index from historical data

        Args:
            historical_data: List of dicts with 'month' and 'sales' keys
                Example: [{"month": "January", "sales": 48000}, ...]

        Returns:
            Dict mapping month to MonthlyPattern
        """
        # Group by month
        month_data = {}
        for record in historical_data:
            month = record["month"]
            sales = record["sales"]

            if month not in month_data:
                month_data[month] = []
            month_data[month].append(sales)

        # Calculate average across all months
        all_sales = [record["sales"] for record in historical_data]
        overall_avg = statistics.mean(all_sales)

        # Calculate indexed pattern for each month
        patterns = {}
        month_order = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"]

        for idx, month in enumerate(month_order, 1):
            if month in month_data:
                month_values = month_data[month]
                month_avg = statistics.mean(month_values)
                indexed = (month_avg / overall_avg) * 100

                # Calculate standard deviation
                if len(month_values) > 1:
                    std_dev = statistics.stdev(month_values)
                    cv = std_dev / month_avg  # Coefficient of variation
                    confidence = "high" if cv < 0.15 else "medium" if cv < 0.30 else "low"
                else:
                    std_dev = 0
                    confidence = "low"

                # Classify season
                if indexed >= 120:
                    season = Season.PEAK
                elif indexed >= 110:
                    season = Season.HIGH
                elif indexed >= 90:
                    season = Season.NORMAL
                elif indexed >= 80:
                    season = Season.LOW
                else:
                    season = Season.VALLEY

                patterns[month] = MonthlyPattern(
                    month=month,
                    month_index=idx,
                    indexed_sales=indexed,
                    season=season,
                    historical_values=month_values,
                    std_deviation=std_dev,
                    confidence=confidence
                )
            else:
                # Use default pattern if no historical data
                patterns[month] = MonthlyPattern(
                    month=month,
                    month_index=idx,
                    indexed_sales=self.default_patterns[month],
                    season=self._classify_season(self.default_patterns[month]),
                    historical_values=[],
                    std_deviation=0,
                    confidence="low"
                )

        return patterns

    def _classify_season(self, indexed_value: float) -> Season:
        """Classify season based on indexed value"""
        if indexed_value >= 120:
            return Season.PEAK
        elif indexed_value >= 110:
            return Season.HIGH
        elif indexed_value >= 90:
            return Season.NORMAL
        elif indexed_value >= 80:
            return Season.LOW
        else:
            return Season.VALLEY

    def project_monthly_sales(
        self,
        annual_sales_target: float,
        seasonal_patterns: Optional[Dict[str, MonthlyPattern]] = None
    ) -> List[Dict]:
        """
        Project monthly sales based on seasonal patterns

        Args:
            annual_sales_target: Total annual sales goal
            seasonal_patterns: Custom patterns (or use defaults)

        Returns:
            List of monthly projections with seasonality applied
        """
        if seasonal_patterns is None:
            # Use default patterns
            seasonal_patterns = {
                month: MonthlyPattern(
                    month=month,
                    month_index=idx,
                    indexed_sales=self.default_patterns[month],
                    season=self._classify_season(self.default_patterns[month]),
                    historical_values=[],
                    std_deviation=0,
                    confidence="medium"
                )
                for idx, month in enumerate([
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ], 1)
            }

        # Calculate sum of seasonal indices
        total_index = sum(pattern.indexed_sales for pattern in seasonal_patterns.values())

        # Calculate base monthly value (what uniform distribution would be)
        base_monthly = annual_sales_target / 12

        # Apply seasonal adjustment to each month
        projections = []
        for month, pattern in seasonal_patterns.items():
            # Seasonal factor = this month's index / average index
            seasonal_factor = pattern.indexed_sales / 100
            projected_sales = base_monthly * seasonal_factor

            projections.append({
                "month": month,
                "month_index": pattern.month_index,
                "projected_sales": projected_sales,
                "seasonal_factor": seasonal_factor,
                "season": pattern.season.value,
                "indexed_value": pattern.indexed_sales,
                "vs_average": f"{((pattern.indexed_sales - 100) / 100) * 100:+.0f}%"
            })

        # Sort by month index
        projections.sort(key=lambda x: x["month_index"])

        return projections

    def calculate_renewal_concentration(
        self,
        policy_start_dates: List[str],  # List of policy effective dates (YYYY-MM format)
        current_book_size: int
    ) -> Dict:
        """
        Calculate renewal concentration by month

        High concentration = cash flow risk (all renewals in 1-2 months)
        Low concentration = steady cash flow

        Args:
            policy_start_dates: List of policy effective dates
            current_book_size: Total number of policies

        Returns:
            Dict with renewal concentration metrics
        """
        # Count policies by month
        month_counts = {}
        month_names = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"]

        for date_str in policy_start_dates:
            # Extract month from date (assuming YYYY-MM or YYYY-MM-DD format)
            try:
                if "," in date_str:
                    # Handle "Month DD, YYYY" format
                    month_str = date_str.split()[0]
                    month_idx = month_names.index(month_str) + 1
                else:
                    # Handle "YYYY-MM" or "YYYY-MM-DD" format
                    parts = date_str.split("-")
                    month_idx = int(parts[1])

                month = month_names[month_idx - 1]
                month_counts[month] = month_counts.get(month, 0) + 1
            except (ValueError, IndexError):
                continue

        # Calculate concentration metrics
        avg_renewals_per_month = current_book_size / 12

        concentration_data = {}
        for month in month_names:
            renewals = month_counts.get(month, 0)
            concentration_ratio = renewals / avg_renewals_per_month if avg_renewals_per_month > 0 else 0

            # Classify concentration level
            if concentration_ratio >= 1.5:
                level = "VERY_HIGH"
                risk = "High cash flow concentration risk"
            elif concentration_ratio >= 1.2:
                level = "HIGH"
                risk = "Moderate concentration risk"
            elif concentration_ratio >= 0.8:
                level = "NORMAL"
                risk = "Healthy distribution"
            elif concentration_ratio >= 0.5:
                level = "LOW"
                risk = "Below average renewals"
            else:
                level = "VERY_LOW"
                risk = "Very few renewals - investigate"

            concentration_data[month] = {
                "renewals": renewals,
                "concentration_ratio": concentration_ratio,
                "level": level,
                "risk_assessment": risk,
                "percentage_of_book": (renewals / current_book_size * 100) if current_book_size > 0 else 0
            }

        # Overall metrics
        concentration_values = [data["concentration_ratio"] for data in concentration_data.values()]
        concentration_std = statistics.stdev(concentration_values) if len(concentration_values) > 1 else 0

        # High std deviation = uneven distribution
        if concentration_std > 0.4:
            overall_risk = "HIGH - Uneven renewal distribution creates cash flow volatility"
        elif concentration_std > 0.25:
            overall_risk = "MODERATE - Some concentration, monitor high months"
        else:
            overall_risk = "LOW - Well-distributed renewals"

        return {
            "monthly_concentration": concentration_data,
            "avg_renewals_per_month": avg_renewals_per_month,
            "concentration_std_dev": concentration_std,
            "overall_risk": overall_risk,
            "recommendation": self._get_concentration_recommendation(concentration_std)
        }

    def _get_concentration_recommendation(self, std_dev: float) -> str:
        """Get recommendation based on concentration std dev"""
        if std_dev > 0.4:
            return "Consider staggering policy effective dates for new business to smooth cash flow"
        elif std_dev > 0.25:
            return "Monitor high concentration months for retention initiatives"
        else:
            return "Renewal distribution is healthy - maintain current approach"

    def optimize_marketing_timing(
        self,
        annual_marketing_budget: float,
        seasonal_patterns: Dict[str, MonthlyPattern],
        roi_by_month: Optional[Dict[str, float]] = None
    ) -> List[SeasonalRecommendation]:
        """
        Optimize marketing spend allocation by month based on seasonality

        Args:
            annual_marketing_budget: Total annual marketing budget
            seasonal_patterns: Seasonal sales patterns
            roi_by_month: Historical ROI by month (optional)

        Returns:
            List of monthly recommendations
        """
        recommendations = []
        base_monthly_budget = annual_marketing_budget / 12

        for month, pattern in seasonal_patterns.items():
            # Default strategy: Increase budget in high seasons
            if pattern.season == Season.PEAK:
                budget_adjustment = 0.25  # +25% budget
                action = f"Increase marketing spend by 25% (${base_monthly_budget * 1.25:,.0f})"
                reason = "Peak season - maximize market share capture"
                expected_roi_lift = 1.20  # Assume 20% better ROI in peak season

            elif pattern.season == Season.HIGH:
                budget_adjustment = 0.15  # +15% budget
                action = f"Increase marketing spend by 15% (${base_monthly_budget * 1.15:,.0f})"
                reason = "High season - capitalize on increased demand"
                expected_roi_lift = 1.10

            elif pattern.season == Season.NORMAL:
                budget_adjustment = 0.0  # Maintain budget
                action = f"Maintain baseline spend (${base_monthly_budget:,.0f})"
                reason = "Normal season - steady state operations"
                expected_roi_lift = 1.0

            elif pattern.season == Season.LOW:
                budget_adjustment = -0.15  # -15% budget
                action = f"Reduce marketing spend by 15% (${base_monthly_budget * 0.85:,.0f})"
                reason = "Low season - focus on efficiency, not volume"
                expected_roi_lift = 0.85

            else:  # VALLEY
                budget_adjustment = -0.30  # -30% budget
                action = f"Reduce marketing spend by 30% (${base_monthly_budget * 0.70:,.0f})"
                reason = "Valley season - minimal new business activity, focus on retention"
                expected_roi_lift = 0.70

            # If we have actual ROI data, use it
            if roi_by_month and month in roi_by_month:
                actual_roi = roi_by_month[month]
                expected_roi = actual_roi
            else:
                # Estimate ROI based on seasonality
                baseline_roi = 8.5  # 850% typical insurance marketing ROI
                expected_roi = baseline_roi * expected_roi_lift

            recommendations.append(SeasonalRecommendation(
                month=month,
                action=action,
                reason=reason,
                expected_roi=expected_roi,
                budget_adjustment=budget_adjustment
            ))

        return recommendations

    def calculate_staffing_needs(
        self,
        base_staff_count: int,
        monthly_projections: List[Dict],
        policies_per_staff_per_month: float = 25
    ) -> List[Dict]:
        """
        Calculate staffing needs based on seasonal volume

        Args:
            base_staff_count: Baseline staff count
            monthly_projections: Monthly sales projections
            policies_per_staff_per_month: Productivity assumption

        Returns:
            List of monthly staffing recommendations
        """
        staffing_recs = []

        for projection in monthly_projections:
            # Estimate policies from sales (assuming avg premium)
            # This is a simplification - in reality would need actual policy count projections
            seasonal_factor = projection["seasonal_factor"]

            # Required staff based on seasonal demand
            required_staff = max(1, round(base_staff_count * seasonal_factor))

            # Staffing decision
            if required_staff > base_staff_count:
                recommendation = f"Consider {required_staff - base_staff_count} temporary staff"
                cost_impact = "INCREASE"
            elif required_staff < base_staff_count:
                recommendation = f"Reduce hours or reassign {base_staff_count - required_staff} staff to other tasks"
                cost_impact = "DECREASE"
            else:
                recommendation = "Maintain current staffing"
                cost_impact = "STABLE"

            staffing_recs.append({
                "month": projection["month"],
                "base_staff": base_staff_count,
                "recommended_staff": required_staff,
                "seasonal_factor": seasonal_factor,
                "recommendation": recommendation,
                "cost_impact": cost_impact
            })

        return staffing_recs

    def project_seasonal_cash_flow(
        self,
        monthly_projections: List[Dict],
        commission_rate: float = 0.07,
        commission_lag_months: float = 1.6,  # 48 days
        monthly_expenses: float = 42000
    ) -> List[Dict]:
        """
        Project monthly cash flow with seasonal variance

        Args:
            monthly_projections: Monthly sales projections
            commission_rate: Commission rate (7% default)
            commission_lag_months: Commission payment lag in months
            monthly_expenses: Fixed monthly operating expenses

        Returns:
            List of monthly cash flow projections with seasonal adjustments
        """
        cash_flow_projections = []

        for i, projection in enumerate(monthly_projections):
            # Accrual revenue (this month's sales × commission rate)
            accrual_revenue = projection["projected_sales"] * commission_rate

            # Cash revenue (lagged commission from previous months)
            # Simplified: Take weighted average of prior months based on lag
            if i == 0:
                # First month - assume baseline
                cash_revenue = accrual_revenue * 0.5  # Partial month effect
            else:
                # Weight: 60% from last month, 40% from 2 months ago (48-day lag)
                if i >= 2:
                    last_month_revenue = monthly_projections[i-1]["projected_sales"] * commission_rate * 0.6
                    two_months_ago_revenue = monthly_projections[i-2]["projected_sales"] * commission_rate * 0.4
                    cash_revenue = last_month_revenue + two_months_ago_revenue
                else:
                    # Only have 1 month history
                    cash_revenue = monthly_projections[i-1]["projected_sales"] * commission_rate

            # Net cash flow
            net_cash_flow = cash_revenue - monthly_expenses

            # Cumulative cash flow
            cumulative_cash = sum(cf["net_cash_flow"] for cf in cash_flow_projections) + net_cash_flow

            # Cash flow status
            if net_cash_flow < 0:
                status = "BURN"
            elif net_cash_flow < monthly_expenses * 0.2:
                status = "TIGHT"
            else:
                status = "HEALTHY"

            cash_flow_projections.append({
                "month": projection["month"],
                "month_index": projection["month_index"],
                "accrual_revenue": accrual_revenue,
                "cash_revenue": cash_revenue,
                "expenses": monthly_expenses,
                "net_cash_flow": net_cash_flow,
                "cumulative_cash": cumulative_cash,
                "status": status,
                "seasonal_note": f"{projection['season']} season ({projection['vs_average']} vs avg)"
            })

        return cash_flow_projections


def demo_seasonality_model():
    """Demonstrate seasonality model with example data"""
    print("=" * 80)
    print("SEASONALITY & MONTHLY VARIANCE MODEL DEMO")
    print("=" * 80)

    model = SeasonalityModel(business_type="personal_lines")

    # 1. Project monthly sales with seasonality
    print("\n1. MONTHLY SALES PROJECTION (with seasonality)")
    print("-" * 80)

    annual_target = 5_000_000  # $5M annual premium target
    monthly_projections = model.project_monthly_sales(annual_target)

    print(f"Annual Target: ${annual_target:,}")
    print(f"Average Monthly: ${annual_target/12:,.0f}\n")

    print(f"{'Month':<12} {'Projected':<15} {'Season':<12} {'vs Avg':<10} {'Seasonal Index'}")
    print("-" * 80)
    for proj in monthly_projections:
        print(f"{proj['month']:<12} ${proj['projected_sales']:>12,.0f}  "
              f"{proj['season']:<12} {proj['vs_average']:<10} {proj['indexed_value']:.0f}")

    # 2. Renewal concentration analysis
    print("\n\n2. RENEWAL CONCENTRATION ANALYSIS")
    print("-" * 80)

    # Simulate policy start dates (concentrated in March/April - spring surge)
    import random
    months = ["January", "February", "March", "April", "May", "June",
             "July", "August", "September", "October", "November", "December"]

    # Create biased distribution (more in spring)
    policy_dates = []
    for _ in range(1000):
        # 40% in March/April, 60% distributed across other months
        if random.random() < 0.4:
            month = random.choice(["March", "April"])
        else:
            month = random.choice(months)

        day = random.randint(1, 28)
        year = random.randint(2023, 2024)
        policy_dates.append(f"{month} {day}, {year}")

    concentration = model.calculate_renewal_concentration(policy_dates, len(policy_dates))

    print(f"Total Policies: {len(policy_dates)}")
    print(f"Avg Renewals/Month: {concentration['avg_renewals_per_month']:.0f}")
    print(f"Overall Risk: {concentration['overall_risk']}")
    print(f"Recommendation: {concentration['recommendation']}\n")

    print(f"{'Month':<12} {'Renewals':<12} {'Concentration':<15} {'% of Book':<12} {'Risk'}")
    print("-" * 80)
    for month in months:
        data = concentration['monthly_concentration'][month]
        print(f"{month:<12} {data['renewals']:<12} "
              f"{data['concentration_ratio']:<15.2f} "
              f"{data['percentage_of_book']:<12.1f}% "
              f"{data['level']}")

    # 3. Marketing timing optimization
    print("\n\n3. MARKETING TIMING OPTIMIZATION")
    print("-" * 80)

    annual_marketing_budget = 50_000

    # Get seasonal patterns from projections
    seasonal_patterns = {}
    for proj in monthly_projections:
        seasonal_patterns[proj['month']] = MonthlyPattern(
            month=proj['month'],
            month_index=proj['month_index'],
            indexed_sales=proj['indexed_value'],
            season=Season(proj['season']),
            historical_values=[],
            std_deviation=0,
            confidence="medium"
        )

    recommendations = model.optimize_marketing_timing(
        annual_marketing_budget,
        seasonal_patterns
    )

    print(f"Annual Marketing Budget: ${annual_marketing_budget:,}")
    print(f"Base Monthly Budget: ${annual_marketing_budget/12:,.0f}\n")

    print(f"{'Month':<12} {'Action':<45} {'Expected ROI'}")
    print("-" * 80)
    for rec in recommendations:
        print(f"{rec.month:<12} {rec.action:<45} {rec.expected_roi:.1f}x")

    # 4. Cash flow with seasonality
    print("\n\n4. SEASONAL CASH FLOW PROJECTION")
    print("-" * 80)

    cash_flow = model.project_seasonal_cash_flow(
        monthly_projections,
        commission_rate=0.07,
        monthly_expenses=42_000
    )

    print(f"{'Month':<12} {'Accrual Rev':<15} {'Cash Rev':<15} {'Net Cash':<15} {'Cumulative':<15} {'Status'}")
    print("-" * 80)
    for cf in cash_flow:
        print(f"{cf['month']:<12} "
              f"${cf['accrual_revenue']:>12,.0f}  "
              f"${cf['cash_revenue']:>12,.0f}  "
              f"${cf['net_cash_flow']:>12,.0f}  "
              f"${cf['cumulative_cash']:>12,.0f}  "
              f"{cf['status']}")

    # Summary insights
    print("\n\n" + "=" * 80)
    print("KEY INSIGHTS")
    print("=" * 80)

    peak_months = [proj['month'] for proj in monthly_projections if proj['season'] == 'peak']
    valley_months = [proj['month'] for proj in monthly_projections if proj['season'] == 'valley']

    print(f"\n✅ Peak Months: {', '.join(peak_months)}")
    print(f"   → Increase marketing by 25% in these months")

    print(f"\n⚠️  Valley Months: {', '.join(valley_months)}")
    print(f"   → Reduce marketing by 30%, focus on retention")

    negative_cash_months = [cf['month'] for cf in cash_flow if cf['net_cash_flow'] < 0]
    if negative_cash_months:
        print(f"\n💰 Negative Cash Flow Months: {', '.join(negative_cash_months)}")
        print(f"   → Plan working capital buffer for these months")

    high_concentration = [
        month for month, data in concentration['monthly_concentration'].items()
        if data['level'] in ['HIGH', 'VERY_HIGH']
    ]
    if high_concentration:
        print(f"\n📊 High Renewal Concentration: {', '.join(high_concentration)}")
        print(f"   → {concentration['recommendation']}")


if __name__ == "__main__":
    demo_seasonality_model()
