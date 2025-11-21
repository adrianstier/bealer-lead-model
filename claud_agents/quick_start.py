#!/usr/bin/env python3
"""
QUICK START SCRIPT
Run this to get started with the multiagent framework
"""

import asyncio
import os


BANNER = """
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     MULTIAGENT FRAMEWORK FOR INSURANCE AGENCY AI                  ║
║     Quick Start Setup & Demo                                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
"""


async def setup_environment():
    """Setup the environment"""
    print("🔧 Setting up environment...\n")
    
    # Create necessary directories
    dirs = ["models", "data", "invoices", "reports", "logs"]
    for dir_name in dirs:
        os.makedirs(dir_name, exist_ok=True)
        print(f"   ✓ Created directory: {dir_name}/")
    
    # Create sample data files
    print("\n📁 Creating sample data files...")
    
    # Sample leads CSV
    leads_csv = """lead_id,name,email,phone,age,zip,source,product_interest,timestamp,homeowner_status
L001,John Doe,john@example.com,805-555-0100,45,93101,website,auto,2025-11-21 08:30:00,yes
L002,Jane Smith,jane@example.com,805-555-0101,38,93103,referral,home,2025-11-21 09:15:00,yes
L003,Bob Johnson,bob@example.com,805-555-0102,52,93105,google_ads,bundle,2025-11-21 10:00:00,yes
L004,Alice Williams,alice@example.com,805-555-0103,29,93101,facebook,auto,2025-11-21 11:30:00,no
L005,Charlie Brown,charlie@example.com,805-555-0104,67,93110,referral,home,2025-11-21 14:00:00,yes"""
    
    with open("data/leads_today.csv", "w") as f:
        f.write(leads_csv)
    print("   ✓ Created data/leads_today.csv")
    
    # Sample cancellation report CSV
    cancel_csv = """policy_id,customer_id,customer_name,customer_age,cancellation_reason,effective_date,premium_amount,policy_type,tenure_months,is_bundled
P101,C001,Sarah Miller,72,non_payment,2025-12-05,1200,auto,36,False
P102,C002,Mike Davis,45,rate_increase,2025-12-10,1800,home,24,True
P103,C003,Lisa Garcia,38,shopping,2025-12-08,2200,bundle,48,True
P104,C004,Tom Wilson,55,rate_increase,2025-12-15,950,auto,12,False"""
    
    with open("data/cancel_report.csv", "w") as f:
        f.write(cancel_csv)
    print("   ✓ Created data/cancel_report.csv")
    
    print("\n✅ Environment setup complete!\n")


