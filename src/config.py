"""
Configuration file for Derek's Agency Growth Simulator
Stores default parameters and allows easy customization
"""

import json
from pathlib import Path
from agency_simulator import SimulationParameters


class ConfigManager:
    """Manages simulation parameters and presets"""

    def __init__(self, config_file="params_config.json"):
        self.config_file = Path(config_file)
        self.presets = self._load_presets()

    def _load_presets(self) -> dict:
        """Load parameter presets"""
        return {
            "conservative": SimulationParameters(
                current_policies=500,
                current_staff_fte=2.0,
                baseline_lead_spend=1000,
                lead_cost_per_lead=30,
                contact_rate=0.65,
                quote_rate=0.55,
                bind_rate=0.45,
                avg_premium_annual=1400,
                commission_rate=0.10,
                annual_retention_base=0.82,
                staff_monthly_cost_per_fte=4500,
                max_leads_per_fte_per_month=120,
                concierge_retention_boost=0.02,
                newsletter_retention_boost=0.01,
                concierge_monthly_cost=600,
                newsletter_monthly_cost=250
            ),
            "moderate": SimulationParameters(
                current_policies=500,
                current_staff_fte=2.0,
                baseline_lead_spend=1000,
                lead_cost_per_lead=25,
                contact_rate=0.70,
                quote_rate=0.60,
                bind_rate=0.50,
                avg_premium_annual=1500,
                commission_rate=0.12,
                annual_retention_base=0.85,
                staff_monthly_cost_per_fte=5000,
                max_leads_per_fte_per_month=150,
                concierge_retention_boost=0.03,
                newsletter_retention_boost=0.02,
                concierge_monthly_cost=500,
                newsletter_monthly_cost=200
            ),
            "aggressive": SimulationParameters(
                current_policies=500,
                current_staff_fte=2.0,
                baseline_lead_spend=1000,
                lead_cost_per_lead=20,
                contact_rate=0.75,
                quote_rate=0.65,
                bind_rate=0.55,
                avg_premium_annual=1600,
                commission_rate=0.14,
                annual_retention_base=0.88,
                staff_monthly_cost_per_fte=5500,
                max_leads_per_fte_per_month=180,
                concierge_retention_boost=0.04,
                newsletter_retention_boost=0.03,
                concierge_monthly_cost=400,
                newsletter_monthly_cost=150
            ),
            "derek_actual": SimulationParameters(
                # This preset will be updated with Derek's actual numbers
                current_policies=500,  # UPDATE WITH DEREK'S DATA
                current_staff_fte=2.0,  # UPDATE WITH DEREK'S DATA
                baseline_lead_spend=1000,  # UPDATE WITH DEREK'S DATA
                lead_cost_per_lead=25,  # UPDATE WITH DEREK'S DATA
                contact_rate=0.70,  # UPDATE WITH DEREK'S DATA
                quote_rate=0.60,  # UPDATE WITH DEREK'S DATA
                bind_rate=0.50,  # UPDATE WITH DEREK'S DATA
                avg_premium_annual=1500,  # UPDATE WITH DEREK'S DATA
                commission_rate=0.12,  # UPDATE WITH DEREK'S DATA
                annual_retention_base=0.85,  # UPDATE WITH DEREK'S DATA
                staff_monthly_cost_per_fte=5000,  # UPDATE WITH DEREK'S DATA
                max_leads_per_fte_per_month=150,  # UPDATE WITH DEREK'S DATA
                concierge_retention_boost=0.03,
                newsletter_retention_boost=0.02,
                concierge_monthly_cost=500,
                newsletter_monthly_cost=200
            )
        }

    def save_params(self, params: SimulationParameters, name: str = "custom"):
        """Save parameters to JSON file"""
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                configs = json.load(f)
        else:
            configs = {}

        configs[name] = params.to_dict()

        with open(self.config_file, 'w') as f:
            json.dump(configs, f, indent=2)

    def load_params(self, name: str = "custom") -> SimulationParameters:
        """Load parameters from JSON file"""
        if not self.config_file.exists():
            return self.presets["moderate"]

        with open(self.config_file, 'r') as f:
            configs = json.load(f)

        if name in configs:
            return SimulationParameters.from_dict(configs[name])
        else:
            return self.presets.get(name, self.presets["moderate"])

    def get_preset(self, name: str) -> SimulationParameters:
        """Get a preset configuration"""
        return self.presets.get(name, self.presets["moderate"])

    def list_presets(self) -> list:
        """List available presets"""
        return list(self.presets.keys())

    def export_to_excel(self, params: SimulationParameters, filename: str = "parameters.xlsx"):
        """Export parameters to Excel for easy editing"""
        import pandas as pd

        df = pd.DataFrame([params.to_dict()])
        df = df.T
        df.columns = ['Value']
        df.index.name = 'Parameter'

        # Add descriptions
        descriptions = {
            'current_policies': 'Current active policies',
            'current_staff_fte': 'Current full-time equivalent staff',
            'baseline_lead_spend': 'Current monthly lead spend ($)',
            'lead_cost_per_lead': 'Average cost per lead ($)',
            'contact_rate': 'Percentage of leads contacted',
            'quote_rate': 'Percentage of contacted that get quoted',
            'bind_rate': 'Percentage of quoted that bind',
            'avg_premium_annual': 'Average annual premium per policy ($)',
            'commission_rate': 'Commission rate on premiums',
            'annual_retention_base': 'Annual retention rate',
            'monthly_retention_base': 'Monthly retention rate (calculated)',
            'staff_monthly_cost_per_fte': 'Monthly cost per staff member ($)',
            'max_leads_per_fte_per_month': 'Maximum leads per FTE before efficiency drops',
            'efficiency_penalty_rate': 'Efficiency penalty per 10 leads over capacity',
            'concierge_retention_boost': 'Retention improvement from concierge',
            'newsletter_retention_boost': 'Retention improvement from newsletter',
            'concierge_monthly_cost': 'Monthly cost of concierge system ($)',
            'newsletter_monthly_cost': 'Monthly cost of newsletter system ($)'
        }

        df['Description'] = df.index.map(descriptions.get)

        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Parameters')

            # Add notes sheet
            notes_df = pd.DataFrame({
                'Notes': [
                    'Update these parameters with Derek\'s actual data',
                    'Save this file and use import_from_excel() to load',
                    'Rates should be decimals (e.g., 0.85 for 85%)',
                    'Costs should be in dollars'
                ]
            })
            notes_df.to_excel(writer, sheet_name='Notes', index=False)

    def import_from_excel(self, filename: str = "parameters.xlsx") -> SimulationParameters:
        """Import parameters from Excel"""
        import pandas as pd

        df = pd.read_excel(filename, sheet_name='Parameters', index_col=0)
        params_dict = df['Value'].to_dict()

        # Convert to appropriate types
        for key in params_dict:
            if params_dict[key] is not None:
                if 'rate' in key or 'boost' in key or 'penalty' in key:
                    params_dict[key] = float(params_dict[key])
                elif 'cost' in key or 'spend' in key or 'premium' in key:
                    params_dict[key] = float(params_dict[key])
                elif 'policies' in key or 'max_leads' in key:
                    params_dict[key] = int(params_dict[key])
                elif 'fte' in key:
                    params_dict[key] = float(params_dict[key])

        # Remove monthly_retention_base as it's calculated
        if 'monthly_retention_base' in params_dict:
            del params_dict['monthly_retention_base']

        return SimulationParameters(**params_dict)


