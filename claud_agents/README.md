# Specialized Multiagent Framework for Insurance Agency AI System

A production-ready multiagent framework designed for Claude Code to orchestrate complex insurance agency automation workflows.

## 🎯 Overview

This framework implements a coordinated multiagent system where specialized AI agents handle different aspects of an insurance agency's operations, working together to:

- **Optimize lead acquisition** (Project A)
- **Automate invoice mailing** (Project B)
- **Prevent cancellations** (Project C)
- **Build customer relationships** (Project D)
- **Maximize marketing ROI** (Project E)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                            │
│          (Master coordinator, workflow management)               │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────┬──────────┬──────────┬──────────┐
    │                 │          │          │          │          │
┌───▼───┐      ┌──────▼──┐  ┌───▼────┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼──────┐
│ Data  │      │Project A│  │Project │ │Project │ │Project │ │ Monitor │
│Pipeline│      │  Lead   │  │   B    │ │   C    │ │   D    │ │ & Report│
│ Agent │      │ Scoring │  │Invoice │ │Cancel  │ │Concierge│ │  Agent  │
└───┬───┘      │  Agent  │  │ Agent  │ │ Watch  │ │ Agent  │ └─────────┘
    │          └────┬────┘  └───┬────┘ └───┬────┘ └───┬────┘
    │               │           │          │          │
    └───────────────┴───────────┴──────────┴──────────┘
                    │
         ┌──────────▼──────────┐
         │  SHARED MEMORY      │
         │  (State, Context,   │
         │   Results, Queue)   │
         └─────────────────────┘
```

## 📦 Core Components

### 1. **Base Framework** (`multiagent_framework.py`)
- `SharedMemory`: Centralized state management with message queue
- `BaseAgent`: Abstract base class for all agents
- `OrchestratorAgent`: Master coordinator
- `Task` & `AgentMessage`: Communication primitives
- Async event loop architecture

### 2. **Specialized Agents** (`specialized_agents.py`)

| Agent | Purpose | Key Capabilities |
|-------|---------|------------------|
| **DataPipelineAgent** | Data backbone | Validation, transformation, enrichment |
| **LeadScoringAgent** | Project A | Lead scoring, conversion prediction, variable comp optimization |
| **InvoiceAutomationAgent** | Project B | Customer identification, invoice generation, mail scheduling |
| **CancellationWatchAgent** | Project C | Risk analysis, saveability scoring, outreach generation |
| **ConciergeAgent** | Project D | Newsletter generation, life event messaging |
| **SocialMediaAgent** | Project E | Audience building, creative generation, campaign optimization |
| **MonitorAgent** | System health | Metric tracking, reporting, anomaly detection |

### 3. **Claude Code Integration** (`claude_code_integration.py`)
- High-level workflow initiators
- Query & reporting interfaces
- Example usage patterns
- CLI integration

## 🚀 Quick Start

### Installation

```bash
# Clone or create project directory
mkdir insurance-ai-system
cd insurance-ai-system

# Copy framework files
cp multiagent_framework.py .
cp specialized_agents.py .
cp claude_code_integration.py .

# Install dependencies
pip install asyncio --break-system-packages
```

### Basic Usage

```python
import asyncio
from specialized_agents import setup_full_system
from claude_code_integration import ClaudeCodeIntegration

async def main():
    # Initialize the multiagent system
    system = await setup_full_system()
    integration = ClaudeCodeIntegration(system)
    
    # Process new leads
    leads = [
        {"id": "L001", "name": "John Doe", "source": "website"},
        {"id": "L002", "name": "Jane Smith", "source": "referral"}
    ]
    result = await integration.process_new_leads(leads)
    print(f"Processed {result['processed']} leads")
    
    # Analyze cancellations
    cancel_result = await integration.run_cancellation_analysis("report.csv")
    print(f"At risk: {cancel_result['total_at_risk']}")
    
    # Generate newsletters
    newsletter_result = await integration.generate_monthly_newsletters("December 2025")
    print(f"Newsletters: {newsletter_result['newsletters_generated']}")

if __name__ == "__main__":
    asyncio.run(main())
