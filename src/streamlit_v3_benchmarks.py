"""
Streamlit App v3.0 - Enhanced with Industry Benchmarks
Comprehensive agency growth modeling with benchmark comparisons
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from agency_simulator_v3 import (
    EnhancedSimulationParameters,
    EnhancedAgencySimulator,
    MarketingMix,
    StaffingModel,
    BundlingDynamics,
    CommissionStructure,
    TechnologyInvestment,
    AgencyType,
    GrowthStage
)

# Page config
st.set_page_config(
    page_title="Agency Growth Modeling v3.0",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
    }
    .excellent { background-color: #d1fae5; border-color: #10b981; }
    .good { background-color: #dbeafe; border-color: #3b82f6; }
    .warning { background-color: #fef3c7; border-color: #f59e0b; }
    .critical { background-color: #fee2e2; border-color: #ef4444; }
</style>
""", unsafe_allow_html=True)

# Title
st.title("🚀 Agency Growth Modeling Platform v3.0")
st.markdown("### Industry Benchmarks & Comprehensive Analytics")

# Sidebar - Configuration
st.sidebar.header("📋 Configuration")

# Growth Stage
growth_stage = st.sidebar.selectbox(
    "Growth Stage",
    options=["growth", "mature"],
    format_func=lambda x: "Growth-Focused (10-25% marketing)" if x == "growth" else "Mature (3-7% marketing)"
)

# Commission Structure
commission_type = st.sidebar.selectbox(
    "Commission Structure",
    options=["independent", "captive", "hybrid"],
    format_func=lambda x: x.capitalize()
)

st.sidebar.markdown("---")
st.sidebar.header("💰 Marketing Mix")

ref_allocation = st.sidebar.number_input(
    "Referral Program ($/mo)",
    min_value=0,
    max_value=10000,
    value=500,
    step=100,
    help="60% conversion rate, $50/lead"
)

digital_allocation = st.sidebar.number_input(
    "Digital Marketing ($/mo)",
    min_value=0,
    max_value=10000,
    value=1500,
    step=100,
    help="18% conversion rate, $25/lead"
)

trad_allocation = st.sidebar.number_input(
    "Traditional Marketing ($/mo)",
    min_value=0,
    max_value=10000,
    value=500,
    step=100,
    help="15% conversion rate, $35/lead"
)

partner_allocation = st.sidebar.number_input(
    "Partnerships ($/mo)",
    min_value=0,
    max_value=10000,
    value=500,
    step=100,
    help="25% conversion rate, $40/lead"
)

st.sidebar.markdown("---")
st.sidebar.header("👥 Staffing")

producers = st.sidebar.number_input(
    "Producers (FTE)",
    min_value=0.0,
    max_value=20.0,
    value=2.0,
    step=0.5
)

service_staff = st.sidebar.number_input(
    "Service Staff (FTE)",
    min_value=0.0,
    max_value=50.0,
    value=5.0,
    step=0.5,
    help="Target: 2.8 per producer"
)

admin_staff = st.sidebar.number_input(
    "Admin Staff (FTE)",
    min_value=0.0,
    max_value=10.0,
    value=1.0,
    step=0.5
)

st.sidebar.markdown("---")
st.sidebar.header("📦 Product Mix")

auto_policies = st.sidebar.number_input("Auto Policies", min_value=0, value=300, step=10)
home_policies = st.sidebar.number_input("Home Policies", min_value=0, value=200, step=10)
umbrella_policies = st.sidebar.number_input("Umbrella Policies", min_value=0, value=80, step=10)
cyber_policies = st.sidebar.number_input("Cyber Policies", min_value=0, value=20, step=10)
commercial_policies = st.sidebar.number_input("Commercial Policies", min_value=0, value=50, step=10)

st.sidebar.markdown("---")
st.sidebar.header("⚙️ Technology")

eo_automation = st.sidebar.checkbox("E&O Automation ($150/mo)", value=False,
                                   help="Prevents 40% of E&O claims")
renewal_program = st.sidebar.checkbox("Renewal Review Program", value=False,
                                      help="1.5-2% retention improvement")
crosssell_program = st.sidebar.checkbox("Cross-Sell Program ($500/mo)", value=False,
                                        help="Umbrella & Cyber focus")

# Simulation Settings
st.sidebar.markdown("---")
st.sidebar.header("🎯 Simulation")

simulation_months = st.sidebar.slider("Projection Months", 12, 36, 24)
avg_premium = st.sidebar.number_input("Average Annual Premium ($)", 1000, 5000, 1500, 100)

# Build parameters
params = EnhancedSimulationParameters()

