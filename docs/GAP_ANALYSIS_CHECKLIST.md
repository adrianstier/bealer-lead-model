# Backend Gap Analysis - Quick Reference Checklist

## 🔴 CRITICAL GAPS (Fix First - Weeks 1-4)

### 1. Loss Ratio & Profitability Modeling
- [ ] Parse Claims Detail Report (Oct 2025)
- [ ] Calculate loss ratios by product line (auto, home, umbrella)
- [ ] Build combined ratio calculation (loss + expense)
- [ ] Add bonus eligibility thresholds (typically <95% combined ratio)
- [ ] Integrate into profitability dashboard
- **Data:** `data/04_raw_reports/2025-10_Claims_Detail_Report.xlsx`
- **Data:** `data/04_raw_reports/24MM Adjusted Paid Loss Detail Report_All_Oct-2025.xlsx`

### 2. Rate Increase & Price Elasticity
- [ ] Add annual rate increase parameter (default: 10%)
- [ ] Add price elasticity coefficient (default: -0.30)
- [ ] Calculate rate-driven churn adjustment
- [ ] Decompose revenue growth (policy count vs rate)
- [ ] Inflate LTV projections with premium growth
- **Ask Derrick:** Recent rate increase history (auto vs home)

### 3. Cash Flow vs Accrual Accounting
- [ ] Add commission payment lag parameter (45-60 days)
- [ ] Model cash inflows (prior month commissions)
- [ ] Model cash outflows (current month expenses)
- [ ] Add chargeback provisions (8% of new policies)
- [ ] Calculate working capital requirements
- [ ] Build cash flow projection report
- **Ask Derrick:** Exact Allstate commission payment timing

### 4. Customer Segmentation & LTV Stratification
- [ ] Parse All Purpose Audit for product mix
- [ ] Segment customers: Elite (3+ products), Premium (2), Standard (1)
- [ ] Calculate segment-specific LTV (Elite: $18k, Premium: $9k, Standard: $4.5k)
- [ ] Build differential CAC targets by segment
- [ ] Add segment filters to dashboards
- **Data:** `data/04_raw_reports/All_Purpose_Audit.xlsx`

---

## 🟡 HIGH PRIORITY GAPS (Weeks 5-8)

### 5. Seasonality & Monthly Variance
- [ ] Add monthly seasonality factors (lead volume, conversion rate)
- [ ] Model Q1 tax refund boost (+15% conversion)
- [ ] Model Q3 summer lull (-15% activity)
- [ ] Adjust marketing allocation by month
- [ ] Build seasonal cash flow projections
- **Data:** Historical lead data (already have - analyze by month)

### 6. Cross-Sell Sequencing & Timing
- [ ] Add customer tenure tracking (months as customer)
- [ ] Define optimal introduction windows (umbrella: 12mo, life: 6mo, flood: 0mo)
- [ ] Build life event triggers (new baby, home purchase, marriage)
- [ ] Add relationship score (1-10) to customer records
- [ ] Create cross-sell priority scoring algorithm
- **Ask Derrick:** Current cross-sell tracking (if any)

### 7. Competitive Market Dynamics
- [ ] Add market competitiveness parameter (soft/moderate/hard)
- [ ] Model competitive win rate by price position
- [ ] Add re-shopping frequency (customers quote 3.2x on average)
- [ ] Build competitive retention adjustment
- [ ] Track win/loss reasons (when available)
- **Start Capturing:** Competitor quotes, win/loss analysis

### 8. Product Mix Optimization Engine
- [ ] Calculate profit margin by product (auto, home, umbrella, life)
- [ ] Model umbrella attachment opportunity (65% of auto+home bundles)
- [ ] Model life insurance opportunity (15% of bundled customers)
- [ ] Build optimal mix recommendation algorithm
- [ ] Add capacity constraints (producer time allocation)
- **Data:** Product economics already documented

---

## 🟢 MEDIUM PRIORITY GAPS (Weeks 9-12)

### 9. Churn Prediction & Early Warning
- [ ] Build churn risk scoring model (0-100)
- [ ] Add payment issue tracking (late payments = +85% churn risk)
- [ ] Add rate shock detection (>15% increase = +60% churn risk)
- [ ] Build urgency categorization (critical/high/medium/low)
- [ ] Generate top 100 at-risk customers monthly report
- [ ] Estimate save rates by intervention timing
- **Ask Derrick:** NPS or satisfaction data

### 10. Regulatory & Compliance Cost Modeling
- [ ] Add E&O insurance cost (base + per $100k premium)
- [ ] Add licensing costs per producer ($500/year)
- [ ] Add continuing education costs ($300/year)
- [ ] Add technology compliance costs (CCPA/data security)
- [ ] Add administrative burden (hours × hourly rate)
- [ ] Calculate compliance as % of revenue
- **Use:** Industry benchmarks (2-4% of revenue)

### 11. Territory & Geographic Modeling
- [ ] Parse customer data by ZIP code
- [ ] Define Santa Barbara sub-markets (Montecito, Goleta, Isla Vista, etc.)
- [ ] Add territory-specific premium averages
- [ ] Add territory-specific lead cost multipliers
- [ ] Add wildfire risk zones (CAT loading)
- [ ] Build market penetration tracking
- **Data:** ZIP codes in customer file

