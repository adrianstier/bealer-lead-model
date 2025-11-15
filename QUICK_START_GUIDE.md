# Quick Start Guide - Agency Growth Modeling Platform v3.0

## 🚀 Get Started in 5 Minutes

### Option 1: Streamlit Dashboard (Recommended)

**Run the interactive dashboard:**
```bash
cd /Users/adrianstiermbp2023/Desktop/derrick-leadmodel
streamlit run streamlit_v3_benchmarks.py
```

Your browser will open to http://localhost:8501

**What you'll see:**
- Interactive sidebar with all inputs
- 5 tabs: Growth, Unit Economics, Operational, Investments, Projections
- Real-time benchmark comparisons
- Rule of 20 scoring
- High-ROI investment recommendations

---

### Option 2: Python Simulator (Command Line)

**Run demo simulation:**
```bash
cd /Users/adrianstiermbp2023/Desktop/derrick-leadmodel
python agency_simulator_v3.py
```

**What you'll see:**
- Complete 24-month simulation results
- Financial performance metrics
- Rule of 20 score
- Unit economics (LTV, CAC, ratio)
- Growth metrics
- Operational benchmarks
- High-ROI investment opportunities

---

### Option 3: React Frontend (Coming Soon)

**Build and run:**
```bash
cd /Users/adrianstiermbp2023/Desktop/derrick-leadmodel/agency-growth-platform
npm install
npm run dev
```

Visit http://localhost:5174

**Note:** React components are created but need integration with the Python backend.

---

## 📊 Understanding Your Results

### Rule of 20 Score

**Formula:** Organic Growth % + (50% × EBITDA %)

**Scoring:**
- **25+** 🟢 Top Performer - Elite performance
- **20-25** 🔵 Healthy Agency - Strong balanced growth
- **15-20** 🟡 Needs Improvement - Focus on growth or margins
- **<15** 🔴 Critical - Immediate attention required

**Example:**
- Growth: 20%
- EBITDA: 30%
- Score: 20 + (0.5 × 30) = **35** (Top Performer!)

---

### LTV:CAC Ratio

**What it measures:** Customer lifetime value vs acquisition cost

**Targets:**
- **3:1** = Good (healthy business model)
- **4:1** = Great (excellent economics)
- **5:1+** = Warning (may be under-investing in growth)
- **<2:1** = Critical (unit economics broken)

**Independent Agent Benchmark:** CAC ~$900

---

### Policies Per Customer (Critical Metric!)

**The 1.8 Threshold:**
- **< 1.0** (Monoline) = 67% retention 🔴
- **1.5-1.8** (Bundled) = 91% retention 🟡
- **1.8+** (Optimal) = **95% retention** 🟢

**Impact:** Crossing 1.8 threshold drops churn from 33% to 5% - that's a **28 percentage point improvement**!

**How to reach 1.8:**
1. Cross-sell umbrella policies (high margin)
2. Cross-sell cyber policies (15-25% commission)
3. Bundle auto + home
4. Add commercial lines for business owners

---

### EBITDA Margin

**Target for $1-5M agencies:** 25-30%

**Evaluation:**
- **30%+** 🟢 Excellent
- **25-30%** 🔵 Target range
- **20-25%** 🟡 Acceptable
- **<20%** 🔴 Below target

**Formula:** (Revenue - Operating Expenses) / Revenue

---

## 🎯 Quick Wins - Start Here!

### Week 1: Implement E&O Automation

**Investment:** $150/month
**ROI:** 733%
**Impact:** Prevents 40% of E&O claims

**Why this first?**
- Highest ROI of all investments
- Immediate risk reduction
- Avoiding one claim ($50k-$100k) pays for 28+ years
- No downside

**Action:** Contact E&O automation vendor today

---

### Week 2: Measure Policies Per Customer

**Current State Assessment:**
1. Count total policies
2. Count unique customers
3. Divide: Policies ÷ Customers

**Target:** 1.8+

**If below 1.8:**
- Launch cross-sell initiative
- Focus on umbrella policies (15% commission, high margin)
- Add cyber policies (15-25% commission)
- Create bundle incentives

---

### Week 3: Calculate Your Rule of 20

**Step 1:** Calculate organic growth
- (This year revenue - Last year revenue) / Last year revenue × 100

**Step 2:** Calculate EBITDA margin
- (Revenue - Operating Expenses) / Revenue × 100

**Step 3:** Rule of 20 Score
- Growth % + (0.5 × EBITDA %)

**Target:** 20+

**If below 20:**
- Growth <10%: Increase marketing, optimize channels
- EBITDA <20%: Review cost structure, improve efficiency

---

### Week 4: Optimize Staffing Ratio

**Calculate current ratio:**
- Service Staff ÷ Producers

**Target:** 2.8:1

**If below 2.0:1:**
- Producers overloaded
- Quality suffering
- Add service staff support

**If above 3.5:1:**
- Potential overstaffing
- Review efficiency
- May have room to add producers

---

## 🔄 Monthly Monitoring

### Dashboard Metrics to Track

**Every Month:**
1. Policies per customer (target: 1.8+)
2. LTV:CAC ratio (target: 3:1 to 4:1)
3. Revenue per employee (target: $150k-$200k)
4. Retention rate (target: 91-95%)

