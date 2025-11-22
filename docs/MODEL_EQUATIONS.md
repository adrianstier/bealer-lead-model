# Derrick's Agency Growth Model - Complete Equation Reference

## Version 5.4 - Updated November 2025

---

## Input Parameters

### Agency Current State
| Parameter | Variable | Derrick's Value | Unit |
|-----------|----------|-----------------|------|
| Current Policies | `currentPolicies` | 1,424 | policies |
| Current Customers | `currentCustomers` | 876 | customers |
| Policies Per Customer (PPC) | `ppc = currentPolicies / currentCustomers` | 1.63 | ratio |
| Average Premium | `averagePremium` | $2,963 | $/policy/year |
| Commission Rate | `commissionPayout` | 10% | % of premium |
| Annual Retention | `targetRetentionRate` | 97.5% | % retained/year |

### Marketing Parameters (V5.3 Updated)
| Parameter | Variable | Derrick's Value | Unit |
|-----------|----------|-----------------|------|
| Live Transfer Spend | `additionalLeadSpend` | $0 | $/month (adjust to model ROI) |
| Cost Per Lead | `costPerLead` | $55 | $/lead |
| Bound Conversion Rate | `targetConversionRate` | 10% | % of live transfers |
| Referral/Digital/Partnerships | `marketing.*` | $0 | $/month (can explore) |

**V5.4 Changes:**
- Derrick currently spends $0/month on lead generation
- Model allows exploring return on investment of investing in live transfers
- Live transfers convert at 10% (1 in 10 becomes customer)
- Lead-generated customers buy 1 policy initially (typically auto)
- Walk-in/organic sales: 12-15 policies/month (avg 13.5) not from paid leads
- Churn updated: avg 3 policies/month (range 0-6)
- Example: $3,000/month spend → ~131 new policies over 24 months (plus organic)

---

## Core Equations

### 1. Monthly Retention Rate
Convert annual retention to monthly:
```
monthlyRetention = annualRetention^(1/12)
```
Example: 98.6% annual → 0.986^(1/12) = 0.99883 monthly (99.88%)

### 2. Monthly Customer Churn
Customers lost per month:
```
monthlyCustomerChurn = currentCustomers × (1 - monthlyRetention)
```
Example: 1,100 × (1 - 0.99883) = 1.29 customers/month

### 3. Monthly Policy Churn
**Key insight**: When a customer leaves, they take ALL their policies with them.
```
monthlyPolicyChurn = monthlyCustomerChurn × PPC
```
Example: 1.96 × 1.53 = 3.0 policies/month (~3 policies lost, range 0-6)

### 4. Monthly Leads Generated (V5.3)
```
monthlyLeads = additionalLeadSpend / costPerLead
```
Example: $3,000 / $55 = 54.5 leads/month

### 5. Monthly New Customers (V5.3)
```
newCustomers = monthlyLeads × conversionRate
```
Example: 54.5 × 0.10 = 5.45 new customers/month

### 6. Monthly New Policies (V5.4 Updated)
**Key insight**: Lead-generated customers buy 1 policy initially (typically auto).
Referral customers bundle better (up to 1.3 policies).
Walk-in sales are organic policies not from paid leads.
```
leadGenPolicies = leadGenCustomers × 1.0  // 1 policy per lead
referralPolicies = referralCustomers × min(PPC, 1.3)  // Referrals bundle better
walkInPolicies = organicSalesPerMonth  // 12-15/month avg
newPolicies = leadGenPolicies + referralPolicies + walkInPolicies
```
Example: 5.45 (leads) + 0 (referrals) + 13.5 (walk-ins) = 18.95 new policies/month

### 7. Net Monthly Policy Change
```
netChange = newPolicies - monthlyPolicyChurn
```
Example: 18.95 - 3.0 = +15.95 policies/month (with $3K/mo lead spend + organic)

