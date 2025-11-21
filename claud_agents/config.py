"""
Repository-Aware Configuration for Derrick Bealer Agency AI Agents
This configuration maps directly to the repository's actual data structures and paths.
"""

from pathlib import Path
from typing import Dict, List, Any

# Repository root
REPO_ROOT = Path(__file__).parent.parent

# =============================================================================
# DATA PATHS - Mapped to actual repository structure
# =============================================================================

DATA_PATHS = {
    "root": REPO_ROOT / "data",

    # Lead data (54,338 records across 6 files)
    "lead_data": REPO_ROOT / "data" / "06_lead_data",
    "lead_files": [
        "ch-1-250922-251117.csv",
        "ch-1-250922-251117 2.csv",
        "ch-1-250922-251117 3.csv",
        "ch-1-250922-251117 4.csv",
        "ch-1-250922-251117 5.csv",
        "ch-1-250922-251117 6.csv",
    ],

    # Current performance data
    "performance": REPO_ROOT / "data" / "01_current_performance",

    # Strategic research & benchmarks
    "research": REPO_ROOT / "data" / "02_strategic_research",

    # Implementation frameworks
    "frameworks": REPO_ROOT / "data" / "03_implementation_frameworks",

    # Raw Excel reports
    "raw_reports": REPO_ROOT / "data" / "04_raw_reports",

    # Analysis-ready CSVs
    "analysis_ready": REPO_ROOT / "data" / "05_analysis_ready",

    # Background info
    "background": REPO_ROOT / "data" / "background-info",
}

# =============================================================================
# LEAD DATA SCHEMA - Based on actual CSV structure
# =============================================================================

LEAD_DATA_SCHEMA = {
    "columns": {
        "Date": "timestamp",
        "Full name": "customer_name",
        "User": "agent_name",
        "From": "caller_phone",
        "To": "recipient_phone",
        "Call Duration": "duration_display",
        "Call Duration In Seconds": "duration_seconds",
        "Current Status": "status",
        "Call Type": "call_type",
        "Call Status": "call_status",
        "Vendor Name": "vendor",
        "Team": "team",
    },

    # Status codes from the data (X.X pattern)
    "status_codes": {
        "1.0": "CALLED - No Contact",
        "1.2": "CALLED - Bad Phone #",
        "2.0": "CONTACTED - Follow Up",
        "3.0": "QUOTED - Follow Up",
        "3.2": "QUOTED - Not Interested",
        "4.0": "SOLD",
        "5.0": "X-DATE",
    },

    # Vendors found in data
    "vendors": [
        "QuoteWizard-Auto",
        "QuoteWizard-Home",
        "MediaAlpha",
        "Datalot",
        "EverQuote",
    ],

    # Call types
    "call_types": {
        "Live-Q": "live_queue",
        "T.2 Telemarketing - Day 2 - 7 - Cam-Q": "telemarketing_early",
        "T.4 Telemarketing - Day 21 - 45 - Cam-Q": "telemarketing_late",
    },
}

# =============================================================================
# ANALYSIS-READY DATA FILES - Pre-cleaned CSVs
# =============================================================================

ANALYSIS_FILES = {
    "bonus_structure": "bonus_structure_reference.csv",
    "cross_sell": "cross_sell_opportunities.csv",
    "key_metrics": "key_metrics_summary.csv",
    "lead_vendors": "lead_generation_vendors.csv",
    "operational_benchmarks": "operational_benchmarks.csv",
    "product_economics": "product_economics.csv",
    "market_analysis": "santa_barbara_market_analysis.csv",
}

# =============================================================================
# COMPENSATION STRUCTURE - 2025 Allstate Santa Barbara
# =============================================================================