### 12. Referral & Organic Growth Modeling
- [ ] Add referral rate by customer segment (Elite: 25%, Premium: 15%, Standard: 8%)
- [ ] Add NPS-to-referral multiplier (promoters: 1.8x, passives: 0.6x)
- [ ] Calculate viral coefficient (referrals per customer × conversion rate)
- [ ] Model referral economics (CAC: $75, LTV: 1.6x multiplier)
- [ ] Build referral program ROI calculator
- **Start Capturing:** Referral source tracking

---

## Data Collection Status

### ✅ Already Have (In Files)
- [x] Claims data (loss ratios)
- [x] Customer product mix (All Purpose Audit)
- [x] Policy growth & retention reports
- [x] Lead call data (64k records)
- [x] Vendor costs and lead sources
- [x] Product economics (premiums, commissions, retention)

### ⚠️ Need From Derrick
- [ ] Loss ratio bonus thresholds (when does bonus become ineligible?)
- [ ] Commission payment timing (days after policy effective?)
- [ ] Chargeback policy (commission clawback on early cancels?)
- [ ] Recent rate increase history (last 12 months, auto vs home)
- [ ] NPS or customer satisfaction data (if tracked)
- [ ] Referral tracking (do you track referral source?)

### ❌ Should Start Capturing
- [ ] Competitor quotes (when customer shops around)
- [ ] Cancellation reasons (exit interviews)
- [ ] Cross-sell conversion by timing (when was product offered?)
- [ ] Win/loss analysis (why did we win/lose vs competitor?)
- [ ] Referral source tracking (flag referred customers)
- [ ] Territory performance (breakdown by ZIP code)

---

## Quick Wins (Can Implement Today)

### 1. Rate Increase Impact (30 minutes)
```python
# Add to retention model
ANNUAL_RATE_INCREASE = 0.10  # 10%
PRICE_ELASTICITY = -0.30     # 10% rate = 3% additional churn

rate_driven_churn = (ANNUAL_RATE_INCREASE / 0.10) * 0.03
adjusted_retention = base_retention - rate_driven_churn
adjusted_premium = base_premium * (1 + ANNUAL_RATE_INCREASE)
```

### 2. Customer Segmentation (1 hour)
```python
# Parse All Purpose Audit
def segment_customer(product_count, annual_premium):
    if product_count >= 3 and annual_premium >= 3000:
        return "elite"  # LTV: $18,000
    elif product_count >= 2 and annual_premium >= 2000:
        return "premium"  # LTV: $9,000
    else:
        return "standard"  # LTV: $4,500
```

### 3. Loss Ratio Check (2 hours)
```python
# Parse Claims Report
loss_ratio = total_claims_paid / total_premium_earned
combined_ratio = loss_ratio + expense_ratio
bonus_eligible = combined_ratio < 0.95

print(f"Combined Ratio: {combined_ratio:.1%}")
print(f"Bonus Status: {'✅ Eligible' if bonus_eligible else '❌ At Risk'}")
```

---

## Success Metrics

### After Phase 1 (Critical Fixes)
- [ ] Profitability forecasts accurate within ±10% (vs ±30% now)
- [ ] Revenue growth decomposed (policy count vs rate)
- [ ] Cash flow projections show working capital needs
- [ ] Customer LTV stratified by segment (3 tiers)
- [ ] Loss ratio tracked and bonus eligibility visible

### After Phase 2 (Strategic)
- [ ] Cross-sell conversion rates improve 20-40%
- [ ] Churn prediction identifies top 100 at-risk customers
- [ ] Product mix optimized for profitability (shift to umbrella/life)
- [ ] Marketing spend adjusted for seasonality
- [ ] Segment-specific CAC targets implemented

### After Phase 3 (Advanced)
- [ ] Territory-level targeting (Montecito vs Goleta vs Isla Vista)
- [ ] Referral program launched and tracked
- [ ] Competitive win rate modeled
- [ ] Compliance costs projected (2-4% of revenue)

---

## Questions for Implementation Call

1. **Priority Confirmation**
   - Do you agree with 🔴 Critical → 🟡 High → 🟢 Medium prioritization?
   - Should we start with all 4 Critical items, or just top 2?

2. **Data Access**
   - Can we schedule time to parse the Excel files together?
   - Do you have access to Allstate portal for commission timing details?

3. **Timeframe**
   - Target completion for Phase 1: 4 weeks realistic?
   - Weekly checkpoint calls or async updates?

4. **Ownership**
   - Adrian leads implementation?
   - Derrick provides data/answers questions?
   - Who reviews/QA's the models?

---

## Resources

- **Full Analysis:** [BACKEND_GAP_ANALYSIS.md](./BACKEND_GAP_ANALYSIS.md) (12 gaps, detailed implementation)
- **Executive Summary:** [EXECUTIVE_GAP_SUMMARY.md](./EXECUTIVE_GAP_SUMMARY.md) (Financial impact examples)
- **Data Manifest:** [../data/DATA_MANIFEST.md](../data/DATA_MANIFEST.md) (What data we have)

---

**Last Updated:** November 25, 2025
**Prepared By:** Insurance Economics Expert Review