### 8. Annual Policy Growth (V5.3)
```
annualChange = netChange × 12
yearEndPolicies = currentPolicies + annualChange
growthRate = (annualChange / currentPolicies) × 100
```
Example:
- Annual change: 3.48 × 12 = +41.8 policies/year
- Year-end: 1,687 + 42 = 1,729 policies
- Growth rate: 41.8 / 1,687 = +2.5%

**24-Month Back-of-Envelope Validation:**
- $3,000/mo × 24 months = $72,000 total spend
- $72,000 ÷ $55/lead = 1,309 leads
- 1,309 × 10% conversion = 131 new customers
- 131 customers × 1 policy = **~131 new policies** from live transfers
- (Plus organic referrals from existing 1,100 customers)

---

## Financial Equations

### 9. Monthly Revenue (Commission Income)
```
monthlyRevenue = policies × (averagePremium / 12) × (commissionPayout / 100)
```
Example: 1,687 × ($2,501/12) × 0.10 = $35,145/month

### 10. Annual Premium Book
```
annualPremium = policies × averagePremium
```
Example: 1,687 × $2,501 = $4,219,187/year

### 11. Commission on New Business
First-year commission paid upfront on annual premium:
```
newBusinessCommission = newPolicies × averagePremium × (commissionRate / 100)
```
Example: 5.0 × $2,501 × 0.10 = $1,251/month

---

## Unit Economics

### 12. Customer Acquisition Cost (CAC)
Marketing spend per new customer acquired:
```
CAC = totalMarketingCost / totalNewCustomers
```
Where:
- `totalMarketingCost = monthlyLeadSpend × months`
- `totalNewCustomers = newCustomers × months`

Example (12 months):
- Marketing: $4,500 × 12 = $54,000
- New customers: 3.27 × 12 = 39.3
- CAC = $54,000 / 39.3 = $1,375/customer

### 13. Customer Lifetime (Years)
Average years a customer stays:
```
lifetimeYears = 1 / (1 - annualRetention)
```
Capped at 10 years for very high retention.

Example: 1 / (1 - 0.986) = 71.4 years → capped at 10 years

### 14. Lifetime Value (LTV)
Total commission from a customer over their lifetime:
```
LTV = PPC × averagePremium × (commissionPayout / 100) × lifetimeYears
```
Example: 1.53 × $2,501 × 0.10 × 10 = $3,827/customer

### 15. LTV:CAC Ratio
```
ltvCacRatio = LTV / CAC
```
Example: $3,827 / $1,375 = 2.8x

**Benchmarks**:
- < 1.0: Losing money on acquisition
- 1.0 - 3.0: Acceptable
- 3.0 - 5.0: Good
- > 5.0: Excellent (or under-investing in growth)

---

## Break-Even Analysis

### 16. Break-Even Lead Spend
Monthly spend needed to offset churn:
```
breakEvenSpend = (monthlyPolicyChurn / (conversionRate × PPC)) × costPerLead
```
Example: (1.97 / (0.04 × 1.53)) × $55 = $1,771/month

### 17. Break-Even Conversion Rate
Conversion needed to offset churn at current spend:
```
breakEvenConversion = (monthlyPolicyChurn / (monthlyLeads × PPC)) × 100
```
Example: (1.97 / (81.8 × 1.53)) × 100 = 1.57%

### 18. Progress to Break-Even
```
breakEvenProgress = (newPolicies / monthlyPolicyChurn) × 100
```
Example: (5.0 / 1.97) × 100 = 254% (well above break-even)

---

## Sensitivity Analysis

### Impact of Each Lever (per unit change)

| Lever | Change | Impact on Annual Net |
|-------|--------|---------------------|
| Retention | +1% | ~17 fewer losses/year |
| Conversion | +1% | ~20 more policies/year |
| Lead Spend | +$1,000/mo | ~1.1 policies/year |
| Cost Per Lead | -$10 | ~2 more policies/year |

### Calculation for Each Lever

