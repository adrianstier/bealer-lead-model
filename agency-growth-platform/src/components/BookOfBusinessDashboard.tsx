/**
 * Book of Business Dashboard Component
 * Comprehensive analytics for Derrick's insurance agency book of business
 * Includes demographics, product mix, bundling, cross-sell opportunities, and retention analysis
 */

import { useState } from 'react';
import {
  Users,
  MapPin,
  Package,
  AlertTriangle,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  Shield,
  Home,
  Car,
  Umbrella,
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Heart,
  Zap,
  Calendar,
  FileWarning
} from 'lucide-react';

// Book of Business Data from All Purpose Audit (Nov 14, 2025)
export const bookOfBusinessData = {
  overview: {
    totalPolicies: 1424,
    uniqueCustomers: 876,
    totalPremium: 4218886,
    avgPremiumPerPolicy: 2963,
    avgPremiumPerCustomer: 4816,
    writtenPremium: 4218886, // From business metrics
    portfolioGrowthRate: 0.2987
  },
  productMix: {
    "Auto": {
      count: 585,
      percentage: 41.1,
      premium: 1637100,
      icon: Car,
      color: "bg-blue-500"
    },
    "Homeowners": {
      count: 369,
      percentage: 25.9,
      premium: 1093347,
      icon: Home,
      color: "bg-green-500"
    },
    "Renters": {
      count: 168,
      percentage: 11.8,
      premium: 29400,
      icon: Home,
      color: "bg-yellow-500"
    },
    "Condominiums": {
      count: 124,
      percentage: 8.7,
      premium: 92504,
      icon: Home,
      color: "bg-purple-500"
    },
    "Personal Umbrella": {
      count: 74,
      percentage: 5.2,
      premium: 54760,
      icon: Umbrella,
      color: "bg-cyan-500"
    },
    "Landlords": {
      count: 60,
      percentage: 4.2,
      premium: 71880,
      icon: Home,
      color: "bg-indigo-500"
    },
    "Specialty Auto": {
      count: 35,
      percentage: 2.5,
      premium: 19460,
      icon: Car,
      color: "bg-orange-500"
    },
    "Boat": {
      count: 9,
      percentage: 0.6,
      premium: 1422,
      icon: Shield,
      color: "bg-teal-500"
    }
  },
  geography: {
    "SANTA BARBARA": { count: 215, percentage: 43.2 },
    "GOLETA": { count: 145, percentage: 29.1 },
    "LOMPOC": { count: 20, percentage: 4.0 },
    "SOLVANG": { count: 11, percentage: 2.2 },
    "CARPINTERIA": { count: 9, percentage: 1.8 },
    "OTHER": { count: 98, percentage: 19.7 }
  },
  demographics: {
    // ACTUAL from All Purpose Audit analysis
    ageDistribution: {
      "Under 25": { count: 28, percentage: 3.2 },
      "25-34": { count: 70, percentage: 8.0 },
      "35-44": { count: 94, percentage: 10.8 },
      "45-54": { count: 108, percentage: 12.4 },
      "55-64": { count: 180, percentage: 20.6 },
      "65+": { count: 394, percentage: 45.1 }
    },
    avgAge: 60.2,
    medianAge: 62.0,
    avgTenure: 16.9,
    // Gender distribution
    genderDistribution: {
      "Couple": { count: 423, percentage: 48.3 },
      "Female": { count: 228, percentage: 26.0 },
      "Male": { count: 220, percentage: 25.1 },
      "Unknown": { count: 5, percentage: 0.6 }
    },
    // Marital status
    maritalStatus: {
      "Married": { count: 466, percentage: 53.2 },
      "Single": { count: 297, percentage: 33.9 },
      "Divorced": { count: 54, percentage: 6.2 },
      "Widowed": { count: 50, percentage: 5.7 },
      "Separated": { count: 6, percentage: 0.7 }
    },
    // Tenure distribution
    tenureDistribution: {
      "New (< 1 year)": { count: 67, percentage: 7.6 },
      "1-2 years": { count: 80, percentage: 9.1 },
      "3-5 years": { count: 125, percentage: 14.3 },
      "6-10 years": { count: 108, percentage: 12.3 },
      "10+ years": { count: 496, percentage: 56.6 }
    },
    // Digital engagement
    ezPayEnrollment: 31.4, // 275 of 876 customers
    myAccountRegistration: 100.0 // All customers have My Account
  },
  bundling: {
    singlePolicy: 523, // ACTUAL - high churn risk
    twoPolicy: 200,
    threePolicy: 100,
    fourPlus: 53,
    bundleRate: 40.3, // 353 of 876 have 2+ policies
    policiesPerCustomer: 1.63
  },
  crossSellOpportunities: {
    autoOnlyNeedHome: 337, // ACTUAL from audit
    homeOnlyNeedAuto: 171,
    needUmbrella: 137, // Bundled customers without umbrella
    rentersToHome: 158,
    singlePolicy: 523, // Any bundle opportunity
    totalOpportunities: 803, // Sum of specific opportunities
    estimatedPremiumPotential: 775725 // Auto + Home + Umbrella
  },
  // Top cross-sell targets with customer details
  crossSellTargets: {
    autoOnlyTopTargets: [
      { name: "EUNJU YOO", premium: 7633, tenure: 5, zip: "93111" },
      { name: "CHERLYN CHRISTIN OLIVE-JONES", premium: 7574, tenure: 35, zip: "93110" },
      { name: "APOLINAR PEREZ", premium: 7256, tenure: 12, zip: "93117" },
      { name: "JOSE RAMIREZ", premium: 7213, tenure: 27, zip: "93111" },
      { name: "VICTOR HUGO O BANOS", premium: 6981, tenure: 3, zip: "93254" }
    ],
    homeOnlyTopTargets: [
      { name: "SUSAN SHABERMAN", premium: 10457, tenure: 31, zip: "93109" },
      { name: "GREGORY BARANOFF", premium: 9632, tenure: 25, zip: "93103" },
      { name: "JUNE TAYLOR", premium: 8467, tenure: 42, zip: "93111" },
      { name: "CECIL LEE MALLATT", premium: 8029, tenure: 49, zip: "93110" },
      { name: "MICHAEL PALUMBO", premium: 7474, tenure: 29, zip: "93103" }
    ],
    umbrellaTopTargets: [
      { name: "EZZY A POZZATO", premium: 17725, tenure: 38, products: "Auto, Home" },
      { name: "LINDA SMITH", premium: 13493, tenure: 39, products: "Auto, Home" },
      { name: "MARK W FOSS", premium: 11281, tenure: 57, products: "Home, Auto" },
      { name: "CHARLES A RIHARB", premium: 11148, tenure: 41, products: "Auto, Condo, Home" },
      { name: "GARY MAXWELL", premium: 10992, tenure: 52, products: "Home, Auto, Landlord" }
    ],
    atRiskHighValue: [
      { name: "EUNJU YOO", premium: 7633, tenure: 5, product: "Auto" },
      { name: "APOLINAR PEREZ", premium: 7256, tenure: 12, product: "Auto" },
      { name: "JOSE RAMIREZ", premium: 7213, tenure: 27, product: "Auto" },
      { name: "VICTOR HUGO O BANOS", premium: 6981, tenure: 3, product: "Auto" },
      { name: "CYNTHIA HOFMANN", premium: 5853, tenure: 24, product: "Home" }
    ]
  },
  // Demographic insights for cross-sell targeting
  demographicInsights: {
    autoOnlyByAge: {
      "Under 35": { count: 61, avgPremium: 1810 },
      "35-49": { count: 86, avgPremium: 2191 },
      "50-64": { count: 90, avgPremium: 2266 },
      "65+": { count: 100, avgPremium: 1870 }
    },
    autoOnlyByGender: {
      "Couple": { count: 146, avgPremium: 2459 },
      "Female": { count: 88, avgPremium: 1610 },
      "Male": { count: 100, avgPremium: 1839 }
    },
    autoOnlyByMarital: {
      "Married": { count: 160, avgPremium: 2456 },
      "Single": { count: 142, avgPremium: 1654 }
    },
    highValueAutoOnly: 59, // $3K+ premium
    bundleRateByGender: {
      "Couple": 42.6,
      "Female": 38.2,
      "Male": 37.7
    },
    bundleRateByAge: {
      "Under 35": 15.3,
      "35-49": 23.5,
      "50-64": 39.2,
      "65+": 53.5
    },
    umbrellaByAge: {
      "35-49": { count: 9, avgPremium: 2340 },
      "50-64": { count: 39, avgPremium: 4100 },
      "65+": { count: 89, avgPremium: 4262 }
    },
    idealUmbrellaCount: 33, // $5K+ & 10+ yr tenure
    rentersByAge: {
      "Under 35": 36,
      "35-49": 49,
      "50-64": 39,
      "65+": 34
    },
    primeHomebuyerCount: 37, // Married, 35-64
    ezPayRates: {
      autoOnly: 40.1,
      umbrellaTargets: 28.5
    }
  },
  // Product demographics from All Purpose Audit analysis
  productDemographics: {
    "Auto": {
      totalPolicies: 585,
      totalPremium: 1119903,
      avgPremium: 1914,
      avgTenure: 18.1,
      byAge: {
        "Under 35": { count: 70, percentage: 12.0 },
        "35-49": { count: 114, percentage: 19.5 },
        "50-64": { count: 150, percentage: 25.6 },
        "65+": { count: 251, percentage: 42.9 }
      },
      byGender: {
        "Couple": { count: 290, percentage: 49.6 },
        "Female": { count: 149, percentage: 25.5 },
        "Male": { count: 142, percentage: 24.3 }
      },
      ezPayRate: 40.9,
      loyalCustomersPct: 56.4, // 10+ year tenure
      keyInsight: "Balanced age mix with strong couple base. 40.9% on EZPay - moderate retention risk."
    },
    "Homeowners": {
      totalPolicies: 369,
      totalPremium: 874161,
      avgPremium: 2369,
      avgTenure: 26.3,
      byAge: {
        "Under 35": { count: 11, percentage: 3.0 },
        "35-49": { count: 22, percentage: 6.0 },
        "50-64": { count: 48, percentage: 13.0 },
        "65+": { count: 288, percentage: 78.0 }
      },
      byGender: {
        "Couple": { count: 228, percentage: 61.8 },
        "Female": { count: 81, percentage: 22.0 },
        "Male": { count: 57, percentage: 15.4 }
      },
      ezPayRate: 14.1,
      loyalCustomersPct: 86.4, // 10+ year tenure
      keyInsight: "Aging book - 78% are 65+. CRITICAL: Only 14.1% on EZPay - major retention risk!"
    },
    "Renters": {
      totalPolicies: 168,
      totalPremium: 31752,
      avgPremium: 189,
      avgTenure: 6.9,
      byAge: {
        "Under 35": { count: 37, percentage: 22.0 },
        "35-49": { count: 51, percentage: 30.4 },
        "50-64": { count: 41, percentage: 24.4 },
        "65+": { count: 39, percentage: 23.2 }
      },
      byGender: {
        "Couple": { count: 31, percentage: 18.5 },
        "Female": { count: 70, percentage: 41.7 },
        "Single": { count: 101, percentage: 60.1 }
      },
      ezPayRate: 34.5,
      loyalCustomersPct: 21.4, // 10+ year tenure
      keyInsight: "Young singles - prime homebuyer pipeline. 22% under 35, avg 6.9yr tenure."
    },
    "Personal Umbrella": {
      totalPolicies: 74,
      totalPremium: 62308,
      avgPremium: 842,
      avgTenure: 17.0,
      byAge: {
        "Under 35": { count: 3, percentage: 4.1 },
        "35-49": { count: 5, percentage: 6.8 },
        "50-64": { count: 9, percentage: 12.2 },
        "65+": { count: 57, percentage: 77.0 }
      },
      byGender: {
        "Couple": { count: 49, percentage: 66.2 },
        "Female": { count: 12, percentage: 16.2 },
        "Male": { count: 13, percentage: 17.6 }
      },
      ezPayRate: 28.4,
      loyalCustomersPct: 70.3, // 10+ year tenure
      marriedPct: 66.2,
      keyInsight: "Affluent, loyal seniors - 77% are 65+, 66% married. Ideal profile for expansion."
    },
    "Landlords": {
      totalPolicies: 60,
      totalPremium: 86400,
      avgPremium: 1440,
      avgTenure: 24.9,
      byAge: {
        "Under 35": { count: 1, percentage: 1.7 },
        "35-49": { count: 3, percentage: 5.0 },
        "50-64": { count: 11, percentage: 18.3 },
        "65+": { count: 45, percentage: 75.0 }
      },
      byGender: {
        "Couple": { count: 39, percentage: 65.0 },
        "Female": { count: 12, percentage: 20.0 },
        "Male": { count: 9, percentage: 15.0 }
      },
      ezPayRate: 16.7,
      loyalCustomersPct: 91.7, // 10+ year tenure
      keyInsight: "Most loyal segment - 91.7% are 10+ year customers. Investment property owners."
    },
    "Condominiums": {
      totalPolicies: 124,
      totalPremium: 95480,
      avgPremium: 770,
      avgTenure: 19.2,
      byAge: {
        "Under 35": { count: 9, percentage: 7.3 },
        "35-49": { count: 14, percentage: 11.3 },
        "50-64": { count: 23, percentage: 18.5 },
        "65+": { count: 78, percentage: 62.9 }
      },
      byGender: {
        "Couple": { count: 52, percentage: 41.9 },
        "Female": { count: 44, percentage: 35.5 },
        "Male": { count: 28, percentage: 22.6 }
      },
      ezPayRate: 25.0,
      loyalCustomersPct: 72.6, // 10+ year tenure
      keyInsight: "Strong female representation (35%). Bridge between renters and homeowners."
    }
  },
  customerSegments: {
    entry: { count: 184, percentage: 44.4, label: "Entry (<$1.5K)" },
    standard: { count: 152, percentage: 36.7, label: "Standard ($1.5-3K)" },
    premium: { count: 52, percentage: 12.6, label: "Premium ($3-5K)" },
    highValue: { count: 23, percentage: 5.6, label: "High Value ($5-10K)" },
    elite: { count: 112, percentage: 12.8, label: "Elite (4+ products or $5K+)" }
  },
  premiumDistribution: {
    "Under $500": { count: 253, percentage: 17.8 },
    "$500-$999": { count: 307, percentage: 21.6 },
    "$1,000-$1,999": { count: 489, percentage: 34.3 },
    "$2,000-$2,999": { count: 213, percentage: 15.0 },
    "$3,000-$4,999": { count: 120, percentage: 8.4 },
    "$5,000+": { count: 42, percentage: 2.9 }
  },
  retention: {
    renewalTaken: 245,
    renewalNotTaken: 253,
    renewalRate: 49.2,
    singlePolicyChurnRisk: 523, // ACTUAL single-policy customers
    atRiskHighValue: 157, // Single policy with $2K+ premium
    notOnEzPay: 601, // Payment lapse risk
    highPremiumIncrease: 309
  },
  marketContext: {
    medianHomeValue: 750000,
    medianHouseholdIncome: 85000,
    premiumCostVsAvg: "+50%",
    competitionLevel: "High",
    totalHouseholds: 170000
  },
  // === NEW DEEP ANALYSIS DATA ===
  geographicAnalysis: {
    topZipCodes: [
      { zip: "93117", totalPremium: 710561, avgPremium: 1534, policyCount: 463, avgTenure: 18.2 },
      { zip: "93111", totalPremium: 280697, avgPremium: 1670, policyCount: 168, avgTenure: 22.5 },
      { zip: "93110", totalPremium: 148570, avgPremium: 1857, policyCount: 80, avgTenure: 22.0 },
      { zip: "93103", totalPremium: 111863, avgPremium: 2033, policyCount: 55, avgTenure: 21.8 },
      { zip: "93101", totalPremium: 108242, avgPremium: 1288, policyCount: 84, avgTenure: 11.3 },
      { zip: "93105", totalPremium: 103821, avgPremium: 1483, policyCount: 70, avgTenure: 16.2 },
      { zip: "93108", totalPremium: 74044, avgPremium: 2644, policyCount: 28, avgTenure: 26.8 },
      { zip: "93109", totalPremium: 68855, avgPremium: 1679, policyCount: 41, avgTenure: 19.4 },
      { zip: "93436", totalPremium: 52393, avgPremium: 1540, policyCount: 34, avgTenure: 19.1 },
      { zip: "93013", totalPremium: 43963, avgPremium: 1570, policyCount: 28, avgTenure: 21.5 }
    ],
    bundleRateByZip: {
      "93117": { bundleRate: 41.8, customers: 275 },
      "93111": { bundleRate: 42.0, customers: 100 },
      "93110": { bundleRate: 35.8, customers: 53 },
      "93103": { bundleRate: 50.0, customers: 28 },
      "93101": { bundleRate: 32.2, customers: 59 },
      "93105": { bundleRate: 33.3, customers: 45 },
      "93108": { bundleRate: 35.7, customers: 14 },
      "93109": { bundleRate: 71.4, customers: 21 },
      "93436": { bundleRate: 25.9, customers: 27 },
      "93013": { bundleRate: 50.0, customers: 16 }
    }
  },
  retentionRisk: {
    distribution: {
      "0": { count: 67, avgPremium: 1377, label: "Minimal Risk" },
      "1": { count: 274, avgPremium: 4762, label: "Low Risk" },
      "2": { count: 12, avgPremium: 2915, label: "Moderate Low" },
      "3": { count: 254, avgPremium: 1006, label: "Moderate" },
      "4": { count: 234, avgPremium: 2056, label: "Elevated" },
      "5": { count: 35, avgPremium: 2983, label: "High Risk" }
    },
    highRiskCount: 35,
    revenueAtRisk: 104412,
    highRiskCustomers: [
      { name: "VICTOR HUGO O BANOS", premium: 6981, policyCount: 1, tenure: 3.0, ezpay: true },
      { name: "ZAIDA PASCUAL", premium: 4838, policyCount: 1, tenure: 1.0, ezpay: true },
      { name: "PAUL BRICE", premium: 4635, policyCount: 1, tenure: 3.0, ezpay: true },
      { name: "MARCUS S GUNTER", premium: 4219, policyCount: 1, tenure: 1.0, ezpay: true },
      { name: "PLACIDO ORGANISTA", premium: 4087, policyCount: 1, tenure: 2.0, ezpay: true },
      { name: "RAMONA RINCON", premium: 3941, policyCount: 1, tenure: 1.0, ezpay: true },
      { name: "BEATRIZ RAMIREZ", premium: 3922, policyCount: 1, tenure: 3.0, ezpay: true },
      { name: "SYLVIA ROMERO", premium: 3642, policyCount: 1, tenure: 3.0, ezpay: true },
      { name: "OLGA ZAITCEVA", premium: 3438, policyCount: 1, tenure: 3.0, ezpay: true },
      { name: "LAUREN PETTA", premium: 3315, policyCount: 1, tenure: 0.0, ezpay: true }
    ]
  },
  lifeStages: {
    "Retired": { count: 398, totalPremium: 1299025, avgPremium: 3263, avgPolicies: 1.94 },
    "Pre-Retirement": { count: 178, totalPremium: 449149, avgPremium: 2523, avgPolicies: 1.57 },
    "Peak Earning Family": { count: 93, totalPremium: 215299, avgPremium: 2315, avgPolicies: 1.30 },
    "Mid-Career Single": { count: 69, totalPremium: 115416, avgPremium: 1672, avgPolicies: 1.28 },
    "Young Adult": { count: 56, totalPremium: 84327, avgPremium: 1505, avgPolicies: 1.16 },
    "Established Single": { count: 63, totalPremium: 72826, avgPremium: 1155, avgPolicies: 1.21 },
    "Young Family": { count: 19, totalPremium: 37597, avgPremium: 1978, avgPolicies: 1.16 }
  },
  premiumOptimization: {
    missingBundleDiscount: 244,
    topMissingDiscount: [
      { name: "EUNJU YOO", premium: 7632 },
      { name: "APOLINAR PEREZ", premium: 7255 },
      { name: "JOSE RAMIREZ", premium: 7213 },
      { name: "VICTOR HUGO O BANOS", premium: 6981 },
      { name: "MICHELLE CARRILLO", premium: 6139 },
      { name: "CYNTHIA HOFMANN", premium: 5853 },
      { name: "ROGELIO SERRATO", premium: 5724 },
      { name: "JAMES P KENNETT", premium: 5448 },
      { name: "HECTOR MAGALLANES", premium: 5286 },
      { name: "LORENA BOTELLO", premium: 5240 }
    ]
  },
  referralPotential: {
    totalCandidates: 179,
    topCandidates: [
      { name: "GUY S CLARK", premium: 24154, tenure: 36, policyCount: 6 },
      { name: "CRAIG DROESE", premium: 18743, tenure: 44, policyCount: 8 },
      { name: "EZZY A POZZATO", premium: 17725, tenure: 38, policyCount: 2 },
      { name: "FREDERICK MONTGOMERY", premium: 17110, tenure: 32, policyCount: 5 },
      { name: "JOHN G CHAPPLE", premium: 17096, tenure: 56, policyCount: 3 },
      { name: "CHARLES A COCKRUM", premium: 16295, tenure: 48, policyCount: 4 },
      { name: "MARK A JOHNSTON", premium: 14292, tenure: 25, policyCount: 3 },
      { name: "SHUJI NAKAMURA", premium: 14047, tenure: 25, policyCount: 4 },
      { name: "LINDA SMITH", premium: 13492, tenure: 39, policyCount: 2 },
      { name: "MARY MCMAHON", premium: 12579, tenure: 48, policyCount: 8 }
    ],
    byZip: {
      "93117": { count: 59, avgPremium: 5927 },
      "93111": { count: 22, avgPremium: 5688 },
      "93110": { count: 13, avgPremium: 5282 },
      "93105": { count: 10, avgPremium: 4933 },
      "93103": { count: 10, avgPremium: 8169 }
    }
  },
  // Seasonal Patterns Analysis
  seasonalPatterns: {
    renewalsByMonth: {
      "Jan": 61, "Feb": 59, "Mar": 71, "Apr": 74, "May": 70, "Jun": 87,
      "Jul": 173, "Aug": 148, "Sep": 165, "Oct": 157, "Nov": 181, "Dec": 120
    },
    peakRenewalMonths: ["Nov", "Jul", "Sep"],
    productRenewalPatterns: {
      "Auto": { topMonths: ["Nov", "Sep", "Oct"], totalPolicies: 620 },
      "Homeowners": { topMonths: ["Apr", "Jul", "Nov"], totalPolicies: 369 },
      "Umbrella": { topMonths: ["Aug", "Oct", "Jun"], totalPolicies: 74 }
    },
    newBusinessTrend: {
      "2020": 40, "2021": 71, "2022": 60, "2023": 48, "2024": 63, "2025": 89
    },
    q4Focus: {
      policyCount: 362,
      premiumAtStake: 616723
    },
    terminationCount: 2,
    terminationReasons: {
      "Non-Pay": 1,
      "Property Construction": 1
    },
    insights: [
      "Peak renewal season: Jul-Nov (70% of renewals)",
      "Auto renewals spike Sep-Nov - prep cross-sell campaigns",
      "Q4/Q1 critical: 362 policies ($617K) renewing Nov-Jan",
      "2025 trending 41% above 2024 for new business"
    ]
  },
  // Claims Impact Analysis
  claimsImpact: {
    summary: {
      totalClaims: 642,
      uniqueCustomers: 245,
      pendingClaims: 111,
      closedClaims: 531,
      catastropheClaims: 21,
      totalPaidLosses: 3191352,
      totalAdjustedLosses: 1990129
    },
    byProduct: {
      "Standard Auto": { claimCount: 550, adjustedLosses: 1633646 },
      "Homeowners": { claimCount: 59, adjustedLosses: 263889 },
      "Condo": { claimCount: 27, adjustedLosses: 76192 },
      "Specialty Auto": { claimCount: 2, adjustedLosses: 9466 },
      "Other": { claimCount: 4, adjustedLosses: 6936 }
    },
    singlePolicyClaimants: [
      { name: "TERESA KETTERER", premium: 4376, claimCount: 5, risk: "High" },
      { name: "TINA MCCLUSKEY", premium: 1005, claimCount: 3, risk: "High" }
    ],
    frequentClaimers: [
      { name: "JEFFREY GOUGH", claimCount: 15, premium: 6084 },
      { name: "KIMBERLY A FERGUS", claimCount: 14, premium: 4209 },
      { name: "HUGO RAMIREZ", claimCount: 12, premium: 24123 },
      { name: "EVE J KELEMEN", claimCount: 11, premium: 3152 },
      { name: "LEE A APPLETON", claimCount: 10, premium: 7412 },
      { name: "DONALD FOLEY", claimCount: 10, premium: 3964 },
      { name: "BETH A KANNE-CASSELMAN", claimCount: 10, premium: 3421 },
      { name: "KAREN BROWN", claimCount: 10, premium: 15856 },
      { name: "GABRIEL LOPEZ", claimCount: 9, premium: 11557 },
      { name: "PLACIDO ORGANISTA", claimCount: 8, premium: 4088 }
    ],
    claimsByMonth: {
      "2024-11": 26, "2024-12": 18, "2025-01": 27, "2025-02": 20, "2025-03": 30,
      "2025-04": 12, "2025-05": 12, "2025-06": 25, "2025-07": 22, "2025-08": 21,
      "2025-09": 16, "2025-10": 6
    },
    actionItems: [
      "61 single-policy claimants need retention outreach",
      "111 pending claims - monitor for resolution & follow-up",
      "Auto claims dominate (86%) - consider defensive driving discounts",
      "Contact claimants within 48 hours of resolution for bundle offers",
      "High-frequency claimers may indicate fraud or underlying issues"
    ]
  }
};

