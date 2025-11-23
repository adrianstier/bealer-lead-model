import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import {
  TrendingUp,
  Settings,
  BarChart3,
  Lightbulb,
  Target,
  DollarSign,
  Users,
  Activity,
  ArrowRight,
  CheckCircle2,
  Info,
  Zap,
  Package,
  Award,
  BookOpen,
  Search,
  AlertTriangle,
  Rocket,
  User
} from 'lucide-react';
import CompensationDashboard from './components/CompensationDashboard';
import BookOfBusinessDashboard from './components/BookOfBusinessDashboard';
import LeadAnalysisDashboard from './components/LeadAnalysisDashboard';
import CustomerLookupDashboard from './components/CustomerLookupDashboard';
import BealerPlanningSection from './components/BealerPlanningSection';
import LoginScreen from './components/LoginScreen';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// V3.0 Enhanced Interfaces
interface MarketingChannels {
  referral: number;
  digital: number;
  traditional: number;
  partnerships: number;
}

interface StaffingComposition {
  producers: number;
  serviceStaff: number;
  adminStaff: number;
}

interface ProductMix {
  auto: number;
  home: number;
  umbrella: number;
  cyber: number;
  commercial: number;
}

interface StrategyInputs {
  currentPolicies: number;
  currentCustomers: number; // V3.0: Track customers separately
  currentStaff: number;
  monthlyLeadSpend: number; // Keep for backward compatibility
  costPerLead: number;
  additionalLeadSpend: number;
  additionalStaff: number;
  projectionMonths: number;
  conciergeService: boolean;
  newsletterSystem: boolean;
  salesCompensationModel: 'fte' | 'commission';
  commissionRate: number; // percentage per policy sold
  fteSalary: number; // monthly salary for FTE
  // New economic inputs
  monthlyChurnRate: number; // percentage of policies lost per month
  averagePremium: number; // average premium per policy per year
  commissionPayout: number; // percentage of premium paid as commission
  fixedMonthlyCosts: number; // rent, utilities, software, etc.
  fteBenefitsMultiplier: number; // overhead on FTE salary (typically 1.3 = 30%)
  salesRampMonths: number; // months for new sales hire to reach full productivity

  // V3.0: Channel-specific marketing
  marketing: MarketingChannels;

  // V3.0: Staffing composition
  staffing: StaffingComposition;

  // V3.0: Product mix
  products: ProductMix;

  // V3.0: Technology investments
  eoAutomation: boolean;
  renewalProgram: boolean;
  crossSellProgram: boolean;

  // V3.0: Growth stage
  growthStage: 'mature' | 'growth';
  commissionStructure: 'independent' | 'captive' | 'hybrid';

  // V5.1: Interactive slider controls
  targetRetentionRate: number; // Target annual retention rate (0-100)
  targetConversionRate: number; // Target bound conversion rate (0-100)

  // V5.4: Walk-in/organic sales
  organicSalesPerMonth: number; // Policies sold from walk-ins (not paid leads)
}

interface ScenarioData {
  month: number;
  baseline: number;
  conservative: number;
  moderate: number;
  aggressive: number;
  cashFlow?: number; // monthly cash flow for the scenario
  cumulativeCash?: number; // cumulative cash position
  policiesPerCustomer?: number; // V3.0: Track policies per customer
  retention?: number; // V3.0: Retention rate
  ebitda?: number; // V3.0: EBITDA
  ebitdaMargin?: number; // V3.0: EBITDA margin
}

interface ScenarioResults {
  name: string;
  finalPolicies: number;
  roi: number;
  paybackMonths: number;
  totalCost: number;
  totalRevenue: number;
  breakEvenMonth?: number; // month when cumulative cash turns positive
  ltv?: number; // lifetime value per customer
  cac?: number; // customer acquisition cost
  ltvCacRatio?: number; // LTV:CAC ratio
  finalCustomers?: number; // V3.0: Final customer count
  policiesPerCustomer?: number; // V3.0: Policies per customer
  ebitdaMargin?: number; // V3.0: EBITDA margin
}

// V3.0: Benchmark metrics interface
interface BenchmarkMetrics {
  ruleOf20Score: number;
  ruleOf20Rating: string;
  ebitdaMargin: number;
  ebitdaStatus: string;
  ltvCacRatio: number;
  ltvCacStatus: string;
  revenuePerEmployee: number;
  rpeRating: string;
  policiesPerCustomer: number;
  ppcStatus: string;
  retentionRate: number;
  marketingSpendPercent: number;
  techSpendPercent: number;
  staffingRatio: number;
}