**Retention Impact**:
```
For each retention value:
  customerChurn = customers × (1 - retention^(1/12))
  policyChurn = customerChurn × PPC
  annualNet = (newPolicies - policyChurn) × 12
```

**Conversion Impact**:
```
For each conversion value:
  newPols = monthlyLeads × conversion × PPC
  annualNet = (newPols - baseChurn) × 12
```

**Lead Spend Impact**:
```
For each spend value:
  leads = spend / CPL
  newPols = leads × conversion × PPC
  annualNet = (newPols - baseChurn) × 12
```

**CPL Impact**:
```
For each CPL value:
  leads = baseSpend / CPL
  newPols = leads × conversion × PPC
  annualNet = (newPols - baseChurn) × 12
```

---

## Scenario Multipliers

Three scenarios apply multipliers to base calculations:

| Scenario | Conversion Mult. | Retention Mult. |
|----------|------------------|-----------------|
| Conservative | 0.85 | 1.00 |
| Moderate | 1.00 | 1.00 |
| Aggressive | 1.15 | 1.02 |

---

## Channel-Specific Metrics

| Channel | CPL | Bound Rate | Notes |
|---------|-----|------------|-------|
| Referral | $15 | 8% | Trust factor |
| Digital | $30 | 2% | High volume, low intent |
| Traditional | $55 | 4% | Live transfers (primary) |
| Partnerships | $25 | 6% | Pre-qualified |

---

## Derrick's Current Numbers (V5.4 Calculated)

Using the equations above with Derrick's inputs from All Purpose Audit (Nov 14, 2025):

| Metric | Value |
|--------|-------|
| Current Policies | 1,424 |
| Current Customers | 876 |
| Policies Per Customer | 1.63 |
| Average Premium | $2,963/policy |
| Monthly Retention Rate | 99.79% |
| Monthly Customer Churn | 1.8 customers |
| Monthly Policy Churn | 3.0 policies (avg, range 0-6) |
| Walk-in Sales | 13.5 policies/month (organic) |
| Net Monthly Change (organic only) | +10.5 policies |
| Annual Growth (organic only) | +126 policies (+8.8%) |
| Year-End Policies | 1,550 |
| Monthly Revenue | $35,145 |
| Customer Acquisition Cost | $0 (all organic) |
| Lifetime Value | $4,830 |
| Lifetime Value : Acquisition Cost | N/A (no paid leads) |

**Product Mix:**
| Product | Policies |
|---------|----------|
| Auto (Private + Special) | 620 |
| Property (HO + Renters + Condo + Landlords) | 721 |
| Personal Umbrella | 74 |
| Boat | 9 |

**With $3K/mo Lead Spend:**
| Metric | Value |
|--------|-------|
| Monthly Leads | 54.5 |
| Monthly New Customers | 5.45 |
| Total New Policies | 18.95 (5.45 leads + 13.5 walk-ins) |
| Net Monthly Change | +15.95 policies |
| Annual Growth | +191 policies (+13.4%) |
| Customer Acquisition Cost | $550 |
| Lifetime Value : Acquisition Cost | 8.8x |

---

## Validation Checks

1. **Churn matches actual**: ~3 policies/month lost (avg), range 0-6 (confirmed by user)
2. **Walk-ins match actual**: 12-15 policies/month from organic sources (confirmed by user)
3. **Retention converts correctly**: 97.8% annual → 99.82% monthly
4. **Lifetime value reasonable**: $3,827 for 10-year customer lifetime
5. **Growth positive**: Adding 10+ policies/month net (organic only)

---

## Code Locations

- **Backend calculations**: [App.tsx](../agency-growth-platform/src/App.tsx) lines 530-720
- **Frontend sliders**: [App.tsx](../agency-growth-platform/src/App.tsx) lines 2686-2720
- **Sensitivity analysis**: [App.tsx](../agency-growth-platform/src/App.tsx) lines 3055-3120
- **Benchmarks constants**: [App.tsx](../agency-growth-platform/src/App.tsx) lines 150-180