COMPENSATION_CONFIG = {
    # Policy Bundle Rate tiers
    "pbr_tiers": [
        {"min": 0.00, "max": 0.40, "bonus_pct": 0.00},
        {"min": 0.40, "max": 0.45, "bonus_pct": 0.50},
        {"min": 0.45, "max": 0.50, "bonus_pct": 0.75},
        {"min": 0.50, "max": 1.00, "bonus_pct": 1.00},
    ],

    # Portfolio Growth tiers (8 tiers)
    "pg_tiers": [
        {"name": "Below Minimum", "items_min": -877, "items_max": 0, "payout": 0},
        {"name": "Tier 1", "items_min": 1, "items_max": 207, "payout": 500},
        {"name": "Tier 2", "items_min": 208, "items_max": 414, "payout": 1000},
        {"name": "Tier 3", "items_min": 415, "items_max": 621, "payout": 2000},
        {"name": "Tier 4", "items_min": 622, "items_max": 828, "payout": 3500},
        {"name": "Tier 5", "items_min": 829, "items_max": 1035, "payout": 5500},
        {"name": "Tier 6", "items_min": 1036, "items_max": 1242, "payout": 8000},
        {"name": "Tier 7", "items_min": 1243, "items_max": 1656, "payout": 12000},
    ],

    # New Business Variable Comp rates
    "nb_variable_comp": {
        "auto": 0.16,     # 16%
        "home": 0.20,     # 20%
        "umbrella": 0.18, # 18%
        "fire": 0.22,     # 22%
        "life": 0.25,     # 25%
    },

    # Bigger Bundle Bonus
    "bigger_bundle_bonus": 50,  # $50 per 3rd+ line

    # Current agency metrics (targets)
    "targets": {
        "pbr": 0.40,           # 40% bundle rate
        "pg_items": 200,       # Positive growth
        "ltv_cac_ratio": 4.0,  # 4:1
        "ebitda_margin": 0.25, # 25-30%
    },

    # Current status
    "current": {
        "pbr": 0.385,          # 38.5%
        "pg_items": -200,      # Negative
    },
}

# =============================================================================
# AGENT CONFIGURATION
# =============================================================================

AGENT_CONFIG = {
    # Lead Scoring Agent
    "lead_scoring": {
        "priority_thresholds": {
            "high": 70,
            "medium": 40,
            "low": 0,
        },
        "score_weights": {
            "status_progression": 0.30,   # How far through funnel
            "call_duration": 0.20,        # Engagement level
            "vendor_performance": 0.15,   # Vendor history
            "time_of_day": 0.10,          # Optimal contact times
            "agent_performance": 0.15,    # Agent success rate
            "recency": 0.10,              # How recent the lead
        },
        "model_path": REPO_ROOT / "models" / "lead_scoring_v1.pkl",
    },

    # Cancellation Watch Agent
    "cancellation_watch": {
        "saveability_thresholds": {
            "high": 60,
            "medium": 40,
            "low": 0,
        },
        "reason_scores": {
            "non_payment": 70,
            "rate_increase": 60,
            "shopping": 50,
            "coverage_change": 40,
            "moving": 30,
        },
        "tenure_bonus": {
            "24_months": 15,
            "12_months": 10,
        },
        "bundled_bonus": 20,
    },

    # Invoice Automation Agent
    "invoice_automation": {
        "paper_customer_criteria": {
            "min_age": 65,
            "check_payment": True,
            "low_digital_engagement": 20,
        },
        "mail_service": "lob",  # Lob API for physical mail
        "days_before_due": 5,   # Mail arrives 5 days before due
    },

    # Concierge Agent (Newsletter)
    "concierge": {
        "newsletter_frequency": "monthly",
        "personalization_fields": [
            "customer_name",
            "policy_types",
            "tenure_years",
            "santa_barbara_local",
        ],
        "content_types": [
            "local_events",
            "insurance_tips",
            "policy_summary",
            "seasonal_reminders",
            "agency_updates",
        ],
    },

    # Social Media Agent
    "social_media": {
        "platforms": ["meta", "nextdoor", "youtube"],
        "audience_types": {
            "best_customers": {
                "min_tenure_months": 24,
                "is_bundled": True,
                "min_policies": 2,
            },
            "recent_converters": {
                "max_days_since_conversion": 90,
            },
            "high_referral": {
                "min_referrals": 1,
            },
        },
        "default_budget": 2000,
        "default_duration_days": 14,
    },

    # Monitor Agent
    "monitor": {
        "metrics_to_track": [
            "lead_conversion_rate",
            "cancellation_save_rate",
            "newsletter_open_rate",
            "cost_per_lead",
            "manual_hours_saved",
            "pbr_progress",
            "pg_progress",
        ],
        "alert_thresholds": {
            "lead_conversion_rate": 0.20,  # Alert if below 20%
            "cancellation_save_rate": 0.50,  # Alert if below 50%
        },
    },
}

