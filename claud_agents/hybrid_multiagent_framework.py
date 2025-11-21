"""
HYBRID MULTIAGENT FRAMEWORK
Combines software development lifecycle agents with domain-specific business agents

Architecture:
    Tier 1: Software Development Lifecycle (Meta-Layer)
        - Product & Research Lead
        - System Architect
        - Test & QA Engineer
        - Refactor & Documentation Engineer
    
    Tier 2: Domain Operations (Business Logic Layer)
        - Lead Scoring Agent
        - Invoice Automation Agent
        - Cancellation Watch Agent
        - Concierge Agent
        - Social Media Agent
        - Data Pipeline Agent
        - Monitor Agent
"""

import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================================
# CORE ENUMS AND DATA STRUCTURES
# ============================================================================

class AgentTier(Enum):
    """Agent tier classification"""
    META = "meta"  # Software development lifecycle
    DOMAIN = "domain"  # Business operations


class AgentRole(Enum):
    """All agent roles in the hybrid system"""
    # Tier 1: Meta-Layer (Software Development)
    PRODUCT_LEAD = "product_lead"
    SYSTEM_ARCHITECT = "system_architect"
    TEST_QA = "test_qa"
    REFACTOR_DOCS = "refactor_docs"
    
    # Tier 2: Domain Layer (Business Operations)
    ORCHESTRATOR = "orchestrator"
    LEAD_SCORING = "lead_scoring"
    INVOICE_AUTOMATION = "invoice_automation"
    CANCELLATION_WATCH = "cancellation_watch"
    CONCIERGE = "concierge"
    SOCIAL_MEDIA = "social_media"
    DATA_PIPELINE = "data_pipeline"
    MONITOR = "monitor"


class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class TaskPriority(Enum):
    CRITICAL = 4
    HIGH = 3
    MEDIUM = 2
    LOW = 1


@dataclass
class Task:
    """Enhanced task with review support"""
    task_id: str
    task_type: str
    description: str
    assigned_to: AgentRole
    priority: TaskPriority
    tier: AgentTier
    dependencies: List[str] = field(default_factory=list)
    data: Dict[str, Any] = field(default_factory=dict)
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    reviewed_by: Optional[AgentRole] = None
    result: Optional[Any] = None
    error: Optional[str] = None
    acceptance_criteria: List[str] = field(default_factory=list)
    test_plan: Optional[str] = None


@dataclass
class PRDSection:
    """Represents a section of the PRD"""
    section_id: str
    title: str
    description: str
    objectives: List[str]
    acceptance_criteria: List[str]
    assigned_agents: List[AgentRole] = field(default_factory=list)
    priority: TaskPriority = TaskPriority.MEDIUM


@dataclass
class ArchitectureDecision:
    """Architecture Decision Record (ADR)"""
    decision_id: str
    title: str
    context: str
    decision: str
    consequences: List[str]
    alternatives_considered: List[str]
    timestamp: datetime = field(default_factory=datetime.now)
    status: str = "accepted"  # proposed, accepted, deprecated


# ============================================================================
# TIER 1: META-LAYER AGENTS (Software Development Lifecycle)
# ============================================================================

