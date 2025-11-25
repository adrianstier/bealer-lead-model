#!/usr/bin/env python3
"""
Extract Real Metrics from Derrick's Data
Properly parse Excel files with header rows and extract actionable insights
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

DATA_DIR = Path("data/04_raw_reports")
BRITTNEY_DIR = Path("data/07_brittney_bealer")


def extract_policy_retention_data():
    """Extract real retention metrics from Policy Growth & Retention report"""

    print("=" * 80)
    print("EXTRACTING RETENTION METRICS")
    print("=" * 80)

    file_path = DATA_DIR / "2025-10_Policy_Growth_Retention_Report.xlsx"

    try:
        # Read Excel, skip header rows
        df = pd.read_excel(file_path, skiprows=6)  # Skip the metadata rows

        print(f"\n✅ Loaded {len(df):,} policies")
        print(f"Columns: {list(df.columns[:15])}")

        # Clean column names
        df.columns = df.columns.str.strip()

        # Key columns for retention analysis
        status_col = 'Status'
        product_col = 'Product Description'
        retention_cols = [c for c in df.columns if 'Retention' in c]

        print(f"\nRetention columns found: {retention_cols}")

        # Analyze policy status
        if status_col in df.columns:
            print(f"\n📊 POLICY STATUS DISTRIBUTION:")
            status_counts = df[status_col].value_counts()
            total_policies = len(df)

            for status, count in status_counts.head(10).items():
                pct = count / total_policies * 100
                print(f"   {status:<30} {count:>6,} ({pct:>5.1f}%)")

            # Calculate retention metrics
            active_statuses = ['Active', 'Pending Renewal']
            active_policies = df[df[status_col].isin(active_statuses)]

            print(f"\n✅ ACTIVE POLICIES: {len(active_policies):,} / {total_policies:,} = {len(active_policies)/total_policies:.1%}")

        # Analyze by product
        if product_col in df.columns:
            print(f"\n📦 PRODUCT MIX:")
            product_counts = df[product_col].value_counts()

            for product, count in product_counts.head(15).items():
                pct = count / total_policies * 100
                print(f"   {product:<40} {count:>5,} ({pct:>4.1f}%)")

        # Extract retention numerator/denominator if available
        for col in retention_cols:
            if col in df.columns:
                retention_sum = df[col].sum()
                print(f"\n   {col}: {retention_sum:,.0f}")

        return df

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def extract_renewal_audit_data():
    """Extract renewal patterns and retention from Renewal Audit"""

    print("\n" + "=" * 80)
    print("EXTRACTING RENEWAL AUDIT DATA")
    print("=" * 80)

    file_path = DATA_DIR / "Renewal_Audit_Report.xlsx"

    try:
        # Read Excel, skip header rows
        df = pd.read_excel(file_path, skiprows=3)

        print(f"\n✅ Loaded {len(df):,} renewals")

        # Clean column names
        df.columns = df.columns.str.strip()

        print(f"Columns: {list(df.columns[:20])}")

        # Key columns
        status_col = 'Renewal Status'
        product_col = 'Product Name'
        premium_new_col = 'Premium New($)'
        premium_old_col = 'Premium Old($)'
        premium_change_col = 'Premium Change(%)'

        # Analyze renewal status
        if status_col in df.columns:
            print(f"\n📊 RENEWAL STATUS:")
            status_counts = df[status_col].value_counts()
            total_renewals = len(df)

            for status, count in status_counts.items():
                pct = count / total_renewals * 100
                print(f"   {status:<30} {count:>5,} ({pct:>5.1f}%)")

            # Calculate retention rate
            renewed = df[df[status_col].str.contains('Renewed', case=False, na=False)]
            retention_rate = len(renewed) / total_renewals
            print(f"\n✅ RENEWAL RETENTION RATE: {retention_rate:.1%}")

        # Analyze premium changes (rate increases)
        if premium_change_col in df.columns:
            premium_changes = df[premium_change_col].dropna()

            print(f"\n💰 PREMIUM CHANGES (Rate Increases):")
            print(f"   Average Change: {premium_changes.mean():.1f}%")
            print(f"   Median Change: {premium_changes.median():.1f}%")
            print(f"   Max Increase: {premium_changes.max():.1f}%")
            print(f"   Max Decrease: {premium_changes.min():.1f}%")

            # Distribution
            print(f"\n   Distribution:")
            print(f"      >20% increase: {(premium_changes > 20).sum()} policies")
            print(f"      10-20% increase: {((premium_changes >= 10) & (premium_changes <= 20)).sum()} policies")
            print(f"      0-10% increase: {((premium_changes >= 0) & (premium_changes < 10)).sum()} policies")
            print(f"      Decrease: {(premium_changes < 0).sum()} policies")

        # Analyze by product
        if product_col in df.columns:
            print(f"\n📦 RENEWALS BY PRODUCT:")
            product_counts = df[product_col].value_counts()

            for product, count in product_counts.head(10).items():
                pct = count / total_renewals * 100
                print(f"   {product:<35} {count:>4,} ({pct:>4.1f}%)")

        return df

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def extract_customer_segmentation():
    """Extract customer portfolio and segment by value"""

    print("\n" + "=" * 80)
    print("EXTRACTING CUSTOMER SEGMENTATION")
    print("=" * 80)

    file_path = DATA_DIR / "2025-10_Policy_Growth_Retention_Report.xlsx"

    try:
        # Use policy data to segment customers
        df = pd.read_excel(file_path, skiprows=6)
        df.columns = df.columns.str.strip()

        # Group by customer (Insured Name)
        customer_col = 'Insured Name'

        if customer_col in df.columns:
            # Count products per customer
            customer_products = df.groupby(customer_col).size()

            print(f"\n✅ CUSTOMER ANALYSIS:")
            print(f"   Total Unique Customers: {len(customer_products):,}")
            print(f"   Total Policies: {len(df):,}")
            print(f"   Average Products/Customer: {customer_products.mean():.2f}")
            print(f"   Median Products/Customer: {customer_products.median():.0f}")

            # Segment customers
            elite = customer_products[customer_products >= 3]
            premium = customer_products[customer_products == 2]
            standard = customer_products[customer_products == 1]

            total_customers = len(customer_products)

            print(f"\n📊 CUSTOMER SEGMENTATION:")
            print(f"   Elite (3+ products):     {len(elite):>4,} customers ({len(elite)/total_customers:>5.1%})")
            print(f"   Premium (2 products):    {len(premium):>4,} customers ({len(premium)/total_customers:>5.1%})")
            print(f"   Standard (1 product):    {len(standard):>4,} customers ({len(standard)/total_customers:>5.1%})")

            # Products per customer distribution
            print(f"\n   Products Per Customer Distribution:")
            for n_products in sorted(customer_products.value_counts().index[:10]):
                count = (customer_products == n_products).sum()
                pct = count / total_customers * 100
                print(f"      {n_products} products: {count:>4,} customers ({pct:>4.1f}%)")

            return {
                'total_customers': total_customers,
                'elite': len(elite),
                'premium': len(premium),
                'standard': len(standard),
                'products_per_customer': customer_products
            }

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def extract_new_business_metrics():
    """Extract new business data"""

    print("\n" + "=" * 80)
    print("EXTRACTING NEW BUSINESS METRICS")
    print("=" * 80)

    file_path = BRITTNEY_DIR / "New Business Details_1764017841226.xlsx"

    try:
        # Read Excel, skip header rows
        df = pd.read_excel(file_path, skiprows=3)

        print(f"\n✅ Loaded {len(df):,} new business transactions")

        # Clean column names
        df.columns = df.columns.str.strip()

        print(f"Columns: {list(df.columns)}")

        # Analyze by product
        product_col = 'Product'
        if product_col in df.columns:
            print(f"\n📦 NEW BUSINESS BY PRODUCT:")
            product_counts = df[product_col].value_counts()

            for product, count in product_counts.items():
                pct = count / len(df) * 100
                print(f"   {product:<30} {count:>4,} ({pct:>5.1f}%)")

        # Analyze transaction types
        trans_col = 'Transaction Type'
        if trans_col in df.columns:
            print(f"\n📝 TRANSACTION TYPES:")
            trans_counts = df[trans_col].value_counts()

            for trans, count in trans_counts.items():
                pct = count / len(df) * 100
                print(f"   {trans:<30} {count:>4,} ({pct:>5.1f}%)")

        # Item count (products per transaction)
        item_col = 'Item Count'
        if item_col in df.columns:
            print(f"\n🔢 ITEMS PER TRANSACTION:")
            print(f"   Average: {df[item_col].mean():.2f}")
            print(f"   Median: {df[item_col].median():.0f}")

            item_dist = df[item_col].value_counts().sort_index()
            for items, count in item_dist.items():
                pct = count / len(df) * 100
                print(f"      {items} items: {count:>4,} transactions ({pct:>5.1f}%)")

        return df

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def generate_final_summary():
    """Generate comprehensive summary with real data"""

    print("\n\n" + "=" * 80)
    print("COMPREHENSIVE ANALYSIS SUMMARY")
    print("=" * 80)

    # Extract all metrics
    retention_data = extract_policy_retention_data()
    renewal_data = extract_renewal_audit_data()
    segmentation = extract_customer_segmentation()
    new_biz_data = extract_new_business_metrics()

    # Generate actionable insights
    print("\n\n" + "=" * 80)
    print("KEY INSIGHTS & RECOMMENDATIONS")
    print("=" * 80)

    insights = []

    # 1. Retention insights
    if renewal_data is not None and 'Renewal Status' in renewal_data.columns:
        renewed = renewal_data[renewal_data['Renewal Status'].str.contains('Renewed', case=False, na=False)]
        retention_rate = len(renewed) / len(renewal_data)
        insights.append(f"✅ Current renewal retention rate: {retention_rate:.1%}")

        if retention_rate < 0.85:
            insights.append(f"⚠️  Retention below 85% target - implement churn prediction model")

    # 2. Rate increase insights
    if renewal_data is not None and 'Premium Change(%)' in renewal_data.columns:
        avg_rate_increase = renewal_data['Premium Change(%)'].mean()
        insights.append(f"📈 Average rate increase: {avg_rate_increase:.1f}%")

        if avg_rate_increase > 10:
            insights.append(f"⚠️  High rate increases ({avg_rate_increase:.1f}%) driving churn risk")

    # 3. Segmentation insights
    if segmentation:
        elite_pct = segmentation['elite'] / segmentation['total_customers'] * 100
        premium_pct = segmentation['premium'] / segmentation['total_customers'] * 100

        insights.append(f"👥 Customer Segmentation: {elite_pct:.1f}% Elite, {premium_pct:.1f}% Premium")

        if elite_pct + premium_pct < 40:
            insights.append(f"💡 Only {elite_pct + premium_pct:.0f}% top-tier customers - focus on cross-sell/upsell")

    # Print insights
    print("\n📊 INSIGHTS:")
    for i, insight in enumerate(insights, 1):
        print(f"   {i}. {insight}")

    # Recommendations
    print("\n\n💡 RECOMMENDATIONS FOR PHASE 1 MODEL UPDATES:")
    print("   1. Use actual retention rate in models (vs 85% assumption)")
    print("   2. Use actual rate increase data (vs 8% assumption)")
    print("   3. Use actual customer segmentation distribution")
    print("   4. Build churn prediction model with renewal audit data")
    print("   5. Implement cross-sell timing based on new business patterns")

    return {
        'retention_data': retention_data,
        'renewal_data': renewal_data,
        'segmentation': segmentation,
        'new_biz_data': new_biz_data,
        'insights': insights
    }


if __name__ == "__main__":
    summary = generate_final_summary()
