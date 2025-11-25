#!/usr/bin/env python3
"""
Lead Analysis API Service
Generates JSON output for frontend consumption
"""

import pandas as pd
import numpy as np
from datetime import datetime
import os
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Get repository root
REPO_ROOT = Path(__file__).parent.parent
LEAD_DATA_DIR = REPO_ROOT / "data" / "06_lead_data"
OUTPUT_DIR = REPO_ROOT / "agency-growth-platform" / "public" / "data"

def load_data():
    """Load and combine all CSV files from lead data directory"""
    files = list(LEAD_DATA_DIR.glob("*.csv"))
    if not files:
        raise FileNotFoundError(f"No CSV files found in {LEAD_DATA_DIR}")

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

    if 'SOLD' in status or 'CUSTOMER' in status:
        return 'SOLD'
    if 'HOT' in status:
        return 'HOT_PROSPECT'
    if 'XDATE' in status:
        return 'XDATE_SET'
    if 'ONBOARDING' in status:
        return 'ONBOARDING'
    if 'QUOTED' in status and 'NOT INTERESTED' not in status:
        return 'QUOTED'
    if 'QUOTED - NOT INTERESTED' in status:
        return 'QUOTED_NOT_INTERESTED'
    if 'TRANSFERRED' in status:
        return 'TRANSFER_FAILED' if 'FAILED' in status else 'TRANSFERRED'
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
    if 'NO CONTACT' in status:
        return 'NO_CONTACT'
    if 'BAD PHONE' in status:
        return 'BAD_PHONE'
    if 'LEFT MESSAGE' in status:
        return 'LEFT_MESSAGE'
    if 'DO NOT CALL' in status:
        return 'DNC'
    if 'REQUOTE' in status:
        return 'REQUOTE'
    if 'RECYCLED' in status:
        return 'RECYCLED'
    if 'BUSINESS' in status:
        return 'BUSINESS'

    return 'OTHER'

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
        return 'Shark Tank'
    if 'ASSIGNED' in call_type:
        return 'Assigned Follow-up'
    if 'MANUAL' in call_type:
        return 'Manual Dial'

    return 'Other'

def calculate_metrics(data):
    """Calculate key performance metrics"""
    data['Outcome'] = data['Current Status'].apply(classify_outcome)
    data['Is_Sale'] = data['Outcome'].isin(['SOLD', 'ONBOARDING'])
    data['Is_Hot'] = data['Outcome'].isin(['SOLD', 'ONBOARDING', 'HOT_PROSPECT', 'XDATE_SET'])
    data['Is_Quoted'] = data['Outcome'].isin(['SOLD', 'ONBOARDING', 'HOT_PROSPECT', 'XDATE_SET', 'QUOTED'])
    data['Is_Contacted'] = ~data['Outcome'].isin(['NO_CONTACT', 'BAD_PHONE', 'LEFT_MESSAGE', 'DNC', 'RECYCLED', 'OTHER'])
    data['Call_Category'] = data['Call Type'].apply(categorize_call_type)

    return data

def analyze_vendors(data):
    """Analyze performance by lead vendor/source"""
    vendor_metrics = data.groupby('Vendor Name').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': ['sum', 'mean'],
        'Is_Contacted': ['sum', 'mean'],
        'Call Duration In Seconds': 'mean'
    }).round(4)

    vendor_metrics.columns = ['total_leads', 'sales', 'sale_rate', 'hot_prospects', 'hot_rate',
                               'quoted', 'quote_rate', 'contacted', 'contact_rate', 'avg_call_duration']
    vendor_metrics = vendor_metrics.sort_values('sale_rate', ascending=False)

    result = []
    for vendor in vendor_metrics.index:
        v = vendor_metrics.loc[vendor]
        result.append({
            'vendor': vendor,
            'total_leads': int(v['total_leads']),
            'sales': int(v['sales']),
            'sale_rate': round(float(v['sale_rate']) * 100, 2),
            'hot_prospects': int(v['hot_prospects']),
            'hot_rate': round(float(v['hot_rate']) * 100, 2),
            'quoted': int(v['quoted']),
            'quote_rate': round(float(v['quote_rate']) * 100, 2),
            'contacted': int(v['contacted']),
            'contact_rate': round(float(v['contact_rate']) * 100, 2),
            'avg_call_duration': round(float(v['avg_call_duration']), 1)
        })

    return result

def analyze_agents(data):
    """Analyze performance by sales agent"""
    agent_data = data[data['User'].notna() & (data['User'] != '')]

    agent_metrics = agent_data.groupby('User').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': ['sum', 'mean'],
        'Is_Contacted': ['sum', 'mean'],
        'Call Duration In Seconds': ['mean', 'sum']
    }).round(4)

    agent_metrics.columns = ['total_calls', 'sales', 'sale_rate', 'hot_prospects', 'hot_rate',
                              'quoted', 'quote_rate', 'contacted', 'contact_rate',
                              'avg_call_duration', 'total_talk_time']
    agent_metrics = agent_metrics.sort_values('sale_rate', ascending=False)

    result = []
    for agent in agent_metrics.index:
        a = agent_metrics.loc[agent]
        result.append({
            'agent': agent,
            'total_calls': int(a['total_calls']),
            'sales': int(a['sales']),
            'sale_rate': round(float(a['sale_rate']) * 100, 2),
            'hot_prospects': int(a['hot_prospects']),
            'hot_rate': round(float(a['hot_rate']) * 100, 2),
            'quoted': int(a['quoted']),
            'quote_rate': round(float(a['quote_rate']) * 100, 2),
            'contacted': int(a['contacted']),
            'contact_rate': round(float(a['contact_rate']) * 100, 2),
            'avg_call_duration': round(float(a['avg_call_duration']), 1),
            'total_talk_hours': round(float(a['total_talk_time']) / 3600, 1)
        })

    return result