class ProductResearchLead:
    """
    Tier 1 Meta Agent: Product & Research Lead
    
    Responsibilities:
    - Maintain living mental model of PRD
    - Break work into thin vertical slices
    - Define acceptance criteria
    - Coordinate task briefs for domain agents
    - Protect scope and alignment
    - Flag gold-plating and scope creep
    """
    
    def __init__(self, shared_memory):
        self.role = AgentRole.PRODUCT_LEAD
        self.tier = AgentTier.META
        self.shared_memory = shared_memory
        self.prd_sections: Dict[str, PRDSection] = {}
        self.active_slices: List[Dict] = []
    
    async def analyze_prd(self, prd_content: str) -> Dict[str, Any]:
        """
        Parse PRD and extract structured information
        
        Returns:
            - Priorities (ordered list)
            - Vertical slices (thin deliverables)
            - Success metrics
            - Scope boundaries
        """
        logger.info("🎯 Product Lead: Analyzing PRD...")
        
        # In real implementation, this would use Claude to parse the PRD
        # For now, we'll structure based on the Allstate PRD
        
        priorities = [
            {
                "id": "P1",
                "title": "Project A: Lead Scoring & Optimization",
                "rationale": "Highest immediate ROI - improves conversion 20-30%",
                "vertical_slices": [
                    "Lead scoring model (weeks 1-3)",
                    "Variable comp tracking (week 4)",
                    "Demographic targeting (week 5)"
                ]
            },
            {
                "id": "P2",
                "title": "Project C: Cancellation Prevention",
                "rationale": "Critical revenue protection - 15% cancellation reduction",
                "vertical_slices": [
                    "Risk monitoring dashboard (week 6)",
                    "Saveability scoring (week 7)",
                    "Outreach automation (week 8)"
                ]
            },
            {
                "id": "P3",
                "title": "Project B: Invoice Automation",
                "rationale": "Operational efficiency - eliminates manual work",
                "vertical_slices": [
                    "Customer identification (week 6)",
                    "Invoice generation (week 7)",
                    "Mailing automation (week 8)"
                ]
            }
        ]
        
        await self.shared_memory.set("product_lead", "priorities", priorities)
        
        return {
            "priorities": priorities,
            "total_slices": sum(len(p["vertical_slices"]) for p in priorities),
            "estimated_weeks": 12,
            "success_metrics": [
                "Lead conversion +20-30%",
                "Cancellation rate -15%",
                "Manual hours -20/week"
            ]
        }
    
    async def create_task_brief(self, slice_description: str) -> Dict[str, Any]:
        """
        Create a task brief for domain agents
        
        Brief includes:
        - Goal (user value)
        - Constraints
        - Acceptance criteria
        - Affected files/modules
        - Dependencies
        """
        logger.info(f"📋 Product Lead: Creating task brief for '{slice_description}'")
        
        # Example brief structure
        brief = {
            "slice_id": "SLICE-001",
            "goal": slice_description,
            "user_value": "Enable agents to score incoming leads automatically",
            "acceptance_criteria": [
                "Lead scoring model achieves 80%+ accuracy",
                "Scores are calculated within 1 second",
                "Results are stored and accessible to other agents",
                "Dashboard displays top 20 priority leads"
            ],
            "constraints": [
                "Must integrate with existing CRM data format",
                "Cannot modify shared memory structure",
                "Must maintain backward compatibility"
            ],
            "affected_modules": [
                "agents/lead_scoring.py",
                "models/lead_model.pkl",
                "api/scoring_endpoint.py"
            ],
            "dependencies": [
                "Data pipeline must provide clean lead data",
                "Historical lead data for model training"
            ],
            "estimated_effort": "3-5 days",
            "assigned_to": [AgentRole.SYSTEM_ARCHITECT, AgentRole.LEAD_SCORING]
        }
        
        await self.shared_memory.set("product_lead", f"brief_{brief['slice_id']}", brief)
        
        return brief
    
    async def review_scope(self, proposed_change: Dict) -> Dict[str, Any]:
        """
        Review if a proposed change aligns with PRD
        Flags gold-plating and scope creep
        """
        logger.info("🔍 Product Lead: Reviewing scope alignment...")
        
        # Check against PRD objectives
        is_in_scope = True  # Simplified - would check against PRD
        
        if not is_in_scope:
            return {
                "approved": False,
                "reason": "Not aligned with PRD priorities",
                "recommendation": "Defer to Phase 2 or remove"
            }
        
        return {
            "approved": True,
            "alignment": "high",
            "priority_impact": "supports P1 objective"
        }


