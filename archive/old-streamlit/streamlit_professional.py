"""
Agency Growth Simulator - Professional Edition
Enterprise-grade insurance agency growth modeling tool
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from agency_simulator_enhanced import SimulationParameters, AgencySimulator
import numpy as np

# Configuration
st.set_page_config(
    page_title="Agency Growth Simulator",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Professional styling
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    .stDeployButton {display:none;}

    /* Professional metric styling */
    div[data-testid="metric-container"] {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 12px;
        margin: 8px 0;
    }

    /* Clean headers */
    h1, h2, h3 {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-weight: 500;
        color: #212529;
    }

    /* Professional tables */
    .dataframe {
        font-size: 14px;
    }

    /* Remove Streamlit branding */
    .css-1y4p8pa {
        display: none;
    }
</style>
""", unsafe_allow_html=True)

# Initialize parameters
if 'params' not in st.session_state:
    st.session_state.params = SimulationParameters(
        current_policies=500,
        current_staff_fte=2.0,
        baseline_lead_spend=1000,
        lead_cost_per_lead=30,
        contact_rate=0.70,
        quote_rate=0.60,
        bind_rate=0.45,
        avg_premium_annual=1500,
        commission_rate=0.12,
        annual_retention_base=0.85,
        staff_monthly_cost_per_fte=5000,
        max_leads_per_fte_per_month=150
    )

if 'scenario_results' not in st.session_state:
    st.session_state.scenario_results = {}

# Header
st.title("Agency Growth Simulator")
st.markdown("Strategic capacity planning and investment analysis for insurance agencies")
st.markdown("---")

# Main layout
main_col1, main_col2 = st.columns([3, 2])

with main_col1:
    st.subheader("Scenario Configuration")

    # Current State
    st.markdown("### Current State Baseline")

    col1, col2, col3 = st.columns(3)

    with col1:
        current_policies = st.number_input(
            "Policies in Force",
            min_value=100,
            max_value=5000,
            value=st.session_state.params.current_policies,
            step=50
        )

    with col2:
        current_staff = st.number_input(
            "Current FTE",
            min_value=0.5,
            max_value=20.0,
            value=st.session_state.params.current_staff_fte,
            step=0.5
        )

    with col3:
        current_lead_spend = st.number_input(
            "Monthly Lead Investment ($)",
            min_value=0,
            max_value=20000,
            value=int(st.session_state.params.baseline_lead_spend),
            step=500
        )

    # Growth Scenario
    st.markdown("### Growth Investment Parameters")

    col4, col5, col6 = st.columns(3)

    with col4:
        additional_lead_spend = st.number_input(
            "Additional Lead Spend ($/mo)",
            min_value=0,
            max_value=20000,
            value=2000,
            step=500
        )

    with col5:
        additional_staff = st.number_input(
            "Additional FTE",
            min_value=0.0,
            max_value=10.0,
            value=0.5,
            step=0.5
        )

    with col6:
        simulation_months = st.selectbox(
            "Projection Period",
            options=[12, 18, 24, 36],
            index=2,
            format_func=lambda x: f"{x} months"
        )

    # Retention Systems
    st.markdown("### Client Retention Systems")

    col7, col8 = st.columns(2)

    with col7:
        enable_concierge = st.checkbox("Implement Concierge Service", value=False)

    with col8:
        enable_newsletter = st.checkbox("Implement Newsletter Program", value=False)

    # Update parameters
    st.session_state.params.current_policies = current_policies
    st.session_state.params.current_staff_fte = current_staff
    st.session_state.params.baseline_lead_spend = float(current_lead_spend)

