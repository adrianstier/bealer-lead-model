# Derek's Agency Growth Simulator - Run Instructions

## Quick Start

### 1. Install Requirements
```bash
pip install -r requirements.txt
```

### 2. Run the Interactive App
```bash
streamlit run streamlit_app.py
```

The app will open in your browser at `http://localhost:8501`

### 3. Alternative: Run Command Line Tests
```bash
python agency_simulator.py
```

---

## Using the Interactive App

### Main Interface
The app has three main sections:

1. **Sidebar (Left)**: Adjust all simulation parameters
   - Current State: Your agency's starting point
   - Funnel & Finance: Conversion rates and costs
   - Systems: Staff capacity and client retention tools

2. **Scenario Builder (Center-Top)**: Build your growth scenario
   - Time horizon (12, 24, or 36 months)
   - Additional lead spend slider
   - Additional staff slider
   - Client system toggles

3. **Results Dashboard (Center-Bottom)**: View simulation results
   - Key metrics (Payback, ROI, Policy Growth)
   - Interactive charts
   - Detailed monthly data

### Step-by-Step Usage

#### Step 1: Set Your Current State
In the sidebar, enter your agency's current situation:
- Current policies in force
- Current staff (FTE)
- Current monthly lead spend

#### Step 2: Adjust Funnel Parameters
Set your conversion funnel rates based on your data:
- Contact rate: % of leads you successfully reach
- Quote rate: % of contacts that get a quote
- Bind rate: % of quotes that become policies

#### Step 3: Configure Financial Parameters
- Average annual premium per policy
- Commission rate
- Annual retention rate
- Monthly cost per staff member

#### Step 4: Build Your Scenario
In the main area:
1. Choose simulation length (24 months recommended)
2. Drag the "Additional Lead Spend" slider
3. Drag the "Additional Staff" slider
4. Toggle client systems on/off

#### Step 5: Run Simulation
Click the "🚀 Run Simulation" button to see results

#### Step 6: Analyze Results
Review the four key metrics:
- **Payback Period**: When investment pays for itself
- **ROI**: Return on investment percentage
- **Policy Growth**: Net new policies added
- **Incremental Profit**: Total additional profit

---

## Understanding the Parameters

### Lead Funnel
- **Cost per Lead**: What you pay for each lead
- **Contact Rate**: Successfully reaching the lead (70% typical)
- **Quote Rate**: Getting to quote stage (60% typical)
- **Bind Rate**: Closing the sale (50% typical)

### Retention
- **Annual Retention**: % of policies renewed each year (85% typical)
- **Concierge Boost**: Retention improvement from personal touches (+3% typical)
- **Newsletter Boost**: Retention improvement from regular communication (+2% typical)

### Capacity
- **Max Leads per FTE**: Optimal workload before quality drops (150/month typical)
- **Efficiency Penalty**: How much conversion drops when overloaded

---

## Interpreting Results

### Green Light Scenarios
✅ **Go ahead if you see:**
- Payback period < 24 months
- ROI > 50%
- Steady policy growth curve
- Positive cumulative profit trend

### Yellow Light Scenarios
⚠️ **Proceed with caution if:**
- Payback period 24-36 months
- ROI 20-50%
- Uneven growth patterns
- Break-even takes most of simulation

### Red Light Scenarios
❌ **Reconsider if:**
- No payback in simulation period
- Negative ROI
- Declining efficiency metrics
- Cumulative losses throughout

---

## Working with Derek's Actual Data

### Phase 1: Initial Testing
1. Use the default parameters to familiarize yourself with the tool
2. Try different scenarios to understand the dynamics
3. Note which parameters have the biggest impact

### Phase 2: Data Collection
Ask Derek for:
- **Must Have**:
  - Current policies in force
  - Average annual premium
  - Typical retention rate
  - Monthly lead count and cost
  - Staff costs

- **Nice to Have**:
  - Detailed funnel conversion rates
  - Historical growth data
  - Lead source breakdown

### Phase 3: Calibration
1. Enter Derek's actual numbers in the sidebar
2. Run a baseline simulation
3. Compare to Derek's actual last 12-24 months
4. Adjust parameters until model matches reality

### Phase 4: Scenario Planning
Once calibrated:
1. Test conservative growth (+$500-1000 leads/month)
2. Test moderate growth (+$2000-3000 leads/month)
3. Test aggressive growth (+$5000+ leads/month)
4. Find the sweet spot with best ROI and acceptable payback

---

## Advanced Features

### Using Configuration Presets
```python
from config import ConfigManager

config = ConfigManager()

# Load a preset
params = config.get_preset("moderate")  # or "conservative", "aggressive"

# Save custom parameters
config.save_params(params, "derek_custom")

# Export to Excel for Derek to edit
config.export_to_excel(params, "derek_parameters.xlsx")
```

### Running Batch Scenarios
```python
from agency_simulator import SimulationParameters, AgencySimulator

# Create simulator
params = SimulationParameters()
sim = AgencySimulator(params)

# Find optimal investment
optimal = sim.optimize_investment(
    months=24,
    max_additional_spend=5000,
    spend_increment=250
)

print(f"Best scenario: {optimal['scenario']}")
print(f"Expected ROI: {optimal['metrics']['roi_percent']:.1f}%")
```

### Customizing the Streamlit App
Edit `streamlit_app.py` to:
- Add new charts
- Change color schemes
- Add additional metrics
- Create custom reports

---

## Troubleshooting

### Common Issues

**App won't start:**
- Check Python version (3.8+ required)
- Verify all packages installed: `pip install -r requirements.txt`
- Try: `python -m streamlit run streamlit_app.py`

**Results seem wrong:**
- Verify parameter values are reasonable
- Check that rates are decimals (0.85 not 85 for 85%)
- Run sanity checks: `python agency_simulator.py`

**Negative profit throughout:**
- This is normal initially - agencies have high fixed costs
- Focus on incremental profit vs baseline
- Look for scenarios where profit improves over time

---

## Next Steps

1. **Immediate**: Test the app with default values
2. **This Week**: Collect Derek's actual data
3. **Next Week**: Calibrate model to match reality
4. **Following Week**: Run scenarios and make recommendations

---

## Support

For questions or issues:
1. Check this documentation first
2. Run the sanity checks: `python agency_simulator.py`
3. Review the parameter descriptions in the app
4. Contact for technical support if needed

---

## Quick Command Reference

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run streamlit_app.py

# Run tests
python agency_simulator.py

# Generate parameter template for Derek
python config.py

# Open app in browser (after starting)
open http://localhost:8501
```