def analyze_timing(data):
    """Analyze performance by time of day and day of week"""
    # Hour of day analysis
    hour_metrics = data.groupby('Hour').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': 'mean',
        'Is_Contacted': 'mean'
    }).round(4)

    hour_metrics.columns = ['total_calls', 'sales', 'sale_rate', 'hot_rate', 'contact_rate']

    hourly = []
    for hour in hour_metrics.index:
        h = hour_metrics.loc[hour]
        hourly.append({
            'hour': int(hour),
            'total_calls': int(h['total_calls']),
            'sales': int(h['sales']),
            'sale_rate': round(float(h['sale_rate']) * 100, 2),
            'hot_rate': round(float(h['hot_rate']) * 100, 2),
            'contact_rate': round(float(h['contact_rate']) * 100, 2)
        })

    # Day of week analysis
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_metrics = data.groupby('DayOfWeek').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': 'mean',
        'Is_Contacted': 'mean'
    }).round(4)

    day_metrics.columns = ['total_calls', 'sales', 'sale_rate', 'hot_rate', 'contact_rate']

    daily = []
    for day in day_order:
        if day in day_metrics.index:
            d = day_metrics.loc[day]
            daily.append({
                'day': day,
                'total_calls': int(d['total_calls']),
                'sales': int(d['sales']),
                'sale_rate': round(float(d['sale_rate']) * 100, 2),
                'hot_rate': round(float(d['hot_rate']) * 100, 2),
                'contact_rate': round(float(d['contact_rate']) * 100, 2)
            })

    return {'hourly': hourly, 'daily': daily}

def analyze_call_types(data):
    """Analyze performance by call type category"""
    cat_metrics = data.groupby('Call_Category').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Hot': ['sum', 'mean'],
        'Is_Quoted': ['sum', 'mean'],
        'Is_Contacted': ['sum', 'mean'],
        'Call Duration In Seconds': 'mean'
    }).round(4)

    cat_metrics.columns = ['total_calls', 'sales', 'sale_rate', 'hot_prospects', 'hot_rate',
                           'quoted', 'quote_rate', 'contacted', 'contact_rate', 'avg_call_duration']
    cat_metrics = cat_metrics.sort_values('sale_rate', ascending=False)

    result = []
    for cat in cat_metrics.index:
        c = cat_metrics.loc[cat]
        result.append({
            'call_type': cat,
            'total_calls': int(c['total_calls']),
            'sales': int(c['sales']),
            'sale_rate': round(float(c['sale_rate']) * 100, 2),
            'hot_prospects': int(c['hot_prospects']),
            'hot_rate': round(float(c['hot_rate']) * 100, 2),
            'quoted': int(c['quoted']),
            'quote_rate': round(float(c['quote_rate']) * 100, 2),
            'contacted': int(c['contacted']),
            'contact_rate': round(float(c['contact_rate']) * 100, 2),
            'avg_call_duration': round(float(c['avg_call_duration']), 1)
        })

    return result

def analyze_funnel(data):
    """Analyze the sales funnel"""
    total = len(data)
    contacted = int(data['Is_Contacted'].sum())
    quoted = int(data['Is_Quoted'].sum())
    hot = int(data['Is_Hot'].sum())
    sold = int(data['Is_Sale'].sum())

    return {
        'total_leads': total,
        'contacted': contacted,
        'contacted_rate': round(contacted / total * 100, 2),
        'quoted': quoted,
        'quoted_rate': round(quoted / total * 100, 2),
        'quoted_of_contacted': round(quoted / contacted * 100, 2) if contacted > 0 else 0,
        'hot_prospects': hot,
        'hot_rate': round(hot / total * 100, 2),
        'hot_of_quoted': round(hot / quoted * 100, 2) if quoted > 0 else 0,
        'sold': sold,
        'sold_rate': round(sold / total * 100, 2),
        'sold_of_hot': round(sold / hot * 100, 2) if hot > 0 else 0
    }

def analyze_outcomes(data):
    """Outcome distribution analysis"""
    outcome_counts = data['Outcome'].value_counts()
    total = len(data)

    result = []
    for outcome, count in outcome_counts.items():
        result.append({
            'outcome': outcome,
            'count': int(count),
            'percentage': round(count / total * 100, 2)
        })

    return result

def analyze_lead_quality(data):
    """Analyze lead source quality - answers diagnostic questions about lead validity"""
    total = len(data)

    # Calculate key quality metrics
    no_contact = len(data[data['Outcome'] == 'NO_CONTACT'])
    bad_phone = len(data[data['Outcome'] == 'BAD_PHONE'])
    left_message = len(data[data['Outcome'] == 'LEFT_MESSAGE'])
    not_interested = len(data[data['Outcome'] == 'NOT_INTERESTED'])
    never_requested = len(data[data['Outcome'] == 'NEVER_REQUESTED'])
    bad_lead = len(data[data['Outcome'] == 'BAD_LEAD'])

    # Quality issues by vendor
    vendor_quality = []
    for vendor in data['Vendor Name'].unique():
        v_data = data[data['Vendor Name'] == vendor]
        v_total = len(v_data)
        if v_total < 10:
            continue

        vendor_quality.append({
            'vendor': vendor,
            'total_leads': v_total,
            'bad_phone_rate': round(len(v_data[v_data['Outcome'] == 'BAD_PHONE']) / v_total * 100, 2),
            'no_contact_rate': round(len(v_data[v_data['Outcome'] == 'NO_CONTACT']) / v_total * 100, 2),
            'never_requested_rate': round(len(v_data[v_data['Outcome'] == 'NEVER_REQUESTED']) / v_total * 100, 2),
            'bad_lead_rate': round(len(v_data[v_data['Outcome'] == 'BAD_LEAD']) / v_total * 100, 2),
            'not_interested_rate': round(len(v_data[v_data['Outcome'] == 'NOT_INTERESTED']) / v_total * 100, 2),
        })

    # Sort by total bad rate
    for v in vendor_quality:
        v['total_issue_rate'] = round(v['bad_phone_rate'] + v['never_requested_rate'] + v['bad_lead_rate'], 2)
    vendor_quality = sorted(vendor_quality, key=lambda x: x['total_issue_rate'], reverse=True)

    return {
        'overall': {
            'total_leads': total,
            'unreachable_rate': round((no_contact + bad_phone + left_message) / total * 100, 2),
            'bad_phone_rate': round(bad_phone / total * 100, 2),
            'never_requested_rate': round(never_requested / total * 100, 2),
            'not_interested_rate': round(not_interested / total * 100, 2),
            'bad_lead_rate': round(bad_lead / total * 100, 2),
        },
        'by_vendor': vendor_quality
    }