# =============================================================================
# PRD SUCCESS METRICS - Project targets
# =============================================================================

SUCCESS_METRICS = {
    "primary": {
        "lead_conversion_improvement": {"target": 0.25, "unit": "percentage"},
        "cancellation_reduction": {"target": 0.15, "unit": "percentage"},
        "bundling_rate_increase": {"target": 0.25, "unit": "percentage"},
        "manual_hours_saved": {"target": 20, "unit": "hours_per_week"},
        "variable_comp_tier_advancement": {"target": 2, "unit": "tiers"},
    },
    "secondary": {
        "lead_scoring_accuracy": {"target": 0.80, "unit": "percentage"},
        "newsletter_engagement": {"target": 0.30, "unit": "open_rate"},
        "save_success_rate": {"target": 0.25, "unit": "improvement"},
        "cost_per_lead_reduction": {"target": 0.20, "unit": "percentage"},
    },
}

# =============================================================================
# EXTERNAL SERVICE CONFIGURATION
# =============================================================================

EXTERNAL_SERVICES = {
    "email": {
        "provider": "sendgrid",
        "from_email": "noreply@allstatesb.com",
        "from_name": "Derrick Bealer - Allstate Santa Barbara",
    },
    "sms": {
        "provider": "twilio",
        "from_phone": "+18055550100",
    },
    "mail": {
        "provider": "lob",
        "return_address": {
            "name": "Derrick Bealer - Allstate",
            "address_line1": "Santa Barbara Agency",
            "city": "Santa Barbara",
            "state": "CA",
            "zip": "93101",
        },
    },
    "social": {
        "provider": "meta",
        "platforms": ["facebook", "instagram"],
    },
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_lead_data_paths() -> List[Path]:
    """Get all lead data file paths"""
    lead_dir = DATA_PATHS["lead_data"]
    return [lead_dir / f for f in DATA_PATHS["lead_files"]]


def get_analysis_file(name: str) -> Path:
    """Get path to analysis-ready file"""
    return DATA_PATHS["analysis_ready"] / ANALYSIS_FILES.get(name, name)


def get_compensation_tier(metric: str, value: float) -> Dict[str, Any]:
    """Get compensation tier for a given metric value"""
    if metric == "pbr":
        for tier in COMPENSATION_CONFIG["pbr_tiers"]:
            if tier["min"] <= value < tier["max"]:
                return tier
    elif metric == "pg":
        for tier in COMPENSATION_CONFIG["pg_tiers"]:
            if tier["items_min"] <= value <= tier["items_max"]:
                return tier
    return {}


def get_lead_status_category(status: str) -> str:
    """Categorize lead status into funnel stage"""
    if not status:
        return "unknown"

    code = status.split()[0] if status else ""

    if code.startswith("1"):
        return "called"
    elif code.startswith("2"):
        return "contacted"
    elif code.startswith("3"):
        return "quoted"
    elif code.startswith("4"):
        return "sold"
    elif code.startswith("5"):
        return "x_date"
    else:
        return "other"


# =============================================================================
# WORKFLOW DEFINITIONS
# =============================================================================

WORKFLOWS = {
    "daily_morning": {
        "description": "Daily morning routine for lead processing",
        "steps": [
            "check_system_health",
            "process_overnight_leads",
            "analyze_cancellations",
            "review_metrics",
        ],
    },
    "end_of_month": {
        "description": "End-of-month comprehensive workflow",
        "steps": [
            "generate_invoices",
            "send_newsletters",
            "generate_reports",
            "plan_campaigns",
        ],
    },
    "emergency_cancellation": {
        "description": "Emergency response to cancellation spike",
        "steps": [
            "immediate_analysis",
            "generate_save_scripts",
            "alert_team",
            "update_dashboard",
        ],
    },
    "lead_optimization": {
        "description": "Optimize lead scoring and marketing spend",
        "steps": [
            "score_all_leads",
            "analyze_vendor_performance",
            "recommend_budget_allocation",
            "update_targeting",
        ],
    },
}
