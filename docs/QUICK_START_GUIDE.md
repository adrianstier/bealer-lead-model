# Quick Start Guide - Derrick's Growth Platform

**Last Updated:** November 25, 2025
**Status:** Ready for Production Use
**Prerequisites:** Python 3.8+, Node.js 18+

---

## 🚀 5-Minute Quick Start

### Step 1: Test the Models (Right Now!)

All models are production-ready with demo functions. Test them immediately:

```bash
# Navigate to project directory
cd /Users/adrianstiermbp2023/derrick-leadmodel

# Test Phase 1 models
python3 src/loss_ratio_model.py
python3 src/rate_environment_model.py
python3 src/cash_flow_model.py
python3 src/customer_segmentation_model.py

# Test Phase 2 models
python3 src/seasonality_model.py
python3 src/cross_sell_timing_model.py
python3 src/lead_scoring_model.py
python3 src/referral_growth_model.py
```

**Expected Result:** Each model will display comprehensive demo output with realistic insurance industry data.

### Step 2: Use a Model with Real Data

Here's a practical example using the **Cross-Sell Timing Optimizer** with Derrick's actual customer base:

```python
#!/usr/bin/env python3
"""
Example: Find cross-sell opportunities in Derrick's portfolio
"""
from src.cross_sell_timing_model import CrossSellTimingModel, ProductType

model = CrossSellTimingModel()

# Example: Analyze Derrick's customer portfolio
# In production, this would come from your database/CRM
customer_portfolio = [
    # Single-product customers (450 in Derrick's book)
    {
        "customer_id": "CUST001",
        "products": [ProductType.AUTO],
        "days_since_last_purchase": 65,
        "characteristics": {"homeowner": True}
    },
    {
        "customer_id": "CUST002",
        "products": [ProductType.HOME],
        "days_since_last_purchase": 45,
        "characteristics": {"homeowner": True}
    },
    # Two-product customers (280 in Derrick's book)
    {
        "customer_id": "CUST003",
        "products": [ProductType.AUTO, ProductType.HOME],
        "days_since_last_purchase": 75,
        "characteristics": {"high_coverage": True}
    },
    # Add more customers...
]

# Analyze portfolio for cross-sell opportunities
analysis = model.analyze_portfolio_opportunities(customer_portfolio)

# Print top 10 opportunities
print("\nTOP 10 CROSS-SELL OPPORTUNITIES:")
print("-" * 80)
for i, opp in enumerate(analysis['top_opportunities'][:10], 1):
    print(f"\n{i}. Customer: {opp.customer_id}")
    print(f"   Current: {[p.value for p in opp.current_products]}")
    print(f"   Recommend: {opp.recommended_product.value}")
    print(f"   Priority: {opp.priority_score:.0f}/100")
    print(f"   Expected Conversion: {opp.expected_conversion_rate:.1%}")
    print(f"   LTV Increase: ${opp.ltv_increase:,.0f}")
    print(f"   Timing: {'Contact now!' if opp.optimal_timing_days == 0 else f'Wait {opp.optimal_timing_days} days'}")

# Print insights
print("\n\nKEY INSIGHTS:")
for insight in analysis['key_insights']:
    print(f"  • {insight}")
```

**Save this as:** `examples/derrick_cross_sell_analysis.py`

**Run it:**
```bash
python3 examples/derrick_cross_sell_analysis.py
```

---

## 📊 Real-World Use Cases

### Use Case 1: Weekly Cross-Sell Target List

**Goal:** Generate a weekly list of customers to contact for cross-sell

