// Planning data extracted from Bealer Planning HTML
// Version: November 2025

export const planningData = {
  header: {
    title: "AI-Enabled Growth System",
    subtitle: "Strategic Blueprint for Allstate Santa Barbara & Goleta",
    meta: {
      for: "Derrick Bealer, Allstate Agent",
      by: "Adrian",
      date: "November 2025"
    }
  },

  executive: {
    opportunity: {
      icon: "target",
      title: "The Opportunity",
      description: "Santa Barbara/Goleta represents one of the most competitive and high-value personal lines markets with significant retiree population, high-value homeowners, and tech professionals."
    },
    challenge: {
      icon: "zap",
      title: "The Challenge",
      description: "Rising rate pressure, increased cancellation risk, manual processes, and limited scalability threaten growth potential and customer retention."
    },
    solution: {
      icon: "bot",
      title: "The Solution",
      description: "A five-pillar integrated AI system that creates predictable, scalable growth through automation, personalization, and data-driven decision making."
    },
    lifecycle: ["Attract", "Convert", "Protect", "Nurture", "Upsell", "Retain"]
  },

  projects: [
    {
      id: "A",
      title: "AI Lead Acquisition & Growth Optimization",
      tagline: "Predictive lead scoring and return on investment optimization",
      problem: [
        "No data-driven way to identify which demographics convert best",
        "Unclear optimal lead spending levels",
        "Can't predict leads needed to hit variable comp thresholds",
        "No insight into bundling probability"
      ],
      solution: [
        "Machine learning predictive lead scoring",
        "Demographic segmentation model",
        "Automated weekly budget optimization",
        "Return on investment and variable comp trajectory forecasting",
        "Natural language processing analysis of customer interactions"
      ],
      dataNeeded: [
        "Historical lead files with outcomes",
        "Customer demographics and premium amounts",
        "Marketing source per lead",
        "Sales activity logs and notes",
        "Variable compensation thresholds"
      ]
    },
    {
      id: "B",
      title: "Automated AI Invoice & Envelope Mailing",
      tagline: "Retention engine for high-value older customers",
      problem: [
        "Older customers expect paper invoices and clear reminders",
        "Allstate's digital-first approach creates frustration",
        "Missed payments lead to preventable cancellations"
      ],
      solution: [
        "Automated invoice downloading and parsing",
        "Personalized paper mail packet generation",
        "Auto-classification of high-risk customers",
        "Address validation and label printing",
        "Retention risk scoring"
      ],
      dataNeeded: [
        "Monthly invoice files (PDF)",
        "Customer addresses and demographics",
        "Payment history",
        "Billing preferences",
        "Complaints/notes about billing confusion"
      ]
    },
    {
      id: "C",
      title: "AI Cancellation Watchtower & Save System",
      tagline: "Proactive risk monitoring and automated outreach",
      problem: [
        "Cancellation data difficult to review manually",
        "Missed outreach opportunities",
        "Preventable customer losses",
        "Lost premium and bonus potential"
      ],
      solution: [
        "Weekly auto-download of cancel-pending list",
        "Predictive cancellation risk modeling",
        "Urgency categorization (red/yellow/green)",
        "Personalized texts, emails, and call scripts",
        "Dashboard showing premium at risk"
      ],
      dataNeeded: [
        "Weekly cancel-pending reports",
        "Reason codes and renewal dates",
        "Contact information",
        "Historical save attempts and notes",
        "Premium per policy and communication logs"
      ]
    },
    {
      id: "D",
      title: "AI Concierge + Personalized Newsletter",
      tagline: "Automated relationship building and engagement",
      problem: [
        "Customers rarely hear from agent unless issues arise",
        "Rising rates require proactive communication",
        "Missed opportunities for trust-building",
        "Limited cross-selling and referral generation"
      ],
      solution: [
        "AI-generated monthly personalized newsletters",
        "Birthday, holiday, and life-event messages",
        "Plain-English renewal summaries",
        "Post-claim check-ins",
        "Local Santa Barbara content integration"
      ],
      dataNeeded: [
        "Age, household structure, and renewal dates",
        "Policy mix and birthdays",
        "Customer interests (simple survey)",
        "Service history and claim history"
      ]
    },
    {
      id: "E",
      title: "AI Targeted Social Media Marketing",
      tagline: "Intelligent audience targeting and ad optimization",
      problem: [
        "Limited lead sources",
        "Missed opportunity to target ideal customers",
        "High acquisition costs",
        "Low brand visibility in local market"
      ],
      solution: [
        "Predictive audience modeling",
        "AI-generated ad creative (copy + images + scripts)",
        "Automated A/B testing",
        "Budget optimization across platforms",
        "Conversion probability forecasting"
      ],
      dataNeeded: [
        "Customer list for lookalike audiences",
        "High-converting zip codes",
        "Brand images and videos",
        "Allstate compliance requirements",
        "Lead outcomes and household demographics"
      ]
    }
  ],

  timeline: {
    intro: "12-week phased rollout with measurable milestones",
    phases: [
      {
        number: 1,
        title: "Data Collection & AI Model Setup",
        duration: "Weeks 1-3",
        tasks: [
          "Collect all datasets from agency systems",
          "Clean and normalize data",
          "Build lead scoring models",
          "Build cancellation prediction models",
          "Create customer personas and segments",
          "Establish data pipelines"
        ],
        deliverable: "Validated datasets and trained AI models"
      },
      {
        number: 2,
        title: "Prototype Automation Systems",
        duration: "Weeks 4-6",
        tasks: [
          "Build AI invoice parser and mailing system",
          "Create cancellation dashboard with risk triage",
          "Develop first version of personalized newsletters",
          "Build social ad generator and targeting system",
          "Create executive AI summarization tool",
          "Test workflows with sample data"
        ],
        deliverable: "Working prototypes for all five systems"
      },
      {
        number: 3,
        title: "Full Automation Deployment",
        duration: "Weeks 7-9",
        tasks: [
          "Deploy lead optimization agent to production",
          "Launch automated invoice mailing agent",
          "Activate concierge workflows",
          "Start social ad automation campaigns",
          "Implement weekly AI reporting system",
          "Train team on using AI tools"
        ],
        deliverable: "Fully operational AI systems in production"
      },
      {
        number: 4,
        title: "Optimization & Scaling",
        duration: "Weeks 10-12",
        tasks: [
          "AI accuracy training and refinement",
          "A/B testing of newsletters and ads",
          "Advanced lead forecasting implementation",
          "Full systems integration and workflow optimization",
          "Create documentation and knowledge base",
          "Establish ongoing support plan"
        ],
        deliverable: "Optimized, integrated system with full documentation"
      }
    ],
    metrics: [
      { week: "Week 3", label: "Lead Scoring Model Accuracy >80%" },
      { week: "Week 6", label: "All Prototypes Functional" },
      { week: "Week 9", label: "First Automated Campaign Live" },
      { week: "Week 12", label: "15-20% Reduction in Manual Tasks" }
    ]
  },

  benefits: [
    {
      icon: "trending-up",
      title: "Business Growth",
      items: [
        "Predictable and scalable lead generation",
        "Higher conversion rates through better targeting",
        "Improved bundling opportunities",
        "More efficient marketing spending",
        "Clear path to higher compensation tiers"
      ]
    },
    {
      icon: "shield",
      title: "Retention",
      items: [
        "Fewer preventable cancellations",
        "Stronger customer relationships",
        "Improved clarity around renewals",
        "Higher customer satisfaction scores",
        "Proactive issue resolution"
      ]
    },
    {
      icon: "settings",
      title: "Operational Efficiency",
      items: [
        "Automated monthly and weekly workflows",
        "Reduced manual labor and administrative burden",
        "More time for high-value activities",
        "AI-powered executive insights",
        "Streamlined decision-making processes"
      ]
    },
    {
      icon: "star",
      title: "Customer Experience",
      items: [
        "Personal, relevant, meaningful communication",
        "Seamless tech integration with human service",
        "Santa Barbara/Goleta-specific localization",
        "Stronger emotional connection to agency",
        "Timely, proactive support"
      ]
    }
  ],

  dataRequirements: [
    {
      category: "Customer Data",
      items: [
        "Names, emails, phone numbers",
        "Addresses",
        "Age and household structure",
        "Renewal dates",
        "Policy mix and premium amounts",
        "Birthdays",
        "Customer interests (optional)",
        "Claim history",
        "Service notes and interaction history"
      ]
    },
    {
      category: "Lead Data",
      items: [
        "Full historical lead lists (CSV/Excel)",
        "Lead sources and marketing channels",
        "Outcomes (quoted/sold/unreachable)",
        "Premium amounts and policy types",
        "Demographic data (age, zip, income proxies)",
        "Sales activity logs",
        "Notes and comments on leads",
        "Conversion timelines"
      ]
    },
    {
      category: "Cancellation Data",
      items: [
        "Weekly cancel-pending reports",
        "Cancellation reason codes",
        "Premium at risk per policy",
        "Renewal dates and policy details",
        "Communication history",
        "Historical save attempts and outcomes",
        "Customer contact information"
      ]
    },
    {
      category: "Billing Data",
      items: [
        "Monthly invoice files (PDF or similar)",
        "Payment history and dates",
        "Billing preferences (paper vs digital)",
        "Customer addresses for mailing",
        "Complaints or notes about billing confusion",
        "Auto-pay status"
      ]
    },
    {
      category: "Marketing Data",
      items: [
        "Existing brand assets (logos, images, videos)",
        "Social media account access",
        "Prior campaign results (if available)",
        "Allstate marketing compliance requirements",
        "Target zip codes and demographics",
        "Current marketing budget allocation"
      ]
    },
    {
      category: "Business Performance Data",
      items: [
        "Variable compensation thresholds",
        "Current policy counts by type",
        "Bundling rates and cross-sell data",
        "Average customer lifetime value",
        "Lead cost and return on investment metrics",
        "Retention rates by segment"
      ]
    }
  ],

  nextSteps: [
    {
      number: 1,
      title: "Review & Approve",
      description: "Review this blueprint with Derrick and get approval to proceed"
    },
    {
      number: 2,
      title: "Data Collection",
      description: "Work with Britney to gather all required datasets"
    },
    {
      number: 3,
      title: "Kick-off Meeting",
      description: "Schedule initial working session to begin Phase 1"
    },
    {
      number: 4,
      title: "Weekly Check-ins",
      description: "Establish regular progress reviews and feedback sessions"
    }
  ],

  cta: {
    title: "Ready to Transform Your Agency?",
    description: "This AI-enabled strategy positions Derrick's agency far ahead of competitors by creating a predictable, scalable, automated growth engine that attracts better customers, protects existing policies, builds deeper loyalty, and helps achieve higher year-end variable compensation.",
    primaryButton: "Schedule Kick-off Meeting",
    secondaryButton: "Download Full Proposal (PDF)"
  }
};

export type PlanningData = typeof planningData;
