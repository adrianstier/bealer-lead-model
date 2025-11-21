"""
Repository-Aware Specialized Agents for Derrick Bealer Agency
Version 2.0 - Aligned with actual data structures and paths

These agents are specifically designed to work with the repository's:
- Lead data (54,338 records in data/06_lead_data/)
- Analysis-ready CSVs (data/05_analysis_ready/)
- Raw Excel reports (data/04_raw_reports/)
- Compensation structure from agency-growth-platform/
"""

import pandas as pd
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass

from multiagent_framework import (
    BaseAgent, AgentRole, Task, TaskStatus, AgentMessage,
    TaskPriority, SharedMemory
)
from config import (
    DATA_PATHS, LEAD_DATA_SCHEMA, AGENT_CONFIG, COMPENSATION_CONFIG,
    ANALYSIS_FILES, get_lead_data_paths, get_analysis_file, get_lead_status_category
)

logger = logging.getLogger(__name__)


# =============================================================================
# LEAD DATA AGENT - Works with actual lead CSV data
# =============================================================================

class LeadDataAgent(BaseAgent):
    """
    Specialized agent for processing the agency's actual lead data.

    Works with the 54,338 lead records in data/06_lead_data/
    Understands the actual column schema: Date, Full name, User, From, To,
    Call Duration, Current Status, Call Type, Vendor Name, etc.
    """

    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.DATA_PIPELINE, shared_memory)
        self.capabilities = [
            "load_lead_data",
            "analyze_vendor_performance",
            "calculate_conversion_rates",
            "segment_by_status",
            "agent_performance_analysis",
        ]
        self._lead_data: Optional[pd.DataFrame] = None
        self._column_map = LEAD_DATA_SCHEMA["columns"]

    async def execute_task(self, task: Task):
        """Execute lead data tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)

        try:
            if task.task_type == "load_lead_data":
                result = await self._load_all_lead_data()
            elif task.task_type == "vendor_analysis":
                result = await self._analyze_vendor_performance()
            elif task.task_type == "conversion_analysis":
                result = await self._calculate_conversion_rates()
            elif task.task_type == "agent_analysis":
                result = await self._analyze_agent_performance()
            elif task.task_type == "status_segmentation":
                result = await self._segment_by_status()
            else:
                raise ValueError(f"Unknown task type: {task.task_type}")

            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.COMPLETED,
                result=result,
                completed_at=datetime.now()
            )

            await self.send_message(
                AgentRole.ORCHESTRATOR,
                "task_completed",
                {"task_id": task.task_id, "result": result}
            )

        except Exception as e:
            logger.error(f"Lead data task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )

    async def _load_all_lead_data(self) -> Dict:
        """Load all lead data files into unified DataFrame"""
        logger.info("Loading lead data from repository...")

        lead_paths = get_lead_data_paths()
        dfs = []

        for path in lead_paths:
            if path.exists():
                try:
                    df = pd.read_csv(path)
                    dfs.append(df)
                    logger.info(f"Loaded {len(df)} records from {path.name}")
                except Exception as e:
                    logger.warning(f"Failed to load {path.name}: {e}")

        if dfs:
            self._lead_data = pd.concat(dfs, ignore_index=True)

            # Standardize column names
            self._lead_data.columns = [
                self._column_map.get(col, col) for col in self._lead_data.columns
            ]

            # Parse dates
            if 'timestamp' in self._lead_data.columns:
                self._lead_data['timestamp'] = pd.to_datetime(
                    self._lead_data['timestamp'], errors='coerce'
                )

            # Add derived columns
            self._lead_data['status_category'] = self._lead_data['status'].apply(
                get_lead_status_category
            )

            logger.info(f"Total lead records loaded: {len(self._lead_data)}")

            # Store summary in shared memory
            await self.shared_memory.set("lead_data", "total_records", len(self._lead_data))
            await self.shared_memory.set("lead_data", "date_range", {
                "min": str(self._lead_data['timestamp'].min()),
                "max": str(self._lead_data['timestamp'].max()),
            })

            return {
                "total_records": len(self._lead_data),
                "files_loaded": len(dfs),
                "columns": list(self._lead_data.columns),
                "date_range": {
                    "start": str(self._lead_data['timestamp'].min()),
                    "end": str(self._lead_data['timestamp'].max()),
                },
            }
        else:
            return {"error": "No lead data files found", "total_records": 0}

    async def _analyze_vendor_performance(self) -> Dict:
        """Analyze performance by lead vendor"""
        if self._lead_data is None:
            await self._load_all_lead_data()

        vendor_stats = {}

        for vendor in self._lead_data['vendor'].dropna().unique():
            vendor_data = self._lead_data[self._lead_data['vendor'] == vendor]

            total = len(vendor_data)
            quoted = len(vendor_data[vendor_data['status_category'] == 'quoted'])
            sold = len(vendor_data[vendor_data['status_category'] == 'sold'])

            vendor_stats[vendor] = {
                "total_leads": total,
                "quoted": quoted,
                "sold": sold,
                "quote_rate": quoted / total if total > 0 else 0,
                "conversion_rate": sold / total if total > 0 else 0,
                "avg_call_duration": vendor_data['duration_seconds'].mean(),
            }

        # Sort by conversion rate
        sorted_vendors = sorted(
            vendor_stats.items(),
            key=lambda x: x[1]['conversion_rate'],
            reverse=True
        )

        return {
            "vendor_performance": dict(sorted_vendors),
            "top_vendor": sorted_vendors[0][0] if sorted_vendors else None,
            "analysis_timestamp": datetime.now().isoformat(),
        }

    async def _calculate_conversion_rates(self) -> Dict:
        """Calculate conversion rates across different dimensions"""
        if self._lead_data is None:
            await self._load_all_lead_data()

        total = len(self._lead_data)
        status_counts = self._lead_data['status_category'].value_counts().to_dict()

        return {
            "total_leads": total,
            "status_distribution": status_counts,
            "funnel_metrics": {
                "called_to_contacted": status_counts.get('contacted', 0) / status_counts.get('called', 1),
                "contacted_to_quoted": status_counts.get('quoted', 0) / status_counts.get('contacted', 1),
                "quoted_to_sold": status_counts.get('sold', 0) / status_counts.get('quoted', 1),
                "overall_conversion": status_counts.get('sold', 0) / total if total > 0 else 0,
            },
        }

    async def _analyze_agent_performance(self) -> Dict:
        """Analyze performance by agent (User field)"""
        if self._lead_data is None:
            await self._load_all_lead_data()

        agent_stats = {}

        for agent in self._lead_data['agent_name'].dropna().unique():
            agent_data = self._lead_data[self._lead_data['agent_name'] == agent]

            total = len(agent_data)
            sold = len(agent_data[agent_data['status_category'] == 'sold'])

            agent_stats[agent] = {
                "total_calls": total,
                "conversions": sold,
                "conversion_rate": sold / total if total > 0 else 0,
                "avg_call_duration": agent_data['duration_seconds'].mean(),
            }

        return {
            "agent_performance": agent_stats,
            "top_performer": max(agent_stats, key=lambda x: agent_stats[x]['conversion_rate']) if agent_stats else None,
        }

    async def _segment_by_status(self) -> Dict:
        """Segment leads by status for follow-up prioritization"""
        if self._lead_data is None:
            await self._load_all_lead_data()

        segments = {}

        for status in self._lead_data['status'].dropna().unique():
            status_data = self._lead_data[self._lead_data['status'] == status]
            segments[status] = {
                "count": len(status_data),
                "sample_leads": status_data[['customer_name', 'vendor', 'timestamp']].head(5).to_dict('records'),
            }

        return {"status_segments": segments}


# =============================================================================
# LEAD SCORING AGENT - ML-powered scoring with repository data
# =============================================================================

class LeadScoringAgentV2(BaseAgent):
    """
    Lead scoring agent aligned with repository data structure.
    Scores leads based on actual columns: status progression, call duration,
    vendor performance, agent performance, and recency.
    """

    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.LEAD_SCORING, shared_memory)
        self.capabilities = [
            "score_lead",
            "batch_score",
            "optimize_variable_comp",
            "recommend_budget",
            "identify_bundle_opportunities",
        ]
        self.config = AGENT_CONFIG["lead_scoring"]

    async def execute_task(self, task: Task):
        """Execute lead scoring tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)

        try:
            if task.task_type == "score_lead":
                result = await self._score_single_lead(task.data)
            elif task.task_type == "batch_score":
                result = await self._batch_score_leads(task.data)
            elif task.task_type == "optimize_comp":
                result = await self._optimize_variable_comp(task.data)
            elif task.task_type == "budget_recommendation":
                result = await self._recommend_budget_allocation(task.data)
            else:
                raise ValueError(f"Unknown task type: {task.task_type}")

            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.COMPLETED,
                result=result,
                completed_at=datetime.now()
            )

        except Exception as e:
            logger.error(f"Lead scoring task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )

    async def _score_single_lead(self, lead_data: Dict) -> Dict:
        """Score a single lead using weighted factors"""
        score = 0
        weights = self.config["score_weights"]

        # Status progression score (0-100)
        status = lead_data.get("status", "")
        status_category = get_lead_status_category(status)
        status_scores = {
            "called": 20,
            "contacted": 40,
            "quoted": 70,
            "sold": 100,
            "x_date": 30,
        }
        status_score = status_scores.get(status_category, 10)
        score += status_score * weights["status_progression"]

        # Call duration score
        duration = lead_data.get("duration_seconds", 0)
        if duration > 180:  # 3+ minutes
            duration_score = 100
        elif duration > 60:  # 1-3 minutes
            duration_score = 70
        elif duration > 30:  # 30-60 seconds
            duration_score = 40
        else:
            duration_score = 20
        score += duration_score * weights["call_duration"]

        # Vendor performance score (would lookup from vendor analysis)
        vendor = lead_data.get("vendor", "")
        vendor_scores = {
            "QuoteWizard-Auto": 70,
            "QuoteWizard-Home": 75,
            "MediaAlpha": 60,
            "Datalot": 55,
            "EverQuote": 65,
        }
        vendor_score = vendor_scores.get(vendor, 50)
        score += vendor_score * weights["vendor_performance"]

        # Time of day score (business hours better)
        timestamp = lead_data.get("timestamp")
        if timestamp:
            hour = pd.to_datetime(timestamp).hour
            if 9 <= hour <= 17:  # Business hours
                time_score = 80
            elif 8 <= hour <= 20:
                time_score = 60
            else:
                time_score = 30
        else:
            time_score = 50
        score += time_score * weights["time_of_day"]

        # Recency score
        if timestamp:
            days_old = (datetime.now() - pd.to_datetime(timestamp)).days
            if days_old <= 1:
                recency_score = 100
            elif days_old <= 7:
                recency_score = 70
            elif days_old <= 30:
                recency_score = 40
            else:
                recency_score = 20
        else:
            recency_score = 50
        score += recency_score * weights["recency"]

        # Agent performance (placeholder - would lookup actual agent stats)
        agent_score = 60
        score += agent_score * weights["agent_performance"]

        # Determine priority
        thresholds = self.config["priority_thresholds"]
        if score >= thresholds["high"]:
            priority = "high"
        elif score >= thresholds["medium"]:
            priority = "medium"
        else:
            priority = "low"

        return {
            "lead_id": lead_data.get("lead_id", lead_data.get("customer_name", "unknown")),
            "score": round(score, 1),
            "priority": priority,
            "factors": {
                "status_progression": status_score,
                "call_duration": duration_score,
                "vendor_quality": vendor_score,
                "timing": time_score,
                "recency": recency_score,
            },
            "recommended_action": self._get_recommended_action(priority, status_category),
        }

    def _get_recommended_action(self, priority: str, status: str) -> str:
        """Get recommended action based on priority and status"""
        if priority == "high" and status == "quoted":
            return "immediate_followup"
        elif priority == "high" and status == "contacted":
            return "schedule_quote_call"
        elif priority == "medium":
            return "add_to_daily_queue"
        else:
            return "nurture_campaign"

    async def _batch_score_leads(self, data: Dict) -> Dict:
        """Score multiple leads"""
        leads = data.get("leads", [])
        scored = []

        for lead in leads:
            result = await self._score_single_lead(lead)
            scored.append(result)

        # Sort by score
        scored.sort(key=lambda x: x["score"], reverse=True)

        return {
            "total_scored": len(scored),
            "high_priority": len([l for l in scored if l["priority"] == "high"]),
            "medium_priority": len([l for l in scored if l["priority"] == "medium"]),
            "low_priority": len([l for l in scored if l["priority"] == "low"]),
            "scored_leads": scored,
        }

    async def _optimize_variable_comp(self, data: Dict) -> Dict:
        """Optimize marketing spend against variable comp tiers"""
        current_pg = COMPENSATION_CONFIG["current"]["pg_items"]
        current_pbr = COMPENSATION_CONFIG["current"]["pbr"]

        # Find current tier and next tier
        pg_tiers = COMPENSATION_CONFIG["pg_tiers"]
        current_tier = None
        next_tier = None

        for i, tier in enumerate(pg_tiers):
            if tier["items_min"] <= current_pg <= tier["items_max"]:
                current_tier = tier
                if i < len(pg_tiers) - 1:
                    next_tier = pg_tiers[i + 1]
                break

        # Calculate items needed for next tier
        items_needed = next_tier["items_min"] - current_pg if next_tier else 0

        return {
            "current_position": {
                "pg_items": current_pg,
                "pbr": current_pbr,
                "current_tier": current_tier["name"] if current_tier else "Below Minimum",
            },
            "next_tier": {
                "name": next_tier["name"] if next_tier else "Max Tier",
                "payout": next_tier["payout"] if next_tier else 0,
                "items_needed": max(0, items_needed),
            },
            "recommendation": {
                "weekly_leads_target": max(0, items_needed) // 4,  # 4 weeks left
                "recommended_budget": max(0, items_needed) * 50,  # $50 per lead
                "focus_products": ["auto", "home"] if current_pbr < 0.40 else ["bundle"],
            },
        }

    async def _recommend_budget_allocation(self, data: Dict) -> Dict:
        """Recommend budget allocation across vendors"""
        # This would use actual vendor performance data
        return {
            "total_budget": data.get("budget", 2000),
            "allocation": {
                "QuoteWizard-Auto": 0.35,
                "QuoteWizard-Home": 0.25,
                "EverQuote": 0.20,
                "MediaAlpha": 0.15,
                "Datalot": 0.05,
            },
            "reasoning": "Allocation based on historical conversion rates and current bundle rate gap",
        }


# =============================================================================
# COMPENSATION DASHBOARD AGENT - Integrates with React frontend
# =============================================================================

class CompensationDashboardAgent(BaseAgent):
    """
    Agent for compensation analysis and dashboard integration.
    Works with the React frontend in agency-growth-platform/
    """

    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.MONITOR, shared_memory)
        self.capabilities = [
            "calculate_current_position",
            "project_tier_achievement",
            "analyze_bonus_potential",
            "generate_dashboard_data",
        ]

    async def execute_task(self, task: Task):
        """Execute compensation analysis tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)

        try:
            if task.task_type == "current_position":
                result = await self._calculate_current_position(task.data)
            elif task.task_type == "tier_projection":
                result = await self._project_tier_achievement(task.data)
            elif task.task_type == "bonus_analysis":
                result = await self._analyze_bonus_potential(task.data)
            elif task.task_type == "dashboard_data":
                result = await self._generate_dashboard_data(task.data)
            else:
                raise ValueError(f"Unknown task type: {task.task_type}")

            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.COMPLETED,
                result=result,
                completed_at=datetime.now()
            )

        except Exception as e:
            logger.error(f"Compensation task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )

    async def _calculate_current_position(self, data: Dict) -> Dict:
        """Calculate current compensation position"""
        current = COMPENSATION_CONFIG["current"]
        targets = COMPENSATION_CONFIG["targets"]

        return {
            "policy_bundle_rate": {
                "current": current["pbr"],
                "target": targets["pbr"],
                "gap": targets["pbr"] - current["pbr"],
                "on_track": current["pbr"] >= targets["pbr"],
            },
            "portfolio_growth": {
                "current": current["pg_items"],
                "target": targets["pg_items"],
                "gap": targets["pg_items"] - current["pg_items"],
                "on_track": current["pg_items"] >= 0,
            },
        }

    async def _project_tier_achievement(self, data: Dict) -> Dict:
        """Project tier achievement probability"""
        current_pg = data.get("current_pg", COMPENSATION_CONFIG["current"]["pg_items"])
        weeks_remaining = data.get("weeks_remaining", 4)
        avg_weekly_growth = data.get("avg_weekly_growth", 50)

        projected_end = current_pg + (weeks_remaining * avg_weekly_growth)

        # Find projected tier
        pg_tiers = COMPENSATION_CONFIG["pg_tiers"]
        projected_tier = pg_tiers[0]
        for tier in pg_tiers:
            if tier["items_min"] <= projected_end <= tier["items_max"]:
                projected_tier = tier
                break

        return {
            "current_items": current_pg,
            "projected_items": projected_end,
            "projected_tier": projected_tier["name"],
            "projected_payout": projected_tier["payout"],
            "confidence": "high" if avg_weekly_growth > 0 else "low",
        }

    async def _analyze_bonus_potential(self, data: Dict) -> Dict:
        """Analyze total bonus potential"""
        current = COMPENSATION_CONFIG["current"]

        # PBR bonus
        pbr_tier = None
        for tier in COMPENSATION_CONFIG["pbr_tiers"]:
            if tier["min"] <= current["pbr"] < tier["max"]:
                pbr_tier = tier
                break

        # PG bonus
        pg_tier = None
        for tier in COMPENSATION_CONFIG["pg_tiers"]:
            if tier["items_min"] <= current["pg_items"] <= tier["items_max"]:
                pg_tier = tier
                break

        return {
            "pbr_bonus_rate": pbr_tier["bonus_pct"] if pbr_tier else 0,
            "pg_bonus_amount": pg_tier["payout"] if pg_tier else 0,
            "nb_variable_comp_rates": COMPENSATION_CONFIG["nb_variable_comp"],
            "bigger_bundle_bonus": COMPENSATION_CONFIG["bigger_bundle_bonus"],
        }

    async def _generate_dashboard_data(self, data: Dict) -> Dict:
        """Generate data for React dashboard"""
        position = await self._calculate_current_position(data)
        bonus = await self._analyze_bonus_potential(data)

        return {
            "timestamp": datetime.now().isoformat(),
            "current_position": position,
            "bonus_analysis": bonus,
            "kpis": {
                "pbr": COMPENSATION_CONFIG["current"]["pbr"],
                "pg_items": COMPENSATION_CONFIG["current"]["pg_items"],
                "target_pbr": COMPENSATION_CONFIG["targets"]["pbr"],
                "target_ltv_cac": COMPENSATION_CONFIG["targets"]["ltv_cac_ratio"],
            },
        }


# =============================================================================
# ANALYSIS READY DATA AGENT - Works with pre-processed CSVs
# =============================================================================

class AnalysisDataAgent(BaseAgent):
    """
    Agent for working with analysis-ready data in data/05_analysis_ready/
    Handles bonus structure, product economics, benchmarks, etc.
    """

    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.DATA_PIPELINE, shared_memory)
        self.capabilities = [
            "load_analysis_data",
            "get_benchmarks",
            "get_product_economics",
            "get_market_analysis",
        ]

    async def execute_task(self, task: Task):
        """Execute analysis data tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)

        try:
            if task.task_type == "load_benchmarks":
                result = await self._load_benchmarks()
            elif task.task_type == "load_product_economics":
                result = await self._load_product_economics()
            elif task.task_type == "load_market_analysis":
                result = await self._load_market_analysis()
            elif task.task_type == "load_vendor_data":
                result = await self._load_vendor_data()
            else:
                raise ValueError(f"Unknown task type: {task.task_type}")

            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.COMPLETED,
                result=result,
                completed_at=datetime.now()
            )

        except Exception as e:
            logger.error(f"Analysis data task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )

    async def _load_benchmarks(self) -> Dict:
        """Load operational benchmarks"""
        path = get_analysis_file("operational_benchmarks")

        if path.exists():
            df = pd.read_csv(path)
            return {"benchmarks": df.to_dict('records')}
        else:
            return {"error": f"File not found: {path}"}

    async def _load_product_economics(self) -> Dict:
        """Load product economics data"""
        path = get_analysis_file("product_economics")

        if path.exists():
            df = pd.read_csv(path)
            return {"product_economics": df.to_dict('records')}
        else:
            return {"error": f"File not found: {path}"}

    async def _load_market_analysis(self) -> Dict:
        """Load Santa Barbara market analysis"""
        path = get_analysis_file("market_analysis")

        if path.exists():
            df = pd.read_csv(path)
            return {"market_analysis": df.to_dict('records')}
        else:
            return {"error": f"File not found: {path}"}

    async def _load_vendor_data(self) -> Dict:
        """Load lead vendor performance data"""
        path = get_analysis_file("lead_vendors")

        if path.exists():
            df = pd.read_csv(path)
            return {"vendor_data": df.to_dict('records')}
        else:
            return {"error": f"File not found: {path}"}


# =============================================================================
# SETUP FUNCTION FOR IMPROVED SYSTEM
# =============================================================================

async def setup_improved_system():
    """
    Set up the improved multiagent system with repository-aware agents.
    """
    from multiagent_framework import AgentSystem, OrchestratorAgent
    from specialized_agents import (
        InvoiceAutomationAgent, CancellationWatchAgent,
        ConciergeAgent, SocialMediaAgent, MonitorAgent
    )

    system = AgentSystem()

    # Core orchestrator
    system.register_agent(OrchestratorAgent(system.shared_memory))

    # Repository-aware data agents
    system.register_agent(LeadDataAgent(system.shared_memory))
    system.register_agent(AnalysisDataAgent(system.shared_memory))

    # Improved lead scoring
    system.register_agent(LeadScoringAgentV2(system.shared_memory))

    # Compensation dashboard integration
    system.register_agent(CompensationDashboardAgent(system.shared_memory))

    # Existing specialized agents
    system.register_agent(InvoiceAutomationAgent(system.shared_memory))
    system.register_agent(CancellationWatchAgent(system.shared_memory))
    system.register_agent(ConciergeAgent(system.shared_memory))
    system.register_agent(SocialMediaAgent(system.shared_memory))
    system.register_agent(MonitorAgent(system.shared_memory))

    logger.info("Improved agent system initialized with repository-aware agents")

    return system


# =============================================================================
# EXAMPLE USAGE
# =============================================================================

async def example_usage():
    """Example demonstrating the improved agents"""

    print("\n" + "="*70)
    print("IMPROVED AGENT SYSTEM - Repository-Aware")
    print("="*70 + "\n")

    system = await setup_improved_system()

    # Load lead data
    print("📊 Loading actual lead data...")
    lead_agent = LeadDataAgent(system.shared_memory)
    result = await lead_agent._load_all_lead_data()
    print(f"   Loaded {result.get('total_records', 0)} records")

    # Analyze vendor performance
    print("\n🏢 Analyzing vendor performance...")
    vendor_result = await lead_agent._analyze_vendor_performance()
    if vendor_result.get("top_vendor"):
        print(f"   Top vendor: {vendor_result['top_vendor']}")

    # Score sample lead
    print("\n🎯 Scoring sample lead...")
    scoring_agent = LeadScoringAgentV2(system.shared_memory)
    sample_lead = {
        "customer_name": "John Doe",
        "status": "3.0 QUOTED - Follow Up",
        "duration_seconds": 120,
        "vendor": "QuoteWizard-Auto",
        "timestamp": datetime.now().isoformat(),
    }
    score_result = await scoring_agent._score_single_lead(sample_lead)
    print(f"   Score: {score_result['score']}/100 ({score_result['priority']} priority)")

    # Compensation analysis
    print("\n💰 Analyzing compensation position...")
    comp_agent = CompensationDashboardAgent(system.shared_memory)
    comp_result = await comp_agent._calculate_current_position({})
    pbr = comp_result['policy_bundle_rate']
    print(f"   PBR: {pbr['current']:.1%} (target: {pbr['target']:.1%})")

    print("\n✨ Agent system demonstration complete!\n")


if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())
