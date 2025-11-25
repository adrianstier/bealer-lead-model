# Dashboard Integration Plan - Phase 1 & Phase 2
**Date:** November 25, 2025
**Status:** Ready for Implementation
**Priority:** HIGH - Integrate Phase 1 models + Phase 2 growth-focused models

---

## Executive Summary

This plan outlines the integration of **Phase 1 backend models** and **Phase 2 growth models** into the React frontend, transforming the Agency Growth Platform into a comprehensive business intelligence tool calibrated with **Derrick's actual performance data**.

### Actual Performance Metrics (Nov 2025)
- **Retention:** 89.64% overall (vs 85% benchmark) ✅ STRONG
- **Monthly Renewal Revenue:** $306,556
- **Annual Run-Rate:** $3.68M premium (~$258k commission)
- **Product Retention:** Umbrella 95.19%, Life 99.09% (exceptional)

### Strategic Focus
**OLD:** Retention crisis (incorrect 49% finding)
**NEW:** Growth optimization (leverage strong 89.64% retention)

---

## Phase 1 Models - Ready to Integrate

### 1. Loss Ratio & Profitability Dashboard

**Backend:** `src/loss_ratio_model.py` ✅ Complete
**Purpose:** Track claims losses and true profitability (prevent $60k+ forecast errors)

**UI Components Needed:**

```typescript
// 1. Combined Ratio Gauge
<CombinedRatioGauge
  currentRatio={0.88}  // 88% combined ratio
  bonusThreshold={0.95}  // <95% = full bonus
  status="FULL_BONUS"
/>

// 2. Product Profitability Breakdown
<ProductProfitabilityChart
  products={[
    { name: "Auto", lossRatio: 0.68, combinedRatio: 0.93, profit: 35000 },
    { name: "Home", lossRatio: 0.62, combinedRatio: 0.87, profit: 28000 },
    { name: "Umbrella", lossRatio: 0.45, combinedRatio: 0.70, profit: 12000 }
  ]}
/>

// 3. Profitability vs Revenue Comparison
<ProfitabilityVsRevenueChart
  revenueGrowth={0.15}  // 15% revenue growth
  profitGrowth={0.08}   // But only 8% profit growth (loss ratio increased)
  warningThreshold={0.05}  // Warn if >5% gap
/>

// 4. Bonus Eligibility Tracker
<BonusEligibilityCard
  currentCombinedRatio={0.88}
  bonusThreshold={0.95}
  estimatedBonus={35000}
  riskLevel="LOW"
/>
```

**Integration Points:**
- Add tab to main dashboard: "Profitability"
- Parse claims data from `data/04_raw_reports/2025-10_Claims_Detail_Report.xlsx`
- Connect to backend model via API or direct Python integration

**Key Metrics to Display:**
- Combined ratio by product (gauge + trend)
- Loss ratio trend (12-month chart)
- Bonus eligibility status (green/yellow/red indicator)
- Agency profit vs revenue (comparison chart)
- Claims frequency and severity trends

**Value:** Prevents 20-40% profitability forecast errors

---

### 2. Rate Environment & Elasticity Dashboard

**Backend:** `src/rate_environment_model.py` ✅ Complete
**Purpose:** Model impact of rate increases on retention and revenue

**UI Components Needed:**

```typescript
// 1. Rate Impact Calculator
<RateImpactCalculator
  currentRetention={0.8964}  // Derrick's actual
  plannedRateIncrease={0.10}  // 10% slider
  marketCondition="hard"  // hard/moderate/soft
  onCalculate={(result) => {
    // result.adjustedRetention = 0.891
    // result.additionalChurn = 0.0054
    // result.severity = "MODERATE"
  }}
/>

// 2. Revenue Decomposition Chart
<RevenueDecompositionChart
  totalGrowth={0.155}  // 15.5% total revenue growth
  policyContribution={0.05}  // 5% from new policies
  rateContribution={0.10}  // 10% from rate increases
  churnImpact={-0.005}  // -0.5% from rate-driven churn
/>

// 3. LTV with Inflation Projection
<LTVInflationComparison
  ltvWithoutInflation={4780}  // Traditional calculation
  ltvWithInflation={6260}  // Corrected (31% higher!)
  annualRateIncrease={0.08}
/>

// 4. Rate Scenario Comparison
<RateScenarioTable
  scenarios={[
    { rate: 0.08, retention: 0.894, revenue: 3850000, label: "Conservative" },
    { rate: 0.10, retention: 0.891, revenue: 3950000, label: "Moderate" },
    { rate: 0.12, retention: 0.887, revenue: 4020000, label: "Aggressive" }
  ]}
/>
```