**Implementation:**
```python
# examples/weekly_cross_sell_targets.py
from src.cross_sell_timing_model import CrossSellTimingModel
import pandas as pd

# Load customer data (in production, from your database)
customers_df = pd.read_excel("data/04_raw_reports/All_Purpose_Audit.xlsx", skiprows=6)

# Convert to model format
portfolio = []
for _, row in customers_df.iterrows():
    # Parse customer data
    customer_id = row['Insured Name']
    # ... extract products, tenure, etc.

    portfolio.append({
        "customer_id": customer_id,
        "products": products,  # Parsed from policy data
        "days_since_last_purchase": days,
        "characteristics": {}
    })

model = CrossSellTimingModel()
analysis = model.analyze_portfolio_opportunities(portfolio)

# Filter for high-priority opportunities in optimal timing window
this_week_targets = [
    opp for opp in analysis['top_opportunities']
    if opp.priority_score >= 70 and opp.optimal_timing_days == 0
]

# Export to Excel for Derrick's team
output_df = pd.DataFrame([
    {
        "Customer": opp.customer_id,
        "Current Products": ", ".join([p.value for p in opp.current_products]),
        "Recommend": opp.recommended_product.value,
        "Priority": f"{opp.priority_score:.0f}/100",
        "Expected Conversion": f"{opp.expected_conversion_rate:.1%}",
        "LTV Increase": f"${opp.ltv_increase:,.0f}",
        "Reasoning": opp.reasoning
    }
    for opp in this_week_targets
])

output_df.to_excel("weekly_cross_sell_targets.xlsx", index=False)
print(f"\n✅ Generated {len(this_week_targets)} cross-sell targets for this week")
print(f"   Saved to: weekly_cross_sell_targets.xlsx")
```

### Use Case 2: Monthly Marketing Budget Allocation

**Goal:** Optimize monthly marketing spend based on seasonality

**Implementation:**
```python
# examples/monthly_marketing_plan.py
from src.seasonality_model import SeasonalityModel
import datetime

model = SeasonalityModel(business_type="personal_lines")

# Project next 12 months
annual_budget = 50_000
projections = model.project_monthly_sales(annual_budget)

# Get marketing recommendations
seasonal_patterns = {
    proj['month']: SeasonalityModel.MonthlyPattern(
        month=proj['month'],
        month_index=proj['month_index'],
        indexed_sales=proj['indexed_value'],
        season=Season(proj['season']),
        historical_values=[],
        std_deviation=0,
        confidence="medium"
    )
    for proj in projections
}

recommendations = model.optimize_marketing_timing(
    annual_budget,
    seasonal_patterns
)

# Print this month's recommendation
current_month = datetime.datetime.now().strftime("%B")
this_month_rec = [r for r in recommendations if r.month == current_month][0]

print(f"\n📅 MARKETING PLAN FOR {current_month.upper()}")
print("-" * 60)
print(f"Action: {this_month_rec.action}")
print(f"Reason: {this_month_rec.reason}")
print(f"Expected ROI: {this_month_rec.expected_roi:.1f}x")
```

### Use Case 3: Lead Vendor Performance Review

**Goal:** Quarterly vendor performance analysis

**Implementation:**
```python
# examples/vendor_performance_review.py
from src.lead_scoring_model import LeadScoringModel
import pandas as pd

model = LeadScoringModel()

# Load lead data (in production, from CRM/tracking system)
vendors_data = {
    "SmartFinancial": {
        "spend": 12000,
        "leads": pd.read_csv("data/leads/smartfinancial_q4_2025.csv")
    },
    "EverQuote": {
        "spend": 8000,
        "leads": pd.read_csv("data/leads/everquote_q4_2025.csv")
    },
    # ... more vendors
}

# Analyze each vendor
vendor_performances = []
for vendor_name, data in vendors_data.items():
    # Convert leads to model format
    lead_data = [
        {
            "lead_id": row['id'],
            "converted": row['status'] == 'converted',
            "ltv": row.get('ltv', 0)
        }
        for _, row in data['leads'].iterrows()
    ]

    performance = model.analyze_vendor_performance(
        vendor_name=vendor_name,
        total_spend=data['spend'],
        lead_data=lead_data
    )
    vendor_performances.append(performance)

# Print rankings
print("\n📊 VENDOR PERFORMANCE RANKINGS")
print("-" * 80)
sorted_vendors = sorted(vendor_performances, key=lambda v: v.ltv_cac_ratio, reverse=True)

for i, vp in enumerate(sorted_vendors, 1):
    print(f"\n{i}. {vp.vendor_name} ({vp.rating})")
    print(f"   LTV:CAC: {vp.ltv_cac_ratio:.1f}x")
    print(f"   ROI: {vp.roi:.0%}")
    print(f"   Recommendation: {vp.recommendation}")

# Get budget reallocation recommendations
current_budget = sum(vp.total_spend for vp in vendor_performances)
allocations = model.optimize_budget_allocation(current_budget, vendor_performances)

print("\n\n💰 BUDGET REALLOCATION RECOMMENDATIONS")
print("-" * 80)
for alloc in allocations:
    if abs(alloc.change) > 100:  # Only show significant changes
        change_sign = "↑" if alloc.change > 0 else "↓"
        print(f"{change_sign} {alloc.vendor_name}: {alloc.change:+,.0f} ({alloc.reasoning})")
```