# Configure marketing
params.marketing.referral.monthly_allocation = ref_allocation
params.marketing.digital.monthly_allocation = digital_allocation
params.marketing.traditional.monthly_allocation = trad_allocation
params.marketing.partnerships.monthly_allocation = partner_allocation

# Configure staffing
params.staffing.producers = producers
params.staffing.service_staff = service_staff
params.staffing.admin_staff = admin_staff

# Configure bundling
params.bundling.auto_policies = auto_policies
params.bundling.home_policies = home_policies
params.bundling.umbrella_policies = umbrella_policies
params.bundling.cyber_policies = cyber_policies
params.bundling.commercial_policies = commercial_policies

# Configure commission structure
if commission_type == "independent":
    params.commission.structure_type = AgencyType.INDEPENDENT
elif commission_type == "captive":
    params.commission.structure_type = AgencyType.CAPTIVE
else:
    params.commission.structure_type = AgencyType.HYBRID

# Configure growth stage
params.growth_stage = GrowthStage.GROWTH if growth_stage == "growth" else GrowthStage.MATURE

# Set premium
params.avg_premium_annual = avg_premium

# Calculate current state
total_policies = auto_policies + home_policies + umbrella_policies + cyber_policies + commercial_policies
params.current_policies = total_policies if total_policies > 0 else 500

# Estimate customers (simplified)
params.current_customers = max(auto_policies, home_policies) + commercial_policies
if params.current_customers == 0:
    params.current_customers = 350

# Technology adjustments
if eo_automation:
    # E&O automation enabled - this is just for tracking
    pass

if renewal_program:
    # Renewal program enabled - improves retention
    pass

if crosssell_program:
    # Cross-sell program enabled
    pass

# Run simulation
if st.sidebar.button("🚀 Run Simulation", type="primary"):
    with st.spinner("Running simulation..."):
        simulator = EnhancedAgencySimulator(params)
        results = simulator.simulate_scenario(simulation_months)
        report = simulator.generate_benchmark_report(results)

        # Store in session state
        st.session_state['results'] = results
        st.session_state['report'] = report
        st.session_state['params'] = params

