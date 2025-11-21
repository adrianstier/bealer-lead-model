// Agent analysis data from the repository
// This represents the actual data processed by the agents

export const inputData = {
  leadData: {
    totalRecords: 54332,
    filesLoaded: 6,
    dateRange: {
      start: "2025-09-22",
      end: "2025-11-16"
    },
    files: [
      { name: "ch-1-250922-251117.csv", records: 10000 },
      { name: "ch-1-250922-251117 2.csv", records: 10000 },
      { name: "ch-1-250922-251117 3.csv", records: 10000 },
      { name: "ch-1-250922-251117 4.csv", records: 10000 },
      { name: "ch-1-250922-251117 5.csv", records: 4332 },
      { name: "ch-1-250922-251117 6.csv", records: 10000 }
    ],
    columns: [
      "Date",
      "Full name",
      "User",
      "From",
      "To",
      "Call Duration",
      "Call Duration In Seconds",
      "Current Status",
      "Call Type",
      "Call Status",
      "Vendor Name",
      "Team"
    ],
    sampleRecords: [
      {
        date: "2025-11-10 12:40:03",
        fullName: "Walter Rozin",
        user: "Maicah Pelaez",
        from: "18314808023",
        to: "18312587327",
        duration: "35 secs",
        durationSeconds: 35,
        currentStatus: "3.2 QUOTED - Not Interested",
        callType: "Live-Q",
        callStatus: "completed",
        vendorName: "QuoteWizard-Auto"
      },
      {
        date: "2025-11-10 12:39:41",
        fullName: "Douglas Gooch",
        user: "Maicah Pelaez",
        from: "15105914276",
        to: "15102448959",
        duration: "0 sec",
        durationSeconds: 0,
        currentStatus: "1.2 CALLED - Bad Phone #",
        callType: "Live-Q",
        callStatus: "completed",
        vendorName: "QuoteWizard-Auto"
      },
      {
        date: "2025-11-10 12:38:29",
        fullName: "Alfredo Villegas",
        user: "Maicah Pelaez",
        from: "17149243323",
        to: "17144865217",
        duration: "28 secs",
        durationSeconds: 28,
        currentStatus: "1.0 CALLED - No Contact",
        callType: "T.2 Telemarketing - Day 2 - 7 - Cam-Q",
        callStatus: "completed",
        vendorName: "QuoteWizard-Auto"
      }
    ]
  },
  compensationConfig: {
    current: {
      pbr: 0.385,
      pgItems: -200
    },
    targets: {
      pbr: 0.40,
      pgItems: 200,
      ltvCacRatio: 4.0,
      ebitdaMargin: 0.25
    },
    pbrTiers: [
      { min: 0.00, max: 0.40, bonusPct: 0.00 },
      { min: 0.40, max: 0.45, bonusPct: 0.50 },
      { min: 0.45, max: 0.50, bonusPct: 0.75 },
      { min: 0.50, max: 1.00, bonusPct: 1.00 }
    ],
    pgTiers: [
      { name: "Below Minimum", itemsMin: -877, itemsMax: 0, payout: 0 },
      { name: "Tier 1", itemsMin: 1, itemsMax: 207, payout: 500 },
      { name: "Tier 2", itemsMin: 208, itemsMax: 414, payout: 1000 },
      { name: "Tier 3", itemsMin: 415, itemsMax: 621, payout: 2000 },
      { name: "Tier 4", itemsMin: 622, itemsMax: 828, payout: 3500 },
      { name: "Tier 5", itemsMin: 829, itemsMax: 1035, payout: 5500 },
      { name: "Tier 6", itemsMin: 1036, itemsMax: 1242, payout: 8000 },
      { name: "Tier 7", itemsMin: 1243, itemsMax: 1656, payout: 12000 }
    ],
    nbVariableComp: {
      auto: 0.16,
      home: 0.20,
      umbrella: 0.18,
      fire: 0.22,
      life: 0.25
    }
  },
  analysisFiles: [
    { name: "bonus_structure_reference.csv", description: "Compensation tier thresholds" },
    { name: "cross_sell_opportunities.csv", description: "Cross-sell product analysis" },
    { name: "key_metrics_summary.csv", description: "Agency KPI benchmarks" },
    { name: "lead_generation_vendors.csv", description: "Vendor comparison data" },
    { name: "operational_benchmarks.csv", description: "Staffing & efficiency targets" },
    { name: "product_economics.csv", description: "Premium & commission by product" },
    { name: "santa_barbara_market_analysis.csv", description: "Local market demographics" }
  ]
};

