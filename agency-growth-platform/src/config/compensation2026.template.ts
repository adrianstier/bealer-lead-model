/**
 * Allstate 2026 Compensation Structure Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to compensation2026.ts
 * 2. Update the values based on 2026 Allstate compensation guidelines
 * 3. Update compensationConfig.ts to import and register the new config
 * 4. Change ACTIVE_YEAR to 2026 in compensationConfig.ts
 *
 * Key areas that typically change year-to-year:
 * - Tier thresholds (PBR percentages, PG item counts)
 * - Bonus percentages
 * - NB/Renewal commission rates
 * - Bigger Bundle Bonus amounts
 * - Elite qualification criteria
 */

import type { CompensationConfig } from './compensation2025';

export const compensation2026: CompensationConfig = {
  year: 2026,
  version: "1.0",
  lastUpdated: "2026-01-01", // Update when finalized

  agencyBonus: {
    policyBundleRate: {
      id: "pbr",
      name: "Policy Bundle Rate",
      description: "Percentage of policies that are bundled (Auto + HO/Condo)",
      unit: "%",
      tiers: [
        // TODO: Update thresholds and bonus percentages for 2026
        {
          id: "pbr-1",
          label: "No Bonus",
          threshold: 0,
          thresholdMax: 35.99, // May change
          bonusPercent: 0.00,
          description: "Below minimum threshold"
        },
        {
          id: "pbr-2",
          label: "Tier 1",
          threshold: 36.00, // May change
          thresholdMax: 37.99,
          bonusPercent: 0.50, // May change
          description: "Entry level performance"
        },
        {
          id: "pbr-3",
          label: "Tier 2",
          threshold: 38.00, // May change
          thresholdMax: 39.99,
          bonusPercent: 0.75, // May change
          description: "Good performance"
        },
        {
          id: "pbr-4",
          label: "Tier 3",
          threshold: 40.00, // May change
          thresholdMax: 100,
          bonusPercent: 1.00, // May change
          description: "Top tier performance"
        }
      ]
    },
    portfolioGrowth: {
      id: "pg",
      name: "Portfolio Growth",
      description: "Net item growth (new items minus lost items)",
      unit: "items",
      tiers: [
        // TODO: Update thresholds for 2026
        // These item counts are agency-specific and may be adjusted
        {
          id: "pg-1",
          label: "Tier 1",
          threshold: -877, // May change
          bonusPercent: 0.0500,
          description: "Minimum threshold"
        },
        {
          id: "pg-2",
          label: "Tier 2",
          threshold: -501, // May change
          bonusPercent: 0.5500,
          description: "Entry level growth"
        },
        {
          id: "pg-3",
          label: "Tier 3",
          threshold: -274, // May change
          bonusPercent: 1.1000,
          description: "Good growth"
        },
        {
          id: "pg-4",
          label: "Tier 4",
          threshold: -148, // May change
          bonusPercent: 2.0000,
          description: "Strong growth"
        },
        {
          id: "pg-5",
          label: "Tier 5",
          threshold: -22, // May change
          bonusPercent: 2.9000,
          description: "Excellent growth"
        },
        {
          id: "pg-6",
          label: "Tier 6",
          threshold: 330, // May change
          bonusPercent: 3.5000,
          description: "Outstanding growth"
        },
        {
          id: "pg-7",
          label: "Tier 7",
          threshold: 706, // May change
          bonusPercent: 4.0000,
          description: "Exceptional growth"
        },
        {
          id: "pg-8",
          label: "Exceptional",
          threshold: 1656, // May change
          bonusPercent: 5.0000,
          description: "Earn Back Goal - Maximum tier"
        }
      ]
    }
  },

  // TODO: Update NB/Renewal rates for 2026
  nbVariableComp: [
    {
      line: "Auto",
      newBusinessRate: 16, // May change
      renewalRate: 2.5,
      renewalRateElite: 3.5,
      notes: "Baseline qualifier"
    },
    {
      line: "Homeowners",
      newBusinessRate: 20, // May change
      renewalRate: 2.5,
      renewalRateElite: 3.5,
      notes: "Baseline qualifier, highest NB rate"
    },
    {
      line: "Condo",
      newBusinessRate: 20,
      renewalRate: 2.5,
      renewalRateElite: 3.5,
      notes: "Baseline qualifier"
    },
    {
      line: "Renters",
      newBusinessRate: 15,
      renewalRate: 2.0,
      renewalRateElite: 3.0,
      notes: "3rd line eligible"
    },
    {
      line: "Umbrella",
      newBusinessRate: 18,
      renewalRate: 2.5,
      renewalRateElite: 3.5,
      notes: "High retention, 3rd line eligible"
    },
    {
      line: "Motorcycle/Toys",
      newBusinessRate: 14,
      renewalRate: 2.0,
      renewalRateElite: 2.5,
      notes: "3rd line eligible"
    },
    {
      line: "Commercial",
      newBusinessRate: 12,
      renewalRate: 2.0,
      renewalRateElite: 2.5,
      notes: "Not baseline eligible"
    },
    {
      line: "Life/Financial",
      newBusinessRate: 25,
      renewalRate: 3.0,
      renewalRateElite: 4.0,
      notes: "Increases bundle rate"
    }
  ],

  // TODO: Update Bigger Bundle Bonus for 2026
  biggerBundleBonus: {
    condition: "3rd+ line added to household",
    amount: 50, // May change
    eligibleLines: [
      "Renters",
      "Umbrella",
      "Landlords",
      "Specialty Auto",
      "Boat",
      "RV",
      "ATV",
      "Motorcycle"
    ],
    startDate: "2026-01-01" // Update to actual start date
  },

  monthlyBaseline: {
    description: "Must hit monthly NB baseline to unlock all NB variable comp",
    eligibleLines: ["Auto", "Homeowners", "Condo"],
    targetDate: 20
  },

  // TODO: Update Elite criteria if changed for 2026
  eliteQualification: {
    criteria: [
      "Meet NB baseline 12/12 months",
      "Maintain ≥60% bundle rate",
      "High Drivewise penetration (~30%+)",
      "Keep nonstandard auto % low",
      "Strong HO retention efforts",
      "Protect renewal bundling"
    ],
    benefits: [
      "NB Variable Comp on 1st renewals of 6mo auto",
      "Highest renewal VC rates (3.5% vs 2.5%)",
      "Eligibility for quarterly bonus advances",
      "Significantly higher annual compensation"
    ]
  },

  // TODO: Adjust monthly targets based on 2026 expectations
  monthlyTargets: [
    { line: "Auto", target: 20, role: "Drives baseline + bundles" },
    { line: "Homeowners", target: 10, role: "Converts auto leads into preferred bundles" },
    { line: "Condo", target: 5, role: "Backup HO line for bundling" },
    { line: "Renters", target: 10, role: "3rd line fuel" },
    { line: "Umbrella", target: 5, role: "High retention + bigger bundle bonus" },
    { line: "Motorcycle/Toys", target: 4, role: "Easy 3rd+ line bonuses" },
    { line: "Commercial", target: 3, role: "Extra revenue" },
    { line: "Life/Financial", target: 3, role: "Increases Bundle Rate for bonus" }
  ],

  kpis: {
    daily: [
      "Auto issued today",
      "HO/Condo issued today",
      "Baseline progress %",
      "Bundle % (new policies)",
      "Preferred bundles created",
      "Missed bundle opportunities",
      "3rd line quotes generated"
    ],
    weekly: [
      "NB Baseline pace (goal: 75% by week 3)",
      "Bundle rate (goal: ≥60%)",
      "Preferred bundle rate (goal: ≥40%)",
      "3+ line sales (goal: 4-5/week)",
      "HO renewals processed",
      "Renewal save attempts",
      "Lapsing Auto/HO policies",
      "Drivewise adoption rate",
      "Agency bonus on-pace status"
    ]
  }
};

export default compensation2026;