### Use Case 4: Referral Program Launch

**Goal:** Identify and prioritize customers for referral program

**Implementation:**
```python
# examples/referral_program_launch.py
from src.referral_growth_model import ReferralGrowthModel
import pandas as pd

model = ReferralGrowthModel()

# Load customer data
customers_df = pd.read_excel("data/04_raw_reports/All_Purpose_Audit.xlsx", skiprows=6)

# Score all customers for referral propensity
referral_scores = []
for _, row in customers_df.iterrows():
    # Extract customer attributes
    customer_id = row['Insured Name']
    # ... calculate tenure, products, etc.

    score = model.calculate_referral_propensity(
        customer_id=customer_id,
        tenure_months=tenure,
        product_count=products,
        retention_score=retention,
        engagement_level="medium",  # Default or from CRM data
    )
    referral_scores.append(score)

# Segment by tier
champions = [s for s in referral_scores if s.tier.value == "champion"]
promoters = [s for s in referral_scores if s.tier.value == "promoter"]

print(f"\n🏆 REFERRAL PROGRAM TARGET LISTS")
print("-" * 80)
print(f"\nChampions ({len(champions)} customers):")
print("  • Approach: Personal phone call from Derrick")
print("  • Incentive: $100 gift card")
print("  • Expected referral rate: 20%")
print(f"  • Expected referrals: {len(champions) * 0.20 * 1.4:.0f}")

print(f"\nPromoters ({len(promoters)} customers):")
print("  • Approach: Personalized email campaign")
print("  • Incentive: $50 Amazon gift card")
print("  • Expected referral rate: 12%")
print(f"  • Expected referrals: {len(promoters) * 0.12 * 1.4:.0f}")

# Export champion list for immediate action
champion_df = pd.DataFrame([
    {
        "Customer": s.customer_id,
        "Score": f"{s.propensity_score:.0f}/100",
        "Expected Referrals": f"{s.estimated_referrals_per_year:.1f}",
        "Approach": s.recommended_approach
    }
    for s in champions
])

champion_df.to_excel("referral_program_champions.xlsx", index=False)
print(f"\n✅ Champion list exported to: referral_program_champions.xlsx")
```

---

## 🔧 Production Deployment Options

### Option 1: Standalone Python Scripts (Easiest)

**Best for:** Weekly/monthly analysis, reports for Derrick's team

**Setup:**
```bash
# Create examples directory
mkdir -p examples

# Copy example scripts from above
# examples/weekly_cross_sell_targets.py
# examples/monthly_marketing_plan.py
# etc.

# Run on schedule (Mac: launchd, Linux: cron)
# Example crontab entry for weekly cross-sell report every Monday at 9am:
0 9 * * 1 cd /path/to/derrick-leadmodel && python3 examples/weekly_cross_sell_targets.py
```

**Pros:**
- ✅ Zero additional infrastructure
- ✅ Works immediately
- ✅ Easy to customize

**Cons:**
- ❌ Manual scheduling required
- ❌ No web interface
- ❌ Limited collaboration

### Option 2: Flask API + React Dashboard (Recommended)

**Best for:** Real-time analysis, team collaboration, data-driven decision making

**Setup:**

1. **Create Flask API:**

