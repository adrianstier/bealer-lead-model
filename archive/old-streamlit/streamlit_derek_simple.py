"""
Derek's Agency Growth Calculator - Simple Version
Built for agency owners who want answers, not math
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from agency_simulator_enhanced import SimulationParameters, AgencySimulator

# Page setup - clean and simple
st.set_page_config(
    page_title="Derek's Growth Calculator",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="collapsed"  # Start clean
)

# Hide technical stuff
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    .stDeployButton {display:none;}
    div[data-testid="metric-container"] {
        background-color: #f8f9fa;
        border: 2px solid #28a745;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .big-font {
        font-size: 24px !important;
        font-weight: bold;
        color: #2c3e50;
    }
</style>
""", unsafe_allow_html=True)

# Initialize with Derek's likely numbers
if 'quick_setup_done' not in st.session_state:
    st.session_state.quick_setup_done = False

if 'params' not in st.session_state:
    # Start with typical agency numbers
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
        staff_monthly_cost_per_fte=4000,
        max_leads_per_fte_per_month=150
    )

# Simple header
st.markdown("# 🚀 Let's Grow Your Agency, Derek!")
st.markdown("### Answer 3 quick questions, see your growth potential instantly")

# Quick setup if not done
if not st.session_state.quick_setup_done:
    st.markdown("---")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("#### 📋 How many policies do you have?")
        policy_options = {
            250: "About 250 policies",
            500: "About 500 policies",
            750: "About 750 policies",
            1000: "About 1,000 policies",
            1500: "About 1,500 policies"
        }
        policies = st.radio(
            "Roughly speaking:",
            options=list(policy_options.keys()),
            format_func=lambda x: policy_options[x],
            index=1
        )

    with col2:
        st.markdown("#### 👥 How's your team?")
        team_options = {
            1: "1 person",
            2: "2 people",
            3: "3 people",
            4: "4 people",
            5: "5 people"
        }
        team_size = st.radio(
            "Including you:",
            options=list(team_options.keys()),
            format_func=lambda x: team_options[x],
            index=1
        )

    with col3:
        st.markdown("#### 💰 Monthly lead budget?")
        spend_options = {
            0: "Nothing yet",
            500: "$500/month",
            1000: "$1,000/month",
            2000: "$2,000/month",
            3000: "$3,000/month"
        }
        current_spend = st.radio(
            "What you spend now:",
            options=list(spend_options.keys()),
            format_func=lambda x: spend_options[x],
            index=2
        )

    if st.button("🎯 Show Me My Growth Potential", type="primary", use_container_width=True):
        st.session_state.params.current_policies = policies
        st.session_state.params.current_staff_fte = float(team_size)
        st.session_state.params.baseline_lead_spend = float(current_spend)
        st.session_state.quick_setup_done = True
        st.rerun()