# Actual vendor lead costs (from Brittney Bealer's agency - Nov 2025)
# SOURCE: data/07_brittney_bealer/ (invoice PDFs converted to CSVs)
#   - alm_leads_detailed.csv: 304 itemized ALM leads
#   - quotewizard_channels.csv: QW Sept + Oct channel breakdown
#   - quotewizard_financial_summary.csv: QW financial summary
#   - invoice_details.md: Complete analysis documentation
#
# Team Roles:
#   Telemarketers: Layne, Maicah (Maicah has longer calls before transfer)
#   LSPs (Licensed): Karina, Amanda, Brandon, Samantha
# Revenue: 9% base commission + up to 11% bonus for auto volume (~$1k avg premium)
# Note: No-contact disposition stays while lead is worked for up to 75 days
# Discontinued vendors: Blue Wave, Lead Clinic Live Transfers
#
# ALM Invoice Analysis (Aug-Nov 2025):
#   - Web leads: 291 @ $8-$27 each (avg ~$19.22) = $5,592
#   - Live transfers: 16 @ $66-$104 each (avg ~$81.50) = $1,304
#   - Total: $6,896 for 307 leads = $22.46 blended avg
#
# QuoteWizard Invoices:
#   Sept 2025: 909 net leads @ $7 avg = $6,393
#   Oct 2025:  1,748 net leads (917 @ $4 + 831 @ $7) = $9,485 ($5.43 blended)
#   Total: $15,878 for 2,657 leads (~$5.98 avg)
#   Credit rate: ~15% (bad leads credited back)
#
# Vendor costs mapped to EXACT names in the data
# Data shows: QuoteWizard-Auto, Imported-for-list-uploads, EverQuote-LCS,
#             Lead-Clinic-Internet, ALM-Internet, Blue-Wave-Live-Call-Transfer,
#             Lead-Clinic-Live-Transfers, Manually-Added-Leads, Referrals
VENDOR_COSTS = {
    # Active vendors (from invoices)
    'QuoteWizard-Auto': 6,              # 35,785 leads - Blended avg ~$6 (Sept $7, Oct $5.43)
    'EverQuote-LCS': 7,                 # 6,303 leads - $7/lead confirmed
    'ALM-Internet': 19,                 # 869 leads - Web leads avg ~$19 ($8-$27 range)

    # Discontinued vendors
    'Blue-Wave-Live-Call-Transfer': 55, # 171 leads - DISCONTINUED
    'Lead-Clinic-Live-Transfers': 60,   # 35 leads - DISCONTINUED ($55 + $5 call center)
    'Lead-Clinic-Internet': 10,         # 4,333 leads - Auto data leads

    # No-cost sources
    'Imported-for-list-uploads': 0,     # 6,366 leads - Old re-engaged leads (already paid ~$7 orig)
    'Manually-Added-Leads': 0,          # 18 leads - Walk-ins/referrals
    'Referrals': 0,                     # 12 leads - Referrals

    # Legacy aliases for fuzzy matching
    'QuoteWizard': 6,
    'EverQuote': 7,
    'ALM': 19,
    'Blue Wave': 55,
    'Lead Clinic': 10,
    'Imported': 0,
}

def get_vendor_cost(vendor_name):
    """Get the cost per lead for a vendor, with fuzzy matching"""
    if pd.isna(vendor_name):
        return 0

    vendor_upper = str(vendor_name).upper()

    # Direct exact match first (handles hyphenated names like "QuoteWizard-Auto")
    if vendor_name in VENDOR_COSTS:
        return VENDOR_COSTS[vendor_name]

    # Direct matches by substring
    for known_vendor, cost in VENDOR_COSTS.items():
        if known_vendor.upper() in vendor_upper or vendor_upper in known_vendor.upper():
            return cost

    # Fuzzy matches for common variations
    if 'BLUE' in vendor_upper and 'WAVE' in vendor_upper:
        return 55
    if 'CLINIC' in vendor_upper and 'LIVE' in vendor_upper:
        return 60  # Lead Clinic Live Transfer
    if 'CLINIC' in vendor_upper:
        return 10  # Lead Clinic internet leads
    if 'WIZARD' in vendor_upper or 'QUOTEWIZARD' in vendor_upper:
        return 6  # Blended avg from invoices
    if 'EVER' in vendor_upper or 'EVERQUOTE' in vendor_upper:
        return 7
    if 'ALM' in vendor_upper:
        return 19  # ALM web leads (default)
    if 'IMPORT' in vendor_upper or 'LIST' in vendor_upper or 'UPLOAD' in vendor_upper:
        return 0  # Already paid for - no current cost
    if 'MANUAL' in vendor_upper or 'REFERRAL' in vendor_upper:
        return 0  # Organic/no cost

    # Default fallback for unknown vendors
    return 10  # Conservative estimate

