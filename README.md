# Derrick Bealer Agency - AI Growth System

A comprehensive AI-powered growth platform for Derrick Bealer's Allstate Santa Barbara agency. Features growth modeling, compensation optimization, lead analysis, and strategic planning tools.

## Quick Start

```bash
# React Frontend (Compensation Dashboard + Growth Modeling)
cd agency-growth-platform && npm install && npm run dev
# Open http://localhost:5173

# Streamlit Dashboard
pip install -r requirements.txt
streamlit run src/streamlit_v3_benchmarks.py
```

## Repository Structure

```
derrick-leadmodel/
├── agency-growth-platform/     # React/TypeScript frontend
│   └── src/
│       ├── components/         # UI components
│       │   └── CompensationDashboard.tsx
│       └── config/             # Compensation configs (2025, 2026+)
│
├── src/                        # Python backend
│   ├── agency_simulator_v3.py  # Main growth simulator
│   ├── streamlit_v3_benchmarks.py  # Interactive dashboard
│   └── config.py               # Simulation presets
│
├── Bealer_planning/            # Client proposal & blueprint
│   ├── index.html              # Interactive presentation
│   ├── START_HERE.md           # Quick start guide
│   └── PROJECT_SUMMARY.md      # 5 AI systems overview
│
├── data/                       # All agency data
│   ├── 01_current_performance/ # Agency reports
│   ├── 02_strategic_research/  # Industry analysis
│   ├── 03_implementation_frameworks/
│   ├── 04_raw_reports/         # Excel exports
│   ├── 05_analysis_ready/      # Clean CSVs
│   ├── 06_lead_data/           # Lead data (54,338 records)
│   ├── background-info/        # Reference materials
│   └── DATA_MANIFEST.md        # File catalog & naming guide
│
├── docs/                       # Documentation
│   ├── PRD.md                  # Product Requirements
│   ├── LEAD_DATA_GUIDE.md      # Lead analysis guide
│   ├── guides/                 # User guides
│   └── reports/                # Test & evaluation reports
│
├── tests/                      # Test suite
│   ├── integration/
│   └── unit/
│
└── archive/                    # Old versions (reference only)
```

## The Five AI Systems

| System | Purpose | Timeline |
|--------|---------|----------|
| **A. Lead Optimization** | Predict conversions, optimize spend | Week 3-7 |
| **B. Invoice Automation** | Paper invoices for seniors | Week 6-7 |
| **C. Cancellation Watchtower** | Save at-risk policies | Week 6-7 |
| **D. AI Concierge** | Personalized newsletters | Week 6-8 |
| **E. Social Marketing** | AI-powered ad targeting | Week 7-10 |

## 2025 Compensation Structure

The platform includes a complete compensation dashboard with:

- **Policy Bundle Rate Tiers**: 0% → 0.50% → 0.75% → 1.00%
- **Portfolio Growth Tiers**: 8 tiers from -877 to +1656 items
- **NB Variable Comp**: Auto 16%, HO 20%, Umbrella 18%
- **Bigger Bundle Bonus**: $50 per 3rd+ line
- **Monthly Targets & KPIs**

To update for 2026, see [agency-growth-platform/src/config/compensation2026.template.ts](agency-growth-platform/src/config/compensation2026.template.ts)

## Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Policy Bundle Rate | ≥40% | 38.5% |
| Portfolio Growth | Positive | -200 items |
| LTV:CAC Ratio | 4:1 | TBD |
| EBITDA Margin | 25-30% | TBD |

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PRD.md](docs/PRD.md) | Full product requirements |
| [docs/LEAD_DATA_GUIDE.md](docs/LEAD_DATA_GUIDE.md) | Lead data analysis guide |
| [docs/guides/BENCHMARKS_GUIDE.md](docs/guides/BENCHMARKS_GUIDE.md) | Industry benchmarks |
| [docs/guides/QUICK_START_GUIDE.md](docs/guides/QUICK_START_GUIDE.md) | Setup instructions |
| [Bealer_planning/START_HERE.md](Bealer_planning/START_HERE.md) | Client presentation guide |

## Development

### Frontend
```bash
cd agency-growth-platform
npm install
npm run dev      # Development
npm run build    # Production build
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

- **Frontend**: React 19, TypeScript, Vite, Tailwind, Recharts
- **Backend**: Python 3.8+, Streamlit, Pandas, Plotly
- **Data**: CSV, Excel, JSON

## Team

- **Adrian** - Developer/Consultant
- **Derrick** - Agency Owner
- **Britney** - Data Coordinator

## License

Private - Derrick Bealer Agency

---

**Version**: 3.0
**Last Updated**: November 2025