with main_col2:
    st.subheader("Investment Summary")

    # Calculate totals
    total_lead_spend = current_lead_spend + additional_lead_spend
    total_staff = current_staff + additional_staff
    system_costs = 0
    if enable_concierge:
        system_costs += st.session_state.params.concierge_monthly_cost
    if enable_newsletter:
        system_costs += st.session_state.params.newsletter_monthly_cost

    total_additional_investment = (
        additional_lead_spend +
        additional_staff * st.session_state.params.staff_monthly_cost_per_fte +
        system_costs
    )

    # Display metrics
    st.metric("Total Monthly Investment", f"${total_lead_spend + (total_staff * st.session_state.params.staff_monthly_cost_per_fte):,.0f}")
    st.metric("Incremental Monthly Cost", f"${total_additional_investment:,.0f}")
    st.metric("Annualized Incremental Cost", f"${total_additional_investment * 12:,.0f}")

    # Capacity Analysis
    st.markdown("### Capacity Analysis")

    leads_per_month = total_lead_spend / st.session_state.params.lead_cost_per_lead if st.session_state.params.lead_cost_per_lead > 0 else 0
    capacity_utilization = leads_per_month / (total_staff * st.session_state.params.max_leads_per_fte_per_month) if total_staff > 0 else 0

    if capacity_utilization <= 0.85:
        capacity_status = "Optimal"
        capacity_color = "normal"
    elif capacity_utilization <= 1.0:
        capacity_status = "Near Capacity"
        capacity_color = "normal"
    else:
        capacity_status = "Over Capacity"
        capacity_color = "inverse"

    st.metric(
        "Capacity Utilization",
        f"{capacity_utilization:.1%}",
        delta=capacity_status,
        delta_color=capacity_color
    )

# Run Analysis Button
st.markdown("---")

if st.button("Execute Simulation", type="primary", use_container_width=True):
    with st.spinner("Running simulation..."):
        # Initialize simulator
        sim = AgencySimulator(st.session_state.params)

        # Run scenarios
        baseline = sim.run_baseline(simulation_months)
        growth_scenario = sim.simulate_scenario(
            months=simulation_months,
            lead_spend_monthly=total_lead_spend,
            additional_staff_fte=additional_staff,
            has_concierge=enable_concierge,
            has_newsletter=enable_newsletter
        )

        # Calculate metrics
        comparison = sim.compare_scenarios(baseline, growth_scenario)

        # Store results
        st.session_state.scenario_results = {
            'baseline': baseline,
            'growth': growth_scenario,
            'comparison': comparison,
            'months': simulation_months
        }