**Integration Points:**
- Add interactive slider for rate increase scenarios
- Show decomposition of revenue growth (organic vs rate)
- Display LTV calculations with/without inflation
- Market competitiveness selector (hard/moderate/soft)

**Key Metrics to Display:**
- Current rate environment (8-12% annual increases)
- Retention impact of rate changes
- Revenue decomposition (policy growth vs rate vs churn)
- LTV with premium inflation
- Competitive positioning

**Value:** Corrects revenue forecasts by $50-150k/year

---

### 3. Cash Flow & Working Capital Dashboard

**Backend:** `src/cash_flow_model.py` ✅ Complete
**Purpose:** Model commission lag and prevent cash flow crises

**UI Components Needed:**

```typescript
// 1. Cash Flow vs Accrual Comparison
<CashFlowVsAccrualCard
  accrualProfit={12000}  // P&L shows profit
  netCashFlow={-42000}  // But burning cash!
  warningLevel="HIGH"  // Cash flow negative
/>

// 2. Working Capital Requirement Calculator
<WorkingCapitalCalculator
  monthlyExpenses={42000}
  monthlyGrowthRate={0.08}
  commissionLagDays={48}
  result={{
    baseBuffer: 126000,  // 3 months expenses
    growthBuffer: 33600,  // Growth cushion
    lagBuffer: 33600,  // Commission lag buffer
    totalWCNeed: 193200,  // Total needed
    monthsOfRunway: 4.6
  }}
/>

// 3. 12-Month Cash Flow Projection
<CashFlowProjectionChart
  projection={[
    { month: 1, accrual: 12000, cash: -42000, cumulative: -42000 },
    { month: 2, accrual: 13000, cash: -38000, cumulative: -80000 },
    // ... 12 months
    { month: 12, accrual: 22000, cash: 18000, cumulative: 45000 }
  ]}
  highlightCashBurnPeriod={true}
/>

// 4. Cash Burn Warning
<CashBurnAlert
  currentCashPosition={150000}
  monthlyBurnRate={42000}
  monthsToBreakEven={3.8}
  recommendation="Maintain $193k working capital buffer for 8% growth"
/>
```

**Integration Points:**
- Add to "Unit Economics" or new "Cash Flow" tab
- Model commission lag (45-60 days)
- Calculate working capital needs based on growth rate
- Show cash flow vs accrual accounting divergence

**Key Metrics to Display:**
- Monthly cash flow projection (12 months)
- Working capital requirement
- Cash burn rate during growth
- Months of runway
- Commission payment lag visualization
- Chargeback provisions (8% early cancellations)

**Value:** Prevents cash flow crises during growth

---

### 4. Customer Segmentation & LTV Dashboard

**Backend:** `src/customer_segmentation_model.py` ✅ Complete
**Purpose:** Segment customers by profitability (top 40% = 83% of profit)

**UI Components Needed:**

