#!/usr/bin/env python3
"""
Comprehensive Lead Analysis for Brittany's Insurance Sales Optimization
Analyzes lead data from multiple agencies to identify what works best
"""

import pandas as pd
import numpy as np
from datetime import datetime
import os
import warnings
warnings.filterwarnings('ignore')

# Set display options
pd.set_option('display.max_rows', 100)
pd.set_option('display.max_columns', 20)
pd.set_option('display.width', 200)

def load_data():
    """Load and combine all CSV files"""
    files = [f for f in os.listdir('.') if f.endswith('.csv')]
    dfs = []
    for f in files:
        df = pd.read_csv(f)
        dfs.append(df)
    data = pd.concat(dfs, ignore_index=True)

    # Parse date column
    data['Date'] = pd.to_datetime(data['Date'])
    data['Hour'] = data['Date'].dt.hour
    data['DayOfWeek'] = data['Date'].dt.day_name()
    data['Week'] = data['Date'].dt.isocalendar().week

    return data

def classify_outcome(status):
    """Classify lead status into outcome categories"""
    if pd.isna(status):
        return 'Unknown'

    status = str(status).upper()

    # Success outcomes (sales/hot prospects)
    if 'SOLD' in status or 'CUSTOMER' in status:
        return 'SOLD'
    if 'HOT' in status:
        return 'HOT_PROSPECT'
    if 'XDATE' in status:
        return 'XDATE_SET'
    if 'ONBOARDING' in status:
        return 'ONBOARDING'

    # Quoted but not sold
    if 'QUOTED' in status and 'NOT INTERESTED' not in status:
        return 'QUOTED'
    if 'QUOTED - NOT INTERESTED' in status:
        return 'QUOTED_NOT_INTERESTED'

    # Transferred
    if 'TRANSFERRED' in status:
        if 'FAILED' in status:
            return 'TRANSFER_FAILED'
        return 'TRANSFERRED'

    # Contact outcomes
    if 'CONTACTED' in status:
        if 'NOT INTERESTED' in status:
            return 'NOT_INTERESTED'
        if 'NOT ELIGIBLE' in status:
            return 'NOT_ELIGIBLE'
        if 'NEVER REQUESTED' in status:
            return 'NEVER_REQUESTED'
        if 'ALREADY PURCHASED' in status:
            return 'ALREADY_PURCHASED'
        if 'BAD LEAD' in status or 'ALLSTATE' in status:
            return 'BAD_LEAD'
        if 'HUNG UP' in status:
            return 'HUNG_UP'
        if 'FOLLOW UP' in status:
            return 'FOLLOW_UP'
        return 'CONTACTED_OTHER'

    # No contact outcomes
    if 'NO CONTACT' in status:
        return 'NO_CONTACT'
    if 'BAD PHONE' in status:
        return 'BAD_PHONE'
    if 'LEFT MESSAGE' in status:
        return 'LEFT_MESSAGE'

    # Other
    if 'DO NOT CALL' in status:
        return 'DNC'
    if 'REQUOTE' in status:
        return 'REQUOTE'
    if 'RECYCLED' in status:
        return 'RECYCLED'
    if 'BUSINESS' in status:
        return 'BUSINESS'

    return 'OTHER'

def calculate_metrics(data):
    """Calculate key performance metrics"""
    data['Outcome'] = data['Current Status'].apply(classify_outcome)

    # Define success tiers
    data['Is_Sale'] = data['Outcome'].isin(['SOLD', 'ONBOARDING'])
    data['Is_Hot'] = data['Outcome'].isin(['SOLD', 'ONBOARDING', 'HOT_PROSPECT', 'XDATE_SET'])
    data['Is_Quoted'] = data['Outcome'].isin(['SOLD', 'ONBOARDING', 'HOT_PROSPECT', 'XDATE_SET', 'QUOTED'])
    data['Is_Contacted'] = ~data['Outcome'].isin(['NO_CONTACT', 'BAD_PHONE', 'LEFT_MESSAGE', 'DNC', 'RECYCLED', 'OTHER'])

    return data