```python
# api/server.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from src.cross_sell_timing_model import CrossSellTimingModel
from src.seasonality_model import SeasonalityModel
from src.lead_scoring_model import LeadScoringModel
from src.referral_growth_model import ReferralGrowthModel

app = Flask(__name__)
CORS(app)

@app.route('/api/cross-sell/analyze', methods=['POST'])
def analyze_cross_sell():
    data = request.json
    model = CrossSellTimingModel()

    # Convert JSON to model format
    portfolio = [
        {
            "customer_id": c["id"],
            "products": [ProductType(p) for p in c["products"]],
            "days_since_last_purchase": c.get("days_since_last", 65),
            "characteristics": c.get("characteristics", {})
        }
        for c in data["customers"]
    ]

    analysis = model.analyze_portfolio_opportunities(portfolio)

    # Convert to JSON-serializable format
    return jsonify({
        "total_opportunity": analysis['total_ltv_opportunity'],
        "top_opportunities": [
            {
                "customer_id": opp.customer_id,
                "recommended_product": opp.recommended_product.value,
                "priority_score": opp.priority_score,
                "expected_conversion": opp.expected_conversion_rate,
                "ltv_increase": opp.ltv_increase,
                "reasoning": opp.reasoning
            }
            for opp in analysis['top_opportunities'][:50]
        ],
        "insights": analysis['key_insights']
    })

@app.route('/api/seasonality/project', methods=['POST'])
def project_seasonality():
    data = request.json
    model = SeasonalityModel()

    projections = model.project_monthly_sales(
        annual_sales_target=data['annual_target']
    )

    return jsonify({"projections": projections})

@app.route('/api/leads/score', methods=['POST'])
def score_leads():
    data = request.json
    model = LeadScoringModel()

    scores = []
    for lead in data['leads']:
        score = model.score_lead(
            lead_id=lead['id'],
            products_shopping=lead['products'],
            homeowner_status=lead.get('homeowner', 'unknown'),
            age_range=lead.get('age', '30-39'),
            estimated_premium=lead.get('premium'),
            credit_tier=lead.get('credit', 'unknown'),
            engagement_level=lead.get('engagement', 'medium')
        )
        scores.append({
            "lead_id": score.lead_id,
            "score": score.score,
            "segment": score.predicted_segment.value,
            "ltv": score.predicted_ltv,
            "max_cac": score.recommended_cac,
            "conversion_probability": score.conversion_probability
        })

    return jsonify({"scores": scores})

@app.route('/api/referral/propensity', methods=['POST'])
def calculate_propensity():
    data = request.json
    model = ReferralGrowthModel()

    scores = []
    for customer in data['customers']:
        score = model.calculate_referral_propensity(
            customer_id=customer['id'],
            tenure_months=customer['tenure'],
            product_count=customer['products'],
            retention_score=customer.get('retention', 1.0),
            engagement_level=customer.get('engagement', 'medium')
        )
        scores.append({
            "customer_id": score.customer_id,
            "score": score.propensity_score,
            "tier": score.tier.value,
            "estimated_referrals": score.estimated_referrals_per_year,
            "approach": score.recommended_approach
        })

    return jsonify({"scores": scores})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
```

2. **Install dependencies:**
```bash
pip install flask flask-cors
```

3. **Run the API:**
```bash
python3 api/server.py
```

4. **Test the API:**
```bash
curl -X POST http://localhost:5001/api/cross-sell/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [
      {
        "id": "CUST001",
        "products": ["auto"],
        "days_since_last": 65,
        "characteristics": {"homeowner": true}
      }
    ]
  }'
```

**Pros:**
- ✅ Real-time analysis
- ✅ Web-based dashboards
- ✅ Team collaboration
- ✅ Mobile-friendly
- ✅ Professional presentation

**Cons:**
- ❌ Requires server setup
- ❌ More complex deployment
- ❌ Frontend development needed

### Option 3: Jupyter Notebooks (Great for Exploration)

**Best for:** Ad-hoc analysis, data exploration, presentations to Derrick

**Setup:**
```bash
pip install jupyter pandas matplotlib seaborn

# Create notebooks directory
mkdir -p notebooks

# Start Jupyter
jupyter notebook
```

**Example Notebook:**