# Display results if available
if 'results' in st.session_state and 'report' in st.session_state:
    results = st.session_state['results']
    report = st.session_state['report']
    params = st.session_state['params']

    # Main metrics
    st.header("📊 Performance Overview")

    col1, col2, col3, col4 = st.columns(4)

    # Rule of 20
    r20 = report['financial_performance']['rule_of_20']
    with col1:
        delta_color = "normal" if r20['score'] >= 20 else "inverse"
        st.metric(
            "Rule of 20 Score",
            f"{r20['score']:.1f}",
            f"{r20['rating']}",
            delta_color=delta_color
        )

    # EBITDA Margin
    ebitda_margin = report['financial_performance']['ebitda_margin']
    with col2:
        delta_color = "normal" if ebitda_margin >= 0.25 else "inverse"
        st.metric(
            "EBITDA Margin",
            f"{ebitda_margin:.1%}",
            "Target: 25-30%",
            delta_color=delta_color
        )

    # LTV:CAC
    ltv_cac = report['unit_economics']['ltv_cac_ratio']
    with col3:
        delta_color = "normal" if ltv_cac >= 3 and ltv_cac < 5 else "off"
        st.metric(
            "LTV:CAC Ratio",
            f"{ltv_cac:.1f}:1",
            report['unit_economics']['ltv_cac_evaluation']['status'].upper()
        )

    # Revenue Per Employee
    rpe = report['operational_benchmarks']['revenue_per_employee']
    with col4:
        delta_color = "normal" if rpe['rpe'] >= 150000 else "inverse"
        st.metric(
            "Revenue Per Employee",
            f"${rpe['rpe']:,.0f}",
            rpe['rating']
        )

    # Tabs for detailed views
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📈 Growth Metrics",
        "💰 Unit Economics",
        "⚙️ Operational Benchmarks",
        "🚀 High-ROI Investments",
        "📊 Detailed Projections"
    ])

    with tab1:
        st.subheader("Growth Metrics")

        col1, col2, col3 = st.columns(3)
        growth = report['growth_metrics']

        with col1:
            st.metric("Final Policies", f"{growth['final_policies']:.0f}")
        with col2:
            st.metric("Policies Per Customer", f"{growth['policies_per_customer']:.2f}",
                     "🎯 Target: 1.8+" if growth['policies_per_customer'] >= 1.8 else "")
        with col3:
            st.metric("Retention Rate", f"{growth['retention_rate']:.1%}")

        # Policy growth chart
        fig_policies = go.Figure()
        fig_policies.add_trace(go.Scatter(
            x=results['month'],
            y=results['policies_end'],
            mode='lines',
            name='Total Policies',
            line=dict(color='#3b82f6', width=3)
        ))
        fig_policies.update_layout(
            title="Policy Growth Over Time",
            xaxis_title="Month",
            yaxis_title="Total Policies",
            height=400
        )
        st.plotly_chart(fig_policies, use_container_width=True)

        # Policies per customer trend
        fig_ppc = go.Figure()
        fig_ppc.add_trace(go.Scatter(
            x=results['month'],
            y=results['policies_per_customer'],
            mode='lines',
            name='Policies Per Customer',
            line=dict(color='#10b981', width=3)
        ))
        fig_ppc.add_hline(y=1.8, line_dash="dash", line_color="red",
                         annotation_text="Critical Threshold (1.8)")
        fig_ppc.update_layout(
            title="Policies Per Customer (Critical: 1.8 = 95% Retention)",
            xaxis_title="Month",
            yaxis_title="Policies Per Customer",
            height=400
        )
        st.plotly_chart(fig_ppc, use_container_width=True)

    with tab2:
        st.subheader("Unit Economics")

        ue = report['unit_economics']
        eval = ue['ltv_cac_evaluation']

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Customer LTV", f"${ue['ltv']:,.0f}")
        with col2:
            st.metric("Customer CAC", f"${ue['cac']:,.0f}")
        with col3:
            st.metric("LTV:CAC Ratio", f"{ue['ltv_cac_ratio']:.1f}:1")

        # Evaluation
        status_colors = {
            'excellent': '#10b981',
            'good': '#3b82f6',
            'warning': '#f59e0b',
            'poor': '#ef4444',
            'underinvested': '#f59e0b'
        }
        color = status_colors.get(eval['status'], '#6b7280')

        st.markdown(f"""
        <div class="metric-card" style="background-color: {color}22; border-color: {color};">
            <h4 style="color: {color};">{eval['message']}</h4>
            <p>{eval['recommendation']}</p>
            <p><strong>Benchmark:</strong> 3:1 = Good, 4:1 = Great, 5:1+ = May indicate under-investment</p>
        </div>
        """, unsafe_allow_html=True)

        # LTV vs CAC over time
        fig_ltv_cac = go.Figure()
        fig_ltv_cac.add_trace(go.Scatter(
            x=results['month'],
            y=results['ltv'],
            mode='lines',
            name='LTV',
            line=dict(color='#10b981', width=3)
        ))
        fig_ltv_cac.add_trace(go.Scatter(
            x=results['month'],
            y=results['cac'],
            mode='lines',
            name='CAC',
            line=dict(color='#ef4444', width=3)
        ))
        fig_ltv_cac.update_layout(
            title="LTV vs CAC Over Time",
            xaxis_title="Month",
            yaxis_title="Value ($)",
            height=400
        )
        st.plotly_chart(fig_ltv_cac, use_container_width=True)

    with tab3:
        st.subheader("Operational Benchmarks")

        # Marketing spend
        mkt = report['operational_benchmarks']['marketing_spend']
        st.markdown(f"""
        **Marketing Spend:** ${mkt['annual_marketing_spend']:,.0f}/year ({mkt['percent_of_revenue']:.1f}%)
        - Target Range: {mkt['target_range']}
        - Status: {mkt['status'].upper()}
        - {mkt['message']}
        """)

        # Technology spend
        tech = report['operational_benchmarks']['technology_spend']
        st.markdown(f"""
        **Technology Investment:** ${tech['annual_cost']:,.0f}/year ({tech['percent_of_revenue']:.1f}%)
        - Target Range: 2.5-3.5%
        - Status: {tech['status'].upper()}
        - {tech['message']}
        """)

        # Revenue per employee
        st.markdown(f"""
        **Revenue Per Employee:** ${rpe['rpe']:,.0f}
        - Rating: {rpe['rating']}
        - Target: $150k-$200k (good), $300k+ (excellent)
        """)

        # Compensation validation
        comp = report['operational_benchmarks']['compensation_validation']
        st.markdown(f"""
        **Compensation Ratio:** {comp['comp_ratio']:.1%}
        - Status: {comp['status'].upper()}
        - {comp['message']}
        - Best Practice: Keep total payroll ≤ 65% of revenue
        """)

        # Staffing ratio
        total_fte = params.staffing.get_total_fte()
        service_producer_ratio = params.staffing.get_producer_to_service_ratio()
        st.markdown(f"""
        **Staffing Composition:**
        - Total FTE: {total_fte:.1f}
        - Producers: {params.staffing.producers:.1f}
        - Service Staff: {params.staffing.service_staff:.1f}
        - Admin Staff: {params.staffing.admin_staff:.1f}
        - Service:Producer Ratio: {service_producer_ratio:.1f}:1 (Target: 2.8:1)
        """)

    with tab4:
        st.subheader("🚀 High-ROI Investment Opportunities")

        investments = report['high_roi_investments']

        # E&O Automation
        eo = investments['eo_automation']
        st.markdown(f"""
        ### 1. {eo['investment']}
        **Cost:** ${eo['annual_cost']:,.0f}/year
        **Expected Savings:** ${eo['expected_annual_savings']:,.0f}/year
        **ROI:** {eo['roi_percent']:.0f}%
        **Claims Prevented:** {eo['claims_prevented_per_year']:.2f}/year

        💡 {eo['recommendation']}
        """)

        st.progress(min(1.0, eo['roi_percent'] / 1000))

        # Renewal Program
        renewal = investments['renewal_program']
        st.markdown(f"""
        ### 2. {renewal['investment']}
        **Annual Cost:** ${renewal['annual_labor_cost']:,.0f}
        **5-Year Benefit:** ${renewal['five_year_benefit']:,.0f}
        **5-Year ROI:** {renewal['five_year_roi_percent']:.0f}%
        **Retention Improvement:** {renewal['year_1_retention_improvement']}
        **Timeline:** {renewal['timeline_to_results']}

        💡 {renewal['recommendation']}

        *Note: 5% retention improvement can double profits in 5 years*
        """)

        # Cross-sell Program
        cross = investments['crosssell_program']
        st.markdown(f"""
        ### 3. {cross['investment']}
        **Annual Cost:** ${cross['annual_cost']:,.0f}
        **Revenue Opportunity:** ${cross['total_annual_revenue']:,.0f}/year
        **ROI:** {cross['roi_percent']:.0f}%
        - Umbrella Policies: {cross['umbrella_policies_sold']:.0f} (${cross['umbrella_annual_revenue']:,.0f})
        - Cyber Policies: {cross['cyber_policies_sold']:.0f} (${cross['cyber_annual_revenue']:,.0f})

        💡 {cross['recommendation']}
        """)

    with tab5:
        st.subheader("Detailed Monthly Projections")

        # Show data table
        st.dataframe(
            results[[
                'month',
                'policies_end',
                'customers_end',
                'policies_per_customer',
                'retention_rate',
                'commission_revenue',
                'ebitda',
                'ebitda_margin',
                'ltv_cac_ratio'
            ]].style.format({
                'policies_end': '{:.0f}',
                'customers_end': '{:.0f}',
                'policies_per_customer': '{:.2f}',
                'retention_rate': '{:.1%}',
                'commission_revenue': '${:,.0f}',
                'ebitda': '${:,.0f}',
                'ebitda_margin': '{:.1%}',
                'ltv_cac_ratio': '{:.1f}:1'
            }),
            use_container_width=True,
            height=400
        )

        # EBITDA trend
        fig_ebitda = go.Figure()
        fig_ebitda.add_trace(go.Scatter(
            x=results['month'],
            y=results['ebitda'],
            mode='lines',
            name='Monthly EBITDA',
            fill='tozeroy',
            line=dict(color='#8b5cf6', width=2)
        ))
        fig_ebitda.update_layout(
            title="EBITDA Over Time",
            xaxis_title="Month",
            yaxis_title="EBITDA ($)",
            height=400
        )
        st.plotly_chart(fig_ebitda, use_container_width=True)

else:
    st.info("👈 Configure your agency parameters in the sidebar and click '🚀 Run Simulation' to begin.")

    # Show example benchmarks
    st.header("📚 Industry Benchmarks Reference")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        ### Financial Performance
        - **EBITDA Margin:** 25-30% for $1-5M agencies
        - **Rule of 20:** Score ≥ 20 (healthy), 25+ (top performer)
        - **Total Payroll:** ≤ 65% of revenue

        ### Unit Economics
        - **LTV:CAC Ratio:** 3:1 (good), 4:1 (great), 5:1+ (may be under-investing)
        - **Average CAC:** ~$900 for independent agents

        ### Marketing Investment
        - **Mature Agencies:** 3-7% of revenue
        - **Growth-Focused:** 10-25% of revenue
        """)

    with col2:
        st.markdown("""
        ### Retention & Bundling
        - **Monoline Retention:** 67%
        - **Bundled Retention:** 91-95%
        - **Critical Threshold:** 1.8 policies/customer = 95% retention

        ### Staffing
        - **Service:Producer Ratio:** 2.8:1 (optimal)
        - **Revenue Per Employee:** $150k-$200k (target), $300k+ (excellent)

        ### Technology
        - **Investment Target:** 2.5-3.5% of revenue
        """)
