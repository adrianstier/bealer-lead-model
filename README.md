# Derrick Bealer Agency - AI Growth System

A comprehensive AI-powered growth platform for Derrick Bealer's Allstate Santa Barbara & Goleta agency. Features growth modeling, compensation optimization, lead analysis, strategic planning tools, and an integrated AI implementation blueprint.

## Quick Start

```bash
# React Frontend (Full Platform)
cd agency-growth-platform && npm install && npm run dev
# Open http://localhost:5173

# Python Analysis Tools
pip install -r requirements.txt
streamlit run src/streamlit_v3_benchmarks.py
```

## Platform Features

The main application includes:

1. **AI Blueprint** - Strategic 12-week implementation plan with 5 AI systems
2. **Growth Methodology** - Data-driven approach backed by industry benchmarks
3. **Model Details** - Complete equation reference with V5.3 updates
4. **Book of Business** - Portfolio analytics with product mix and cross-sell opportunities
5. **Lead Analysis** - Vendor performance, conversion rates, and funnel metrics
6. **Compensation Dashboard** - 2025 Allstate tiers, bonuses, and KPI tracking
7. **Strategy Builder** - Interactive sliders for retention, conversion, and spend modeling
8. **Scenario Analysis** - Conservative/Moderate/Aggressive projections
9. **Results** - Lifetime value, acquisition cost, break-even analysis

## Repository Structure

```
derrick-leadmodel/
├── agency-growth-platform/     # React/TypeScript main application
│   └── src/
│       ├── App.tsx             # Main application (~4400 lines)
│       ├── components/
│       │   ├── BealerPlanningSection.tsx   # AI Blueprint (integrated)
│       │   ├── CompensationDashboard.tsx   # Compensation tracking
│       │   ├── BookOfBusinessDashboard.tsx # Portfolio analytics
│       │   ├── LeadAnalysisDashboard.tsx   # Lead performance
│       │   └── planning/
│       │       └── planning-data.ts        # Blueprint content data
│       └── config/
│           └── compensationConfig.ts       # 2025 compensation tiers
│
├── Bealer_planning/            # Standalone client presentation
│   ├── index.html              # Interactive web version
│   ├── START_HERE.md           # Presentation guide
│   └── PROJECT_SUMMARY.md      # 5 AI systems overview
│
├── claud_agents/               # AI Agent Framework
│   ├── specialized_agents.py   # Lead scoring, cancellation watch, etc.
│   ├── system_analyzer.py      # Deep analysis of 54k+ leads
│   ├── agents_v2.py            # Repository-aware agents
│   ├── config.py               # Data paths and compensation config
│   └── README.md               # Agent documentation
│
├── data/                       # All agency data
│   ├── 01_current_performance/ # Agency reports
│   ├── 02_strategic_research/  # Industry analysis
│   ├── 03_implementation_frameworks/
│   ├── 04_raw_reports/         # Excel exports
│   ├── 05_analysis_ready/      # Clean CSVs
│   │   ├── cross_sell_opportunities.csv
│   │   ├── bonus_structure_reference.csv
│   │   └── product_economics.csv
│   ├── 06_lead_data/           # Lead records (54,338 records)
│   └── DATA_MANIFEST.md        # File catalog
│
├── docs/                       # Documentation
│   ├── PRD.md                  # Product Requirements Document
│   ├── MODEL_EQUATIONS.md      # V5.3 equation reference
│   ├── LEAD_DATA_GUIDE.md      # Lead analysis methodology
│   └── guides/                 # User guides
│
├── src/                        # Python backend tools
│   ├── agency_simulator_v3.py  # Growth simulator
│   ├── streamlit_v3_benchmarks.py
│   └── config.py               # Simulation presets
│
├── tests/                      # Test suite
│   ├── integration/
│   └── unit/
│
└── archive/                    # Old versions (reference only)
```

## The Five AI Systems

| System | Purpose | Status |
|--------|---------|--------|
| **A. Lead Optimization** | Machine learning lead scoring, return on investment optimization | Model equations defined |
| **B. Invoice Automation** | Paper invoices for high-value older customers | Framework ready |
| **C. Cancellation Watchtower** | Proactive risk monitoring and save system | Agent implemented |
| **D. AI Concierge** | Personalized newsletters and life-event messaging | Agent implemented |
| **E. Social Marketing** | Audience targeting and ad optimization | Agent implemented |

## Key Metrics & Model (V5.3)

### Current State
| Metric | Value |
|--------|-------|
| Current Policies | 1,687 |
| Current Customers | 1,100 |
| Policies Per Customer | 1.53 |
| Average Premium | $2,501/policy |
| Annual Retention | 98.6% |

### Marketing Model
| Parameter | Value |
|-----------|-------|
| Live Transfer Spend | $0/month (adjust to model) |
| Cost Per Lead | $55 |
| Conversion Rate | 10% (live transfers) |

### Back-of-Envelope Validation
- $3,000/month × 24 months = $72,000 total
- 1,309 leads × 10% = 131 new customers
- 131 customers × 1 policy = **~131 new policies**

## 2025 Compensation Structure

The platform includes a complete compensation dashboard:

- **Policy Bundle Rate Tiers**: 0% → 0.50% → 0.75% → 1.00%
- **Portfolio Growth Tiers**: 8 tiers from -877 to +1656 items
- **New Business Variable Comp**: Auto 16%, Home 20%, Umbrella 18%
- **Bigger Bundle Bonus**: $50 per 3rd+ line
- **Monthly Targets & KPIs**

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PRD.md](docs/PRD.md) | Full product requirements |
| [docs/MODEL_EQUATIONS.md](docs/MODEL_EQUATIONS.md) | V5.3 equation reference |
| [docs/LEAD_DATA_GUIDE.md](docs/LEAD_DATA_GUIDE.md) | Lead analysis methodology |
| [Bealer_planning/START_HERE.md](Bealer_planning/START_HERE.md) | Client presentation guide |
| [claud_agents/README.md](claud_agents/README.md) | AI agent framework docs |
| [data/DATA_MANIFEST.md](data/DATA_MANIFEST.md) | Data file catalog |

## Development

### Frontend
```bash
cd agency-growth-platform
npm install
npm run dev      # Development server at localhost:5173
npm run build    # Production build
npm run test     # Run Playwright tests
```

### Python
```bash
pip install -r requirements.txt
python src/agency_simulator_v3.py
streamlit run src/streamlit_v3_benchmarks.py
```

### Tests
```bash
cd tests
python run_all_tests.py
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion
- **UI Components**: Radix UI Tabs, Lucide React icons
- **Backend**: Python 3.8+, Streamlit, Pandas, Plotly
- **Data**: CSV, Excel, JSON
- **AI Framework**: Custom multiagent system with specialized agents

## Version History

### V5.3 (Current)
- Integrated Bealer planning blueprint into main app
- Separated lead types: live transfers (10%) vs internet leads (0.5%)
- New customers from leads get 1 policy (not 1.53)
- $0 default spend to model return on investment scenarios
- Removed acronyms from user-facing text

### V5.1
- Fixed churn calculation (customers × policies per customer)
- Fixed lifetime value calculation (annual retention, capped at 10 years)
- Validated retention rate (98.6% annual ≈ 2 policies lost/month)

### V3.0
- Added benchmark metrics (Rule of 20, operating margin, revenue per employee)
- Channel-specific marketing with conversion rates
- Staff capacity constraints

## Team

- **Adrian** - Developer/Consultant
- **Derrick** - Agency Owner
- **Britney** - Data Coordinator

## License

Private - Derrick Bealer Agency

---

**Version**: 5.3
**Last Updated**: November 2025
