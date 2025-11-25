#!/usr/bin/env python3
"""
Parse Derrick's Actual Data
Extract real metrics: loss ratios, commission timing, customer segmentation, etc.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Data directory
DATA_DIR = Path("data/04_raw_reports")
BRITTNEY_DIR = Path("data/07_brittney_bealer")


def parse_claims_data():
    """Parse claims detail report for loss ratios"""

    print("=" * 80)
    print("PARSING CLAIMS DATA")
    print("=" * 80)

    # Try both claims files
    claims_files = [
        DATA_DIR / "2025-10_Claims_Detail_Report.xlsx",
        DATA_DIR / "24MM Adjusted Paid Loss Detail Report_All_Oct-2025.xlsx"
    ]

    for claims_file in claims_files:
        if not claims_file.exists():
            continue

        print(f"\n📄 Reading: {claims_file.name}")

        try:
            # Read Excel file
            df = pd.read_excel(claims_file, sheet_name=0)

            print(f"   Rows: {len(df)}")
            print(f"   Columns: {list(df.columns[:10])}")

            # Display first few rows
            print(f"\n   First 5 rows:")
            print(df.head().to_string())

            # Try to identify key columns
            col_lower = [c.lower() for c in df.columns]

            # Look for premium and claims columns
            premium_cols = [c for c in df.columns if any(x in c.lower() for x in ['premium', 'prem', 'written'])]
            claims_cols = [c for c in df.columns if any(x in c.lower() for x in ['claim', 'loss', 'paid', 'incurred'])]
            policy_cols = [c for c in df.columns if any(x in c.lower() for x in ['policy', 'type', 'product', 'line'])]

            print(f"\n   Potential premium columns: {premium_cols}")
            print(f"   Potential claims columns: {claims_cols}")
            print(f"   Potential policy type columns: {policy_cols}")

            # Calculate basic stats if we have numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                print(f"\n   Numeric column totals:")
                for col in numeric_cols[:5]:
                    total = df[col].sum()
                    print(f"      {col}: ${total:,.2f}" if total > 0 else f"      {col}: {total}")

        except Exception as e:
            print(f"   ❌ Error reading {claims_file.name}: {e}")

    return None


def parse_all_purpose_audit():
    """Parse All Purpose Audit for customer portfolio"""

    print("\n" + "=" * 80)
    print("PARSING ALL PURPOSE AUDIT (Customer Portfolio)")
    print("=" * 80)

    audit_file = DATA_DIR / "All_Purpose_Audit.xlsx"

    if not audit_file.exists():
        print(f"❌ File not found: {audit_file}")
        return None

    print(f"\n📄 Reading: {audit_file.name}")

    try:
        # Read Excel file
        df = pd.read_excel(audit_file, sheet_name=0)

        print(f"   Rows: {len(df):,}")
        print(f"   Columns ({len(df.columns)}): {list(df.columns[:15])}")

        # Display sample
        print(f"\n   Sample rows:")
        print(df.head(3).to_string())

        # Try to identify customer count and product mix
        print(f"\n   ANALYSIS:")

        # Unique customers
        customer_cols = [c for c in df.columns if any(x in c.lower() for x in ['customer', 'insured', 'name', 'account'])]
        if customer_cols:
            unique_customers = df[customer_cols[0]].nunique()
            print(f"   Unique Customers: {unique_customers:,}")

        # Product type analysis
        product_cols = [c for c in df.columns if any(x in c.lower() for x in ['product', 'policy', 'type', 'line'])]
        if product_cols:
            print(f"\n   Product Distribution:")
            for col in product_cols[:2]:
                if col in df.columns:
                    print(f"\n   {col}:")
                    print(df[col].value_counts().head(10))

        # Premium analysis
        premium_cols = [c for c in df.columns if any(x in c.lower() for x in ['premium', 'prem', 'amount'])]
        if premium_cols:
            print(f"\n   Premium Analysis:")
            for col in premium_cols[:2]:
                if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                    print(f"   {col}:")
                    print(f"      Total: ${df[col].sum():,.2f}")
                    print(f"      Average: ${df[col].mean():,.2f}")
                    print(f"      Median: ${df[col].median():,.2f}")

        # Count products per customer if possible
        if customer_cols and len(df) > 0:
            customer_col = customer_cols[0]
            products_per_customer = df.groupby(customer_col).size()
            print(f"\n   Products Per Customer:")
            print(f"      Average: {products_per_customer.mean():.2f}")
            print(f"      Median: {products_per_customer.median():.0f}")
            print(f"\n   Distribution:")
            print(products_per_customer.value_counts().sort_index().head(10))

        return df

    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


def parse_business_metrics():
    """Parse business metrics for commission timing and other details"""

    print("\n" + "=" * 80)
    print("PARSING BUSINESS METRICS")
    print("=" * 80)

    metrics_file = DATA_DIR / "2025-11-14_Business_Metrics.xlsx"

    if not metrics_file.exists():
        print(f"❌ File not found: {metrics_file}")
        return None

    print(f"\n📄 Reading: {metrics_file.name}")

    try:
        # Try to read all sheets
        excel_file = pd.ExcelFile(metrics_file)
        print(f"   Sheets: {excel_file.sheet_names}")

        for sheet_name in excel_file.sheet_names:
            print(f"\n   📊 Sheet: {sheet_name}")
            df = pd.read_excel(metrics_file, sheet_name=sheet_name)
            print(f"      Rows: {len(df)}, Columns: {len(df.columns)}")
            print(f"      Columns: {list(df.columns)}")
            print(f"\n      Sample:")
            print(df.head().to_string())

        return df

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None


def parse_policy_growth_retention():
    """Parse policy growth and retention report"""

    print("\n" + "=" * 80)
    print("PARSING POLICY GROWTH & RETENTION")
    print("=" * 80)

    report_file = DATA_DIR / "2025-10_Policy_Growth_Retention_Report.xlsx"

    if not report_file.exists():
        print(f"❌ File not found: {report_file}")
        return None

    print(f"\n📄 Reading: {report_file.name}")

    try:
        df = pd.read_excel(report_file, sheet_name=0)

        print(f"   Rows: {len(df):,}")
        print(f"   Columns: {list(df.columns)}")

        # Display sample
        print(f"\n   Sample rows:")
        print(df.head(10).to_string())

        # Look for retention metrics
        retention_cols = [c for c in df.columns if any(x in c.lower() for x in ['retention', 'lapse', 'cancel', 'renewal'])]
        if retention_cols:
            print(f"\n   Retention-related columns: {retention_cols}")

        # Look for growth metrics
        growth_cols = [c for c in df.columns if any(x in c.lower() for x in ['growth', 'new', 'net'])]
        if growth_cols:
            print(f"   Growth-related columns: {growth_cols}")

        return df

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None


def parse_renewal_audit():
    """Parse renewal audit report"""

    print("\n" + "=" * 80)
    print("PARSING RENEWAL AUDIT")
    print("=" * 80)

    renewal_file = DATA_DIR / "Renewal_Audit_Report.xlsx"

    if not renewal_file.exists():
        print(f"❌ File not found: {renewal_file}")
        return None

    print(f"\n📄 Reading: {renewal_file.name}")

    try:
        df = pd.read_excel(renewal_file, sheet_name=0)

        print(f"   Rows: {len(df):,}")
        print(f"   Columns: {list(df.columns)}")

        # Display sample
        print(f"\n   Sample rows:")
        print(df.head(5).to_string())

        # Analyze renewal patterns
        print(f"\n   RENEWAL ANALYSIS:")

        # Count by status if available
        status_cols = [c for c in df.columns if any(x in c.lower() for x in ['status', 'result', 'outcome'])]
        if status_cols:
            print(f"\n   Renewal Status:")
            print(df[status_cols[0]].value_counts())

        return df

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None


def parse_new_business_details():
    """Parse new business details from Brittney's folder"""

    print("\n" + "=" * 80)
    print("PARSING NEW BUSINESS DETAILS")
    print("=" * 80)

    nb_file = BRITTNEY_DIR / "New Business Details_1764017841226.xlsx"

    if not nb_file.exists():
        print(f"❌ File not found: {nb_file}")
        return None

    print(f"\n📄 Reading: {nb_file.name}")

    try:
        df = pd.read_excel(nb_file, sheet_name=0)

        print(f"   Rows: {len(df):,}")
        print(f"   Columns: {list(df.columns)}")

        # Display sample
        print(f"\n   Sample rows:")
        print(df.head(5).to_string())

        # Analyze new business patterns
        print(f"\n   NEW BUSINESS ANALYSIS:")

        # Premium analysis
        premium_cols = [c for c in df.columns if any(x in c.lower() for x in ['premium', 'prem', 'amount'])]
        if premium_cols:
            for col in premium_cols[:2]:
                if pd.api.types.is_numeric_dtype(df[col]):
                    print(f"\n   {col}:")
                    print(f"      Total: ${df[col].sum():,.2f}")
                    print(f"      Average: ${df[col].mean():,.2f}")
                    print(f"      Count: {len(df[df[col] > 0])}")

        # Product type
        product_cols = [c for c in df.columns if any(x in c.lower() for x in ['product', 'policy', 'type'])]
        if product_cols:
            print(f"\n   Product Types:")
            print(df[product_cols[0]].value_counts())

        return df

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None