class SystemArchitect:
    """
    Tier 1 Meta Agent: System Architect
    
    Responsibilities:
    - Own architecture and folder structure
    - Maintain architecture.md and ADR log
    - Propose changes before editing
    - Keep components decoupled
    - Document migration paths for refactors
    """
    
    def __init__(self, shared_memory):
        self.role = AgentRole.SYSTEM_ARCHITECT
        self.tier = AgentTier.META
        self.shared_memory = shared_memory
        self.architecture_decisions: List[ArchitectureDecision] = []
    
    async def design_architecture(self, task_brief: Dict) -> Dict[str, Any]:
        """
        Translate task brief into architecture plan
        
        Returns:
        - Module structure
        - Data models
        - API contracts
        - Integration points
        """
        logger.info("🏗️  System Architect: Designing architecture...")
        
        architecture_plan = {
            "modules": {
                "agents/lead_scoring.py": {
                    "purpose": "Lead scoring agent implementation",
                    "dependencies": ["shared_memory", "ml_models"],
                    "exports": ["LeadScoringAgent"]
                },
                "models/lead_scoring_model.py": {
                    "purpose": "ML model wrapper",
                    "dependencies": ["sklearn", "pandas"],
                    "exports": ["LeadScoringModel"]
                },
                "api/scoring.py": {
                    "purpose": "REST API endpoint for scoring",
                    "dependencies": ["fastapi", "agents/lead_scoring"],
                    "exports": ["score_lead", "batch_score"]
                }
            },
            "data_models": {
                "Lead": {
                    "fields": ["id", "name", "age", "zip", "source", "product_interest"],
                    "validations": ["age > 0", "zip in valid_zips"]
                },
                "LeadScore": {
                    "fields": ["lead_id", "score", "confidence", "priority", "timestamp"],
                    "constraints": ["score between 0-100"]
                }
            },
            "integration_points": {
                "shared_memory": "Store scores in 'lead_scoring' namespace",
                "data_pipeline": "Subscribe to 'new_lead' events",
                "monitor": "Emit 'lead_scored' metrics"
            }
        }
        
        # Document the decision
        decision = ArchitectureDecision(
            decision_id="ADR-001",
            title="Lead Scoring Architecture",
            context="Need to score leads in real-time with ML model",
            decision="Use agent-based architecture with event-driven integration",
            consequences=[
                "Agents remain loosely coupled",
                "Easy to swap ML models",
                "Scales horizontally"
            ],
            alternatives_considered=[
                "Monolithic service",
                "Lambda functions",
                "Queue-based processing"
            ]
        )
        
        self.architecture_decisions.append(decision)
        await self.shared_memory.set("architect", "current_architecture", architecture_plan)
        
        return architecture_plan
    
    async def review_implementation(self, implementation: Dict) -> Dict[str, Any]:
        """
        Review if implementation follows architecture
        """
        logger.info("🔍 System Architect: Reviewing implementation...")
        
        # Check alignment with architecture
        issues = []
        warnings = []
        
        # Example checks (would be more sophisticated)
        if "breaking_changes" in implementation:
            warnings.append("Breaking changes detected - requires migration plan")
        
        return {
            "approved": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "suggested_changes": []
        }
    
    async def update_documentation(self, changes: Dict) -> None:
        """Update architecture documentation"""
        logger.info("📝 System Architect: Updating documentation...")
        
        # Would update docs/architecture.md
        # Would update docs/decisions.md with new ADRs


class TestQAEngineer:
    """
    Tier 1 Meta Agent: Test & QA Engineer
    
    Responsibilities:
    - Define test strategy for each feature
    - Ensure test coverage
    - Review code for correctness
    - Report bugs with clear reproduction steps
    - Maintain test suites
    """
    
    def __init__(self, shared_memory):
        self.role = AgentRole.TEST_QA
        self.tier = AgentTier.META
        self.shared_memory = shared_memory
    
    async def create_test_plan(self, task_brief: Dict) -> Dict[str, Any]:
        """
        Create comprehensive test plan
        
        Covers:
        - Happy path
        - Edge cases
        - Failure modes
        - Integration points
        """
        logger.info("🧪 Test Engineer: Creating test plan...")
        
        test_plan = {
            "unit_tests": [
                {
                    "test_name": "test_lead_scoring_valid_input",
                    "scenario": "Given valid lead data, returns score 0-100",
                    "assertions": ["score >= 0", "score <= 100", "confidence > 0"]
                },
                {
                    "test_name": "test_lead_scoring_missing_fields",
                    "scenario": "Given incomplete lead data, handles gracefully",
                    "assertions": ["raises ValidationError", "error message is clear"]
                }
            ],
            "integration_tests": [
                {
                    "test_name": "test_end_to_end_lead_processing",
                    "scenario": "Lead arrives → scored → stored → dashboard updated",
                    "setup": "Mock CRM data",
                    "assertions": ["lead appears in dashboard", "score is accurate"]
                }
            ],
            "edge_cases": [
                "Lead with age = 0",
                "Lead with invalid zip code",
                "Lead with missing product interest",
                "Concurrent leads (race conditions)"
            ],
            "performance_tests": [
                {
                    "test_name": "test_scoring_latency",
                    "requirement": "Score must be calculated in < 1 second",
                    "load": "100 concurrent requests"
                }
            ]
        }
        
        await self.shared_memory.set("test_qa", "current_test_plan", test_plan)
        
        return test_plan
    
    async def review_implementation(self, implementation: Dict) -> Dict[str, Any]:
        """
        Review implementation for correctness and test coverage
        """
        logger.info("🔍 Test Engineer: Reviewing implementation...")
        
        issues = []
        
        # Check test coverage
        if "tests" not in implementation or len(implementation.get("tests", [])) < 3:
            issues.append({
                "severity": "high",
                "issue": "Insufficient test coverage",
                "requirement": "Minimum 3 tests per component"
            })
        
        # Check for error handling
        if "error_handling" not in implementation:
            issues.append({
                "severity": "medium",
                "issue": "No error handling documented",
                "requirement": "All external calls must have try/catch"
            })
        
        return {
            "approved": len([i for i in issues if i["severity"] == "high"]) == 0,
            "issues": issues,
            "test_coverage_estimate": "75%",
            "recommendations": [
                "Add tests for edge case: age = 0",
                "Add integration test for shared memory",
                "Add performance test for batch scoring"
            ]
        }
    
    async def report_bug(self, bug_details: Dict) -> Dict[str, Any]:
        """
        Create structured bug report
        """
        bug_card = {
            "bug_id": f"BUG-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "title": bug_details.get("title"),
            "steps_to_reproduce": bug_details.get("steps", []),
            "expected_behavior": bug_details.get("expected"),
            "actual_behavior": bug_details.get("actual"),
            "suspected_cause": bug_details.get("suspected_cause"),
            "severity": bug_details.get("severity", "medium"),
            "affected_components": bug_details.get("components", [])
        }
        
        logger.warning(f"🐛 Bug reported: {bug_card['bug_id']} - {bug_card['title']}")
        
        return bug_card