```typescript
// 1. Customer Segmentation Pie Chart
<CustomerSegmentationPie
  segments={[
    { name: "Elite", count: 120, percentage: 12, ltvContribution: 57 },
    { name: "Premium", count: 280, percentage: 28, ltvContribution: 35 },
    { name: "Standard", count: 450, percentage: 45, ltvContribution: 8 },
    { name: "Low-Value", count: 150, percentage: 15, ltvContribution: 0.1 }
  ]}
/>

// 2. Segment Comparison Table
<SegmentComparisonTable
  segments={[
    {
      tier: "Elite",
      products: "3+",
      avgPremium: 4500,
      ltv: 18000,
      retention: 0.97,
      recommendedCAC: 1200
    },
    {
      tier: "Premium",
      products: "2",
      avgPremium: 2500,
      ltv: 9000,
      retention: 0.91,
      recommendedCAC: 700
    },
    // ... Standard, Low-Value
  ]}
/>

// 3. Marketing Allocation Optimizer
<MarketingAllocationOptimizer
  totalBudget={50000}
  currentDistribution={{
    elite: 0.20,    // 20% of budget
    premium: 0.30,
    standard: 0.35,
    lowValue: 0.15
  }}
  recommendedDistribution={{
    elite: 0.40,    // Recommend 40% to Elite
    premium: 0.35,
    standard: 0.20,
    lowValue: 0.05
  }}
  expectedROI={{
    current: 850,   // Current blended ROI: 850%
    optimized: 1194  // Optimized ROI: 1194%
  }}
/>

// 4. Upgrade Opportunity Calculator
<UpgradeOpportunityCard
  standardCustomers={450}  // 1 product customers
  crossSellRate={0.15}  // 15% can be upgraded
  potentialUpgrades={68}  // 68 customers
  ltvIncrease={4500}  // $4.5k additional LTV each
  totalOpportunity={306000}  // $306k total LTV gain
/>
```

**Integration Points:**
- Parse customer data from `data/04_raw_reports/All_Purpose_Audit.xlsx`
- Calculate products per customer from policy data
- Add to main dashboard as "Customer Segments" tab
- Connect to marketing strategy builder

**Key Metrics to Display:**
- Customer distribution by segment (pie chart)
- LTV contribution by segment (bar chart)
- Segment-specific retention rates
- Recommended CAC by segment
- Marketing budget allocation optimizer
- Upgrade opportunity analysis (Standard → Premium → Elite)

**Value:** Optimize marketing spend, increase ROI by 40%+

---

## Phase 2 Models - To Implement

### 5. Seasonality & Monthly Variance Model

**Purpose:** Model seasonal patterns in sales and renewals
**Priority:** HIGH - Optimize marketing timing and cash flow planning

**Backend to Build:** `src/seasonality_model.py`

**Key Features:**
- Monthly sales patterns (identify high/low months)
- Renewal concentration analysis
- Marketing timing optimization
- Cash flow seasonality adjustments
- Staffing need projections

**UI Components:**

```typescript
// 1. Seasonal Sales Pattern Chart
<SeasonalSalesChart
  monthlyPattern={[
    { month: "Jan", indexedSales: 85, historical: [82, 88, 85] },
    { month: "Feb", indexedSales: 90, historical: [88, 92, 90] },
    // ... all 12 months
    { month: "Dec", indexedSales: 95, historical: [92, 98, 95] }
  ]}
  baseline={100}
/>

// 2. Renewal Concentration Heatmap
<RenewalConcentrationHeatmap
  data={{
    "Jan": { renewals: 185, concentration: 0.85 },
    "Mar": { renewals: 325, concentration: 1.42 },  // High concentration
    "Jul": { renewals: 145, concentration: 0.63 }   // Low concentration
  }}
  avgRenewalsPerMonth={229}
/>

// 3. Marketing Timing Optimizer
<MarketingTimingRecommendations
  recommendations={[
    {
      month: "Feb",
      action: "Increase spend by 25%",
      reason: "High conversion season",
      expectedROI: 1450
    },
    {
      month: "Aug",
      action: "Reduce spend by 15%",
      reason: "Low conversion season",
      expectedROI: 680
    }
  ]}
/>
```

**Data Sources:**
- Historical sales data (parse from new business reports)
- Renewal patterns (from Policy Growth & Retention)
- Marketing campaign performance by month

**Value:** Optimize marketing timing, improve ROI by 15-25%

---

### 6. Cross-Sell Timing Optimizer