def analyze_vendors(data):
    """Analyze performance by lead vendor/source"""
    print("\n" + "="*80)
    print("LEAD SOURCE (VENDOR) ANALYSIS")
    print("="*80)

    vendor_metrics = data.groupby('Vendor Name').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': ['sum', 'mean'],
        'Is_Contacted': ['sum', 'mean'],
        'Call Duration In Seconds': 'mean'
    }).round(4)

    vendor_metrics.columns = ['Total_Leads', 'Sales', 'Sale_Rate', 'Hot_Prospects', 'Hot_Rate',
                               'Quoted', 'Quote_Rate', 'Contacted', 'Contact_Rate', 'Avg_Call_Duration']
    vendor_metrics = vendor_metrics.sort_values('Sale_Rate', ascending=False)

    print("\nVendor Performance Summary:")
    print(vendor_metrics.to_string())

    # Cost efficiency analysis (assuming equal cost per lead for now)
    print("\n--- VENDOR ROI ANALYSIS ---")
    for vendor in vendor_metrics.index:
        v = vendor_metrics.loc[vendor]
        print(f"\n{vendor}:")
        print(f"  Total Leads: {int(v['Total_Leads'])}")
        print(f"  Sales: {int(v['Sales'])} ({v['Sale_Rate']*100:.2f}%)")
        print(f"  Hot Prospects: {int(v['Hot_Prospects'])} ({v['Hot_Rate']*100:.2f}%)")
        print(f"  Quote Rate: {v['Quote_Rate']*100:.2f}%")
        print(f"  Contact Rate: {v['Contact_Rate']*100:.2f}%")
        print(f"  Avg Call Duration: {v['Avg_Call_Duration']:.1f} seconds")

    return vendor_metrics

def analyze_agents(data):
    """Analyze performance by sales agent"""
    print("\n" + "="*80)
    print("SALES AGENT PERFORMANCE ANALYSIS")
    print("="*80)

    # Filter out empty users
    agent_data = data[data['User'].notna() & (data['User'] != '')]

    agent_metrics = agent_data.groupby('User').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': ['sum', 'mean'],
        'Is_Contacted': ['sum', 'mean'],
        'Call Duration In Seconds': ['mean', 'sum']
    }).round(4)

    agent_metrics.columns = ['Total_Calls', 'Sales', 'Sale_Rate', 'Hot_Prospects', 'Hot_Rate',
                              'Quoted', 'Quote_Rate', 'Contacted', 'Contact_Rate',
                              'Avg_Call_Duration', 'Total_Talk_Time']
    agent_metrics = agent_metrics.sort_values('Sale_Rate', ascending=False)

    print("\nAgent Performance Summary:")
    print(agent_metrics.to_string())

    # Detailed agent analysis
    print("\n--- DETAILED AGENT ANALYSIS ---")
    for agent in agent_metrics.index:
        a = agent_metrics.loc[agent]
        print(f"\n{agent}:")
        print(f"  Total Calls: {int(a['Total_Calls'])}")
        print(f"  Sales: {int(a['Sales'])} ({a['Sale_Rate']*100:.2f}%)")
        print(f"  Hot Prospects: {int(a['Hot_Prospects'])} ({a['Hot_Rate']*100:.2f}%)")
        print(f"  Quote Rate: {a['Quote_Rate']*100:.2f}%")
        print(f"  Contact Rate: {a['Contact_Rate']*100:.2f}%")
        print(f"  Avg Call Duration: {a['Avg_Call_Duration']:.1f} seconds")
        print(f"  Total Talk Time: {a['Total_Talk_Time']/3600:.1f} hours")

    return agent_metrics

