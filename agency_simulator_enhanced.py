"""
Derek's Agency Growth Simulator - Enhanced Version
Core simulation engine with improved validation and error handling
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
import json
import warnings


@dataclass
class SimulationParameters:
    """Parameters for the agency simulation with validation"""

    # Current State
    current_policies: int = 500  # Current policies in force
    current_staff_fte: float = 2.0  # Current full-time equivalent staff
    baseline_lead_spend: float = 1000  # Current monthly lead spend

    # Lead Funnel Rates
    lead_cost_per_lead: float = 25  # Cost per lead
    contact_rate: float = 0.70  # % of leads contacted
    quote_rate: float = 0.60  # % of contacted that get quoted
    bind_rate: float = 0.50  # % of quoted that bind (become policies)

    # Financial Parameters
    avg_premium_annual: float = 1500  # Average annual premium per policy
    commission_rate: float = 0.12  # Commission rate on premiums

    # Retention
    annual_retention_base: float = 0.85  # Base annual retention rate
    monthly_retention_base: float = None  # Calculated from annual if not set

    # Staff Parameters
    staff_monthly_cost_per_fte: float = 5000  # Monthly cost per FTE
    max_leads_per_fte_per_month: float = 150  # Max leads per FTE before efficiency drops
    efficiency_penalty_rate: float = 0.02  # Efficiency drop per 10 leads over capacity

    # Client Systems Impact
    concierge_retention_boost: float = 0.03  # Retention improvement from concierge
    newsletter_retention_boost: float = 0.02  # Retention improvement from newsletter
    concierge_monthly_cost: float = 500  # Monthly cost of concierge system
    newsletter_monthly_cost: float = 200  # Monthly cost of newsletter system

    def __post_init__(self):
        """Calculate derived parameters and validate inputs"""
        self._validate_parameters()

        if self.monthly_retention_base is None:
            # Convert annual retention to monthly
            if self.annual_retention_base > 0:
                self.monthly_retention_base = self.annual_retention_base ** (1/12)
            else:
                self.monthly_retention_base = 0

    def _validate_parameters(self):
        """Validate all parameters are within reasonable bounds"""
        validations = [
            (self.current_policies >= 0, "current_policies", "must be non-negative"),
            (self.current_staff_fte >= 0, "current_staff_fte", "must be non-negative"),
            (self.baseline_lead_spend >= 0, "baseline_lead_spend", "must be non-negative"),
            (self.lead_cost_per_lead > 0, "lead_cost_per_lead", "must be positive"),
            (0 <= self.contact_rate <= 1, "contact_rate", "must be between 0 and 1"),
            (0 <= self.quote_rate <= 1, "quote_rate", "must be between 0 and 1"),
            (0 <= self.bind_rate <= 1, "bind_rate", "must be between 0 and 1"),
            (self.avg_premium_annual >= 0, "avg_premium_annual", "must be non-negative"),
            (0 <= self.commission_rate <= 1, "commission_rate", "must be between 0 and 1"),
            (0 <= self.annual_retention_base <= 1, "annual_retention_base", "must be between 0 and 1"),
            (self.staff_monthly_cost_per_fte >= 0, "staff_monthly_cost_per_fte", "must be non-negative"),
            (self.max_leads_per_fte_per_month > 0, "max_leads_per_fte_per_month", "must be positive"),
            (self.efficiency_penalty_rate >= 0, "efficiency_penalty_rate", "must be non-negative"),
            (0 <= self.concierge_retention_boost <= 0.2, "concierge_retention_boost", "must be between 0 and 0.2"),
            (0 <= self.newsletter_retention_boost <= 0.2, "newsletter_retention_boost", "must be between 0 and 0.2"),
            (self.concierge_monthly_cost >= 0, "concierge_monthly_cost", "must be non-negative"),
            (self.newsletter_monthly_cost >= 0, "newsletter_monthly_cost", "must be non-negative"),
        ]

        errors = []
        for valid, param, message in validations:
            if not valid:
                errors.append(f"{param} {message}")

        if errors:
            raise ValueError(f"Parameter validation failed:\n" + "\n".join(errors))

    def to_dict(self) -> Dict:
        """Convert parameters to dictionary"""
        return {k: v for k, v in self.__dict__.items()}

    @classmethod
    def from_dict(cls, params: Dict) -> 'SimulationParameters':
        """Create parameters from dictionary"""
        return cls(**params)


class AgencySimulator:
    """Main simulation engine for agency growth modeling with enhanced validation"""

    def __init__(self, params: SimulationParameters):
        self.params = params
        self._validate_simulator()

    def _validate_simulator(self):
        """Validate simulator is properly configured"""
        if self.params is None:
            raise ValueError("SimulationParameters required")

    def calculate_effective_bind_rate(self, leads: float, staff_fte: float) -> float:
        """
        Calculate the effective bind rate considering staff capacity

        Args:
            leads: Number of leads
            staff_fte: Full-time equivalent staff

        Returns:
            Effective conversion rate (contact * quote * bind)
        """
        # Validate inputs
        leads = max(0, leads)  # Ensure non-negative

        # Calculate base conversion
        base_conversion = self.params.contact_rate * self.params.quote_rate * self.params.bind_rate

        # Check for staff overload
        if staff_fte <= 0:
            return 0  # No staff, no conversions

        leads_per_fte = leads / staff_fte
        capacity_ratio = leads_per_fte / self.params.max_leads_per_fte_per_month

        if capacity_ratio <= 1.0:
            # Within capacity
            return base_conversion
        else:
            # Over capacity - apply penalty
            excess_ratio = capacity_ratio - 1.0
            penalty_multiplier = 1 - (excess_ratio * self.params.efficiency_penalty_rate * 10)
            penalty_multiplier = max(0.5, penalty_multiplier)  # Floor at 50% efficiency
            return base_conversion * penalty_multiplier

    def calculate_monthly_retention(self, has_concierge: bool, has_newsletter: bool) -> float:
        """
        Calculate monthly retention rate with system impacts

        Args:
            has_concierge: Whether concierge system is active
            has_newsletter: Whether newsletter system is active

        Returns:
            Monthly retention rate
        """
        annual_retention = self.params.annual_retention_base

        if has_concierge:
            annual_retention += self.params.concierge_retention_boost
        if has_newsletter:
            annual_retention += self.params.newsletter_retention_boost

        # Cap at reasonable maximum
        annual_retention = min(0.95, annual_retention)

        # Handle edge cases
        if annual_retention <= 0:
            return 0
        elif annual_retention >= 1:
            return 1

        # Convert to monthly
        return annual_retention ** (1/12)

    def simulate_month(
        self,
        policies_start: float,
        lead_spend: float,
        staff_fte: float,
        has_concierge: bool,
        has_newsletter: bool
    ) -> Dict:
        """
        Simulate one month of agency operations

        Args:
            policies_start: Policies at start of month
            lead_spend: Monthly lead spend
            staff_fte: Full-time equivalent staff
            has_concierge: Whether concierge system is active
            has_newsletter: Whether newsletter system is active

        Returns:
            Dictionary with month results
        """
        # Validate inputs
        policies_start = max(0, policies_start)
        lead_spend = max(0, lead_spend)  # Handle negative spend
        staff_fte = max(0, staff_fte)

        # Calculate leads from spend
        leads = lead_spend / self.params.lead_cost_per_lead if self.params.lead_cost_per_lead > 0 else 0

        # Calculate new policies with capacity constraints
        effective_bind_rate = self.calculate_effective_bind_rate(leads, staff_fte)
        new_policies = leads * effective_bind_rate

        # Apply retention to existing policies
        monthly_retention = self.calculate_monthly_retention(has_concierge, has_newsletter)
        retained_policies = policies_start * monthly_retention

        # Total policies at end of month
        policies_end = retained_policies + new_policies

        # Calculate revenue (monthly)
        monthly_premium_per_policy = self.params.avg_premium_annual / 12
        commission_revenue = policies_end * monthly_premium_per_policy * self.params.commission_rate

        # Calculate costs
        lead_costs = lead_spend
        staff_costs = staff_fte * self.params.staff_monthly_cost_per_fte
        system_costs = 0
        if has_concierge:
            system_costs += self.params.concierge_monthly_cost
        if has_newsletter:
            system_costs += self.params.newsletter_monthly_cost

        total_costs = lead_costs + staff_costs + system_costs

        # Net profit
        net_profit = commission_revenue - total_costs

        return {
            'policies_start': policies_start,
            'policies_end': policies_end,
            'new_policies': new_policies,
            'retained_policies': retained_policies,
            'leads': leads,
            'effective_bind_rate': effective_bind_rate,
            'commission_revenue': commission_revenue,
            'lead_costs': lead_costs,
            'staff_costs': staff_costs,
            'system_costs': system_costs,
            'total_costs': total_costs,
            'net_profit': net_profit,
            'staff_fte': staff_fte,
            'lead_spend': lead_spend,
            'has_concierge': has_concierge,
            'has_newsletter': has_newsletter,
            'monthly_retention': monthly_retention
        }

    def simulate_scenario(
        self,
        months: int,
        lead_spend_monthly: float,
        additional_staff_fte: float = 0,
        has_concierge: bool = False,
        has_newsletter: bool = False,
        starting_policies: Optional[float] = None
    ) -> pd.DataFrame:
        """
        Simulate a full scenario over multiple months

        Args:
            months: Number of months to simulate
            lead_spend_monthly: Monthly lead spend
            additional_staff_fte: Additional FTE to hire
            has_concierge: Whether to use concierge system
            has_newsletter: Whether to use newsletter system
            starting_policies: Starting policies (uses params default if None)

        Returns:
            DataFrame with monthly results
        """
        # Validate inputs
        months = max(0, int(months))  # Ensure non-negative integer
        lead_spend_monthly = max(0, lead_spend_monthly)
        additional_staff_fte = max(0, additional_staff_fte)

        if months == 0:
            return pd.DataFrame()  # Return empty DataFrame for 0 months

        results = []

        # Initialize
        policies = starting_policies if starting_policies is not None else self.params.current_policies
        policies = max(0, policies)  # Ensure non-negative
        total_staff = self.params.current_staff_fte + additional_staff_fte

        # Simulate each month
        for month in range(1, months + 1):
            month_result = self.simulate_month(
                policies_start=policies,
                lead_spend=lead_spend_monthly,
                staff_fte=total_staff,
                has_concierge=has_concierge,
                has_newsletter=has_newsletter
            )
            month_result['month'] = month
            results.append(month_result)

            # Update policies for next month
            policies = month_result['policies_end']

        return pd.DataFrame(results)

    def compare_scenarios(
        self,
        baseline_scenario: pd.DataFrame,
        test_scenario: pd.DataFrame
    ) -> Dict:
        """
        Compare two scenarios and calculate key metrics

        Args:
            baseline_scenario: DataFrame with baseline results
            test_scenario: DataFrame with test scenario results

        Returns:
            Dictionary with comparison metrics
        """
        # Handle empty DataFrames
        if len(baseline_scenario) == 0 or len(test_scenario) == 0:
            return {
                'payback_month': None,
                'total_incremental_profit': 0,
                'roi_percent': 0,
                'policy_growth': 0,
                'policy_growth_percent': 0,
                'final_baseline_policies': 0,
                'final_test_policies': 0,
                'incremental_monthly_profit': [],
                'incremental_cumulative_profit': []
            }

        # Calculate cumulative profits
        baseline_cumulative = baseline_scenario['net_profit'].cumsum()
        test_cumulative = test_scenario['net_profit'].cumsum()

        # Incremental profit
        incremental_monthly = test_scenario['net_profit'] - baseline_scenario['net_profit']
        incremental_cumulative = incremental_monthly.cumsum()

        # Find payback month (when incremental cumulative profit becomes positive)
        positive_months = incremental_cumulative[incremental_cumulative > 0]
        payback_month = positive_months.index[0] + 1 if len(positive_months) > 0 else None

        # Calculate ROI
        total_incremental_cost = (test_scenario['total_costs'] - baseline_scenario['total_costs']).sum()
        total_incremental_profit = incremental_cumulative.iloc[-1] if len(incremental_cumulative) > 0 else 0

        roi = (total_incremental_profit / total_incremental_cost * 100) if total_incremental_cost > 0 else 0

        # Policy growth
        baseline_final_policies = baseline_scenario['policies_end'].iloc[-1]
        test_final_policies = test_scenario['policies_end'].iloc[-1]
        policy_growth = test_final_policies - baseline_final_policies
        policy_growth_pct = (policy_growth / baseline_final_policies * 100) if baseline_final_policies > 0 else 0

        return {
            'payback_month': payback_month,
            'total_incremental_profit': total_incremental_profit,
            'roi_percent': roi,
            'policy_growth': policy_growth,
            'policy_growth_percent': policy_growth_pct,
            'final_baseline_policies': baseline_final_policies,
            'final_test_policies': test_final_policies,
            'incremental_monthly_profit': incremental_monthly.tolist(),
            'incremental_cumulative_profit': incremental_cumulative.tolist()
        }

    def run_baseline(self, months: int) -> pd.DataFrame:
        """
        Run baseline scenario with current parameters

        Args:
            months: Number of months to simulate

        Returns:
            DataFrame with baseline results
        """
        return self.simulate_scenario(
            months=months,
            lead_spend_monthly=self.params.baseline_lead_spend,
            additional_staff_fte=0,
            has_concierge=False,
            has_newsletter=False
        )

    def optimize_investment(
        self,
        months: int,
        max_additional_spend: float = 10000,
        spend_increment: float = 500,
        verbose: bool = False
    ) -> Dict:
        """
        Find optimal investment mix within budget

        Args:
            months: Number of months to simulate
            max_additional_spend: Maximum additional monthly spend
            spend_increment: Increment for testing different spend levels
            verbose: Print progress information

        Returns:
            Dictionary with optimal scenario details
        """
        baseline = self.run_baseline(months)
        best_scenario = None
        best_metrics = None
        best_roi = -float('inf')
        scenarios_tested = 0

        # Test different combinations
        for lead_spend_add in np.arange(0, max_additional_spend, spend_increment):
            for additional_fte in [0, 0.5, 1.0, 1.5, 2.0]:
                for has_concierge in [False, True]:
                    for has_newsletter in [False, True]:
                        # Calculate total additional cost
                        additional_cost = (
                            lead_spend_add +
                            additional_fte * self.params.staff_monthly_cost_per_fte +
                            (self.params.concierge_monthly_cost if has_concierge else 0) +
                            (self.params.newsletter_monthly_cost if has_newsletter else 0)
                        )

                        if additional_cost > max_additional_spend:
                            continue

                        scenarios_tested += 1
                        if verbose and scenarios_tested % 10 == 0:
                            print(f"Tested {scenarios_tested} scenarios...")

                        # Run scenario
                        scenario = self.simulate_scenario(
                            months=months,
                            lead_spend_monthly=self.params.baseline_lead_spend + lead_spend_add,
                            additional_staff_fte=additional_fte,
                            has_concierge=has_concierge,
                            has_newsletter=has_newsletter
                        )

                        # Compare to baseline
                        metrics = self.compare_scenarios(baseline, scenario)

                        # Check if this is best so far
                        if metrics['roi_percent'] > best_roi:
                            best_roi = metrics['roi_percent']
                            best_scenario = {
                                'additional_lead_spend': lead_spend_add,
                                'additional_fte': additional_fte,
                                'has_concierge': has_concierge,
                                'has_newsletter': has_newsletter,
                                'total_additional_cost': additional_cost
                            }
                            best_metrics = metrics

        if verbose:
            print(f"Tested {scenarios_tested} total scenarios")

        return {
            'scenario': best_scenario,
            'metrics': best_metrics,
            'scenarios_tested': scenarios_tested
        }

    def generate_report(self, scenario_results: pd.DataFrame) -> str:
        """
        Generate a text report from scenario results

        Args:
            scenario_results: DataFrame with simulation results

        Returns:
            Formatted text report
        """
        if len(scenario_results) == 0:
            return "No results to report"

        final_month = scenario_results.iloc[-1]
        total_profit = scenario_results['net_profit'].sum()
        avg_monthly_profit = scenario_results['net_profit'].mean()
        policy_growth = final_month['policies_end'] - scenario_results.iloc[0]['policies_start']

        report = f"""
