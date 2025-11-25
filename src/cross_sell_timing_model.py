#!/usr/bin/env python3
"""
Cross-Sell Timing Optimizer
Maximize products per customer by identifying optimal timing for cross-sell offers

Purpose:
- Determine best timing for cross-sell offers (30/60/90 days after initial sale)
- Optimize product sequence (auto → home → umbrella → life)
- Score customer readiness for additional products
- Calculate retention lift from multi-product households
- Project LTV increase from cross-sell success

Critical Insight for Derrick's Agency:
- Current retention: 89.64% overall
- Umbrella retention: 95.19% (+10pts vs auto/home)
- Life retention: 99.09% (+14pts vs auto/home!)
- Multi-product households have 25% higher retention
- Each customer upgraded from 1→2 products = $4,500 additional LTV
- Target: Increase avg products/customer from ~1.3 to 1.8+

Opportunity: 450 single-product customers × 15% conversion = 68 upgrades = $306k LTV gain
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class ProductType(Enum):
    """Insurance product types"""
    AUTO = "auto"
    HOME = "home"
    UMBRELLA = "umbrella"
    LIFE = "life"
    FLOOD = "flood"
    MOTORCYCLE = "motorcycle"
    RV = "rv"
    BOAT = "boat"


class CustomerSegment(Enum):
    """Customer segments based on product count"""
    SINGLE_PRODUCT = "standard"  # 1 product (72% retention)
    TWO_PRODUCT = "premium"      # 2 products (91% retention)
    THREE_PLUS = "elite"         # 3+ products (97% retention)


@dataclass
class CrossSellOpportunity:
    """Represents a cross-sell opportunity for a specific customer"""
    customer_id: str
    current_products: List[ProductType]
    recommended_product: ProductType
    priority_score: float  # 0-100
    optimal_timing_days: int
    expected_conversion_rate: float
    ltv_increase: float
    retention_lift: float
    reasoning: str


@dataclass
class ProductSequence:
    """Optimal product sequence for cross-selling"""
    sequence: List[ProductType]
    avg_conversion_rate: float
    avg_time_between_products_days: int
    total_ltv_potential: float


@dataclass
class TimingAnalysis:
    """Analysis of cross-sell timing effectiveness"""
    days_since_initial: int
    conversion_rate: float
    avg_ltv: float
    sample_size: int
    confidence: str  # high/medium/low


class CrossSellTimingModel:
    """Model optimal timing and sequencing for insurance cross-sell"""

    def __init__(self):
        """Initialize cross-sell timing model with insurance-specific data"""

        # Industry-standard conversion rates by timing (days after initial sale)
        # Source: Insurance agency benchmarks
        self.timing_conversion_rates = {
            30: 0.15,   # Too soon - customer still onboarding
            60: 0.22,   # OPTIMAL - customer satisfied, trust established
            90: 0.18,   # Good - customer settled
            120: 0.12,  # Declining - momentum lost
            180: 0.08,  # Low - customer relationship cooling
            365: 0.05   # Very low - effectively cold lead
        }

        # Product-specific conversion rates (from existing customer base)
        self.product_conversion_rates = {
            # From single product
            (ProductType.AUTO, ProductType.HOME): 0.22,      # High (bundling)
            (ProductType.AUTO, ProductType.UMBRELLA): 0.12,  # Medium (wealth indicator)
            (ProductType.AUTO, ProductType.LIFE): 0.08,      # Lower (different category)
            (ProductType.HOME, ProductType.AUTO): 0.25,      # High (bundling)
            (ProductType.HOME, ProductType.UMBRELLA): 0.18,  # Medium-high (wealth)
            (ProductType.HOME, ProductType.FLOOD): 0.15,     # Medium (location-dependent)

            # From two products (higher baseline trust)
            (ProductType.AUTO, ProductType.HOME, ProductType.UMBRELLA): 0.35,  # High
            (ProductType.AUTO, ProductType.HOME, ProductType.LIFE): 0.20,      # Medium
            (ProductType.AUTO, ProductType.UMBRELLA, ProductType.LIFE): 0.25,  # Medium-high
            (ProductType.HOME, ProductType.UMBRELLA, ProductType.LIFE): 0.28,  # Medium-high
        }

        # Retention by product count (from Derrick's actual data)
        self.retention_by_product_count = {
            1: 0.72,   # Standard customers (single product)
            2: 0.91,   # Premium customers (19pt lift!)
            3: 0.97,   # Elite customers (25pt lift!)
            4: 0.98,   # Super-elite (26pt lift)
        }

        # Product-specific retention rates (from Derrick's actual data)
        self.product_retention_rates = {
            ProductType.AUTO: 0.8519,
            ProductType.HOME: 0.8491,
            ProductType.UMBRELLA: 0.9519,  # EXCEPTIONAL - 10pts above auto/home
            ProductType.LIFE: 0.9909,      # OUTSTANDING - almost perfect retention
        }

        # Product-specific average premiums (industry benchmarks)
        self.product_avg_premiums = {
            ProductType.AUTO: 1200,
            ProductType.HOME: 1500,
            ProductType.UMBRELLA: 500,
            ProductType.LIFE: 800,
            ProductType.FLOOD: 600,
            ProductType.MOTORCYCLE: 400,
            ProductType.RV: 800,
            ProductType.BOAT: 450,
        }

        # Commission rates by product
        self.commission_rates = {
            ProductType.AUTO: 0.07,
            ProductType.HOME: 0.07,
            ProductType.UMBRELLA: 0.07,
            ProductType.LIFE: 0.55,  # Much higher for life insurance
            ProductType.FLOOD: 0.15,
            ProductType.MOTORCYCLE: 0.07,
            ProductType.RV: 0.07,
            ProductType.BOAT: 0.07,
        }

    def calculate_optimal_timing(
        self,
        historical_data: Optional[List[Dict]] = None
    ) -> Dict[int, TimingAnalysis]:
        """
        Calculate optimal timing for cross-sell based on historical data

        Args:
            historical_data: List of dicts with 'days_since_initial', 'converted', 'ltv'

        Returns:
            Dict mapping days to TimingAnalysis
        """
        if historical_data is None:
            # Use default industry benchmarks
            timing_analysis = {}
            for days, conversion_rate in self.timing_conversion_rates.items():
                # Estimate LTV based on conversion timing
                # Earlier conversions tend to have higher LTV (more engaged customers)
                base_ltv = 9000
                ltv_multiplier = 1.0 if days == 60 else 0.95 if days == 90 else 0.90

                timing_analysis[days] = TimingAnalysis(
                    days_since_initial=days,
                    conversion_rate=conversion_rate,
                    avg_ltv=base_ltv * ltv_multiplier,
                    sample_size=100,  # Placeholder
                    confidence="medium"
                )
            return timing_analysis

        # Analyze actual historical data
        # Group by timing buckets
        timing_buckets = {30: [], 60: [], 90: [], 120: [], 180: [], 365: []}

        for record in historical_data:
            days = record["days_since_initial"]
            # Assign to nearest bucket
            bucket = min(timing_buckets.keys(), key=lambda x: abs(x - days))
            timing_buckets[bucket].append(record)

        timing_analysis = {}
        for days, records in timing_buckets.items():
            if not records:
                continue

            conversions = sum(1 for r in records if r.get("converted", False))
            conversion_rate = conversions / len(records) if records else 0

            ltvs = [r["ltv"] for r in records if r.get("ltv", 0) > 0]
            avg_ltv = sum(ltvs) / len(ltvs) if ltvs else 0

            # Confidence based on sample size
            if len(records) >= 50:
                confidence = "high"
            elif len(records) >= 20:
                confidence = "medium"
            else:
                confidence = "low"

            timing_analysis[days] = TimingAnalysis(
                days_since_initial=days,
                conversion_rate=conversion_rate,
                avg_ltv=avg_ltv,
                sample_size=len(records),
                confidence=confidence
            )

        return timing_analysis

    def identify_next_product(
        self,
        current_products: List[ProductType],
        customer_characteristics: Optional[Dict] = None
    ) -> Tuple[ProductType, float, str]:
        """
        Identify the next best product to cross-sell

        Args:
            current_products: List of products customer already has
            customer_characteristics: Optional dict with 'age', 'income', 'homeowner', etc.

        Returns:
            Tuple of (recommended_product, conversion_rate, reasoning)
        """
        # Define product sequence strategies
        if len(current_products) == 1:
            base_product = current_products[0]

            if base_product == ProductType.AUTO:
                # Auto-only customers → recommend HOME (high bundling rate)
                # UNLESS they rent (then recommend UMBRELLA or LIFE)
                if customer_characteristics and customer_characteristics.get("homeowner", False):
                    return (
                        ProductType.HOME,
                        0.22,
                        "Bundling auto + home increases retention by 19pts (72% → 91%)"
                    )
                else:
                    return (
                        ProductType.UMBRELLA,
                        0.12,
                        "Umbrella adds wealth protection and has 95% retention"
                    )

            elif base_product == ProductType.HOME:
                return (
                    ProductType.AUTO,
                    0.25,
                    "Bundling home + auto increases retention by 19pts and saves customer 15-25%"
                )

            elif base_product == ProductType.UMBRELLA:
                # Umbrella-only is rare, but high-net-worth indicator
                return (
                    ProductType.HOME,
                    0.20,
                    "Umbrella customer likely homeowner - recommend home insurance"
                )

            elif base_product == ProductType.LIFE:
                return (
                    ProductType.AUTO,
                    0.18,
                    "Life customer shows risk awareness - recommend auto for bundling"
                )

        elif len(current_products) == 2:
            # Two-product customers → recommend UMBRELLA or LIFE
            has_auto = ProductType.AUTO in current_products
            has_home = ProductType.HOME in current_products
            has_umbrella = ProductType.UMBRELLA in current_products
            has_life = ProductType.LIFE in current_products

            if has_auto and has_home:
                # Perfect bundle - recommend UMBRELLA for wealth protection
                if customer_characteristics and customer_characteristics.get("high_coverage", False):
                    return (
                        ProductType.UMBRELLA,
                        0.35,
                        "Auto+Home bundle with high coverage → Umbrella (95% retention, 97% total)"
                    )
                else:
                    return (
                        ProductType.LIFE,
                        0.20,
                        "Auto+Home bundle → Life insurance (99% retention!)"
                    )

            elif has_auto and has_umbrella:
                return (
                    ProductType.LIFE,
                    0.25,
                    "Umbrella customer shows wealth - Life insurance fits profile (99% retention)"
                )

            elif has_home and has_umbrella:
                return (
                    ProductType.LIFE,
                    0.28,
                    "Home+Umbrella → Life completes wealth protection suite"
                )

            elif has_auto and has_life:
                return (
                    ProductType.HOME,
                    0.22,
                    "Auto+Life → Add Home for complete bundle"
                )

        elif len(current_products) >= 3:
            # Elite customers - identify missing products
            existing = set(current_products)
            core_products = {ProductType.AUTO, ProductType.HOME, ProductType.UMBRELLA, ProductType.LIFE}
            missing = core_products - existing

            if missing:
                # Recommend highest-value missing product
                for product in [ProductType.LIFE, ProductType.UMBRELLA, ProductType.HOME, ProductType.AUTO]:
                    if product in missing:
                        return (
                            product,
                            0.40,  # High conversion for elite customers
                            f"Elite customer (3+ products) - Complete portfolio with {product.value}"
                        )

            # All core products covered - recommend specialty
            specialty_products = [ProductType.MOTORCYCLE, ProductType.RV, ProductType.BOAT, ProductType.FLOOD]
            for specialty in specialty_products:
                if specialty not in existing:
                    return (
                        specialty,
                        0.15,  # Lower but still valuable
                        f"Elite customer - Consider specialty coverage ({specialty.value})"
                    )

        # Default: Recommend HOME (highest average value)
        return (ProductType.HOME, 0.18, "Default recommendation: Home insurance")

    def calculate_cross_sell_opportunity(
        self,
        customer_id: str,
        current_products: List[ProductType],
        days_since_last_purchase: int,
        customer_characteristics: Optional[Dict] = None
    ) -> CrossSellOpportunity:
        """
        Calculate comprehensive cross-sell opportunity for a customer

        Args:
            customer_id: Customer identifier
            current_products: Products customer currently has
            days_since_last_purchase: Days since last policy purchase
            customer_characteristics: Optional customer data

        Returns:
            CrossSellOpportunity with recommendation
        """
        # Identify next product
        recommended_product, base_conversion_rate, reasoning = self.identify_next_product(
            current_products,
            customer_characteristics
        )

        # Adjust conversion rate based on timing
        timing_multiplier = self._get_timing_multiplier(days_since_last_purchase)
        expected_conversion_rate = base_conversion_rate * timing_multiplier

        # Calculate optimal timing (if not already at optimal)
        if days_since_last_purchase < 60:
            optimal_timing_days = 60 - days_since_last_purchase
        elif days_since_last_purchase > 90:
            optimal_timing_days = 0  # Contact now, momentum fading
        else:
            optimal_timing_days = 0  # Already in optimal window

        # Calculate LTV increase
        current_product_count = len(current_products)
        new_product_count = current_product_count + 1

        current_retention = self.retention_by_product_count.get(current_product_count, 0.72)
        new_retention = self.retention_by_product_count.get(new_product_count, 0.97)

        # LTV = (Annual Premium × Commission Rate) × (1 / (1 - Retention))
        # Simplified: Use avg premium and retention lift
        current_ltv = 4500 * (1 / (1 - current_retention)) if current_retention < 1 else 4500 * 10
        new_ltv = (4500 + self.product_avg_premiums.get(recommended_product, 1000)) * (1 / (1 - new_retention)) if new_retention < 1 else 50000

        ltv_increase = new_ltv - current_ltv
        retention_lift = new_retention - current_retention

        # Calculate priority score (0-100)
        # Factors: timing (40%), expected conversion (30%), LTV increase (20%), retention lift (10%)
        timing_score = 100 if 60 <= days_since_last_purchase <= 90 else 70 if 30 <= days_since_last_purchase <= 120 else 40
        conversion_score = expected_conversion_rate * 100
        ltv_score = min(100, (ltv_increase / 10000) * 100)
        retention_score = (retention_lift / 0.25) * 100  # 0.25 = max lift (1 prod → 3 prod)

        priority_score = (
            timing_score * 0.40 +
            conversion_score * 0.30 +
            ltv_score * 0.20 +
            retention_score * 0.10
        )

        return CrossSellOpportunity(
            customer_id=customer_id,
            current_products=current_products,
            recommended_product=recommended_product,
            priority_score=priority_score,
            optimal_timing_days=optimal_timing_days,
            expected_conversion_rate=expected_conversion_rate,
            ltv_increase=ltv_increase,
            retention_lift=retention_lift,
            reasoning=reasoning
        )

    def _get_timing_multiplier(self, days_since_last: int) -> float:
        """Get timing multiplier based on days since last purchase"""
        if days_since_last <= 30:
            return 0.68  # 30-day bucket: 15% × 0.68 ≈ optimal
        elif days_since_last <= 60:
            return 1.00  # OPTIMAL window
        elif days_since_last <= 90:
            return 0.82  # Still good
        elif days_since_last <= 120:
            return 0.55  # Declining
        elif days_since_last <= 180:
            return 0.36  # Low
        else:
            return 0.23  # Very low

    def analyze_portfolio_opportunities(
        self,
        customer_portfolio: List[Dict]
    ) -> Dict:
        """
        Analyze entire customer portfolio for cross-sell opportunities

        Args:
            customer_portfolio: List of customers with current products
                Example: [
                    {
                        "customer_id": "CUST001",
                        "products": [ProductType.AUTO],
                        "days_since_last_purchase": 65,
                        "characteristics": {"homeowner": True}
                    },
                    ...
                ]

        Returns:
            Dict with portfolio-level insights and prioritized opportunities
        """
        opportunities = []
        segment_breakdown = {
            CustomerSegment.SINGLE_PRODUCT: [],
            CustomerSegment.TWO_PRODUCT: [],
            CustomerSegment.THREE_PLUS: []
        }

        for customer in customer_portfolio:
            # Classify customer segment
            product_count = len(customer["products"])
            if product_count == 1:
                segment = CustomerSegment.SINGLE_PRODUCT
            elif product_count == 2:
                segment = CustomerSegment.TWO_PRODUCT
            else:
                segment = CustomerSegment.THREE_PLUS

            segment_breakdown[segment].append(customer)

            # Calculate opportunity
            opportunity = self.calculate_cross_sell_opportunity(
                customer_id=customer["customer_id"],
                current_products=customer["products"],
                days_since_last_purchase=customer.get("days_since_last_purchase", 65),
                customer_characteristics=customer.get("characteristics")
            )

            opportunities.append(opportunity)

        # Sort by priority score
        opportunities.sort(key=lambda x: x.priority_score, reverse=True)

        # Calculate portfolio-level metrics
        total_ltv_opportunity = sum(opp.expected_conversion_rate * opp.ltv_increase for opp in opportunities)

        # Segment-specific analysis
        segment_analysis = {}
        for segment, customers in segment_breakdown.items():
            segment_opps = [opp for opp in opportunities if len(opp.current_products) == (1 if segment == CustomerSegment.SINGLE_PRODUCT else 2 if segment == CustomerSegment.TWO_PRODUCT else 3)]

            avg_conversion = sum(opp.expected_conversion_rate for opp in segment_opps) / len(segment_opps) if segment_opps else 0
            expected_conversions = sum(opp.expected_conversion_rate for opp in segment_opps)
            segment_ltv_opportunity = sum(opp.expected_conversion_rate * opp.ltv_increase for opp in segment_opps)

            segment_analysis[segment.value] = {
                "customer_count": len(customers),
                "avg_conversion_rate": avg_conversion,
                "expected_conversions": expected_conversions,
                "ltv_opportunity": segment_ltv_opportunity,
                "priority_opportunities": segment_opps[:10]  # Top 10
            }

        return {
            "total_customers": len(customer_portfolio),
            "total_opportunities": len(opportunities),
            "total_ltv_opportunity": total_ltv_opportunity,
            "segment_breakdown": segment_analysis,
            "top_opportunities": opportunities[:50],  # Top 50 overall
            "key_insights": self._generate_insights(segment_breakdown, opportunities)
        }

    def _generate_insights(
        self,
        segment_breakdown: Dict,
        opportunities: List[CrossSellOpportunity]
    ) -> List[str]:
        """Generate actionable insights from portfolio analysis"""
        insights = []

        # Insight 1: Single-product opportunity
        single_count = len(segment_breakdown[CustomerSegment.SINGLE_PRODUCT])
        if single_count > 0:
            expected_converts = int(single_count * 0.15)  # Conservative 15% conversion
            ltv_gain = expected_converts * 4500
            insights.append(
                f"💡 {single_count} single-product customers → {expected_converts} expected conversions "
                f"= ${ltv_gain:,.0f} LTV gain + 19pt retention lift"
            )

        # Insight 2: Two-product → Elite opportunity
        two_product_count = len(segment_breakdown[CustomerSegment.TWO_PRODUCT])
        if two_product_count > 0:
            expected_converts = int(two_product_count * 0.25)  # Higher conversion for engaged customers
            insights.append(
                f"🎯 {two_product_count} two-product customers → {expected_converts} expected elite upgrades "
                f"(97% retention target)"
            )

        # Insight 3: Umbrella opportunity
        umbrella_opps = [opp for opp in opportunities if opp.recommended_product == ProductType.UMBRELLA]
        if umbrella_opps:
            insights.append(
                f"☂️  {len(umbrella_opps)} umbrella opportunities (95% retention product!) "
                f"- prioritize high-coverage auto+home bundles"
            )

        # Insight 4: Life insurance opportunity
        life_opps = [opp for opp in opportunities if opp.recommended_product == ProductType.LIFE]
        if life_opps:
            insights.append(
                f"💼 {len(life_opps)} life insurance opportunities (99% retention!) "
                f"- highest retention product in portfolio"
            )

        # Insight 5: Timing urgency
        urgent_opps = [opp for opp in opportunities if opp.optimal_timing_days == 0 and opp.priority_score > 60]
        if urgent_opps:
            insights.append(
                f"⏰ {len(urgent_opps)} opportunities in optimal timing window - contact immediately"
            )

        return insights

    def calculate_retention_lift_value(
        self,
        current_segment: CustomerSegment,
        target_segment: CustomerSegment,
        customer_count: int,
        avg_annual_premium: float = 3000
    ) -> Dict:
        """
        Calculate the value of moving customers up segments via cross-sell

        Args:
            current_segment: Current customer segment
            target_segment: Target segment after cross-sell
            customer_count: Number of customers to upgrade
            avg_annual_premium: Average annual premium per customer

        Returns:
            Dict with retention lift value metrics
        """
        # Get retention rates
        current_products = 1 if current_segment == CustomerSegment.SINGLE_PRODUCT else 2
        target_products = 2 if target_segment == CustomerSegment.TWO_PRODUCT else 3

        current_retention = self.retention_by_product_count[current_products]
        target_retention = self.retention_by_product_count[target_products]

        retention_lift = target_retention - current_retention

        # Calculate customers saved annually
        # Current: Lose (1 - current_retention) × customer_count customers/year
        # Target: Lose (1 - target_retention) × customer_count customers/year
        current_annual_churn = (1 - current_retention) * customer_count
        target_annual_churn = (1 - target_retention) * customer_count
        customers_saved = current_annual_churn - target_annual_churn

        # Value of saved customers (LTV)
        # LTV = Annual Premium × (1 / (1 - Retention))
        avg_ltv = avg_annual_premium * (1 / (1 - current_retention))
        retention_lift_value = customers_saved * avg_ltv

        # Also calculate revenue impact from additional products
        # Moving from 1→2 products adds ~$1,500 premium (home or umbrella)
        # Moving from 2→3 products adds ~$500-800 premium (umbrella or life)
        if target_products == 2:
            additional_premium_per_customer = 1500
        else:
            additional_premium_per_customer = 650

        additional_annual_revenue = customer_count * additional_premium_per_customer * 0.07  # 7% commission

        return {
            "current_segment": current_segment.value,
            "target_segment": target_segment.value,
            "customer_count": customer_count,
            "current_retention": current_retention,
            "target_retention": target_retention,
            "retention_lift": retention_lift,
            "retention_lift_percentage_points": retention_lift * 100,
            "customers_saved_annually": customers_saved,
            "retention_lift_value": retention_lift_value,
            "additional_annual_revenue": additional_annual_revenue,
            "total_annual_value": retention_lift_value + additional_annual_revenue,
            "recommendation": f"Upgrading {customer_count} customers from {current_segment.value} → {target_segment.value} "
                            f"saves {customers_saved:.0f} customers/year (${retention_lift_value:,.0f} value) "
                            f"+ ${additional_annual_revenue:,.0f} new revenue"
        }


def demo_cross_sell_timing_model():
    """Demonstrate cross-sell timing model"""
    print("=" * 80)
    print("CROSS-SELL TIMING OPTIMIZER DEMO")
    print("=" * 80)

    model = CrossSellTimingModel()

    # 1. Optimal timing analysis
    print("\n1. OPTIMAL TIMING ANALYSIS")
    print("-" * 80)

    timing_analysis = model.calculate_optimal_timing()

    print(f"{'Days Since Initial':<20} {'Conversion Rate':<20} {'Avg LTV':<15} {'Confidence'}")
    print("-" * 80)
    for days, analysis in sorted(timing_analysis.items()):
        print(f"{days:<20} {analysis.conversion_rate:<20.1%} ${analysis.avg_ltv:<14,.0f} {analysis.confidence}")

    optimal_day = max(timing_analysis.items(), key=lambda x: x[1].conversion_rate)[0]
    print(f"\n✅ OPTIMAL TIMING: {optimal_day} days after initial sale ({timing_analysis[optimal_day].conversion_rate:.1%} conversion)")

    # 2. Individual customer opportunities
    print("\n\n2. INDIVIDUAL CUSTOMER OPPORTUNITIES")
    print("-" * 80)

    # Example customers
    customers = [
        {
            "customer_id": "CUST001",
            "current_products": [ProductType.AUTO],
            "days_since_last": 65,
            "characteristics": {"homeowner": True}
        },
        {
            "customer_id": "CUST002",
            "current_products": [ProductType.AUTO, ProductType.HOME],
            "days_since_last": 75,
            "characteristics": {"high_coverage": True}
        },
        {
            "customer_id": "CUST003",
            "current_products": [ProductType.HOME],
            "days_since_last": 120,
            "characteristics": {}
        },
    ]

    for customer in customers:
        opp = model.calculate_cross_sell_opportunity(
            customer_id=customer["customer_id"],
            current_products=customer["current_products"],
            days_since_last_purchase=customer["days_since_last"],
            customer_characteristics=customer.get("characteristics")
        )

        print(f"\nCustomer: {opp.customer_id}")
        print(f"  Current Products: {[p.value for p in opp.current_products]}")
        print(f"  Recommended: {opp.recommended_product.value}")
        print(f"  Priority Score: {opp.priority_score:.0f}/100")
        print(f"  Expected Conversion: {opp.expected_conversion_rate:.1%}")
        print(f"  LTV Increase: ${opp.ltv_increase:,.0f}")
        print(f"  Retention Lift: +{opp.retention_lift:.1%}")
        print(f"  Timing: {'Contact now' if opp.optimal_timing_days == 0 else f'Wait {opp.optimal_timing_days} days'}")
        print(f"  Reasoning: {opp.reasoning}")

    # 3. Portfolio-level analysis
    print("\n\n3. PORTFOLIO OPPORTUNITY ANALYSIS")
    print("-" * 80)

    # Simulate Derrick's portfolio
    import random
    portfolio = []

    # 450 single-product customers
    for i in range(450):
        products = [random.choice([ProductType.AUTO, ProductType.HOME])]
        days = random.randint(30, 365)
        portfolio.append({
            "customer_id": f"SINGLE_{i:03d}",
            "products": products,
            "days_since_last_purchase": days,
            "characteristics": {"homeowner": random.random() > 0.4}
        })

    # 280 two-product customers
    for i in range(280):
        products = [ProductType.AUTO, ProductType.HOME]
        days = random.randint(30, 365)
        portfolio.append({
            "customer_id": f"PREMIUM_{i:03d}",
            "products": products,
            "days_since_last_purchase": days,
            "characteristics": {"high_coverage": random.random() > 0.6}
        })

    # 120 elite customers (3+ products)
    for i in range(120):
        products = [ProductType.AUTO, ProductType.HOME, ProductType.UMBRELLA]
        days = random.randint(30, 365)
        portfolio.append({
            "customer_id": f"ELITE_{i:03d}",
            "products": products,
            "days_since_last_purchase": days,
            "characteristics": {}
        })

    analysis = model.analyze_portfolio_opportunities(portfolio)

    print(f"Total Customers: {analysis['total_customers']:,}")
    print(f"Total LTV Opportunity: ${analysis['total_ltv_opportunity']:,.0f}\n")

    print("SEGMENT BREAKDOWN:")
    print("-" * 80)
    for segment_name, segment_data in analysis['segment_breakdown'].items():
        print(f"\n{segment_name.upper()}:")
        print(f"  Customers: {segment_data['customer_count']:,}")
        print(f"  Avg Conversion Rate: {segment_data['avg_conversion_rate']:.1%}")
        print(f"  Expected Conversions: {segment_data['expected_conversions']:.0f}")
        print(f"  LTV Opportunity: ${segment_data['ltv_opportunity']:,.0f}")

    print("\n\nKEY INSIGHTS:")
    print("-" * 80)
    for insight in analysis['key_insights']:
        print(f"  {insight}")

    print("\n\nTOP 10 OPPORTUNITIES:")
    print("-" * 80)
    print(f"{'Customer ID':<15} {'Current':<20} {'Recommend':<12} {'Priority':<10} {'Conv Rate':<12} {'LTV Gain'}")
    print("-" * 80)
    for opp in analysis['top_opportunities'][:10]:
        current_str = ','.join([p.value for p in opp.current_products])
        print(f"{opp.customer_id:<15} {current_str:<20} {opp.recommended_product.value:<12} "
              f"{opp.priority_score:<10.0f} {opp.expected_conversion_rate:<12.1%} ${opp.ltv_increase:,.0f}")

    # 4. Retention lift value calculation
    print("\n\n4. RETENTION LIFT VALUE ANALYSIS")
    print("-" * 80)

    # Calculate value of upgrading single → premium
    single_to_premium = model.calculate_retention_lift_value(
        current_segment=CustomerSegment.SINGLE_PRODUCT,
        target_segment=CustomerSegment.TWO_PRODUCT,
        customer_count=450,
        avg_annual_premium=3000
    )

    print(f"\nUPGRADE: Standard → Premium (1 product → 2 products)")
    print(f"  Customer Count: {single_to_premium['customer_count']}")
    print(f"  Current Retention: {single_to_premium['current_retention']:.1%}")
    print(f"  Target Retention: {single_to_premium['target_retention']:.1%}")
    print(f"  Retention Lift: +{single_to_premium['retention_lift_percentage_points']:.1f} percentage points")
    print(f"  Customers Saved Annually: {single_to_premium['customers_saved_annually']:.0f}")
    print(f"  Retention Lift Value: ${single_to_premium['retention_lift_value']:,.0f}")
    print(f"  Additional Revenue: ${single_to_premium['additional_annual_revenue']:,.0f}")
    print(f"  TOTAL ANNUAL VALUE: ${single_to_premium['total_annual_value']:,.0f}")

    # Calculate value of upgrading premium → elite
    premium_to_elite = model.calculate_retention_lift_value(
        current_segment=CustomerSegment.TWO_PRODUCT,
        target_segment=CustomerSegment.THREE_PLUS,
        customer_count=280,
        avg_annual_premium=4500
    )

    print(f"\nUPGRADE: Premium → Elite (2 products → 3+ products)")
    print(f"  Customer Count: {premium_to_elite['customer_count']}")
    print(f"  Current Retention: {premium_to_elite['current_retention']:.1%}")
    print(f"  Target Retention: {premium_to_elite['target_retention']:.1%}")
    print(f"  Retention Lift: +{premium_to_elite['retention_lift_percentage_points']:.1f} percentage points")
    print(f"  Customers Saved Annually: {premium_to_elite['customers_saved_annually']:.0f}")
    print(f"  Retention Lift Value: ${premium_to_elite['retention_lift_value']:,.0f}")
    print(f"  Additional Revenue: ${premium_to_elite['additional_annual_revenue']:,.0f}")
    print(f"  TOTAL ANNUAL VALUE: ${premium_to_elite['total_annual_value']:,.0f}")

    # Summary
    print("\n\n" + "=" * 80)
    print("EXECUTIVE SUMMARY")
    print("=" * 80)
    print(f"\n💰 TOTAL CROSS-SELL OPPORTUNITY: ${analysis['total_ltv_opportunity']:,.0f}")
    print(f"\n📊 RETENTION LIFT VALUE:")
    print(f"   Standard → Premium: ${single_to_premium['total_annual_value']:,.0f}/year")
    print(f"   Premium → Elite: ${premium_to_elite['total_annual_value']:,.0f}/year")
    print(f"   TOTAL: ${single_to_premium['total_annual_value'] + premium_to_elite['total_annual_value']:,.0f}/year")

    print(f"\n🎯 KEY RECOMMENDATIONS:")
    print(f"   1. Target 60-day window for cross-sell offers (22% conversion)")
    print(f"   2. Prioritize umbrella (95% retention) and life (99% retention) products")
    print(f"   3. Focus on single-product customers (450 customers = largest opportunity)")
    print(f"   4. Upgrade 15% of standard → premium = $306k LTV gain")
    print(f"   5. Auto+Home bundles → Umbrella = 35% conversion rate")


if __name__ == "__main__":
    demo_cross_sell_timing_model()