def analyze_call_types(data):
    """Analyze performance by call type"""
    print("\n" + "="*80)
    print("CALL TYPE / LEAD QUEUE ANALYSIS")
    print("="*80)

    call_metrics = data.groupby('Call Type').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': ['sum', 'mean'],
        'Is_Contacted': ['sum', 'mean'],
        'Call Duration In Seconds': 'mean'
    }).round(4)

    call_metrics.columns = ['Total_Calls', 'Sales', 'Sale_Rate', 'Hot_Prospects', 'Hot_Rate',
                            'Quoted', 'Quote_Rate', 'Contacted', 'Contact_Rate', 'Avg_Call_Duration']
    call_metrics = call_metrics.sort_values('Sale_Rate', ascending=False)

    print("\nCall Type Performance Summary:")
    print(call_metrics.to_string())

    # Analyze Live vs Telemarketing vs Inbound
    print("\n--- CALL TYPE CATEGORY ANALYSIS ---")
    data['Call_Category'] = data['Call Type'].apply(categorize_call_type)

    cat_metrics = data.groupby('Call_Category').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': ['sum', 'mean'],
        'Is_Contacted': ['sum', 'mean'],
        'Call Duration In Seconds': 'mean'
    }).round(4)

    cat_metrics.columns = ['Total_Calls', 'Sales', 'Sale_Rate', 'Hot_Prospects', 'Hot_Rate',
                           'Quoted', 'Quote_Rate', 'Contacted', 'Contact_Rate', 'Avg_Call_Duration']
    cat_metrics = cat_metrics.sort_values('Sale_Rate', ascending=False)

    print("\nCall Category Performance:")
    print(cat_metrics.to_string())

    return call_metrics

def categorize_call_type(call_type):
    """Categorize call types into broader categories"""
    if pd.isna(call_type):
        return 'Unknown'

    call_type = str(call_type).upper()

    if 'LIVE' in call_type or 'LIVE-Q' in call_type or 'EVE-Q' in call_type:
        return 'Live Transfer'
    if 'INBOUND' in call_type:
        return 'Inbound'
    if 'TELEMARKETING' in call_type:
        return 'Telemarketing'
    if 'SHARK TANK' in call_type:
        return 'Shark Tank (Follow-up Pool)'
    if 'ASSIGNED' in call_type:
        return 'Assigned Follow-up'
    if 'MANUAL' in call_type:
        return 'Manual Dial'

    return 'Other'

def analyze_timing(data):
    """Analyze performance by time of day and day of week"""
    print("\n" + "="*80)
    print("TIMING ANALYSIS")
    print("="*80)

    # Hour of day analysis
    hour_metrics = data.groupby('Hour').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': 'mean',
        'Is_Contacted': 'mean'
    }).round(4)

    hour_metrics.columns = ['Total_Calls', 'Sales', 'Sale_Rate', 'Hot_Rate', 'Contact_Rate']

    print("\nPerformance by Hour of Day:")
    print(hour_metrics.to_string())

    # Day of week analysis
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_metrics = data.groupby('DayOfWeek').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': 'mean',
        'Is_Contacted': 'mean'
    }).round(4)

    day_metrics.columns = ['Total_Calls', 'Sales', 'Sale_Rate', 'Hot_Rate', 'Contact_Rate']
    day_metrics = day_metrics.reindex(day_order)

    print("\nPerformance by Day of Week:")
    print(day_metrics.to_string())

    return hour_metrics, day_metrics

def analyze_agent_vendor_combo(data):
    """Analyze which agent-vendor combinations work best"""
    print("\n" + "="*80)
    print("AGENT-VENDOR COMBINATION ANALYSIS")
    print("="*80)

    # Filter out empty users
    combo_data = data[data['User'].notna() & (data['User'] != '')]

    combo_metrics = combo_data.groupby(['User', 'Vendor Name']).agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': 'mean',
        'Is_Contacted': 'mean'
    }).round(4)

    combo_metrics.columns = ['Total_Calls', 'Sales', 'Sale_Rate', 'Hot_Prospects', 'Hot_Rate',
                              'Quote_Rate', 'Contact_Rate']

    # Filter to combinations with at least 50 calls
    combo_metrics = combo_metrics[combo_metrics['Total_Calls'] >= 50]
    combo_metrics = combo_metrics.sort_values('Sale_Rate', ascending=False)

    print("\nTop Agent-Vendor Combinations (min 50 calls):")
    print(combo_metrics.head(20).to_string())

    print("\nWorst Agent-Vendor Combinations (min 50 calls):")
    print(combo_metrics.tail(10).to_string())

    return combo_metrics

