"""
Automated Workflow Runner
Executes daily/weekly agent workflows and generates actionable reports
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from system_analyzer import SystemAnalyzer
from optimized_scoring import OptimizedLeadScorer, score_repository_leads
from integration_v2 import ImprovedClaudeCodeIntegration
from config import COMPENSATION_CONFIG, DATA_PATHS


class WorkflowRunner:
    """
    Automated workflow runner that executes agent tasks and generates reports.
    """

    def __init__(self):
        self.analyzer = SystemAnalyzer()
        self.scorer = OptimizedLeadScorer()
        self.results = {}

    async def run_daily_workflow(self) -> Dict[str, Any]:
        """
        Daily morning workflow:
        1. Score new leads
        2. Check compensation status
        3. Generate priority actions
        4. Create daily report
        """
        print("\n" + "="*70)
        print("DAILY WORKFLOW - " + datetime.now().strftime("%Y-%m-%d %H:%M"))
        print("="*70 + "\n")

        results = {
            "workflow": "daily",
            "timestamp": datetime.now().isoformat(),
        }

        # 1. Score recent leads
        print("📊 Step 1: Scoring recent leads...")
        scoring_results = score_repository_leads(limit=100)
        results["lead_scoring"] = {
            "total_scored": scoring_results["total_scored"],
            "distribution": scoring_results["distribution"],
            "avg_score": scoring_results["avg_score"],
            "high_priority_leads": [l for l in scoring_results["top_leads"] if l["priority"] == "high"][:5],
        }
        print(f"   Scored {scoring_results['total_scored']} leads")
        print(f"   High priority: {scoring_results['distribution']['high']}")

        # 2. Check compensation status
        print("\n💰 Step 2: Checking compensation status...")
        comp_status = self._get_compensation_status()
        results["compensation"] = comp_status
        print(f"   PBR: {comp_status['pbr']['current']:.1%} (gap: {comp_status['pbr']['gap']:.1%})")
        print(f"   PG: {comp_status['pg']['current']} items")

        # 3. Generate priority actions
        print("\n🎯 Step 3: Generating priority actions...")
        actions = self._generate_daily_actions(scoring_results, comp_status)
        results["priority_actions"] = actions
        print(f"   Generated {len(actions)} actions")

        # 4. Create summary
        results["summary"] = self._create_daily_summary(results)

        print("\n✅ Daily workflow complete!")

        return results

    async def run_weekly_workflow(self) -> Dict[str, Any]:
        """
        Weekly comprehensive workflow:
        1. Full system analysis
        2. Vendor performance review
        3. Agent performance review
        4. Generate improvement plan
        5. Create weekly report
        """
        print("\n" + "="*70)
        print("WEEKLY WORKFLOW - Week of " + datetime.now().strftime("%Y-%m-%d"))
        print("="*70 + "\n")

        results = {
            "workflow": "weekly",
            "timestamp": datetime.now().isoformat(),
        }

        # 1. Full analysis
        print("📊 Step 1: Running full system analysis...")
        analysis = await self.analyzer.run_full_analysis()
        results["analysis"] = {
            "total_records": analysis["summary"]["total_records"],
            "vendor_analysis": analysis["vendor_analysis"],
            "funnel": analysis["status_analysis"]["funnel"],
            "improvements": analysis["improvements"],
        }

        # 2. Vendor recommendations
        print("\n🏢 Step 2: Vendor analysis complete")
        top_vendor = analysis["vendor_analysis"]["top_vendor"]
        print(f"   Top vendor: {top_vendor}")

        # 3. Agent performance
        print("\n👤 Step 3: Agent analysis complete")
        top_agent = analysis["agent_analysis"]["top_performer"]
        print(f"   Top performer: {top_agent}")

        # 4. Generate improvement plan
        print("\n💡 Step 4: Generating improvement plan...")
        improvement_plan = self._create_improvement_plan(analysis)
        results["improvement_plan"] = improvement_plan

        # 5. Weekly summary
        results["summary"] = self._create_weekly_summary(results)

        print("\n✅ Weekly workflow complete!")

        return results

    def _get_compensation_status(self) -> Dict:
        """Get current compensation status"""
        current = COMPENSATION_CONFIG["current"]
        targets = COMPENSATION_CONFIG["targets"]

        return {
            "pbr": {
                "current": current["pbr"],
                "target": targets["pbr"],
                "gap": targets["pbr"] - current["pbr"],
                "on_track": current["pbr"] >= targets["pbr"],
            },
            "pg": {
                "current": current["pg_items"],
                "target": 0,  # Break-even
                "gap": -current["pg_items"],
                "on_track": current["pg_items"] >= 0,
            },
        }

    def _generate_daily_actions(self, scoring: Dict, comp: Dict) -> list:
        """Generate prioritized daily actions"""
        actions = []

        # High priority lead callbacks
        high_leads = scoring["distribution"]["high"]
        if high_leads > 0:
            actions.append({
                "priority": 1,
                "action": f"Call {high_leads} high-priority leads immediately",
                "category": "Sales",
                "time_estimate": f"{high_leads * 15} minutes",
            })

        # PBR gap action
        if comp["pbr"]["gap"] > 0:
            actions.append({
                "priority": 2,
                "action": "Quote home insurance with all auto leads today",
                "category": "Bundling",
                "time_estimate": "Ongoing",
            })

        # Medium priority leads
        medium_leads = scoring["distribution"]["medium"]
        if medium_leads > 5:
            actions.append({
                "priority": 3,
                "action": f"Schedule callbacks for {medium_leads} medium-priority leads",
                "category": "Sales",
                "time_estimate": f"{medium_leads * 10} minutes",
            })

        # Review nurture sequence
        low_leads = scoring["distribution"]["low"]
        if low_leads > 20:
            actions.append({
                "priority": 4,
                "action": f"Add {low_leads} leads to nurture email sequence",
                "category": "Marketing",
                "time_estimate": "30 minutes",
            })

        return actions

    def _create_daily_summary(self, results: Dict) -> str:
        """Create daily summary text"""
        scoring = results["lead_scoring"]
        comp = results["compensation"]
        actions = results["priority_actions"]

        summary = f"""
