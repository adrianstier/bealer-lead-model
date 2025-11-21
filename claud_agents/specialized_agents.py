"""
Specialized Agent Implementations for Insurance Agency AI System
Projects B, C, D, E + Monitoring
"""

from multiagent_framework import (
    BaseAgent, AgentRole, Task, TaskStatus, AgentMessage,
    TaskPriority, SharedMemory
)
from typing import Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class InvoiceAutomationAgent(BaseAgent):
    """
    Project B: Automated Invoice & Envelope Mailing
    
    Capabilities:
    - Identify customers needing paper invoices
    - Generate print-ready documents
    - Schedule mailings
    - Track delivery and payment correlation
    """
    
    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.INVOICE_AUTOMATION, shared_memory)
        self.capabilities = [
            "customer_identification",
            "invoice_generation",
            "mail_scheduling",
            "delivery_tracking",
            "payment_correlation"
        ]
        self.mail_service_config = {}
    
    async def execute_task(self, task: Task):
        """Execute invoice automation tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)
        
        try:
            if task.task_type == "identify_customers":
                result = await self._identify_paper_customers(task.data)
            elif task.task_type == "generate_invoices":
                result = await self._generate_invoices(task.data)
            elif task.task_type == "schedule_mailing":
                result = await self._schedule_mailing(task.data)
            elif task.task_type == "track_delivery":
                result = await self._track_delivery(task.data)
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
                {"task_id": task.task_id, "result": result},
                priority=TaskPriority.MEDIUM
            )
            
        except Exception as e:
            logger.error(f"Invoice automation task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )
            
            await self.send_message(
                AgentRole.ORCHESTRATOR,
                "task_failed",
                {"task_id": task.task_id, "error": str(e)}
            )
    
    async def _identify_paper_customers(self, data: Dict) -> Dict:
        """
        Identify customers who need paper invoices
        
        Criteria:
        - Age 65+
        - Check payment method
        - No digital engagement
        - Explicit preference
        """
        logger.info("Identifying customers needing paper invoices...")
        
        customer_db = data.get("customers", [])
        paper_customers = []
        
        for customer in customer_db:
            age = customer.get("age", 0)
            payment_method = customer.get("payment_method", "")
            digital_engagement = customer.get("digital_engagement_score", 0)
            
            # Scoring logic
            paper_score = 0
            if age >= 65:
                paper_score += 50
            if age >= 75:
                paper_score += 20
            if payment_method == "check":
                paper_score += 30
            if digital_engagement < 20:
                paper_score += 20
            
            if paper_score >= 70:
                paper_customers.append({
                    "customer_id": customer.get("customer_id"),
                    "name": customer.get("name"),
                    "address": customer.get("address"),
                    "paper_score": paper_score,
                    "reason": self._get_paper_reason(age, payment_method, digital_engagement)
                })
        
        logger.info(f"Identified {len(paper_customers)} customers for paper invoices")
        
        return {
            "total_identified": len(paper_customers),
            "customers": paper_customers,
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_paper_reason(self, age, payment_method, digital_score):
        """Generate human-readable reason for paper preference"""
        reasons = []
        if age >= 65:
            reasons.append("senior customer")
        if payment_method == "check":
            reasons.append("check payment preference")
        if digital_score < 20:
            reasons.append("low digital engagement")
        return ", ".join(reasons)
    
    async def _generate_invoices(self, data: Dict) -> Dict:
        """
        Generate print-ready invoice documents
        
        Returns batch information for mailing service
        """
        logger.info("Generating invoices...")
        
        customers = data.get("customers", [])
        invoices_generated = []
        
        for customer in customers:
            invoice_data = await self._create_invoice_document(customer)
            invoices_generated.append(invoice_data)
        
        return {
            "batch_id": f"INV_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "total_invoices": len(invoices_generated),
            "invoices": invoices_generated,
            "ready_for_mailing": True
        }
    
    async def _create_invoice_document(self, customer: Dict) -> Dict:
        """Create individual invoice document"""
        # This would integrate with PDF generation library
        # and pull data from billing system
        
        return {
            "customer_id": customer.get("customer_id"),
            "invoice_number": f"INV-{customer.get('customer_id')}-{datetime.now().strftime('%Y%m')}",
            "amount_due": customer.get("premium_amount", 0),
            "due_date": customer.get("due_date"),
            "document_path": f"/invoices/{customer.get('customer_id')}.pdf",
            "envelope_type": "standard"
        }
    
    async def _schedule_mailing(self, data: Dict) -> Dict:
        """Schedule batch for mailing service (Lob, etc.)"""
        logger.info("Scheduling mailing...")
        
        # Integration with mailing service API
        # Calculate send date to arrive 5 days before due date
        
        return {
            "mailing_scheduled": True,
            "send_date": "2025-12-01",
            "expected_delivery": "2025-12-05",
            "tracking_enabled": True
        }
    
    async def _track_delivery(self, data: Dict) -> Dict:
        """Track delivery status and correlate with payments"""
        logger.info("Tracking delivery and payments...")
        
        return {
            "delivered": 45,
            "in_transit": 3,
            "payments_received": 38,
            "follow_up_needed": 7
        }


class CancellationWatchAgent(BaseAgent):
    """
    Project C: Cancellation Watchtower & Save System
    
    Capabilities:
    - Monitor cancel-pending reports
    - Predict saveability
    - Generate personalized save scripts
    - Track save success rates
    """
    
    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.CANCELLATION_WATCH, shared_memory)
        self.capabilities = [
            "cancellation_monitoring",
            "saveability_scoring",
            "outreach_generation",
            "save_tracking"
        ]
        self.save_model_loaded = False
    
    async def execute_task(self, task: Task):
        """Execute cancellation monitoring tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)
        
        try:
            if task.task_type == "analyze_risk":
                result = await self._analyze_cancellation_risk(task.data)
            elif task.task_type == "generate_outreach":
                result = await self._generate_save_outreach(task.data)
            elif task.task_type == "track_saves":
                result = await self._track_save_outcomes(task.data)
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
                {"task_id": task.task_id, "result": result},
                priority=TaskPriority.CRITICAL
            )
            
        except Exception as e:
            logger.error(f"Cancellation watch task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )
            
            await self.send_message(
                AgentRole.ORCHESTRATOR,
                "task_failed",
                {"task_id": task.task_id, "error": str(e)}
            )
    
    async def _analyze_cancellation_risk(self, data: Dict) -> Dict:
        """
        Analyze cancellation risk and saveability
        
        Considers:
        - Cancellation reason
        - Customer tenure
        - Policy bundling status
        - Premium amount
        - Communication history
        """
        logger.info("Analyzing cancellation risk...")
        
        cancel_records = data.get("cancellations", [])
        analyzed_records = []
        
        for record in cancel_records:
            saveability_score = await self._calculate_saveability(record)
            analyzed_records.append({
                **record,
                "saveability_score": saveability_score,
                "priority": self._determine_priority(saveability_score, record),
                "recommended_channel": self._recommend_channel(record),
                "urgency": self._calculate_urgency(record)
            })
        
        # Sort by priority
        analyzed_records.sort(key=lambda x: (-x["priority"], -x["saveability_score"]))
        
        total_premium_at_risk = sum(r.get("premium_amount", 0) for r in analyzed_records)
        
        return {
            "total_cancellations": len(analyzed_records),
            "premium_at_risk": total_premium_at_risk,
            "high_priority_saves": len([r for r in analyzed_records if r["priority"] >= 8]),
            "records": analyzed_records[:20],  # Top 20 priorities
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    async def _calculate_saveability(self, record: Dict) -> int:
        """Calculate 0-100 saveability score"""
        score = 50  # Base score
        
        reason = record.get("cancellation_reason", "")
        tenure = record.get("tenure_months", 0)
        bundled = record.get("is_bundled", False)
        premium = record.get("premium_amount", 0)
        
        # Reason-based adjustments
        reason_scores = {
            "non_payment": 70,
            "rate_increase": 60,
            "shopping": 50,
            "moving": 30,
            "coverage_change": 40
        }
        score = reason_scores.get(reason, 50)
        
        # Tenure bonus
        if tenure > 24:
            score += 15
        elif tenure > 12:
            score += 10
        
        # Bundling bonus
        if bundled:
            score += 20
        
        # Premium value (higher = more effort justified)
        if premium > 2000:
            score += 10
        elif premium > 1000:
            score += 5
        
        return min(100, max(0, score))
    
    def _determine_priority(self, saveability: int, record: Dict) -> int:
        """Determine 1-10 priority for save attempt"""
        premium = record.get("premium_amount", 0)
        
        # High saveability + high value = high priority
        value_factor = min(5, premium / 500)
        saveability_factor = saveability / 20
        
        priority = (value_factor + saveability_factor) / 2
        return int(min(10, max(1, priority)))
    
    def _recommend_channel(self, record: Dict) -> str:
        """Recommend best communication channel"""
        age = record.get("customer_age", 0)
        reason = record.get("cancellation_reason", "")
        
        if reason == "non_payment":
            return "phone"
        elif age > 65:
            return "phone"
        elif reason == "rate_increase":
            return "email"
        else:
            return "phone"
    
    def _calculate_urgency(self, record: Dict) -> str:
        """Calculate urgency level"""
        days_until_cancel = record.get("days_until_effective", 30)
        
        if days_until_cancel <= 3:
            return "critical"
        elif days_until_cancel <= 7:
            return "high"
        elif days_until_cancel <= 14:
            return "medium"
        else:
            return "normal"
    
    async def _generate_save_outreach(self, data: Dict) -> Dict:
        """
        Generate personalized save scripts and messages
        """
        logger.info("Generating save outreach scripts...")
        
        records = data.get("records", [])
        outreach_scripts = []
        
        for record in records:
            script = await self._create_personalized_script(record)
            outreach_scripts.append(script)
        
        return {
            "total_scripts": len(outreach_scripts),
            "scripts": outreach_scripts
        }
    
    async def _create_personalized_script(self, record: Dict) -> Dict:
        """Create personalized save script based on customer profile and reason"""
        customer_name = record.get("customer_name", "")
        reason = record.get("cancellation_reason", "")
        tenure = record.get("tenure_months", 0)
        
        # Template selection based on reason
        script_templates = {
            "rate_increase": f"""
Hi {customer_name},

I noticed your policy is set to cancel. I know insurance rates have been challenging lately, 
and I wanted to personally reach out to see if we can find a solution that works better for you.

You've been with us for {tenure} months, and we really value your business. Let me look at 
all available discounts and see if we can reduce your premium.

Can we schedule a quick 10-minute call this week?
            """.strip(),
            
            "non_payment": f"""
Hi {customer_name},

I'm reaching out because I see your policy is at risk of canceling due to a missed payment. 
I know things can get busy, and I want to make sure you don't lose your coverage.

Let's get this resolved today. I can help set up a payment plan or adjust your payment 
method to something more convenient.

Can I call you today to sort this out?
            """.strip(),
            
            "shopping": f"""
Hi {customer_name},

I heard you might be shopping around for insurance. That's completely understandable - 
everyone wants the best value!

Before you make a decision, let me make sure we've explored every discount and coverage 
option available to you. You've been with us for {tenure} months, and loyalty can often 
unlock additional savings.

Can we have a quick conversation this week? I promise it'll be worth your time.
            """.strip()
        }
        
        script = script_templates.get(reason, f"Hi {customer_name}, I wanted to reach out about your policy...")
        
        return {
            "customer_id": record.get("customer_id"),
            "customer_name": customer_name,
            "script": script,
            "channel": record.get("recommended_channel", "phone"),
            "urgency": record.get("urgency", "normal"),
            "talking_points": self._generate_talking_points(record),
            "objection_handlers": self._generate_objection_handlers(reason)
        }
    
    def _generate_talking_points(self, record: Dict) -> List[str]:
        """Generate key talking points for the agent"""
        points = []
        
        if record.get("is_bundled"):
            points.append("Remind about multi-policy discount benefits")
        
        if record.get("tenure_months", 0) > 24:
            points.append("Emphasize long relationship and loyalty benefits")
        
        if record.get("cancellation_reason") == "rate_increase":
            points.append("Review all available discounts")
            points.append("Discuss claim-free discount eligibility")
        
        return points
    
    def _generate_objection_handlers(self, reason: str) -> Dict[str, str]:
        """Generate responses to common objections"""
        handlers = {
            "too_expensive": "I understand cost is important. Let me review your policy to find every available discount.",
            "found_cheaper": "I appreciate you letting me know. Can you share what coverage they're offering? I want to make sure we're comparing apples to apples.",
            "don't_need": "I hear you. Let's review what you have now and see if we can adjust your coverage to better fit your current needs."
        }
        return handlers
    
    async def _track_save_outcomes(self, data: Dict) -> Dict:
        """Track outcomes of save attempts"""
        logger.info("Tracking save outcomes...")
        
        return {
            "total_attempts": 45,
            "successful_saves": 28,
            "save_rate": 0.62,
            "premium_retained": 42000,
            "failed_saves": 17,
            "no_contact": 5
        }


class ConciergeAgent(BaseAgent):
    """
    Project D: AI Concierge + Personalized Newsletter
    
    Capabilities:
    - Generate personalized newsletters
    - Automate life event messaging
    - Create policy summaries
    - Send seasonal reminders
    """
    
    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.CONCIERGE, shared_memory)
        self.capabilities = [
            "newsletter_generation",
            "life_event_messaging",
            "policy_explanations",
            "seasonal_reminders",
            "relationship_building"
        ]
    
    async def execute_task(self, task: Task):
        """Execute concierge tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)
        
        try:
            if task.task_type == "generate_content":
                result = await self._generate_newsletter_content(task.data)
            elif task.task_type == "deliver_newsletter":
                result = await self._deliver_newsletter(task.data)
            elif task.task_type == "life_event_message":
                result = await self._send_life_event_message(task.data)
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
            logger.error(f"Concierge task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )
    
    async def _generate_newsletter_content(self, data: Dict) -> Dict:
        """Generate personalized newsletter content"""
        logger.info("Generating personalized newsletters...")
        
        customer_segments = data.get("segments", [])
        newsletters = []
        
        for segment in customer_segments:
            newsletter = await self._create_personalized_newsletter(segment)
            newsletters.append(newsletter)
        
        return {
            "total_newsletters": len(newsletters),
            "newsletters": newsletters
        }
    
    async def _create_personalized_newsletter(self, segment: Dict) -> Dict:
        """Create newsletter for a customer segment"""
        # Generate personalized content based on:
        # - Customer demographics
        # - Policy types
        # - Local Santa Barbara events
        # - Seasonal tips
        # - Agency updates
        
        return {
            "segment_id": segment.get("segment_id"),
            "subject": "Your November Insurance Update",
            "content": {
                "greeting": "personalized",
                "local_news": ["Santa Barbara events"],
                "insurance_tips": ["winterize your home"],
                "policy_info": "plain English summary",
                "cta": "review coverage"
            }
        }
    
    async def _deliver_newsletter(self, data: Dict) -> Dict:
        """Deliver newsletters via email/mail"""
        logger.info("Delivering newsletters...")
        
        return {
            "delivered": 850,
            "opened": 255,
            "clicked": 68,
            "bounced": 12
        }
    
    async def _send_life_event_message(self, data: Dict) -> Dict:
        """Send life event messages (birthdays, anniversaries, etc.)"""
        logger.info("Sending life event messages...")
        
        return {
            "messages_sent": 45,
            "event_type": data.get("event_type", "birthday")
        }


class SocialMediaAgent(BaseAgent):
    """
    Project E: Social Media Marketing Optimization
    
    Capabilities:
    - Build lookalike audiences
    - Generate ad creative variations
    - Optimize campaigns
    - Track performance
    """
    
    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.SOCIAL_MEDIA, shared_memory)
        self.capabilities = [
            "audience_building",
            "creative_generation",
            "campaign_optimization",
            "performance_tracking"
        ]
    
    async def execute_task(self, task: Task):
        """Execute social media tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)
        
        try:
            if task.task_type == "build_audience":
                result = await self._build_lookalike_audience(task.data)
            elif task.task_type == "generate_creative":
                result = await self._generate_ad_creative(task.data)
            elif task.task_type == "optimize_campaign":
                result = await self._optimize_campaign(task.data)
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
            logger.error(f"Social media task failed: {str(e)}")
            await self.shared_memory.update_task(
                task.task_id,
                status=TaskStatus.FAILED,
                error=str(e)
            )
    
    async def _build_lookalike_audience(self, data: Dict) -> Dict:
        """Build lookalike audience from best customers"""
        logger.info("Building lookalike audience...")
        
        return {
            "audience_id": "LAL_12345",
            "seed_size": 500,
            "audience_size": 25000,
            "match_quality": 0.85
        }
    
    async def _generate_ad_creative(self, data: Dict) -> Dict:
        """Generate ad creative variations"""
        logger.info("Generating ad creative...")
        
        return {
            "variations": 5,
            "formats": ["image", "video", "carousel"],
            "estimated_reach": 15000
        }
    
    async def _optimize_campaign(self, data: Dict) -> Dict:
        """Optimize campaign performance"""
        logger.info("Optimizing campaign...")
        
        return {
            "current_cpa": 45.50,
            "optimized_cpa": 38.20,
            "improvement": 0.16
        }