def analyze_funnel(data):
    """Analyze the sales funnel"""
    print("\n" + "="*80)
    print("SALES FUNNEL ANALYSIS")
    print("="*80)

    total = len(data)
    contacted = data['Is_Contacted'].sum()
    quoted = data['Is_Quoted'].sum()
    hot = data['Is_Hot'].sum()
    sold = data['Is_Sale'].sum()

    print(f"\nOverall Sales Funnel:")
    print(f"  Total Leads/Calls: {total}")
    print(f"  → Contacted: {contacted} ({contacted/total*100:.1f}%)")
    print(f"    → Quoted: {quoted} ({quoted/total*100:.1f}% of total, {quoted/contacted*100:.1f}% of contacted)")
    print(f"      → Hot/XDate: {hot} ({hot/total*100:.2f}% of total, {hot/quoted*100:.1f}% of quoted)")
    print(f"        → Sold: {sold} ({sold/total*100:.2f}% of total, {sold/hot*100:.1f}% of hot)")

    # Funnel by vendor
    print("\n--- FUNNEL BY VENDOR ---")
    for vendor in data['Vendor Name'].unique():
        v_data = data[data['Vendor Name'] == vendor]
        v_total = len(v_data)
        v_contacted = v_data['Is_Contacted'].sum()
        v_quoted = v_data['Is_Quoted'].sum()
        v_hot = v_data['Is_Hot'].sum()
        v_sold = v_data['Is_Sale'].sum()

        if v_total < 10:
            continue

        print(f"\n{vendor}:")
        print(f"  Leads: {v_total} → Contact: {v_contacted/v_total*100:.1f}% → Quote: {v_quoted/v_total*100:.1f}% → Hot: {v_hot/v_total*100:.2f}% → Sold: {v_sold/v_total*100:.2f}%")

    return

def analyze_outcome_distribution(data):
    """Detailed outcome distribution analysis"""
    print("\n" + "="*80)
    print("OUTCOME DISTRIBUTION ANALYSIS")
    print("="*80)

    outcome_counts = data['Outcome'].value_counts()
    total = len(data)

    print("\nOutcome Distribution:")
    for outcome, count in outcome_counts.items():
        print(f"  {outcome}: {count} ({count/total*100:.1f}%)")

    # Loss reasons analysis
    print("\n--- WHY LEADS ARE LOST ---")
    loss_outcomes = ['NO_CONTACT', 'BAD_PHONE', 'NOT_INTERESTED', 'NOT_ELIGIBLE',
                     'NEVER_REQUESTED', 'BAD_LEAD', 'HUNG_UP', 'DNC', 'QUOTED_NOT_INTERESTED']

    losses = data[data['Outcome'].isin(loss_outcomes)]
    loss_total = len(losses)

    print(f"\nTotal Lost Leads: {loss_total} ({loss_total/total*100:.1f}%)")
    for outcome in loss_outcomes:
        count = len(data[data['Outcome'] == outcome])
        if count > 0:
            print(f"  {outcome}: {count} ({count/loss_total*100:.1f}% of losses, {count/total*100:.1f}% of total)")

