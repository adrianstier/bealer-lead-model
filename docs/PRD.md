# Product Requirements Document (PRD)

## AI Growth System for Allstate Santa Barbara Agency

**Version:** 1.0
**Date:** November 2025
**Author:** Adrian
**Client:** Derrick Bealer, Allstate Santa Barbara

---

## Executive Summary

This PRD defines the requirements for a comprehensive AI-powered growth system for Derrick Bealer's Allstate insurance agency in Santa Barbara, California. The system consists of five integrated AI modules designed to increase revenue, reduce churn, automate manual processes, and optimize marketing spend.

### Key Objectives
1. Increase lead conversion by 20-30%
2. Reduce cancellations by 15%
3. Improve bundling rate by 25%
4. Free up ~20 hours/week of manual work
5. Achieve 2-3 tier advancement in variable compensation

### Timeline
- **Duration:** 12 weeks
- **Phase 1 (Weeks 1-3):** Data collection & model training
- **Phase 2 (Weeks 4-6):** Prototype development
- **Phase 3 (Weeks 7-9):** Production deployment
- **Phase 4 (Weeks 10-12):** Optimization & refinement

---

## Problem Statement

### Current Challenges

1. **Lead Management Inefficiency**
   - No systematic way to predict which leads will convert
   - Marketing spend not optimized against variable comp tiers
   - Difficulty identifying best demographics to target
   - Manual lead prioritization wastes valuable time

2. **Customer Retention Gaps**
   - Older customers miss payments due to lack of paper invoices
   - Cancellations not caught early enough to save
   - No proactive outreach system
   - Manual review of cancel-pending reports

3. **Communication Fragmentation**
   - No personalized customer engagement
   - Generic communications hurt retention
   - Missed opportunities for relationship building
   - Birthday/life-event messages not automated

4. **Marketing Opacity**
   - Limited insight into channel performance
   - No audience targeting based on best customers
   - Manual A/B testing of creative
   - Suboptimal cost per acquisition

### Market Context
- Rising insurance rates making retention harder
- Increasing competition in Santa Barbara market
- Customer expectations for personalized service growing
- Manual processes limiting scalability

---