**Purpose:** Maximize products per customer (leverage 95%+ retention on umbrella/life)
**Priority:** CRITICAL - Highest-value growth opportunity given strong retention

**Backend to Build:** `src/cross_sell_timing_model.py`

**Key Features:**
- Optimal timing for cross-sell offers (30/60/90 days after initial sale)
- Product sequence optimization (auto → home → umbrella → life)
- Customer readiness scoring
- Bundle rate optimization
- Retention lift from cross-sell

**UI Components:**

```typescript
// 1. Cross-Sell Opportunity Dashboard
<CrossSellOpportunityDashboard
  portfolio={{
    singleProduct: 450,  // Standard customers
    twoProduct: 280,     // Premium customers
    threeProduct: 120    // Elite customers
  }}
  opportunities={[
    {
      segment: "Auto-only (280 customers)",
      nextProduct: "Home",
      conversionRate: 0.22,
      expectedConverts: 62,
      ltvIncrease: 4500,
      totalOpportunity: 279000
    },
    {
      segment: "Auto+Home (180 customers)",
      nextProduct: "Umbrella",
      conversionRate: 0.35,
      expectedConverts: 63,
      ltvIncrease: 9000,
      totalOpportunity: 567000
    }
  ]}
/>

// 2. Optimal Timing Analyzer
<CrossSellTimingAnalyzer
  timingAnalysis={{
    "30-days": { conversionRate: 0.15, avgLTV: 8500 },
    "60-days": { conversionRate: 0.22, avgLTV: 9200 },  // OPTIMAL
    "90-days": { conversionRate: 0.18, avgLTV: 8800 },
    "120-days": { conversionRate: 0.12, avgLTV: 8200 }
  }}
  recommendation="Contact customers 60 days after initial sale"
/>

// 3. Product Sequence Recommender
<ProductSequenceRecommender
  currentProducts={["Auto"]}
  recommendations={[
    {
      nextProduct: "Home",
      priority: 1,
      conversionRate: 0.22,
      retentionLift: 0.19,  // 72% → 91%
      reasoning: "Highest bundle rate and retention lift"
    },
    {
      nextProduct: "Umbrella",
      priority: 2,
      conversionRate: 0.12,
      retentionLift: 0.25,  // 72% → 97%
      reasoning: "Best retention but lower initial conversion"
    }
  ]}
/>

// 4. Retention Lift Calculator
<RetentionLiftChart
  data={[
    { products: 1, retention: 0.72, segment: "Standard" },
    { products: 2, retention: 0.91, segment: "Premium", lift: "+19pts" },
    { products: 3, retention: 0.97, segment: "Elite", lift: "+25pts" }
  ]}
  highlightOpportunity="Moving 100 customers from 1→2 products saves 19 customers/year"
/>
```

**Data Sources:**
- Policy data (products per customer)
- Cross-sell conversion rates (from new business transactions)
- Retention by product count
- Product attach rates

**Actual Metrics to Use:**
- Umbrella retention: 95.19% (vs 85.19% auto-only)
- Life retention: 99.09% (exceptional)
- Target: Increase avg products/customer from ~1.3 to 1.8+

**Value:** Each customer upgraded from Standard → Premium = $4,500 additional LTV
**Opportunity:** 450 Standard customers × 15% conversion = 68 upgrades = $306k LTV gain

---

### 7. Lead Scoring & ROI Model

**Purpose:** Optimize lead vendor spend and prioritize high-LTV prospects
**Priority:** HIGH - Improve CAC efficiency

**Backend to Build:** `src/lead_scoring_model.py`

**Key Features:**
- Lead source ROI analysis
- Predictive lead scoring (probability of Elite/Premium segment)
- Vendor efficiency rankings
- CAC by segment and source
- Conversion rate optimization

**UI Components:**