AGENCY GROWTH SIMULATION REPORT
================================

Simulation Period: {len(scenario_results)} months

FINAL STATE:
- Policies in Force: {final_month['policies_end']:.0f}
- Policy Growth: {policy_growth:.0f} ({policy_growth / scenario_results.iloc[0]['policies_start'] * 100:.1f}%)
- Monthly Revenue: ${final_month['commission_revenue']:,.0f}
- Monthly Costs: ${final_month['total_costs']:,.0f}
- Monthly Profit: ${final_month['net_profit']:,.0f}

CUMULATIVE RESULTS:
- Total Profit: ${total_profit:,.0f}
- Average Monthly Profit: ${avg_monthly_profit:,.0f}

OPERATIONAL METRICS:
- Average Leads/Month: {scenario_results['leads'].mean():.0f}
- Average Bind Rate: {scenario_results['effective_bind_rate'].mean():.1%}
- Average Retention: {scenario_results['monthly_retention'].mean() ** 12:.1%} annual

COST BREAKDOWN (Monthly Average):
- Lead Costs: ${scenario_results['lead_costs'].mean():,.0f}
- Staff Costs: ${scenario_results['staff_costs'].mean():,.0f}
- System Costs: ${scenario_results['system_costs'].mean():,.0f}
"""
        return report


def run_enhanced_sanity_checks():
    """Run sanity checks on the enhanced simulator"""
    params = SimulationParameters()
    sim = AgencySimulator(params)

    print("Running Enhanced Sanity Checks...")
    print("=" * 50)

    # Test 1: More leads should increase policies
    base = sim.simulate_scenario(12, lead_spend_monthly=1000)
    more_leads = sim.simulate_scenario(12, lead_spend_monthly=2000)

    assert more_leads['policies_end'].iloc[-1] > base['policies_end'].iloc[-1], \
        "More leads should increase policies"
    print("✓ Test 1: More leads increase policies")

    # Test 2: Staff capacity affects conversion
    normal_staff = sim.simulate_scenario(12, lead_spend_monthly=5000, additional_staff_fte=0)
    more_staff = sim.simulate_scenario(12, lead_spend_monthly=5000, additional_staff_fte=2)

    assert more_staff['effective_bind_rate'].mean() >= normal_staff['effective_bind_rate'].mean(), \
        "More staff should maintain or improve conversion when overloaded"
    print("✓ Test 2: Staff capacity affects conversion")

    # Test 3: Client systems should improve retention
    no_systems = sim.simulate_scenario(12, lead_spend_monthly=1000)
    with_systems = sim.simulate_scenario(12, lead_spend_monthly=1000,
                                       has_concierge=True, has_newsletter=True)

    assert with_systems['monthly_retention'].iloc[0] > no_systems['monthly_retention'].iloc[0], \
        "Client systems should improve retention"
    print("✓ Test 3: Client systems improve retention")

    # Test 4: Negative inputs are handled
    neg_test = sim.simulate_scenario(12, lead_spend_monthly=-1000)
    assert len(neg_test) == 12, "Negative inputs should be handled gracefully"
    print("✓ Test 4: Negative inputs handled")

    # Test 5: Zero months handled
    zero_months = sim.simulate_scenario(0, lead_spend_monthly=1000)
    assert len(zero_months) == 0, "Zero months should return empty DataFrame"
    print("✓ Test 5: Zero months handled correctly")

    # Test 6: Report generation
    report = sim.generate_report(base)
    assert len(report) > 100, "Report should be generated"
    print("✓ Test 6: Report generation works")

    print("\nAll enhanced sanity checks passed!")
    return True


if __name__ == "__main__":
    # Run sanity checks
    run_enhanced_sanity_checks()

    # Demo simulation
    print("\n" + "=" * 50)
    print("Enhanced Simulation Demo")
    print("=" * 50)

    params = SimulationParameters()
    sim = AgencySimulator(params)

    # Run baseline
    baseline = sim.run_baseline(24)
    print(f"\nBaseline (24 months):")
    print(f"  Starting policies: {params.current_policies}")
    print(f"  Ending policies: {baseline['policies_end'].iloc[-1]:.0f}")
    print(f"  Total profit: ${baseline['net_profit'].sum():,.0f}")

    # Test scenario with validation
    test = sim.simulate_scenario(
        months=24,
        lead_spend_monthly=3000,
        additional_staff_fte=1,
        has_concierge=True,
        has_newsletter=True
    )

    # Generate and print report
    print("\nDetailed Report:")
    print(sim.generate_report(test))