async def run_demo():
    """Run a quick demo of the system"""
    print("🚀 Running system demo...\n")
    
    from specialized_agents import setup_full_system
    from claude_code_integration import ClaudeCodeIntegration
    
    # Initialize system
    print("⚙️  Initializing multiagent system...")
    system = await setup_full_system()
    integration = ClaudeCodeIntegration(system)
    
    print("✅ System initialized with 7 specialized agents\n")
    
    # Show agent capabilities
    print("📋 Agent Capabilities:")
    capabilities = await integration.get_agent_capabilities()
    for agent, caps in capabilities.items():
        print(f"   • {agent:20s}: {', '.join(caps[:2])}")
    
    print("\n" + "="*70)
    print("DEMO 1: Processing New Leads")
    print("="*70 + "\n")
    
    # Process leads
    sample_leads = [
        {
            "id": "L001",
            "name": "John Doe",
            "email": "john@example.com",
            "age": 45,
            "zip": "93101",
            "source": "website",
            "product_interest": "auto",
            "is_homeowner": True
        },
        {
            "id": "L002",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "age": 38,
            "zip": "93103",
            "source": "referral",
            "product_interest": "home",
            "is_homeowner": True
        }
    ]
    
    result = await integration.process_new_leads(sample_leads)
    print(f"✅ Processed {result['processed']} leads")
    print(f"   High priority: {result['high_priority']}")
    
    print("\n" + "="*70)
    print("DEMO 2: Cancellation Analysis")
    print("="*70 + "\n")
    
    # Analyze cancellations
    cancel_result = await integration.run_cancellation_analysis("data/cancel_report.csv")
    print(f"✅ Analysis complete:")
    print(f"   Total at risk: {cancel_result['total_at_risk']}")
    print(f"   Premium at risk: ${cancel_result['premium_at_risk']:,.2f}")
    print(f"   High priority saves: {len(cancel_result['high_priority_saves'])}")
    
    print("\n" + "="*70)
    print("DEMO 3: Newsletter Generation")
    print("="*70 + "\n")
    
    # Generate newsletter
    newsletter_result = await integration.generate_monthly_newsletters("December 2025")
    print(f"✅ Newsletters generated: {newsletter_result['newsletters_generated']}")
    print(f"   Scheduled for: {newsletter_result['delivery_date']}")
    
    print("\n" + "="*70)
    print("DEMO 4: System Status")
    print("="*70 + "\n")
    
    # Check status
    status = await integration.get_system_status()
    print(f"✅ System Status: {status['system_health']}")
    print(f"   Active workflows: {status['active_workflows']}")
    print(f"   Agents online: {status['agents_online']}")
    
    print("\n" + "="*70)
    print("DEMO 5: Performance Metrics")
    print("="*70 + "\n")
    
    # Get metrics
    metrics = await integration.get_performance_metrics("week")
    print(f"📊 Weekly Performance:")
    print(f"   Lead conversion rate: {metrics['lead_conversion_rate']:.1%}")
    print(f"   Cancellation save rate: {metrics['cancellation_save_rate']:.1%}")
    print(f"   Newsletter open rate: {metrics['newsletter_open_rate']:.1%}")
    print(f"   Cost per lead: ${metrics['cost_per_lead']:.2f}")
    print(f"   Manual hours saved: {metrics['manual_hours_saved']} hrs/week")
    
    print("\n✨ Demo complete!\n")


def show_menu():
    """Show interactive menu"""
    print(BANNER)
    print("\nWhat would you like to do?\n")
    print("1. Setup environment (first time)")
    print("2. Run quick demo")
    print("3. View documentation")
    print("4. Run example workflows")
    print("5. Generate config template")
    print("6. Exit")
    print()


async def main():
    """Main entry point"""
    
    show_menu()
    
    choice = input("Enter your choice (1-6): ").strip()
    
    if choice == "1":
        await setup_environment()
        print("\n✅ Setup complete! Now you can run the demo (option 2)\n")
    
    elif choice == "2":
        if not os.path.exists("data"):
            print("\n⚠️  Please run setup first (option 1)\n")
            return
        await run_demo()
    
    elif choice == "3":
        print("\n📚 Documentation:\n")
        print("   • README.md - Complete system documentation")
        print("   • multiagent_framework.py - Core framework")
        print("   • specialized_agents.py - Agent implementations")
        print("   • claude_code_integration.py - Integration examples")
        print("   • implementation_guide.py - Production deployment guide")
        print()
    
    elif choice == "4":
        print("\n🎯 Running example workflows...\n")
        from claude_code_integration import (
            example_1_daily_morning_routine,
            example_2_end_of_month_workflow,
            example_3_emergency_response
        )
        
        await example_1_daily_morning_routine()
        await asyncio.sleep(1)
        await example_2_end_of_month_workflow()
        await asyncio.sleep(1)
        await example_3_emergency_response()
    
    elif choice == "5":
        print("\n📝 Generating configuration template...\n")
        from implementation_guide import create_config_template
        create_config_template()
    
    elif choice == "6":
        print("\n👋 Goodbye!\n")
        return
    
    else:
        print("\n❌ Invalid choice\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted. Goodbye!\n")