```

## 💡 Key Features

### 1. **Agent Communication**

Agents communicate via a message-passing system with priority handling:

```python
# Agent sends message to another agent
await self.send_message(
    to_agent=AgentRole.LEAD_SCORING,
    message_type="score_lead",
    content={"lead_id": "L001", "lead_data": {...}},
    priority=TaskPriority.HIGH
)
```

### 2. **Workflow Orchestration**

The orchestrator manages complex multi-step workflows:

```python
# Orchestrator creates and distributes tasks
await orchestrator.initiate_workflow("lead_processing", {
    "lead_id": "L001",
    "lead_data": {...}
})

# Workflow automatically:
# 1. Validates data (DataPipelineAgent)
# 2. Scores lead (LeadScoringAgent)
# 3. Logs metrics (MonitorAgent)
```

### 3. **Shared Memory**

Centralized state management allows agents to share context:

```python
# Store state
await shared_memory.set("lead_scoring", "model_accuracy", 0.87)

# Retrieve state
accuracy = await shared_memory.get("lead_scoring", "model_accuracy")

# Get all namespace data
lead_data = await shared_memory.get_namespace("lead_scoring")
```

### 4. **Task Dependencies**

Tasks can have dependencies, ensuring proper execution order:

```python
Task(
    task_id="score_lead",
    task_type="lead_scoring",
    assigned_to=AgentRole.LEAD_SCORING,
    dependencies=["validate_data"],  # Runs after validation
    priority=TaskPriority.HIGH
)
```

## 🔧 Customization & Extension

### Adding a New Agent

1. **Create Agent Class**:
```python
class MyCustomAgent(BaseAgent):
    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.CUSTOM, shared_memory)
        self.capabilities = ["custom_capability_1", "custom_capability_2"]
    
    async def execute_task(self, task: Task):
        # Implement task execution logic
        pass
```

2. **Register with System**:
```python
system.register_agent(MyCustomAgent(system.shared_memory))
```

### Adding a New Workflow

Add workflow creation method to `OrchestratorAgent`:

```python
async def _create_my_workflow_tasks(self, workflow_id: str, data: Dict) -> List[Task]:
    tasks = []
    
    tasks.append(Task(
        task_id=f"{workflow_id}_step1",
        task_type="my_task_type",
        assigned_to=AgentRole.MY_AGENT,
        priority=TaskPriority.HIGH,
        data=data
    ))
    
    return tasks
```

## 📊 Usage Examples

### Example 1: Daily Morning Routine

```python
async def daily_routine():
    integration = ClaudeCodeIntegration(system)
    
    # Check system health
    status = await integration.get_system_status()
    
    # Process overnight leads
    leads = fetch_overnight_leads()
    result = await integration.process_new_leads(leads)
    
    # Check for new cancellations
    cancel_result = await integration.run_cancellation_analysis("daily_report.csv")
    
    # Review metrics
    metrics = await integration.get_performance_metrics("yesterday")
    
    print("Morning routine complete!")
```

### Example 2: Emergency Response

```python
async def handle_cancellation_spike():
    integration = ClaudeCodeIntegration(system)
    
    # Immediate analysis
    analysis = await integration.run_cancellation_analysis("urgent_report.csv")
    
    if analysis['premium_at_risk'] > 100000:
        # Generate save scripts for high-priority cases
        high_priority = analysis['high_priority_saves']
        
        # Alert team
        alert_team(high_priority)
        
        # Update dashboard
        update_dashboard(analysis['dashboard_url'])
```

### Example 3: End-of-Month Workflow

```python
async def end_of_month():
    integration = ClaudeCodeIntegration(system)
    
    # Generate invoices
    invoice_result = await integration.run_invoice_automation("December 2025")
    
    # Send newsletters
    newsletter_result = await integration.generate_monthly_newsletters("December 2025")
    
    # Generate reports
    metrics = await integration.get_performance_metrics("month")
    
    # Plan next month's campaigns
    campaign = await integration.launch_social_campaign({
        "budget": 3000,
        "duration_days": 30
    })
```

## 🔍 Monitoring & Debugging

### System Health Check

```python
status = await integration.get_system_status()
print(f"Health: {status['system_health']}")
print(f"Active workflows: {status['active_workflows']}")
print(f"Tasks completed: {status['tasks_completed_today']}")
```

### Agent Capabilities

```python
capabilities = await integration.get_agent_capabilities()
for agent, caps in capabilities.items():
    print(f"{agent}: {', '.join(caps)}")