def generate_recommendations(data, vendor_metrics, agent_metrics):
    """Generate optimization recommendations based on analysis"""
    print("\n" + "="*80)
    print("OPTIMIZATION RECOMMENDATIONS")
    print("="*80)

    print("\n" + "-"*40)
    print("1. LEAD SOURCE OPTIMIZATION")
    print("-"*40)

    # Best performing vendors
    top_vendors = vendor_metrics.nlargest(3, 'Sale_Rate')
    worst_vendors = vendor_metrics.nsmallest(3, 'Sale_Rate')

    print("\nBEST PERFORMING VENDORS (by sale rate):")
    for vendor in top_vendors.index:
        v = top_vendors.loc[vendor]
        print(f"  ✓ {vendor}: {v['Sale_Rate']*100:.2f}% sale rate, {int(v['Total_Leads'])} leads")

    print("\nWORST PERFORMING VENDORS (by sale rate):")
    for vendor in worst_vendors.index:
        v = worst_vendors.loc[vendor]
        print(f"  ✗ {vendor}: {v['Sale_Rate']*100:.2f}% sale rate, {int(v['Total_Leads'])} leads")

    # Vendor recommendations
    print("\nRECOMMENDATIONS:")
    best_vendor = vendor_metrics['Sale_Rate'].idxmax()
    worst_vendor = vendor_metrics['Sale_Rate'].idxmin()

    print(f"  • INCREASE budget for: {best_vendor}")
    print(f"  • REDUCE/ELIMINATE budget for: {worst_vendor}")

    # Contact rate analysis
    low_contact_vendors = vendor_metrics[vendor_metrics['Contact_Rate'] < 0.3]
    if len(low_contact_vendors) > 0:
        print(f"  • LOW CONTACT RATE vendors (< 30%) - potential data quality issues:")
        for v in low_contact_vendors.index:
            print(f"    - {v}: {low_contact_vendors.loc[v, 'Contact_Rate']*100:.1f}% contact rate")

    print("\n" + "-"*40)
    print("2. AGENT PERFORMANCE OPTIMIZATION")
    print("-"*40)

    # Filter agents with significant volume
    significant_agents = agent_metrics[agent_metrics['Total_Calls'] >= 100]

    if len(significant_agents) > 0:
        top_agents = significant_agents.nlargest(3, 'Sale_Rate')
        bottom_agents = significant_agents.nsmallest(3, 'Sale_Rate')

        print("\nTOP PERFORMING AGENTS (min 100 calls):")
        for agent in top_agents.index:
            a = top_agents.loc[agent]
            print(f"  ✓ {agent}: {a['Sale_Rate']*100:.2f}% sale rate, {int(a['Total_Calls'])} calls")

        print("\nAGENTS NEEDING IMPROVEMENT (min 100 calls):")
        for agent in bottom_agents.index:
            a = bottom_agents.loc[agent]
            print(f"  ⚠ {agent}: {a['Sale_Rate']*100:.2f}% sale rate, {int(a['Total_Calls'])} calls")

        print("\nRECOMMENDATIONS:")
        best_agent = significant_agents['Sale_Rate'].idxmax()
        print(f"  • Have top performer ({best_agent}) train/coach other agents")
        print(f"  • Study call recordings/techniques of top performers")

        # High volume low performance
        high_vol_low_perf = significant_agents[
            (significant_agents['Total_Calls'] > significant_agents['Total_Calls'].median()) &
            (significant_agents['Sale_Rate'] < significant_agents['Sale_Rate'].median())
        ]
        if len(high_vol_low_perf) > 0:
            print(f"  • HIGH VOLUME but LOW PERFORMANCE agents (priority for training):")
            for agent in high_vol_low_perf.index:
                print(f"    - {agent}")

    print("\n" + "-"*40)
    print("3. CALL TYPE/TIMING OPTIMIZATION")
    print("-"*40)

    # Analyze call categories
    data['Call_Category'] = data['Call Type'].apply(categorize_call_type)
    cat_perf = data.groupby('Call_Category')['Is_Sale'].agg(['sum', 'mean', 'count'])
    cat_perf.columns = ['Sales', 'Sale_Rate', 'Volume']
    cat_perf = cat_perf.sort_values('Sale_Rate', ascending=False)

    print("\nBEST CALL TYPES:")
    for cat in cat_perf.head(3).index:
        c = cat_perf.loc[cat]
        print(f"  ✓ {cat}: {c['Sale_Rate']*100:.2f}% sale rate, {int(c['Volume'])} calls")

    best_cat = cat_perf['Sale_Rate'].idxmax()
    print(f"\nRECOMMENDATION: Prioritize '{best_cat}' calls for highest conversion")

    # Timing recommendations
    hour_perf = data.groupby('Hour')['Is_Sale'].agg(['sum', 'mean', 'count'])
    best_hours = hour_perf.nlargest(3, 'mean').index.tolist()
    print(f"\nBEST HOURS TO CALL: {best_hours}")

    day_perf = data.groupby('DayOfWeek')['Is_Sale'].agg(['sum', 'mean', 'count'])
    best_days = day_perf.nlargest(2, 'mean').index.tolist()
    print(f"BEST DAYS TO CALL: {best_days}")

    print("\n" + "-"*40)
    print("4. LEAD QUALITY ISSUES TO ADDRESS")
    print("-"*40)

    # Calculate problematic lead rates by vendor
    for vendor in data['Vendor Name'].unique():
        v_data = data[data['Vendor Name'] == vendor]
        bad_phone_rate = len(v_data[v_data['Outcome'] == 'BAD_PHONE']) / len(v_data)
        no_contact_rate = len(v_data[v_data['Outcome'] == 'NO_CONTACT']) / len(v_data)
        bad_lead_rate = len(v_data[v_data['Outcome'] == 'BAD_LEAD']) / len(v_data)
        never_req_rate = len(v_data[v_data['Outcome'] == 'NEVER_REQUESTED']) / len(v_data)

        issues = []
        if bad_phone_rate > 0.05:
            issues.append(f"Bad Phone: {bad_phone_rate*100:.1f}%")
        if no_contact_rate > 0.6:
            issues.append(f"No Contact: {no_contact_rate*100:.1f}%")
        if bad_lead_rate > 0.02:
            issues.append(f"Bad Lead: {bad_lead_rate*100:.1f}%")
        if never_req_rate > 0.03:
            issues.append(f"Never Requested: {never_req_rate*100:.1f}%")

        if issues:
            print(f"\n{vendor}:")
            for issue in issues:
                print(f"  ⚠ {issue}")

    print("\n" + "-"*40)
    print("5. STRATEGIC ACTION PLAN")
    print("-"*40)

    # Calculate overall metrics
    total_leads = len(data)
    total_sales = data['Is_Sale'].sum()
    overall_sale_rate = total_sales / total_leads * 100

    print(f"\nCURRENT STATE:")
    print(f"  Total Leads: {total_leads}")
    print(f"  Total Sales: {int(total_sales)}")
    print(f"  Overall Sale Rate: {overall_sale_rate:.2f}%")

    print("\nACTION ITEMS (Priority Order):")
    print("\nIMMEDIATE (This Week):")
    print("  1. Review agent performance and identify coaching needs")
    print("  2. Reallocate worst vendor budget to best vendor")
    print(f"  3. Schedule calls during peak hours: {best_hours}")

    print("\nSHORT-TERM (This Month):")
    print("  4. Implement lead scoring based on vendor source")
    print("  5. Create agent-vendor matching optimization")
    print("  6. Set up quality feedback loop with vendors")

    print("\nONGOING:")
    print("  7. Weekly performance reviews by agent and vendor")
    print("  8. A/B test new vendors with small budgets first")
    print("  9. Track and improve contact rates")

    # Projected improvement
    if len(significant_agents) >= 2:
        best_rate = significant_agents['Sale_Rate'].max()
        avg_rate = significant_agents['Sale_Rate'].mean()
        improvement_potential = (best_rate - avg_rate) / avg_rate * 100
        print(f"\nPOTENTIAL IMPROVEMENT:")
        print(f"  If all agents performed at top agent level:")
        print(f"  Current avg sale rate: {avg_rate*100:.2f}%")
        print(f"  Top agent sale rate: {best_rate*100:.2f}%")
        print(f"  Potential improvement: {improvement_potential:.0f}%")

def main():
    print("="*80)
    print("BRITTNEY'S INSURANCE LEAD ANALYSIS - COMPREHENSIVE REPORT")
    print("="*80)
    print(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Load and prepare data
    print("\nLoading data...")
    data = load_data()
    print(f"Loaded {len(data)} records from {data['Date'].min()} to {data['Date'].max()}")

    # Calculate metrics
    data = calculate_metrics(data)

    # Run all analyses
    vendor_metrics = analyze_vendors(data)
    agent_metrics = analyze_agents(data)
    call_metrics = analyze_call_types(data)
    analyze_timing(data)
    analyze_agent_vendor_combo(data)
    analyze_funnel(data)
    analyze_outcome_distribution(data)

    # Generate recommendations
    generate_recommendations(data, vendor_metrics, agent_metrics)

    print("\n" + "="*80)
    print("END OF REPORT")
    print("="*80)

if __name__ == "__main__":
    os.chdir('/Users/adrianstiermbp2023/Desktop/lead-analysis')
    main()