## Solution Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   AI GROWTH SYSTEM                       │
├─────────────┬─────────────┬─────────────┬───────────────┤
│   Project A │   Project B │   Project C │   Project D   │
│    Lead     │   Invoice   │ Cancellation│  AI Concierge │
│ Optimization│  Automation │  Watchtower │  & Newsletter │
├─────────────┴─────────────┴─────────────┴───────────────┤
│                      Project E                           │
│              Social Media Marketing                      │
├─────────────────────────────────────────────────────────┤
│                   DATA LAYER                             │
│   Lead Data │ Customer DB │ Policy Info │ Marketing Data│
└─────────────────────────────────────────────────────────┘
```

---

## Product Requirements

### Project A: Lead Acquisition & Growth Optimization

#### Overview
AI-powered lead scoring and marketing optimization system that predicts conversion likelihood and optimizes spend against variable compensation tiers.

#### Functional Requirements

**FR-A1: Lead Scoring Model**
- System shall score incoming leads on 0-100 scale
- Model shall predict conversion probability based on:
  - Demographics (age, location, homeowner status)
  - Lead source/vendor
  - Time of day/day of week
  - Product interest
  - Historical similar-lead performance
- Model shall achieve 80%+ accuracy within 3 weeks of training
- Scores shall update as new data becomes available

**FR-A2: Variable Comp Optimization**
- System shall track progress against comp tier thresholds
- System shall calculate leads needed to reach next tier
- System shall recommend weekly marketing budget allocation
- System shall project month-end tier achievement probability

**FR-A3: Demographic Targeting**
- System shall identify top-performing demographic segments
- System shall recommend targeting adjustments weekly
- System shall track performance by zip code, age, and product

**FR-A4: Bundling Opportunity Detection**
- System shall identify leads likely to bundle
- System shall prioritize high-bundle-probability leads
- System shall recommend cross-sell timing

#### Data Requirements
- Historical leads with outcomes (2+ years ideal)
- Demographics and premium data
- Marketing source attribution
- Sales notes and disposition codes

#### Success Metrics
- Lead conversion rate improvement: 20-30%
- Marketing ROI improvement: 15%+
- Model accuracy: 80%+

#### Timeline
- Model training: Weeks 1-3
- Deployment: Week 7

---

### Project B: Automated Invoice & Envelope Mailing

#### Overview
Automated system to identify customers preferring paper communication and automatically mail invoices and correspondence.

#### Functional Requirements

**FR-B1: Customer Identification**
- System shall identify customers preferring paper invoices based on:
  - Age (65+ as primary indicator)
  - Historical communication preferences
  - Payment method (check vs. auto-pay)
  - Digital engagement metrics

**FR-B2: Invoice Processing**
- System shall extract invoice data from monthly statements
- System shall generate print-ready documents
- System shall batch for cost-effective mailing
- System shall support envelope and postcard formats

**FR-B3: Mailing Automation**
- System shall integrate with print/mail fulfillment service
- System shall schedule mailings to arrive before due dates
- System shall track delivery and success rates
- System shall log all outbound communications

**FR-B4: Payment Tracking**
- System shall correlate mailings with payment outcomes
- System shall identify at-risk accounts
- System shall measure retention impact

#### Data Requirements
- Monthly invoice files (PDF or data export)
- Customer addresses and demographics
- Payment history and preferences
- Billing cycle information

#### Success Metrics
- Reduction in senior customer lapses: 25%+
- Payment timing improvement: 10%+
- Manual processing eliminated: 100%

#### Timeline
- Prototype: Week 6
- Production: Week 7

---

### Project C: Cancellation Watchtower & Save System

#### Overview
Real-time monitoring system that identifies at-risk policies, predicts saveability, and automates personalized retention outreach.

#### Functional Requirements

**FR-C1: Cancellation Monitoring**
- System shall ingest cancel-pending reports daily/weekly
- System shall categorize by reason code:
  - Non-payment
  - Rate increase
  - Moving
  - Competitive shopping
  - Coverage change
- System shall calculate premium at risk
- System shall maintain historical cancellation database

**FR-C2: Saveability Scoring**
- System shall predict likelihood of successful save (0-100)
- Model shall consider:
  - Reason for cancellation
  - Customer tenure
  - Policy count/bundling status
  - Communication history
  - Premium amount
  - Historical save success for similar profiles
- System shall prioritize high-value, high-saveability accounts

**FR-C3: Automated Outreach**
- System shall generate personalized save scripts
- System shall recommend communication channel (phone, email, text)
- System shall draft personalized messages addressing specific concerns
- System shall schedule optimal outreach timing
- System shall support agent override and customization

**FR-C4: Dashboard & Reporting**
- Dashboard shall show:
  - Total premium at risk
  - Save opportunities by priority
  - Agent assignments
  - Save rate trends
  - Reason code distribution
- Reports shall be available daily/weekly/monthly

#### Data Requirements
- Weekly cancel-pending reports
- Reason codes and premium amounts
- Customer communication history
- Agent notes and outcomes
- Historical save attempts and results

#### Success Metrics
- Cancellation save rate improvement: 25%+
- Premium retention increase: $X annually
- Time spent on manual review: -50%

#### Timeline
- Dashboard: Week 6
- Automated outreach: Week 7

---

### Project D: AI Concierge + Personalized Newsletter

#### Overview
Automated relationship-building system delivering personalized communications throughout the customer lifecycle.

#### Functional Requirements

**FR-D1: Newsletter Generation**
- System shall generate monthly personalized newsletters
- Content shall include:
  - Local Santa Barbara news/events
  - Insurance tips relevant to customer profile
  - Policy information in plain English
  - Seasonal reminders
  - Agency updates
- Personalization shall use customer name, policy types, tenure
- System shall support multiple delivery channels (email, mail)

**FR-D2: Life Event Messaging**
- System shall send automated messages for:
  - Birthdays
  - Policy anniversaries
  - Renewal reminders
  - Post-claim check-ins
  - Life milestones (when data available)
- Messages shall be personalized and on-brand
- Timing shall be optimized for engagement

**FR-D3: Renewal Communication**
- System shall generate renewal summaries in plain English
- Summaries shall explain:
  - Coverage details
  - Premium changes and reasons
  - Bundling benefits
  - Available discounts
- System shall identify cross-sell opportunities

**FR-D4: Content Management**
- System shall maintain template library
- Templates shall be Allstate brand-compliant
- System shall support A/B testing of content
- Admin interface for content updates

#### Data Requirements
- Customer demographics (name, DOB, address)
- Policy information and renewal dates
- Service history and claims
- Communication preferences

#### Success Metrics
- Customer engagement rate: 30%+
- Referral increase: 15%+
- Retention improvement in engaged segment: 5%+

#### Timeline
- First newsletter: Week 6
- Full automation: Week 8

---

### Project E: Targeted Social Media Marketing

#### Overview
AI-powered social media advertising system using customer data to build lookalike audiences and optimize campaigns.

#### Functional Requirements

**FR-E1: Audience Building**
- System shall create custom audiences from customer list
- System shall generate lookalike audiences based on:
  - Best customers (high LTV, bundled, long tenure)
  - Recent converters
  - High referral sources
- Audiences shall be segmented by product type

**FR-E2: Campaign Management**
- System shall support platforms:
  - Meta (Facebook/Instagram)
  - Nextdoor
  - YouTube
- System shall create campaigns with:
  - Targeting parameters
  - Budget allocation
  - Creative assets
  - Landing page links
- System shall automate campaign launch

**FR-E3: Creative Optimization**
- System shall A/B test:
  - Headlines
  - Images/video
  - Call-to-action
  - Ad copy
- System shall automatically pause underperforming creative
- System shall scale winning combinations

**FR-E4: Performance Tracking**
- Dashboard shall show:
  - Cost per lead by platform
  - Conversion rate by audience
  - ROAS by campaign
  - Creative performance
- System shall attribute conversions to campaigns

#### Data Requirements
- Customer list (email, phone for matching)
- High-converting zip codes
- Brand assets (logos, images, videos)
- Allstate compliance requirements
- Landing page URLs

#### Success Metrics
- Cost per lead reduction: 20%+
- Lead quality improvement: 15%+
- Channel diversification achieved

#### Timeline
- First campaigns: Week 7
- Optimized: Week 10

---

## Non-Functional Requirements

### NFR-1: Security & Compliance
- All customer data must be encrypted at rest and in transit
- System must comply with CCPA and other applicable privacy regulations
- All customer-facing communications must comply with Allstate brand guidelines
- TCPA compliance for all automated messaging
- Audit trail for all automated actions

### NFR-2: Performance
- Lead scoring must complete within 5 seconds
- Dashboard refresh under 3 seconds
- Email/SMS delivery within 15 minutes of trigger
- System must handle 10,000+ customer records

### NFR-3: Reliability
- 99.9% uptime for critical workflows
- Automated failover for key processes
- Daily backups of all data
- Error notification within 5 minutes

### NFR-4: Usability
- Dashboards accessible via web browser
- Mobile-responsive design
- Maximum 3 clicks to key actions
- Training completed in under 2 hours

### NFR-5: Integration
- Compatible with Allstate agency management systems
- API access for future integrations
- Export capabilities for reporting
- Webhook support for real-time events

---

## Data Requirements Summary

### Required Data (Must Have)

| Data Type | Source | Format | Frequency |
|-----------|--------|--------|-----------|
| Historical leads | CRM/Lead vendors | CSV | One-time + ongoing |
| Customer database | Agency management system | CSV/API | Weekly |
| Cancel-pending reports | Allstate | Report/CSV | Daily/Weekly |
| Invoice files | Billing system | PDF/Data | Monthly |
| Variable comp tiers | Allstate | Documentation | As updated |

### Desired Data (Nice to Have)

| Data Type | Source | Format | Value |
|-----------|--------|--------|-------|
| Detailed sales notes | CRM | Text | Improves model accuracy |
| Customer interests | Service records | Text | Better personalization |
| Prior campaign results | Marketing | CSV | Baseline comparison |
| Social media analytics | Platforms | API | Attribution |

### Data Quality Requirements
- Lead records must include outcome (converted/not)
- Customer records must have valid email or phone
- Cancel-pending must include reason codes
- All dates must be parseable

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

**Week 1: Kick-off & Data Collection**
- Kick-off meeting with full team
- Begin data extraction (Britney)
- Set up development environment
- Create shared data folder
- Establish communication cadence

**Week 2: Data Processing**
- Clean and validate all data
- Identify data gaps
- Create unified customer view
- Begin feature engineering

**Week 3: Model Training**
- Train lead scoring model
- Train cancellation prediction model
- Validate model accuracy
- Create initial customer segments

**Phase 1 Deliverables:**
- Clean, analysis-ready datasets
- Lead scoring model at 80%+ accuracy
- Customer segmentation complete
- Technical documentation

### Phase 2: Build (Weeks 4-6)

**Week 4: Core Systems**
- Build lead scoring API
- Create cancellation dashboard
- Design newsletter templates
- Develop invoice processing pipeline

**Week 5: Automation Workflows**
- Implement outreach automation
- Build mailing workflow
- Create campaign structures
- Develop reporting dashboards

**Week 6: Integration & Testing**
- Connect all systems
- Test with sample data
- User acceptance testing
- Refine based on feedback

**Phase 2 Deliverables:**
- Working prototype of all 5 systems
- Test results documentation
- User training materials
- Deployment plan

### Phase 3: Launch (Weeks 7-9)

**Week 7: Production Deployment**
- Deploy all systems to production
- Train team on usage
- Launch first automations
- Monitor closely

**Week 8: Full Automation**
- Enable all automated workflows
- Launch first newsletter
- Start social campaigns
- Active monitoring

**Week 9: Stabilization**
- Address any issues
- Optimize performance
- Gather feedback
- Document learnings

**Phase 3 Deliverables:**
- All systems live in production
- Team trained and confident
- First automated campaigns running
- Performance baseline established

### Phase 4: Optimize (Weeks 10-12)

**Week 10: Performance Optimization**
- Analyze initial results
- Retrain models with new data
- Optimize social campaigns
- A/B test all channels

**Week 11: Refinement**
- Implement improvements
- Scale successful campaigns
- Automate remaining manual steps
- Prepare summary reports

**Week 12: Handoff & Planning**
- Final optimization pass
- Complete documentation
- Plan ongoing support
- Discuss Phase 2 enhancements

**Phase 4 Deliverables:**
- 15-20% reduction in manual tasks
- Optimized AI models
- Performance report
- Recommendations for future

---

## Roles & Responsibilities

### Adrian (Developer/Consultant)
- Overall project delivery
- Build and deploy all AI systems
- Train predictive models
- Create automation workflows
- Provide weekly progress reports
- Technical troubleshooting

### Derrick (Agency Owner)
- Final approval on all decisions
- Provide required data access
- Review and approve messaging
- Test systems before launch
- Communicate goals and priorities
- Participate in weekly check-ins

### Britney (Data Coordinator)
- Extract data from agency systems
- Organize files per specifications
- Verify data accuracy
- Provide ongoing data feeds
- First-line QA on outputs
- Communicate data issues

---

## Success Metrics & KPIs

### Primary Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Lead conversion rate | Baseline TBD | +20-30% | Monthly |
| Cancellation rate | Baseline TBD | -15% | Monthly |
| Bundling rate | Baseline TBD | +25% | Monthly |
| Manual hours/week | ~20 hours | Eliminated | Weekly |
| Variable comp tier | Current tier | +2-3 tiers | Quarterly |

### Secondary Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lead scoring accuracy | 80%+ | Monthly |
| Newsletter engagement | 30%+ open rate | Monthly |
| Save success rate | +25% | Monthly |
| Cost per lead | -20% | Monthly |
| Customer satisfaction | +10% | Quarterly |

### Business Impact Projections

**Revenue Impact (Year 1):**
- Lead conversion improvement: $XX,XXX
- Cancellation reduction: $XX,XXX premium saved
- Higher comp tier: $XX,XXX bonus
- **Total: Estimated 6-figure impact**

**Operational Impact:**
- 20 hours/week freed for high-value activities
- Predictable, data-driven decisions
- Scalable processes for growth

---

## Risk Management

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data quality issues | Medium | High | Early validation, data cleanup phase |
| Model accuracy below threshold | Low | High | Extended training, additional data |
| Integration challenges | Medium | Medium | API documentation, phased approach |
| Platform API changes | Low | Medium | Abstraction layer, monitoring |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data access delays | Medium | High | Early engagement with Britney |
| Compliance rejection | Low | High | Pre-review with Allstate |
| User adoption issues | Medium | Medium | Training, gradual rollout |
| Scope creep | Medium | Medium | Clear PRD, change process |

### Mitigation Strategies
1. **Phased rollout** - Test thoroughly before full deployment
2. **Human oversight** - All communications reviewed initially
3. **Kill switches** - Ability to pause any automation
4. **Regular check-ins** - Weekly status meetings
5. **Documentation** - Comprehensive runbooks

---

## Out of Scope

The following items are explicitly out of scope for this initial implementation:

1. **Claims processing automation** - Future phase
2. **Underwriting assistance** - Requires additional data
3. **Phone system integration** - Complex technical requirements
4. **Multi-agency support** - Single agency focus
5. **Custom CRM development** - Use existing systems
6. **Website redesign** - Marketing only, not web presence
7. **Mobile app development** - Web-based only

---

## Future Enhancements (Phase 2+)

### Potential Future Capabilities

1. **Advanced Analytics Dashboard**
   - Real-time KPI tracking
   - Predictive forecasting
   - Competitive benchmarking

2. **Voice AI Integration**
   - Call transcription and analysis
   - Automated call summaries
   - Sentiment detection

3. **Claims-Based Cross-Sell**
   - Proactive outreach after claims
   - Personalized coverage recommendations
   - Automated follow-up

4. **Referral Program Automation**
   - Automated referral requests
   - Reward tracking
   - Top referrer identification

5. **Price Optimization**
   - Competitive rate monitoring
   - Discount optimization
   - Retention-based pricing

---

## Appendix

### A. Glossary

- **CAC** - Customer Acquisition Cost
- **LTV** - Lifetime Value
- **Variable Comp** - Performance-based compensation tiers
- **Bundling** - Multiple policies per customer
- **Saveability** - Likelihood of retaining at-risk customer
- **Lookalike Audience** - Social media targeting based on similar customers

### B. Technical Architecture

```
Frontend: React Dashboard
    ↓