def analyze_roi_metrics(data, assumed_avg_premium=1000, commission_rate=0.09):
    """Calculate ROI metrics - CPL, CPQ, CPB for each vendor using actual costs

    Brittney Bealer's agency:
    - Avg premium: ~$1,000/policy
    - Commission: 9% base (can unlock +11% with volume)
    """
    roi_data = []
    total_spend_all = 0
    total_leads_all = 0

    for vendor in data['Vendor Name'].unique():
        v_data = data[data['Vendor Name'] == vendor]
        v_total = len(v_data)
        if v_total < 10:
            continue

        contacted = v_data['Is_Contacted'].sum()
        quoted = v_data['Is_Quoted'].sum()
        sold = v_data['Is_Sale'].sum()

        # Get actual cost per lead for this vendor
        cpl = get_vendor_cost(vendor)

        # Calculate costs
        total_spend = v_total * cpl
        total_spend_all += total_spend
        total_leads_all += v_total

        cpq = total_spend / quoted if quoted > 0 else 0
        cpb = total_spend / sold if sold > 0 else 0

        # Estimated revenue (using Brittney's 9% base commission rate)
        estimated_revenue = sold * assumed_avg_premium * commission_rate
        roi = ((estimated_revenue - total_spend) / total_spend * 100) if total_spend > 0 else 0

        roi_data.append({
            'vendor': vendor,
            'total_leads': v_total,
            'total_spend': round(total_spend, 2),
            'sales': int(sold),
            'cpl': cpl,
            'cpq': round(cpq, 2) if cpq > 0 else None,
            'cpb': round(cpb, 2) if cpb > 0 else None,
            'leads_per_sale': round(v_total / sold, 1) if sold > 0 else None,
            'estimated_revenue': round(estimated_revenue, 2),
            'roi_percent': round(roi, 1)
        })

    # Sort by ROI
    roi_data = sorted(roi_data, key=lambda x: x['roi_percent'], reverse=True)

    # Calculate weighted average CPL
    avg_cpl = round(total_spend_all / total_leads_all, 2) if total_leads_all > 0 else 0

    return {
        'vendor_costs': VENDOR_COSTS,
        'avg_cpl': avg_cpl,
        'total_spend': round(total_spend_all, 2),
        'assumed_avg_premium': assumed_avg_premium,
        'by_vendor': roi_data
    }

def analyze_funnel_bottlenecks(data):
    """Identify where leads are being lost in the funnel"""
    total = len(data)

    # Calculate drop-offs at each stage
    contacted = int(data['Is_Contacted'].sum())
    quoted = int(data['Is_Quoted'].sum())
    hot = int(data['Is_Hot'].sum())
    sold = int(data['Is_Sale'].sum())

    # Calculate losses at each stage
    lost_before_contact = total - contacted
    lost_after_contact = contacted - quoted
    lost_after_quote = quoted - hot
    lost_after_hot = hot - sold

    # Reasons for losses
    loss_reasons = {
        'before_contact': {
            'total_lost': lost_before_contact,
            'percentage': round(lost_before_contact / total * 100, 2),
            'breakdown': {
                'no_contact': int(len(data[data['Outcome'] == 'NO_CONTACT'])),
                'bad_phone': int(len(data[data['Outcome'] == 'BAD_PHONE'])),
                'left_message': int(len(data[data['Outcome'] == 'LEFT_MESSAGE'])),
                'dnc': int(len(data[data['Outcome'] == 'DNC'])),
            }
        },
        'after_contact': {
            'total_lost': lost_after_contact,
            'percentage': round(lost_after_contact / total * 100, 2) if total > 0 else 0,
            'breakdown': {
                'not_interested': int(len(data[data['Outcome'] == 'NOT_INTERESTED'])),
                'not_eligible': int(len(data[data['Outcome'] == 'NOT_ELIGIBLE'])),
                'never_requested': int(len(data[data['Outcome'] == 'NEVER_REQUESTED'])),
                'hung_up': int(len(data[data['Outcome'] == 'HUNG_UP'])),
                'already_purchased': int(len(data[data['Outcome'] == 'ALREADY_PURCHASED'])),
            }
        },
        'after_quote': {
            'total_lost': lost_after_quote,
            'percentage': round(lost_after_quote / total * 100, 2) if total > 0 else 0,
            'breakdown': {
                'quoted_not_interested': int(len(data[data['Outcome'] == 'QUOTED_NOT_INTERESTED'])),
            }
        }
    }

    # Conversion rates between stages
    conversion_rates = {
        'lead_to_contact': round(contacted / total * 100, 2) if total > 0 else 0,
        'contact_to_quote': round(quoted / contacted * 100, 2) if contacted > 0 else 0,
        'quote_to_hot': round(hot / quoted * 100, 2) if quoted > 0 else 0,
        'hot_to_sale': round(sold / hot * 100, 2) if hot > 0 else 0,
        'overall_conversion': round(sold / total * 100, 2) if total > 0 else 0,
    }

    return {
        'loss_reasons': loss_reasons,
        'conversion_rates': conversion_rates
    }

def analyze_call_attempts(data):
    """Analyze call patterns and attempt frequency"""
    # Filter out rows with missing phone numbers
    data_filtered = data[data['From'].notna() & (data['From'] != '')]

    if len(data_filtered) == 0:
        return {
            'average_attempts': 0,
            'max_attempts': 0,
            'single_attempt_leads': 0,
            'multiple_attempt_leads': 0,
            'persistence_rate': 0,
            'by_attempt_count': []
        }

    # Group by phone number (From field) to see multiple attempts
    call_counts = data_filtered.groupby('From').size().reset_index(name='attempt_count')

    # Merge back to get outcomes
    data_with_counts = data_filtered.merge(call_counts, on='From', how='left')

    # Analyze success by attempt count
    attempt_analysis = []
    for attempts in sorted(data_with_counts['attempt_count'].dropna().unique()):
        if pd.isna(attempts) or attempts > 10:  # Cap at 10 for display
            continue
        subset = data_with_counts[data_with_counts['attempt_count'] == attempts]
        unique_leads = subset.groupby('From').first()

        attempt_analysis.append({
            'attempts': int(attempts),
            'lead_count': len(unique_leads),
            'sale_rate': round(unique_leads['Is_Sale'].mean() * 100, 2),
            'contact_rate': round(unique_leads['Is_Contacted'].mean() * 100, 2),
        })

    # Calculate average attempts
    avg_attempts = call_counts['attempt_count'].mean()
    max_attempts = int(call_counts['attempt_count'].max())

    # Leads with only 1 attempt vs multiple
    single_attempt = len(call_counts[call_counts['attempt_count'] == 1])
    multiple_attempts = len(call_counts[call_counts['attempt_count'] > 1])
    total_unique = single_attempt + multiple_attempts

    return {
        'average_attempts': round(avg_attempts, 2) if not pd.isna(avg_attempts) else 0,
        'max_attempts': max_attempts,
        'single_attempt_leads': single_attempt,
        'multiple_attempt_leads': multiple_attempts,
        'persistence_rate': round(multiple_attempts / total_unique * 100, 2) if total_unique > 0 else 0,
        'by_attempt_count': attempt_analysis
    }

