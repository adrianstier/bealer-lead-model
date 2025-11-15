# Agency Growth Modeling Platform v3.0

A comprehensive growth modeling and financial analysis platform for insurance agencies, featuring sophisticated unit economics, cash flow projections, scenario planning, and **industry benchmark comparisons**.

## 🆕 What's New in v3.0

### Comprehensive Industry Benchmarks
- **Marketing Efficiency**: Channel-specific CAC and conversion rates (referrals at 60% vs 15% traditional)
- **Staffing Optimization**: 2.8:1 service-to-producer ratio benchmark, revenue per employee tracking
- **Technology ROI**: 2.5-3.5% revenue target with high-ROI investment modeling
- **Bundling Dynamics**: Critical 1.8 policies per customer threshold (unlocks 95% retention)
- **Commission Comparisons**: Independent vs Captive models with profitability impacts
- **Financial Metrics**: EBITDA margins (25-30% target), Rule of 20 scoring
- **LTV:CAC Targets**: 3:1 (good), 4:1 (great), 5:1+ (may indicate under-investment)

### High-ROI Investment Modeling
1. **E&O Certificate Automation** - 700%+ ROI, prevents 40% of claims
2. **Proactive Renewal Review Program** - 5% retention improvement can double profits in 5 years
3. **Cross-Sell Programs** - Umbrella & Cyber policies with 15-25% commissions

## Features

### 📊 Core Capabilities
- **Multi-Scenario Analysis**: Conservative, Moderate, and Aggressive growth projections
- **Unit Economics Dashboard**: LTV, CAC, LTV:CAC ratio with benchmark comparisons
- **Cash Flow Modeling**: Month-by-month cash flow tracking with churn dynamics
- **Benchmark Comparisons**: Real-time comparison against industry standards
- **Marketing Channel Optimization**: Track performance by channel (referral, digital, traditional, partnerships)
- **Staffing Ratio Analysis**: Optimize producer-to-service staff ratios
- **Technology Investment Planning**: Model 2.5-3.5% revenue target
- **Bundling Analytics**: Track policies per customer toward 1.8 critical threshold

### 🎯 Key Metrics Tracked

**Unit Economics:**
- Customer Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- LTV:CAC Ratio (benchmarked against 3:1, 4:1, 5:1)

**Financial Performance:**
- EBITDA & EBITDA Margin (target: 25-30%)
- Rule of 20 Score (Organic Growth % + 50% × EBITDA %)
- Revenue Per Employee (target: $150k-$200k)
- Total Compensation Ratios

**Operational Metrics:**
- Service:Producer Staffing Ratio (target: 2.8:1)
- Marketing Spend as % of Revenue (3-7% mature, 10-25% growth)
- Technology Spend as % of Revenue (target: 2.5-3.5%)
- Policies Per Customer (target: 1.8+ for 95% retention)

**Growth & Retention:**
- Monthly/Annual Retention Rates
- Policy Growth Trajectories
- Bundling Penetration
- Channel-Specific Conversion Rates

## Tech Stack

### Frontend (React/Vite)
- React 19 with TypeScript
- Vite 7.2 for blazing-fast HMR
- Tailwind CSS 3.4 for styling
- Framer Motion for animations
- Radix UI for accessible components
- Recharts for data visualization
- **New:** BenchmarkDashboard component
- **New:** EnhancedInputs component with channel/staffing/product mix controls

### Backend/Analysis (Python/Streamlit)
- Streamlit for interactive dashboards
- Pandas for data manipulation
- Plotly for advanced visualizations
- NumPy for calculations
- **New:** EnhancedAgencySimulator with comprehensive benchmarking

## Getting Started

### React Frontend
```bash
cd agency-growth-platform
npm install
npm run dev
```
Visit http://localhost:5174

### Streamlit App (v3.0 with Benchmarks)
```bash
pip install streamlit pandas plotly numpy
streamlit run streamlit_v3_benchmarks.py
```

### Python Simulator (Direct)
```bash
python agency_simulator_v3.py
```

## Model Configuration

### Enhanced Parameters (v3.0)

**Marketing Channels:**
- Referral Program: 60% conversion, $50/lead
- Digital Marketing: 18% conversion, $25/lead (30% lower CAC)
- Traditional Marketing: 15% conversion, $35/lead
- Strategic Partnerships: 25% conversion, $40/lead

**Staffing:**
- Producers (FTE)
- Service Staff (target: 2.8 per producer)
- Admin Staff
- Compensation by role

