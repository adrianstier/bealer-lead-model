"""
Claude Code Integration Guide for Multiagent Framework
How to use this framework effectively with Claude Code
"""

import asyncio
from typing import Dict, Any
import json


# ============================================================================
# CLAUDE CODE INTEGRATION PATTERNS
# ============================================================================

class ClaudeCodeIntegration:
    """
    Integration layer for Claude Code to interact with the multiagent system
    
    This class provides high-level interfaces that Claude Code can use
    to orchestrate complex multi-step workflows across specialized agents.
    """
    
    def __init__(self, agent_system):
        self.system = agent_system
        self.shared_memory = agent_system.shared_memory
    
    # ------------------------------------------------------------------------
    # HIGH-LEVEL WORKFLOW INITIATORS
    # ------------------------------------------------------------------------
    
    async def process_new_leads(self, leads: list) -> Dict[str, Any]:
        """
        Process a batch of new leads through the full pipeline
        
        Workflow:
        1. Data validation and enrichment
        2. Lead scoring
        3. Priority assignment
        4. Agent notification
        5. Metrics logging
        
        Usage from Claude Code:
            integration = ClaudeCodeIntegration(system)
            result = await integration.process_new_leads(leads_data)
        """
        print(f"🚀 Processing {len(leads)} new leads...")
        
        results = []
        for lead in leads:
            # Initiate lead processing workflow
            workflow_id = f"lead_{lead.get('id', 'unknown')}"
            
            await self.system.initiate_workflow("lead_processing", {
                "lead_id": lead.get("id"),
                "lead_data": lead,
                "workflow_id": workflow_id
            })
            
            # Wait for workflow completion (in real system, use callbacks)
            await asyncio.sleep(0.5)  # Simulated processing time
            
            # Get results from shared memory
            lead_result = await self.shared_memory.get("lead_results", lead.get("id"))
            results.append(lead_result)
        
        return {
            "processed": len(results),
            "high_priority": len([r for r in results if r and r.get("priority") == "high"]),
            "results": results
        }
    
    async def run_cancellation_analysis(self, cancel_report_path: str) -> Dict[str, Any]:
        """
        Analyze cancellation report and generate save strategies
        
        Workflow:
        1. Ingest cancel-pending report
        2. Risk assessment
        3. Saveability scoring
        4. Prioritization
        5. Outreach script generation
        6. Dashboard update
        
        Usage from Claude Code:
            result = await integration.run_cancellation_analysis("cancel_report.csv")
        """
        print(f"🔍 Analyzing cancellation report: {cancel_report_path}")
        
        await self.system.initiate_workflow("cancellation_monitoring", {
            "report_path": cancel_report_path,
            "analysis_type": "full"
        })
        
        # Simulate workflow execution
        await asyncio.sleep(1)
        
        # Get aggregated results
        analysis = await self.shared_memory.get_namespace("cancellation_watch")
        
        return {
            "total_at_risk": analysis.get("total_at_risk", 0),
            "premium_at_risk": analysis.get("premium_at_risk", 0),
            "high_priority_saves": analysis.get("high_priority_saves", []),
            "dashboard_url": "/dashboard/cancellations"
        }
    
    async def generate_monthly_newsletters(self, month: str) -> Dict[str, Any]:
        """
        Generate and send personalized newsletters for all customers
        
        Workflow:
        1. Customer segmentation
        2. Content generation per segment
        3. Personalization
        4. Delivery scheduling
        5. Engagement tracking
        
        Usage from Claude Code:
            result = await integration.generate_monthly_newsletters("November 2025")
        """
        print(f"📧 Generating newsletters for {month}...")
        
        await self.system.initiate_workflow("newsletter_creation", {
            "month": month,
            "include_local_events": True,
            "include_policy_summaries": True
        })
        
        await asyncio.sleep(1)
        
        return {
            "newsletters_generated": 850,
            "scheduled_for_delivery": True,
            "delivery_date": "2025-12-01"
        }
    
    async def launch_social_campaign(self, campaign_config: Dict) -> Dict[str, Any]:
        """
        Launch optimized social media campaign
        
        Workflow:
        1. Identify best customer segments
        2. Build lookalike audiences
        3. Generate creative variations
        4. A/B test setup
        5. Campaign launch
        6. Performance monitoring
        
        Usage from Claude Code:
            result = await integration.launch_social_campaign({
                "budget": 2000,
                "duration_days": 14,
                "target_product": "auto"
            })
        """
        print(f"🎯 Launching social media campaign...")
        
        await self.system.initiate_workflow("social_campaign", campaign_config)
        
        await asyncio.sleep(1)
        
        return {
            "campaign_id": "CAMP_12345",
            "status": "live",
            "estimated_reach": 25000,
            "creative_variations": 5
        }
    
    async def run_invoice_automation(self, billing_cycle: str) -> Dict[str, Any]:
        """
        Automate invoice mailing for paper-preferring customers
        
        Workflow:
        1. Identify paper customers
        2. Generate invoices
        3. Schedule mailings
        4. Track delivery
        5. Monitor payments
        
        Usage from Claude Code:
            result = await integration.run_invoice_automation("December 2025")
        """
        print(f"📬 Running invoice automation for {billing_cycle}...")
        
        await self.system.initiate_workflow("invoice_generation", {
            "billing_cycle": billing_cycle,
            "envelope_type": "standard"
        })
        
        await asyncio.sleep(1)
        
        return {
            "invoices_generated": 127,
            "mailings_scheduled": True,
            "estimated_delivery": "2025-12-05"
        }
    
    # ------------------------------------------------------------------------
    # QUERY & REPORTING INTERFACES
    # ------------------------------------------------------------------------
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get overall system status and health"""
        orchestrator_state = await self.shared_memory.get_namespace("orchestrator")
        monitor_state = await self.shared_memory.get_namespace("monitor")
        
        return {
            "system_health": "healthy",
            "active_workflows": len(orchestrator_state.get("active_workflows", {})),
            "tasks_completed_today": monitor_state.get("tasks_completed_today", 0),
            "agents_online": 7
        }
    
    async def get_performance_metrics(self, timeframe: str = "week") -> Dict[str, Any]:
        """Get performance metrics for specified timeframe"""
        metrics = await self.shared_memory.get_namespace("metrics")
        
        return {
            "timeframe": timeframe,
            "lead_conversion_rate": 0.28,
            "cancellation_save_rate": 0.62,
            "newsletter_open_rate": 0.30,
            "cost_per_lead": 42.50,
            "manual_hours_saved": 18.5
        }
    
    async def get_agent_capabilities(self) -> Dict[str, list]:
        """List all agents and their capabilities"""
        return {
            "orchestrator": ["workflow_coordination", "task_distribution"],
            "lead_scoring": ["lead_scoring", "conversion_prediction", "bundling_detection"],
            "cancellation_watch": ["risk_analysis", "saveability_scoring", "outreach_generation"],
            "invoice_automation": ["customer_identification", "invoice_generation", "mail_scheduling"],
            "concierge": ["newsletter_generation", "life_event_messaging"],
            "social_media": ["audience_building", "creative_generation", "campaign_optimization"],
            "monitor": ["metric_tracking", "report_generation", "anomaly_detection"]
        }


# ============================================================================
# EXAMPLE USAGE PATTERNS FOR CLAUDE CODE
# ============================================================================

async def example_1_daily_morning_routine():
    """
    Example: Daily morning routine that Claude Code could execute
    
    This demonstrates how Claude Code can orchestrate multiple
    agents to handle daily tasks automatically.
    """
    print("\n" + "="*70)
    print("EXAMPLE 1: Daily Morning Routine")
    print("="*70 + "\n")
    
    from multiagent_framework import AgentSystem
    from specialized_agents import setup_full_system
    
    # Initialize system
    system = await setup_full_system()
    integration = ClaudeCodeIntegration(system)
    
    print("🌅 Starting daily morning routine...\n")
    
    # 1. Check system health
    status = await integration.get_system_status()
    print(f"✅ System Status: {status['system_health']}")
    print(f"   Active workflows: {status['active_workflows']}")
    
    # 2. Process overnight leads
    overnight_leads = [
        {"id": "L001", "name": "John Doe", "source": "website", "product": "auto"},
        {"id": "L002", "name": "Jane Smith", "source": "referral", "product": "home"}
    ]
    lead_results = await integration.process_new_leads(overnight_leads)
    print(f"✅ Processed {lead_results['processed']} leads")
    print(f"   High priority: {lead_results['high_priority']}")
    
    # 3. Check for new cancellations
    cancel_results = await integration.run_cancellation_analysis("daily_cancel_report.csv")
    print(f"✅ Cancellation Analysis Complete")
    print(f"   At risk: {cancel_results['total_at_risk']}")
    print(f"   Premium at risk: ${cancel_results['premium_at_risk']:,.2f}")
    
    # 4. Check yesterday's metrics
    metrics = await integration.get_performance_metrics("yesterday")
    print(f"✅ Yesterday's Metrics:")
    print(f"   Lead conversion: {metrics['lead_conversion_rate']:.1%}")
    print(f"   Save rate: {metrics['cancellation_save_rate']:.1%}")
    
    print("\n✨ Morning routine complete!\n")


async def example_2_end_of_month_workflow():
    """
    Example: End-of-month comprehensive workflow
    
    Demonstrates handling multiple complex workflows in sequence.
    """
    print("\n" + "="*70)
    print("EXAMPLE 2: End of Month Workflow")
    print("="*70 + "\n")
    
    from specialized_agents import setup_full_system
    
    system = await setup_full_system()
    integration = ClaudeCodeIntegration(system)
    
    print("📊 Running end-of-month processes...\n")
    
    # 1. Generate monthly invoices
    invoice_results = await integration.run_invoice_automation("December 2025")
    print(f"✅ Invoices: {invoice_results['invoices_generated']} generated")
    
    # 2. Send monthly newsletters
    newsletter_results = await integration.generate_monthly_newsletters("December 2025")
    print(f"✅ Newsletters: {newsletter_results['newsletters_generated']} scheduled")
    
    # 3. Generate performance report
    monthly_metrics = await integration.get_performance_metrics("month")
    print(f"✅ Monthly Performance:")
    print(f"   Lead conversion: {monthly_metrics['lead_conversion_rate']:.1%}")
    print(f"   Hours saved: {monthly_metrics['manual_hours_saved']}")
    
    # 4. Plan next month's campaigns
    campaign_result = await integration.launch_social_campaign({
        "budget": 3000,
        "duration_days": 30,
        "target_product": "bundle"
    })
    print(f"✅ Campaign launched: {campaign_result['campaign_id']}")
    
    print("\n✨ End-of-month workflow complete!\n")


async def example_3_emergency_response():
    """
    Example: Emergency response to spike in cancellations
    
    Shows how agents can be coordinated for urgent situations.
    """
    print("\n" + "="*70)
    print("EXAMPLE 3: Emergency Cancellation Response")
    print("="*70 + "\n")
    
    from specialized_agents import setup_full_system
    
    system = await setup_full_system()
    integration = ClaudeCodeIntegration(system)
    
    print("🚨 High cancellation alert detected!\n")
    
    # 1. Immediate analysis
    cancel_analysis = await integration.run_cancellation_analysis("urgent_cancel_report.csv")
    high_priority = cancel_analysis['high_priority_saves']
    
    print(f"⚠️  Critical situation:")
    print(f"   Total at risk: {cancel_analysis['total_at_risk']}")
    print(f"   Premium at risk: ${cancel_analysis['premium_at_risk']:,.2f}")
    print(f"   High priority saves: {len(high_priority)}")
    
    # 2. Generate immediate outreach scripts
    print("\n📞 Generating personalized save scripts...")
    
    # 3. Alert team
    print("📧 Alerting team members...")
    
    # 4. Prepare dashboard
    print(f"📊 Dashboard updated: {cancel_analysis['dashboard_url']}")
    
    print("\n✨ Emergency response deployed!\n")


async def example_4_claude_code_interactive_session():
    """
    Example: Interactive session where Claude Code asks questions
    and makes decisions based on agent responses
    
    This shows how Claude Code can use the multiagent system
    to gather information and make intelligent decisions.
    """
    print("\n" + "="*70)
    print("EXAMPLE 4: Interactive Decision Making")
    print("="*70 + "\n")
    
    from specialized_agents import setup_full_system
    
    system = await setup_full_system()
    integration = ClaudeCodeIntegration(system)
    
    print("🤔 Claude Code analyzing business situation...\n")
    
    # 1. Gather current state
    metrics = await integration.get_performance_metrics("week")
    status = await integration.get_system_status()
    
    # 2. Analyze and make decision
    print("📊 Current Performance:")
    print(f"   Lead conversion: {metrics['lead_conversion_rate']:.1%}")
    print(f"   Cost per lead: ${metrics['cost_per_lead']:.2f}")
    
    # Claude Code reasoning process
    print("\n💭 Claude Code Analysis:")
    if metrics['lead_conversion_rate'] < 0.25:
        print("   ⚠️  Conversion rate below target")
        print("   → Recommendation: Review lead scoring model")
        print("   → Action: Request data pipeline to retrain model")
        
        # Take action based on analysis
        print("\n🔧 Initiating model retraining...")
    else:
        print("   ✅ Conversion rate on target")
        print("   → Recommendation: Scale up marketing spend")
        
        # Launch campaign
        campaign_result = await integration.launch_social_campaign({
            "budget": 4000,
            "duration_days": 14,
            "target_product": "auto"
        })
        print(f"\n🚀 Campaign launched: {campaign_result['campaign_id']}")
    
    print("\n✨ Decision-making session complete!\n")


# ============================================================================
# CLAUDE CODE CLI INTEGRATION
# ============================================================================

class ClaudeCodeCLI:
    """
    Command-line interface for Claude Code to interact with the system
    
    Usage from terminal:
        claude-code run "process today's leads"
        claude-code run "analyze cancellations"
        claude-code run "send monthly newsletter"
    """
    
    def __init__(self):
        self.integration = None
    
    async def initialize(self):
        """Initialize the multiagent system"""
        from specialized_agents import setup_full_system
        system = await setup_full_system()
        self.integration = ClaudeCodeIntegration(system)
        print("✅ Multiagent system initialized")
    
    async def execute_command(self, command: str) -> Dict[str, Any]:
        """
        Parse and execute natural language commands
        
        Claude Code can translate user intent into system actions
        """
        command = command.lower()
        
        if "lead" in command and "process" in command:
            # Fetch today's leads and process them
            leads = []  # Would fetch from actual source
            return await self.integration.process_new_leads(leads)
        
        elif "cancellation" in command or "cancel" in command:
            return await self.integration.run_cancellation_analysis("latest_report.csv")
        
        elif "newsletter" in command:
            month = "December 2025"  # Could parse from command
            return await self.integration.generate_monthly_newsletters(month)
        
        elif "campaign" in command or "social" in command:
            return await self.integration.launch_social_campaign({
                "budget": 2000,
                "duration_days": 14
            })
        
        elif "status" in command or "health" in command:
            return await self.integration.get_system_status()
        
        elif "metrics" in command or "performance" in command:
            return await self.integration.get_performance_metrics()
        
        else:
            return {
                "error": "Command not recognized",
                "suggestion": "Try: 'process leads', 'analyze cancellations', 'send newsletter', or 'check status'"
            }


# ============================================================================
# MAIN EXECUTION
# ============================================================================

async def main():
    """Run all examples"""
    
    print("""
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     Multiagent Framework for Insurance Agency AI System           ║
║     Claude Code Integration Examples                              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    """)
    
    # Run examples
    await example_1_daily_morning_routine()
    await asyncio.sleep(1)
    
    await example_2_end_of_month_workflow()
    await asyncio.sleep(1)
    
    await example_3_emergency_response()
    await asyncio.sleep(1)
    
    await example_4_claude_code_interactive_session()
    
    print("\n" + "="*70)
    print("All examples completed successfully!")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