DAILY SUMMARY - {datetime.now().strftime("%B %d, %Y")}

LEAD SCORING
• Scored: {scoring['total_scored']} leads
• High priority: {scoring['distribution']['high']}
• Average score: {scoring['avg_score']}/100

COMPENSATION STATUS
• PBR: {comp['pbr']['current']:.1%} (target: {comp['pbr']['target']:.1%})
• PG: {comp['pg']['current']} items

TODAY'S PRIORITIES
"""
        for i, action in enumerate(actions[:3], 1):
            summary += f"{i}. {action['action']}\n"

        return summary.strip()

    def _create_improvement_plan(self, analysis: Dict) -> Dict:
        """Create structured improvement plan from analysis"""
        improvements = analysis["improvements"]

        plan = {
            "immediate": [],  # This week
            "short_term": [],  # This month
            "long_term": [],   # This quarter
        }

        for imp in improvements:
            if imp["priority"] == "critical":
                plan["immediate"].append({
                    "title": imp["title"],
                    "action": imp["action"],
                    "impact": imp["expected_impact"],
                })
            elif imp["priority"] == "high":
                plan["short_term"].append({
                    "title": imp["title"],
                    "action": imp["action"],
                    "impact": imp["expected_impact"],
                })
            else:
                plan["long_term"].append({
                    "title": imp["title"],
                    "action": imp["action"],
                    "impact": imp["expected_impact"],
                })

        return plan

    def _create_weekly_summary(self, results: Dict) -> str:
        """Create weekly summary text"""
        analysis = results["analysis"]
        plan = results["improvement_plan"]

        summary = f"""
WEEKLY SUMMARY - Week of {datetime.now().strftime("%B %d, %Y")}

DATA ANALYZED
• Total records: {analysis['total_records']:,}

FUNNEL PERFORMANCE
• Leads: {analysis['funnel']['total']:,}
• Contacted: {analysis['funnel']['contacted']:,}
• Quoted: {analysis['funnel']['quoted']:,}
• Sold: {analysis['funnel']['sold']}
• Conversion: {analysis['funnel']['overall_conversion']:.2%}

TOP VENDOR: {analysis['vendor_analysis']['top_vendor']}

IMMEDIATE ACTIONS ({len(plan['immediate'])}):
"""
        for item in plan["immediate"]:
            summary += f"• {item['title']}: {item['action']}\n"

        return summary.strip()

    def save_results(self, results: Dict, filename: str = None):
        """Save workflow results to file"""
        if not filename:
            workflow = results.get("workflow", "report")
            date = datetime.now().strftime("%Y%m%d_%H%M")
            filename = f"{workflow}_report_{date}.json"

        output_path = DATA_PATHS["root"] / "reports"
        output_path.mkdir(exist_ok=True)

        filepath = output_path / filename
        with open(filepath, "w") as f:
            json.dump(results, f, indent=2, default=str)

        print(f"\n📄 Report saved: {filepath}")
        return filepath


async def main():
    """Run workflows"""
    runner = WorkflowRunner()

    # Run daily workflow
    print("\n" + "="*70)
    print("RUNNING AUTOMATED WORKFLOWS")
    print("="*70)

    # Daily
    daily_results = await runner.run_daily_workflow()
    print("\n" + daily_results["summary"])

    # Weekly (runs full analysis)
    weekly_results = await runner.run_weekly_workflow()
    print("\n" + weekly_results["summary"])

    # Save results
    runner.save_results(daily_results)
    runner.save_results(weekly_results)

    print("\n" + "="*70)
    print("ALL WORKFLOWS COMPLETE")
    print("="*70)


if __name__ == "__main__":
    asyncio.run(main())
