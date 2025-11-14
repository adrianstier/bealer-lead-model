# Agency Growth Modeling Platform

A comprehensive growth modeling and financial analysis platform for insurance agencies, featuring sophisticated unit economics, cash flow projections, and scenario planning.

## Features

### 📊 Core Capabilities
- **Multi-Scenario Analysis**: Conservative, Moderate, and Aggressive growth projections
- **Unit Economics Dashboard**: LTV, CAC, LTV:CAC ratio, and break-even analysis
- **Cash Flow Modeling**: Month-by-month cash flow tracking with churn dynamics
- **Sales Compensation Models**: Compare FTE vs commission-only structures
- **Economic Assumptions**: Fine-tune churn rate, premiums, costs, and ramp times

### 🎯 Key Metrics Tracked
- Customer Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- Break-even point analysis
- Return on Investment (ROI)
- Payback period
- Policy growth trajectories

## Tech Stack

### Frontend (React/Vite)
- React 18 with TypeScript
- Vite 7.2 for blazing-fast HMR
- Tailwind CSS 3.4 for styling
- Framer Motion for animations
- Radix UI for accessible components
- Recharts for data visualization

### Backend/Analysis (Python/Streamlit)
- Streamlit for rapid prototyping
- Pandas for data manipulation
- Plotly for advanced visualizations

## Getting Started

### React Frontend
```bash
cd agency-growth-platform
npm install
npm run dev
```
Visit http://localhost:5174

### Streamlit App
```bash
pip install streamlit pandas plotly numpy
streamlit run streamlit_final.py
```

## Model Configuration

### Default Economic Assumptions
- Monthly Churn Rate: 2.5%
- Average Premium: $1,200/year
- Commission Payout: 10%
- Fixed Monthly Costs: $5,000
- FTE Benefits Multiplier: 1.3
- Sales Ramp: 3 months

---

**Model Version**: 2.0 with Unit Economics