def generate_summary_report():
    """Generate comprehensive summary of all parsed data"""

    print("\n\n" + "=" * 80)
    print("COMPREHENSIVE DATA SUMMARY")
    print("=" * 80)

    summary = {
        "files_analyzed": [],
        "key_metrics": {},
        "data_quality": {},
        "recommendations": []
    }

    # Parse all files
    claims_data = parse_claims_data()
    audit_data = parse_all_purpose_audit()
    metrics_data = parse_business_metrics()
    growth_data = parse_policy_growth_retention()
    renewal_data = parse_renewal_audit()
    new_biz_data = parse_new_business_details()

    # Generate summary
    print("\n\n" + "=" * 80)
    print("SUMMARY & RECOMMENDATIONS")
    print("=" * 80)

    print("\n✅ FILES SUCCESSFULLY PARSED:")
    if audit_data is not None:
        print(f"   • All Purpose Audit: {len(audit_data):,} rows")
    if growth_data is not None:
        print(f"   • Policy Growth & Retention: {len(growth_data):,} rows")
    if renewal_data is not None:
        print(f"   • Renewal Audit: {len(renewal_data):,} rows")
    if new_biz_data is not None:
        print(f"   • New Business Details: {len(new_biz_data):,} rows")

    print("\n📊 NEXT STEPS:")
    print("   1. Extract loss ratios from claims data")
    print("   2. Segment customers from All Purpose Audit (Elite/Premium/Standard/Low-Value)")
    print("   3. Calculate actual retention rates from renewal data")
    print("   4. Analyze new business conversion patterns")
    print("   5. Update Phase 1 models with actual data")

    return summary


if __name__ == "__main__":
    summary = generate_summary_report()
