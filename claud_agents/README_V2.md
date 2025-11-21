# Improved Agent Framework v2.0

Repository-aware multiagent system for the Derrick Bealer Allstate Santa Barbara Agency.

## What's New in v2.0

The improved agents are specifically designed to work with this repository's actual data:

- **54,338 lead records** in `data/06_lead_data/`
- **Analysis-ready CSVs** in `data/05_analysis_ready/`
- **2025 compensation structure** from the React frontend
- **PRD success metrics** aligned with `docs/PRD.md`

## Quick Start

```python
import asyncio
from integration_v2 import ImprovedClaudeCodeIntegration

async def main():
    integration = ImprovedClaudeCodeIntegration()

    # Load actual lead data (54,338 records)
    lead_data = await integration.load_lead_data()
    print(f"Loaded {lead_data['total_records']:,} leads")

    # Analyze vendor performance
    vendor_perf = await integration.get_vendor_performance()
    print(f"Top vendor: {vendor_perf['top_vendor']}")

    # Check compensation status
    comp = await integration.get_compensation_status()
    print(f"PBR: {comp['policy_bundle_rate']['current']:.1%}")

    # Get optimization recommendations
    recs = await integration.get_optimization_recommendations()
    for rec in recs['recommendations']:
        print(f"[{rec['priority']}] {rec['action']}")

asyncio.run(main())
```

## Files Overview

| File | Purpose |
|------|---------|
| `config.py` | Repository-aware configuration with actual data paths |
| `agents_v2.py` | Improved agents aligned with lead data schema |
| `integration_v2.py` | Easy-to-use integration for Claude Code |
| `multiagent_framework.py` | Core framework (unchanged) |
| `specialized_agents.py` | Original specialized agents |

## New Agents

### LeadDataAgent

Works directly with the lead CSV files in `data/06_lead_data/`:

```python
# Actual columns from lead data:
# Date, Full name, User, From, To, Call Duration,
# Call Duration In Seconds, Current Status, Call Type,
# Call Status, Vendor Name, Team
```

Capabilities:
- `load_lead_data` - Load all 54,338 records
- `analyze_vendor_performance` - QuoteWizard, MediaAlpha, etc.
- `calculate_conversion_rates` - Funnel metrics
- `segment_by_status` - Status code analysis
- `agent_performance_analysis` - By User field

### LeadScoringAgentV2

Scores leads using actual data features:

- Status progression (1.0 → 2.0 → 3.0 → 4.0)
- Call duration in seconds
- Vendor historical performance
- Agent (User) performance
- Recency

```python
score_result = await scoring_agent._score_single_lead({
    "customer_name": "John Doe",
    "status": "3.0 QUOTED - Follow Up",
    "duration_seconds": 120,
    "vendor": "QuoteWizard-Auto",
    "timestamp": "2025-11-10 12:40:03",
})
# Returns: {"score": 75.5, "priority": "high", ...}
```

### CompensationDashboardAgent

Integrates with the React frontend compensation structure:

- **PBR Tiers**: 0% → 0.50% → 0.75% → 1.00%
- **PG Tiers**: 8 tiers from $0 to $12,000
- **NB Variable Comp**: Auto 16%, Home 20%, Umbrella 18%
- **Bigger Bundle Bonus**: $50 per 3rd+ line

### AnalysisDataAgent

Works with pre-processed CSVs in `data/05_analysis_ready/`:

- `bonus_structure_reference.csv`
- `product_economics.csv`
- `operational_benchmarks.csv`
- `lead_generation_vendors.csv`
- `santa_barbara_market_analysis.csv`

## Configuration

The `config.py` file contains:

```python
# Data paths mapped to repository structure
DATA_PATHS = {
    "lead_data": REPO_ROOT / "data" / "06_lead_data",
    "analysis_ready": REPO_ROOT / "data" / "05_analysis_ready",
    # ...
}

# Lead data schema from actual CSVs
LEAD_DATA_SCHEMA = {
    "columns": {
        "Date": "timestamp",
        "Full name": "customer_name",
        "Current Status": "status",
        "Vendor Name": "vendor",
        # ...
    },
    "status_codes": {
        "1.0": "CALLED - No Contact",
        "3.0": "QUOTED - Follow Up",
        "4.0": "SOLD",
        # ...
    },
}

# 2025 compensation structure
COMPENSATION_CONFIG = {
    "current": {
        "pbr": 0.385,  # 38.5%
        "pg_items": -200,
    },
    "targets": {
        "pbr": 0.40,
        "pg_items": 200,
    },
    # ...
}
```

## Integration Methods

### Data Access