```typescript
// 1. Lead Vendor Efficiency Dashboard
<LeadVendorEfficiencyDashboard
  vendors={[
    {
      name: "SmartFinancial",
      spend: 12000,
      leads: 240,
      conversions: 36,
      conversionRate: 0.15,
      avgLTV: 6200,
      roi: 1860,  // 1860% ROI
      rating: "EXCELLENT"
    },
    {
      name: "EverQuote",
      spend: 8000,
      leads: 320,
      conversions: 19,
      conversionRate: 0.06,
      avgLTV: 4100,
      roi: 97,  // 97% ROI (poor)
      rating: "UNDERPERFORMING"
    }
  ]}
  recommendation="Shift $5k from EverQuote to SmartFinancial"
/>

// 2. Lead Quality Score Distribution
<LeadQualityScoreChart
  distribution={[
    { score: "90-100 (Elite)", count: 45, conversionRate: 0.42, avgLTV: 18000 },
    { score: "70-89 (Premium)", count: 120, conversionRate: 0.28, avgLTV: 9000 },
    { score: "50-69 (Standard)", count: 180, conversionRate: 0.12, avgLTV: 4500 },
    { score: "<50 (Low)", count: 95, conversionRate: 0.04, avgLTV: 1800 }
  ]}
/>

// 3. CAC by Segment Analyzer
<CACBySegmentAnalyzer
  segments={[
    { tier: "Elite", actualCAC: 1350, targetCAC: 1200, ltvCacRatio: 13.3 },
    { tier: "Premium", actualCAC: 820, targetCAC: 700, ltvCacRatio: 11.0 },
    { tier: "Standard", actualCAC: 520, targetCAC: 400, ltvCacRatio: 8.7 },
    { tier: "Low-Value", actualCAC: 280, targetCAC: 200, ltvCacRatio: 6.4 }
  ]}
  warningThreshold={3.0}  // LTV:CAC < 3.0 = warning
/>

// 4. Lead Prioritization Queue
<LeadPrioritizationQueue
  leads={[
    {
      id: "LEAD-1234",
      name: "John Smith",
      score: 92,
      predictedSegment: "Elite",
      estimatedLTV: 17500,
      priority: "URGENT",
      contactWithin: "24 hours"
    },
    // ... more leads sorted by score
  ]}
/>
```

**Data Sources:**
- Lead vendor data (needs to be collected)
- Conversion rates by source
- Customer segment outcomes by lead source
- Cost per lead by vendor

**Value:** Reduce CAC by 20-30%, improve LTV:CAC ratio from 8x to 11x+

---

### 8. Referral Growth Model

**Purpose:** Leverage satisfied customer base (89.64% retention = high satisfaction)
**Priority:** MEDIUM-HIGH - Low CAC, high conversion rate

**Backend to Build:** `src/referral_growth_model.py`

**Key Features:**
- Referral propensity scoring (who will refer?)
- Referral incentive optimization
- Referral conversion tracking
- Viral coefficient calculation
- Referral LTV comparison vs paid acquisition

**UI Components:**

```typescript
// 1. Referral Program Dashboard
<ReferralProgramDashboard
  metrics={{
    referralRate: 0.08,  // 8% of customers refer
    avgReferralsPerReferrer: 1.4,
    referralConversionRate: 0.35,  // 35% convert (vs 12% paid leads)
    referralCAC: 120,  // Just incentive cost
    referralLTV: 8200,
    ltvCacRatio: 68.3  // Incredible vs 8-11x for paid
  }}
/>

// 2. Referral Propensity Scoring
<ReferralPropensityScore
  highPropensity={{
    count: 180,  // Elite + Premium with 3+ year tenure
    estimatedReferrals: 200,
    expectedConversions: 70,
    ltvGain: 574000
  }}
  recommendation="Target 180 high-propensity customers with referral campaign"
/>

// 3. Incentive Optimizer
<ReferralIncentiveOptimizer
  scenarios={[
    { incentive: 50, referralRate: 0.06, cost: 3000, conversions: 54, roi: 1480 },
    { incentive: 100, referralRate: 0.08, cost: 8000, conversions: 72, roi: 738 },
    { incentive: 150, referralRate: 0.09, cost: 13500, conversions: 81, roi: 492 }
  ]}
  recommendation="$100 incentive maximizes ROI at 738%"
/>

// 4. Viral Coefficient Tracker
<ViralCoefficientTracker
  viralCoefficient={0.028}  // 8% refer × 35% convert
  interpretation="Slight organic growth (need >1.0 for exponential)"
  projectedGrowth={{
    month3: 1050,  // Starting 1000 customers
    month6: 1108,
    month12: 1235
  }}
/>
```