**Product Mix:**
- Auto Policies
- Home Policies
- Umbrella Policies (high margin)
- Cyber Policies (15-25% commission)
- Commercial Policies

**Commission Structures:**
- Independent: 12-15% new business, 10-12% renewal
- Captive: 20-40% new business, 7% renewal
- Hybrid: Blended approach

**Technology Investments:**
- E&O Certificate Automation ($150/mo)
- Renewal Review Program (staff time)
- Cross-Sell Program ($500/mo)

**Financial Parameters:**
- Average Annual Premium
- Growth Stage (Mature vs Growth-Focused)
- Fixed Overhead Costs

## Key Files

### Python Simulators
- `agency_simulator_v3.py` - **NEW**: Enhanced simulator with all benchmarks
- `agency_simulator.py` - Original basic simulator
- `agency_simulator_enhanced.py` - Intermediate version

### Streamlit Apps
- `streamlit_v3_benchmarks.py` - **NEW**: Full benchmark dashboard
- `streamlit_final.py` - Previous production version
- `streamlit_enterprise.py` - Enterprise features

### React Application
- `agency-growth-platform/src/App.tsx` - Main application
- `agency-growth-platform/src/components/BenchmarkDashboard.tsx` - **NEW**: Benchmark visualization
- `agency-growth-platform/src/components/EnhancedInputs.tsx` - **NEW**: Comprehensive input controls

### Documentation
- `BENCHMARKS_GUIDE.md` - **NEW**: Complete benchmark reference guide
- `README.md` - This file
- `INSTRUCTIONS.md` - Original run instructions
- `FRONTEND_GUIDE.md` - React frontend guide

## Industry Benchmarks Quick Reference

### Financial Performance
- **EBITDA Margin**: 25-30% for $1-5M agencies
- **Rule of 20**: Score ≥ 20 (healthy), 25+ (top performer)
- **Total Payroll**: ≤ 65% of revenue

### Unit Economics
- **LTV:CAC Ratio**: 3:1 (good), 4:1 (great), 5:1+ (may be under-investing)
- **Average CAC**: ~$900 for independent agents

### Marketing Investment
- **Mature Agencies**: 3-7% of revenue
- **Growth-Focused**: 10-25% of revenue

### Retention & Bundling
- **Monoline Retention**: 67%
- **Bundled Retention**: 91-95%
- **Critical Threshold**: 1.8 policies/customer = 95% retention

### Staffing
- **Service:Producer Ratio**: 2.8:1 (optimal)
- **Revenue Per Employee**: $150k-$200k (target), $300k+ (excellent)

### Technology
- **Investment Target**: 2.5-3.5% of revenue

## Usage Examples

### Running Enhanced Simulation

```python
from agency_simulator_v3 import (
    EnhancedSimulationParameters,
    EnhancedAgencySimulator,
    GrowthStage
)

# Create parameters
params = EnhancedSimulationParameters()

# Configure marketing
params.marketing.referral.monthly_allocation = 500
params.marketing.digital.monthly_allocation = 1500

# Configure staffing
params.staffing.producers = 2.0
params.staffing.service_staff = 5.0  # 2.5:1 ratio

# Set growth stage
params.growth_stage = GrowthStage.GROWTH

# Run simulation
sim = EnhancedAgencySimulator(params)
results = sim.simulate_scenario(24)
report = sim.generate_benchmark_report(results)

# Review benchmarks
print(report['financial_performance']['rule_of_20'])
print(report['unit_economics']['ltv_cac_evaluation'])
```

## Implementation Priorities

### Phase 1: Foundation (Immediate)
1. ✅ Implement E&O automation ($150/mo) - Highest ROI
2. ✅ Calculate current EBITDA margin
3. ✅ Measure policies per customer

### Phase 2: Optimization (Months 2-3)
4. ✅ Launch renewal review program
5. ✅ Optimize staffing toward 2.8:1 ratio
6. ✅ Analyze channel performance

### Phase 3: Growth (Months 4-6)
7. ✅ Build cross-sell systems (target 1.8 policies/customer)
8. ✅ Optimize marketing mix
9. ✅ Target Rule of 20 score of 20+

## Support & Documentation

- **Benchmarks Guide**: See [BENCHMARKS_GUIDE.md](BENCHMARKS_GUIDE.md) for detailed benchmark explanations
- **Run Instructions**: See [INSTRUCTIONS.md](INSTRUCTIONS.md) for original setup guide
- **Frontend Guide**: See [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) for React development

---

**Model Version**: 3.0 with Industry Benchmarks
**Last Updated**: 2025
**Python Version**: 3.8+
**Node Version**: 16+