```python
# notebooks/cross_sell_analysis.ipynb

# Cell 1: Setup
from src.cross_sell_timing_model import CrossSellTimingModel, ProductType
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

model = CrossSellTimingModel()

# Cell 2: Load Derrick's customer data
customers_df = pd.read_excel("../data/04_raw_reports/All_Purpose_Audit.xlsx", skiprows=6)
print(f"Loaded {len(customers_df):,} customer records")

# Cell 3: Analyze cross-sell opportunities
# ... (analysis code)

# Cell 4: Visualize retention lift opportunity
plt.figure(figsize=(10, 6))
segments = ['Standard\n(1 product)', 'Premium\n(2 products)', 'Elite\n(3+ products)']
retention = [0.72, 0.91, 0.97]
customers = [450, 280, 120]

plt.bar(segments, retention, color=['#ff9999', '#66b3ff', '#99ff99'])
plt.ylabel('Retention Rate')
plt.title("Retention by Customer Segment\n(Derrick's Actual Data)")
plt.ylim(0.5, 1.0)

for i, (seg, ret, count) in enumerate(zip(segments, retention, customers)):
    plt.text(i, ret + 0.02, f'{ret:.1%}\n({count} customers)', ha='center')

plt.tight_layout()
plt.savefig('retention_by_segment.png', dpi=300)
plt.show()

# Cell 5: Generate actionable recommendations
print("\n🎯 TOP 10 CROSS-SELL OPPORTUNITIES THIS WEEK:")
# ... (recommendation code)
```

**Pros:**
- ✅ Interactive exploration
- ✅ Visualizations
- ✅ Great for presentations
- ✅ Easy to share (export to PDF/HTML)

**Cons:**
- ❌ Not for production automation
- ❌ Requires Jupyter environment
- ❌ Manual execution

---

## 📋 Weekly Workflow Example

Here's a realistic weekly workflow for Derrick's team:

### Monday Morning (30 minutes)
```bash
# 1. Generate cross-sell targets for the week
python3 examples/weekly_cross_sell_targets.py

# 2. Review referral program champions
python3 examples/referral_program_launch.py

# 3. Check this month's marketing recommendation
python3 examples/monthly_marketing_plan.py
```

**Output:** 3 Excel files ready for Derrick's team to action

### Wednesday (15 minutes)
```bash
# Review lead vendor performance (if new leads came in)
python3 examples/vendor_performance_review.py
```

### End of Month (1 hour)
```bash
# Run comprehensive analysis
python3 src/enhanced_agency_model.py  # Phase 1 comprehensive model

# Generate reports for Derrick
# - Monthly performance summary
# - Cross-sell progress tracking
# - Vendor ROI analysis
# - Referral program performance
```

---

## 🎯 Success Metrics to Track

Monitor these KPIs to measure Phase 2 impact:

### Cross-Sell Program
- **Products per customer:** Target 1.3 → 1.8+
- **Standard → Premium conversions:** Track monthly
- **Retention lift:** Monitor actual vs projected

### Marketing Optimization
- **Spend by season:** Compare to recommendations
- **ROI by month:** Track actual vs projected
- **Peak month performance:** April performance lift

### Lead Vendor Optimization
- **Blended LTV:CAC:** Target 20x+ (from ~11x)
- **Vendor ROI:** Track actual vs recommended allocation
- **Cost savings:** Measure eliminated waste

### Referral Program
- **Referral rate:** Target 6-8%
- **Conversion rate:** Target 35%
- **Referral CAC:** Target <$150

---

## 🆘 Troubleshooting

### Problem: "ModuleNotFoundError"
```bash
# Ensure you're in the project directory
cd /Users/adrianstiermbp2023/derrick-leadmodel

# Verify Python can find the src directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Problem: "Excel file not found"
```bash
# Verify data files exist
ls -la data/04_raw_reports/

# Update file paths in scripts if needed
```

### Problem: "Model taking too long to run"
```python
# Reduce portfolio size for testing
portfolio = portfolio[:100]  # Analyze first 100 customers

# Or use sampling
import random
sampled_portfolio = random.sample(portfolio, 100)
```

---

## 📞 Next Steps

**Choose your path:**

1. **Quick Win (Today):** Run one of the example scripts with Derrick's actual data
2. **This Week:** Set up weekly automated reports
3. **This Month:** Build Flask API + React dashboard
4. **This Quarter:** Full production deployment with automated data integration

**Questions?** Review the comprehensive documentation:
- [DASHBOARD_INTEGRATION_PLAN.md](./DASHBOARD_INTEGRATION_PLAN.md) - Full integration guide
- [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) - Model details and value analysis
- [PHASE_1_IMPLEMENTATION_GUIDE.md](./PHASE_1_IMPLEMENTATION_GUIDE.md) - Phase 1 model usage

---

**Ready to deploy?** Start with the simplest option (standalone scripts) and evolve to the full dashboard when ready. All models are production-ready right now! 🚀