**Data Sources:**
- Customer satisfaction (proxy: retention rate)
- NPS data (if available)
- Existing referral program performance
- Segment-specific referral rates

**Actual Metrics:**
- 89.64% retention suggests high satisfaction
- Elite customers (3+ products, 97% retention) = best referral sources
- Target: 8-10% referral rate among top 2 tiers

**Value:** Referral CAC $120 vs $400-1200 paid CAC = 70-90% cost savings

---

## Integration Architecture

### Backend Integration Options

**Option 1: Python API (Recommended)**
```python
# Flask API wrapping all models
from flask import Flask, jsonify, request
from src.loss_ratio_model import LossRatioModel
from src.rate_environment_model import RateEnvironmentModel
# ... import all models

app = Flask(__name__)

@app.route('/api/loss-ratio', methods=['POST'])
def calculate_loss_ratio():
    data = request.json
    model = LossRatioModel()
    result = model.calculate_portfolio_metrics(data['product_mix'])
    return jsonify(result)

# Similar endpoints for each model
```

**Option 2: Direct Python Integration (PyScript or similar)**
- Embed Python models directly in React app
- Use PyScript or Pyodide for browser-based Python execution
- More complex but no separate backend needed

**Option 3: Pre-calculated Data Files**
- Run Python models periodically (daily/weekly)
- Export results to JSON
- React app consumes static JSON files
- Simplest but least dynamic

**Recommendation:** Option 1 (Flask API) for flexibility and real-time calculations

### Frontend Structure

```
agency-growth-platform/
├── src/
│   ├── components/
│   │   ├── planning/  (existing)
│   │   ├── profitability/  (NEW - Phase 1)
│   │   │   ├── LossRatioDashboard.tsx
│   │   │   ├── CombinedRatioGauge.tsx
│   │   │   ├── ProductProfitabilityChart.tsx
│   │   │   └── BonusEligibilityCard.tsx
│   │   ├── retention/  (NEW - Phase 1)
│   │   │   ├── RateEnvironmentDashboard.tsx
│   │   │   ├── RateImpactCalculator.tsx
│   │   │   ├── RevenueDecompositionChart.tsx
│   │   │   └── LTVInflationComparison.tsx
│   │   ├── cashflow/  (NEW - Phase 1)
│   │   │   ├── CashFlowDashboard.tsx
│   │   │   ├── CashFlowVsAccrualCard.tsx
│   │   │   ├── WorkingCapitalCalculator.tsx
│   │   │   └── CashFlowProjectionChart.tsx
│   │   ├── segmentation/  (NEW - Phase 1)
│   │   │   ├── CustomerSegmentationDashboard.tsx
│   │   │   ├── SegmentationPieChart.tsx
│   │   │   ├── MarketingAllocationOptimizer.tsx
│   │   │   └── UpgradeOpportunityCard.tsx
│   │   ├── growth/  (NEW - Phase 2)
│   │   │   ├── CrossSellDashboard.tsx
│   │   │   ├── SeasonalityDashboard.tsx
│   │   │   ├── LeadScoringDashboard.tsx
│   │   │   └── ReferralGrowthDashboard.tsx
│   ├── api/
│   │   └── models.ts  (TypeScript interfaces for backend models)
│   └── App.tsx  (add new routes/tabs)
```

### Data Flow

```
Raw Data (Excel)
  → Python Parsers (extract_real_metrics.py)
  → Backend Models (loss_ratio_model.py, etc.)
  → Flask API Endpoints
  → React Frontend (fetch API calls)
  → UI Components (charts, cards, dashboards)
```