// Cross-sell opportunity card
interface OpportunityCardProps {
  title: string;
  count: number;
  action: string;
  potentialPremium: number;
  conversionRate: string;
  priority: 'high' | 'medium' | 'low';
}

function OpportunityCard({ title, count, action, potentialPremium, conversionRate, priority }: OpportunityCardProps) {
  const priorityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-green-500 bg-green-50'
  };

  return (
    <div className={`border-l-4 ${priorityColors[priority]} rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <span className="text-2xl font-bold text-blue-600">{count}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{action}</p>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Est. Premium: ${potentialPremium.toLocaleString()}</span>
        <span className="text-gray-500">Conv: {conversionRate}</span>
      </div>
    </div>
  );
}

// Metric card component
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        {trend && (
          <span className={`text-sm flex items-center ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trendValue}
            {trend === 'up' && <ArrowUpRight className="w-4 h-4 ml-1" />}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// Progress bar component
function ProgressBar({ value, max, color = "bg-blue-500", label }: { value: number; max: number; color?: string; label?: string }) {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{value.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function BookOfBusinessDashboard() {
  const [activeSection, setActiveSection] = useState<'overview' | 'products' | 'crosssell' | 'retention' | 'analysis'>('overview');
  const data = bookOfBusinessData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Book of Business Analytics</h2>
        <p className="text-blue-100">Comprehensive analysis of your insurance portfolio - Santa Barbara County</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-blue-200 text-sm">Total Premium</p>
            <p className="text-2xl font-bold">${(data.overview.writtenPremium / 1000000).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Customers</p>
            <p className="text-2xl font-bold">{data.overview.uniqueCustomers}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Policies</p>
            <p className="text-2xl font-bold">{data.overview.totalPolicies}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Avg Premium</p>
            <p className="text-2xl font-bold">${data.overview.avgPremiumPerCustomer.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'products', label: 'Product Mix', icon: Package },
          { id: 'crosssell', label: 'Cross-Sell', icon: Target },
          { id: 'retention', label: 'Retention', icon: RefreshCw },
          { id: 'analysis', label: 'Deep Analysis', icon: Zap }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Bundle Rate"
              value={`${data.bundling.bundleRate}%`}
              subtitle="Customers with 2+ policies"
              icon={Package}
              trend="up"
              trendValue="+5.2%"
            />
            <MetricCard
              title="Policies/Customer"
              value={data.bundling.policiesPerCustomer.toFixed(2)}
              subtitle="Industry avg: 1.8"
              icon={BarChart3}
            />
            <MetricCard
              title="Avg Tenure"
              value={`${data.demographics.avgTenure} yrs`}
              subtitle="Customer loyalty"
              icon={Users}
            />
            <MetricCard
              title="Cross-Sell Opps"
              value={data.crossSellOpportunities.totalOpportunities}
              subtitle="Actionable leads"
              icon={Target}
              trend="up"
            />
          </div>

          {/* Demographics & Geography */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Age Distribution */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Customer Age Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(data.demographics.ageDistribution).map(([bracket, { percentage }]) => (
                  <ProgressBar
                    key={bracket}
                    value={percentage}
                    max={50}
                    label={bracket}
                    color={percentage > 30 ? 'bg-blue-600' : percentage > 15 ? 'bg-blue-400' : 'bg-blue-300'}
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <p>Average Age: <span className="font-semibold">{data.demographics.avgAge} years</span></p>
                <p>Median Age: <span className="font-semibold">{data.demographics.medianAge} years</span></p>
              </div>
            </div>

            {/* Gender & Marital Status */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Gender & Marital Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Gender</p>
                  <div className="space-y-2">
                    {data.demographics.genderDistribution && Object.entries(data.demographics.genderDistribution).slice(0, 3).map(([gender, { count, percentage }]) => (
                      <div key={gender} className="flex justify-between text-sm">
                        <span className="text-gray-600">{gender}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Marital Status</p>
                  <div className="space-y-2">
                    {data.demographics.maritalStatus && Object.entries(data.demographics.maritalStatus).slice(0, 3).map(([status, { count, percentage }]) => (
                      <div key={status} className="flex justify-between text-sm">
                        <span className="text-gray-600">{status}</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Key Insight:</span> 48% are couples (joint policies), 53% married - ideal for multi-policy bundling
                </p>
              </div>
            </div>
          </div>

          {/* Tenure & Geography Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Tenure */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-indigo-600" />
                Customer Tenure
              </h3>
              <div className="space-y-3">
                {data.demographics.tenureDistribution && Object.entries(data.demographics.tenureDistribution).map(([bracket, { percentage }]) => (
                  <ProgressBar
                    key={bracket}
                    value={percentage}
                    max={60}
                    label={bracket}
                    color={bracket.includes('10+') ? 'bg-indigo-600' : bracket.includes('6-10') ? 'bg-indigo-500' : 'bg-indigo-400'}
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <p>Average Tenure: <span className="font-semibold">{data.demographics.avgTenure} years</span></p>
                <p className="text-green-600 font-medium mt-1">57% are 10+ year customers - strong loyalty base</p>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Geographic Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(data.geography).map(([city, { percentage }]) => (
                  <ProgressBar
                    key={city}
                    value={percentage}
                    max={50}
                    label={city}
                    color={city === 'SANTA BARBARA' ? 'bg-green-600' : city === 'GOLETA' ? 'bg-green-500' : 'bg-green-400'}
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <p>Primary Market: Santa Barbara & Goleta ({(data.geography["SANTA BARBARA"].percentage + data.geography["GOLETA"].percentage).toFixed(1)}%)</p>
              </div>
            </div>
          </div>

          {/* Digital Engagement */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Digital Engagement</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{data.demographics.ezPayEnrollment}%</p>
                <p className="text-xs text-gray-600 mt-1">EZPay Enrolled</p>
                <p className="text-xs text-red-600 mt-1">69% at payment lapse risk</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-gray-600 mt-1">My Account Active</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">601</p>
                <p className="text-xs text-gray-600 mt-1">Not on EZPay</p>
                <p className="text-xs text-orange-600 mt-1">Retention opportunity</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">50.5%</p>
                <p className="text-xs text-gray-600 mt-1">Multi-Policy Discount</p>
              </div>
            </div>
          </div>

          {/* Customer Value Segments */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
              Customer Value Segments
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(data.customerSegments).map(([key, segment]) => (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
                  <p className="text-xs text-gray-600 mt-1">{segment.label}</p>
                  <p className="text-sm text-gray-500">{segment.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Context */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Santa Barbara Market Context</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">Median Home Value</p>
                <p className="text-lg font-semibold">${(data.marketContext.medianHomeValue / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Median HH Income</p>
                <p className="text-lg font-semibold">${(data.marketContext.medianHouseholdIncome / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Premium vs Avg</p>
                <p className="text-lg font-semibold text-orange-600">{data.marketContext.premiumCostVsAvg}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Households</p>
                <p className="text-lg font-semibold">{(data.marketContext.totalHouseholds / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Mix Section */}
      {activeSection === 'products' && (
        <div className="space-y-6">
          {/* Product Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(data.productMix).map(([product, info]) => {
              const IconComponent = info.icon;
              return (
                <div key={product} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 ${info.color} bg-opacity-10 rounded-lg`}>
                      <IconComponent className={`w-5 h-5 ${info.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{info.percentage}%</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{product}</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{info.count}</p>
                  <p className="text-sm text-gray-500">${info.premium.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          {/* Detailed Product Demographics */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Product Demographics Analysis
            </h3>

            {/* Auto */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900 flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  Auto Insurance - {data.productDemographics?.Auto?.totalPolicies || 585} Policies
                </h4>
                <span className="text-sm font-medium text-blue-700">
                  ${(data.productDemographics?.Auto?.avgPremium || 1914).toLocaleString()} avg
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Age Distribution</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Auto?.byAge && Object.entries(data.productDemographics.Auto.byAge).map(([age, info]) => (
                      <div key={age} className="flex justify-between">
                        <span className="text-gray-600">{age}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Gender Mix</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Auto?.byGender && Object.entries(data.productDemographics.Auto.byGender).map(([gender, info]) => (
                      <div key={gender} className="flex justify-between">
                        <span className="text-gray-600">{gender}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Retention Metrics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EZPay Rate</span>
                      <span className="font-medium">{data.productDemographics?.Auto?.ezPayRate || 40.9}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">10+ Year</span>
                      <span className="font-medium">{data.productDemographics?.Auto?.loyalCustomersPct || 56.4}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Tenure</span>
                      <span className="font-medium">{data.productDemographics?.Auto?.avgTenure || 18.1} yrs</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
                {data.productDemographics?.Auto?.keyInsight || "Balanced age mix with strong couple base. 40.9% on EZPay - moderate retention risk."}
              </p>
            </div>

            {/* Homeowners */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Homeowners Insurance - {data.productDemographics?.Homeowners?.totalPolicies || 369} Policies
                </h4>
                <span className="text-sm font-medium text-green-700">
                  ${(data.productDemographics?.Homeowners?.avgPremium || 2369).toLocaleString()} avg
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Age Distribution</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Homeowners?.byAge && Object.entries(data.productDemographics.Homeowners.byAge).map(([age, info]) => (
                      <div key={age} className="flex justify-between">
                        <span className="text-gray-600">{age}</span>
                        <span className={`font-medium ${age === '65+' ? 'text-orange-600' : ''}`}>{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Gender Mix</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Homeowners?.byGender && Object.entries(data.productDemographics.Homeowners.byGender).map(([gender, info]) => (
                      <div key={gender} className="flex justify-between">
                        <span className="text-gray-600">{gender}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Retention Metrics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EZPay Rate</span>
                      <span className="font-medium text-red-600">{data.productDemographics?.Homeowners?.ezPayRate || 14.1}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">10+ Year</span>
                      <span className="font-medium text-green-600">{data.productDemographics?.Homeowners?.loyalCustomersPct || 86.4}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Tenure</span>
                      <span className="font-medium">{data.productDemographics?.Homeowners?.avgTenure || 26.3} yrs</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-red-700 bg-red-100 p-2 rounded">
                {data.productDemographics?.Homeowners?.keyInsight || "Aging book - 78% are 65+. CRITICAL: Only 14.1% on EZPay - major retention risk!"}
              </p>
            </div>

            {/* Renters */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-yellow-900 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Renters Insurance - {data.productDemographics?.Renters?.totalPolicies || 168} Policies
                </h4>
                <span className="text-sm font-medium text-yellow-700">
                  ${(data.productDemographics?.Renters?.avgPremium || 189).toLocaleString()} avg
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Age Distribution</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Renters?.byAge && Object.entries(data.productDemographics.Renters.byAge).map(([age, info]) => (
                      <div key={age} className="flex justify-between">
                        <span className="text-gray-600">{age}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Gender Mix</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Single</span>
                      <span className="font-medium text-blue-600">{data.productDemographics?.Renters?.byGender?.Single?.percentage || 60.1}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Female</span>
                      <span className="font-medium">{data.productDemographics?.Renters?.byGender?.Female?.percentage || 41.7}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Couple</span>
                      <span className="font-medium">{data.productDemographics?.Renters?.byGender?.Couple?.percentage || 18.5}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Retention Metrics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EZPay Rate</span>
                      <span className="font-medium">{data.productDemographics?.Renters?.ezPayRate || 34.5}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">10+ Year</span>
                      <span className="font-medium">{data.productDemographics?.Renters?.loyalCustomersPct || 21.4}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Tenure</span>
                      <span className="font-medium">{data.productDemographics?.Renters?.avgTenure || 6.9} yrs</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                {data.productDemographics?.Renters?.keyInsight || "Young singles - prime homebuyer pipeline. 22% under 35, avg 6.9yr tenure."}
              </p>
            </div>

            {/* Umbrella */}
            <div className="mb-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-cyan-900 flex items-center">
                  <Umbrella className="w-4 h-4 mr-2" />
                  Personal Umbrella - {data.productDemographics?.["Personal Umbrella"]?.totalPolicies || 74} Policies
                </h4>
                <span className="text-sm font-medium text-cyan-700">
                  ${(data.productDemographics?.["Personal Umbrella"]?.avgPremium || 842).toLocaleString()} avg
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Age Distribution</p>
                  <div className="space-y-1">
                    {data.productDemographics?.["Personal Umbrella"]?.byAge && Object.entries(data.productDemographics["Personal Umbrella"].byAge).map(([age, info]) => (
                      <div key={age} className="flex justify-between">
                        <span className="text-gray-600">{age}</span>
                        <span className={`font-medium ${age === '65+' ? 'text-cyan-600 font-bold' : ''}`}>{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Gender Mix</p>
                  <div className="space-y-1">
                    {data.productDemographics?.["Personal Umbrella"]?.byGender && Object.entries(data.productDemographics["Personal Umbrella"].byGender).map(([gender, info]) => (
                      <div key={gender} className="flex justify-between">
                        <span className="text-gray-600">{gender}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Retention Metrics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EZPay Rate</span>
                      <span className="font-medium">{data.productDemographics?.["Personal Umbrella"]?.ezPayRate || 28.4}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">10+ Year</span>
                      <span className="font-medium">{data.productDemographics?.["Personal Umbrella"]?.loyalCustomersPct || 70.3}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Married</span>
                      <span className="font-medium">{data.productDemographics?.["Personal Umbrella"]?.marriedPct || 66.2}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-cyan-700 bg-cyan-100 p-2 rounded">
                {data.productDemographics?.["Personal Umbrella"]?.keyInsight || "Affluent, loyal seniors - 77% are 65+, 66% married. Ideal profile for expansion."}
              </p>
            </div>

            {/* Landlords */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-indigo-900 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Landlord Insurance - {data.productDemographics?.Landlords?.totalPolicies || 60} Policies
                </h4>
                <span className="text-sm font-medium text-indigo-700">
                  ${(data.productDemographics?.Landlords?.avgPremium || 1440).toLocaleString()} avg
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Age Distribution</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Landlords?.byAge && Object.entries(data.productDemographics.Landlords.byAge).map(([age, info]) => (
                      <div key={age} className="flex justify-between">
                        <span className="text-gray-600">{age}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Gender Mix</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Landlords?.byGender && Object.entries(data.productDemographics.Landlords.byGender).map(([gender, info]) => (
                      <div key={gender} className="flex justify-between">
                        <span className="text-gray-600">{gender}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Retention Metrics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EZPay Rate</span>
                      <span className="font-medium text-red-600">{data.productDemographics?.Landlords?.ezPayRate || 16.7}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">10+ Year</span>
                      <span className="font-medium text-green-600">{data.productDemographics?.Landlords?.loyalCustomersPct || 91.7}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Tenure</span>
                      <span className="font-medium">{data.productDemographics?.Landlords?.avgTenure || 24.9} yrs</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-indigo-700 bg-indigo-100 p-2 rounded">
                {data.productDemographics?.Landlords?.keyInsight || "Most loyal segment - 91.7% are 10+ year customers. Investment property owners."}
              </p>
            </div>

            {/* Condominiums */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-900 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Condo Insurance - {data.productDemographics?.Condominiums?.totalPolicies || 124} Policies
                </h4>
                <span className="text-sm font-medium text-purple-700">
                  ${(data.productDemographics?.Condominiums?.avgPremium || 770).toLocaleString()} avg
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Age Distribution</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Condominiums?.byAge && Object.entries(data.productDemographics.Condominiums.byAge).map(([age, info]) => (
                      <div key={age} className="flex justify-between">
                        <span className="text-gray-600">{age}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Gender Mix</p>
                  <div className="space-y-1">
                    {data.productDemographics?.Condominiums?.byGender && Object.entries(data.productDemographics.Condominiums.byGender).map(([gender, info]) => (
                      <div key={gender} className="flex justify-between">
                        <span className="text-gray-600">{gender}</span>
                        <span className="font-medium">{info.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Retention Metrics</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EZPay Rate</span>
                      <span className="font-medium">{data.productDemographics?.Condominiums?.ezPayRate || 25.0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">10+ Year</span>
                      <span className="font-medium">{data.productDemographics?.Condominiums?.loyalCustomersPct || 72.6}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Tenure</span>
                      <span className="font-medium">{data.productDemographics?.Condominiums?.avgTenure || 19.2} yrs</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-purple-700 bg-purple-100 p-2 rounded">
                {data.productDemographics?.Condominiums?.keyInsight || "Strong female representation (35%). Bridge between renters and homeowners."}
              </p>
            </div>
          </div>

          {/* Key Insights Summary */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Product Mix Strategic Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h4 className="font-medium text-red-900">Critical EZPay Gaps</h4>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  <li>• Homeowners: Only 14.1% on EZPay (vs 40.9% Auto)</li>
                  <li>• Landlords: Only 16.7% on EZPay</li>
                  <li>• These are your most loyal customers (25+ yr avg tenure) at payment lapse risk</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900">Aging Book Opportunity</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Homeowners: 78% are 65+ (succession planning needed)</li>
                  <li>• Umbrella: 77% are 65+ with 66% married</li>
                  <li>• Target adult children for policy transitions</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-green-900">Growth Pipeline</h4>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• Renters: 22% under 35, avg 6.9yr tenure</li>
                  <li>• 168 renters as future homeowner pipeline</li>
                  <li>• Track life events for conversion triggers</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-medium text-yellow-900">Umbrella Expansion</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Current: Only 74 policies (5.2% penetration)</li>
                  <li>• Target: 40% of bundled = ~350 opportunities</li>
                  <li>• Ideal customer: 65+, married, couple (66% of current umbrella)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Sell Section */}
      {activeSection === 'crosssell' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-green-900">Cross-Sell Revenue Opportunity</h3>
                <p className="text-sm text-green-700">Based on All Purpose Audit analysis</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">${(data.crossSellOpportunities.estimatedPremiumPotential / 1000).toFixed(0)}K</p>
                <p className="text-sm text-green-600">Potential Annual Premium</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.crossSellOpportunities.totalOpportunities}</p>
                <p className="text-xs text-green-700">Total Opportunities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.crossSellOpportunities.singlePolicy}</p>
                <p className="text-xs text-green-700">Single-Policy (60%)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">15-25%</p>
                <p className="text-xs text-green-700">Avg Conversion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">$1,500</p>
                <p className="text-xs text-green-700">Avg Additional Premium</p>
              </div>
            </div>
          </div>

          {/* Opportunity Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <OpportunityCard
              title="Auto-Only → Add Home/Renters"
              count={data.crossSellOpportunities.autoOnlyNeedHome}
              action="Bundle with homeowners or renters insurance"
              potentialPremium={505500}
              conversionRate="15-25%"
              priority="high"
            />
            <OpportunityCard
              title="Home-Only → Add Auto"
              count={data.crossSellOpportunities.homeOnlyNeedAuto}
              action="Bundle with auto insurance"
              potentialPremium={239400}
              conversionRate="20-30%"
              priority="high"
            />
            <OpportunityCard
              title="Bundled → Add Umbrella"
              count={data.crossSellOpportunities.needUmbrella}
              action="Add personal umbrella coverage"
              potentialPremium={30825}
              conversionRate="25-40%"
              priority="medium"
            />
            <OpportunityCard
              title="Renters → Convert to Homeowners"
              count={data.crossSellOpportunities.rentersToHome}
              action="Future homeowner conversion"
              potentialPremium={237000}
              conversionRate="10-15%"
              priority="low"
            />
          </div>

          {/* Top Targets Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Auto-Only Top Targets */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                Top Auto-Only Targets (Need Home)
              </h3>
              <div className="space-y-3">
                {data.crossSellTargets?.autoOnlyTopTargets?.map((target, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{target.name}</p>
                      <p className="text-xs text-gray-500">{target.tenure}yr tenure • {target.zip}</p>
                    </div>
                    <span className="font-bold text-blue-600">${target.premium.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Umbrella Top Targets */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Umbrella className="w-5 h-5 mr-2 text-cyan-600" />
                Top Umbrella Targets (Already Bundled)
              </h3>
              <div className="space-y-3">
                {data.crossSellTargets?.umbrellaTopTargets?.map((target, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{target.name}</p>
                      <p className="text-xs text-gray-500">{target.tenure}yr • {target.products}</p>
                    </div>
                    <span className="font-bold text-cyan-600">${target.premium.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* At-Risk High Value */}
          <div className="bg-white rounded-xl p-6 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              At-Risk High Value Customers (Single Policy, $2K+ Premium)
            </h3>
            <p className="text-sm text-red-700 mb-4">157 customers at high churn risk. These are your highest priority for retention outreach and bundling offers.</p>
            <div className="grid md:grid-cols-5 gap-3">
              {data.crossSellTargets?.atRiskHighValue?.map((target, i) => (
                <div key={i} className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="font-bold text-red-700">${target.premium.toLocaleString()}</p>
                  <p className="text-xs text-gray-700 truncate">{target.name}</p>
                  <p className="text-xs text-gray-500">{target.product} • {target.tenure}yr</p>
                </div>
              ))}
            </div>
          </div>

          {/* Demographic Targeting Insights */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Demographic Targeting Insights
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Auto-Only Demographics */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Auto-Only Customers (337) by Segment</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">By Age</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      {data.demographicInsights?.autoOnlyByAge && Object.entries(data.demographicInsights.autoOnlyByAge).map(([age, info]) => (
                        <div key={age} className="flex justify-between">
                          <span className="text-gray-600">{age}</span>
                          <span className="font-medium">{info.count} (${info.avgPremium.toLocaleString()})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">By Gender</p>
                    <div className="space-y-1 mt-2 text-xs">
                      {data.demographicInsights?.autoOnlyByGender && Object.entries(data.demographicInsights.autoOnlyByGender).map(([gender, info]) => (
                        <div key={gender} className="flex justify-between">
                          <span className="text-gray-600">{gender}</span>
                          <span className="font-medium">{info.count} (${info.avgPremium.toLocaleString()})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">By Marital Status</p>
                    <div className="space-y-1 mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Married</span>
                        <span className="font-medium">{data.demographicInsights?.autoOnlyByMarital?.Married?.count || 160} (${(data.demographicInsights?.autoOnlyByMarital?.Married?.avgPremium || 2456).toLocaleString()})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Single</span>
                        <span className="font-medium">{data.demographicInsights?.autoOnlyByMarital?.Single?.count || 142} (${(data.demographicInsights?.autoOnlyByMarital?.Single?.avgPremium || 1654).toLocaleString()})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bundle Rate Correlations */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Bundle Conversion Likelihood</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-medium text-indigo-900">Bundle Rate by Gender</p>
                    <div className="space-y-1 mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Couples</span>
                        <span className="font-bold text-green-600">{data.demographicInsights?.bundleRateByGender?.Couple || 42.6}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Female</span>
                        <span className="font-medium">{data.demographicInsights?.bundleRateByGender?.Female || 38.2}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Male</span>
                        <span className="font-medium">{data.demographicInsights?.bundleRateByGender?.Male || 37.7}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-900">Bundle Rate by Age</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      {data.demographicInsights?.bundleRateByAge && Object.entries(data.demographicInsights.bundleRateByAge).map(([age, rate]) => (
                        <div key={age} className="flex justify-between">
                          <span className="text-gray-600">{age}</span>
                          <span className={`font-medium ${Number(rate) > 40 ? 'text-green-600' : Number(rate) < 25 ? 'text-red-600' : ''}`}>{rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <p className="text-sm font-medium text-cyan-900">EZPay Enrollment</p>
                    <div className="space-y-1 mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-Only</span>
                        <span className="font-medium">{data.demographicInsights?.ezPayRates?.autoOnly || 40.1}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Umbrella Targets</span>
                        <span className="font-medium text-red-600">{data.demographicInsights?.ezPayRates?.umbrellaTargets || 28.5}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Targeting Recommendations */}
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h4 className="font-medium text-yellow-900">Key Targeting Insights</h4>
              <ul className="mt-2 text-sm text-yellow-800 space-y-1">
                <li>• <strong>Couples convert best</strong> - 43% bundle rate vs 38% for individuals. Married auto-only avg $2,456 premium.</li>
                <li>• <strong>Age 50-64 sweet spot</strong> - 90 auto-only customers at $2,266 avg. High homeownership, good income.</li>
                <li>• <strong>59 high-value auto-only</strong> ($3K+) - 40 are couples. Priority targets for home cross-sell.</li>
                <li>• <strong>Umbrella targets are 65+</strong> - 89 of 137 are seniors with $4,262 avg premium. Perfect for umbrella.</li>
                <li>• <strong>37 prime homebuyers</strong> - Married renters age 35-64. Track for life events.</li>
              </ul>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <ChevronRight className="w-5 h-5 mr-2 text-blue-600" />
              Recommended Action Plan
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <h4 className="font-medium text-gray-900">Urgent: At-Risk High Value (157 customers)</h4>
                  <p className="text-sm text-gray-600">Contact immediately for bundle offers. Single-policy customers with $2K+ premium have 67% retention vs 95% for bundled.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h4 className="font-medium text-gray-900">High Priority: Auto-Only Customers (337)</h4>
                  <p className="text-sm text-gray-600">Contact for home/renters quote. Top targets have $5K+ auto premiums - likely homeowners in high-value Santa Barbara market.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h4 className="font-medium text-gray-900">Quick Win: Umbrella Add-ons (137)</h4>
                  <p className="text-sm text-gray-600">Bundled customers are prime for umbrella at $150-300/yr. Top targets have $10K+ premium - perfect for high-limit umbrella.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <h4 className="font-medium text-gray-900">Long-term: EZPay Enrollment (601 not enrolled)</h4>
                  <p className="text-sm text-gray-600">69% of customers not on autopay. Each enrollment reduces payment lapse cancellations by 15-20%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retention Section */}
      {activeSection === 'retention' && (
        <div className="space-y-6">
          {/* Retention Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard
              title="Single Policy Risk"
              value={data.retention.singlePolicyChurnRisk}
              subtitle="60% of customers (67% retention)"
              icon={AlertTriangle}
              trend="down"
            />
            <MetricCard
              title="At-Risk High Value"
              value={data.retention.atRiskHighValue}
              subtitle="$2K+ premium, single policy"
              icon={DollarSign}
            />
            <MetricCard
              title="Not on EZPay"
              value={data.retention.notOnEzPay}
              subtitle="Payment lapse risk (69%)"
              icon={RefreshCw}
            />
            <MetricCard
              title="Premium Increases"
              value={data.retention.highPremiumIncrease}
              subtitle="Policies with >10% increase"
              icon={DollarSign}
            />
          </div>

          {/* Retention Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Renewal Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Renewal Taken</span>
                  <span className="font-bold text-green-700">{data.retention.renewalTaken}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-700">Renewal Not Taken</span>
                  <span className="font-bold text-red-700">{data.retention.renewalNotTaken}</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-800">
                  <strong>Alert:</strong> The 49.2% renewal rate is significantly below the industry benchmark of 85%.
                  This may be due to data capture timing or indicates a retention crisis requiring immediate attention.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Retention by Bundle Status</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Single Policy</span>
                    <span className="font-semibold text-red-600">67% retention</span>
                  </div>
                  <ProgressBar value={67} max={100} color="bg-red-500" />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">2-Policy Bundle</span>
                    <span className="font-semibold text-yellow-600">85% retention</span>
                  </div>
                  <ProgressBar value={85} max={100} color="bg-yellow-500" />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">3+ Policy Bundle</span>
                    <span className="font-semibold text-green-600">95% retention</span>
                  </div>
                  <ProgressBar value={95} max={100} color="bg-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Retention Strategy */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Retention Strategy Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h4 className="font-medium text-red-900">Immediate Action Required</h4>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  <li>• Contact 157 at-risk high-value customers ($2K+ single policy)</li>
                  <li>• Enroll 601 customers in EZPay to reduce payment lapses</li>
                  <li>• Review 309 policies with premium increases &gt;10%</li>
                  <li>• Bundle 523 single-policy customers (60% of book)</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900">Best Practices</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Call customers 45 days before renewal</li>
                  <li>• Offer multi-policy discount to single-line</li>
                  <li>• Review coverage annually for life changes</li>
                  <li>• Leverage 16.9yr avg tenure - these are loyal customers</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h4 className="font-medium text-green-900">Retention by Bundle Status</h4>
              <p className="text-sm text-green-700 mt-1">
                Single policy: 67% retention • 2-policy bundle: 85% retention • 3+ policies: 95% retention.
                Converting just 100 single-policy customers to bundles could save 28 policies per year.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deep Analysis Section */}
      {activeSection === 'analysis' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Deep Book Analysis</h3>
            <p className="text-purple-100">Geographic insights, risk scoring, life stages, and growth opportunities</p>
          </div>

          {/* 1. Geographic Deep Dive */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Geographic Deep Dive
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top ZIP Codes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top ZIP Codes by Premium</h4>
                <div className="space-y-2">
                  {data.geographicAnalysis?.topZipCodes?.slice(0, 7).map((zip, i) => (
                    <div key={zip.zip} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{zip.zip}</span>
                        <span className="text-xs text-gray-500 ml-2">{zip.policyCount} policies</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-green-600">${(zip.totalPremium / 1000).toFixed(0)}K</span>
                        <span className="text-xs text-gray-500 block">{zip.avgTenure}yr avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Bundle Rate by ZIP */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Bundle Rate by ZIP Code</h4>
                <div className="space-y-2">
                  {Object.entries(data.geographicAnalysis?.bundleRateByZip || {}).slice(0, 7).map(([zip, info]) => (
                    <div key={zip} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{zip}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${info.bundleRate > 50 ? 'bg-green-500' : info.bundleRate > 35 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${info.bundleRate}%` }}
                          />
                        </div>
                        <span className={`font-medium ${info.bundleRate > 50 ? 'text-green-600' : ''}`}>
                          {info.bundleRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">
                  <strong>Best performing:</strong> 93109 at 71.4% bundle rate - focus marketing here
                </div>
              </div>
            </div>
          </div>

          {/* 2. Retention Risk Scoring */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Retention Risk Scoring
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{data.retentionRisk?.highRiskCount}</p>
                <p className="text-sm text-red-700">High Risk Customers</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-600">${(data.retentionRisk?.revenueAtRisk / 1000).toFixed(0)}K</p>
                <p className="text-sm text-orange-700">Revenue at Risk</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">5+</p>
                <p className="text-sm text-yellow-700">Risk Score Threshold</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Score Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(data.retentionRisk?.distribution || {}).map(([score, info]) => (
                    <div key={score} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className={`font-medium ${Number(score) >= 5 ? 'text-red-600' : ''}`}>
                          Score {score}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{info.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{info.count}</span>
                        <span className="text-xs text-gray-500 block">${info.avgPremium.toLocaleString()} avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* High Risk Customers */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">High Risk Customers (Score 5+)</h4>
                <div className="space-y-2">
                  {data.retentionRisk?.highRiskCustomers?.slice(0, 6).map((customer, i) => (
                    <div key={i} className="p-2 bg-red-50 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{customer.name}</span>
                        <span className="font-bold text-red-600">${customer.premium.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.tenure}yr tenure • 1 policy • {customer.ezpay ? 'On EZPay' : 'No EZPay'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500 text-sm">
              <strong>Risk factors:</strong> Single policy (+3), No EZPay (+2), High premium (+1), Short tenure (+1)
            </div>
          </div>

          {/* 3. Life Stage Analysis */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Life Stage Analysis
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.lifeStages || {}).slice(0, 7).map(([stage, info]) => (
                <div key={stage} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">{stage}</h4>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{info.count}</p>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>${(info.totalPremium / 1000).toFixed(0)}K total</p>
                    <p>${info.avgPremium.toLocaleString()} avg</p>
                    <p>{info.avgPolicies} policies/customer</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <strong>Highest value:</strong> Retired customers ($1.3M, 1.94 policies avg) - protect these relationships
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-sm">
                <strong>Growth opportunity:</strong> Young Families (only 19) - aggressive acquisition target
              </div>
            </div>
          </div>

          {/* 4. Premium Optimization */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-600" />
              Premium Optimization - Missing Bundle Discounts
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg col-span-1">
                <p className="text-3xl font-bold text-yellow-600">{data.premiumOptimization?.missingBundleDiscount}</p>
                <p className="text-sm text-yellow-700">Single-Policy $1.5K+</p>
                <p className="text-xs text-gray-500 mt-1">Missing multi-policy discount</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top Customers Missing Discount</h4>
                <div className="grid grid-cols-2 gap-2">
                  {data.premiumOptimization?.topMissingDiscount?.slice(0, 6).map((customer, i) => (
                    <div key={i} className="p-2 bg-yellow-50 rounded text-sm flex justify-between">
                      <span className="truncate">{customer.name}</span>
                      <span className="font-bold text-yellow-700">${customer.premium.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 text-sm">
              <strong>Opportunity:</strong> 244 customers paying $1,500+ without multi-policy discount. Each bundle adds ~$1,500/year and increases retention from 67% to 95%.
            </div>
          </div>

          {/* 5. Referral Potential */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-600" />
              Referral Potential
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-3xl font-bold text-pink-600">{data.referralPotential?.totalCandidates}</p>
                <p className="text-sm text-pink-700">Ideal Referrers</p>
                <p className="text-xs text-gray-500 mt-1">$3K+ • 10yr+ • 2+ policies</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top Referral Candidates</h4>
                <div className="space-y-2">
                  {data.referralPotential?.topCandidates?.slice(0, 5).map((customer, i) => (
                    <div key={i} className="p-2 bg-pink-50 rounded text-sm flex justify-between items-center">
                      <div>
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{customer.tenure}yr • {customer.policyCount} policies</span>
                      </div>
                      <span className="font-bold text-pink-600">${customer.premium.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Referrers by ZIP</h4>
                <div className="space-y-2">
                  {Object.entries(data.referralPotential?.byZip || {}).map(([zip, info]) => (
                    <div key={zip} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{zip}</span>
                      <span>{info.count} candidates (${info.avgPremium.toLocaleString()} avg)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg text-sm">
                <strong>Referral strategy:</strong> These 179 customers are your most loyal advocates. Implement a referral program offering $50-100 for successful referrals. Expected yield: 10-15 new customers per year.
              </div>
            </div>
          </div>

          {/* 6. Seasonal Patterns Analysis */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-teal-600" />
              Seasonal Patterns
            </h3>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Renewals by Month</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(data.seasonalPatterns?.renewalsByMonth || {}).map(([month, count]) => (
                    <div key={month} className={`p-2 rounded text-center text-sm ${count > 150 ? 'bg-teal-100 font-bold' : count > 100 ? 'bg-teal-50' : 'bg-gray-50'}`}>
                      <div className="text-xs text-gray-500">{month}</div>
                      <div className={count > 150 ? 'text-teal-700' : 'text-gray-700'}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Product Renewal Timing</h4>
                <div className="space-y-2">
                  {Object.entries(data.seasonalPatterns?.productRenewalPatterns || {}).map(([product, info]) => (
                    <div key={product} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">{product}</span>
                      <span className="text-teal-600">Peak: {info.topMonths.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-teal-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-teal-600">{data.seasonalPatterns?.q4Focus?.policyCount}</p>
                <p className="text-sm text-teal-700">Q4/Q1 Renewals (Nov-Jan)</p>
                <p className="text-xs text-gray-500 mt-1">${(data.seasonalPatterns?.q4Focus?.premiumAtStake / 1000).toFixed(0)}K premium at stake</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">New Business Trend</h4>
                <div className="flex items-end space-x-1 h-16">
                  {Object.entries(data.seasonalPatterns?.newBusinessTrend || {}).map(([year, count]) => (
                    <div key={year} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t ${year === '2025' ? 'bg-teal-500' : 'bg-gray-300'}`}
                        style={{ height: `${(count / 100) * 64}px` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{year.slice(-2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg border-l-4 border-teal-500 text-sm">
              <strong>Key insight:</strong> {data.seasonalPatterns?.insights?.[0]}. Prepare cross-sell campaigns for peak months.
            </div>
          </div>

          {/* 7. Claims Impact Analysis */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FileWarning className="w-5 h-5 mr-2 text-orange-600" />
              Claims Impact Analysis
            </h3>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{data.claimsImpact?.summary?.totalClaims}</p>
                <p className="text-xs text-orange-700">Total Claims</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-700">{data.claimsImpact?.summary?.uniqueCustomers}</p>
                <p className="text-xs text-gray-600">Customers w/Claims</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{data.claimsImpact?.summary?.pendingClaims}</p>
                <p className="text-xs text-yellow-700">Pending</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">${(data.claimsImpact?.summary?.totalAdjustedLosses / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-red-700">Adjusted Losses</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Claims by Product</h4>
                <div className="space-y-2">
                  {Object.entries(data.claimsImpact?.byProduct || {}).slice(0, 4).map(([product, info]) => (
                    <div key={product} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>{product}</span>
                      <div className="text-right">
                        <span className="font-medium">{info.claimCount} claims</span>
                        <span className="text-xs text-gray-500 ml-2">${(info.adjustedLosses / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Frequent Claimers (Monitor)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data.claimsImpact?.frequentClaimers?.slice(0, 6).map((customer, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-orange-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-orange-600 ml-1">({customer.claimCount} claims)</span>
                      </div>
                      <span className="text-gray-600">${customer.premium.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500 text-sm">
              <strong>Retention priority:</strong> Single-policy claimants are 3x more likely to leave. Contact within 48 hours of claim resolution with bundle offer to reduce churn by 40%.
            </div>
          </div>

          {/* Action Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4">Priority Actions from Deep Analysis</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <p className="font-medium text-gray-900">Contact 35 high-risk customers</p>
                    <p className="text-sm text-gray-600">$104K revenue at risk - offer bundle incentives</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <p className="font-medium text-gray-900">Follow up on 111 pending claims</p>
                    <p className="text-sm text-gray-600">Bundle offer within 48hrs of resolution</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="font-medium text-gray-900">Bundle 244 high-premium singles</p>
                    <p className="text-sm text-gray-600">Potential $366K additional premium</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <p className="font-medium text-gray-900">Prep Q4/Q1 renewal campaign</p>
                    <p className="text-sm text-gray-600">362 policies ($617K) renewing Nov-Jan</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  <div>
                    <p className="font-medium text-gray-900">Launch referral program</p>
                    <p className="text-sm text-gray-600">179 ideal candidates - expect 10-15/year</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                  <div>
                    <p className="font-medium text-gray-900">Replicate 93109 success</p>
                    <p className="text-sm text-gray-600">71.4% bundle rate - best in book</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookOfBusinessDashboard;