API Layer: REST/GraphQL
    ↓
Backend Services:
├── Lead Scoring Service (Python/ML)
├── Cancellation Monitor (Python)
├── Communication Engine (Python)
├── Campaign Manager (Python)
└── Reporting Service (Python)
    ↓
Data Layer:
├── PostgreSQL (structured data)
├── Redis (caching)
└── S3 (files/documents)
    ↓
External Services:
├── Email Service (SendGrid/etc)
├── SMS Service (Twilio/etc)
├── Print/Mail (Lob/etc)
└── Social APIs (Meta/etc)
```

### C. Data Flow Diagrams

**Lead Scoring Flow:**
```
New Lead → Extract Features → Score Model → Priority Queue → Agent Assignment
```

**Cancellation Save Flow:**
```
Cancel Report → Risk Assessment → Saveability Score → Outreach Queue → Agent → Outcome Tracking
```

**Newsletter Flow:**
```
Customer Segment → Content Selection → Personalization → Delivery → Engagement Tracking
```

### D. Compliance Checklist

- [ ] CCPA data handling compliance
- [ ] TCPA messaging compliance
- [ ] Allstate brand guidelines review
- [ ] Customer opt-out mechanisms
- [ ] Data retention policies
- [ ] Security audit

### E. Weekly Meeting Agenda Template

1. **Progress review** (10 min)
   - Completed tasks
   - Blockers
   - Data status

2. **Demo** (15 min)
   - New features
   - Dashboard updates
   - Model results

3. **Decisions needed** (10 min)
   - Approvals
   - Prioritization
   - Resource needs

4. **Next week plan** (5 min)
   - Key deliverables
   - Data requirements
   - Meetings needed

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | November 2025 | Adrian | Initial PRD |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Client | Derrick Bealer | | |
| Developer | Adrian | | |
| Data Coordinator | Britney | | |