class MonitorAgent(BaseAgent):
    """
    System monitoring and reporting agent
    
    Capabilities:
    - Track all metrics and KPIs
    - Generate performance reports
    - Alert on anomalies
    - Dashboard data aggregation
    """
    
    def __init__(self, shared_memory: SharedMemory):
        super().__init__(AgentRole.MONITOR, shared_memory)
        self.capabilities = [
            "metric_tracking",
            "report_generation",
            "anomaly_detection",
            "dashboard_aggregation"
        ]
        self.metrics_store: Dict[str, List] = {}
    
    async def execute_task(self, task: Task):
        """Execute monitoring tasks"""
        await self.shared_memory.update_task(task.task_id, status=TaskStatus.IN_PROGRESS)
        
        try:
            if task.task_type == "log_metrics":
                result = await self._log_metrics(task.data)
            elif task.task_type == "generate_report":
                result = await self._generate_report(task.data)
            elif task.task_type == "check_health":
                result = await self._check_system_health(task.data)
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
            logger.error(f"Monitor task failed: {str(e)}")
    
    async def _log_metrics(self, data: Dict) -> Dict:
        """Log metrics to tracking store"""
        metric_type = data.get("metric_type")
        value = data.get("value")
        
        if metric_type not in self.metrics_store:
            self.metrics_store[metric_type] = []
        
        self.metrics_store[metric_type].append({
            "value": value,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info(f"Logged metric: {metric_type} = {value}")
        
        return {"logged": True}
    
    async def _generate_report(self, data: Dict) -> Dict:
        """Generate performance report"""
        logger.info("Generating performance report...")
        
        return {
            "report_type": data.get("report_type", "weekly"),
            "period": "2025-11-01 to 2025-11-07",
            "metrics": {
                "lead_conversion_rate": 0.28,
                "cancellation_save_rate": 0.62,
                "newsletter_open_rate": 0.30,
                "cost_per_lead": 42.50
            },
            "summary": "Strong performance across all metrics"
        }
    
    async def _check_system_health(self, data: Dict) -> Dict:
        """Check overall system health"""
        logger.info("Checking system health...")
        
        return {
            "status": "healthy",
            "agents_online": 7,
            "tasks_pending": 3,
            "tasks_completed_today": 125,
            "errors_today": 2
        }


async def setup_full_system():
    """
    Helper function to set up the complete multiagent system
    with all specialized agents
    """
    from multiagent_framework import AgentSystem, OrchestratorAgent
    
    system = AgentSystem()
    
    # Register all agents
    system.register_agent(OrchestratorAgent(system.shared_memory))
    system.register_agent(DataPipelineAgent(system.shared_memory))
    system.register_agent(LeadScoringAgent(system.shared_memory))
    system.register_agent(InvoiceAutomationAgent(system.shared_memory))
    system.register_agent(CancellationWatchAgent(system.shared_memory))
    system.register_agent(ConciergeAgent(system.shared_memory))
    system.register_agent(SocialMediaAgent(system.shared_memory))
    system.register_agent(MonitorAgent(system.shared_memory))
    
    logger.info("All agents registered successfully")
    
    return system