class RefactorDocumentationEngineer:
    """
    Tier 1 Meta Agent: Refactor & Documentation Engineer
    
    Responsibilities:
    - Improve code readability and modularity
    - Reduce duplication
    - Align naming with domain terms
    - Maintain high-level documentation
    - Ensure docs match reality
    """
    
    def __init__(self, shared_memory):
        self.role = AgentRole.REFACTOR_DOCS
        self.tier = AgentTier.META
        self.shared_memory = shared_memory
    
    async def analyze_codebase(self) -> Dict[str, Any]:
        """
        Analyze codebase for refactoring opportunities
        """
        logger.info("🔧 Refactor Engineer: Analyzing codebase...")
        
        analysis = {
            "code_smells": [
                {
                    "file": "agents/lead_scoring.py",
                    "smell": "Long method (150 lines)",
                    "suggestion": "Extract helper functions for feature engineering"
                },
                {
                    "file": "agents/cancellation_watch.py",
                    "smell": "Duplicated logic with invoice_automation.py",
                    "suggestion": "Extract shared customer identification logic"
                }
            ],
            "naming_issues": [
                {
                    "current": "process_data()",
                    "suggested": "validate_lead_data()",
                    "rationale": "Use domain terminology from PRD"
                }
            ],
            "documentation_gaps": [
                "README.md missing quick start section",
                "No API documentation",
                "Architecture decisions not documented"
            ],
            "modularity_score": 7.5,
            "test_coverage": "78%"
        }
        
        return analysis
    
    async def refactor_component(self, component: str, strategy: str) -> Dict[str, Any]:
        """
        Refactor a component without changing behavior
        """
        logger.info(f"🔧 Refactor Engineer: Refactoring {component}...")
        
        refactor_plan = {
            "component": component,
            "strategy": strategy,
            "changes": [
                "Extract 3 helper functions",
                "Rename variables to match PRD terms",
                "Add docstrings to all functions",
                "Remove dead code"
            ],
            "tests_to_validate": [
                "Run existing unit tests",
                "Run integration test suite",
                "Manual smoke test"
            ],
            "expected_improvements": {
                "readability": "+30%",
                "maintainability": "+25%",
                "lines_of_code": "-15%"
            }
        }
        
        return refactor_plan
    
    async def update_documentation(self, doc_type: str) -> None:
        """
        Update high-level documentation
        """
        logger.info(f"📝 Refactor Engineer: Updating {doc_type}...")
        
        # Would update README, architecture.md, API docs, etc.


# ============================================================================
# WORKFLOW COORDINATION
# ============================================================================