```

### Performance Metrics

```python
metrics = await integration.get_performance_metrics("week")
print(f"Lead conversion: {metrics['lead_conversion_rate']:.1%}")
print(f"Save rate: {metrics['cancellation_save_rate']:.1%}")
print(f"Cost per lead: ${metrics['cost_per_lead']:.2f}")
```

## 🎓 Best Practices

### 1. **Agent Design**
- Keep agents focused on single domain
- Use capabilities list to advertise what agent can do
- Always update shared memory with results
- Handle errors gracefully and notify orchestrator

### 2. **Workflow Design**
- Break complex workflows into small tasks
- Use dependencies to enforce execution order
- Set appropriate priorities
- Include monitoring/logging tasks

### 3. **Communication**
- Use message types consistently
- Include correlation IDs for tracking
- Set appropriate priorities
- Always respond to messages requiring response

### 4. **Memory Management**
- Use namespaces to organize data
- Clean up completed workflow data
- Cache expensive computations
- Use async locks for critical sections

## 🚦 Production Deployment

### Phase 1: Setup (Weeks 1-3)

```python
# Initialize system
system = await setup_full_system()

# Configure agents with real data sources
# - Connect to lead database
# - Configure mailing service (Lob)
# - Setup email service (SendGrid)
# - Connect to social media APIs

# Test each agent independently
```

### Phase 2: Testing (Weeks 4-6)

```python
# Run end-to-end workflows with test data
# Verify agent communication
# Load testing
# Error handling validation
```

### Phase 3: Production (Weeks 7-9)

```python
# Deploy to production environment
# Enable monitoring and alerting
# Train team on system
# Run parallel with manual processes
```

### Phase 4: Optimization (Weeks 10-12)

```python
# Analyze performance data
# Retrain ML models
# Optimize workflows
# Scale successful approaches
```

## 📈 Expected Outcomes

Based on the PRD targets:

| Metric | Target | Timeline |
|--------|--------|----------|
| Lead conversion improvement | +20-30% | Week 9 |
| Cancellation reduction | -15% | Week 9 |
| Bundling rate increase | +25% | Week 12 |
| Manual hours saved | 20 hrs/week | Week 12 |
| Variable comp advancement | +2-3 tiers | Quarter end |

## 🔒 Security & Compliance

- **Data Privacy**: All PII handled according to CCPA requirements
- **Access Control**: Role-based access to sensitive data
- **Audit Logging**: All actions logged to shared memory
- **Compliance**: TCPA-compliant messaging
- **Security**: Encrypted data transmission and storage

## 🤝 Integration Points

### External Services

The framework is designed to integrate with:

- **CRM Systems**: Salesforce, HubSpot
- **Email Services**: SendGrid, Mailgun
- **SMS Services**: Twilio
- **Mail Services**: Lob, Postcard Mania
- **Social Media**: Meta Business API, LinkedIn Ads
- **Analytics**: Google Analytics, Mixpanel
- **Monitoring**: Datadog, New Relic

### Data Sources

- Lead databases (CSV, API, Database)
- Customer databases
- Policy management systems
- Billing systems
- Marketing platforms

## 📞 Support & Maintenance

### Logging

```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Logs automatically generated by agents
logger.info("Agent started")
logger.error("Task failed: error details")
```

### Monitoring

```python
# Built-in monitoring via MonitorAgent
monitor_data = await shared_memory.get_namespace("monitor")

# Custom monitoring
await monitor_agent.log_metric("custom_metric", value)
```

## 🎯 Next Steps

1. **Review the PRD** - Ensure alignment with business objectives
2. **Setup development environment** - Install dependencies
3. **Run examples** - Execute `claude_code_integration.py`
4. **Customize agents** - Adapt to specific data sources
5. **Test workflows** - Validate end-to-end processes
6. **Deploy gradually** - Phased rollout per PRD timeline
7. **Monitor & optimize** - Continuous improvement

## 📚 Additional Resources

- **PRD**: Complete project requirements document
- **Architecture Diagrams**: System design documentation
- **API Documentation**: External service integration guides
- **Training Materials**: Team onboarding resources

## 📝 License & Credits

Created for Allstate Santa Barbara Agency
Developer: Adrian
Version: 1.0
Date: November 2025

---

**Ready to transform your insurance agency with AI? Let's get started! 🚀**