def analyze_agent_vendor_match(data):
    """Find best agent-vendor combinations"""
    agent_data = data[data['User'].notna() & (data['User'] != '')]

    combos = agent_data.groupby(['User', 'Vendor Name']).agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Contacted': 'mean',
        'Is_Quoted': 'mean'
    }).round(4)

    combos.columns = ['total_calls', 'sales', 'sale_rate', 'contact_rate', 'quote_rate']
    combos = combos.reset_index()

    # Filter to significant combinations
    combos = combos[combos['total_calls'] >= 30]

    result = []
    for _, row in combos.iterrows():
        result.append({
            'agent': row['User'],
            'vendor': row['Vendor Name'],
            'total_calls': int(row['total_calls']),
            'sales': int(row['sales']),
            'sale_rate': round(row['sale_rate'] * 100, 2),
            'contact_rate': round(row['contact_rate'] * 100, 2),
            'quote_rate': round(row['quote_rate'] * 100, 2),
        })

    # Sort by sale rate
    result = sorted(result, key=lambda x: x['sale_rate'], reverse=True)

    return {
        'top_combinations': result[:10],
        'worst_combinations': result[-10:] if len(result) > 10 else [],
        'total_combinations': len(result)
    }

def generate_recommendations(data, vendor_data, agent_data):
    """Generate optimization recommendations"""
    recommendations = []

    # Vendor recommendations
    if vendor_data:
        best_vendor = max(vendor_data, key=lambda x: x['sale_rate'])
        worst_vendor = min(vendor_data, key=lambda x: x['sale_rate'])

        recommendations.append({
            'category': 'Lead Sources',
            'priority': 'high',
            'action': f"Increase budget for {best_vendor['vendor']}",
            'reason': f"Highest sale rate at {best_vendor['sale_rate']}%",
            'impact': 'Improve conversion rate'
        })

        if worst_vendor['sale_rate'] < best_vendor['sale_rate'] * 0.5:
            recommendations.append({
                'category': 'Lead Sources',
                'priority': 'high',
                'action': f"Reduce/eliminate budget for {worst_vendor['vendor']}",
                'reason': f"Lowest sale rate at {worst_vendor['sale_rate']}%",
                'impact': 'Reduce wasted spend'
            })

        # Low contact rate vendors (potential data quality issues)
        low_contact_vendors = [v for v in vendor_data if v['contact_rate'] < 30]
        for v in low_contact_vendors:
            recommendations.append({
                'category': 'Lead Quality',
                'priority': 'high',
                'action': f"Investigate data quality from {v['vendor']}",
                'reason': f"Only {v['contact_rate']}% contact rate (< 30%)",
                'impact': 'Identify and fix lead quality issues'
            })

    # Agent recommendations
    if agent_data:
        significant_agents = [a for a in agent_data if a['total_calls'] >= 100]
        if len(significant_agents) >= 2:
            best_agent = max(significant_agents, key=lambda x: x['sale_rate'])
            worst_agent = min(significant_agents, key=lambda x: x['sale_rate'])
            avg_sale_rate = sum(a['sale_rate'] for a in significant_agents) / len(significant_agents)
            median_calls = sorted([a['total_calls'] for a in significant_agents])[len(significant_agents)//2]

            recommendations.append({
                'category': 'Agent Performance',
                'priority': 'medium',
                'action': f"Have {best_agent['agent']} train other agents",
                'reason': f"Top performer with {best_agent['sale_rate']}% sale rate",
                'impact': 'Improve team performance'
            })

            if worst_agent['sale_rate'] < best_agent['sale_rate'] * 0.5:
                recommendations.append({
                    'category': 'Agent Performance',
                    'priority': 'medium',
                    'action': f"Coaching focus on {worst_agent['agent']}",
                    'reason': f"Below average at {worst_agent['sale_rate']}% sale rate",
                    'impact': 'Close performance gap'
                })

            # High volume but low performance agents (priority for training)
            high_vol_low_perf = [
                a for a in significant_agents
                if a['total_calls'] > median_calls and a['sale_rate'] < avg_sale_rate
            ]
            for agent in high_vol_low_perf[:2]:  # Top 2 priority
                recommendations.append({
                    'category': 'Agent Performance',
                    'priority': 'high',
                    'action': f"Priority training for {agent['agent']}",
                    'reason': f"High volume ({agent['total_calls']} calls) but below avg rate ({agent['sale_rate']}%)",
                    'impact': 'Biggest improvement opportunity'
                })

    # Timing recommendations
    timing = analyze_timing(data)
    if timing['hourly']:
        best_hours = sorted(timing['hourly'], key=lambda x: x['sale_rate'], reverse=True)[:3]
        hours_str = ', '.join([f"{h['hour']}:00" for h in best_hours])
        recommendations.append({
            'category': 'Timing',
            'priority': 'medium',
            'action': f"Schedule more calls during {hours_str}",
            'reason': f"Peak conversion hours (best: {best_hours[0]['sale_rate']}%)",
            'impact': 'Optimize call timing'
        })

    if timing['daily']:
        best_days = sorted(timing['daily'], key=lambda x: x['sale_rate'], reverse=True)[:2]
        days_str = ', '.join([d['day'] for d in best_days])
        recommendations.append({
            'category': 'Timing',
            'priority': 'medium',
            'action': f"Prioritize calling on {days_str}",
            'reason': f"Best conversion days (top: {best_days[0]['sale_rate']}%)",
            'impact': 'Optimize weekly schedule'
        })

    # Call type recommendations
    call_types = analyze_call_types(data)
    if call_types:
        best_call_type = max(call_types, key=lambda x: x['sale_rate'])
        recommendations.append({
            'category': 'Call Strategy',
            'priority': 'medium',
            'action': f"Prioritize '{best_call_type['call_type']}' calls",
            'reason': f"Highest conversion at {best_call_type['sale_rate']}%",
            'impact': 'Optimize call type mix'
        })

    return recommendations

def generate_action_plan(data, vendor_data, agent_data):
    """Generate strategic action plan with projected improvements"""
    total_leads = len(data)
    total_sales = int(data['Is_Sale'].sum())
    overall_sale_rate = round(total_sales / total_leads * 100, 2)

    # Calculate potential improvement
    significant_agents = [a for a in agent_data if a['total_calls'] >= 100] if agent_data else []
    improvement_potential = None
    if len(significant_agents) >= 2:
        best_rate = max(a['sale_rate'] for a in significant_agents)
        avg_rate = sum(a['sale_rate'] for a in significant_agents) / len(significant_agents)
        if avg_rate > 0:
            improvement_potential = round((best_rate - avg_rate) / avg_rate * 100, 1)

    # Get best timing
    timing = analyze_timing(data)
    best_hours = sorted(timing['hourly'], key=lambda x: x['sale_rate'], reverse=True)[:3] if timing['hourly'] else []
    best_days = sorted(timing['daily'], key=lambda x: x['sale_rate'], reverse=True)[:2] if timing['daily'] else []

    # Build timing action string
    if best_hours:
        hours_str = ', '.join([str(h['hour']) + ':00' for h in best_hours])
        timing_action = f"Schedule calls during peak hours: {hours_str}"
    else:
        timing_action = "Analyze timing patterns"

    return {
        'current_state': {
            'total_leads': total_leads,
            'total_sales': total_sales,
            'overall_sale_rate': overall_sale_rate
        },
        'immediate_actions': [
            "Review agent performance and identify coaching needs",
            "Reallocate worst vendor budget to best vendor",
            timing_action
        ],
        'short_term_actions': [
            "Implement lead scoring based on vendor source",
            "Create agent-vendor matching optimization",
            "Set up quality feedback loop with vendors"
        ],
        'ongoing_actions': [
            "Weekly performance reviews by agent and vendor",
            "A/B test new vendors with small budgets first",
            "Track and improve contact rates"
        ],
        'improvement_potential': improvement_potential,
        'best_hours': [h['hour'] for h in best_hours],
        'best_days': [d['day'] for d in best_days]
    }

def analyze_call_duration_outcomes(data):
    """Analyze correlation between call duration and outcomes"""
    # Filter out zero-duration calls (likely disconnects)
    valid_calls = data[data['Call Duration In Seconds'] > 0].copy()

    if len(valid_calls) == 0:
        return {
            'duration_brackets': [],
            'optimal_duration': None,
            'avg_duration_by_outcome': {}
        }

    # Create duration brackets
    brackets = [
        (0, 30, '0-30s'),
        (30, 60, '30-60s'),
        (60, 120, '1-2min'),
        (120, 300, '2-5min'),
        (300, 600, '5-10min'),
        (600, float('inf'), '10min+')
    ]

    bracket_results = []
    for min_sec, max_sec, label in brackets:
        bracket_data = valid_calls[
            (valid_calls['Call Duration In Seconds'] >= min_sec) &
            (valid_calls['Call Duration In Seconds'] < max_sec)
        ]
        if len(bracket_data) > 0:
            bracket_results.append({
                'bracket': label,
                'total_calls': len(bracket_data),
                'sales': int(bracket_data['Is_Sale'].sum()),
                'sale_rate': round(bracket_data['Is_Sale'].mean() * 100, 2),
                'quote_rate': round(bracket_data['Is_Quoted'].mean() * 100, 2),
                'contact_rate': round(bracket_data['Is_Contacted'].mean() * 100, 2)
            })

    # Find optimal duration bracket
    if bracket_results:
        # Filter to brackets with meaningful sample size
        significant_brackets = [b for b in bracket_results if b['total_calls'] >= 100]
        if significant_brackets:
            optimal = max(significant_brackets, key=lambda x: x['sale_rate'])
        else:
            optimal = max(bracket_results, key=lambda x: x['sale_rate'])
    else:
        optimal = None

    # Average duration by outcome
    outcome_durations = {}
    for outcome in ['SOLD', 'QUOTED', 'NOT_INTERESTED', 'NO_CONTACT']:
        outcome_data = valid_calls[valid_calls['Outcome'] == outcome]
        if len(outcome_data) > 0:
            outcome_durations[outcome] = round(outcome_data['Call Duration In Seconds'].mean(), 1)

    return {
        'duration_brackets': bracket_results,
        'optimal_duration': optimal['bracket'] if optimal else None,
        'optimal_sale_rate': optimal['sale_rate'] if optimal else None,
        'avg_duration_by_outcome': outcome_durations
    }

def analyze_weekly_trends(data):
    """Analyze performance trends week over week"""
    # Group by week
    weekly = data.groupby('Week').agg({
        'Full name': 'count',
        'Is_Sale': ['sum', 'mean'],
        'Is_Contacted': 'mean',
        'Is_Quoted': 'mean',
        'Call Duration In Seconds': 'mean'
    }).round(4)

    weekly.columns = ['total_leads', 'sales', 'sale_rate', 'contact_rate', 'quote_rate', 'avg_duration']
    weekly = weekly.reset_index()

    # Calculate week-over-week changes
    results = []
    prev_sale_rate = None
    for _, row in weekly.iterrows():
        week_data = {
            'week': int(row['Week']),
            'total_leads': int(row['total_leads']),
            'sales': int(row['sales']),
            'sale_rate': round(float(row['sale_rate']) * 100, 2),
            'contact_rate': round(float(row['contact_rate']) * 100, 2),
            'quote_rate': round(float(row['quote_rate']) * 100, 2),
            'avg_duration': round(float(row['avg_duration']), 1)
        }

        # Calculate change from previous week
        if prev_sale_rate is not None:
            change = week_data['sale_rate'] - prev_sale_rate
            week_data['sale_rate_change'] = round(change, 2)
        else:
            week_data['sale_rate_change'] = 0

        prev_sale_rate = week_data['sale_rate']
        results.append(week_data)

    # Calculate overall trend
    if len(results) >= 2:
        first_half = results[:len(results)//2]
        second_half = results[len(results)//2:]
        first_avg = sum(w['sale_rate'] for w in first_half) / len(first_half)
        second_avg = sum(w['sale_rate'] for w in second_half) / len(second_half)
        trend = 'improving' if second_avg > first_avg else 'declining' if second_avg < first_avg else 'stable'
        trend_change = round(second_avg - first_avg, 2)
    else:
        trend = 'insufficient_data'
        trend_change = 0

    return {
        'weekly_data': results,
        'trend': trend,
        'trend_change_pct': trend_change,
        'total_weeks': len(results)
    }

def get_industry_benchmarks():
    """Return industry benchmark data for comparison"""
    return {
        'sale_rate': {
            'poor': 0.5,
            'average': 1.0,
            'good': 1.5,
            'excellent': 2.0,
            'description': 'Percentage of leads that become customers'
        },
        'contact_rate': {
            'poor': 30,
            'average': 50,
            'good': 65,
            'excellent': 80,
            'description': 'Percentage of leads successfully reached'
        },
        'quote_rate': {
            'poor': 10,
            'average': 20,
            'good': 30,
            'excellent': 40,
            'description': 'Percentage of leads that receive a quote'
        },
        'cost_per_bind': {
            'excellent': 300,
            'good': 500,
            'average': 800,
            'poor': 1200,
            'description': 'Total cost to acquire one customer'
        },
        'ltv_cac_ratio': {
            'poor': 1.5,
            'average': 3.0,
            'good': 4.0,
            'excellent': 5.0,
            'description': 'Customer lifetime value vs acquisition cost'
        },
        'avg_call_duration_sale': {
            'min': 180,
            'optimal': 420,
            'max': 900,
            'description': 'Typical call duration for successful sales (seconds)'
        },
        'speed_to_lead': {
            'excellent': 5,
            'good': 15,
            'average': 60,
            'poor': 1440,
            'description': 'Minutes from lead submission to first call'
        },
        'call_attempts': {
            'poor': 1,
            'average': 3,
            'good': 6,
            'excellent': 8,
            'description': 'Number of call attempts before giving up'
        }
    }

def generate_data_overview(data):
    """Generate transparent overview of raw data structure and interpretation"""

    # Column definitions with interpretations
    column_info = {
        'Date': {
            'description': 'Timestamp when the call was made',
            'sample_values': data['Date'].head(3).astype(str).tolist(),
            'interpretation': 'Used to analyze timing patterns (hour, day of week) for optimal call scheduling',
            'data_type': 'datetime'
        },
        'Full name': {
            'description': 'Name of the lead (potential customer)',
            'sample_values': ['[REDACTED]', '[REDACTED]', '[REDACTED]'],  # Privacy
            'interpretation': 'Used for record identification only, not in analysis',
            'data_type': 'string'
        },
        'User': {
            'description': 'Sales agent who made the call',
            'sample_values': data['User'].head(3).tolist() if 'User' in data.columns else [],
            'interpretation': 'Grouped to calculate agent-level performance metrics (sale rate, contact rate)',
            'data_type': 'string'
        },
        'Call Duration In Seconds': {
            'description': 'Length of the call in seconds',
            'sample_values': data['Call Duration In Seconds'].head(5).tolist() if 'Call Duration In Seconds' in data.columns else [],
            'interpretation': 'Aggregated per agent to calculate total talk time (hours on phone)',
            'data_type': 'integer'
        },
        'Current Status': {
            'description': 'Final outcome status of the lead',
            'sample_values': data['Current Status'].value_counts().head(5).index.tolist(),
            'interpretation': 'Classified into outcome categories (SOLD, QUOTED, CONTACTED, NO_CONTACT, etc.) to track funnel progression',
            'data_type': 'string'
        },
        'Call Type': {
            'description': 'Type/source of the call',
            'sample_values': data['Call Type'].value_counts().head(5).index.tolist() if 'Call Type' in data.columns else [],
            'interpretation': 'Categorized into Live Transfer, Inbound, Telemarketing, etc. to compare lead source quality',
            'data_type': 'string'
        },
        'Vendor Name': {
            'description': 'Lead vendor/source that provided the lead',
            'sample_values': data['Vendor Name'].value_counts().head(5).index.tolist() if 'Vendor Name' in data.columns else [],
            'interpretation': 'Used to calculate ROI, CPL, and conversion rates per vendor to optimize budget allocation',
            'data_type': 'string'
        }
    }

    # Status classification mapping examples
    status_classification = {
        'SOLD / Customer': {
            'example_statuses': ['4.2 SOLD - AF Customer', '4.0 SOLD', '4.1 SOLD - New Customer'],
            'meaning': 'Lead purchased a policy - counted as a sale',
            'funnel_stage': 'Sale'
        },
        'HOT_PROSPECT': {
            'example_statuses': ['3.5 HOT - Following up', '3.5 HOT'],
            'meaning': 'Highly interested, likely to buy soon',
            'funnel_stage': 'Hot'
        },
        'QUOTED': {
            'example_statuses': ['3.0 QUOTED', '3.1 QUOTED - Thinking About It'],
            'meaning': 'Received a quote but has not decided',
            'funnel_stage': 'Quoted'
        },
        'CONTACTED - Not Interested': {
            'example_statuses': ['2.1 CONTACTED - Not Interested'],
            'meaning': 'Spoke with lead but they declined',
            'funnel_stage': 'Contacted (Lost)'
        },
        'NO_CONTACT': {
            'example_statuses': ['1.0 NO CONTACT', '1.1 CALLED - No Answer'],
            'meaning': 'Could not reach the lead',
            'funnel_stage': 'Lost Before Contact'
        },
        'BAD_PHONE': {
            'example_statuses': ['1.2 CALLED - Bad Phone #'],
            'meaning': 'Phone number invalid or disconnected',
            'funnel_stage': 'Lost Before Contact'
        }
    }

    # Calculated metrics explanation
    calculated_metrics = [
        {
            'metric': 'Is_Contacted',
            'formula': 'Status contains "CONTACTED", "QUOTED", "HOT", "SOLD", or "TRANSFERRED"',
            'purpose': 'Determines if we successfully reached the lead'
        },
        {
            'metric': 'Is_Quoted',
            'formula': 'Status contains "QUOTED", "HOT", or "SOLD"',
            'purpose': 'Determines if lead received a price quote'
        },
        {
            'metric': 'Is_Sale',
            'formula': 'Status contains "SOLD" or "CUSTOMER"',
            'purpose': 'Determines if lead purchased a policy'
        },
        {
            'metric': 'Sale Rate',
            'formula': '(Number of Sales / Total Leads) × 100',
            'purpose': 'Primary performance metric - what % of leads become customers'
        },
        {
            'metric': 'Contact Rate',
            'formula': '(Number Contacted / Total Leads) × 100',
            'purpose': 'Measures lead quality - can we reach them?'
        },
        {
            'metric': 'CPL (Cost Per Lead)',
            'formula': 'Actual cost paid to vendor per lead',
            'purpose': 'Input cost for ROI calculation'
        },
        {
            'metric': 'CPB (Cost Per Bind)',
            'formula': 'Total Spend / Number of Sales',
            'purpose': 'True customer acquisition cost'
        },
        {
            'metric': 'ROI %',
            'formula': '((Estimated Revenue - Total Spend) / Total Spend) × 100',
            'purpose': 'Is this vendor profitable? Above 0% = making money'
        }
    ]

    # Data quality notes
    data_notes = [
        f"Total records loaded: {len(data):,}",
        f"Date range: {data['Date'].min().strftime('%Y-%m-%d')} to {data['Date'].max().strftime('%Y-%m-%d')}",
        f"Unique agents: {data['User'].nunique() if 'User' in data.columns else 'N/A'}",
        f"Unique vendors: {data['Vendor Name'].nunique() if 'Vendor Name' in data.columns else 'N/A'}",
        f"Records with valid status: {data['Current Status'].notna().sum():,} ({data['Current Status'].notna().mean()*100:.1f}%)"
    ]

    return {
        'columns': column_info,
        'status_classification': status_classification,
        'calculated_metrics': calculated_metrics,
        'data_notes': data_notes,
        'methodology_summary': (
            "This analysis interprets call center lead data to measure sales performance. "
            "Each row represents one call to a potential customer. The 'Current Status' field "
            "is classified into outcome categories (SOLD, QUOTED, NO_CONTACT, etc.) to build "
            "a sales funnel. Metrics are calculated by grouping data by agent, vendor, and time "
            "to identify what drives conversions. Vendor costs are applied to calculate true ROI."
        )
    }

def generate_analysis():
    """Generate complete analysis JSON"""
    print("Loading lead data...")
    data = load_data()
    print(f"Loaded {len(data)} records")

    print("Calculating metrics...")
    data = calculate_metrics(data)

    print("Running analysis...")
    vendor_data = analyze_vendors(data)
    agent_data = analyze_agents(data)
    timing_data = analyze_timing(data)
    call_type_data = analyze_call_types(data)
    funnel_data = analyze_funnel(data)
    outcome_data = analyze_outcomes(data)
    recommendations = generate_recommendations(data, vendor_data, agent_data)

    # New diagnostic analyses
    print("Running diagnostic analyses...")
    lead_quality = analyze_lead_quality(data)
    roi_metrics = analyze_roi_metrics(data)
    funnel_bottlenecks = analyze_funnel_bottlenecks(data)
    call_attempts = analyze_call_attempts(data)
    agent_vendor_match = analyze_agent_vendor_match(data)
    action_plan = generate_action_plan(data, vendor_data, agent_data)

    # New enhanced analyses
    print("Running enhanced analyses...")
    call_duration_outcomes = analyze_call_duration_outcomes(data)
    weekly_trends = analyze_weekly_trends(data)
    industry_benchmarks = get_industry_benchmarks()

    # Generate data overview for transparency
    print("Generating data overview...")
    data_overview = generate_data_overview(data)

    # Summary stats
    summary = {
        'total_records': len(data),
        'date_range': {
            'start': data['Date'].min().strftime('%Y-%m-%d'),
            'end': data['Date'].max().strftime('%Y-%m-%d')
        },
        'overall_sale_rate': round(data['Is_Sale'].mean() * 100, 2),
        'overall_contact_rate': round(data['Is_Contacted'].mean() * 100, 2),
        'overall_quote_rate': round(data['Is_Quoted'].mean() * 100, 2),
        'generated_at': datetime.now().isoformat()
    }

    result = {
        'summary': summary,
        'vendors': vendor_data,
        'agents': agent_data,
        'timing': timing_data,
        'call_types': call_type_data,
        'funnel': funnel_data,
        'outcomes': outcome_data,
        'recommendations': recommendations,
        # New diagnostic data
        'diagnostics': {
            'lead_quality': lead_quality,
            'roi_metrics': roi_metrics,
            'funnel_bottlenecks': funnel_bottlenecks,
            'call_attempts': call_attempts,
            'agent_vendor_match': agent_vendor_match,
            'call_duration_outcomes': call_duration_outcomes,
            'weekly_trends': weekly_trends
        },
        'action_plan': action_plan,
        'data_overview': data_overview,
        'industry_benchmarks': industry_benchmarks
    }

    return result

def main():
    """Generate and save analysis JSON"""
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate analysis
    analysis = generate_analysis()

    # Save to file
    output_path = OUTPUT_DIR / "lead_analysis.json"
    with open(output_path, 'w') as f:
        json.dump(analysis, f, indent=2)

    print(f"\nAnalysis saved to: {output_path}")
    print(f"Summary: {analysis['summary']['total_records']} records analyzed")
    print(f"Date range: {analysis['summary']['date_range']['start']} to {analysis['summary']['date_range']['end']}")
    print(f"Overall sale rate: {analysis['summary']['overall_sale_rate']}%")

    return analysis

if __name__ == "__main__":
    main()
