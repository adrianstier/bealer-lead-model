"""
Derek's Agency Growth Simulator - Enhanced Interactive UI
Streamlit interface with improved UX, validation, and helpful guidance
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import json
from agency_simulator_enhanced import SimulationParameters, AgencySimulator


# Page config
st.set_page_config(
    page_title="Derek's Agency Growth Simulator",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Simple CSS for key styling only
st.markdown("""
<style>
    .stAlert {
        padding: 1rem;
        border-radius: 0.5rem;
    }
    div[data-testid="metric-container"] {
        background-color: rgba(240, 242, 246, 0.5);
        border-radius: 5px;
        padding: 10px;
        margin: 5px 0;
    }
</style>
""", unsafe_allow_html=True)

# Title with better formatting
col_title, col_help = st.columns([5, 1])
with col_title:
    st.title("🏢 Derek's Agency Growth Simulator")
    st.markdown("**Make data-driven decisions about lead spend, staffing, and client retention systems**")

with col_help:
    with st.expander("ℹ️ Need Help?", expanded=False):
        st.markdown("""
        **Quick Start:**
        1. Adjust parameters in the sidebar to match your agency
        2. Build a growth scenario with the sliders
        3. Click "Run Simulation" to see results
        4. Review recommendations at the bottom

        **Tips:**
        - Start conservative and increase gradually
        - Balance lead spend with staff capacity
        - Client systems provide compound benefits
        """)

# Initialize session state
if 'params' not in st.session_state:
    st.session_state.params = SimulationParameters()

if 'simulation_history' not in st.session_state:
    st.session_state.simulation_history = []

# Sidebar with better organization
with st.sidebar:
    st.header("📋 Simulation Parameters")

    # Quick presets
    st.markdown("### Quick Presets")
    preset_col1, preset_col2, preset_col3 = st.columns(3)
    with preset_col1:
        if st.button("Conservative", use_container_width=True):
            st.session_state.params = SimulationParameters(
                annual_retention_base=0.82,
                bind_rate=0.45,
                commission_rate=0.10
            )
            st.rerun()
    with preset_col2:
        if st.button("Moderate", use_container_width=True):
            st.session_state.params = SimulationParameters()  # Default
            st.rerun()
    with preset_col3:
        if st.button("Aggressive", use_container_width=True):
            st.session_state.params = SimulationParameters(
                annual_retention_base=0.88,
                bind_rate=0.55,
                commission_rate=0.14
            )
            st.rerun()

    st.markdown("---")

    # Create tabs for different parameter groups
    param_tab1, param_tab2, param_tab3, param_tab4 = st.tabs([
        "📍 Current State",
        "🎯 Funnel",
        "💰 Finance",
        "⚙️ Advanced"
    ])

    with param_tab1:
        st.markdown("### Your Agency Today")

        current_policies = st.number_input(
            "Current Policies in Force",
            min_value=100,
            max_value=5000,
            value=st.session_state.params.current_policies,
            step=50,
            help="💡 Number of active policies you manage today"
        )

        current_staff_fte = st.number_input(
            "Current Staff (FTE)",
            min_value=0.5,
            max_value=10.0,
            value=st.session_state.params.current_staff_fte,
            step=0.5,
            help="💡 Full-time equivalent staff (e.g., 2 full-time = 2.0, 1 part-time = 0.5)"
        )

        baseline_lead_spend = st.number_input(
            "Current Monthly Lead Spend ($)",
            min_value=0,
            max_value=10000,
            value=int(st.session_state.params.baseline_lead_spend),
            step=100,
            help="💡 What you currently spend on leads each month"
        )

        # Show current metrics
        st.info(f"""
        **Current Performance:**
        - Leads per month: {baseline_lead_spend / 25:.0f} (at $25/lead)
        - Policies per staff: {current_policies / current_staff_fte:.0f}
        - Lead spend per policy: ${baseline_lead_spend / (current_policies / 12) if current_policies > 0 else 0:.0f}
        """)

    with param_tab2:
        st.markdown("### Lead Conversion Funnel")

        lead_cost = st.number_input(
            "Cost per Lead ($)",
            min_value=5,
            max_value=200,
            value=int(st.session_state.params.lead_cost_per_lead),
            help="💡 Internet leads: $20-50, Referrals: $5-15, Purchased lists: $50-100"
        )

        st.markdown("**Conversion Rates**")

        contact_rate = st.slider(
            "Contact Rate (%)",
            min_value=20,
            max_value=100,
            value=int(st.session_state.params.contact_rate * 100),
            help="💡 Typical: 60-80%. How many leads you successfully reach"
        )

        quote_rate = st.slider(
            "Quote → Contact (%)",
            min_value=20,
            max_value=100,
            value=int(st.session_state.params.quote_rate * 100),
            help="💡 Typical: 50-70%. Contacts that receive a quote"
        )

        bind_rate = st.slider(
            "Bind → Quote (%)",
            min_value=10,
            max_value=80,
            value=int(st.session_state.params.bind_rate * 100),
            help="💡 Typical: 40-60%. Quotes that become policies"
        )

        # Show overall conversion
        overall_conversion = (contact_rate/100) * (quote_rate/100) * (bind_rate/100)
        st.success(f"**Overall Conversion: {overall_conversion:.1%}**")
        st.caption(f"For every 100 leads, you'll get ~{overall_conversion * 100:.0f} new policies")

    with param_tab3:
        st.markdown("### Financial Parameters")

        avg_premium = st.number_input(
            "Avg Annual Premium ($)",
            min_value=500,
            max_value=5000,
            value=int(st.session_state.params.avg_premium_annual),
            step=100,
            help="💡 Average across all lines (auto, home, etc.)"
        )

        commission_rate = st.slider(
            "Commission Rate (%)",
            min_value=5,
            max_value=25,
            value=int(st.session_state.params.commission_rate * 100),
            help="💡 Your commission percentage on premiums"
        )

        # Show monthly revenue per policy
        monthly_revenue = (avg_premium / 12) * (commission_rate / 100)
        st.info(f"**Monthly revenue per policy: ${monthly_revenue:.2f}**")

        st.markdown("---")

        retention_rate = st.slider(
            "Annual Retention (%)",
            min_value=60,
            max_value=95,
            value=int(st.session_state.params.annual_retention_base * 100),
            help="💡 Industry average: 84-87%. Top agencies: 90%+"
        )

        # Show retention impact
        monthly_retention = retention_rate / 100 ** (1/12)
        st.caption(f"Monthly retention: {monthly_retention:.1%}")

        st.markdown("---")

        staff_cost = st.number_input(
            "Monthly Cost per FTE ($)",
            min_value=2000,
            max_value=15000,
            value=int(st.session_state.params.staff_monthly_cost_per_fte),
            step=500,
            help="💡 Include salary, benefits, overhead"
        )

    with param_tab4:
        st.markdown("### Advanced Settings")

        max_leads_per_fte = st.number_input(
            "Max Leads per FTE/Month",
            min_value=50,
            max_value=500,
            value=int(st.session_state.params.max_leads_per_fte_per_month),
            step=25,
            help="💡 Beyond this, conversion rates drop"
        )

        st.markdown("**Client System Impacts**")

        col1, col2 = st.columns(2)
        with col1:
            concierge_boost = st.slider(
                "Concierge Boost (%)",
                min_value=0,
                max_value=10,
                value=int(st.session_state.params.concierge_retention_boost * 100),
                help="💡 Retention improvement from personal touches"
            )

            concierge_cost = st.number_input(
                "Concierge Cost ($/mo)",
                min_value=0,
                max_value=2000,
                value=int(st.session_state.params.concierge_monthly_cost),
                step=100
            )

        with col2:
            newsletter_boost = st.slider(
                "Newsletter Boost (%)",
                min_value=0,
                max_value=10,
                value=int(st.session_state.params.newsletter_retention_boost * 100),
                help="💡 Retention improvement from regular communication"
            )

            newsletter_cost = st.number_input(
                "Newsletter Cost ($/mo)",
                min_value=0,
                max_value=1000,
                value=int(st.session_state.params.newsletter_monthly_cost),
                step=50
            )

    # Update parameters button
    if st.button("🔄 Update Parameters", type="primary", use_container_width=True):
        try:
            st.session_state.params = SimulationParameters(
                current_policies=current_policies,
                current_staff_fte=current_staff_fte,
                baseline_lead_spend=float(baseline_lead_spend),
                lead_cost_per_lead=float(lead_cost),
                contact_rate=contact_rate/100,
                quote_rate=quote_rate/100,
                bind_rate=bind_rate/100,
                avg_premium_annual=float(avg_premium),
                commission_rate=commission_rate/100,
                annual_retention_base=retention_rate/100,
                staff_monthly_cost_per_fte=float(staff_cost),
                max_leads_per_fte_per_month=float(max_leads_per_fte),
                concierge_retention_boost=concierge_boost/100,
                newsletter_retention_boost=newsletter_boost/100,
                concierge_monthly_cost=float(concierge_cost),
                newsletter_monthly_cost=float(newsletter_cost)
            )
            st.success("✓ Parameters updated successfully!")
            st.rerun()
        except ValueError as e:
            st.error(f"❌ Parameter validation failed: {str(e)}")

# Main content area
st.header("🎯 Build Your Growth Scenario")

# Scenario builder with better layout
scenario_container = st.container()
with scenario_container:
    col1, col2 = st.columns([3, 2])

    with col1:
        # Time horizon with visual indicator
        months_to_simulate = st.select_slider(
            "Simulation Time Horizon",
            options=[12, 18, 24, 30, 36],
            value=24,
            format_func=lambda x: f"{x} months ({x/12:.1f} years)",
            help="💡 24 months recommended for reliable projections"
        )

        # Lead spend with visual feedback
        st.markdown("### 📈 Lead Investment")
        additional_lead_spend = st.slider(
            "Additional Monthly Lead Spend",
            min_value=0,
            max_value=10000,
            value=2000,
            step=250,
            help="💡 Start conservative, scale up gradually"
        )
        st.caption(f"Additional spend: ${additional_lead_spend:,}/month")

        # Show lead impact
        total_leads = (st.session_state.params.baseline_lead_spend + additional_lead_spend) / st.session_state.params.lead_cost_per_lead
        current_leads = st.session_state.params.baseline_lead_spend / st.session_state.params.lead_cost_per_lead
        st.caption(f"Total leads: {total_leads:.0f}/month (+{total_leads - current_leads:.0f} from baseline)")

        # Staff with capacity indicator
        st.markdown("### 👥 Staffing")
        additional_staff = st.slider(
            "Additional Staff (FTE)",
            min_value=0.0,
            max_value=5.0,
            value=0.5,
            step=0.5,
            help="💡 Add staff when leads exceed capacity"
        )
        st.caption(f"Additional staff: +{additional_staff:.1f} FTE" if additional_staff > 0 else "No additional staff")

        # Show capacity status
        total_staff = st.session_state.params.current_staff_fte + additional_staff
        capacity_ratio = total_leads / (total_staff * st.session_state.params.max_leads_per_fte_per_month) if total_staff > 0 else 999

        if capacity_ratio <= 0.8:
            st.success(f"✓ Capacity OK ({capacity_ratio:.0%} utilized)")
        elif capacity_ratio <= 1.0:
            st.warning(f"⚠️ Near capacity ({capacity_ratio:.0%} utilized)")
        else:
            st.error(f"❌ Over capacity ({capacity_ratio:.0%}) - conversion will suffer!")

        # Client systems with ROI preview
        st.markdown("### 🎁 Client Retention Systems")
        sys_col1, sys_col2 = st.columns(2)

        with sys_col1:
            has_concierge = st.checkbox(
                "🎂 Concierge System",
                value=False,
                help="Birthday cards, anniversary calls, personal touches"
            )
            if has_concierge:
                st.caption(f"Cost: ${st.session_state.params.concierge_monthly_cost}/mo | +{st.session_state.params.concierge_retention_boost*100:.0f}% retention")

        with sys_col2:
            has_newsletter = st.checkbox(
                "📰 Newsletter System",
                value=False,
                help="Quarterly updates, tips, community news"
            )
            if has_newsletter:
                st.caption(f"Cost: ${st.session_state.params.newsletter_monthly_cost}/mo | +{st.session_state.params.newsletter_retention_boost*100:.0f}% retention")

    with col2:
        st.markdown("### 📊 Scenario Summary")

        # Calculate totals
        total_lead_spend = st.session_state.params.baseline_lead_spend + additional_lead_spend
        total_staff_fte = st.session_state.params.current_staff_fte + additional_staff
        system_costs = 0
        if has_concierge:
            system_costs += st.session_state.params.concierge_monthly_cost
        if has_newsletter:
            system_costs += st.session_state.params.newsletter_monthly_cost

        total_additional_cost = (
            additional_lead_spend +
            additional_staff * st.session_state.params.staff_monthly_cost_per_fte +
            system_costs
        )

        # Display summary metrics using Streamlit native components
        st.markdown("#### Investment Summary")
        col_metric1, col_metric2 = st.columns(2)

        with col_metric1:
            st.metric("Lead Spend", f"${total_lead_spend:,.0f}/mo", f"+${additional_lead_spend:,.0f}")
            st.metric("Total Staff", f"{total_staff_fte:.1f} FTE", f"+{additional_staff:.1f}")
            st.metric("System Costs", f"${system_costs:,.0f}/mo")

        with col_metric2:
            st.metric("Total Additional", f"${total_additional_cost:,.0f}/mo")
            st.metric("Annual Investment", f"${total_additional_cost * 12:,.0f}")

            # ROI preview
            if total_additional_cost > 0:
                estimated_new_policies = (additional_lead_spend / st.session_state.params.lead_cost_per_lead) * \
                                        (st.session_state.params.contact_rate * st.session_state.params.quote_rate * st.session_state.params.bind_rate)
                st.metric("Est. New Policies/mo", f"{estimated_new_policies:.1f}")

        # Quick validation warnings
        if total_additional_cost == 0:
            st.info("💡 Adjust sliders to build a growth scenario")
        elif capacity_ratio > 1.2:
            st.error("⚠️ Consider adding more staff for this lead volume")
        elif total_additional_cost > 10000:
            st.warning("⚠️ Large investment - ensure you have the capital")

# Run simulation section
st.markdown("---")

col_run1, col_run2, col_run3 = st.columns([2, 3, 2])
with col_run2:
    run_button = st.button(
        "🚀 Run Simulation",
        type="primary",
        use_container_width=True,
        disabled=(total_additional_cost == 0)
    )

if run_button:
    with st.spinner("Running simulation and analyzing results..."):
        try:
            # Initialize simulator
            sim = AgencySimulator(st.session_state.params)

            # Run baseline scenario
            baseline_results = sim.run_baseline(months_to_simulate)

            # Run test scenario
            test_results = sim.simulate_scenario(
                months=months_to_simulate,
                lead_spend_monthly=total_lead_spend,
                additional_staff_fte=additional_staff,
                has_concierge=has_concierge,
                has_newsletter=has_newsletter
            )

            # Compare scenarios
            comparison = sim.compare_scenarios(baseline_results, test_results)

            # Store results
            st.session_state.baseline_results = baseline_results
            st.session_state.test_results = test_results
            st.session_state.comparison = comparison

            # Add to history
            st.session_state.simulation_history.append({
                'timestamp': pd.Timestamp.now(),
                'scenario': {
                    'additional_lead_spend': additional_lead_spend,
                    'additional_staff': additional_staff,
                    'has_concierge': has_concierge,
                    'has_newsletter': has_newsletter
                },
                'results': comparison
            })

            st.success("✓ Simulation complete!")

        except Exception as e:
            st.error(f"❌ Simulation failed: {str(e)}")

# Display results if available
if 'comparison' in st.session_state:
    st.header("📈 Results & Analysis")

    # Key metrics with visual indicators
    metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)

    with metric_col1:
        payback = st.session_state.comparison['payback_month']
        if payback:
            if payback <= 12:
                color = "🟢"
                assessment = "Excellent"
            elif payback <= 24:
                color = "🟡"
                assessment = "Good"
            else:
                color = "🔴"
                assessment = "Long"

            st.metric(
                "Payback Period",
                f"{payback} months",
                f"{color} {assessment}"
            )
        else:
            st.metric("Payback Period", "No payback", "🔴 Review strategy")

    with metric_col2:
        roi = st.session_state.comparison['roi_percent']
        if roi > 50:
            color = "🟢"
            assessment = "Strong"
        elif roi > 0:
            color = "🟡"
            assessment = "Positive"
        else:
            color = "🔴"
            assessment = "Negative"

        st.metric(
            "Return on Investment",
            f"{roi:.1f}%",
            f"{color} {assessment}"
        )

    with metric_col3:
        policy_growth = st.session_state.comparison['policy_growth']
        growth_pct = st.session_state.comparison['policy_growth_percent']
        st.metric(
            "Policy Growth",
            f"+{policy_growth:.0f}",
            f"{growth_pct:.1f}% increase"
        )

    with metric_col4:
        total_profit = st.session_state.comparison['total_incremental_profit']
        if total_profit > 0:
            color = "🟢"
        else:
            color = "🔴"
        st.metric(
            "Incremental Profit",
            f"${total_profit:,.0f}",
            f"{color} {months_to_simulate}-month total"
        )

    # Detailed charts
    st.markdown("---")
    chart_tab1, chart_tab2, chart_tab3, chart_tab4, chart_tab5 = st.tabs([
        "📊 Policies",
        "💰 Profit",
        "📈 ROI",
        "🎯 Efficiency",
        "📝 Report"
    ])

    with chart_tab1:
        # Enhanced policies chart
        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=st.session_state.baseline_results['month'],
            y=st.session_state.baseline_results['policies_end'],
            mode='lines',
            name='Baseline (Do Nothing)',
            line=dict(color='gray', dash='dash', width=2),
            hovertemplate='Month %{x}<br>Policies: %{y:.0f}<extra></extra>'
        ))

        fig.add_trace(go.Scatter(
            x=st.session_state.test_results['month'],
            y=st.session_state.test_results['policies_end'],
            mode='lines',
            name='Growth Scenario',
            line=dict(color='#1f77b4', width=3),
            fill='tonexty',
            fillcolor='rgba(31, 119, 180, 0.1)',
            hovertemplate='Month %{x}<br>Policies: %{y:.0f}<extra></extra>'
        ))

        # Add annotations for key milestones
        if st.session_state.comparison['payback_month']:
            payback_idx = st.session_state.comparison['payback_month'] - 1
            if payback_idx < len(st.session_state.test_results):
                fig.add_annotation(
                    x=st.session_state.comparison['payback_month'],
                    y=st.session_state.test_results.iloc[payback_idx]['policies_end'],
                    text="Payback",
                    showarrow=True,
                    arrowhead=2,
                    arrowcolor="green",
                    ax=0,
                    ay=-40
                )

        fig.update_layout(
            title="Policies in Force Over Time",
            xaxis_title="Month",
            yaxis_title="Number of Policies",
            height=400,
            hovermode='x unified',
            showlegend=True,
            legend=dict(x=0.02, y=0.98)
        )

        st.plotly_chart(fig, use_container_width=True)

        # Policy growth breakdown
        col1, col2 = st.columns(2)
        with col1:
            st.info(f"""
            **Growth Breakdown:**
            - New from leads: {st.session_state.test_results['new_policies'].sum():.0f}
            - Lost to churn: {(st.session_state.test_results['policies_start'] - st.session_state.test_results['retained_policies']).sum():.0f}
            - Net growth: {st.session_state.comparison['policy_growth']:.0f}
            """)
        with col2:
            avg_monthly_growth = st.session_state.comparison['policy_growth'] / months_to_simulate
            st.info(f"""
            **Monthly Averages:**
            - New policies: {st.session_state.test_results['new_policies'].mean():.1f}/mo
            - Growth rate: {avg_monthly_growth:.1f}/mo
            - Final book size: {st.session_state.test_results['policies_end'].iloc[-1]:.0f}
            """)

    with chart_tab2:
        # Profit analysis with break-even
        fig = make_subplots(
            rows=2, cols=1,
            subplot_titles=("Monthly Net Profit", "Cumulative Incremental Profit"),
            row_heights=[0.5, 0.5]
        )

        # Monthly profit
        fig.add_trace(
            go.Scatter(
                x=st.session_state.baseline_results['month'],
                y=st.session_state.baseline_results['net_profit'],
                mode='lines',
                name='Baseline',
                line=dict(color='gray', dash='dash'),
                showlegend=True
            ),
            row=1, col=1
        )

        fig.add_trace(
            go.Scatter(
                x=st.session_state.test_results['month'],
                y=st.session_state.test_results['net_profit'],
                mode='lines',
                name='Growth Scenario',
                line=dict(color='green', width=2),
                showlegend=True
            ),
            row=1, col=1
        )

        # Cumulative incremental
        cumulative = st.session_state.comparison['incremental_cumulative_profit']
        colors = ['red' if x < 0 else 'green' for x in cumulative]

        fig.add_trace(
            go.Bar(
                x=list(range(1, len(cumulative) + 1)),
                y=cumulative,
                marker_color=colors,
                name='Cumulative Gain',
                showlegend=False
            ),
            row=2, col=1
        )

        # Add break-even line
        fig.add_hline(y=0, line_dash="dot", line_color="black", opacity=0.5, row=1, col=1)
        fig.add_hline(y=0, line_dash="dot", line_color="black", opacity=0.5, row=2, col=1)

        fig.update_layout(height=600, hovermode='x unified')
        fig.update_xaxes(title_text="Month", row=2, col=1)
        fig.update_yaxes(title_text="Profit ($)", row=1, col=1)
        fig.update_yaxes(title_text="Cumulative ($)", row=2, col=1)

        st.plotly_chart(fig, use_container_width=True)

    with chart_tab3:
        # ROI visualization
        months = list(range(1, months_to_simulate + 1))
        incremental_costs = [(test_results.iloc[:i]['total_costs'].sum() -
                            baseline_results.iloc[:i]['total_costs'].sum())
                           for i in range(1, months_to_simulate + 1)]

        incremental_profits = st.session_state.comparison['incremental_cumulative_profit']

        roi_over_time = [(p / c * 100 if c > 0 else 0)
                        for p, c in zip(incremental_profits, incremental_costs)]

        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=months,
            y=roi_over_time,
            mode='lines+markers',
            name='ROI %',
            line=dict(color='purple', width=2),
            marker=dict(size=6),
            hovertemplate='Month %{x}<br>ROI: %{y:.1f}%<extra></extra>'
        ))

        # Add reference lines
        fig.add_hline(y=0, line_dash="dash", line_color="gray", annotation_text="Break-even")
        fig.add_hline(y=50, line_dash="dot", line_color="green", annotation_text="50% ROI", opacity=0.5)
        fig.add_hline(y=100, line_dash="dot", line_color="blue", annotation_text="100% ROI", opacity=0.5)

        fig.update_layout(
            title="Return on Investment Over Time",
            xaxis_title="Month",
            yaxis_title="ROI (%)",
            height=400,
            hovermode='x'
        )

        st.plotly_chart(fig, use_container_width=True)

    with chart_tab4:
        # Efficiency metrics dashboard
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Lead Conversion Efficiency",
                "Cost per New Policy",
                "Revenue per Policy",
                "Staff Productivity"
            ),
            specs=[[{"type": "scatter"}, {"type": "scatter"}],
                   [{"type": "scatter"}, {"type": "bar"}]]
        )

        # Conversion efficiency
        fig.add_trace(
            go.Scatter(
                x=st.session_state.test_results['month'],
                y=st.session_state.test_results['effective_bind_rate'] * 100,
                mode='lines',
                name='Bind Rate',
                line=dict(color='orange', width=2)
            ),
            row=1, col=1
        )

        # Cost per new policy
        cost_per_policy = st.session_state.test_results['total_costs'] / st.session_state.test_results['new_policies']
        cost_per_policy = cost_per_policy.replace([float('inf')], 0)

        fig.add_trace(
            go.Scatter(
                x=st.session_state.test_results['month'],
                y=cost_per_policy,
                mode='lines',
                name='Cost/Policy',
                line=dict(color='red', width=2)
            ),
            row=1, col=2
        )

        # Revenue per policy
        revenue_per_policy = (st.session_state.test_results['commission_revenue'] /
                            st.session_state.test_results['policies_end'])

        fig.add_trace(
            go.Scatter(
                x=st.session_state.test_results['month'],
                y=revenue_per_policy,
                mode='lines',
                name='Revenue/Policy',
                line=dict(color='green', width=2)
            ),
            row=2, col=1
        )

        # Staff productivity (policies per FTE)
        policies_per_fte = st.session_state.test_results['policies_end'] / total_staff_fte

        fig.add_trace(
            go.Bar(
                x=['Current', 'Projected'],
                y=[current_policies / current_staff_fte, policies_per_fte.iloc[-1]],
                marker_color=['lightblue', 'darkblue'],
                text=[f"{current_policies / current_staff_fte:.0f}",
                      f"{policies_per_fte.iloc[-1]:.0f}"],
                textposition='auto'
            ),
            row=2, col=2
        )

        fig.update_layout(height=600, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    with chart_tab5:
        # Generate detailed report
        sim = AgencySimulator(st.session_state.params)
        report = sim.generate_report(st.session_state.test_results)

        st.text(report)

        # Download button for report
        st.download_button(
            label="📥 Download Report",
            data=report,
            file_name=f"agency_simulation_report_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.txt",
            mime="text/plain"
        )

    # Smart Recommendations
    st.header("💡 Recommendations")

    payback = st.session_state.comparison['payback_month']
    roi = st.session_state.comparison['roi_percent']
    policy_growth = st.session_state.comparison['policy_growth']

    # Determine recommendation level
    if payback and payback <= 18 and roi > 75:
        recommendation_level = "strong"
        emoji = "🟢"
        title = "Strongly Recommended"
        color_class = "success-box"
    elif payback and payback <= 24 and roi > 25:
        recommendation_level = "moderate"
        emoji = "🟡"
        title = "Recommended with Monitoring"
        color_class = "warning-box"
    else:
        recommendation_level = "weak"
        emoji = "🔴"
        title = "Not Recommended"
        color_class = "recommendation-box"

    # Main recommendation
    if recommendation_level == "strong":
        st.success(f"### {emoji} {title}")
    elif recommendation_level == "moderate":
        st.warning(f"### {emoji} {title}")
    else:
        st.error(f"### {emoji} {title}")

    # Detailed analysis
    col1, col2 = st.columns([2, 1])

    with col1:
        if recommendation_level == "strong":
            st.success(f"""
            **Why this works:**
            - Fast payback period ({payback} months)
            - Strong ROI ({roi:.1f}%)
            - Sustainable growth (+{policy_growth:.0f} policies)

            **Action items:**
            1. Implement this growth strategy immediately
            2. Monitor conversion rates weekly for first month
            3. Adjust staff scheduling to handle increased volume
            4. Set up tracking for ROI validation
            """)

        elif recommendation_level == "moderate":
            st.warning(f"""
            **Proceed with caution:**
            - Moderate payback period ({payback} months)
            - Acceptable ROI ({roi:.1f}%)
            - Growth requires patience (+{policy_growth:.0f} policies)

            **Risk mitigation:**
            1. Start with 50% of proposed investment
            2. Set 90-day checkpoints for performance review
            3. Have contingency plan if metrics underperform
            4. Consider phased rollout over 3-6 months
            """)

        else:
            st.error(f"""
            **Why this doesn't work:**
            - {'No payback within simulation' if not payback else f'Very long payback ({payback} months)'}
            - {'Negative' if roi < 0 else 'Weak'} ROI ({roi:.1f}%)
            - High risk relative to reward

            **Better alternatives:**
            1. Reduce investment amount by 50-75%
            2. Focus on retention systems first
            3. Improve conversion rates before scaling
            4. Consider different lead sources
            """)

    with col2:
        st.info(f"""
        **Quick Stats:**
        - Monthly investment: ${total_additional_cost:,.0f}
        - Break-even: {f'Month {payback}' if payback else 'Never'}
        - Final book size: {st.session_state.comparison['final_test_policies']:.0f}
        - Staff efficiency: {capacity_ratio:.0%}

        **Risk Factors:**
        {'✓' if capacity_ratio <= 1 else '✗'} Staff capacity adequate
        {'✓' if roi > 0 else '✗'} Positive ROI
        {'✓' if payback and payback <= 24 else '✗'} Reasonable payback
        {'✓' if policy_growth > 50 else '✗'} Meaningful growth
        """)

    # Alternative scenarios suggestion
    if recommendation_level != "strong":
        st.markdown("### 🔄 Alternative Scenarios to Try")

        alt_col1, alt_col2, alt_col3 = st.columns(3)

        with alt_col1:
            st.markdown("""
            **Conservative Growth**
            - Lead spend: +$500-1000
            - No additional staff initially
            - Add newsletter only
            - Lower risk, steady growth
            """)

        with alt_col2:
            st.markdown("""
            **Retention Focus**
            - Minimal lead increase
            - Add both retention systems
            - 0.5 FTE for service
            - Compound benefits over time
            """)

        with alt_col3:
            st.markdown("""
            **Efficiency First**
            - Optimize current leads
            - Add 1 FTE
            - Improve conversion rates
            - Then scale up leads
            """)

# Simulation history
if len(st.session_state.simulation_history) > 0:
    with st.expander("📜 Simulation History", expanded=False):
        history_df = pd.DataFrame([
            {
                'Time': h['timestamp'].strftime('%H:%M:%S'),
                'Lead Spend': f"+${h['scenario']['additional_lead_spend']:,.0f}",
                'Staff': f"+{h['scenario']['additional_staff']:.1f}",
                'Systems': ('C' if h['scenario']['has_concierge'] else '') +
                          ('N' if h['scenario']['has_newsletter'] else ''),
                'ROI': f"{h['results']['roi_percent']:.1f}%",
                'Payback': f"{h['results']['payback_month']}mo" if h['results']['payback_month'] else "None"
            }
            for h in st.session_state.simulation_history[-5:]  # Last 5 simulations
        ])
        st.dataframe(history_df, use_container_width=True, hide_index=True)

# Footer
st.markdown("---")
st.caption("Derek's Agency Growth Simulator | Built with real agency data in mind")
st.caption("💡 Tip: Start conservative and scale based on actual results")