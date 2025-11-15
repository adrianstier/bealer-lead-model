/**
 * Agency Growth Modeling Platform v3.0 - Enhanced React Frontend
 * Incorporates all industry benchmarks and v3.0 features
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import {
  TrendingUp,
  Settings,
  BarChart3,
  Target,
  DollarSign,
  Users,
  Activity,
  CheckCircle2,
  AlertCircle,
  Zap,
  Package
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// ============================================================================
// INTERFACES - V3.0 Enhanced
// ============================================================================

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
  producerComp: number;  // annual
  serviceComp: number;   // annual
  adminComp: number;     // annual
}

interface ProductMix {
  auto: number;
  home: number;
  umbrella: number;
  cyber: number;
  commercial: number;
}

interface EnhancedInputs {
  // Current state
  currentPolicies: number;
  currentCustomers: number;

  // Marketing channels (v3.0)
  marketing: MarketingChannels;

  // Staffing composition (v3.0)
  staffing: StaffingComposition;

  // Product mix (v3.0)
  products: ProductMix;

  // Financial
  avgPremium: number;
  commissionStructure: 'independent' | 'captive' | 'hybrid';
  fixedOverhead: number;

  // Growth stage (v3.0)
  growthStage: 'mature' | 'growth';

  // Technology investments (v3.0)
  eoAutomation: boolean;
  renewalProgram: boolean;
  crossSellProgram: boolean;

  // Simulation
  projectionMonths: number;
}

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

interface SimulationResults {
  monthlyData: MonthlyData[];
  benchmarks: BenchmarkMetrics;
  scenarios: ScenarioComparison[];
}

interface MonthlyData {
  month: number;
  policies: number;
  customers: number;
  policiesPerCustomer: number;
  retention: number;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
}

interface ScenarioComparison {
  name: string;
  finalPolicies: number;
  finalCustomers: number;
  policiesPerCustomer: number;
  ruleOf20: number;
  ebitdaMargin: number;
  ltvCacRatio: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
}

// ============================================================================
// BENCHMARK CONSTANTS
// ============================================================================

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
    OPTIMAL: 0.95,
    BUNDLED: 0.91,
    MONOLINE: 0.67
  },
  STAFFING_RATIO: {
    OPTIMAL: 2.8,
    MIN: 2.0,
    MAX: 3.5
  },
  MARKETING_SPEND: {
    MATURE_MIN: 0.03,
    MATURE_MAX: 0.07,
    GROWTH_MIN: 0.10,
    GROWTH_MAX: 0.25
  },
  TECH_SPEND: {
    MIN: 0.025,
    MAX: 0.035
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AppV3Enhanced() {
  const [activeTab, setActiveTab] = useState('strategy');
  const [isCalculating, setIsCalculating] = useState(false);

  const [inputs, setInputs] = useState<EnhancedInputs>({
    currentPolicies: 500,
    currentCustomers: 350,
    marketing: {
      referral: 500,
      digital: 1500,
      traditional: 500,
      partnerships: 500
    },
    staffing: {
      producers: 2.0,
      serviceStaff: 5.0,
      adminStaff: 1.0,
      producerComp: 70000,
      serviceComp: 45000,
      adminComp: 40000
    },
    products: {
      auto: 300,
      home: 200,
      umbrella: 80,
      cyber: 20,
      commercial: 50
    },
    avgPremium: 1500,
    commissionStructure: 'independent',
    fixedOverhead: 3000,
    growthStage: 'growth',
    eoAutomation: false,
    renewalProgram: false,
    crossSellProgram: false,
    projectionMonths: 24
  });

  const [results, setResults] = useState<SimulationResults | null>(null);

  // ============================================================================
  // CALCULATION FUNCTIONS
  // ============================================================================

  const calculateBenchmarks = (data: MonthlyData[]): BenchmarkMetrics => {
    const finalMonth = data[data.length - 1];
    const firstMonth = data[0];

    // Calculate annual figures
    const monthlyRevenue = finalMonth.revenue;
    const annualRevenue = monthlyRevenue * 12;

    // Calculate growth
    const policyGrowth = ((finalMonth.policies - firstMonth.policies) / firstMonth.policies) * 100;
    const annualizedGrowth = (policyGrowth / data.length) * 12;

    // EBITDA margin (from final month)
    const ebitdaMargin = finalMonth.ebitdaMargin;

    // Rule of 20
    const ruleOf20Score = annualizedGrowth + (0.5 * ebitdaMargin * 100);
    const ruleOf20Rating =
      ruleOf20Score >= BENCHMARKS.RULE_OF_20.TOP_PERFORMER ? 'Top Performer' :
      ruleOf20Score >= BENCHMARKS.RULE_OF_20.HEALTHY ? 'Healthy Agency' :
      ruleOf20Score >= BENCHMARKS.RULE_OF_20.NEEDS_IMPROVEMENT ? 'Needs Improvement' :
      'Critical';

    // EBITDA status
    const ebitdaStatus =
      ebitdaMargin >= BENCHMARKS.EBITDA.EXCELLENT ? 'Excellent' :
      ebitdaMargin >= BENCHMARKS.EBITDA.TARGET ? 'Target' :
      ebitdaMargin >= BENCHMARKS.EBITDA.ACCEPTABLE ? 'Acceptable' :
      'Below Target';

    // LTV:CAC
    const ltvCacRatio = finalMonth.ltvCacRatio;
    const ltvCacStatus =
      ltvCacRatio >= BENCHMARKS.LTV_CAC.UNDERINVESTED ? 'Under-invested' :
      ltvCacRatio >= BENCHMARKS.LTV_CAC.GREAT ? 'Great' :
      ltvCacRatio >= BENCHMARKS.LTV_CAC.GOOD ? 'Good' :
      'Poor';

    // Revenue per employee
    const totalFTE = inputs.staffing.producers + inputs.staffing.serviceStaff + inputs.staffing.adminStaff;
    const revenuePerEmployee = annualRevenue / totalFTE;
    const rpeRating =
      revenuePerEmployee >= BENCHMARKS.RPE.EXCELLENT ? 'Excellent' :
      revenuePerEmployee >= BENCHMARKS.RPE.GOOD ? 'Good' :
      revenuePerEmployee >= BENCHMARKS.RPE.ACCEPTABLE ? 'Acceptable' :
      'Below Target';

    // Policies per customer
    const policiesPerCustomer = finalMonth.policiesPerCustomer;
    const ppcStatus =
      policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.OPTIMAL ? 'Optimal (95% retention)' :
      policiesPerCustomer >= BENCHMARKS.POLICIES_PER_CUSTOMER.BUNDLED ? 'Bundled (91% retention)' :
      'Monoline (67% retention)';

    // Marketing spend %
    const totalMarketing = Object.values(inputs.marketing).reduce((a, b) => a + b, 0);
    const marketingSpendPercent = (totalMarketing * 12) / annualRevenue;

    // Tech spend %
    const techCost =
      (inputs.eoAutomation ? 150 : 0) +
      (inputs.crossSellProgram ? 500 : 0) +
      1450; // Base tech stack
    const techSpendPercent = (techCost * 12) / annualRevenue;

    // Staffing ratio
    const staffingRatio = inputs.staffing.producers > 0 ?
      inputs.staffing.serviceStaff / inputs.staffing.producers : 0;

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
      retentionRate: finalMonth.retention,
      marketingSpendPercent,
      techSpendPercent,
      staffingRatio
    };
  };

  const runSimulation = () => {
    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      // Generate monthly data
      const monthlyData: MonthlyData[] = [];

      let policies = inputs.currentPolicies;
      let customers = inputs.currentCustomers;

      // Channel-specific conversions
      const channelConversions = {
        referral: 0.60,
        digital: 0.18,
        traditional: 0.15,
        partnerships: 0.25
      };

      const channelCosts = {
        referral: 50,
        digital: 25,
        traditional: 35,
        partnerships: 40
      };

      for (let month = 1; month <= inputs.projectionMonths; month++) {
        // Calculate leads by channel
        const leads = {
          referral: inputs.marketing.referral / channelCosts.referral,
          digital: inputs.marketing.digital / channelCosts.digital,
          traditional: inputs.marketing.traditional / channelCosts.traditional,
          partnerships: inputs.marketing.partnerships / channelCosts.partnerships
        };

        // New policies from each channel
        const newPolicies =
          leads.referral * channelConversions.referral +
          leads.digital * channelConversions.digital +
          leads.traditional * channelConversions.traditional +
          leads.partnerships * channelConversions.partnerships;

        // Calculate retention based on policies per customer
        const ppc = policies / customers;
        let retentionRate;
        if (ppc >= BENCHMARKS.POLICIES_PER_CUSTOMER.OPTIMAL) {
          retentionRate = BENCHMARKS.RETENTION.OPTIMAL;
        } else if (ppc >= BENCHMARKS.POLICIES_PER_CUSTOMER.BUNDLED) {
          retentionRate = BENCHMARKS.RETENTION.BUNDLED;
        } else {
          retentionRate = BENCHMARKS.RETENTION.MONOLINE;
        }

        // Monthly retention
        const monthlyRetention = Math.pow(retentionRate, 1/12);
        const retainedPolicies = policies * monthlyRetention;

        // Update policies
        policies = retainedPolicies + newPolicies;

        // Update customers (80% of new policies are new customers, 20% cross-sells)
        const newCustomers = newPolicies * 0.8;
        const customersLost = customers * (1 - monthlyRetention);
        customers = customers - customersLost + newCustomers;

        // Revenue calculation
        const monthlyPremiumPerPolicy = inputs.avgPremium / 12;
        const commissionRate = inputs.commissionStructure === 'independent' ? 0.12 :
                              inputs.commissionStructure === 'captive' ? 0.185 : 0.15;
        const revenue = policies * monthlyPremiumPerPolicy * commissionRate;

        // Costs
        const totalMarketing = Object.values(inputs.marketing).reduce((a, b) => a + b, 0);
        const staffCost = (
          inputs.staffing.producers * inputs.staffing.producerComp +
          inputs.staffing.serviceStaff * inputs.staffing.serviceComp +
          inputs.staffing.adminStaff * inputs.staffing.adminComp
        ) * 1.3 / 12; // Benefits multiplier, monthly

        const techCost =
          (inputs.eoAutomation ? 150 : 0) +
          (inputs.crossSellProgram ? 500 : 0) +
          1450; // Base

        const totalCosts = totalMarketing + staffCost + techCost + inputs.fixedOverhead;

        // EBITDA
        const ebitda = revenue - totalCosts;
        const ebitdaMargin = revenue > 0 ? ebitda / revenue : 0;

        // Unit economics
        const totalLeads = Object.values(leads).reduce((a, b) => a + b, 0);
        const cac = totalLeads > 0 ? totalMarketing / newPolicies : 0;
        const annualRevenuePerCustomer = revenue * 12 / customers;
        const ltv = (annualRevenuePerCustomer * retentionRate) / (1 - retentionRate) - cac;
        const ltvCacRatio = cac > 0 ? ltv / cac : 0;

        monthlyData.push({
          month,
          policies,
          customers,
          policiesPerCustomer: policies / customers,
          retention: retentionRate,
          revenue,
          ebitda,
          ebitdaMargin,
          ltv,
          cac,
          ltvCacRatio
        });
      }

      // Calculate benchmarks
      const benchmarks = calculateBenchmarks(monthlyData);

      // Generate scenario comparisons
      const scenarios: ScenarioComparison[] = [
        {
          name: 'Conservative',
          finalPolicies: monthlyData[monthlyData.length - 1].policies * 0.9,
          finalCustomers: monthlyData[monthlyData.length - 1].customers * 0.9,
          policiesPerCustomer: monthlyData[monthlyData.length - 1].policiesPerCustomer,
          ruleOf20: benchmarks.ruleOf20Score * 0.8,
          ebitdaMargin: benchmarks.ebitdaMargin * 0.9,
          ltvCacRatio: benchmarks.ltvCacRatio,
          totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0) * 0.9,
          totalCosts: monthlyData.reduce((sum, m) => sum + (m.revenue - m.ebitda), 0),
          netProfit: monthlyData.reduce((sum, m) => sum + m.ebitda, 0) * 0.8
        },
        {
          name: 'Moderate',
          finalPolicies: monthlyData[monthlyData.length - 1].policies,
          finalCustomers: monthlyData[monthlyData.length - 1].customers,
          policiesPerCustomer: monthlyData[monthlyData.length - 1].policiesPerCustomer,
          ruleOf20: benchmarks.ruleOf20Score,
          ebitdaMargin: benchmarks.ebitdaMargin,
          ltvCacRatio: benchmarks.ltvCacRatio,
          totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
          totalCosts: monthlyData.reduce((sum, m) => sum + (m.revenue - m.ebitda), 0),
          netProfit: monthlyData.reduce((sum, m) => sum + m.ebitda, 0)
        },
        {
          name: 'Aggressive',
          finalPolicies: monthlyData[monthlyData.length - 1].policies * 1.15,
          finalCustomers: monthlyData[monthlyData.length - 1].customers * 1.15,
          policiesPerCustomer: monthlyData[monthlyData.length - 1].policiesPerCustomer * 1.05,
          ruleOf20: benchmarks.ruleOf20Score * 1.2,
          ebitdaMargin: benchmarks.ebitdaMargin * 0.95,
          ltvCacRatio: benchmarks.ltvCacRatio,
          totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0) * 1.15,
          totalCosts: monthlyData.reduce((sum, m) => sum + (m.revenue - m.ebitda), 0) * 1.20,
          netProfit: monthlyData.reduce((sum, m) => sum + m.ebitda, 0) * 1.10
        }
      ];

      setResults({
        monthlyData,
        benchmarks,
        scenarios
      });

      setIsCalculating(false);
      setActiveTab('results');
    }, 1000);
  };

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const getStatusColor = (status: string) => {
    if (status.includes('Excellent') || status.includes('Top') || status.includes('Great') || status.includes('Optimal')) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    if (status.includes('Good') || status.includes('Target') || status.includes('Healthy')) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    if (status.includes('Acceptable') || status.includes('Bundled') || status.includes('Needs')) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Excellent') || status.includes('Top') || status.includes('Great') || status.includes('Optimal')) {
      return <CheckCircle2 className="w-5 h-5" />;
    }
    if (status.includes('Good') || status.includes('Target') || status.includes('Healthy')) {
      return <CheckCircle2 className="w-5 h-5" />;
    }
    return <AlertCircle className="w-5 h-5" />;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agency Growth Modeling Platform</h1>
              <p className="text-sm text-slate-600 mt-1">v3.0 with Industry Benchmarks</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">30+ Benchmarks Integrated</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <Tabs.List className="flex gap-2 border-b mb-8">
            <Tabs.Trigger
              value="strategy"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Strategy Builder
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="results"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 transition-colors"
              disabled={!results}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Benchmark Analysis
              </div>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="investments"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                High-ROI Investments
              </div>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Strategy Builder Tab */}
          <Tabs.Content value="strategy">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Inputs */}
              <div className="lg:col-span-2 space-y-6">

                {/* Marketing Channels */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Marketing Channels</h3>
                  </div>
                  <div className="text-sm text-slate-600 mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <strong>Benchmarks:</strong> Referrals convert at 60% vs 15% traditional (4x better). Digital reduces CAC by 30%.
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Referral Program ($/month) - 60% conversion, $50/lead
                      </label>
                      <input
                        type="number"
                        value={inputs.marketing.referral}
                        onChange={(e) => setInputs({
                          ...inputs,
                          marketing: { ...inputs.marketing, referral: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        step="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Digital Marketing ($/month) - 18% conversion, $25/lead
                      </label>
                      <input
                        type="number"
                        value={inputs.marketing.digital}
                        onChange={(e) => setInputs({
                          ...inputs,
                          marketing: { ...inputs.marketing, digital: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        step="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Traditional Marketing ($/month) - 15% conversion, $35/lead
                      </label>
                      <input
                        type="number"
                        value={inputs.marketing.traditional}
                        onChange={(e) => setInputs({
                          ...inputs,
                          marketing: { ...inputs.marketing, traditional: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        step="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Strategic Partnerships ($/month) - 25% conversion, $40/lead
                      </label>
                      <input
                        type="number"
                        value={inputs.marketing.partnerships}
                        onChange={(e) => setInputs({
                          ...inputs,
                          marketing: { ...inputs.marketing, partnerships: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        step="100"
                      />
                    </div>

                    <div className="pt-2 border-t text-sm font-medium">
                      Total Marketing: ${Object.values(inputs.marketing).reduce((a, b) => a + b, 0).toLocaleString()}/month
                    </div>
                  </div>
                </div>

                {/* Staffing Composition */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Staffing Composition</h3>
                  </div>
                  <div className="text-sm text-slate-600 mb-4 p-3 bg-purple-50 rounded border border-purple-200">
                    <strong>Optimal Ratio:</strong> 2.8 service staff per producer. Target RPE: $150k-$200k (good), $300k+ (excellent).
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Producers (FTE)</label>
                      <input
                        type="number"
                        value={inputs.staffing.producers}
                        onChange={(e) => setInputs({
                          ...inputs,
                          staffing: { ...inputs.staffing, producers: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        step="0.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Service Staff (FTE)</label>
                      <input
                        type="number"
                        value={inputs.staffing.serviceStaff}
                        onChange={(e) => setInputs({
                          ...inputs,
                          staffing: { ...inputs.staffing, serviceStaff: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Admin Staff (FTE)</label>
                    <input
                      type="number"
                      value={inputs.staffing.adminStaff}
                      onChange={(e) => setInputs({
                        ...inputs,
                        staffing: { ...inputs.staffing, adminStaff: Number(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                      step="0.5"
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Total FTE:</span>
                      <span>{(inputs.staffing.producers + inputs.staffing.serviceStaff + inputs.staffing.adminStaff).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Service:Producer Ratio:</span>
                      <span className="flex items-center gap-2">
                        {inputs.staffing.producers > 0 ? (inputs.staffing.serviceStaff / inputs.staffing.producers).toFixed(1) : '0.0'}:1
                        {inputs.staffing.producers > 0 && Math.abs((inputs.staffing.serviceStaff / inputs.staffing.producers) - 2.8) <= 0.3 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Optimal
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Mix */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Product Mix</h3>
                  </div>
                  <div className="text-sm text-slate-600 mb-4 p-3 bg-green-50 rounded border border-green-200">
                    <strong>Critical Threshold:</strong> 1.8 policies per customer = 95% retention. Focus on bundling!
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Auto Policies</label>
                      <input
                        type="number"
                        value={inputs.products.auto}
                        onChange={(e) => setInputs({
                          ...inputs,
                          products: { ...inputs.products, auto: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Home Policies</label>
                      <input
                        type="number"
                        value={inputs.products.home}
                        onChange={(e) => setInputs({
                          ...inputs,
                          products: { ...inputs.products, home: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Umbrella Policies <span className="text-green-600">(High Margin)</span>
                      </label>
                      <input
                        type="number"
                        value={inputs.products.umbrella}
                        onChange={(e) => setInputs({
                          ...inputs,
                          products: { ...inputs.products, umbrella: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Cyber Policies <span className="text-green-600">(15-25% comm.)</span>
                      </label>
                      <input
                        type="number"
                        value={inputs.products.cyber}
                        onChange={(e) => setInputs({
                          ...inputs,
                          products: { ...inputs.products, cyber: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">Commercial Policies</label>
                      <input
                        type="number"
                        value={inputs.products.commercial}
                        onChange={(e) => setInputs({
                          ...inputs,
                          products: { ...inputs.products, commercial: Number(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Policies:</span>
                      <span>{Object.values(inputs.products).reduce((a, b) => a + b, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estimated Policies per Customer:</span>
                      <span className="flex items-center gap-2">
                        {(Object.values(inputs.products).reduce((a, b) => a + b, 0) / inputs.currentCustomers).toFixed(2)}
                        {(Object.values(inputs.products).reduce((a, b) => a + b, 0) / inputs.currentCustomers) >= 1.8 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            95% Retention!
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technology Investments */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold">Technology Investments</h3>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.eoAutomation}
                        onChange={(e) => setInputs({ ...inputs, eoAutomation: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="font-medium">E&O Certificate Automation ($150/mo)</div>
                        <div className="text-sm text-slate-600">Prevents 40% of claims | ROI: 733%</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.renewalProgram}
                        onChange={(e) => setInputs({ ...inputs, renewalProgram: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Proactive Renewal Review Program</div>
                        <div className="text-sm text-slate-600">1.5-2% retention improvement | 5% improvement = 2x profits in 5 years</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.crossSellProgram}
                        onChange={(e) => setInputs({ ...inputs, crossSellProgram: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Cross-Sell Program ($500/mo)</div>
                        <div className="text-sm text-slate-600">Umbrella & Cyber focus | Drives to 1.8+ policies/customer</div>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Right Column - Summary & Actions */}
              <div className="space-y-6">

                {/* Quick Summary */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Configuration Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-90">Current Policies:</span>
                      <span className="font-semibold">{inputs.currentPolicies.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Current Customers:</span>
                      <span className="font-semibold">{inputs.currentCustomers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Total Marketing:</span>
                      <span className="font-semibold">${Object.values(inputs.marketing).reduce((a, b) => a + b, 0).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Total FTE:</span>
                      <span className="font-semibold">{(inputs.staffing.producers + inputs.staffing.serviceStaff + inputs.staffing.adminStaff).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Growth Stage:</span>
                      <span className="font-semibold capitalize">{inputs.growthStage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Projection:</span>
                      <span className="font-semibold">{inputs.projectionMonths} months</span>
                    </div>
                  </div>
                </div>

                {/* Run Simulation Button */}
                <motion.button
                  onClick={runSimulation}
                  disabled={isCalculating}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: isCalculating ? 1 : 1.02 }}
                  whileTap={{ scale: isCalculating ? 1 : 0.98 }}
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      Run Benchmark Analysis
                    </>
                  )}
                </motion.button>

                {/* Benchmark Preview */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="font-semibold mb-4">Benchmark Targets</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">Rule of 20: ≥ 20</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">EBITDA: 25-30%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-slate-600">LTV:CAC: 3:1 to 4:1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-yellow-600" />
                      <span className="text-slate-600">Policies/Customer: 1.8+</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-slate-600">Service:Producer: 2.8:1</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </Tabs.Content>

          {/* Results Tab */}
          <Tabs.Content value="results">
            {results && (
              <div className="space-y-8">

                {/* Top Metrics - Rule of 20, EBITDA, LTV:CAC, RPE */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`p-6 rounded-lg border-2 ${getStatusColor(results.benchmarks.ruleOf20Rating)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(results.benchmarks.ruleOf20Rating)}
                      <h4 className="font-semibold">Rule of 20 Score</h4>
                    </div>
                    <div className="text-3xl font-bold mb-1">{results.benchmarks.ruleOf20Score.toFixed(1)}</div>
                    <div className="text-sm opacity-75">{results.benchmarks.ruleOf20Rating}</div>
                    <div className="text-xs mt-2 opacity-60">Target: ≥ 20</div>
                  </div>

                  <div className={`p-6 rounded-lg border-2 ${getStatusColor(results.benchmarks.ebitdaStatus)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(results.benchmarks.ebitdaStatus)}
                      <h4 className="font-semibold">EBITDA Margin</h4>
                    </div>
                    <div className="text-3xl font-bold mb-1">{(results.benchmarks.ebitdaMargin * 100).toFixed(1)}%</div>
                    <div className="text-sm opacity-75">{results.benchmarks.ebitdaStatus}</div>
                    <div className="text-xs mt-2 opacity-60">Target: 25-30%</div>
                  </div>

                  <div className={`p-6 rounded-lg border-2 ${getStatusColor(results.benchmarks.ltvCacStatus)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(results.benchmarks.ltvCacStatus)}
                      <h4 className="font-semibold">LTV:CAC Ratio</h4>
                    </div>
                    <div className="text-3xl font-bold mb-1">{results.benchmarks.ltvCacRatio.toFixed(1)}:1</div>
                    <div className="text-sm opacity-75">{results.benchmarks.ltvCacStatus}</div>
                    <div className="text-xs mt-2 opacity-60">Target: 3:1 to 4:1</div>
                  </div>

                  <div className={`p-6 rounded-lg border-2 ${getStatusColor(results.benchmarks.rpeRating)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(results.benchmarks.rpeRating)}
                      <h4 className="font-semibold">Revenue Per Employee</h4>
                    </div>
                    <div className="text-3xl font-bold mb-1">${(results.benchmarks.revenuePerEmployee / 1000).toFixed(0)}k</div>
                    <div className="text-sm opacity-75">{results.benchmarks.rpeRating}</div>
                    <div className="text-xs mt-2 opacity-60">Target: $150k-$200k</div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Policies Per Customer Chart */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Policies Per Customer (Critical: 1.8 = 95% Retention)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={results.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine y={1.8} stroke="#ef4444" strokeDasharray="3 3" label="Critical Threshold (1.8)" />
                        <Line type="monotone" dataKey="policiesPerCustomer" stroke="#3b82f6" strokeWidth={3} name="Policies/Customer" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className={`mt-4 p-3 rounded border ${getStatusColor(results.benchmarks.ppcStatus)}`}>
                      <div className="font-medium">Current: {results.benchmarks.policiesPerCustomer.toFixed(2)} policies/customer</div>
                      <div className="text-sm opacity-75">{results.benchmarks.ppcStatus}</div>
                    </div>
                  </div>

                  {/* EBITDA Trend Chart */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">EBITDA Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={results.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="ebitda" stroke="#10b981" strokeWidth={3} name="Monthly EBITDA" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                </div>

                {/* Scenario Comparison Table */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Scenario Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left p-3">Scenario</th>
                          <th className="text-right p-3">Final Policies</th>
                          <th className="text-right p-3">Policies/Customer</th>
                          <th className="text-right p-3">Rule of 20</th>
                          <th className="text-right p-3">EBITDA</th>
                          <th className="text-right p-3">LTV:CAC</th>
                          <th className="text-right p-3">Net Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.scenarios.map((scenario, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-medium">{scenario.name}</td>
                            <td className="p-3 text-right">{scenario.finalPolicies.toFixed(0)}</td>
                            <td className="p-3 text-right">{scenario.policiesPerCustomer.toFixed(2)}</td>
                            <td className="p-3 text-right">{scenario.ruleOf20.toFixed(1)}</td>
                            <td className="p-3 text-right">{(scenario.ebitdaMargin * 100).toFixed(1)}%</td>
                            <td className="p-3 text-right">{scenario.ltvCacRatio.toFixed(1)}:1</td>
                            <td className="p-3 text-right">${scenario.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </Tabs.Content>

          {/* High-ROI Investments Tab */}
          <Tabs.Content value="investments">
            <div className="space-y-6">

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">High-ROI Investment Opportunities</h2>
                <p className="text-slate-600">Proven strategies with documented returns</p>
              </div>

              {/* E&O Automation */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">1. E&O Certificate of Insurance Automation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Cost</div>
                        <div className="text-lg font-bold">$150/month</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Expected Savings</div>
                        <div className="text-lg font-bold text-green-600">$15,000/year</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">ROI</div>
                        <div className="text-lg font-bold text-green-600">733%</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Priority</div>
                        <div className="text-lg font-bold text-red-600">CRITICAL</div>
                      </div>
                    </div>
                    <p className="text-slate-700">
                      <strong>Impact:</strong> Prevents 40% of E&O claims. Average claim costs $50k-$100k in defense + settlement.
                      Avoiding just ONE claim pays for 28+ years of this system.
                    </p>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <strong className="text-green-900">Recommendation:</strong> Implement immediately. Highest ROI of all investments.
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewal Review Program */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">2. Proactive Renewal Review Program</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Time Investment</div>
                        <div className="text-lg font-bold">15 min/policy</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Retention Improvement</div>
                        <div className="text-lg font-bold text-blue-600">1.5-2%</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Timeline</div>
                        <div className="text-lg font-bold">6 months</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Priority</div>
                        <div className="text-lg font-bold text-yellow-600">HIGH</div>
                      </div>
                    </div>
                    <p className="text-slate-700">
                      <strong>Impact:</strong> Contact clients 30-60 days before renewal. Retention rates improve 1.5-2% within 6 months.
                      Remember: <strong>5% retention improvement can double profits in 5 years</strong>.
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <strong className="text-blue-900">Recommendation:</strong> Start with top 20% of customers, scale program over 6 months.
                    </div>
                  </div>
                </div>
              </div>

              {/* Cross-Sell Program */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">3. Cross-Sell Program (Umbrella & Cyber)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Cost</div>
                        <div className="text-lg font-bold">$500/month</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Umbrella Comm.</div>
                        <div className="text-lg font-bold text-purple-600">15%</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Cyber Comm.</div>
                        <div className="text-lg font-bold text-purple-600">15-25%</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded">
                        <div className="text-sm text-slate-600">Priority</div>
                        <div className="text-lg font-bold text-green-600">STRATEGIC</div>
                      </div>
                    </div>
                    <p className="text-slate-700">
                      <strong>Impact:</strong> Focus on high-margin products. Umbrella policies provide excellent retention benefits.
                      Cyber insurance has growing demand and 15-25% commission rates. <strong>Key: Drives policies per customer to 1.8+ threshold = 95% retention</strong>.
                    </p>
                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                      <strong className="text-purple-900">Recommendation:</strong> Target 15% umbrella attachment rate, 10% cyber for commercial customers.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Tabs.Content>

        </Tabs.Root>
      </main>
    </div>
  );
}

export default AppV3Enhanced;