---

## Implementation Roadmap

### Week 1: Phase 1 Model Integration
- [ ] Set up Flask API for Phase 1 models
- [ ] Create TypeScript interfaces for all model outputs
- [ ] Build Loss Ratio Dashboard components
- [ ] Build Rate Environment Dashboard components
- [ ] Test with Derrick's actual data

### Week 2: Phase 1 Completion
- [ ] Build Cash Flow Dashboard components
- [ ] Build Customer Segmentation Dashboard components
- [ ] Add new tabs to main navigation
- [ ] Integrate with existing unit economics dashboard
- [ ] End-to-end testing

### Week 3: Phase 2 Backend Development
- [ ] Build seasonality_model.py
- [ ] Build cross_sell_timing_model.py
- [ ] Build lead_scoring_model.py
- [ ] Build referral_growth_model.py
- [ ] Create API endpoints for Phase 2 models

### Week 4: Phase 2 Frontend Development
- [ ] Build Cross-Sell Dashboard
- [ ] Build Seasonality Dashboard
- [ ] Build Lead Scoring Dashboard
- [ ] Build Referral Growth Dashboard
- [ ] Integration testing

### Week 5: Data Integration & Automation
- [ ] Automate Excel parsing (scheduled jobs)
- [ ] Connect to live data sources
- [ ] Build data refresh workflows
- [ ] Add real-time updates where applicable
- [ ] Performance optimization

### Week 6: Polish & Deployment
- [ ] UI/UX improvements
- [ ] Mobile responsiveness
- [ ] Documentation for Derrick
- [ ] Training materials
- [ ] Production deployment

---

## Success Metrics

### Phase 1 Success Criteria
- ✅ Loss ratio tracking preventing $60k+ forecast errors
- ✅ Rate environment modeling correcting revenue forecasts
- ✅ Cash flow projections preventing liquidity crises
- ✅ Customer segmentation improving marketing ROI by 40%+

### Phase 2 Success Criteria
- ✅ Cross-sell optimization increasing products/customer from 1.3 → 1.8+
- ✅ Seasonality modeling improving marketing timing (15-25% efficiency gain)
- ✅ Lead scoring reducing CAC by 20-30%
- ✅ Referral program achieving <$200 CAC (vs $400-1200 paid)

### Overall Platform Success
- **Forecast Accuracy:** ±10% (vs ±30% before)
- **Marketing ROI:** 1194% blended (vs 850% before)
- **Cash Flow Visibility:** 12-month projection with working capital planning
- **Growth Rate:** 10-15% annual policy growth (sustainable with cash flow management)
- **Customer Quality:** 40%+ in Elite/Premium tiers (vs current ~30%)

---

## Questions for Derrick

### Data Access
1. Can we automate extraction from Allstate AMS (API or scheduled exports)?
2. Preferred data refresh frequency (daily/weekly/monthly)?
3. Access to historical data (12-24 months) for modeling?

### Business Logic
4. Actual combined ratio bonus thresholds from Allstate?
5. Exact commission payment lag (days after policy effective)?
6. Current referral program (if any) and performance?
7. Lead vendor contracts and costs?

### Strategic Priorities
8. Top priority: Cross-sell vs new acquisition vs retention?
9. Specific growth targets for 2026?
10. Budget for marketing and technology investments?

---

## Next Steps

1. **Review this plan** with Adrian/Derrick
2. **Approve architecture** (Flask API vs alternatives)
3. **Prioritize dashboards** (which to build first?)
4. **Set up development environment** for Flask API
5. **Begin Week 1 implementation** (Phase 1 model integration)

---

**Estimated Total Development Time:** 6 weeks
**Estimated Value to Business:** $150-300k annual improvement (forecast accuracy + marketing optimization + cross-sell growth)
**ROI:** 10-20x development cost

---

**Prepared by:** Adrian
**Date:** November 25, 2025
**Status:** Ready for Implementation ✅
