"""
Derek's Agency Growth Simulator - Interactive UI
Streamlit-based interface for exploring growth scenarios
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import json
from agency_simulator import SimulationParameters, AgencySimulator


# Page config
st.set_page_config(
    page_title="Derek's Agency Growth Simulator",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Title and description
st.title("🏢 Derek's Agency Growth Simulator")
st.markdown("**Explore growth scenarios by adjusting lead spend, staffing, and client systems**")

# Initialize session state
if 'params' not in st.session_state:
    st.session_state.params = SimulationParameters()

# Sidebar for parameters
with st.sidebar:
    st.header("📋 Simulation Parameters")

    # Create tabs for different parameter groups
    param_tab1, param_tab2, param_tab3 = st.tabs(["Current State", "Funnel & Finance", "Systems"])

    with param_tab1:
        st.subheader("Current Agency State")

        current_policies = st.number_input(
            "Current Policies in Force",
            min_value=100,
            max_value=5000,
            value=st.session_state.params.current_policies,
            step=50,
            help="Number of active policies today"
        )

        current_staff_fte = st.number_input(
            "Current Staff (FTE)",
            min_value=0.5,
            max_value=10.0,
            value=st.session_state.params.current_staff_fte,
            step=0.5,
            help="Full-time equivalent staff members"
        )

        baseline_lead_spend = st.number_input(
            "Current Monthly Lead Spend ($)",
            min_value=0,
            max_value=10000,
            value=int(st.session_state.params.baseline_lead_spend),
            step=100,
            help="Current monthly spend on leads"
        )

    with param_tab2:
        st.subheader("Funnel & Financial")

        col1, col2 = st.columns(2)

        with col1:
            lead_cost = st.number_input(
                "Cost per Lead ($)",
                min_value=5,
                max_value=200,
                value=int(st.session_state.params.lead_cost_per_lead),
                help="Average cost to acquire one lead"
            )

            contact_rate = st.slider(
                "Contact Rate (%)",
                min_value=20,
                max_value=100,
                value=int(st.session_state.params.contact_rate * 100),
                help="% of leads successfully contacted"
            )

            quote_rate = st.slider(
                "Quote Rate (%)",
                min_value=20,
                max_value=100,
                value=int(st.session_state.params.quote_rate * 100),
                help="% of contacted that receive quote"
            )

            bind_rate = st.slider(
                "Bind Rate (%)",
                min_value=10,
                max_value=80,
                value=int(st.session_state.params.bind_rate * 100),
                help="% of quoted that become policies"
            )

        with col2:
            avg_premium = st.number_input(
                "Avg Annual Premium ($)",
                min_value=500,
                max_value=5000,
                value=int(st.session_state.params.avg_premium_annual),
                step=100,
                help="Average annual premium per policy"
            )

            commission_rate = st.slider(
                "Commission Rate (%)",
                min_value=5,
                max_value=25,
                value=int(st.session_state.params.commission_rate * 100),
                help="Commission % on premiums"
            )

            retention_rate = st.slider(
                "Annual Retention (%)",
                min_value=60,
                max_value=95,
                value=int(st.session_state.params.annual_retention_base * 100),
                help="% of policies retained annually"
            )

            staff_cost = st.number_input(
                "Monthly Cost per FTE ($)",
                min_value=2000,
                max_value=15000,
                value=int(st.session_state.params.staff_monthly_cost_per_fte),
                step=500,
                help="Monthly cost per staff member"
            )

    with param_tab3:
        st.subheader("Capacity & Systems")

        max_leads_per_fte = st.number_input(
            "Max Leads per FTE/Month",
            min_value=50,
            max_value=500,
            value=int(st.session_state.params.max_leads_per_fte_per_month),
            step=25,
            help="Optimal leads per staff member"
        )

        st.markdown("**Client System Impacts**")

        concierge_boost = st.slider(
            "Concierge Retention Boost (%)",
            min_value=0,
            max_value=10,
            value=int(st.session_state.params.concierge_retention_boost * 100),
            help="Retention improvement from concierge"
        )

        newsletter_boost = st.slider(
            "Newsletter Retention Boost (%)",
            min_value=0,
            max_value=10,
            value=int(st.session_state.params.newsletter_retention_boost * 100),
            help="Retention improvement from newsletter"
        )

        concierge_cost = st.number_input(
            "Concierge Monthly Cost ($)",
            min_value=0,
            max_value=2000,
            value=int(st.session_state.params.concierge_monthly_cost),
            step=100
        )

        newsletter_cost = st.number_input(
            "Newsletter Monthly Cost ($)",
            min_value=0,
            max_value=1000,
            value=int(st.session_state.params.newsletter_monthly_cost),
            step=50
        )

    # Update parameters button
    if st.button("Update Parameters", type="primary", use_container_width=True):
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
        st.success("Parameters updated!")
        st.rerun()

# Main content area
col1, col2 = st.columns([3, 2])

with col1:
    st.header("🎯 Scenario Builder")

    # Scenario inputs
    scenario_col1, scenario_col2, scenario_col3 = st.columns(3)

    with scenario_col1:
        months_to_simulate = st.selectbox(
            "Time Horizon",
            options=[12, 24, 36],
            index=1,
            format_func=lambda x: f"{x} months"
        )

    with scenario_col2:
        additional_lead_spend = st.slider(
            "Additional Lead Spend ($/month)",
            min_value=0,
            max_value=10000,
            value=2000,
            step=250,
            help="Extra monthly spend on leads"
        )

    with scenario_col3:
        additional_staff = st.slider(
            "Additional Staff (FTE)",
            min_value=0.0,
            max_value=5.0,
            value=0.5,
            step=0.5,
            help="Additional staff to hire"
        )

    # Client systems toggles
    st.markdown("**Client Systems**")
    system_col1, system_col2 = st.columns(2)

    with system_col1:
        has_concierge = st.checkbox(
            "Enable Concierge System",
            value=False,
            help="Birthday cards, renewal calls, etc."
        )

    with system_col2:
        has_newsletter = st.checkbox(
            "Enable Newsletter System",
            value=False,
            help="Quarterly client newsletter"
        )

with col2:
    st.header("📊 Quick Metrics")

    # Calculate current scenario costs
    total_lead_spend = st.session_state.params.baseline_lead_spend + additional_lead_spend
    total_staff_fte = st.session_state.params.current_staff_fte + additional_staff
    system_costs = 0
    if has_concierge:
        system_costs += st.session_state.params.concierge_monthly_cost
    if has_newsletter:
        system_costs += st.session_state.params.newsletter_monthly_cost

    # Display quick metrics
    metric_col1, metric_col2 = st.columns(2)

    with metric_col1:
        st.metric(
            "Total Lead Spend",
            f"${total_lead_spend:,.0f}/mo",
            f"+${additional_lead_spend:,.0f}"
        )
        st.metric(
            "Total Staff",
            f"{total_staff_fte:.1f} FTE",
            f"+{additional_staff:.1f}"
        )

    with metric_col2:
        monthly_leads = total_lead_spend / st.session_state.params.lead_cost_per_lead
        st.metric(
            "Expected Leads",
            f"{monthly_leads:.0f}/mo",
            f"+{additional_lead_spend / st.session_state.params.lead_cost_per_lead:.0f}"
        )
        st.metric(
            "System Costs",
            f"${system_costs:,.0f}/mo",
            None if system_costs == 0 else "Active"
        )

# Run simulation button
if st.button("🚀 Run Simulation", type="primary", use_container_width=True):
    with st.spinner("Running simulation..."):
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

        # Store results in session state
        st.session_state.baseline_results = baseline_results
        st.session_state.test_results = test_results
        st.session_state.comparison = comparison

# Display results if simulation has been run
if 'comparison' in st.session_state:
    st.header("📈 Simulation Results")

    # Key metrics cards
    metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)

    with metric_col1:
        payback = st.session_state.comparison['payback_month']
        payback_text = f"{payback} months" if payback else "No payback"
        payback_color = "green" if payback and payback <= 24 else "red"
        st.metric(
            "Payback Period",
            payback_text,
            delta="Good" if payback and payback <= 24 else "Review",
            delta_color="normal" if payback and payback <= 24 else "inverse"
        )

    with metric_col2:
        roi = st.session_state.comparison['roi_percent']
        st.metric(
            "ROI",
            f"{roi:.1f}%",
            delta="Positive" if roi > 0 else "Negative",
            delta_color="normal" if roi > 0 else "inverse"
        )

    with metric_col3:
        policy_growth = st.session_state.comparison['policy_growth']
        st.metric(
            "Policy Growth",
            f"+{policy_growth:.0f}",
            f"{st.session_state.comparison['policy_growth_percent']:.1f}%"
        )

    with metric_col4:
        total_profit = st.session_state.comparison['total_incremental_profit']
        st.metric(
            "Incremental Profit",
            f"${total_profit:,.0f}",
            f"Over {months_to_simulate} months"
        )

    # Tabs for different charts
    chart_tab1, chart_tab2, chart_tab3, chart_tab4 = st.tabs([
        "Policies Over Time",
        "Monthly Profit",
        "Cumulative Profit",
        "Efficiency Metrics"
    ])

    with chart_tab1:
        # Policies in force chart
        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=st.session_state.baseline_results['month'],
            y=st.session_state.baseline_results['policies_end'],
            mode='lines',
            name='Baseline',
            line=dict(color='gray', dash='dash')
        ))

        fig.add_trace(go.Scatter(
            x=st.session_state.test_results['month'],
            y=st.session_state.test_results['policies_end'],
            mode='lines',
            name='Test Scenario',
            line=dict(color='blue', width=2)
        ))

        fig.update_layout(
            title="Policies in Force Over Time",
            xaxis_title="Month",
            yaxis_title="Number of Policies",
            height=400,
            hovermode='x unified'
        )

        st.plotly_chart(fig, use_container_width=True)

    with chart_tab2:
        # Monthly profit chart
        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=st.session_state.baseline_results['month'],
            y=st.session_state.baseline_results['net_profit'],
            mode='lines',
            name='Baseline',
            line=dict(color='gray', dash='dash')
        ))

        fig.add_trace(go.Scatter(
            x=st.session_state.test_results['month'],
            y=st.session_state.test_results['net_profit'],
            mode='lines',
            name='Test Scenario',
            line=dict(color='green', width=2)
        ))

        fig.add_hline(y=0, line_dash="dot", line_color="red", opacity=0.5)

        fig.update_layout(
            title="Monthly Net Profit",
            xaxis_title="Month",
            yaxis_title="Net Profit ($)",
            height=400,
            hovermode='x unified'
        )

        st.plotly_chart(fig, use_container_width=True)

    with chart_tab3:
        # Cumulative incremental profit
        incremental_cumulative = st.session_state.comparison['incremental_cumulative_profit']

        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=list(range(1, len(incremental_cumulative) + 1)),
            y=incremental_cumulative,
            mode='lines',
            fill='tozeroy',
            name='Incremental Profit',
            line=dict(color='purple', width=2)
        ))

        # Add payback point if exists
        if st.session_state.comparison['payback_month']:
            payback_month = st.session_state.comparison['payback_month']
            fig.add_vline(
                x=payback_month,
                line_dash="dash",
                line_color="green",
                annotation_text=f"Payback: Month {payback_month}"
            )

        fig.add_hline(y=0, line_dash="dot", line_color="red", opacity=0.5)

        fig.update_layout(
            title="Cumulative Incremental Profit vs Baseline",
            xaxis_title="Month",
            yaxis_title="Cumulative Incremental Profit ($)",
            height=400
        )

        st.plotly_chart(fig, use_container_width=True)

    with chart_tab4:
        # Efficiency metrics
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=(
                "Effective Bind Rate",
                "New Policies per Month",
                "Revenue per Policy",
                "Cost Structure"
            )
        )

        # Effective bind rate
        fig.add_trace(
            go.Scatter(
                x=st.session_state.test_results['month'],
                y=st.session_state.test_results['effective_bind_rate'] * 100,
                mode='lines',
                name='Bind Rate %',
                line=dict(color='orange')
            ),
            row=1, col=1
        )

        # New policies
        fig.add_trace(
            go.Bar(
                x=st.session_state.test_results['month'],
                y=st.session_state.test_results['new_policies'],
                name='New Policies',
                marker_color='teal'
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
                line=dict(color='green')
            ),
            row=2, col=1
        )

        # Cost breakdown (last month)
        last_month = st.session_state.test_results.iloc[-1]
        fig.add_trace(
            go.Pie(
                labels=['Lead Costs', 'Staff Costs', 'System Costs'],
                values=[last_month['lead_costs'], last_month['staff_costs'], last_month['system_costs']],
                hole=0.4
            ),
            row=2, col=2
        )

        fig.update_layout(height=600, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    # Detailed results expander
    with st.expander("📋 View Detailed Monthly Data"):
        # Create comparison dataframe
        comparison_df = pd.DataFrame({
            'Month': st.session_state.test_results['month'],
            'Policies (Baseline)': st.session_state.baseline_results['policies_end'].round(0),
            'Policies (Test)': st.session_state.test_results['policies_end'].round(0),
            'Profit (Baseline)': st.session_state.baseline_results['net_profit'].round(0),
            'Profit (Test)': st.session_state.test_results['net_profit'].round(0),
            'Incremental Profit': (st.session_state.test_results['net_profit'] -
                                 st.session_state.baseline_results['net_profit']).round(0),
            'Cumulative Incremental': st.session_state.comparison['incremental_cumulative_profit']
        })

        # Format currency columns
        currency_cols = ['Profit (Baseline)', 'Profit (Test)', 'Incremental Profit', 'Cumulative Incremental']
        for col in currency_cols:
            comparison_df[col] = comparison_df[col].apply(lambda x: f"${x:,.0f}")

        st.dataframe(comparison_df, use_container_width=True, hide_index=True)

    # Recommendations section
    st.header("💡 Recommendations")

    col1, col2 = st.columns([2, 1])

    with col1:
        if st.session_state.comparison['payback_month'] and st.session_state.comparison['payback_month'] <= 24:
            recommendation = "✅ **Recommended Investment**"
            explanation = f"""
            This scenario shows positive returns with payback in {st.session_state.comparison['payback_month']} months.
            Consider implementing this growth strategy with the following parameters:
            - Additional lead spend: ${additional_lead_spend:,.0f}/month
            - Additional staff: {additional_staff} FTE
            - Client systems: {'Concierge' if has_concierge else ''} {'Newsletter' if has_newsletter else ''}
            """
        elif st.session_state.comparison['roi_percent'] > 0:
            recommendation = "⚠️ **Consider with Caution**"
            explanation = f"""
            This scenario shows positive ROI ({st.session_state.comparison['roi_percent']:.1f}%) but longer payback period.
            You might want to:
            - Reduce initial investment to accelerate payback
            - Focus on higher-converting lead sources
            - Improve retention through client systems first
            """
        else:
            recommendation = "❌ **Not Recommended**"
            explanation = f"""
            This scenario does not show positive returns within the simulation period.
            Consider:
            - Reducing costs (lower lead spend or fewer staff)
            - Improving conversion rates before scaling
            - Testing smaller incremental changes first
            """

        st.markdown(recommendation)
        st.markdown(explanation)

    with col2:
        st.markdown("**Key Success Factors:**")
        st.markdown("""
        - 🎯 Maintain bind rate above 15%
        - 👥 Keep leads per FTE under capacity
        - 📊 Monitor monthly metrics closely
        - 🔄 Adjust quickly if needed
        """)

# Footer
st.markdown("---")
st.markdown("*Built for Derek's Allstate Agency | Adjust parameters in the sidebar to match your actual data*")