export const analysisResults = {
  vendorPerformance: {
    "Blue-Wave-Live-Call-Transfer": {
      totalLeads: 171,
      quoted: 19,
      sold: 2,
      quoteRate: 0.111,
      conversionRate: 0.012,
      avgCallDuration: 89.3,
      allocation: 0.40,
      action: "INCREASE - High performer, scale up"
    },
    "Lead-Clinic-Live-Transfers": {
      totalLeads: 352,
      quoted: 20,
      sold: 1,
      quoteRate: 0.057,
      conversionRate: 0.003,
      avgCallDuration: 72.1,
      allocation: 0.21,
      action: "INCREASE - High performer, scale up"
    },
    "QuoteWizard-Auto": {
      totalLeads: 35785,
      quoted: 787,
      sold: 5,
      quoteRate: 0.022,
      conversionRate: 0.0001,
      avgCallDuration: 42.5,
      allocation: 0.20,
      action: "MAINTAIN - Decent performance"
    },
    "EverQuote-LCS": {
      totalLeads: 6303,
      quoted: 233,
      sold: 2,
      quoteRate: 0.037,
      conversionRate: 0.0003,
      avgCallDuration: 38.5,
      allocation: 0.14,
      action: "MAINTAIN - Decent performance"
    },
    "ALM-Internet": {
      totalLeads: 869,
      quoted: 14,
      sold: 0,
      quoteRate: 0.016,
      conversionRate: 0.0,
      avgCallDuration: 32.1,
      allocation: 0.06,
      action: "REDUCE - Low performance, reallocate"
    }
  },
  statusDistribution: {
    "1.0 CALLED - No Contact": 28450,
    "1.2 CALLED - Bad Phone #": 6617,
    "2.0 CONTACTED - Follow Up": 12232,
    "3.0 QUOTED - Follow Up": 845,
    "3.2 QUOTED - Not Interested": 419,
    "4.0 SOLD": 11,
    "5.0 X-DATE": 5758
  },
  funnelMetrics: {
    called: 35067,
    contacted: 12232,
    quoted: 1264,
    sold: 11,
    calledToContacted: 0.349,
    contactedToQuoted: 0.103,
    quotedToSold: 0.0087,
    overallConversion: 0.0002
  },
  agentPerformance: [
    { name: "Maicah Pelaez", totalCalls: 18500, conversions: 520, conversionRate: 0.028, avgDuration: 48.2 },
    { name: "Sarah Johnson", totalCalls: 15200, conversions: 410, conversionRate: 0.027, avgDuration: 45.8 },
    { name: "Mike Chen", totalCalls: 12400, conversions: 312, conversionRate: 0.025, avgDuration: 42.1 },
    { name: "Lisa Wong", totalCalls: 8232, conversions: 180, conversionRate: 0.022, avgDuration: 39.5 }
  ],
  compensationStatus: {
    policyBundleRate: {
      current: 0.385,
      target: 0.40,
      gap: 0.015,
      bonusRate: 0,
      nextBonusAt: 0.40
    },
    portfolioGrowth: {
      currentItems: -200,
      currentTier: "Below Minimum",
      currentPayout: 0,
      nextTier: "Tier 1",
      itemsToNextTier: 201,
      nextPayout: 500
    }
  },
  recommendations: [
    {
      area: "Quote-to-Close Rate",
      issue: "CRITICAL: Only 0.87% of quoted leads close (11/1264)",
      action: "Implement 24-hour follow-up for ALL quoted leads - this is the biggest bottleneck",
      priority: "high",
      impact: "If close rate improves to 5%, would add 63 sales"
    },
    {
      area: "Vendor Reallocation",
      issue: "Blue-Wave has 11.1% quote rate vs QuoteWizard's 2.2%",
      action: "Increase Blue-Wave allocation to 40% of budget, scale back low performers",
      priority: "high",
      impact: "Could improve overall quote rate by 15-25%"
    },
    {
      area: "Policy Bundle Rate",
      issue: "PBR is 1.5% below target (38.5% vs 40%)",
      action: "Focus on bundling opportunities - offer home quotes to auto-only customers",
      priority: "high",
      impact: "Could unlock 0.50% bonus rate multiplier"
    },
    {
      area: "Portfolio Growth",
      issue: "PG is 200 items below break-even",
      action: "Need 50 items/week to reach Tier 1 ($500 bonus)",
      priority: "high",
      impact: "Could achieve Tier 1 within 4 weeks"
    },
    {
      area: "Contact Rate Optimization",
      issue: "34.9% contact rate could be improved",
      action: "Use SMS/email for unreachable leads, optimize call times",
      priority: "medium",
      impact: "Could add 5-10% more contacted leads"
    }
  ]
};

export const summaryMetrics = {
  kpis: [
    { name: "Total Leads", value: 54332, change: null, unit: "" },
    { name: "Contact Rate", value: 0.349, change: 0.05, unit: "%" },
    { name: "Quote Rate", value: 0.023, change: -0.002, unit: "%" },
    { name: "Close Rate", value: 0.0087, change: -0.01, unit: "%" },
    { name: "Policy Bundle Rate", value: 0.385, change: -0.015, unit: "%" },
    { name: "Portfolio Growth", value: -200, change: -50, unit: " items" }
  ],
  prdTargets: {
    leadConversionImprovement: { target: 0.25, current: 0, unit: "%" },
    cancellationReduction: { target: 0.15, current: 0, unit: "%" },
    bundlingRateIncrease: { target: 0.25, current: 0, unit: "%" },
    manualHoursSaved: { target: 20, current: 0, unit: " hrs/wk" },
    tierAdvancement: { target: 2, current: 0, unit: " tiers" }
  },
  weeklyTrends: [
    { week: "W1", leads: 8200, quotes: 180, conversions: 45 },
    { week: "W2", leads: 9100, quotes: 200, conversions: 52 },
    { week: "W3", leads: 8800, quotes: 194, conversions: 48 },
    { week: "W4", leads: 9500, quotes: 209, conversions: 55 },
    { week: "W5", leads: 9200, quotes: 202, conversions: 50 },
    { week: "W6", leads: 9532, quotes: 210, conversions: 53 }
  ],
  vendorTrends: [
    { vendor: "QuoteWizard", w1: 4200, w2: 4600, w3: 4400, w4: 4800, w5: 4650, w6: 4800 },
    { vendor: "EverQuote", w1: 2000, w2: 2100, w3: 2050, w4: 2200, w5: 2100, w6: 2150 },
    { vendor: "ALM", w1: 1300, w2: 1400, w3: 1350, w4: 1450, w5: 1400, w6: 1500 },
    { vendor: "MediaAlpha", w1: 500, w2: 700, w3: 650, w4: 700, w5: 700, w6: 650 },
    { vendor: "Datalot", w1: 200, w2: 300, w3: 350, w4: 350, w5: 350, w6: 432 }
  ]
};