# Quick test scenarios for validation
def generate_test_scenarios():
    """Generate standard test scenarios for comparison"""
    scenarios = {
        "baseline": {
            "description": "Current state - no changes",
            "additional_lead_spend": 0,
            "additional_staff": 0,
            "has_concierge": False,
            "has_newsletter": False
        },
        "more_leads_only": {
            "description": "Double lead spend, no extra staff",
            "additional_lead_spend": 1000,
            "additional_staff": 0,
            "has_concierge": False,
            "has_newsletter": False
        },
        "balanced_growth": {
            "description": "Moderate lead increase with staff",
            "additional_lead_spend": 2000,
            "additional_staff": 1.0,
            "has_concierge": False,
            "has_newsletter": False
        },
        "systems_focus": {
            "description": "Add client systems, minimal lead increase",
            "additional_lead_spend": 500,
            "additional_staff": 0.5,
            "has_concierge": True,
            "has_newsletter": True
        },
        "aggressive_growth": {
            "description": "Maximum growth with all systems",
            "additional_lead_spend": 5000,
            "additional_staff": 2.0,
            "has_concierge": True,
            "has_newsletter": True
        }
    }
    return scenarios


if __name__ == "__main__":
    # Example usage
    config = ConfigManager()

    print("Available presets:")
    for preset in config.list_presets():
        print(f"  - {preset}")

    # Export template for Derek
    print("\nExporting parameter template to 'derek_parameters_template.xlsx'...")
    derek_params = config.get_preset("derek_actual")
    config.export_to_excel(derek_params, "derek_parameters_template.xlsx")
    print("Template exported! Send this to Derek for him to fill in actual values.")

    # Test scenarios
    print("\nTest scenarios available:")
    scenarios = generate_test_scenarios()
    for name, scenario in scenarios.items():
        print(f"  - {name}: {scenario['description']}")