**Every Quarter:**
5. EBITDA margin (target: 25-30%)
6. Rule of 20 score (target: 20+)
7. Marketing spend % (3-7% mature, 10-25% growth)
8. Technology spend % (2.5-3.5%)

**Annually:**
9. Staffing ratio audit (target: 2.8:1)
10. Compensation ratio check (≤65% of revenue)

---

## 📈 Scenario Planning Workflow

### 1. Establish Baseline

**Run current state simulation:**
- Input actual numbers for all parameters
- Note current Rule of 20 score
- Identify gaps vs benchmarks

### 2. Test Scenarios

**Conservative:**
- +$500-$1,000 marketing/month
- +0.5 FTE staff
- Enable renewal program

**Moderate:**
- +$2,000-$3,000 marketing/month
- +1.0 FTE staff
- Enable all technology investments

**Aggressive:**
- +$5,000+ marketing/month
- +2.0 FTE staff
- Full technology stack + cross-sell program

### 3. Compare Results

**Key metrics to compare:**
- Final policy count
- ROI %
- Payback period (months)
- Rule of 20 score improvement
- LTV:CAC ratio

### 4. Make Decision

**Green light if:**
- ✅ Payback < 24 months
- ✅ ROI > 50%
- ✅ Rule of 20 improves
- ✅ LTV:CAC stays 3:1+

---

## ⚙️ Customizing Parameters

### Marketing Channels

**Adjust allocations based on your performance:**
```python
# In Streamlit sidebar or Python:
referral_allocation = 500     # Your referral program spend
digital_allocation = 1500      # Google Ads, Facebook, etc.
traditional_allocation = 500   # Direct mail, print, etc.
partnerships_allocation = 500  # Strategic partnerships
```

**Track actual conversion rates:**
- Referral: Typically 60%
- Digital: Typically 18%
- Traditional: Typically 15%
- Update model with YOUR actual rates

### Staffing

**Configure your team:**
```python
producers = 2.0         # Sales/producers
service_staff = 5.0     # Service team (target: 2.8 per producer)
admin_staff = 1.0       # Admin/support
```

**Set actual compensation:**
```python
producer_comp = 70000        # Annual
service_staff_comp = 45000   # Annual
admin_comp = 40000          # Annual
```

### Product Mix

**Input current policy counts:**
```python
auto = 300
home = 200
umbrella = 80      # Target to increase!
cyber = 20         # Target to increase!
commercial = 50
```

---

## 🎓 Learning Resources

### Documentation

1. **[README.md](README.md)** - Overview and feature list
2. **[BENCHMARKS_GUIDE.md](BENCHMARKS_GUIDE.md)** - Complete benchmark reference (950+ lines)
3. **[COMPREHENSIVE_REVIEW_REPORT.md](COMPREHENSIVE_REVIEW_REPORT.md)** - Testing and validation report
4. **[V3_IMPLEMENTATION_SUMMARY.md](V3_IMPLEMENTATION_SUMMARY.md)** - Implementation details

### Example Usage

**Python API:**
```python
from agency_simulator_v3 import (
    EnhancedSimulationParameters,
    EnhancedAgencySimulator,
    GrowthStage
)

# Create parameters
params = EnhancedSimulationParameters()

# Configure
params.marketing.digital.monthly_allocation = 2000
params.staffing.producers = 2.0
params.staffing.service_staff = 5.0
params.growth_stage = GrowthStage.GROWTH

# Run simulation
sim = EnhancedAgencySimulator(params)
results = sim.simulate_scenario(24)
report = sim.generate_benchmark_report(results)

# Review
print(f"Rule of 20: {report['financial_performance']['rule_of_20']['score']}")
print(f"LTV:CAC: {report['unit_economics']['ltv_cac_ratio']:.1f}:1")
```

---

## 🆘 Troubleshooting

### Streamlit won't start
```bash
# Install requirements
pip install streamlit pandas plotly numpy

# Try explicit Python module
python -m streamlit run streamlit_v3_benchmarks.py
```

### Results seem unrealistic
- ✅ Verify all inputs are reasonable
- ✅ Check percentages are decimals in Python (0.85 not 85)
- ✅ Ensure staffing costs match your market
- ✅ Validate retention rates against historical data

### Negative EBITDA
- This is normal initially for high-growth scenarios
- Focus on incremental profit vs baseline
- Look for when cumulative profit turns positive
- High staff costs relative to revenue is common issue

---

## 📞 Next Steps

1. **Today:** Run baseline simulation with current numbers
2. **This Week:** Implement E&O automation
3. **This Month:** Measure and optimize policies per customer
4. **This Quarter:** Achieve Rule of 20 score of 20+
5. **This Year:** Hit 25% EBITDA margin target

---

## 🎉 Success Metrics

**You're on track if:**
- ✅ Rule of 20 score ≥ 20
- ✅ EBITDA margin ≥ 25%
- ✅ LTV:CAC ratio ≥ 3:1
- ✅ Policies per customer ≥ 1.8
- ✅ Revenue per employee ≥ $150k
- ✅ Retention rate ≥ 91%

**When you hit all 6:**
You're running a top-tier insurance agency! 🏆

---

**Questions?** Review the [BENCHMARKS_GUIDE.md](BENCHMARKS_GUIDE.md) for detailed explanations of all metrics and formulas.

**Ready to start?**
```bash
streamlit run streamlit_v3_benchmarks.py
```

Let's grow your agency with data! 🚀