```python
# Load lead data
lead_data = await integration.load_lead_data(sample=True)

# Vendor analysis
vendor_perf = await integration.get_vendor_performance()

# Agent performance
agent_perf = await integration.get_agent_performance()

# Status distribution
status_dist = await integration.get_status_distribution()
```

### Compensation Analysis

```python
# Current position
comp = await integration.get_compensation_status()
# Returns PBR, PG items, current tier, bonus rates

# Tier projection
projection = await integration.project_tier_advancement(
    weeks_remaining=4,
    weekly_growth=50
)
```

### Lead Scoring

```python
# Score provided leads
result = await integration.score_leads(leads=[...])

# Score from repository data
result = await integration.score_leads()
```

### Optimization

```python
# Get recommendations
recs = await integration.get_optimization_recommendations()
# Returns prioritized actions for PBR, PG, vendor allocation
```

### Analysis Data

```python
# Product economics
economics = await integration.get_product_economics()

# Operational benchmarks
benchmarks = await integration.get_operational_benchmarks()

# Market analysis
market = await integration.get_market_analysis()
```

### Workflows

```python
# Run predefined workflow
result = await integration.run_workflow("daily_morning")

# Available workflows:
# - daily_morning
# - end_of_month
# - emergency_cancellation
# - lead_optimization
```

## PRD Alignment

The agents track PRD success metrics from `docs/PRD.md`:

| Metric | Target | Unit |
|--------|--------|------|
| Lead conversion improvement | +25% | percentage |
| Cancellation reduction | -15% | percentage |
| Bundling rate increase | +25% | percentage |
| Manual hours saved | 20 | hours/week |
| Variable comp tier advancement | +2 | tiers |

```python
metrics = await integration.get_prd_success_metrics()
```

## Quick Access Functions

For rapid data access without instantiation:

```python
from integration_v2 import (
    quick_lead_analysis,
    quick_compensation_check,
    quick_vendor_analysis,
    quick_optimization
)

# One-liner analysis
lead_data = await quick_lead_analysis()
comp_status = await quick_compensation_check()
vendor_perf = await quick_vendor_analysis()
recommendations = await quick_optimization()
```

## Example: Daily Morning Routine

```python
async def daily_morning():
    integration = ImprovedClaudeCodeIntegration()

    # 1. Load latest lead data
    leads = await integration.load_lead_data()
    print(f"📊 {leads['total_records']:,} total leads")

    # 2. Check vendor performance
    vendors = await integration.get_vendor_performance()
    top = vendors['top_vendor']
    print(f"🏢 Top vendor: {top}")

    # 3. Review compensation
    comp = await integration.get_compensation_status()
    pbr = comp['policy_bundle_rate']
    print(f"💰 PBR: {pbr['current']:.1%} (gap: {pbr['gap']:.1%})")

    # 4. Get recommendations
    recs = await integration.get_optimization_recommendations()
    print(f"💡 {len(recs['recommendations'])} recommendations")

    for rec in recs['recommendations']:
        if rec['priority'] == 'high':
            print(f"   ⚠️ {rec['action']}")
```

## Migration from v1

The v1 agents still work but don't know about the actual repository data. To use the improved agents:

```python
# v1 (generic)
from specialized_agents import setup_full_system
system = await setup_full_system()

# v2 (repository-aware)
from agents_v2 import setup_improved_system
system = await setup_improved_system()

# Best: use the integration layer
from integration_v2 import ImprovedClaudeCodeIntegration
integration = ImprovedClaudeCodeIntegration()
```

## Data Flow

```
Lead CSVs (54,338 records)
    ↓
LeadDataAgent (load, analyze)
    ↓
LeadScoringAgentV2 (score)
    ↓
CompensationDashboardAgent (optimize against comp tiers)
    ↓
Recommendations & Actions
```

## File Locations

```
claud_agents/
├── config.py              # Repository configuration
├── agents_v2.py           # Improved agents
├── integration_v2.py      # Claude Code integration
├── multiagent_framework.py # Core framework
├── specialized_agents.py   # Original agents
└── README_V2.md           # This file
```

## Testing

```bash
cd claud_agents
python integration_v2.py
```

This runs a demonstration showing:
- Lead data loading
- Vendor performance analysis
- Compensation status
- Optimization recommendations

## Support

For questions about the agents or data integration, refer to:
- `docs/PRD.md` - Product requirements
- `data/DATA_MANIFEST.md` - Data file catalog
- `docs/LEAD_DATA_GUIDE.md` - Lead data documentation

---

**Version**: 2.0
**Last Updated**: November 2025
**Author**: Adrian