else:
    # Main interface - super simple
    st.markdown("---")

    # Current situation summary
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Your Policies", f"{st.session_state.params.current_policies:,}")
    with col2:
        st.metric("Your Team", f"{st.session_state.params.current_staff_fte:.0f} people")
    with col3:
        monthly_revenue = st.session_state.params.current_policies * (st.session_state.params.avg_premium_annual / 12) * st.session_state.params.commission_rate
        st.metric("Monthly Revenue", f"${monthly_revenue:,.0f}")
    with col4:
        if st.button("📝 Change My Numbers"):
            st.session_state.quick_setup_done = False
            st.rerun()

    st.markdown("---")

    # Growth scenarios - pre-built, no thinking required
    st.markdown("## 🎯 Pick Your Growth Style")
    st.markdown("*Just click one - we'll handle the math*")

    tab1, tab2, tab3, tab4 = st.tabs([
        "🐢 Steady Growth",
        "🏃 Moderate Push",
        "🚀 Aggressive Growth",
        "🎨 Custom Plan"
    ])

    # Pre-calculated scenarios based on their size
    base_policies = st.session_state.params.current_policies

    scenarios = {
        "steady": {
            "name": "Steady Growth",
            "description": "Low risk, proven to work",
            "lead_add": 500,
            "staff_add": 0,
            "systems": True,
            "target": f"+{int(base_policies * 0.15)} policies in 2 years"
        },
        "moderate": {
            "name": "Moderate Push",
            "description": "Balanced growth and profit",
            "lead_add": 1500,
            "staff_add": 0.5,
            "systems": True,
            "target": f"+{int(base_policies * 0.35)} policies in 2 years"
        },
        "aggressive": {
            "name": "Aggressive Growth",
            "description": "Maximum growth, higher investment",
            "lead_add": 3000,
            "staff_add": 1.0,
            "systems": True,
            "target": f"+{int(base_policies * 0.60)} policies in 2 years"
        }
    }

    def show_scenario(scenario_key):
        scenario = scenarios[scenario_key]

        # Quick summary cards
        col1, col2, col3 = st.columns(3)

        with col1:
            st.info(f"""
            **What You'll Do:**
            - Spend ${scenario['lead_add']:,} more on leads
            - {'Add half a person' if scenario['staff_add'] == 0.5 else f"Add {scenario['staff_add']:.0f} staff" if scenario['staff_add'] > 0 else 'Keep current staff'}
            - Add simple client touches
            """)

        with col2:
            # Run simulation
            sim = AgencySimulator(st.session_state.params)
            results = sim.simulate_scenario(
                months=24,
                lead_spend_monthly=st.session_state.params.baseline_lead_spend + scenario['lead_add'],
                additional_staff_fte=scenario['staff_add'],
                has_concierge=scenario['systems'],
                has_newsletter=scenario['systems']
            )
            baseline = sim.run_baseline(24)
            comparison = sim.compare_scenarios(baseline, results)

            # Key results
            payback = comparison['payback_month']
            roi = comparison['roi_percent']
            profit_gain = comparison['total_incremental_profit']

            if payback and payback <= 18:
                emoji = "✅"
                status = "RECOMMENDED"
                color = "success"
            elif payback and payback <= 24:
                emoji = "👍"
                status = "GOOD OPTION"
                color = "info"
            else:
                emoji = "⚠️"
                status = "RISKY"
                color = "warning"

            st.success(f"""
            **What You'll Get:**
            - {scenario['target']}
            - Money back in {payback if payback else '24+'} months
            - {roi:.0f}% return on investment
            """)

        with col3:
            investment = scenario['lead_add'] + (scenario['staff_add'] * st.session_state.params.staff_monthly_cost_per_fte)

            st.warning(f"""
            **Monthly Investment:**
            - ${investment:,.0f}/month
            - ${investment * 12:,.0f}/year

            **{emoji} {status}**
            """)

        # Simple chart
        fig = go.Figure()

        # Just show the growth curve
        fig.add_trace(go.Scatter(
            x=list(range(1, 25)),
            y=baseline['policies_end'].tolist(),
            mode='lines',
            name='If You Do Nothing',
            line=dict(color='gray', dash='dash', width=2)
        ))

        fig.add_trace(go.Scatter(
            x=list(range(1, 25)),
            y=results['policies_end'].tolist(),
            mode='lines',
            name=f'{scenario["name"]} Plan',
            line=dict(color='green', width=3),
            fill='tonexty',
            fillcolor='rgba(0, 255, 0, 0.1)'
        ))

        fig.update_layout(
            title=f"Your Agency in 2 Years: {int(results['policies_end'].iloc[-1]):,} Policies",
            xaxis_title="Months from Now",
            yaxis_title="Total Policies",
            height=350,
            showlegend=True,
            hovermode='x unified'
        )

        st.plotly_chart(fig, use_container_width=True)

        # Action button
        if st.button(f"📋 I Like This {scenario['name']} Plan - What's Next?", type="primary", use_container_width=True):
            st.balloons()

            st.success("""
            ### 🎯 Your Next Steps:

            **Week 1:**
            1. Call your lead vendor - increase budget by ${:,}/month
            2. {}
            3. Set up a simple monthly newsletter (use a template)

            **Week 2:**
            4. Track new leads coming in
            5. Watch your team's workload
            6. Celebrate early wins!

            **Month 1 Goal:** {} new policies

            📞 **Need help?** Call your Allstate rep and show them these numbers!
            """.format(
                scenario['lead_add'],
                "Post a job for part-time help" if scenario['staff_add'] > 0 else "Prep your team for more leads",
                int(scenario['lead_add'] / st.session_state.params.lead_cost_per_lead * 0.21)
            ))

    with tab1:
        show_scenario("steady")

    with tab2:
        show_scenario("moderate")

    with tab3:
        show_scenario("aggressive")

    with tab4:
        st.markdown("### 🎨 Build Your Own Plan")

        col1, col2 = st.columns([2, 1])

        with col1:
            # Super simple sliders
            extra_leads = st.slider(
                "💰 Extra monthly lead budget:",
                min_value=0,
                max_value=5000,
                value=1000,
                step=250
            )
            st.caption(f"Investment: ${extra_leads:,}/month")

            extra_staff = st.select_slider(
                "👥 Add team members:",
                options=[0, 0.5, 1, 1.5, 2],
                value=0
            )
            staff_text = "No one" if extra_staff == 0 else f"{extra_staff} {'person' if extra_staff == 1 else 'people'}"
            st.caption(f"Adding: {staff_text}")

            do_systems = st.checkbox("📧 Add client newsletters & birthday cards", value=True)

            # Instant feedback
            if extra_leads > 0:
                new_leads = extra_leads / st.session_state.params.lead_cost_per_lead
                capacity_ok = new_leads <= (st.session_state.params.current_staff_fte + extra_staff) * 150

                if not capacity_ok and extra_staff == 0:
                    st.error("⚠️ You'll need more help with that many leads!")
                elif capacity_ok:
                    st.success("✅ Your team can handle this!")

        with col2:
            if st.button("🔮 Show Me Results", type="primary", use_container_width=True):
                # Run custom simulation
                sim = AgencySimulator(st.session_state.params)
                results = sim.simulate_scenario(
                    months=24,
                    lead_spend_monthly=st.session_state.params.baseline_lead_spend + extra_leads,
                    additional_staff_fte=extra_staff,
                    has_concierge=do_systems,
                    has_newsletter=do_systems
                )
                baseline = sim.run_baseline(24)
                comparison = sim.compare_scenarios(baseline, results)

                # Show results in Derek-friendly terms
                st.markdown("---")
                st.markdown("### Your Custom Plan Results:")

                col_a, col_b, col_c = st.columns(3)

                with col_a:
                    payback = comparison['payback_month']
                    if payback and payback <= 24:
                        st.success(f"✅ Pays back in {payback} months")
                    else:
                        st.warning("⚠️ Takes 2+ years to pay back")

                with col_b:
                    st.metric(
                        "New Policies (2 years)",
                        f"+{comparison['policy_growth']:.0f}",
                        f"{comparison['policy_growth_percent']:.0f}% growth"
                    )

                with col_c:
                    roi = comparison['roi_percent']
                    if roi > 0:
                        st.metric("Your Return", f"{roi:.0f}%", "Profitable!")
                    else:
                        st.metric("Your Return", f"{roi:.0f}%", "Not profitable yet")

# Sidebar - only if they want details
with st.sidebar:
    st.markdown("### 🔧 Fine-Tune Settings")
    st.markdown("*Only change these if your numbers are different*")

    with st.expander("My conversion rates"):
        contact = st.slider("% of leads I reach", 50, 90, 70, 5)
        quote = st.slider("% I quote", 40, 80, 60, 5)
        bind = st.slider("% that buy", 30, 70, 45, 5)

        if st.button("Update Rates"):
            st.session_state.params.contact_rate = contact/100
            st.session_state.params.quote_rate = quote/100
            st.session_state.params.bind_rate = bind/100
            st.rerun()

    with st.expander("My financials"):
        premium = st.number_input("Average annual premium", 1000, 3000, 1500, 100)
        commission = st.slider("My commission %", 8, 20, 12, 1)

        if st.button("Update Financials"):
            st.session_state.params.avg_premium_annual = premium
            st.session_state.params.commission_rate = commission/100
            st.rerun()

    st.markdown("---")
    st.caption("Questions? Text me: 555-GROWTH")
    st.caption("Or email: support@growmyagency.com")