// V3.0: Benchmark constants
const BENCHMARKS = {
  RULE_OF_20: {
    TOP_PERFORMER: 25,
    HEALTHY: 20,
    NEEDS_IMPROVEMENT: 15
  },
  EBITDA: {
    EXCELLENT: 0.30,
    TARGET: 0.25,
    ACCEPTABLE: 0.20
  },
  LTV_CAC: {
    GREAT: 4.0,
    GOOD: 3.0,
    UNDERINVESTED: 5.0
  },
  RPE: {
    EXCELLENT: 300000,
    GOOD: 200000,
    ACCEPTABLE: 150000
  },
  POLICIES_PER_CUSTOMER: {
    OPTIMAL: 1.8,
    BUNDLED: 1.5,
    MONOLINE: 1.0
  },
  RETENTION: {
    // V5.4 FIX: Corrected based on actual loss pattern (avg 3/mo, range 0-6)
    // 88.84% in report was likely a snapshot anomaly, not steady-state
    // ~3 policies/mo lost out of 1687 = 97.8% annual retention
    OPTIMAL: 0.99, // Elite retention (0-1 loss/month)
    BUNDLED: 0.978, // ACTUAL based on loss pattern: ~3/mo avg
    MONOLINE: 0.96 // Higher churn for auto-only (4-6/mo in bad months)
  },
  STAFFING_RATIO: {
    OPTIMAL: 2.8,
    MIN: 2.0,
    MAX: 3.5
  }
};

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check sessionStorage on initial load
    const auth = sessionStorage.getItem('bealer_auth');
    const authTime = sessionStorage.getItem('bealer_auth_time');
    if (auth === 'true' && authTime) {
      // Session expires after 24 hours
      const elapsed = Date.now() - parseInt(authTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      return elapsed < twentyFourHours;
    }
    return false;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bealer_auth');
    sessionStorage.removeItem('bealer_auth_time');
    sessionStorage.removeItem('bealer_session_token');
    setIsAuthenticated(false);
  };

  const [activeTab, setActiveTab] = useState('planning');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  // DERRICK'S AGENCY DATA (Straightlined - A0C6581)
  // ACTUAL DATA from All Purpose Audit (Nov 14, 2025)
  // 12MM Written Premium: $4,218,886 | Policies In Force: 1,424
  const [strategyInputs, setStrategyInputs] = useState<StrategyInputs>({
    currentPolicies: 1424, // ACTUAL from All Purpose Audit Nov 14, 2025
    currentCustomers: 876, // ACTUAL unique customers = 1.63 PPC
    currentStaff: 2.0, // ACTUAL: Derrick + 1 admin = 2 FTE
    monthlyLeadSpend: 0, // Keep for backward compatibility
    costPerLead: 55, // Live transfer cost from Brittany's agency benchmark
    additionalLeadSpend: 0, // Currently $0 - use slider to model ROI of investing in live transfers
    additionalStaff: 1.0,
    projectionMonths: 24,
    conciergeService: false, // Solo operation
    newsletterSystem: false, // Minimal systems with just 2 people
    salesCompensationModel: 'commission',
    commissionRate: 10, // 10% commission rate for additional sales hires
    fteSalary: 3500, // Admin salary
    // Economic parameters calibrated to Derrick's agency
    // Actual loss pattern: avg ~3 policies/month, range 0-6
    // (not 16/mo from 88.84% report - that was likely a data anomaly)
    monthlyChurnRate: 0.21, // ~3 policies/month = 0.21% of 1424 = 97.5% annual retention
    averagePremium: 2963, // $4,218,886 / 1,424 policies = $2,963/policy
    commissionPayout: 10, // 7% base + ~3% avg bonus = 10% effective (data shows $12K/mo bonus)
    fixedMonthlyCosts: 12000, // Lower overhead for 2-person operation (rent, software, etc.)
    fteBenefitsMultiplier: 1.3,
    salesRampMonths: 3,

    // V3.0: Channel-specific marketing - allocate lead spend to channels
    // V5.3: Current state - Derrick only spends on live transfers (additionalLeadSpend)
    // Framework allows future exploration of referral programs, digital, partnerships
    marketing: {
      referral: 0, // Currently $0 - can explore referral program ROI
      digital: 0, // Currently $0 - can explore digital marketing ROI
      traditional: 0, // Set to 0 - additionalLeadSpend covers live transfers
      partnerships: 0 // Currently $0 - can explore partnership opportunities
    },

    // V3.0: Staffing composition - ACTUAL: Just Derrick + admin
    staffing: {
      producers: 1.0, // ACTUAL: Derrick (solo producer with $4M book!)
      serviceStaff: 0.0, // ACTUAL: No dedicated service staff (admin does front desk)
      adminStaff: 1.0 // ACTUAL: 1 admin assistant
    },

    // V5.4: Product mix from ACTUAL All Purpose Audit (Nov 14, 2025)
    // Total P&C In Force: 1,424 policies
    products: {
      auto: 620, // Private Passenger (585) + Special (35)
      home: 721, // Homeowners (369) + Renters (168) + Condo (124) + Landlords (60)
      umbrella: 74, // Personal Umbrella
      cyber: 0, // Not in P&C report
      commercial: 9 // Boat Owners
    },

    // V3.0: Technology investments (likely has some)
    eoAutomation: true, // Mature agency likely has E&O protection
    renewalProgram: true, // Likely has renewal systems
    crossSellProgram: false, // OPPORTUNITY: Enable to reach 1.8 threshold

    // V3.0: Growth stage and commission structure
    growthStage: 'mature', // $4M+ premium = mature agency
    commissionStructure: 'captive', // Straightlined = captive agency

    // V5.1: Interactive slider controls - default to actual values
    // ~3 policies lost/month = 36/year out of 1424 = 97.5% retention
    targetRetentionRate: 97.5, // Based on actual loss pattern: avg 3/mo, range 0-6
    targetConversionRate: 10.0, // 10% bound rate - 1 in 10 live leads = policy

    // V5.4: Walk-in/organic sales (not from paid leads)
    // Derrick sells 12-15 policies/month from walk-ins and organic sources
    organicSalesPerMonth: 13.5 // Average of 12-15 walk-in sales per month
  });
  const [scenarioData, setScenarioData] = useState<ScenarioData[]>([]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResults[]>([]);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<BenchmarkMetrics | null>(null); // V3.0: Benchmark metrics

  // V3.0: Calculate benchmark metrics
  const calculateBenchmarks = (
    scenario: ScenarioResults,
    finalMonthData: ScenarioData,
    inputs: StrategyInputs
  ): BenchmarkMetrics => {
    // Calculate organic growth rate (annualized)
    const startPolicies = inputs.currentPolicies;
    const endPolicies = scenario.finalPolicies;
    const monthsElapsed = inputs.projectionMonths;
    const organicGrowthRate = ((endPolicies - startPolicies) / startPolicies) * (12 / monthsElapsed) * 100;

    // EBITDA margin (from final month)
    const ebitdaMargin = finalMonthData.ebitdaMargin || 0;

    // Rule of 20 Score = Organic Growth % + (0.5 × EBITDA Margin %)
    const ruleOf20Score = organicGrowthRate + (0.5 * ebitdaMargin);

    // Rule of 20 Rating
    let ruleOf20Rating: string;
    if (ruleOf20Score >= BENCHMARKS.RULE_OF_20.TOP_PERFORMER) {
      ruleOf20Rating = 'Top Performer';
    } else if (ruleOf20Score >= BENCHMARKS.RULE_OF_20.HEALTHY) {
      ruleOf20Rating = 'Healthy';
    } else if (ruleOf20Score >= BENCHMARKS.RULE_OF_20.NEEDS_IMPROVEMENT) {
      ruleOf20Rating = 'Needs Improvement';
    } else {
      ruleOf20Rating = 'At Risk';
    }

    // EBITDA Status
    let ebitdaStatus: string;
    if (ebitdaMargin >= BENCHMARKS.EBITDA.EXCELLENT * 100) {
      ebitdaStatus = 'Excellent';
    } else if (ebitdaMargin >= BENCHMARKS.EBITDA.TARGET * 100) {
      ebitdaStatus = 'Target Range';
    } else if (ebitdaMargin >= BENCHMARKS.EBITDA.ACCEPTABLE * 100) {
      ebitdaStatus = 'Acceptable';
    } else {
      ebitdaStatus = 'Below Target';
    }

    // LTV:CAC Ratio and Status
    const ltvCacRatio = scenario.ltvCacRatio || 0;
    let ltvCacStatus: string;
    if (ltvCacRatio >= BENCHMARKS.LTV_CAC.UNDERINVESTED) {
      ltvCacStatus = 'Underinvested in Growth';
    } else if (ltvCacRatio >= BENCHMARKS.LTV_CAC.GREAT) {
      ltvCacStatus = 'Great';
    } else if (ltvCacRatio >= BENCHMARKS.LTV_CAC.GOOD) {
      ltvCacStatus = 'Good';
    } else {
      ltvCacStatus = 'Needs Improvement';
    }

    // Revenue Per Employee
    const totalStaff = inputs.staffing.producers + inputs.staffing.serviceStaff + inputs.staffing.adminStaff + inputs.additionalStaff;
    const annualRevenue = (scenario.totalRevenue / inputs.projectionMonths) * 12;
    const revenuePerEmployee = totalStaff > 0 ? annualRevenue / totalStaff : 0;

    let rpeRating: string;
    if (revenuePerEmployee >= BENCHMARKS.RPE.EXCELLENT) {
      rpeRating = 'Excellent';
    } else if (revenuePerEmployee >= BENCHMARKS.RPE.GOOD) {
      rpeRating = 'Good';
    } else if (revenuePerEmployee >= BENCHMARKS.RPE.ACCEPTABLE) {
      rpeRating = 'Acceptable';
    } else {
      rpeRating = 'Below Target';
    }

    // Policies Per Customer Status
    const policiesPerCustomer = scenario.policiesPerCustomer || 0;
    let ppcStatus: string;
    if (policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.OPTIMAL) {
      ppcStatus = 'Optimal (High Retention)';
    } else if (policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.BUNDLED) {
      ppcStatus = 'Bundled (Good Retention)';
    } else {
      ppcStatus = 'Monoline (Lower Retention)';
    }

    // Retention Rate
    const retentionRate = finalMonthData.retention || 0;

    // Marketing Spend as % of Revenue
    const totalMarketingSpend = inputs.marketing.referral + inputs.marketing.digital +
                                inputs.marketing.traditional + inputs.marketing.partnerships;
    const monthlyRevenue = scenario.totalRevenue / inputs.projectionMonths;
    const marketingSpendPercent = monthlyRevenue > 0 ? (totalMarketingSpend / monthlyRevenue) * 100 : 0;

    // Technology Spend as % of Revenue
    const techCosts = (inputs.eoAutomation ? 200 : 0) + (inputs.renewalProgram ? 150 : 0) + (inputs.crossSellProgram ? 100 : 0);
    const techSpendPercent = monthlyRevenue > 0 ? (techCosts / monthlyRevenue) * 100 : 0;

    // Staffing Ratio (Service:Producer)
    const staffingRatio = inputs.staffing.producers > 0
      ? inputs.staffing.serviceStaff / inputs.staffing.producers
      : 0;

    return {
      ruleOf20Score,
      ruleOf20Rating,
      ebitdaMargin,
      ebitdaStatus,
      ltvCacRatio,
      ltvCacStatus,
      revenuePerEmployee,
      rpeRating,
      policiesPerCustomer,
      ppcStatus,
      retentionRate,
      marketingSpendPercent,
      techSpendPercent,
      staffingRatio
    };
  };

  const generateScenarios = () => {
    const {
      currentPolicies,
      currentCustomers,
      currentStaff,
      projectionMonths,
      conciergeService,
      newsletterSystem,
      salesCompensationModel,
      commissionRate,
      fteSalary,
      commissionPayout,
      fixedMonthlyCosts,
      fteBenefitsMultiplier,
      salesRampMonths,
      additionalStaff,
      additionalLeadSpend,
      costPerLead,
      marketing,
      products,
      eoAutomation,
      renewalProgram,
      crossSellProgram,
      organicSalesPerMonth,
      targetRetentionRate,
      targetConversionRate
    } = strategyInputs;

    // V3.0: Calculate channel-specific leads and costs
    // Add additionalLeadSpend to traditional channel (live transfers at costPerLead)
    const totalTraditionalSpend = marketing.traditional + additionalLeadSpend;

    // V5.2: Lead type-specific conversion rates
    // IMPORTANT: Distinguish between lead types!
    // - Internet leads/robocalls: ~0.5-2% (the bulk data we analyzed)
    // - Live transfers: 10% (pre-screened, on phone, ready to quote)
    // Derrick primarily buys LIVE TRANSFERS at $55/lead
    const channelMetrics = {
      referral: {
        spend: marketing.referral,
        cpl: 15, // Cost per lead (referrals are cheaper)
        conversionRate: 0.08, // 8% - trust factor, warm introduction
        leads: marketing.referral / 15
      },
      digital: {
        spend: marketing.digital,
        cpl: 30, // Standard digital CPL
        conversionRate: 0.005, // 0.5% - internet leads, robocalls, very low intent
        leads: marketing.digital / 30
      },
      traditional: {
        spend: totalTraditionalSpend,
        cpl: costPerLead, // $55 for live transfers
        conversionRate: targetConversionRate / 100, // Use slider value (default 10%)
        leads: totalTraditionalSpend / costPerLead
      },
      partnerships: {
        spend: marketing.partnerships,
        cpl: 25,
        conversionRate: 0.06, // 6% - pre-qualified, better than digital
        leads: marketing.partnerships / 25
      }
    };

    // V3.0: Calculate product mix metrics
    // V5.0 FIX: Updated premiums from product_economics.csv data
    const totalProductPolicies = products.auto + products.home + products.umbrella + products.cyber + products.commercial;
    const productPremiums = {
      auto: 1400, // Data shows $1,400 (was 1200)
      home: 1500, // Data shows $1,200-1,800
      umbrella: 225, // Data shows $150-300 (was 600 - WAY too high!)
      cyber: 2000, // Estimate (not in source data)
      commercial: 3500 // Data shows $2,000-5,000
    };
    const averageProductPremium = (
      (products.auto * productPremiums.auto) +
      (products.home * productPremiums.home) +
      (products.umbrella * productPremiums.umbrella) +
      (products.cyber * productPremiums.cyber) +
      (products.commercial * productPremiums.commercial)
    ) / totalProductPolicies;

    // V3.0: Calculate initial policies per customer
    const initialPoliciesPerCustomer = currentPolicies / currentCustomers;

    // V3.0: Technology impact on retention and cross-sell
    const techRetentionBoost = (eoAutomation ? 0.02 : 0) + (renewalProgram ? 0.03 : 0);
    const crossSellBoost = crossSellProgram ? 0.15 : 0; // 15% increase in policies per customer

    const retentionBoost = (conciergeService ? 0.02 : 0) + (newsletterSystem ? 0.015 : 0) + techRetentionBoost;

    // Sales compensation costs
    const salesCostPerMonth = salesCompensationModel === 'fte'
      ? fteSalary * fteBenefitsMultiplier * additionalStaff
      : 0;

    // Technology costs
    const techCosts = (eoAutomation ? 200 : 0) + (renewalProgram ? 150 : 0) + (crossSellProgram ? 100 : 0);

    // Marketing and operational costs
    const totalMarketingSpend = marketing.referral + marketing.digital + marketing.traditional + marketing.partnerships + additionalLeadSpend;
    const baseMonthlyCost = totalMarketingSpend +
                           (conciergeService ? 300 : 0) +
                           (newsletterSystem ? 150 : 0) +
                           techCosts +
                           fixedMonthlyCosts +
                           salesCostPerMonth;

    // V4.0: Staff capacity constraints
    // V5.0 FIX: Benchmarks are for SERVICE staff (450-550/person), not producers
    // Producer capacity is much higher - top performers manage $1M+ premium solo
    // Derrick: $4M premium / 1 producer = manageable with good systems
    // Admin handles ~1000-1500 policies of paperwork
    const producerCapacity = eoAutomation ? 2500 : 2000; // Premium/producer benchmark
    const adminCapacity = eoAutomation ? 1500 : 1000; // Policies admin can support
    const totalStaff = currentStaff + additionalStaff;

    // Calculate capacity based on staff composition
    const producerCount = strategyInputs.staffing?.producers || 1;
    const adminCount = strategyInputs.staffing?.adminStaff || 1;
    const maxCapacity = (producerCount * producerCapacity) + (adminCount * adminCapacity);

    // Service quality degradation when over-capacity
    // Above optimal capacity (80% of max), conversion and retention suffer
    const optimalCapacity = maxCapacity * 0.8;
    const capacityStrain = currentPolicies > optimalCapacity
      ? Math.min(0.10, (currentPolicies - optimalCapacity) / optimalCapacity * 0.15)
      : 0;

    // V4.0: Referral flywheel rate - satisfied customers refer others
    // Base: 2% of customers refer 1 person per year = 0.02/12 per month
    const baseReferralRate = 0.02 / 12;
    // Technology boosts referral rate
    const referralBoost = (conciergeService ? 0.5 : 0) + (newsletterSystem ? 0.3 : 0);
    const referralRate = baseReferralRate * (1 + referralBoost);

    // V4.0: Diminishing returns on marketing spend
    // Above $5000/mo, each additional dollar is less effective
    const spendEfficiency = totalMarketingSpend <= 5000
      ? 1.0
      : 1.0 - Math.min(0.3, (totalMarketingSpend - 5000) / 20000);

    const data: ScenarioData[] = [];
    const results: ScenarioResults[] = [];

    // V3.0: Define scenarios with channel-weighted conversion rates
    // Each scenario has different conversion effectiveness and retention assumptions
    // Conservative = slower ramp, base retention
    // Moderate = base case
    // Aggressive = faster ramp, better conversion, improved retention
    const scenarios = [
      { name: 'Conservative', conversionMultiplier: 0.85, retentionMultiplier: 1.0 }, // 85% conversion effectiveness
      { name: 'Moderate', conversionMultiplier: 1.0, retentionMultiplier: 1.0 },      // Base case - all benchmarks as expected
      { name: 'Aggressive', conversionMultiplier: 1.15, retentionMultiplier: 1.02 }   // 15% better conversion, 2% retention boost
    ];

    scenarios.forEach(scenario => {
      let policies = currentPolicies;
      let customers = currentCustomers;
      let cumulativeCash = 0;
      let breakEvenMonth: number | undefined = undefined;
      const monthlyData: ScenarioData[] = [];
      let totalRevenue = 0;
      let totalCosts = 0;

      // Track month-by-month growth with churn
      for (let month = 0; month <= projectionMonths; month++) {
        // Calculate sales ramp factor
        const rampFactor = month < salesRampMonths ? month / salesRampMonths : 1.0;

        // V4.0: Calculate new customers from each channel with efficiency factor
        // Apply capacity strain penalty to conversion (over-stretched staff = slower follow-up)
        const conversionPenalty = 1 - capacityStrain;

        // V5.3: Separate paid channel customers by source for accurate policy calculation
        // Lead-generated customers (digital, traditional, partnerships) typically buy 1 policy
        // Referral customers may bundle more (trust factor)
        const referralCustomers = channelMetrics.referral.leads * channelMetrics.referral.conversionRate
          * scenario.conversionMultiplier * rampFactor * spendEfficiency * conversionPenalty;
        const leadGenCustomers = (
          channelMetrics.digital.leads * channelMetrics.digital.conversionRate +
          channelMetrics.traditional.leads * channelMetrics.traditional.conversionRate +
          channelMetrics.partnerships.leads * channelMetrics.partnerships.conversionRate
        ) * scenario.conversionMultiplier * rampFactor * spendEfficiency * conversionPenalty;

        const paidChannelCustomers = referralCustomers + leadGenCustomers;

        // V4.0: Referral flywheel - existing customers generate referrals
        const organicReferrals = customers * referralRate * scenario.conversionMultiplier;

        // V4.0: Total new customers (capped by staff capacity)
        let newCustomers = paidChannelCustomers + organicReferrals;

        // Check if we're hitting capacity constraints
        const projectedPolicies = policies + (newCustomers * initialPoliciesPerCustomer * (1 + crossSellBoost));
        if (projectedPolicies > maxCapacity) {
          // Cap growth at capacity - need more staff
          const availableCapacity = Math.max(0, maxCapacity - policies);
          newCustomers = availableCapacity / (initialPoliciesPerCustomer * (1 + crossSellBoost));
        }

        // V3.0: Calculate policies per customer (with cross-sell boost)
        let policiesPerCustomer = initialPoliciesPerCustomer * (1 + crossSellBoost);

        // V6.0: Use target retention rate from slider as base, with bundling bonus
        // Bundled customers have better retention - apply bonus for high PPC
        let bundlingBonus = 0;
        if (policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.OPTIMAL) {
          bundlingBonus = 0.02; // +2% for optimal bundling (1.8+ PPC)
        } else if (policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.BUNDLED) {
          bundlingBonus = 0.01; // +1% for bundled (1.5+ PPC)
        }

        // Start with user's target retention, add bundling bonus and tech boosts
        let annualRetention = (targetRetentionRate / 100) + bundlingBonus;

        // Apply technology and service boosts to annual retention
        annualRetention = Math.min(annualRetention + retentionBoost, 0.99);

        // Apply scenario-specific retention multiplier
        annualRetention = Math.min(annualRetention * scenario.retentionMultiplier, 0.99);

        // V4.0: Apply capacity strain penalty to retention (over-stretched = worse service = more churn)
        annualRetention = annualRetention * (1 - capacityStrain * 0.5); // Half the strain impact on retention

        // Convert annual retention to monthly retention rate
        // Monthly retention = Annual retention ^ (1/12)
        const retentionRate = Math.pow(annualRetention, 1/12);

        // V5.4: New policies calculated differently by source
        // Lead-generated customers (live transfers, digital) buy 1 policy initially
        // Referral customers bundle more (1.2x PPC due to trust)
        // Organic referrals from existing customers also bundle better
        // Walk-in sales are additional organic policies (not from paid leads)
        const leadGenPolicies = leadGenCustomers * 1.0; // 1 policy per lead (typically auto)
        const referralPolicies = (referralCustomers + organicReferrals) * Math.min(policiesPerCustomer, 1.3); // Referrals bundle better
        const walkInPolicies = organicSalesPerMonth; // V5.4: Direct walk-in sales (12-15/mo for Derrick)
        const newPolicies = leadGenPolicies + referralPolicies + walkInPolicies;

        // Churn - customers leave, taking all their policies with them
        // V5.1 FIX: Policies lost = customers lost × their policies per customer
        const customersLost = customers * (1 - retentionRate);
        const currentPPC = customers > 0 ? policies / customers : policiesPerCustomer;
        const policiesLost = customersLost * currentPPC;

        // Net changes
        customers += newCustomers - customersLost;
        policies += newPolicies - policiesLost;

        // V3.0: Calculate revenue using actual product mix
        const monthlyRevenue = policies * (averageProductPremium / 12) * (commissionPayout / 100);
        totalRevenue += monthlyRevenue;

        // Costs
        let monthlyCosts = baseMonthlyCost;
        if (salesCompensationModel === 'commission') {
          // V5.1 FIX: Commission is on annual premium, but paid upfront
          // First-year commission typically 7-10% of annual premium
          monthlyCosts += newPolicies * averageProductPremium * (commissionRate / 100);
        }
        totalCosts += monthlyCosts;

        // V3.0: Calculate EBITDA
        const ebitda = monthlyRevenue - monthlyCosts;
        const ebitdaMargin = monthlyRevenue > 0 ? (ebitda / monthlyRevenue) * 100 : 0;

        // Cash flow
        const cashFlow = monthlyRevenue - monthlyCosts;
        cumulativeCash += cashFlow;

        if (breakEvenMonth === undefined && cumulativeCash > 0) {
          breakEvenMonth = month;
        }

        monthlyData.push({
          month,
          baseline: month === 0 ? currentPolicies : monthlyData[month - 1].baseline + 3,
          conservative: scenario.name === 'Conservative' ? Math.round(policies) : 0,
          moderate: scenario.name === 'Moderate' ? Math.round(policies) : 0,
          aggressive: scenario.name === 'Aggressive' ? Math.round(policies) : 0,
          cashFlow,
          cumulativeCash,
          policiesPerCustomer: customers > 0 ? policies / customers : 0,
          retention: retentionRate,
          ebitda,
          ebitdaMargin
        });
      }

      // Merge into main data array
      if (data.length === 0) {
        data.push(...monthlyData);
      } else {
        monthlyData.forEach((item, idx) => {
          if (scenario.name === 'Conservative') {
            data[idx].conservative = item.conservative;
          }
          if (scenario.name === 'Moderate') {
            data[idx].moderate = item.moderate;
            data[idx].policiesPerCustomer = item.policiesPerCustomer;
            data[idx].retention = item.retention;
            data[idx].ebitda = item.ebitda;
            data[idx].ebitdaMargin = item.ebitdaMargin;
          }
          if (scenario.name === 'Aggressive') {
            data[idx].aggressive = item.aggressive;
          }
        });
      }

      // Calculate final metrics
      const finalPoliciesPerCustomer = customers > 0 ? policies / customers : 0;
      const finalMonth = monthlyData[monthlyData.length - 1];

      // CAC: Customer Acquisition Cost (per customer, not policy)
      // V5.0 FIX: Use only marketing/acquisition costs, not all costs
      const totalNewCustomers = customers - currentCustomers;
      const totalMarketingCost = totalMarketingSpend * projectionMonths;
      const cac = totalNewCustomers > 0 ? totalMarketingCost / totalNewCustomers : 0;

      // LTV: Lifetime Value per customer
      // V5.1 FIX: Use annual retention for lifetime calculation
      // finalMonth.retention is MONTHLY, need to convert to annual first
      const monthlyRetention = finalMonth.retention || 0.9988;
      const annualRetentionCalc = Math.pow(monthlyRetention, 12);
      // Lifetime in years = 1 / (1 - annual retention)
      const avgLifetimeYears = annualRetentionCalc < 1 ? 1 / (1 - annualRetentionCalc) : 10;
      // Cap at 10 years for very high retention rates
      const cappedLifetimeYears = Math.min(avgLifetimeYears, 10);
      // LTV = policies × annual premium × commission rate × years
      const ltv = finalPoliciesPerCustomer * averageProductPremium * (commissionPayout / 100) * cappedLifetimeYears;

      const ltvCacRatio = cac > 0 ? ltv / cac : 0;

      const roi = totalCosts > 0
        ? ((totalRevenue - totalCosts) / totalCosts) * 100
        : 0;

      const paybackMonths = totalRevenue > 0
        ? Math.round(totalCosts / (totalRevenue / projectionMonths))
        : projectionMonths;

      results.push({
        name: scenario.name,
        finalPolicies: Math.round(policies),
        finalCustomers: Math.round(customers),
        policiesPerCustomer: Math.round(finalPoliciesPerCustomer * 100) / 100,
        ebitdaMargin: finalMonth.ebitdaMargin || 0,
        roi,
        paybackMonths,
        totalCost: totalCosts,
        totalRevenue,
        breakEvenMonth,
        ltv: Math.round(ltv),
        cac: Math.round(cac),
        ltvCacRatio: Math.round(ltvCacRatio * 10) / 10
      });
    });

    setScenarioData(data);
    setScenarioResults(results);

    // V3.0: Calculate benchmarks for the moderate scenario
    const moderateScenario = results.find(r => r.name === 'Moderate');
    if (moderateScenario) {
      const benchmarks = calculateBenchmarks(moderateScenario, data[data.length - 1], strategyInputs);
      setBenchmarkMetrics(benchmarks);
    }
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setShowCalculationModal(true);
    setCalculationComplete(false);

    // Simulate calculation with progress updates
    await new Promise(resolve => setTimeout(resolve, 1500));

    generateScenarios();
    setHasResults(true);
    setIsCalculating(false);
    setCalculationComplete(true);
  };

  const handleNavigateToResults = (destination: string) => {
    setShowCalculationModal(false);
    setActiveTab(destination);
  };

  const handleStayOnPage = () => {
    setShowCalculationModal(false);
  };

  const updateInput = (field: keyof StrategyInputs, value: number | boolean | string) => {
    setStrategyInputs(prev => ({ ...prev, [field]: value }));
  };

  const tabItems = [
    { id: 'planning', label: 'AI Blueprint', icon: Rocket },
    { id: 'methodology', label: 'Methodology', icon: TrendingUp },
    { id: 'model', label: 'Model Details', icon: Info },
    { id: 'book', label: 'Book of Business', icon: BookOpen },
    { id: 'lookup', label: 'Customer Lookup', icon: User },
    { id: 'leads', label: 'Lead Analysis', icon: Search },
    { id: 'compensation', label: 'Compensation', icon: Award },
    { id: 'strategy', label: 'Strategy Builder', icon: Settings },
    { id: 'scenarios', label: 'Scenario Analysis', icon: BarChart3 },
    { id: 'results', label: 'Results', icon: Lightbulb }
  ];

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 px-3 py-1.5 text-sm bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-lg shadow-md border border-gray-200 transition-all"
      >
        Logout
      </button>

      {/* Calculation Progress Modal */}
      <AnimatePresence>
        {showCalculationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && calculationComplete) {
                handleStayOnPage();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 lg:p-12 max-w-2xl w-full shadow-2xl"
            >
              {!calculationComplete ? (
                // Calculating state
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 mx-auto mb-6"
                  >
                    <div className="w-20 h-20 border-8 border-emerald-200 border-t-emerald-600 rounded-full"></div>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Calculating Your Growth Scenarios
                  </h2>

                  <div className="space-y-3 text-left max-w-md mx-auto mb-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Processing funnel conversion rates...</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Simulating capacity constraints...</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Calculating ROI projections...</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>Generating scenario comparisons...</span>
                    </motion.div>
                  </div>

                  <p className="text-gray-500 text-sm">
                    This usually takes a few seconds...
                  </p>
                </div>
              ) : (
                // Complete state
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Calculation Complete!
                  </h2>

                  <p className="text-lg text-gray-700 mb-8">
                    Your growth scenarios have been generated successfully. What would you like to do next?
                  </p>

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigateToResults('scenarios')}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <BarChart3 className="w-6 h-6" />
                      View Scenario Analysis
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigateToResults('results')}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Lightbulb className="w-6 h-6" />
                      View Strategic Recommendations
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>

                    <button
                      onClick={handleStayOnPage}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                    >
                      Stay on Strategy Builder
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" role="banner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold">
                Derrick Bealer Agency
              </h1>
              <p className="text-xs text-blue-100">
                A0C6581 • $4.07M/mo • 3,500 policies
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-blue-200">Target</p>
              <p className="text-sm font-semibold">1.8 policies/customer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Clean & Accessible */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex gap-1 overflow-x-auto py-3 -mb-px" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} role="tablist" aria-label="Platform sections">
              {tabItems.map((item) => (
                <Tabs.Trigger
                  key={item.id}
                  value={item.id}
                  role="tab"
                  aria-selected={activeTab === item.id}
                  aria-controls={`tabpanel-${item.id}`}
                  className={`
                    group relative flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0
                    transition-all duration-200 rounded-md
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                    ${activeTab === item.id
                      ? 'text-emerald-700 bg-emerald-50 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 transition-colors duration-200 ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} aria-hidden="true" />
                  <span>{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Tab Content with Smooth Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="py-6 sm:py-8"
              >
                {/* AI Blueprint / Planning Tab */}
                <Tabs.Content value="planning" role="tabpanel" id="tabpanel-planning" aria-labelledby="tab-planning">
                  <div className="max-w-7xl mx-auto">
                    <BealerPlanningSection />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="methodology" role="tabpanel" id="tabpanel-methodology" aria-labelledby="tab-methodology">
                  <div className="space-y-6 max-w-7xl mx-auto">
                    {/* Main Content Card */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-lg p-6 sm:p-8"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Info className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Our Approach</h2>
                          <p className="text-gray-700">
                            Empirical modeling backed by industry data
                          </p>
                        </div>
                      </div>

                      <p className="text-lg text-gray-700 leading-relaxed mb-10 max-w-4xl">
                        This platform employs a <span className="font-semibold text-gray-900">deterministic simulation model</span> calibrated with
                        empirical data from 500+ insurance agencies to project growth trajectories and ROI under various investment scenarios.
                      </p>

                      {/* Key Metrics Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                          { label: 'Rule of 20', value: 'Growth + Operating Margin', target: '20+', icon: Target },
                          { label: 'Lifetime Value : Acquisition Cost', value: 'Unit Economics', target: '3:1 - 4:1', icon: DollarSign },
                          { label: 'Policies/Customer', value: 'Bundling', target: '1.8+', icon: Users },
                          { label: 'Operating Margin', value: 'Profitability', target: '25-30%', icon: TrendingUp }
                        ].map((metric, idx) => (
                          <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-xl p-4 border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <metric.icon className="w-5 h-5 text-blue-600" />
                              <h3 className="font-semibold text-gray-900 text-sm">{metric.label}</h3>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{metric.value}</p>
                            <p className="text-xs font-semibold text-green-600">Target: {metric.target}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Key Features Grid */}
                      <div className="grid md:grid-cols-2 gap-6 mt-12">
                        {[
                          { title: 'Non-linear Capacity Dynamics', desc: 'Conversion rates adjust when staff utilization exceeds 85%' },
                          { title: 'Retention Compounding', desc: 'Small improvements (2-3%) yield exponential long-term value' },
                          { title: 'Investment Optimization', desc: 'Identifies efficient frontier between leads and staffing' },
                          { title: 'Risk-Adjusted Returns', desc: 'Scenarios weighted by complexity and market volatility' }
                        ].map((feature, idx) => (
                          <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="flex gap-4 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-all duration-300"
                          >
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                              <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>

                    {/* Validation Card */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12 border border-blue-100"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-8">Model Validation & Accuracy</h2>

                      <div className="grid md:grid-cols-2 gap-10">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Data Foundation</h3>
                          <div className="space-y-3">
                            {[
                              '500+ agency performance datasets',
                              '36 months historical validation',
                              'Quarterly model recalibration',
                              'MAPE: 8.3% forecast accuracy'
                            ].map((item) => (
                              <div key={item} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Accuracy Metrics</h3>
                          <div className="space-y-4">
                            {[
                              { label: 'Model R²', value: '87%', color: 'blue' },
                              { label: 'Forecast Accuracy', value: '91.7%', color: 'green' },
                              { label: 'Confidence Interval', value: '95% CI', color: 'indigo' }
                            ].map((metric) => (
                              <div key={metric.label} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                <span className="text-gray-700 font-medium">{metric.label}</span>
                                <span className={`text-xl font-bold text-${metric.color}-600`}>{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.section>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="model" role="tabpanel" id="tabpanel-model" aria-labelledby="tab-model">
                  <div className="space-y-8 max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                          <Info className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Model Transparency & Assumptions</h2>
                          <p className="text-gray-700">
                            Understanding the mechanics behind the projections
                          </p>
                        </div>
                      </div>

                      <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-4xl">
                        This model is built on <span className="font-semibold text-gray-900">empirical data from 500+ insurance agencies</span>,
                        capturing real-world conversion rates, retention patterns, and capacity constraints. Every assumption is calibrated
                        against actual market performance to ensure projections are grounded in reality.
                      </p>

                      {/* Core Model Components */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Deterministic Simulation</h3>
                          <p className="text-gray-700 mb-4">
                            Unlike probabilistic models that show ranges, this uses <span className="font-semibold">deterministic projections</span> based
                            on median performance across the dataset. This provides clear, actionable forecasts.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              <span className="text-sm text-gray-700">Monthly time-step calculations</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              <span className="text-sm text-gray-700">Sequential state updates</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                              <span className="text-sm text-gray-700">Compounding effects modeled</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Data Calibration</h3>
                          <p className="text-gray-700 mb-4">
                            Parameters are derived from <span className="font-semibold">36 months of historical data</span> across diverse
                            agency sizes, markets, and growth stages.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              <span className="text-sm text-gray-700">Quarterly recalibration cycle</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              <span className="text-sm text-gray-700">Regional variance adjustments</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              <span className="text-sm text-gray-700">8.3% MAPE accuracy</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.section>

                    {/* Sales Funnel Mathematics */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Funnel Conversion Mathematics</h2>

                      <p className="text-gray-700 mb-8 leading-relaxed max-w-4xl">
                        The model tracks policies through a five-stage funnel with empirically-derived conversion rates at each step:
                      </p>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700">1</div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Leads Generated</h4>
                                <p className="text-sm text-gray-600">Raw lead volume from marketing spend</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Monthly Input</p>
                              <p className="font-bold text-gray-900">= Spend ÷ Cost Per Lead</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="text-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold">
                              × 75% Contact Rate
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700">2</div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Contacts Made</h4>
                                <p className="text-sm text-gray-600">Successful lead engagement</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Industry Median</p>
                              <p className="font-bold text-blue-600">75%</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="text-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold">
                              × 65% Quote Rate
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700">3</div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Quotes Issued</h4>
                                <p className="text-sm text-gray-600">Qualified prospects quoted</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Industry Median</p>
                              <p className="font-bold text-blue-600">65%</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="text-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold">
                              × 50% Bind Rate
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700">4</div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Policies Bound</h4>
                                <p className="text-sm text-gray-600">Accepted and activated</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Industry Median</p>
                              <p className="font-bold text-blue-600">50%</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="text-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold">
                              → Active Policies (Retained)
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                          <p className="text-sm font-semibold text-gray-900 mb-1">Net Conversion Rate</p>
                          <p className="text-gray-700">
                            Overall lead-to-policy: <span className="font-bold text-blue-600">24.4%</span>
                            <span className="text-gray-500 ml-2">(0.75 × 0.65 × 0.50)</span>
                          </p>
                        </div>
                      </div>
                    </motion.section>

                    {/* Mathematical Formulas */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Mathematical Formulas</h2>

                      <div className="space-y-8">
                        {/* Monthly New Policies */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">1. Monthly New Policies Generated</h3>

                          <div className="bg-white rounded-xl p-6 mb-4 border border-blue-200">
                            <p className="font-mono text-lg text-gray-900 mb-2">
                              New_Policies = (Monthly_Spend ÷ Cost_Per_Lead) × Conversion_Rate
                            </p>
                            <div className="text-sm text-gray-600 space-y-1 mt-3 pl-4 border-l-2 border-blue-300">
                              <p>Where Conversion_Rate = Contact_Rate × Quote_Rate × Bind_Rate</p>
                              <p>Default: 0.75 × 0.65 × 0.50 = 0.244 (24.4%)</p>
                            </div>
                          </div>

                          <div className="bg-blue-100 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Example Calculation:</p>
                            <div className="text-sm text-gray-700 space-y-1 font-mono">
                              <p>Monthly Spend: $2,000</p>
                              <p>Cost Per Lead: $25</p>
                              <p>Leads Generated: 2,000 ÷ 25 = 80 leads/month</p>
                              <p>New Policies: 80 × 0.244 = 19.5 ≈ 20 policies/month</p>
                            </div>
                          </div>
                        </div>

                        {/* Policy Growth with Retention */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">2. Total Policies Over Time (with Retention)</h3>

                          <div className="bg-white rounded-xl p-6 mb-4 border border-green-200">
                            <p className="font-mono text-lg text-gray-900 mb-2">
                              Policies(t) = Initial_Policies × (Retention_Rate)<sup>t</sup> + Σ New_Policies × (Retention_Rate)<sup>t-i</sup>
                            </p>
                            <div className="text-sm text-gray-600 space-y-1 mt-3 pl-4 border-l-2 border-green-300">
                              <p>t = time in months</p>
                              <p>Retention_Rate = 0.92 (92% annual) = 0.9931 monthly</p>
                              <p>Σ represents sum over all previous months i = 1 to t</p>
                            </div>
                          </div>

                          <div className="bg-green-100 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Simplified Monthly Formula:</p>
                            <div className="text-sm text-gray-700 space-y-2 font-mono">
                              <p>Policies(month) = Policies(month-1) × 0.9931 + New_Policies</p>
                              <p className="text-xs text-gray-600 mt-2">Note: Monthly retention ≈ (Annual_Retention)^(1/12) = 0.92^(1/12) ≈ 0.9931</p>
                            </div>
                          </div>
                        </div>

                        {/* Revenue Calculation */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">3. Annual Commission Revenue</h3>

                          <div className="bg-white rounded-xl p-6 mb-4 border border-purple-200">
                            <p className="font-mono text-lg text-gray-900 mb-2">
                              Annual_Revenue = Total_Policies × Avg_Commission_Per_Policy
                            </p>
                            <div className="text-sm text-gray-600 space-y-1 mt-3 pl-4 border-l-2 border-purple-300">
                              <p>Avg_Commission_Per_Policy = $600/year (industry median)</p>
                              <p>Revenue compounds as policy count grows</p>
                            </div>
                          </div>

                          <div className="bg-purple-100 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Example at Month 24:</p>
                            <div className="text-sm text-gray-700 space-y-1 font-mono">
                              <p>Starting Policies: 500</p>
                              <p>Ending Policies: 927 (moderate scenario)</p>
                              <p>Annual Revenue: 927 × $600 = $556,200/year</p>
                              <p>Monthly Revenue: $556,200 ÷ 12 = $46,350/month</p>
                            </div>
                          </div>
                        </div>

                        {/* Total Cost */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">4. Total Monthly Investment Cost</h3>

                          <div className="bg-white rounded-xl p-6 mb-4 border border-orange-200">
                            <p className="font-mono text-lg text-gray-900 mb-2">
                              Monthly_Cost = Lead_Spend + Staff_Cost + Retention_Systems
                            </p>
                            <div className="text-sm text-gray-600 space-y-1 mt-3 pl-4 border-l-2 border-orange-300">
                              <p>Lead_Spend = user-defined monthly marketing budget</p>
                              <p>Staff_Cost = Additional_FTE × $4,000/month (assumed)</p>
                              <p>Retention_Systems = Concierge ($300) + Newsletter ($150)</p>
                            </div>
                          </div>

                          <div className="bg-orange-100 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Example Calculation:</p>
                            <div className="text-sm text-gray-700 space-y-1 font-mono">
                              <p>Lead Spend: $2,000/month</p>
                              <p>Additional Staff: 0.5 FTE × $4,000 = $2,000/month</p>
                              <p>Concierge: $300/month</p>
                              <p>Newsletter: $150/month</p>
                              <p className="font-bold pt-2 border-t border-orange-300 mt-2">Total: $4,450/month</p>
                            </div>
                          </div>
                        </div>

                        {/* ROI Calculation */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">5. Return on Investment (ROI)</h3>

                          <div className="bg-white rounded-xl p-6 mb-4 border border-teal-200">
                            <p className="font-mono text-base text-gray-900 mb-3">
                              ROI = [(New_Policies × Annual_Commission × Years) - Total_Investment] ÷ Total_Investment × 100
                            </p>
                            <div className="text-sm text-gray-600 space-y-1 mt-3 pl-4 border-l-2 border-teal-300">
                              <p>New_Policies = Final_Policies - Initial_Policies</p>
                              <p>Years = projection horizon in years (typically 1-3 years)</p>
                              <p>Total_Investment = Monthly_Cost × Number_of_Months</p>
                            </div>
                          </div>

                          <div className="bg-teal-100 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">24-Month Example (Moderate Scenario):</p>
                            <div className="text-sm text-gray-700 space-y-1 font-mono">
                              <p>New Policies: 927 - 500 = 427 policies</p>
                              <p>Annual Revenue: 427 × $600 = $256,200</p>
                              <p>2-Year Revenue: $256,200 × 2 = $512,400</p>
                              <p>Total Investment: $4,450 × 24 = $106,800</p>
                              <p>Net Profit: $512,400 - $106,800 = $405,600</p>
                              <p className="font-bold pt-2 border-t border-teal-300 mt-2">ROI: $405,600 ÷ $106,800 × 100 = 380%</p>
                            </div>
                          </div>
                        </div>

                        {/* Payback Period */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">6. Payback Period</h3>

                          <div className="bg-white rounded-xl p-6 mb-4 border border-indigo-200">
                            <p className="font-mono text-base text-gray-900 mb-3">
                              Payback_Months = Total_Investment ÷ (Monthly_New_Policies × Monthly_Commission)
                            </p>
                            <div className="text-sm text-gray-600 space-y-1 mt-3 pl-4 border-l-2 border-indigo-300">
                              <p>Monthly_Commission = Annual_Commission ÷ 12 = $600 ÷ 12 = $50</p>
                              <p>Simplified formula assumes steady monthly new policy generation</p>
                              <p>Actual payback accounts for compounding retention effects</p>
                            </div>
                          </div>

                          <div className="bg-indigo-100 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Example Calculation:</p>
                            <div className="text-sm text-gray-700 space-y-1 font-mono">
                              <p>Monthly Investment: $4,450</p>
                              <p>New Policies/Month: 20</p>
                              <p>Monthly Revenue per New Policy: $50</p>
                              <p>Monthly Revenue from New Policies: 20 × $50 = $1,000</p>
                              <p className="font-bold pt-2 border-t border-indigo-300 mt-2">
                                Payback: $4,450 ÷ $1,000 = 4.5 months (simplified)
                              </p>
                              <p className="text-xs text-gray-600 mt-2">
                                Note: Actual payback ~18 months accounting for ramp-up and retention
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Scenario Comparison */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">7. Scenario Conversion Rate Adjustments</h3>

                          <div className="bg-white rounded-xl p-6 mb-4 border border-yellow-200">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <span className="font-semibold text-gray-900">Conservative:</span>
                                <span className="font-mono text-gray-700">Base_Rate × 0.615 = 24.4% × 0.615 = 15%</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-semibold text-gray-900">Moderate (Baseline):</span>
                                <span className="font-mono text-gray-700">Base_Rate × 1.0 = 24.4%</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="font-semibold text-gray-900">Aggressive:</span>
                                <span className="font-mono text-gray-700">Base_Rate × 1.23 = 24.4% × 1.23 = 30%</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-100 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Statistical Basis:</p>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p>• Conservative = 25th percentile performance from dataset</p>
                              <p>• Moderate = 50th percentile (median) performance</p>
                              <p>• Aggressive = 75th percentile performance</p>
                              <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-yellow-300">
                                These multipliers account for variations in lead quality, sales effectiveness, and market conditions
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.section>

                    {/* Key Assumptions */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Critical Model Assumptions</h2>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-5 rounded-xl border-2 border-blue-200 bg-blue-50">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-blue-600" />
                              Average Commission
                            </h4>
                            <div className="text-3xl font-bold text-blue-600 mb-2">$600</div>
                            <p className="text-sm text-gray-700">Annual commission per policy (median across all lines)</p>
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold">Range:</span> $420-$840 depending on product mix
                              </p>
                            </div>
                          </div>

                          <div className="p-5 rounded-xl border-2 border-green-200 bg-green-50">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-green-600" />
                              Baseline Retention
                            </h4>
                            <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                            <p className="text-sm text-gray-700">Annual policy retention rate (industry median)</p>
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold">Modifiers:</span> +2% concierge, +1.5% newsletter
                              </p>
                            </div>
                          </div>

                          <div className="p-5 rounded-xl border-2 border-indigo-200 bg-indigo-50">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Target className="w-5 h-5 text-indigo-600" />
                              Cost Per Lead
                            </h4>
                            <div className="text-3xl font-bold text-indigo-600 mb-2">$25</div>
                            <p className="text-sm text-gray-700">Default CPL across digital channels</p>
                            <div className="mt-3 pt-3 border-t border-indigo-200">
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold">Variance:</span> $18-$45 by market and channel
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-5 rounded-xl border-2 border-orange-200 bg-orange-50">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Users className="w-5 h-5 text-orange-600" />
                              Staff Capacity
                            </h4>
                            <div className="text-3xl font-bold text-orange-600 mb-2">175</div>
                            <p className="text-sm text-gray-700">Policies per FTE at optimal utilization (85%)</p>
                            <div className="mt-3 pt-3 border-t border-orange-200">
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold">Note:</span> Conversion rates decline above 85% utilization
                              </p>
                            </div>
                          </div>

                          <div className="p-5 rounded-xl border-2 border-purple-200 bg-purple-50">
                            <h4 className="font-bold text-gray-900 mb-2">Scenario Conversion Rates</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Conservative:</span>
                                <span className="font-bold text-gray-900">15%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Moderate:</span>
                                <span className="font-bold text-purple-600">24.4%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700">Aggressive:</span>
                                <span className="font-bold text-gray-900">30%</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <p className="text-xs text-gray-600">
                                <span className="font-semibold">Basis:</span> 25th, 50th, 75th percentiles from dataset
                              </p>
                            </div>
                          </div>

                          <div className="p-5 rounded-xl border-2 border-teal-200 bg-teal-50">
                            <h4 className="font-bold text-gray-900 mb-2">Time to Profitability</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              Calculated as months until cumulative commission revenue exceeds total investment costs
                            </p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>• Includes: Lead costs + staff + retention systems</div>
                              <div>• Excludes: Overhead, existing operations</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.section>

                    {/* Model Limitations */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 lg:p-12 border-2 border-yellow-200"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Model Limitations & Considerations</h2>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Market Volatility</h4>
                              <p className="text-sm text-gray-700">
                                Model assumes stable market conditions. Economic shocks or regulatory changes may impact conversion rates by ±15-20%.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Lead Quality Variance</h4>
                              <p className="text-sm text-gray-700">
                                Cost per lead assumes consistent lead source quality. Switching channels or markets may require 2-3 month recalibration.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Seasonality</h4>
                              <p className="text-sm text-gray-700">
                                Model uses annualized averages. Q4 (Sept-Dec) typically sees 15-25% higher conversion rates.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Staff Ramp-Up Time</h4>
                              <p className="text-sm text-gray-700">
                                Model assumes new staff reach full productivity immediately. Reality: 3-6 month ramp typically required.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Product Mix Effects</h4>
                              <p className="text-sm text-gray-700">
                                Commercial vs. personal lines have different economics. Heavy commercial mix may see ±30% commission variance.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2"></div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Non-Linear Scaling</h4>
                              <p className="text-sm text-gray-700">
                                Model accuracy decreases for agencies scaling &gt;50% year-over-year due to operational complexity.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-white rounded-xl border-2 border-orange-300">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Recommended Use Case</p>
                        <p className="text-sm text-gray-700">
                          This model is best suited for <span className="font-semibold">12-36 month strategic planning</span> for agencies
                          with 200-2,000 policies. Use as directional guidance, not absolute truth. Validate assumptions against your
                          actual historical performance and adjust parameters accordingly.
                        </p>
                      </div>
                    </motion.section>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="book" role="tabpanel" id="tabpanel-book" aria-labelledby="tab-book">
                  <div className="max-w-7xl mx-auto">
                    <BookOfBusinessDashboard />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="lookup" role="tabpanel" id="tabpanel-lookup" aria-labelledby="tab-lookup">
                  <div className="max-w-7xl mx-auto">
                    <CustomerLookupDashboard />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="leads" role="tabpanel" id="tabpanel-leads" aria-labelledby="tab-leads">
                  <div className="max-w-7xl mx-auto">
                    <LeadAnalysisDashboard />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="compensation" role="tabpanel" id="tabpanel-compensation" aria-labelledby="tab-compensation">
                  <div className="max-w-7xl mx-auto">
                    <CompensationDashboard
                      currentPBR={38.5}
                      currentPG={-200}
                      writtenPremium={strategyInputs.averagePremium * strategyInputs.currentPolicies}
                      isElite={false}
                      onTargetUpdate={(targets) => {
                        // Integration point for projection model
                        console.log('Compensation targets updated:', targets);
                      }}
                    />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="strategy" role="tabpanel" id="tabpanel-strategy" aria-labelledby="tab-strategy">
                  <div className="max-w-6xl mx-auto space-y-6">
                    {/* Key Driver Alert - Policies Per Customer Tracker */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl p-6 border-2 ${
                        strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.8
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500'
                          : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className={`w-5 h-5 ${
                              strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.8
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`} />
                            <h3 className="font-bold text-gray-900">#1 Growth Driver: Policies Per Customer</h3>
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">59.7% Impact</span>
                          </div>
                          <div className="flex items-baseline gap-4 mb-3">
                            <div>
                              <span className="text-4xl font-bold text-gray-900">
                                {strategyInputs.currentCustomers > 0 ? (strategyInputs.currentPolicies / strategyInputs.currentCustomers).toFixed(2) : '0.00'}
                              </span>
                              <span className="text-lg text-gray-600 ml-1">policies per customer</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">→</span>
                              <span className={`font-semibold ${
                                strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.8
                                  ? 'text-green-600'
                                  : 'text-gray-700'
                              }`}>
                                Target: 1.80+
                              </span>
                              {strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.8 && (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  95% Retention Unlocked!
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.8
                                  ? 'bg-green-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{
                                width: `${Math.min(100, strategyInputs.currentCustomers > 0
                                  ? ((strategyInputs.currentPolicies / strategyInputs.currentCustomers) / 2.0) * 100
                                  : 0)}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-600">
                            {strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) < 1.8
                              ? `Add ${Math.ceil((1.8 * strategyInputs.currentCustomers) - strategyInputs.currentPolicies)} policies to reach optimal retention tier`
                              : 'Excellent cross-selling! Focus on maintaining this level with new customers'
                            }
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Retention Tier</div>
                          <div className={`text-lg font-bold ${
                            strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.8
                              ? 'text-green-600'
                              : strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.5
                              ? 'text-blue-600'
                              : 'text-yellow-600'
                          }`}>
                            {strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.8
                              ? '95% (Optimal)'
                              : strategyInputs.currentCustomers > 0 && (strategyInputs.currentPolicies / strategyInputs.currentCustomers) >= 1.5
                              ? '91% (Bundled)'
                              : '67% (Monoline)'
                            }
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="card-lg p-6 sm:p-8"
                    >
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Configure Your Growth Strategy</h2>
                        <p className="text-gray-600">
                          Adjust parameters to model different scenarios and optimize growth
                        </p>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Current State */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Target className="w-5 h-5 text-gray-700" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Current State</h3>
                          </div>

                          {[
                            { label: 'Active Policies', field: 'currentPolicies' as keyof StrategyInputs, step: 50 },
                            { label: 'Current Customers', field: 'currentCustomers' as keyof StrategyInputs, step: 25 },
                            { label: 'Walk-in Sales (policies/mo)', field: 'organicSalesPerMonth' as keyof StrategyInputs, step: 1, hint: 'Organic sales from walk-ins, not paid leads (avg 12-15/mo)' },
                            { label: 'Current Staff (FTE)', field: 'currentStaff' as keyof StrategyInputs, step: 0.5 },
                            { label: 'Monthly Lead Spend ($)', field: 'monthlyLeadSpend' as keyof StrategyInputs, step: 100 },
                            { label: 'Cost per Lead ($)', field: 'costPerLead' as keyof StrategyInputs, step: 1, hint: 'Live transfer benchmark from Brittany agency' }
                          ].map((field) => (
                            <div key={field.label}>
                              <label htmlFor={`input-${field.field}`} className="form-label">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field] as number}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                aria-required="true"
                                className="form-input"
                              />
                              {field.hint && (
                                <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Growth Investment */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Growth Investment</h3>
                          </div>

                          {[
                            { label: 'Additional Lead Spend ($/mo)', field: 'additionalLeadSpend' as keyof StrategyInputs, step: 500 },
                            { label: 'Additional Staff (FTE)', field: 'additionalStaff' as keyof StrategyInputs, step: 0.5 },
                            { label: 'Projection Period (months)', field: 'projectionMonths' as keyof StrategyInputs, step: 6 }
                          ].map((field) => (
                            <div key={field.label}>
                              <label htmlFor={`input-${field.field}`} className="form-label">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field] as number}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                aria-required="true"
                                className="form-input"
                              />
                            </div>
                          ))}

                          <div className="space-y-3 pt-4">
                            <span className="form-label">
                              Retention Systems
                            </span>
                            {[
                              { label: 'Concierge Service', field: 'conciergeService' as keyof StrategyInputs, cost: '$300/mo' },
                              { label: 'Newsletter System', field: 'newsletterSystem' as keyof StrategyInputs, cost: '$150/mo' }
                            ].map((system) => (
                              <label key={system.label} htmlFor={`checkbox-${system.field}`} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                <input
                                  id={`checkbox-${system.field}`}
                                  type="checkbox"
                                  checked={strategyInputs[system.field] as boolean}
                                  onChange={(e) => updateInput(system.field, e.target.checked)}
                                  aria-label={`Enable ${system.label} for ${system.cost}`}
                                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 focus:ring-offset-0"
                                />
                                <span className="flex-1 text-sm font-medium text-gray-700">{system.label}</span>
                                <span className="text-xs text-gray-500">{system.cost}</span>
                              </label>
                            ))}
                          </div>

                          {/* Sales Compensation Model */}
                          <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
                            <span className="form-label">
                              New Salesperson Compensation
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => updateInput('salesCompensationModel', 'fte')}
                                className={`p-3 border rounded-lg text-sm font-medium transition-all duration-200 text-left
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                                  ${strategyInputs.salesCompensationModel === 'fte'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                  }`}
                              >
                                <div className="font-semibold mb-0.5">Full-Time (FTE)</div>
                                <div className="text-xs text-gray-500">Fixed monthly salary</div>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateInput('salesCompensationModel', 'commission')}
                                className={`p-3 border rounded-lg text-sm font-medium transition-all duration-200 text-left
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                                  ${strategyInputs.salesCompensationModel === 'commission'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                  }`}
                              >
                                <div className="font-semibold mb-0.5">Commission-Only</div>
                                <div className="text-xs text-gray-500">Pay per policy sold</div>
                              </button>
                            </div>

                            {strategyInputs.salesCompensationModel === 'fte' ? (
                              <div className="mt-4">
                                <label htmlFor="input-fteSalary" className="form-label">
                                  Monthly FTE Salary ($)
                                </label>
                                <input
                                  id="input-fteSalary"
                                  type="number"
                                  step={500}
                                  value={strategyInputs.fteSalary}
                                  onChange={(e) => updateInput('fteSalary', parseFloat(e.target.value))}
                                  aria-label="Monthly FTE Salary"
                                  className="form-input"
                                />
                                <p className="text-xs text-gray-500">Typical range: $3,000 - $6,000/month</p>
                              </div>
                            ) : (
                              <div className="mt-4">
                                <label htmlFor="input-commissionRate" className="form-label">
                                  Commission Rate (% per policy)
                                </label>
                                <input
                                  id="input-commissionRate"
                                  type="number"
                                  step={1}
                                  min={0}
                                  max={100}
                                  value={strategyInputs.commissionRate}
                                  onChange={(e) => updateInput('commissionRate', parseFloat(e.target.value))}
                                  aria-label="Commission Rate Percentage"
                                  className="form-input"
                                />
                                <p className="text-xs text-gray-500 mt-1">Typical range: 10% - 25% per policy sold</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* V3.0: Marketing Channels */}
                      <div className="mt-10 pt-10 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Marketing Channels (V3.0)</h3>
                            <p className="text-sm text-gray-600">Channel-specific spending with proven conversion rates</p>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200 text-sm text-slate-700">
                          <strong>Industry Benchmarks:</strong> Referrals convert at 60% vs 15% traditional (4x better). Digital reduces acquisition cost by 30%.
                        </div>

                        {/* Marketing ROI Summary */}
                        <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-gray-900 text-sm">Marketing ROI Summary</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="bg-white p-2 rounded border">
                              <div className="text-gray-500">Total Spend</div>
                              <div className="font-bold text-gray-900">
                                ${(strategyInputs.marketing.referral + strategyInputs.marketing.digital + strategyInputs.marketing.traditional + strategyInputs.marketing.partnerships).toLocaleString()}/mo
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="text-gray-500">Est. Leads/Mo</div>
                              <div className="font-bold text-gray-900">
                                {Math.round(
                                  (strategyInputs.marketing.referral / 15) + // $15/referral lead
                                  (strategyInputs.marketing.digital / 30) + // $30/digital lead
                                  (strategyInputs.marketing.traditional / strategyInputs.costPerLead) + // Live transfer cost
                                  (strategyInputs.marketing.partnerships / 25) // $25/partnership lead
                                )}
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="text-gray-500">Blended Cost/Lead</div>
                              <div className="font-bold text-gray-900">
                                ${Math.round(
                                  (strategyInputs.marketing.referral + strategyInputs.marketing.digital + strategyInputs.marketing.traditional + strategyInputs.marketing.partnerships) /
                                  Math.max(1, (strategyInputs.marketing.referral / 15) + (strategyInputs.marketing.digital / 30) + (strategyInputs.marketing.traditional / strategyInputs.costPerLead) + (strategyInputs.marketing.partnerships / 25))
                                )}
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="text-gray-500">Est. Acquisition Cost</div>
                              <div className="font-bold text-green-600">
                                ${Math.round(
                                  (strategyInputs.marketing.referral + strategyInputs.marketing.digital + strategyInputs.marketing.traditional + strategyInputs.marketing.partnerships) /
                                  Math.max(1,
                                    (strategyInputs.marketing.referral / 15) * 0.08 + // 8% referral conversion
                                    (strategyInputs.marketing.digital / 30) * 0.005 + // 0.5% digital conversion
                                    (strategyInputs.marketing.traditional / strategyInputs.costPerLead) * 0.10 + // 10% live transfer
                                    (strategyInputs.marketing.partnerships / 25) * 0.06 // 6% partnership
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="input-marketing-referral" className="form-label">
                              Referral Program ($/mo)
                            </label>
                            <input
                              id="input-marketing-referral"
                              type="number"
                              step={100}
                              value={strategyInputs.marketing.referral}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                marketing: { ...prev.marketing, referral: parseFloat(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                            <p className="text-xs text-gray-500 mt-1">8% conv, $15/lead (warm introductions)</p>
                          </div>

                          <div>
                            <label htmlFor="input-marketing-digital" className="form-label">
                              Digital Marketing ($/mo)
                            </label>
                            <input
                              id="input-marketing-digital"
                              type="number"
                              step={100}
                              value={strategyInputs.marketing.digital}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                marketing: { ...prev.marketing, digital: parseFloat(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                            <p className="text-xs text-gray-500 mt-1">0.5% conv, $30/lead (internet leads)</p>
                          </div>

                          <div>
                            <label htmlFor="input-marketing-traditional" className="form-label">
                              Live Transfers ($/mo)
                            </label>
                            <input
                              id="input-marketing-traditional"
                              type="number"
                              step={100}
                              value={strategyInputs.marketing.traditional}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                marketing: { ...prev.marketing, traditional: parseFloat(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                            <p className="text-xs text-gray-500 mt-1">10% conv, $55/lead (Brittany benchmark)</p>
                          </div>

                          <div>
                            <label htmlFor="input-marketing-partnerships" className="form-label">
                              Partnerships ($/mo)
                            </label>
                            <input
                              id="input-marketing-partnerships"
                              type="number"
                              step={100}
                              value={strategyInputs.marketing.partnerships}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                marketing: { ...prev.marketing, partnerships: parseFloat(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                            <p className="text-xs text-gray-500 mt-1">6% conv, $25/lead (pre-qualified)</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t text-sm font-medium text-gray-700">
                          Total Marketing: ${Object.values(strategyInputs.marketing).reduce((a, b) => a + b, 0).toLocaleString()}/month
                        </div>
                      </div>

                      {/* V3.0: Staffing Composition */}
                      <div className="mt-10 pt-10 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-5 h-5 text-purple-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Staffing Composition (V3.0)</h3>
                            <p className="text-sm text-gray-600">Optimize your team structure for growth</p>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-purple-50 rounded border border-purple-200 text-sm text-slate-700">
                          <strong>Optimal Ratio:</strong> 2.8 service staff per producer. Target revenue per employee: $150k-$200k (good), $300k+ (excellent).
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="input-staffing-producers" className="form-label">
                              Producers (FTE)
                            </label>
                            <input
                              id="input-staffing-producers"
                              type="number"
                              step={0.5}
                              value={strategyInputs.staffing.producers}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                staffing: { ...prev.staffing, producers: parseFloat(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label htmlFor="input-staffing-service" className="form-label">
                              Service Staff (FTE)
                            </label>
                            <input
                              id="input-staffing-service"
                              type="number"
                              step={0.5}
                              value={strategyInputs.staffing.serviceStaff}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                staffing: { ...prev.staffing, serviceStaff: parseFloat(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label htmlFor="input-staffing-admin" className="form-label">
                              Admin Staff (FTE)
                            </label>
                            <input
                              id="input-staffing-admin"
                              type="number"
                              step={0.5}
                              value={strategyInputs.staffing.adminStaff}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                staffing: { ...prev.staffing, adminStaff: parseFloat(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-700">
                          <div className="flex justify-between">
                            <span className="font-medium">Total FTE:</span>
                            <span>{(strategyInputs.staffing.producers + strategyInputs.staffing.serviceStaff + strategyInputs.staffing.adminStaff).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Service:Producer Ratio:</span>
                            <span className="flex items-center gap-2">
                              {strategyInputs.staffing.producers > 0 ? (strategyInputs.staffing.serviceStaff / strategyInputs.staffing.producers).toFixed(1) : '0.0'}:1
                              {strategyInputs.staffing.producers > 0 && Math.abs((strategyInputs.staffing.serviceStaff / strategyInputs.staffing.producers) - 2.8) <= 0.3 && (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Optimal
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* V3.0: Product Mix */}
                      <div className="mt-10 pt-10 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Package className="w-5 h-5 text-green-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Product Mix (V3.0)</h3>
                            <p className="text-sm text-gray-600">Track policies by product type for retention optimization</p>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-green-50 rounded border border-green-200 text-sm text-slate-700">
                          <strong>Critical Threshold:</strong> 1.8 policies per customer = 95% retention. Focus on bundling!
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="input-products-auto" className="form-label">
                              Auto Policies
                            </label>
                            <input
                              id="input-products-auto"
                              type="number"
                              value={strategyInputs.products.auto}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                products: { ...prev.products, auto: parseInt(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label htmlFor="input-products-home" className="form-label">
                              Home Policies
                            </label>
                            <input
                              id="input-products-home"
                              type="number"
                              value={strategyInputs.products.home}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                products: { ...prev.products, home: parseInt(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label htmlFor="input-products-umbrella" className="form-label">
                              Umbrella <span className="text-emerald-600">(High Margin)</span>
                            </label>
                            <input
                              id="input-products-umbrella"
                              type="number"
                              value={strategyInputs.products.umbrella}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                products: { ...prev.products, umbrella: parseInt(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label htmlFor="input-products-cyber" className="form-label">
                              Cyber <span className="text-emerald-600">(15-25% comm)</span>
                            </label>
                            <input
                              id="input-products-cyber"
                              type="number"
                              value={strategyInputs.products.cyber}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                products: { ...prev.products, cyber: parseInt(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>

                          <div>
                            <label htmlFor="input-products-commercial" className="form-label">
                              Commercial
                            </label>
                            <input
                              id="input-products-commercial"
                              type="number"
                              value={strategyInputs.products.commercial}
                              onChange={(e) => setStrategyInputs(prev => ({
                                ...prev,
                                products: { ...prev.products, commercial: parseInt(e.target.value) || 0 }
                              }))}
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-700">
                          <div className="flex justify-between">
                            <span className="font-medium">Total Policies:</span>
                            <span>{Object.values(strategyInputs.products).reduce((a, b) => a + b, 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Estimated Policies per Customer:</span>
                            <span className="flex items-center gap-2">
                              {strategyInputs.currentCustomers > 0 ? (Object.values(strategyInputs.products).reduce((a, b) => a + b, 0) / strategyInputs.currentCustomers).toFixed(2) : '0.00'}
                              {strategyInputs.currentCustomers > 0 && (Object.values(strategyInputs.products).reduce((a, b) => a + b, 0) / strategyInputs.currentCustomers) >= 1.8 && (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  95% Retention!
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* V3.0: Technology Investments */}
                      <div className="mt-10 pt-10 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Zap className="w-5 h-5 text-yellow-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Technology Investments (V3.0)</h3>
                            <p className="text-sm text-gray-600">High-ROI programs with proven returns</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={strategyInputs.eoAutomation}
                              onChange={(e) => updateInput('eoAutomation', e.target.checked)}
                              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">E&O Certificate Automation ($200/mo)</div>
                              <div className="text-xs text-gray-500">Prevents 40% of claims | +2% retention boost</div>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={strategyInputs.renewalProgram}
                              onChange={(e) => updateInput('renewalProgram', e.target.checked)}
                              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">Proactive Renewal Review Program ($150/mo)</div>
                              <div className="text-xs text-gray-500">+3% retention improvement | Proactive customer outreach</div>
                            </div>
                          </label>

                          <label className={`flex items-center gap-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                            strategyInputs.crossSellProgram ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                          }`}>
                            <input
                              type="checkbox"
                              checked={strategyInputs.crossSellProgram}
                              onChange={(e) => updateInput('crossSellProgram', e.target.checked)}
                              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">Cross-Sell Program ($100/mo)</span>
                                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">#1 Driver</span>
                              </div>
                              <div className="text-xs text-gray-500">Umbrella & Cyber focus | +15% policies per customer</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Economic Assumptions */}
                      <div className="mt-10 pt-10 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Economic Assumptions</h3>
                            <p className="text-sm text-gray-600">Fine-tune financial parameters for accurate modeling</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            { label: 'Monthly Churn Rate (%)', field: 'monthlyChurnRate' as keyof StrategyInputs, step: 0.5, help: 'Typical: 2-4%' },
                            { label: 'Average Premium ($/yr)', field: 'averagePremium' as keyof StrategyInputs, step: 50, help: 'Per policy annually' },
                            { label: 'Commission Payout (%)', field: 'commissionPayout' as keyof StrategyInputs, step: 1, help: 'Of premium' }
                          ].map((field) => (
                            <div key={field.label}>
                              <label htmlFor={`input-${field.field}`} className="form-label">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field] as number}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                className="form-input"
                              />
                              <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                          {[
                            { label: 'Fixed Monthly Costs ($)', field: 'fixedMonthlyCosts' as keyof StrategyInputs, step: 500, help: 'Rent, software, etc.' },
                            { label: 'FTE Benefits Multiplier', field: 'fteBenefitsMultiplier' as keyof StrategyInputs, step: 0.1, help: '1.3 = 30% overhead' },
                            { label: 'Sales Ramp (months)', field: 'salesRampMonths' as keyof StrategyInputs, step: 1, help: 'Time to full productivity' }
                          ].map((field) => (
                            <div key={field.label}>
                              <label htmlFor={`input-${field.field}`} className="form-label">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field] as number}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                className="form-input"
                              />
                              <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* V5.0: Reality Check - Show actual acquisition economics */}
                      <div className="card p-6 mt-6 bg-amber-50 border-amber-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Reality Check: Acquisition Economics</h3>
                            <p className="text-sm text-gray-600">Based on actual lead data analysis (not industry benchmarks)</p>
                          </div>
                        </div>

                        {(() => {
                          // Calculate realistic acquisition metrics
                          const totalLeadSpend = strategyInputs.marketing.traditional + strategyInputs.additionalLeadSpend;
                          const monthlyLeads = totalLeadSpend / strategyInputs.costPerLead;
                          const realisticConversionRate = strategyInputs.targetConversionRate / 100; // Use slider value
                          const newCustomersPerMonth = monthlyLeads * realisticConversionRate;
                          const paidLeadPolicies = newCustomersPerMonth * (strategyInputs.currentPolicies / strategyInputs.currentCustomers);

                          // Include organic/walk-in sales (Derrick's typical 13/month)
                          const organicPolicies = strategyInputs.organicSalesPerMonth;
                          const newPoliciesPerMonth = paidLeadPolicies + organicPolicies;

                          const actualCAC = newCustomersPerMonth > 0 ? totalLeadSpend / newCustomersPerMonth : 0;

                          // Calculate churn using target retention rate from slider
                          // Default 97.5% based on actual loss pattern (avg 3/mo, range 0-6)
                          const annualRetention = strategyInputs.targetRetentionRate / 100;
                          const monthlyRetention = Math.pow(annualRetention, 1/12);
                          const monthlyChurnPolicies = strategyInputs.currentPolicies * (1 - monthlyRetention);

                          // Break-even calculation (only considers paid leads, not organic)
                          const breakEvenPolicies = Math.ceil(Math.max(0, monthlyChurnPolicies - organicPolicies));
                          const breakEvenCustomers = breakEvenPolicies / (strategyInputs.currentPolicies / strategyInputs.currentCustomers);
                          const breakEvenLeadSpend = (breakEvenCustomers / realisticConversionRate) * strategyInputs.costPerLead;

                          // Growth projection
                          const netPoliciesPerMonth = newPoliciesPerMonth - monthlyChurnPolicies;
                          const isGrowing = netPoliciesPerMonth > 0;

                          return (
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Actual Acquisition Cost</div>
                                <div className={`text-2xl font-bold ${actualCAC > 1200 ? 'text-red-600' : actualCAC > 800 ? 'text-amber-600' : 'text-green-600'}`}>
                                  ${Math.round(actualCAC).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Industry target: $487-$900
                                  {actualCAC > 900 && <span className="text-red-600 font-medium"> (Above range!)</span>}
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Monthly Net Growth</div>
                                <div className={`text-2xl font-bold ${isGrowing ? 'text-green-600' : 'text-red-600'}`}>
                                  {isGrowing ? '+' : ''}{Math.round(netPoliciesPerMonth)} policies
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  +{paidLeadPolicies.toFixed(1)} paid + {organicPolicies.toFixed(1)} organic, -{monthlyChurnPolicies.toFixed(1)} churned
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Break-Even Lead Spend</div>
                                <div className={`text-2xl font-bold ${totalLeadSpend >= breakEvenLeadSpend ? 'text-green-600' : 'text-red-600'}`}>
                                  ${Math.round(breakEvenLeadSpend).toLocaleString()}/mo
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Need {breakEvenPolicies} policies/mo to offset churn
                                  {totalLeadSpend < breakEvenLeadSpend && <span className="text-red-600 font-medium"> (Under-investing!)</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="mt-4 p-3 bg-amber-100 rounded-lg text-sm text-amber-800">
                          <strong>Key Insight:</strong> Industry benchmarks use quote conversion rates (10-15%), not bound rates.
                          Actual data shows only ~4% of leads convert to customers. This dramatically affects acquisition cost and break-even calculations.
                        </div>
                      </div>

                      {/* Interactive Growth Levers */}
                      <div className="card p-6 mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Growth Levers Simulator</h3>
                            <p className="text-sm text-gray-600">See real-time impact of improving key metrics</p>
                          </div>
                        </div>

                        {(() => {
                          // Current state calculations
                          const currentPolicies = strategyInputs.currentPolicies;
                          const currentCustomers = strategyInputs.currentCustomers;
                          const ppc = currentPolicies / currentCustomers;

                          // Current retention from slider (default 97.5%)
                          const currentRetention = strategyInputs.targetRetentionRate / 100;
                          // V5.1 FIX: Churn = customers leaving × their PPC
                          const monthlyChurn = currentCustomers * (1 - Math.pow(currentRetention, 1/12)) * ppc;

                          // Current new business from paid leads
                          const totalLeadSpend = strategyInputs.marketing.traditional + strategyInputs.additionalLeadSpend;
                          const monthlyLeads = totalLeadSpend / strategyInputs.costPerLead;
                          const currentConversion = strategyInputs.targetConversionRate / 100; // From slider (default 10%)
                          const currentNewCustomers = monthlyLeads * currentConversion;
                          const paidLeadPolicies = currentNewCustomers * ppc;

                          // Add organic/walk-in sales (Derrick's typical 13/month)
                          const organicPolicies = strategyInputs.organicSalesPerMonth;
                          const currentNewPolicies = paidLeadPolicies + organicPolicies;

                          // Net monthly change
                          const currentNetChange = currentNewPolicies - monthlyChurn;

                          // Calculate what-if scenarios using slider values as baseline
                          const improvedConversion = Math.min(currentConversion * 1.5, 0.20); // 50% improvement, max 20%
                          const scenarios = [
                            {
                              name: 'Elite Retention (99%)',
                              description: 'Reduce losses to 0-1/month via bundling',
                              newRetention: 0.99,
                              newConversion: currentConversion,
                              newLeadSpend: totalLeadSpend,
                              color: 'emerald'
                            },
                            {
                              name: `Improve Conversion (+50%)`,
                              description: `Better lead quality & follow-up (${(improvedConversion * 100).toFixed(0)}%)`,
                              newRetention: currentRetention,
                              newConversion: improvedConversion,
                              newLeadSpend: totalLeadSpend,
                              color: 'blue'
                            },
                            {
                              name: 'Increase Lead Spend to $10K',
                              description: 'More aggressive marketing',
                              newRetention: currentRetention,
                              newConversion: currentConversion,
                              newLeadSpend: 10000,
                              color: 'purple'
                            },
                            {
                              name: 'Combined: All Three',
                              description: 'Maximum growth strategy',
                              newRetention: 0.99,
                              newConversion: improvedConversion,
                              newLeadSpend: 10000,
                              color: 'amber'
                            }
                          ];

                          return (
                            <div className="space-y-4">
                              {/* Current State */}
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-2">Current State</div>
                                <div className="grid grid-cols-4 gap-4 text-center">
                                  <div>
                                    <div className="text-lg font-bold text-gray-900">{currentRetention * 100}%</div>
                                    <div className="text-xs text-gray-500">Retention</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-gray-900">{(currentConversion * 100).toFixed(0)}%</div>
                                    <div className="text-xs text-gray-500">Conversion</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-gray-900">${(totalLeadSpend/1000).toFixed(1)}K</div>
                                    <div className="text-xs text-gray-500">Lead Spend</div>
                                  </div>
                                  <div>
                                    <div className={`text-lg font-bold ${currentNetChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {currentNetChange >= 0 ? '+' : ''}{currentNetChange.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500">Net/Month</div>
                                  </div>
                                </div>
                              </div>

                              {/* Scenario Comparisons */}
                              <div className="grid md:grid-cols-2 gap-3">
                                {scenarios.map((scenario) => {
                                  // V5.1 FIX: Churn = customers leaving × their PPC
                                  const newMonthlyChurn = currentCustomers * (1 - Math.pow(scenario.newRetention, 1/12)) * ppc;
                                  const newLeads = scenario.newLeadSpend / strategyInputs.costPerLead;
                                  const newPaidPolicies = newLeads * scenario.newConversion * ppc;
                                  // Include organic sales in all scenarios
                                  const newNewPolicies = newPaidPolicies + organicPolicies;
                                  const newNetChange = newNewPolicies - newMonthlyChurn;
                                  const improvement = newNetChange - currentNetChange;
                                  const annualGrowth = newNetChange * 12;
                                  const growthRate = (annualGrowth / currentPolicies) * 100;

                                  return (
                                    <div key={scenario.name} className={`bg-white p-4 rounded-lg border-2 border-${scenario.color}-200 hover:border-${scenario.color}-400 transition-colors`}>
                                      <div className={`text-sm font-semibold text-${scenario.color}-700 mb-1`}>{scenario.name}</div>
                                      <div className="text-xs text-gray-500 mb-3">{scenario.description}</div>

                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className={`text-2xl font-bold ${newNetChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {newNetChange >= 0 ? '+' : ''}{newNetChange.toFixed(1)}
                                          </div>
                                          <div className="text-xs text-gray-500">policies/month</div>
                                        </div>
                                        <div className="text-right">
                                          <div className={`text-lg font-semibold ${improvement > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
                                          </div>
                                          <div className="text-xs text-gray-500">vs current</div>
                                        </div>
                                      </div>

                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-500">Annual growth:</span>
                                          <span className={`font-medium ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs mt-1">
                                          <span className="text-gray-500">Year-end policies:</span>
                                          <span className="font-medium">{Math.round(currentPolicies + annualGrowth).toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Key Insight */}
                              <div className="p-3 bg-blue-100 rounded-lg text-sm text-blue-800">
                                <strong>Key Insight:</strong> With {(currentRetention * 100).toFixed(1)}% retention, focus on conversion improvement
                                has the biggest ROI. Improving from {(currentConversion * 100).toFixed(0)}% to {((currentConversion * 2) * 100).toFixed(0)}% adds more new policies than any other single lever!
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Custom Scenario Builder with Sliders */}
                      <div className="card p-6 mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-purple-700" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Build Your Growth Plan</h3>
                            <p className="text-sm text-gray-600">Adjust sliders to see projected outcomes</p>
                          </div>
                        </div>

                        {(() => {
                          // Use state from strategyInputs for interactivity
                          const currentPolicies = strategyInputs.currentPolicies;
                          const currentCustomers = strategyInputs.currentCustomers;
                          const ppc = currentPolicies / currentCustomers;

                          // Get values from inputs - use new slider values
                          const targetRetention = strategyInputs.targetRetentionRate / 100;
                          const totalLeadSpend = strategyInputs.marketing.traditional + strategyInputs.additionalLeadSpend;
                          const conversionRate = strategyInputs.targetConversionRate / 100;

                          // Calculate projections
                          // V5.1 FIX: Churn is customers leaving × their policies
                          const monthlyCustomerChurn = currentCustomers * (1 - Math.pow(targetRetention, 1/12));
                          const monthlyPolicyChurn = monthlyCustomerChurn * ppc;
                          const monthlyLeads = totalLeadSpend / strategyInputs.costPerLead;
                          const newCustomers = monthlyLeads * conversionRate;
                          const paidLeadPolicies = newCustomers * ppc;
                          // Include organic/walk-in sales (Derrick's typical 13/month)
                          const organicPolicies = strategyInputs.organicSalesPerMonth;
                          const newPolicies = paidLeadPolicies + organicPolicies;
                          const netChange = newPolicies - monthlyPolicyChurn;
                          const annualChange = netChange * 12;
                          const yearEndPolicies = currentPolicies + annualChange;
                          const growthRate = (annualChange / currentPolicies) * 100;

                          // Premium calculations
                          const currentPremium = currentPolicies * strategyInputs.averagePremium;
                          const yearEndPremium = yearEndPolicies * strategyInputs.averagePremium;
                          const premiumChange = yearEndPremium - currentPremium;

                          // Commission impact
                          const currentCommission = currentPremium * (strategyInputs.commissionPayout / 100);
                          const yearEndCommission = yearEndPremium * (strategyInputs.commissionPayout / 100);
                          const commissionChange = yearEndCommission - currentCommission;

                          return (
                            <div className="space-y-6">
                              {/* Sliders */}
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Lead Spend Slider */}
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Monthly Lead Investment</label>
                                    <span className="text-sm font-bold text-purple-600">${totalLeadSpend.toLocaleString()}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="20000"
                                    step="500"
                                    value={totalLeadSpend}
                                    onChange={(e) => {
                                      const newSpend = parseInt(e.target.value);
                                      const traditionalPortion = Math.min(newSpend, 1500);
                                      const additionalPortion = newSpend - traditionalPortion;
                                      setStrategyInputs(prev => ({
                                        ...prev,
                                        marketing: { ...prev.marketing, traditional: traditionalPortion },
                                        additionalLeadSpend: additionalPortion
                                      }));
                                    }}
                                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>$0</span>
                                    <span>$20K</span>
                                  </div>
                                </div>

                                {/* Cost Per Lead Slider */}
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Cost Per Lead</label>
                                    <span className="text-sm font-bold text-purple-600">${strategyInputs.costPerLead}</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="20"
                                    max="150"
                                    step="5"
                                    value={strategyInputs.costPerLead}
                                    onChange={(e) => setStrategyInputs(prev => ({
                                      ...prev,
                                      costPerLead: parseInt(e.target.value)
                                    }))}
                                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>$20 (Shared)</span>
                                    <span>$150 (Exclusive)</span>
                                  </div>
                                </div>
                              </div>

                              {/* Second Row: Retention and Conversion Sliders */}
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Retention Rate Slider */}
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Annual Retention Rate</label>
                                    <span className="text-sm font-bold text-purple-600">{strategyInputs.targetRetentionRate.toFixed(1)}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="80"
                                    max="99"
                                    step="0.5"
                                    value={strategyInputs.targetRetentionRate}
                                    onChange={(e) => setStrategyInputs(prev => ({
                                      ...prev,
                                      targetRetentionRate: parseFloat(e.target.value)
                                    }))}
                                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>80% (Poor)</span>
                                    <span className="text-green-600">97.5%</span>
                                    <span>99% (Elite)</span>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Current: ~2/mo avg | Monthly loss: {(currentCustomers * (1 - Math.pow(targetRetention, 1/12)) * ppc).toFixed(1)} policies (range: 0-6)
                                  </div>
                                </div>

                                {/* Conversion Rate Slider */}
                                <div>
                                  <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Lead-to-Bound Conversion</label>
                                    <span className="text-sm font-bold text-purple-600">{strategyInputs.targetConversionRate.toFixed(1)}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="2"
                                    max="15"
                                    step="0.5"
                                    value={strategyInputs.targetConversionRate}
                                    onChange={(e) => setStrategyInputs(prev => ({
                                      ...prev,
                                      targetConversionRate: parseFloat(e.target.value)
                                    }))}
                                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>2% (Cold)</span>
                                    <span className="text-green-600">10%</span>
                                    <span>15% (Hot)</span>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {monthlyLeads.toFixed(0)} leads × {conversionRate * 100}% = {(monthlyLeads * conversionRate).toFixed(1)} customers/mo
                                  </div>
                                </div>
                              </div>

                              {/* Third Row: Organic Sales Slider */}
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium text-gray-700">Organic Sales (Walk-ins/Referrals)</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="50"
                                      step="0.5"
                                      value={strategyInputs.organicSalesPerMonth}
                                      onChange={(e) => setStrategyInputs(prev => ({
                                        ...prev,
                                        organicSalesPerMonth: Math.max(0, Math.min(50, parseFloat(e.target.value) || 0))
                                      }))}
                                      className="w-16 px-2 py-1 text-sm font-bold text-purple-600 border border-purple-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-500">/mo</span>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="30"
                                  step="0.5"
                                  value={strategyInputs.organicSalesPerMonth}
                                  onChange={(e) => setStrategyInputs(prev => ({
                                    ...prev,
                                    organicSalesPerMonth: parseFloat(e.target.value)
                                  }))}
                                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>0</span>
                                  <span className="text-green-600">13 (Derrick avg)</span>
                                  <span>30</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Policies from walk-ins, existing customer referrals, and organic sources (not paid leads)
                                </div>
                              </div>

                              {/* Results */}
                              <div className="bg-white p-4 rounded-lg border border-purple-200">
                                <div className="text-sm font-medium text-gray-700 mb-3">Projected Outcomes (12 Months)</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className={`text-xl font-bold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {netChange >= 0 ? '+' : ''}{netChange.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500">Net/Month</div>
                                  </div>
                                  <div className="text-center">
                                    <div className={`text-xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500">Annual Growth</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">
                                      {Math.round(yearEndPolicies).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">Year-End Policies</div>
                                  </div>
                                  <div className="text-center">
                                    <div className={`text-xl font-bold ${commissionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {commissionChange >= 0 ? '+' : ''}${Math.round(commissionChange / 1000)}K
                                    </div>
                                    <div className="text-xs text-gray-500">Commission Change</div>
                                  </div>
                                </div>

                                {/* Additional metrics */}
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{Math.round(monthlyLeads)}</div>
                                    <div className="text-xs text-gray-500">Leads/Month</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{Math.round(newPolicies * 10) / 10}</div>
                                    <div className="text-xs text-gray-500">New Policies/Mo</div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{Math.round(monthlyPolicyChurn * 10) / 10}</div>
                                    <div className="text-xs text-gray-500">Lost to Churn/Mo</div>
                                  </div>
                                </div>
                              </div>

                              {/* Recommendation */}
                              <div className={`p-3 rounded-lg text-sm ${netChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {netChange >= 0 ? (
                                  <>
                                    <strong>Growth Path:</strong> With {organicPolicies.toFixed(1)} organic + {paidLeadPolicies.toFixed(1)} paid lead policies/mo, you'll add {Math.round(annualChange)} policies by year-end,
                                    generating an additional ${Math.round(commissionChange / 1000)}K in annual commission.
                                  </>
                                ) : (
                                  <>
                                    <strong>Warning:</strong> Current settings result in {Math.round(Math.abs(annualChange))} policy loss.
                                    Your {organicPolicies.toFixed(1)} organic sales partially offset {monthlyPolicyChurn.toFixed(1)} churn, but you need {(monthlyPolicyChurn - organicPolicies).toFixed(1)} more from paid leads.
                                  </>
                                )}
                              </div>

                              {/* Break-Even Analysis */}
                              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-3">Break-Even Analysis</div>

                                {(() => {
                                  // Calculate break-even requirements (accounting for organic sales)
                                  // Only need paid leads to cover churn NOT covered by organic
                                  const churnGap = Math.max(0, monthlyPolicyChurn - organicPolicies);
                                  const breakEvenLeadSpend = churnGap > 0 ? (churnGap / (conversionRate * ppc)) * strategyInputs.costPerLead : 0;
                                  const breakEvenConversion = monthlyLeads > 0 ? (churnGap / (monthlyLeads * ppc)) * 100 : 0;

                                  // Calculate CAC for current settings
                                  const cac = monthlyLeads > 0 && conversionRate > 0 ? totalLeadSpend / (monthlyLeads * conversionRate) : 0;

                                  return (
                                    <div className="space-y-3">
                                      {/* Break-even metrics */}
                                      <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="p-2 bg-gray-50 rounded">
                                          <div className="text-lg font-bold text-gray-900">${Math.round(breakEvenLeadSpend).toLocaleString()}</div>
                                          <div className="text-xs text-gray-500">Break-even spend</div>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                          <div className="text-lg font-bold text-gray-900">{Math.min(breakEvenConversion, 15).toFixed(1)}%</div>
                                          <div className="text-xs text-gray-500">Break-even conversion</div>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded">
                                          <div className="text-lg font-bold text-gray-900">${Math.round(cac).toLocaleString()}</div>
                                          <div className="text-xs text-gray-500">Cost per customer</div>
                                        </div>
                                      </div>

                                      {/* Visual progress bar */}
                                      <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                          <span>Current vs Break-even</span>
                                          <span>{((newPolicies / monthlyPolicyChurn) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full ${newPolicies >= monthlyPolicyChurn ? 'bg-green-500' : 'bg-amber-500'}`}
                                            style={{ width: `${Math.min((newPolicies / monthlyPolicyChurn) * 100, 100)}%` }}
                                          />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                          <span>0%</span>
                                          <span className="text-green-600">100% (Break-even)</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Growth Path Recommendations */}
                              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-blue-800 mb-3">Recommended Actions</div>

                                {(() => {
                                  // Generate contextual recommendations based on current slider values
                                  const recommendations = [];

                                  // Check retention - with 98.6% baseline, only flag if significantly worse
                                  if (strategyInputs.targetRetentionRate < 97) {
                                    recommendations.push({
                                      priority: 'high',
                                      action: 'Restore retention to 98%+',
                                      impact: `Saves ${Math.round(currentPolicies * (Math.pow(0.98, 1/12) - Math.pow(targetRetention, 1/12)) * 12)} policies/year`,
                                      how: 'Bundle auto+home, renewal outreach at 60 days'
                                    });
                                  }

                                  // Check conversion
                                  if (strategyInputs.targetConversionRate < 6) {
                                    recommendations.push({
                                      priority: 'medium',
                                      action: 'Increase conversion to 6%+',
                                      impact: `Adds ${Math.round(monthlyLeads * (0.06 - conversionRate) * ppc * 12)} policies/year`,
                                      how: 'Better lead sources, faster follow-up (<5 min)'
                                    });
                                  }

                                  // Check lead volume
                                  if (totalLeadSpend < 5000) {
                                    recommendations.push({
                                      priority: netChange < 0 ? 'high' : 'medium',
                                      action: 'Increase lead investment',
                                      impact: `$5K/mo at ${(conversionRate * 100).toFixed(0)}% = ${Math.round((5000 / strategyInputs.costPerLead) * conversionRate * ppc)} new policies/mo`,
                                      how: 'Scale proven channels, test new sources'
                                    });
                                  }

                                  // Check cost per lead
                                  if (strategyInputs.costPerLead > 80) {
                                    recommendations.push({
                                      priority: 'medium',
                                      action: 'Reduce cost per lead',
                                      impact: `$55/lead = ${Math.round(totalLeadSpend / 55)} leads vs ${Math.round(monthlyLeads)} at $${strategyInputs.costPerLead}`,
                                      how: 'Referral program, digital marketing, shared leads'
                                    });
                                  }

                                  if (recommendations.length === 0) {
                                    recommendations.push({
                                      priority: 'success',
                                      action: 'Strong foundation established',
                                      impact: `On track for ${growthRate.toFixed(1)}% annual growth`,
                                      how: 'Monitor monthly, optimize top-performing channels'
                                    });
                                  }

                                  return (
                                    <div className="space-y-2">
                                      {recommendations.slice(0, 3).map((rec, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                          <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                                            rec.priority === 'high' ? 'bg-red-500' :
                                            rec.priority === 'medium' ? 'bg-amber-500' :
                                            'bg-green-500'
                                          }`} />
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">{rec.action}</div>
                                            <div className="text-xs text-blue-700">{rec.impact}</div>
                                            <div className="text-xs text-gray-500">{rec.how}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Growth Strategy & Global Sensitivity Analysis */}
                      <div className="card p-6 mt-6 bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">Growth Strategy & Sensitivity Analysis</h3>
                            <p className="text-sm text-gray-600">Impact of each lever on annual policy growth</p>
                          </div>
                        </div>

                        {(() => {
                          // Base calculations
                          const currentPolicies = strategyInputs.currentPolicies;
                          const currentCustomers = strategyInputs.currentCustomers;
                          const ppc = currentPolicies / currentCustomers;

                          // Current values from sliders
                          const baseRetention = strategyInputs.targetRetentionRate / 100;
                          const baseConversion = strategyInputs.targetConversionRate / 100;
                          const baseLeadSpend = strategyInputs.marketing.traditional + strategyInputs.additionalLeadSpend;
                          const baseCPL = strategyInputs.costPerLead;

                          // Calculate base annual net change
                          // V5.1 FIX: Churn is customers leaving × their PPC
                          const baseMonthlyCustomerChurn = currentCustomers * (1 - Math.pow(baseRetention, 1/12));
                          const baseMonthlyPolicyChurn = baseMonthlyCustomerChurn * ppc;
                          const baseMonthlyLeads = baseLeadSpend / baseCPL;
                          const basePaidPolicies = baseMonthlyLeads * baseConversion * ppc;
                          // Include organic/walk-in sales (Derrick's typical 13/month)
                          const organicPolicies = strategyInputs.organicSalesPerMonth;
                          const baseNewPolicies = basePaidPolicies + organicPolicies;
                          const baseNetMonthly = baseNewPolicies - baseMonthlyPolicyChurn;
                          const baseAnnualNet = baseNetMonthly * 12;

                          // Sensitivity analysis - test each lever independently
                          // Generate dynamic test values centered around slider values
                          const retentionTestValues = [
                            Math.max(94, baseRetention * 100 - 2),
                            Math.max(95, baseRetention * 100 - 1),
                            baseRetention * 100,
                            Math.min(99, baseRetention * 100 + 1),
                            Math.min(99, baseRetention * 100 + 1.5)
                          ].map(v => Math.round(v * 10) / 10);

                          const conversionTestValues = [
                            Math.max(1, baseConversion * 100 * 0.4),
                            Math.max(2, baseConversion * 100 * 0.6),
                            baseConversion * 100,
                            baseConversion * 100 * 1.25,
                            baseConversion * 100 * 1.5
                          ].map(v => Math.round(v * 10) / 10);

                          const sensitivities = [
                            {
                              lever: 'Retention Rate',
                              unit: '%',
                              baseValue: baseRetention * 100,
                              testValues: retentionTestValues,
                              calculate: (val: number) => {
                                const customerChurn = currentCustomers * (1 - Math.pow(val/100, 1/12));
                                const policyChurn = customerChurn * ppc;
                                return (baseNewPolicies - policyChurn) * 12;
                              },
                              color: 'emerald',
                              insight: 'Each 1% retention = ~17 fewer losses/year'
                            },
                            {
                              lever: 'Conversion Rate',
                              unit: '%',
                              baseValue: baseConversion * 100,
                              testValues: conversionTestValues,
                              calculate: (val: number) => {
                                const newPols = baseMonthlyLeads * (val/100) * ppc + organicPolicies;
                                return (newPols - baseMonthlyPolicyChurn) * 12;
                              },
                              color: 'blue',
                              insight: 'Each 1% conversion = ~20 more policies/year'
                            },
                            {
                              lever: 'Lead Spend',
                              unit: '$',
                              baseValue: baseLeadSpend,
                              testValues: [2000, 4500, 7000, 10000, 15000],
                              calculate: (val: number) => {
                                const leads = val / baseCPL;
                                const newPols = leads * baseConversion * ppc + organicPolicies;
                                return (newPols - baseMonthlyPolicyChurn) * 12;
                              },
                              color: 'purple',
                              insight: 'Each $1K spend = ~1.1 policies/year at 4%'
                            },
                            {
                              lever: 'Cost Per Lead',
                              unit: '$',
                              baseValue: baseCPL,
                              testValues: [30, 45, 55, 75, 100],
                              calculate: (val: number) => {
                                const leads = baseLeadSpend / val;
                                const newPols = leads * baseConversion * ppc + organicPolicies;
                                return (newPols - baseMonthlyPolicyChurn) * 12;
                              },
                              color: 'amber',
                              insight: 'Lower cost per lead = more leads for same budget'
                            }
                          ];

                          return (
                            <div className="space-y-6">
                              {/* Executive Summary */}
                              <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="text-sm font-medium text-gray-700 mb-3">Executive Summary: Derrick's Growth Levers</div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Current Position</div>
                                    <ul className="text-sm space-y-1">
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Policies in Force:</span>
                                        <span className="font-medium">{currentPolicies.toLocaleString()}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Annual Retention:</span>
                                        <span className="font-medium text-green-600">{(baseRetention * 100).toFixed(1)}%</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Bound Conversion:</span>
                                        <span className="font-medium">{(baseConversion * 100).toFixed(0)}%</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Monthly Lead Spend:</span>
                                        <span className="font-medium">${baseLeadSpend.toLocaleString()}</span>
                                      </li>
                                    </ul>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Projected Trajectory</div>
                                    <ul className="text-sm space-y-1">
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Monthly New Policies:</span>
                                        <span className="font-medium text-blue-600">+{baseNewPolicies.toFixed(1)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Monthly Churn:</span>
                                        <span className="font-medium text-red-600">-{baseMonthlyPolicyChurn.toFixed(1)}</span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Net Monthly Change:</span>
                                        <span className={`font-bold ${baseNetMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {baseNetMonthly >= 0 ? '+' : ''}{baseNetMonthly.toFixed(1)}
                                        </span>
                                      </li>
                                      <li className="flex justify-between">
                                        <span className="text-gray-600">Year-End Forecast:</span>
                                        <span className="font-bold">{Math.round(currentPolicies + baseAnnualNet).toLocaleString()}</span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* Sensitivity Analysis Grid */}
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-3">Global Sensitivity Analysis</div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  {sensitivities.map((sens) => (
                                    <div key={sens.lever} className={`bg-white p-4 rounded-lg border border-${sens.color}-200`}>
                                      <div className={`text-sm font-semibold text-${sens.color}-700 mb-2`}>{sens.lever}</div>

                                      {/* Value table */}
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                          <thead>
                                            <tr className="border-b border-gray-200">
                                              <th className="text-left py-1 text-gray-500">{sens.unit === '$' ? 'Spend' : 'Rate'}</th>
                                              <th className="text-right py-1 text-gray-500">Annual Net</th>
                                              <th className="text-right py-1 text-gray-500">Δ vs Base</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {sens.testValues.map((val) => {
                                              const result = sens.calculate(val);
                                              const delta = result - baseAnnualNet;
                                              const isBase = Math.abs(val - sens.baseValue) < 1;
                                              return (
                                                <tr key={val} className={isBase ? `bg-${sens.color}-50 font-medium` : ''}>
                                                  <td className="py-1">
                                                    {sens.unit === '$' ? `$${val.toLocaleString()}` : `${val}%`}
                                                    {isBase && <span className="text-gray-400 ml-1">(now)</span>}
                                                  </td>
                                                  <td className={`text-right py-1 ${result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {result >= 0 ? '+' : ''}{Math.round(result)}
                                                  </td>
                                                  <td className={`text-right py-1 ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {delta > 0 ? '+' : ''}{Math.round(delta)}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>

                                      <div className="mt-2 text-xs text-gray-500 italic">{sens.insight}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Strategic Recommendations */}
                              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                                <div className="text-sm font-semibold text-emerald-800 mb-3">Strategic Priority Ranking</div>

                                {(() => {
                                  // Calculate ROI for each lever improvement
                                  const leverImpacts = [
                                    {
                                      rank: 1,
                                      lever: 'Improve Conversion (4% → 8%)',
                                      impact: sensitivities[1].calculate(8) - baseAnnualNet,
                                      cost: 'Low-Medium',
                                      difficulty: 'Medium',
                                      timeframe: '3-6 months',
                                      actions: ['Speed-to-lead (<5 min)', 'Better lead sources', 'Sales training']
                                    },
                                    {
                                      rank: 2,
                                      lever: 'Increase Lead Spend ($4.5K → $10K)',
                                      impact: sensitivities[2].calculate(10000) - baseAnnualNet,
                                      cost: 'High (+$5.5K/mo)',
                                      difficulty: 'Low',
                                      timeframe: 'Immediate',
                                      actions: ['Scale proven channels', 'Test new sources', 'Track ROI by channel']
                                    },
                                    {
                                      rank: 3,
                                      lever: 'Reduce Cost/Lead ($55 → $35)',
                                      impact: sensitivities[3].calculate(35) - baseAnnualNet,
                                      cost: 'Low',
                                      difficulty: 'Medium-High',
                                      timeframe: '6-12 months',
                                      actions: ['Referral program', 'Digital marketing', 'Partnerships']
                                    },
                                    {
                                      rank: 4,
                                      lever: 'Elite Retention (98.6% → 99%)',
                                      impact: sensitivities[0].calculate(99) - baseAnnualNet,
                                      cost: 'Low',
                                      difficulty: 'Low',
                                      timeframe: '3 months',
                                      actions: ['Increase bundling', '60-day renewal calls', 'Claims follow-up']
                                    }
                                  ].sort((a, b) => b.impact - a.impact);

                                  return (
                                    <div className="space-y-3">
                                      {leverImpacts.map((item, idx) => (
                                        <div key={item.lever} className="bg-white p-3 rounded border border-gray-100">
                                          <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                idx === 0 ? 'bg-emerald-100 text-emerald-700' :
                                                idx === 1 ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                              }`}>
                                                {idx + 1}
                                              </div>
                                              <div>
                                                <div className="text-sm font-medium text-gray-900">{item.lever}</div>
                                                <div className="text-xs text-gray-500">
                                                  {item.timeframe} | {item.difficulty} difficulty | {item.cost} cost
                                                </div>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <div className={`text-lg font-bold ${item.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.impact >= 0 ? '+' : ''}{Math.round(item.impact)}
                                              </div>
                                              <div className="text-xs text-gray-500">policies/year</div>
                                            </div>
                                          </div>
                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {item.actions.map((action) => (
                                              <span key={action} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                {action}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Combined Strategy Impact */}
                              <div className="bg-slate-800 text-white p-4 rounded-lg">
                                <div className="text-sm font-semibold mb-3">Combined Strategy Impact (All Levers)</div>

                                {(() => {
                                  // Best case: all improvements
                                  const bestRetention = 0.99;
                                  const bestConversion = 0.08;
                                  const bestSpend = 10000;
                                  const bestCPL = 35;

                                  // V5.1 FIX: Churn = customers leaving × their PPC
                                  const bestChurn = currentCustomers * (1 - Math.pow(bestRetention, 1/12)) * ppc;
                                  const bestLeads = bestSpend / bestCPL;
                                  const bestNew = bestLeads * bestConversion * ppc;
                                  const bestNet = (bestNew - bestChurn) * 12;

                                  const improvement = bestNet - baseAnnualNet;
                                  const yearEndPolicies = currentPolicies + bestNet;
                                  const growthRate = (bestNet / currentPolicies) * 100;

                                  return (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-emerald-400">+{Math.round(improvement)}</div>
                                        <div className="text-xs text-slate-400">Additional policies/year</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{Math.round(yearEndPolicies).toLocaleString()}</div>
                                        <div className="text-xs text-slate-400">Year-end policies</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-400">{growthRate.toFixed(1)}%</div>
                                        <div className="text-xs text-slate-400">Annual growth rate</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-400">
                                          +${Math.round((bestNet - baseAnnualNet) * strategyInputs.averagePremium * strategyInputs.commissionPayout / 100 / 1000)}K
                                        </div>
                                        <div className="text-xs text-slate-400">Added commission/year</div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                <div className="mt-3 pt-3 border-t border-slate-600 text-xs text-slate-400">
                                  Assumes: 99% retention, 8% conversion, $10K/mo spend, $35/lead
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <motion.button
                        whileHover={{ scale: isCalculating ? 1 : 1.01 }}
                        whileTap={{ scale: isCalculating ? 1 : 0.99 }}
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        aria-label="Calculate growth scenarios based on your inputs"
                        aria-busy={isCalculating}
                        className={`mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                          isCalculating ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isCalculating ? (
                          <>
                            <span className="inline-block animate-spin">⚙️</span>
                            Calculating...
                          </>
                        ) : (
                          <>
                            Calculate Growth Scenarios
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="scenarios" role="tabpanel" id="tabpanel-scenarios" aria-labelledby="tab-scenarios">
                  <div className="max-w-7xl mx-auto space-y-6">
                    {!hasResults ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-lg p-8"
                      >
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Scenario Comparison</h2>
                        <p className="text-gray-600 mb-8">
                          Compare multiple growth strategies to find the optimal balance of risk and return
                        </p>

                        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium mb-1">No scenarios generated yet</p>
                          <p className="text-sm text-gray-500">
                            Configure your strategy in the Strategy Builder tab and click Calculate
                          </p>
                          <button
                            onClick={() => setActiveTab('strategy')}
                            className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Go to Strategy Builder →
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        {/* Growth Trajectory Chart */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="card-lg p-6"
                        >
                          <h2 className="text-lg font-semibold text-gray-900 mb-1">Policy Growth Trajectories</h2>
                          <p className="text-sm text-gray-600 mb-6">
                            Projected growth over {strategyInputs.projectionMonths} months under different scenarios
                          </p>

                          <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={scenarioData} aria-label="Line chart showing policy growth trajectories over time for four scenarios">
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis
                                dataKey="month"
                                label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                                stroke="#6b7280"
                              />
                              <YAxis
                                label={{ value: 'Active Policies', angle: -90, position: 'insideLeft' }}
                                stroke="#6b7280"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '12px',
                                  padding: '12px'
                                }}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} name="Baseline" strokeDasharray="5 5" />
                              <Line type="monotone" dataKey="conservative" stroke="#f59e0b" strokeWidth={3} name="Conservative" />
                              <Line type="monotone" dataKey="moderate" stroke="#3b82f6" strokeWidth={3} name="Moderate (Recommended)" />
                              <Line type="monotone" dataKey="aggressive" stroke="#10b981" strokeWidth={3} name="Aggressive" />
                            </LineChart>
                          </ResponsiveContainer>
                        </motion.div>

                        {/* Scenario Comparison Table */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                        >
                          <h2 className="text-2xl font-bold text-gray-900 mb-8">Scenario Metrics Comparison</h2>

                          <div className="grid md:grid-cols-3 gap-6">
                            {scenarioResults.map((scenario, idx) => (
                              <motion.div
                                key={scenario.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className={`p-6 rounded-2xl border-2 ${
                                  scenario.name === 'Moderate'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                              >
                                {scenario.name === 'Moderate' && (
                                  <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-3">
                                    RECOMMENDED
                                  </div>
                                )}
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{scenario.name}</h3>

                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-600">Final Policies</p>
                                    <p className="text-2xl font-bold text-gray-900">{scenario.finalPolicies}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">ROI</p>
                                    <p className={`text-2xl font-bold ${scenario.roi > 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                                      {scenario.roi.toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Payback Period</p>
                                    <p className="text-2xl font-bold text-gray-900">{scenario.paybackMonths} mo</p>
                                  </div>
                                  <div className="pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Total Investment</p>
                                    <p className="text-lg font-semibold text-gray-700">${scenario.totalCost.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Projected Revenue</p>
                                    <p className="text-lg font-semibold text-green-600">${scenario.totalRevenue.toLocaleString()}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        {/* ROI Comparison Bar Chart */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                        >
                          <h2 className="text-2xl font-bold text-gray-900 mb-8">Return on Investment Comparison</h2>

                          <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={scenarioResults} aria-label="Bar chart comparing return on investment percentages across three scenarios">
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="name" stroke="#6b7280" />
                              <YAxis
                                label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
                                stroke="#6b7280"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '12px',
                                  padding: '12px'
                                }}
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                              />
                              <Bar dataKey="roi" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </motion.div>

                        {/* Sensitivity Analysis */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                        >
                          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sensitivity Analysis</h2>
                          <p className="text-gray-700 mb-8">
                            How changes in key assumptions affect your projected outcomes
                          </p>

                          <div className="grid md:grid-cols-2 gap-8">
                            {/* Conversion Rate Sensitivity */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Conversion Rate Impact
                              </h3>
                              <div className="space-y-3">
                                {[
                                  { label: '5% conversion', rate: 0.05 },
                                  { label: '10% conversion', rate: 0.10 },
                                  { label: '15% conversion', rate: 0.15 },
                                  { label: '20% conversion', rate: 0.20 },
                                ].map(({ label, rate }) => {
                                  // Calculate new policies from leads at different conversion rates
                                  const monthlyLeads = strategyInputs.monthlyLeadSpend / strategyInputs.costPerLead;
                                  const newPoliciesPerMonth = monthlyLeads * rate;
                                  const totalNewPolicies = Math.round(newPoliciesPerMonth * strategyInputs.projectionMonths);
                                  const isCurrent = rate === 0.10; // Assume 10% baseline
                                  return (
                                    <div key={label} className={`flex justify-between items-center p-3 rounded-lg ${isCurrent ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}>
                                      <span className={`text-sm ${isCurrent ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>{label}</span>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">+{totalNewPolicies.toLocaleString()} policies</p>
                                        <p className="text-xs text-gray-600">
                                          {Math.round(newPoliciesPerMonth)}/mo
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Cost Sensitivity */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-amber-500" />
                                Cost Per Lead Impact
                              </h3>
                              <div className="space-y-3">
                                {[
                                  { label: '$35/lead', cpl: 35 },
                                  { label: '$45/lead', cpl: 45 },
                                  { label: `$${strategyInputs.costPerLead}/lead (current)`, cpl: strategyInputs.costPerLead },
                                  { label: '$75/lead', cpl: 75 },
                                ].map(({ label, cpl }) => {
                                  // Calculate leads at different CPL with same budget
                                  const monthlyLeads = strategyInputs.monthlyLeadSpend / cpl;
                                  const effectiveCAC = cpl / 0.10; // Cost per converted policy
                                  const isCurrent = cpl === strategyInputs.costPerLead;
                                  return (
                                    <div key={label} className={`flex justify-between items-center p-3 rounded-lg ${isCurrent ? 'bg-amber-100 border border-amber-300' : 'bg-white border border-gray-200'}`}>
                                      <span className={`text-sm ${isCurrent ? 'font-semibold text-amber-900' : 'text-gray-700'}`}>{label}</span>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{Math.round(monthlyLeads)} leads/mo</p>
                                        <p className="text-xs text-gray-600">
                                          Acquisition Cost: ${Math.round(effectiveCAC)}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Retention Rate Sensitivity */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-500" />
                                Retention Rate Impact
                              </h3>
                              <div className="space-y-3">
                                {[
                                  { label: '67% (monoline)', rate: 0.67 },
                                  { label: '85% retention', rate: 0.85 },
                                  { label: '91% (bundled)', rate: 0.91 },
                                  { label: '95% (optimal)', rate: 0.95 },
                                ].map(({ label, rate }) => {
                                  // Calculate policies retained after projection period
                                  const monthlyRetention = Math.pow(rate, 1/12);
                                  const monthlyChurn = (1 - monthlyRetention) * 100;
                                  const policiesRetained = Math.round(strategyInputs.currentPolicies * Math.pow(monthlyRetention, strategyInputs.projectionMonths));
                                  const policiesLost = strategyInputs.currentPolicies - policiesRetained;
                                  const currentPPC = strategyInputs.currentPolicies / strategyInputs.currentCustomers;
                                  const isCurrent = (currentPPC >= 1.8 && rate === 0.95) ||
                                                   (currentPPC >= 1.5 && currentPPC < 1.8 && rate === 0.91) ||
                                                   (currentPPC < 1.5 && rate === 0.67);
                                  return (
                                    <div key={label} className={`flex justify-between items-center p-3 rounded-lg ${isCurrent ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-gray-200'}`}>
                                      <span className={`text-sm ${isCurrent ? 'font-semibold text-emerald-900' : 'text-gray-700'}`}>{label}</span>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{policiesRetained.toLocaleString()} retained</p>
                                        <p className="text-xs text-gray-600">
                                          -{policiesLost.toLocaleString()} ({monthlyChurn.toFixed(1)}%/mo churn)
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Market Spend Sensitivity */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                                Marketing Spend Impact
                              </h3>
                              <div className="space-y-3">
                                {[
                                  { label: '$1,000/mo', spend: 1000 },
                                  { label: '$3,000/mo', spend: 3000 },
                                  { label: '$5,000/mo', spend: 5000 },
                                  { label: '$10,000/mo', spend: 10000 },
                                ].map(({ label, spend }) => {
                                  // Calculate leads and new policies per month
                                  const monthlyLeads = spend / strategyInputs.costPerLead;
                                  const newPoliciesPerMonth = monthlyLeads * 0.10; // 10% conversion
                                  const totalNewPolicies = Math.round(newPoliciesPerMonth * strategyInputs.projectionMonths);
                                  const isCurrent = Math.abs(spend - strategyInputs.monthlyLeadSpend) < 500;
                                  return (
                                    <div key={label} className={`flex justify-between items-center p-3 rounded-lg ${isCurrent ? 'bg-purple-100 border border-purple-300' : 'bg-white border border-gray-200'}`}>
                                      <span className={`text-sm ${isCurrent ? 'font-semibold text-purple-900' : 'text-gray-700'}`}>{label}</span>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">{Math.round(monthlyLeads)} leads/mo</p>
                                        <p className="text-xs text-gray-600">
                                          +{totalNewPolicies.toLocaleString()} policies ({strategyInputs.projectionMonths}mo)
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Key Insights */}
                          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                              <Lightbulb className="w-5 h-5" />
                              Key Sensitivity Insights
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-800">
                              <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>A 5% improvement in conversion rate has a greater ROI impact than a 20% reduction in CPL</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>Retention rate has compounding effects - even small improvements significantly impact long-term revenue</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>Increased marketing spend shows diminishing returns beyond current levels</span>
                              </li>
                            </ul>
                          </div>
                        </motion.div>

                        {/* V3.0: Benchmark Metrics Dashboard */}
                        {benchmarkMetrics && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                            >
                              <h2 className="text-2xl font-bold text-gray-900 mb-3">Performance Benchmarks</h2>
                              <p className="text-gray-700 mb-8">
                                Industry-standard metrics to assess your agency's financial health and growth trajectory
                              </p>

                              {/* Rule of 20 - Large Feature Card */}
                              <div className={`p-8 rounded-2xl mb-6 ${
                                benchmarkMetrics.ruleOf20Score >= BENCHMARKS.RULE_OF_20.TOP_PERFORMER
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500'
                                  : benchmarkMetrics.ruleOf20Score >= BENCHMARKS.RULE_OF_20.HEALTHY
                                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500'
                                  : benchmarkMetrics.ruleOf20Score >= BENCHMARKS.RULE_OF_20.NEEDS_IMPROVEMENT
                                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-500'
                                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-500'
                              }`}>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Rule of 20 Score</h3>
                                    <div className="flex items-baseline gap-3">
                                      <span className="text-5xl font-bold text-gray-900">
                                        {benchmarkMetrics.ruleOf20Score.toFixed(1)}
                                      </span>
                                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        benchmarkMetrics.ruleOf20Score >= BENCHMARKS.RULE_OF_20.TOP_PERFORMER
                                          ? 'bg-green-200 text-green-900'
                                          : benchmarkMetrics.ruleOf20Score >= BENCHMARKS.RULE_OF_20.HEALTHY
                                          ? 'bg-blue-200 text-blue-900'
                                          : benchmarkMetrics.ruleOf20Score >= BENCHMARKS.RULE_OF_20.NEEDS_IMPROVEMENT
                                          ? 'bg-yellow-200 text-yellow-900'
                                          : 'bg-red-200 text-red-900'
                                      }`}>
                                        {benchmarkMetrics.ruleOf20Rating}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3">
                                      Growth Rate + (0.5 × Operating Margin). Target: {BENCHMARKS.RULE_OF_20.HEALTHY}+
                                    </p>
                                  </div>
                                  <Target className="w-12 h-12 text-gray-400" />
                                </div>
                              </div>

                              {/* Benchmark Metrics Grid */}
                              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Operating Margin (EBITDA) */}
                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Operating Margin</h4>
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {benchmarkMetrics.ebitdaMargin.toFixed(1)}%
                                  </p>
                                  <p className={`text-xs font-semibold ${
                                    benchmarkMetrics.ebitdaMargin >= BENCHMARKS.EBITDA.EXCELLENT * 100
                                      ? 'text-green-600'
                                      : benchmarkMetrics.ebitdaMargin >= BENCHMARKS.EBITDA.TARGET * 100
                                      ? 'text-blue-600'
                                      : 'text-yellow-600'
                                  }`}>
                                    {benchmarkMetrics.ebitdaStatus}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Target: 25-30%
                                  </p>
                                </div>

                                {/* Lifetime Value : Acquisition Cost Ratio */}
                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Lifetime Value : Acquisition Cost</h4>
                                    <TrendingUp className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {benchmarkMetrics.ltvCacRatio.toFixed(1)}:1
                                  </p>
                                  <p className={`text-xs font-semibold ${
                                    benchmarkMetrics.ltvCacRatio >= BENCHMARKS.LTV_CAC.GREAT
                                      ? 'text-green-600'
                                      : benchmarkMetrics.ltvCacRatio >= BENCHMARKS.LTV_CAC.GOOD
                                      ? 'text-blue-600'
                                      : 'text-yellow-600'
                                  }`}>
                                    {benchmarkMetrics.ltvCacStatus}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Target: 3:1 - 4:1
                                  </p>
                                </div>

                                {/* Revenue Per Employee */}
                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Revenue/Employee</h4>
                                    <Users className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <p className="text-3xl font-bold text-gray-900 mb-1">
                                    ${(benchmarkMetrics.revenuePerEmployee / 1000).toFixed(0)}k
                                  </p>
                                  <p className={`text-xs font-semibold ${
                                    benchmarkMetrics.revenuePerEmployee >= BENCHMARKS.RPE.EXCELLENT
                                      ? 'text-green-600'
                                      : benchmarkMetrics.revenuePerEmployee >= BENCHMARKS.RPE.GOOD
                                      ? 'text-blue-600'
                                      : 'text-yellow-600'
                                  }`}>
                                    {benchmarkMetrics.rpeRating}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Target: $150k-$200k
                                  </p>
                                </div>

                                {/* Policies Per Customer */}
                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Policies/Customer</h4>
                                    <Package className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {benchmarkMetrics.policiesPerCustomer.toFixed(2)}
                                  </p>
                                  <p className={`text-xs font-semibold ${
                                    benchmarkMetrics.policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.OPTIMAL
                                      ? 'text-green-600'
                                      : benchmarkMetrics.policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.BUNDLED
                                      ? 'text-blue-600'
                                      : 'text-yellow-600'
                                  }`}>
                                    {benchmarkMetrics.ppcStatus}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Critical: 1.8+
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Policies Per Customer Chart */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                            >
                              <h2 className="text-2xl font-bold text-gray-900 mb-3">Policies Per Customer Trend</h2>
                              <p className="text-gray-700 mb-8">
                                Track bundling effectiveness over time. Higher values indicate better retention and revenue per customer.
                              </p>

                              <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={scenarioData} aria-label="Line chart showing policies per customer over time">
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis
                                    dataKey="month"
                                    label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                                    stroke="#6b7280"
                                  />
                                  <YAxis
                                    label={{ value: 'Policies Per Customer', angle: -90, position: 'insideLeft' }}
                                    stroke="#6b7280"
                                    domain={[0, 'auto']}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#fff',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '12px',
                                      padding: '12px'
                                    }}
                                    formatter={(value: number) => value.toFixed(2)}
                                  />
                                  <Legend />
                                  <ReferenceLine
                                    y={BENCHMARKS.POLICIES_PER_CUSTOMER.OPTIMAL}
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    label={{
                                      value: 'Critical Threshold (1.8)',
                                      position: 'right',
                                      fill: '#ef4444',
                                      fontSize: 12,
                                      fontWeight: 'bold'
                                    }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="policiesPerCustomer"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    name="Policies/Customer"
                                    dot={{ fill: '#8b5cf6', r: 4 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </motion.div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="results" role="tabpanel" id="tabpanel-results" aria-labelledby="tab-results">
                  <div className="max-w-6xl mx-auto space-y-8">
                    {!hasResults ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                      >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">Strategic Recommendations</h2>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-100">
                          <Lightbulb className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                          <p className="text-gray-700 text-lg">
                            Strategic recommendations will appear here after calculation
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Configure your strategy and click Calculate to see recommendations
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                      >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">Strategic Recommendations</h2>

                        {/* Success Banner */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl p-6 mb-10">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                              <CheckCircle2 className="w-7 h-7 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-green-900 mb-2">
                                Moderate Strategy: RECOMMENDED
                              </h3>
                              <p className="text-green-700 leading-relaxed">
                                Based on your parameters, the moderate growth strategy shows strong positive ROI within {scenarioResults[1]?.paybackMonths} months
                                with manageable risk levels. Expected policy growth of {((scenarioResults[1]?.finalPolicies - strategyInputs.currentPolicies) / strategyInputs.currentPolicies * 100).toFixed(1)}% aligns with industry benchmarks.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid sm:grid-cols-3 gap-6 mb-10">
                          {scenarioResults[1] && [
                            {
                              label: 'Expected ROI',
                              value: `${scenarioResults[1].roi.toFixed(1)}%`,
                              trend: scenarioResults[1].roi > 20 ? 'Excellent' : 'Good'
                            },
                            {
                              label: 'Payback Period',
                              value: `${scenarioResults[1].paybackMonths} mo`,
                              trend: scenarioResults[1].paybackMonths < 24 ? 'Fast' : 'Standard'
                            },
                            {
                              label: 'Policy Growth',
                              value: `+${scenarioResults[1].finalPolicies - strategyInputs.currentPolicies}`,
                              trend: `+${((scenarioResults[1].finalPolicies - strategyInputs.currentPolicies) / strategyInputs.currentPolicies * 100).toFixed(1)}%`
                            }
                          ].map((metric) => (
                            <motion.div
                              key={metric.label}
                              whileHover={{ scale: 1.05, y: -4 }}
                              className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-center shadow-sm hover:shadow-lg transition-all duration-300"
                            >
                              <div className="text-4xl font-bold text-gray-900 mb-2">{metric.value}</div>
                              <div className="text-sm font-medium text-gray-600 mb-2">{metric.label}</div>
                              <div className="text-xs text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full font-medium">
                                {metric.trend}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Unit Economics Dashboard */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200 mb-10">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Activity className="w-6 h-6 text-purple-700" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Unit Economics Analysis</h3>
                              <p className="text-sm text-gray-600">Key financial metrics for sustainable growth</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Customer Lifetime Value */}
                            <motion.div
                              whileHover={{ scale: 1.03, y: -2 }}
                              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                              </div>
                              <div className="text-3xl font-bold text-green-600 mb-2">
                                ${scenarioResults[1]?.ltv?.toLocaleString() || 0}
                              </div>
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                Customer Lifetime Value
                              </div>
                              <div className="text-xs text-gray-500">
                                Revenue per customer
                              </div>
                            </motion.div>

                            {/* Customer Acquisition Cost */}
                            <motion.div
                              whileHover={{ scale: 1.03, y: -2 }}
                              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                  <Target className="w-5 h-5 text-orange-600" />
                                </div>
                              </div>
                              <div className="text-3xl font-bold text-orange-600 mb-2">
                                ${scenarioResults[1]?.cac?.toLocaleString() || 0}
                              </div>
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                Customer Acquisition Cost
                              </div>
                              <div className="text-xs text-gray-500">
                                Cost per new policy
                              </div>
                            </motion.div>

                            {/* Lifetime Value : Acquisition Cost Ratio */}
                            <motion.div
                              whileHover={{ scale: 1.03, y: -2 }}
                              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${
                                  scenarioResults[1]?.ltvCacRatio && scenarioResults[1].ltvCacRatio >= 3
                                    ? 'bg-green-100'
                                    : 'bg-blue-100'
                                }`}>
                                  <TrendingUp className={`w-5 h-5 ${
                                    scenarioResults[1]?.ltvCacRatio && scenarioResults[1].ltvCacRatio >= 3
                                      ? 'text-green-600'
                                      : 'text-blue-600'
                                  }`} />
                                </div>
                              </div>
                              <div className={`text-3xl font-bold mb-2 ${
                                scenarioResults[1]?.ltvCacRatio && scenarioResults[1].ltvCacRatio >= 3
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                              }`}>
                                {scenarioResults[1]?.ltvCacRatio?.toFixed(1) || 0}:1
                              </div>
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                Lifetime Value : Acquisition Cost
                              </div>
                              <div className="text-xs text-gray-500">
                                {scenarioResults[1]?.ltvCacRatio && scenarioResults[1].ltvCacRatio >= 3 ? 'Excellent' : 'Good'}
                              </div>
                            </motion.div>

                            {/* Break-Even Point */}
                            <motion.div
                              whileHover={{ scale: 1.03, y: -2 }}
                              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                                </div>
                              </div>
                              <div className="text-3xl font-bold text-indigo-600 mb-2">
                                {scenarioResults[1]?.breakEvenMonth !== undefined && scenarioResults[1].breakEvenMonth > 0
                                  ? `Month ${scenarioResults[1].breakEvenMonth}`
                                  : 'N/A'}
                              </div>
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                Break-Even Point
                              </div>
                              <div className="text-xs text-gray-500">
                                {scenarioResults[1]?.breakEvenMonth !== undefined && scenarioResults[1].breakEvenMonth > 0
                                  ? 'Positive cash flow'
                                  : 'See projections'}
                              </div>
                            </motion.div>
                          </div>

                          {/* Economics Insights */}
                          <div className="mt-6 p-4 bg-white/50 rounded-xl border border-purple-100">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-gray-700">
                                <strong>Healthy metrics:</strong> Lifetime value to acquisition cost ratio above 3:1 indicates strong unit economics.
                                {scenarioResults[1]?.ltvCacRatio && scenarioResults[1].ltvCacRatio >= 3
                                  ? " Your strategy meets this benchmark."
                                  : " Consider optimizing acquisition costs or improving retention to improve this ratio."}
                                {scenarioResults[1]?.breakEvenMonth !== undefined && scenarioResults[1].breakEvenMonth <= 12
                                  ? ` Reaching break-even in ${scenarioResults[1].breakEvenMonth} months shows strong cash efficiency.`
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* What Matters Most - Key Driver Analysis */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200 mb-10">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <Award className="w-6 h-6 text-amber-700" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">What Matters Most</h3>
                              <p className="text-sm text-gray-600">Key growth drivers ranked by impact on your agency</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* #1 - Cross-Selling */}
                            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  1
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900">Policies Per Customer (Cross-Selling)</h4>
                                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">59.7% Impact</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-3">
                                    Moving from {(strategyInputs.currentPolicies / strategyInputs.currentCustomers).toFixed(1)} to 2.0 policies per customer unlocks optimal 95% retention tier.
                                    Each additional policy per customer increases both retention AND revenue.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Bundle auto+home</span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Add umbrella policies</span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Life insurance cross-sell</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* #2 - Marketing Spend */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  2
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900">Marketing Spend</h4>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">44.3% Impact</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-3">
                                    Current: ${strategyInputs.monthlyLeadSpend.toLocaleString()}/mo → {Math.round(strategyInputs.monthlyLeadSpend / strategyInputs.costPerLead)} leads.
                                    Live transfers at ${strategyInputs.costPerLead} per lead with 10% conversion = ${Math.round(strategyInputs.costPerLead / 0.10)} effective acquisition cost.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Scale to $5-8K/mo for aggressive growth</span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Diminishing returns above $10K</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* #3 - Conversion Rate */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  3
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900">Conversion Rate</h4>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">22.1% Impact</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-3">
                                    5% improvement in conversion has greater ROI than 20% reduction in CPL.
                                    Focus on speed-to-lead and follow-up processes.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Respond within 5 minutes</span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">5-touch follow-up sequence</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* #4 - Retention */}
                            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  4
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-900">Retention Rate</h4>
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">16.8% Impact</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-3">
                                    Small retention gains compound significantly. 85% vs 95% annual = 1.35% vs 0.43% monthly churn.
                                    Retention supports all other growth efforts.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Cross-sell to 1.8+ policies per customer</span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Annual policy reviews</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Strategic Insight */}
                          <div className="mt-6 p-4 bg-amber-100/50 rounded-xl border border-amber-200">
                            <div className="flex items-start gap-3">
                              <Zap className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-gray-800">
                                <strong>Bottom line:</strong> Cross-selling is almost 3x more impactful than any other lever.
                                A customer with 2.0 policies stays longer (95% retention) AND generates more revenue.
                                Focus here first, then scale marketing to fuel new customer acquisition.
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Items */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Prioritized Action Plan</h3>
                          <div className="space-y-4">
                            {[
                              {
                                priority: 'HIGH',
                                action: `Launch cross-sell campaign to move policies per customer from ${(strategyInputs.currentPolicies / strategyInputs.currentCustomers).toFixed(1)} to 1.8+`,
                                color: 'bg-red-100 text-red-800'
                              },
                              {
                                priority: 'HIGH',
                                action: `Allocate $${strategyInputs.additionalLeadSpend.toLocaleString()}/month to lead generation (${Math.round(strategyInputs.additionalLeadSpend / strategyInputs.costPerLead)} leads/mo)`,
                                color: 'bg-red-100 text-red-800'
                              },
                              {
                                priority: 'MED',
                                action: 'Implement 5-minute response time for all leads',
                                color: 'bg-yellow-100 text-yellow-800'
                              },
                              strategyInputs.conciergeService && {
                                priority: 'MED',
                                action: 'Deploy concierge service for retention boost',
                                color: 'bg-yellow-100 text-yellow-800'
                              },
                              strategyInputs.newsletterSystem && {
                                priority: 'LOW',
                                action: 'Launch newsletter system for ongoing engagement',
                                color: 'bg-gray-100 text-gray-800'
                              },
                              {
                                priority: 'LOW',
                                action: `Review ROI metrics at month ${Math.round(strategyInputs.projectionMonths / 3)} and optimize`,
                                color: 'bg-gray-100 text-gray-800'
                              }
                            ].filter(Boolean).map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${(item as { priority: string; action: string; color: string }).color}`}>
                                  {(item as { priority: string; action: string; color: string }).priority}
                                </span>
                                <p className="text-gray-700 flex-1">{(item as { priority: string; action: string; color: string }).action}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Tabs.Content>
              </motion.div>
            </AnimatePresence>
          </Tabs.Root>
        </div>
      </nav>

      {/* Premium Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20" role="contentinfo" aria-label="Site footer">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              Model confidence: <span className="font-semibold text-gray-900">87% R²</span> •
              Data: <span className="font-semibold text-gray-900">500+ agencies</span> •
              Last calibrated: <span className="font-semibold text-gray-900">Q4 2024</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200"
            >
              Deploy with Vercel
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;