class HybridWorkflowCoordinator:
    """
    Coordinates workflows between Meta and Domain tiers
    
    Typical flow:
    1. Product Lead breaks down PRD into slices
    2. System Architect designs architecture
    3. Domain agents implement
    4. Test QA validates
    5. Refactor engineer cleans up
    """
    
    def __init__(self, shared_memory):
        self.shared_memory = shared_memory
        self.product_lead = ProductResearchLead(shared_memory)
        self.architect = SystemArchitect(shared_memory)
        self.test_qa = TestQAEngineer(shared_memory)
        self.refactor_engineer = RefactorDocumentationEngineer(shared_memory)
    
    async def execute_feature_workflow(self, feature_description: str):
        """
        Execute complete feature workflow through both tiers
        """
        logger.info(f"\n{'='*70}")
        logger.info(f"🚀 Starting Feature Workflow: {feature_description}")
        logger.info(f"{'='*70}\n")
        
        # PHASE 1: Direction (Product Lead)
        logger.info("PHASE 1: DIRECTION")
        task_brief = await self.product_lead.create_task_brief(feature_description)
        
        # PHASE 2: Architecture (System Architect)
        logger.info("\nPHASE 2: ARCHITECTURE")
        architecture = await self.architect.design_architecture(task_brief)
        
        # PHASE 3: Test Planning (Test QA)
        logger.info("\nPHASE 3: TEST PLANNING")
        test_plan = await self.test_qa.create_test_plan(task_brief)
        
        # PHASE 4: Implementation (Domain Agents - would happen here)
        logger.info("\nPHASE 4: IMPLEMENTATION")
        logger.info("→ Domain agents execute implementation...")
        
        # Simulate implementation result
        implementation = {
            "files_changed": ["agents/lead_scoring.py", "models/lead_model.pkl"],
            "tests_added": 5,
            "acceptance_criteria_met": task_brief["acceptance_criteria"]
        }
        
        # PHASE 5: Review (Test QA)
        logger.info("\nPHASE 5: QUALITY REVIEW")
        qa_review = await self.test_qa.review_implementation(implementation)
        arch_review = await self.architect.review_implementation(implementation)
        
        # PHASE 6: Refactor (if needed)
        if qa_review["approved"] and arch_review["approved"]:
            logger.info("\n✅ Feature approved - ready for deployment")
        else:
            logger.info("\n⚠️  Feature needs revisions")
        
        # PHASE 7: Documentation
        logger.info("\nPHASE 7: DOCUMENTATION")
        await self.refactor_engineer.update_documentation("feature_docs")
        
        logger.info(f"\n{'='*70}")
        logger.info("✨ Feature workflow complete")
        logger.info(f"{'='*70}\n")
        
        return {
            "task_brief": task_brief,
            "architecture": architecture,
            "test_plan": test_plan,
            "implementation": implementation,
            "qa_review": qa_review,
            "status": "complete" if qa_review["approved"] else "needs_revision"
        }


# ============================================================================
# INTEGRATION WITH EXISTING DOMAIN AGENTS
# ============================================================================

class IntegratedAgentSystem:
    """
    Combines Meta-Layer and Domain-Layer agents
    
    Meta-Layer provides governance and quality
    Domain-Layer provides business functionality
    """
    
    def __init__(self):
        from multiagent_framework import SharedMemory
        self.shared_memory = SharedMemory()
        
        # Meta-layer agents
        self.product_lead = ProductResearchLead(self.shared_memory)
        self.architect = SystemArchitect(self.shared_memory)
        self.test_qa = TestQAEngineer(self.shared_memory)
        self.refactor_engineer = RefactorDocumentationEngineer(self.shared_memory)
        
        # Workflow coordinator
        self.coordinator = HybridWorkflowCoordinator(self.shared_memory)
        
        # Domain agents would be initialized here
        # from specialized_agents import (
        #     LeadScoringAgent, CancellationWatchAgent, etc.
        # )
    
    async def start_project(self, prd_content: str):
        """
        Initialize project from PRD
        """
        logger.info("🎬 Starting project initialization...")
        
        # Product Lead analyzes PRD
        prd_analysis = await self.product_lead.analyze_prd(prd_content)
        
        logger.info(f"\n📊 PRD Analysis Complete:")
        logger.info(f"   Priorities identified: {len(prd_analysis['priorities'])}")
        logger.info(f"   Vertical slices: {prd_analysis['total_slices']}")
        logger.info(f"   Estimated timeline: {prd_analysis['estimated_weeks']} weeks")
        
        return prd_analysis
    
    async def implement_feature(self, feature_description: str):
        """
        Implement a feature using full workflow
        """
        return await self.coordinator.execute_feature_workflow(feature_description)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

async def example_hybrid_workflow():
    """
    Demonstrate hybrid workflow
    """
    
    print("""
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     HYBRID MULTIAGENT FRAMEWORK                                   ║
║     Meta-Layer + Domain-Layer Working Together                    ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    """)
    
    # Initialize system
    system = IntegratedAgentSystem()
    
    # Start project with PRD
    prd_content = "Allstate Insurance Agency AI Automation PRD..."
    await system.start_project(prd_content)
    
    # Implement first feature
    feature = "Lead scoring with ML model"
    result = await system.implement_feature(feature)
    
    print(f"\n{'='*70}")
    print("📊 Workflow Result:")
    print(f"   Status: {result['status']}")
    print(f"   QA Approved: {result['qa_review']['approved']}")
    print(f"   Test Coverage: {result['qa_review']['test_coverage_estimate']}")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    asyncio.run(example_hybrid_workflow())