# Results Section
if st.session_state.scenario_results:
    st.markdown("---")
    st.header("Analysis Results")

    # Key Performance Indicators
    st.subheader("Key Performance Indicators")

    kpi_col1, kpi_col2, kpi_col3, kpi_col4 = st.columns(4)

    comparison = st.session_state.scenario_results['comparison']

    with kpi_col1:
        payback = comparison['payback_month']
        st.metric(
            "Payback Period",
            f"{payback} months" if payback else "Beyond projection",
            delta="Favorable" if payback and payback <= 24 else "Review required"
        )

    with kpi_col2:
        roi = comparison['roi_percent']
        st.metric(
            "Return on Investment",
            f"{roi:.1f}%",
            delta="Positive" if roi > 0 else "Negative"
        )

    with kpi_col3:
        st.metric(
            "Policy Growth",
            f"{comparison['policy_growth']:.0f}",
            delta=f"{comparison['policy_growth_percent']:.1f}%"
        )

    with kpi_col4:
        st.metric(
            "Net Present Value",
            f"${comparison['total_incremental_profit']:,.0f}",
            delta=f"{simulation_months}-month total"
        )

    # Visualizations
    st.subheader("Projections")

    tab1, tab2, tab3, tab4 = st.tabs(["Policy Growth", "Financial Performance", "Efficiency Metrics", "Sensitivity Analysis"])

    with tab1:
        # Policy trajectory
        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=st.session_state.scenario_results['baseline']['month'],
            y=st.session_state.scenario_results['baseline']['policies_end'],
            mode='lines',
            name='Baseline',
            line=dict(color='#6c757d', dash='dash', width=2)
        ))

        fig.add_trace(go.Scatter(
            x=st.session_state.scenario_results['growth']['month'],
            y=st.session_state.scenario_results['growth']['policies_end'],
            mode='lines',
            name='Growth Scenario',
            line=dict(color='#0066cc', width=3)
        ))

        fig.update_layout(
            title="Policy Growth Projection",
            xaxis_title="Month",
            yaxis_title="Policies in Force",
            height=400,
            hovermode='x unified',
            legend=dict(x=0.02, y=0.98),
            plot_bgcolor='white',
            xaxis=dict(gridcolor='#e9ecef'),
            yaxis=dict(gridcolor='#e9ecef')
        )

        st.plotly_chart(fig, use_container_width=True)

    with tab2:
        # Financial metrics
        fig = make_subplots(
            rows=2, cols=1,
            subplot_titles=("Monthly Net Profit", "Cumulative Cash Flow"),
            vertical_spacing=0.15
        )

        # Monthly profit
        fig.add_trace(
            go.Scatter(
                x=st.session_state.scenario_results['baseline']['month'],
                y=st.session_state.scenario_results['baseline']['net_profit'],
                mode='lines',
                name='Baseline',
                line=dict(color='#6c757d', dash='dash')
            ),
            row=1, col=1
        )

        fig.add_trace(
            go.Scatter(
                x=st.session_state.scenario_results['growth']['month'],
                y=st.session_state.scenario_results['growth']['net_profit'],
                mode='lines',
                name='Growth Scenario',
                line=dict(color='#28a745', width=2)
            ),
            row=1, col=1
        )

        # Cumulative incremental
        incremental_profit = comparison['incremental_cumulative_profit']
        fig.add_trace(
            go.Scatter(
                x=list(range(1, len(incremental_profit) + 1)),
                y=incremental_profit,
                mode='lines',
                fill='tozeroy',
                name='Incremental Value',
                line=dict(color='#17a2b8', width=2)
            ),
            row=2, col=1
        )

        fig.update_layout(
            height=600,
            showlegend=True,
            hovermode='x unified',
            plot_bgcolor='white'
        )

        fig.update_xaxes(gridcolor='#e9ecef')
        fig.update_yaxes(gridcolor='#e9ecef')

        st.plotly_chart(fig, use_container_width=True)

    with tab3:
        # Efficiency metrics
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Conversion Rate Trend",
                "Cost per Acquisition",
                "Revenue per Policy",
                "Operating Margin"
            ),
            specs=[[{"type": "scatter"}, {"type": "scatter"}],
                   [{"type": "scatter"}, {"type": "scatter"}]]
        )

        growth_data = st.session_state.scenario_results['growth']

        # Conversion rate
        fig.add_trace(
            go.Scatter(
                x=growth_data['month'],
                y=growth_data['effective_bind_rate'] * 100,
                mode='lines',
                name='Conversion %',
                line=dict(color='#ff7f0e')
            ),
            row=1, col=1
        )

        # Cost per acquisition
        cpa = growth_data['total_costs'] / growth_data['new_policies']
        cpa = cpa.replace([np.inf, -np.inf], 0)

        fig.add_trace(
            go.Scatter(
                x=growth_data['month'],
                y=cpa,
                mode='lines',
                name='CPA',
                line=dict(color='#d62728')
            ),
            row=1, col=2
        )

        # Revenue per policy
        revenue_per_policy = growth_data['commission_revenue'] / growth_data['policies_end']

        fig.add_trace(
            go.Scatter(
                x=growth_data['month'],
                y=revenue_per_policy,
                mode='lines',
                name='Rev/Policy',
                line=dict(color='#2ca02c')
            ),
            row=2, col=1
        )

        # Operating margin
        margin = (growth_data['commission_revenue'] - growth_data['total_costs']) / growth_data['commission_revenue'] * 100

        fig.add_trace(
            go.Scatter(
                x=growth_data['month'],
                y=margin,
                mode='lines',
                name='Margin %',
                line=dict(color='#9467bd')
            ),
            row=2, col=2
        )

        fig.update_layout(
            height=600,
            showlegend=False,
            plot_bgcolor='white'
        )

        fig.update_xaxes(gridcolor='#e9ecef')
        fig.update_yaxes(gridcolor='#e9ecef')

        st.plotly_chart(fig, use_container_width=True)

    with tab4:
        # Sensitivity analysis
        st.markdown("#### Scenario Sensitivity Analysis")

        # Initialize simulator for sensitivity analysis
        sim = AgencySimulator(st.session_state.params)

        # Get baseline from stored results
        baseline = st.session_state.scenario_results['baseline']

        # Create sensitivity table
        sensitivity_data = []

        for lead_mult in [0.5, 0.75, 1.0, 1.25, 1.5]:
            test_lead_spend = total_lead_spend * lead_mult
            test_scenario = sim.simulate_scenario(
                months=simulation_months,
                lead_spend_monthly=test_lead_spend,
                additional_staff_fte=additional_staff,
                has_concierge=enable_concierge,
                has_newsletter=enable_newsletter
            )
            test_comparison = sim.compare_scenarios(baseline, test_scenario)

            sensitivity_data.append({
                'Lead Spend': f"${test_lead_spend:,.0f}",
                'Investment Multiple': f"{lead_mult:.1f}x",
                'ROI (%)': f"{test_comparison['roi_percent']:.1f}%",
                'Payback (mo)': test_comparison['payback_month'] if test_comparison['payback_month'] else "N/A",
                'Policy Growth': f"{test_comparison['policy_growth']:.0f}",
                'NPV': f"${test_comparison['total_incremental_profit']:,.0f}"
            })

        sensitivity_df = pd.DataFrame(sensitivity_data)
        st.dataframe(sensitivity_df, use_container_width=True, hide_index=True)

    # Executive Summary
    st.markdown("---")
    st.subheader("Executive Summary")

    # Determine recommendation
    if comparison['payback_month'] and comparison['payback_month'] <= 18 and comparison['roi_percent'] > 50:
        recommendation = "PROCEED WITH IMPLEMENTATION"
        rec_color = "#28a745"
    elif comparison['payback_month'] and comparison['payback_month'] <= 24 and comparison['roi_percent'] > 25:
        recommendation = "CONDITIONAL APPROVAL"
        rec_color = "#ffc107"
    else:
        recommendation = "FURTHER REVIEW REQUIRED"
        rec_color = "#dc3545"

    col_rec1, col_rec2 = st.columns([2, 1])

    with col_rec1:
        st.markdown(f"### Recommendation: <span style='color: {rec_color}'>{recommendation}</span>", unsafe_allow_html=True)

        st.markdown("""
        **Analysis Summary:**
        """)

        if comparison['payback_month']:
            st.write(f"- Investment recovery period: {comparison['payback_month']} months")
        else:
            st.write("- Investment recovery period exceeds projection window")

        st.write(f"- Expected return on investment: {comparison['roi_percent']:.1f}%")
        st.write(f"- Projected policy base expansion: {comparison['policy_growth']:.0f} policies ({comparison['policy_growth_percent']:.1f}%)")
        st.write(f"- Net present value: ${comparison['total_incremental_profit']:,.0f}")

        if capacity_utilization > 1.0:
            st.write("- **Warning:** Capacity constraints require attention")

    with col_rec2:
        st.markdown("**Implementation Timeline:**")

        st.markdown("""
        **Month 1-3:**
        - Initiate lead generation expansion
        - Begin recruitment process

        **Month 4-6:**
        - Onboard additional staff
        - Implement retention systems

        **Month 7-12:**
        - Monitor KPIs
        - Adjust strategy as needed
        """)

    # Export functionality
    st.markdown("---")

    if st.button("Generate Executive Report", type="secondary"):
        report = f"""
AGENCY GROWTH ANALYSIS REPORT
====================================

SCENARIO PARAMETERS
------------------
Current Policies: {current_policies:,}
Current Staff: {current_staff:.1f} FTE
Baseline Lead Spend: ${current_lead_spend:,}/month

GROWTH INVESTMENT
----------------
Additional Lead Spend: ${additional_lead_spend:,}/month
Additional Staff: {additional_staff:.1f} FTE
Retention Systems: {'Concierge' if enable_concierge else ''} {'Newsletter' if enable_newsletter else ''}
Total Incremental Investment: ${total_additional_investment:,}/month

KEY PERFORMANCE INDICATORS
-------------------------
Payback Period: {comparison['payback_month'] if comparison['payback_month'] else 'Beyond projection'} months
Return on Investment: {comparison['roi_percent']:.1f}%
Policy Growth: {comparison['policy_growth']:.0f} ({comparison['policy_growth_percent']:.1f}%)
Net Present Value: ${comparison['total_incremental_profit']:,.0f}

RECOMMENDATION: {recommendation}
        """

        st.download_button(
            label="Download Report",
            data=report,
            file_name=f"agency_growth_analysis_{pd.Timestamp.now().strftime('%Y%m%d')}.txt",
            mime="text/plain"
        )

# Professional footer
st.markdown("---")
st.caption("Agency Growth Simulator | Version 2.0 | Proprietary and Confidential")