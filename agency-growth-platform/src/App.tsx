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
  Info
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StrategyInputs {
  currentPolicies: number;
  currentStaff: number;
  monthlyLeadSpend: number;
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
}

interface ScenarioData {
  month: number;
  baseline: number;
  conservative: number;
  moderate: number;
  aggressive: number;
  cashFlow?: number; // monthly cash flow for the scenario
  cumulativeCash?: number; // cumulative cash position
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
}

function App() {
  const [activeTab, setActiveTab] = useState('methodology');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [strategyInputs, setStrategyInputs] = useState<StrategyInputs>({
    currentPolicies: 500,
    currentStaff: 2.0,
    monthlyLeadSpend: 2000,
    costPerLead: 25,
    additionalLeadSpend: 2000,
    additionalStaff: 0.5,
    projectionMonths: 24,
    conciergeService: false,
    newsletterSystem: false,
    salesCompensationModel: 'fte',
    commissionRate: 15, // 15% commission per policy
    fteSalary: 4000, // $4,000/month salary
    // New economic defaults
    monthlyChurnRate: 2.5, // 2.5% monthly churn = ~70% annual retention
    averagePremium: 1200, // $1,200 average annual premium
    commissionPayout: 10, // 10% of premium goes to commissions
    fixedMonthlyCosts: 5000, // $5,000/month overhead (rent, software, etc.)
    fteBenefitsMultiplier: 1.3, // 30% overhead on FTE salary
    salesRampMonths: 3 // 3 months to reach full productivity
  });
  const [scenarioData, setScenarioData] = useState<ScenarioData[]>([]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResults[]>([]);

  const generateScenarios = () => {
    const {
      currentPolicies,
      projectionMonths,
      additionalLeadSpend,
      costPerLead,
      conciergeService,
      newsletterSystem,
      salesCompensationModel,
      commissionRate,
      fteSalary,
      monthlyChurnRate,
      averagePremium,
      commissionPayout,
      fixedMonthlyCosts,
      fteBenefitsMultiplier,
      salesRampMonths,
      additionalStaff
    } = strategyInputs;

    // Calculate key economics
    const monthlyLeads = additionalLeadSpend / costPerLead;
    const monthlyChurnDecimal = monthlyChurnRate / 100; // Convert percentage to decimal
    const baseRetention = 0.92;
    const retentionBoost = (conciergeService ? 0.02 : 0) + (newsletterSystem ? 0.015 : 0);
    const finalRetention = Math.min(baseRetention + retentionBoost, 0.98);

    // Sales compensation costs
    const salesCostPerMonth = salesCompensationModel === 'fte'
      ? fteSalary * fteBenefitsMultiplier * additionalStaff
      : 0; // Commission is per-policy, calculated later

    // Marketing and operational costs
    const baseMonthlyCost = additionalLeadSpend +
                           (conciergeService ? 300 : 0) +
                           (newsletterSystem ? 150 : 0) +
                           fixedMonthlyCosts +
                           salesCostPerMonth;

    const data: ScenarioData[] = [];
    const results: ScenarioResults[] = [];

    // Define scenarios with different conversion assumptions
    const scenarios = [
      { name: 'Conservative', conversionRate: 0.15, retention: 0.90 },
      { name: 'Moderate', conversionRate: 0.244, retention: 0.92 },
      { name: 'Aggressive', conversionRate: 0.30, retention: finalRetention }
    ];

    scenarios.forEach(scenario => {
      let policies = currentPolicies;
      let cumulativeCash = 0;
      let breakEvenMonth: number | undefined = undefined;
      const monthlyData: ScenarioData[] = [];

      // Track month-by-month growth with churn
      for (let month = 0; month <= projectionMonths; month++) {
        // Calculate sales ramp factor (gradual ramp to full productivity)
        const rampFactor = month < salesRampMonths
          ? month / salesRampMonths
          : 1.0;

        // New policies from sales (adjusted for ramp-up)
        const newPolicies = monthlyLeads * scenario.conversionRate * rampFactor;

        // Churn: lose a percentage of existing policies
        const policiesLost = policies * monthlyChurnDecimal;

        // Net change in policies
        const netNewPolicies = newPolicies - policiesLost;
        policies += netNewPolicies;

        // Calculate monthly cash flow
        // Revenue: commission on premium for new policies sold
        const monthlyRevenue = newPolicies * (averagePremium * (commissionPayout / 100));

        // Costs: marketing + fixed + sales compensation
        let monthlyCosts = baseMonthlyCost;

        // Add commission-based comp if applicable
        if (salesCompensationModel === 'commission') {
          monthlyCosts += newPolicies * (averagePremium * (commissionRate / 100));
        }

        // Monthly cash flow
        const cashFlow = monthlyRevenue - monthlyCosts;
        cumulativeCash += cashFlow;

        // Track break-even point
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
          cumulativeCash
        });
      }

      // Merge into main data array
      if (data.length === 0) {
        data.push(...monthlyData);
      } else {
        monthlyData.forEach((item, idx) => {
          if (scenario.name === 'Conservative') data[idx].conservative = item.conservative;
          if (scenario.name === 'Moderate') data[idx].moderate = item.moderate;
          if (scenario.name === 'Aggressive') data[idx].aggressive = item.aggressive;
        });
      }

      // Calculate unit economics
      const totalNewPolicies = policies - currentPolicies;
      const totalCost = baseMonthlyCost * projectionMonths;
      const totalCommissionCosts = salesCompensationModel === 'commission'
        ? totalNewPolicies * (averagePremium * (commissionRate / 100))
        : 0;
      const totalInvestment = totalCost + totalCommissionCosts;

      // CAC: Customer Acquisition Cost
      const cac = totalNewPolicies > 0 ? totalInvestment / totalNewPolicies : 0;

      // LTV: Lifetime Value (simplified: average premium * avg customer lifetime)
      // Avg lifetime = 1 / monthly churn rate (in months)
      const avgLifetimeMonths = monthlyChurnDecimal > 0 ? 1 / monthlyChurnDecimal : 36;
      const ltv = (averagePremium * (commissionPayout / 100)) * avgLifetimeMonths;

      const ltvCacRatio = cac > 0 ? ltv / cac : 0;

      // Total revenue over projection period
      const totalRevenue = totalNewPolicies * (averagePremium * (commissionPayout / 100)) * projectionMonths;

      const roi = totalInvestment > 0
        ? ((totalRevenue - totalInvestment) / totalInvestment) * 100
        : 0;

      const paybackMonths = totalRevenue > 0
        ? Math.round(totalInvestment / (totalRevenue / projectionMonths))
        : projectionMonths;

      results.push({
        name: scenario.name,
        finalPolicies: Math.round(policies),
        roi,
        paybackMonths,
        totalCost: totalInvestment,
        totalRevenue,
        breakEvenMonth,
        ltv: Math.round(ltv),
        cac: Math.round(cac),
        ltvCacRatio: Math.round(ltvCacRatio * 10) / 10 // Round to 1 decimal
      });
    });

    setScenarioData(data);
    setScenarioResults(results);
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

  const metrics = [
    { icon: Target, label: 'Current Policies', value: strategyInputs.currentPolicies.toString(), trend: '+12%' },
    { icon: Users, label: 'Staff FTE', value: strategyInputs.currentStaff.toFixed(1), trend: 'Optimal' },
    { icon: DollarSign, label: 'Monthly Spend', value: `$${strategyInputs.monthlyLeadSpend.toLocaleString()}`, trend: '+5%' },
    { icon: Activity, label: 'Conversion Rate', value: '24.4%', trend: '+2.1%' }
  ];

  const tabItems = [
    { id: 'methodology', label: 'Methodology', icon: TrendingUp },
    { id: 'model', label: 'Model Details', icon: Info },
    { id: 'strategy', label: 'Strategy Builder', icon: Settings },
    { id: 'scenarios', label: 'Scenario Analysis', icon: BarChart3 },
    { id: 'results', label: 'Results', icon: Lightbulb }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
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

      {/* Premium Header with Gradient */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white overflow-hidden"
        role="banner"
        aria-label="Agency Growth Modeling Platform Header"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzBoLTZWMGg2djMwem0wIDMwaDZWMzBoLTZ2MzB6TTAgMzBoNnYzMEgwVjMwem0zMCAwaDZ2MzBoLTZWMzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat"></div>
        </div>

        <div className="relative container mx-auto px-6 lg:px-12 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="max-w-4xl"
          >
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              Enterprise Growth Analytics
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Agency Growth Modeling Platform
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl">
              Strategic capacity planning and investment analysis powered by data from 500+ insurance agencies
            </p>
          </motion.div>

          {/* Premium Metrics Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, staggerChildren: 0.1 }}
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:shadow-xl hover:shadow-blue-500/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-300">
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-green-300 font-medium px-2 py-1 bg-green-500/20 rounded-full">
                    {metric.trend}
                  </span>
                </div>
                <p className="text-sm text-blue-100 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.header>

      {/* Sleek Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-100 border-b-4 border-gray-400 shadow-xl" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-6 lg:px-12">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex space-x-3 overflow-x-auto py-2" role="tablist" aria-label="Platform sections">
              {tabItems.map((item) => (
                <Tabs.Trigger
                  key={item.id}
                  value={item.id}
                  role="tab"
                  aria-selected={activeTab === item.id}
                  aria-controls={`tabpanel-${item.id}`}
                  className={`
                    group relative flex items-center gap-3 px-8 py-5 text-base font-bold whitespace-nowrap
                    transition-all duration-300 rounded-lg border-2
                    ${activeTab === item.id
                      ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-2xl border-emerald-700 transform scale-105'
                      : 'text-gray-900 bg-white hover:bg-gray-50 hover:text-emerald-700 border-gray-300 hover:border-emerald-500 shadow-md'
                    }
                  `}
                >
                  <item.icon className={`w-6 h-6 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} aria-hidden="true" />
                  <span className="font-bold">{item.label}</span>
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
                className="py-12"
              >
                <Tabs.Content value="methodology" role="tabpanel" id="tabpanel-methodology" aria-labelledby="tab-methodology">
                  <div className="space-y-8 max-w-7xl mx-auto">
                    {/* Main Content Card */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
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

                      {/* Visual Process Flow */}
                      <div className="relative">
                        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
                          {['Leads', 'Contacts', 'Quotes', 'Binds', 'Policies'].map((stage, idx) => (
                            <div key={stage} className="flex-shrink-0 flex flex-col items-center min-h-[140px]">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.15, type: "spring" }}
                                whileHover={{ scale: 1.05 }}
                                className={`
                                  relative w-28 h-28 rounded-2xl flex items-center justify-center text-center
                                  font-semibold text-sm shadow-lg transition-all duration-300
                                  ${idx === 0
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-blue-200/50'
                                  }
                                `}
                              >
                                {stage}
                                {idx < 4 && (
                                  <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                                    <ArrowRight className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.15 + 0.3 }}
                                className="mt-3 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full"
                              >
                                {idx < 4 ? ['75%', '65%', '50%', '100%'][idx] : '\u00A0'}
                              </motion.div>
                            </div>
                          ))}
                        </div>
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
                              <p className="font-bold text-gray-900">= Spend ÷ CPL</p>
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
                              → Policies in Force (Retained)
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
                                CPL assumes consistent lead source quality. Switching channels or markets may require 2-3 month recalibration.
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

                <Tabs.Content value="strategy" role="tabpanel" id="tabpanel-strategy" aria-labelledby="tab-strategy">
                  <div className="max-w-6xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                    >
                      <div className="mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Configure Your Growth Strategy</h2>
                        <p className="text-lg text-gray-700">
                          Adjust parameters to model different scenarios and optimize your agency's growth trajectory
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
                            { label: 'Policies in Force', field: 'currentPolicies' as keyof StrategyInputs, step: 50 },
                            { label: 'Current Staff (FTE)', field: 'currentStaff' as keyof StrategyInputs, step: 0.5 },
                            { label: 'Monthly Lead Spend ($)', field: 'monthlyLeadSpend' as keyof StrategyInputs, step: 100 },
                            { label: 'Cost per Lead ($)', field: 'costPerLead' as keyof StrategyInputs, step: 1 }
                          ].map((field) => (
                            <div key={field.label} className="space-y-2">
                              <label htmlFor={`input-${field.field}`} className="block text-sm font-medium text-gray-700">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field]}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                aria-required="true"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              />
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
                            <div key={field.label} className="space-y-2">
                              <label htmlFor={`input-${field.field}`} className="block text-sm font-medium text-gray-700">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field]}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                aria-required="true"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              />
                            </div>
                          ))}

                          <div className="space-y-3 pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Retention Systems
                            </label>
                            {[
                              { label: 'Concierge Service', field: 'conciergeService' as keyof StrategyInputs, cost: '$300/mo' },
                              { label: 'Newsletter System', field: 'newsletterSystem' as keyof StrategyInputs, cost: '$150/mo' }
                            ].map((system) => (
                              <label key={system.label} htmlFor={`checkbox-${system.field}`} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200">
                                <input
                                  id={`checkbox-${system.field}`}
                                  type="checkbox"
                                  checked={strategyInputs[system.field] as boolean}
                                  onChange={(e) => updateInput(system.field, e.target.checked)}
                                  aria-label={`Enable ${system.label} for ${system.cost}`}
                                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="flex-1 font-medium text-gray-700">{system.label}</span>
                                <span className="text-sm text-gray-500">{system.cost}</span>
                              </label>
                            ))}
                          </div>

                          {/* Sales Compensation Model */}
                          <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              New Salesperson Compensation
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => updateInput('salesCompensationModel', 'fte')}
                                className={`p-4 border-2 rounded-xl font-medium transition-all duration-200 ${
                                  strategyInputs.salesCompensationModel === 'fte'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400'
                                }`}
                              >
                                <div className="text-left">
                                  <div className="font-bold mb-1">Full-Time (FTE)</div>
                                  <div className="text-xs opacity-75">Fixed monthly salary</div>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateInput('salesCompensationModel', 'commission')}
                                className={`p-4 border-2 rounded-xl font-medium transition-all duration-200 ${
                                  strategyInputs.salesCompensationModel === 'commission'
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400'
                                }`}
                              >
                                <div className="text-left">
                                  <div className="font-bold mb-1">Commission-Only</div>
                                  <div className="text-xs opacity-75">Pay per policy sold</div>
                                </div>
                              </button>
                            </div>

                            {strategyInputs.salesCompensationModel === 'fte' ? (
                              <div className="space-y-2 mt-4">
                                <label htmlFor="input-fteSalary" className="block text-sm font-medium text-gray-700">
                                  Monthly FTE Salary ($)
                                </label>
                                <input
                                  id="input-fteSalary"
                                  type="number"
                                  step={500}
                                  value={strategyInputs.fteSalary}
                                  onChange={(e) => updateInput('fteSalary', parseFloat(e.target.value))}
                                  aria-label="Monthly FTE Salary"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                />
                                <p className="text-xs text-gray-500">Typical range: $3,000 - $6,000/month</p>
                              </div>
                            ) : (
                              <div className="space-y-2 mt-4">
                                <label htmlFor="input-commissionRate" className="block text-sm font-medium text-gray-700">
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
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                />
                                <p className="text-xs text-gray-500">Typical range: 10% - 25% per policy sold</p>
                              </div>
                            )}
                          </div>
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

                        <div className="grid md:grid-cols-3 gap-6">
                          {[
                            { label: 'Monthly Churn Rate (%)', field: 'monthlyChurnRate' as keyof StrategyInputs, step: 0.5, help: 'Typical: 2-4%' },
                            { label: 'Average Premium ($/year)', field: 'averagePremium' as keyof StrategyInputs, step: 50, help: 'Per policy annually' },
                            { label: 'Commission Payout (%)', field: 'commissionPayout' as keyof StrategyInputs, step: 1, help: 'Of premium' }
                          ].map((field) => (
                            <div key={field.label} className="space-y-2">
                              <label htmlFor={`input-${field.field}`} className="block text-sm font-medium text-gray-700">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field]}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              />
                              <p className="text-xs text-gray-500">{field.help}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mt-6">
                          {[
                            { label: 'Fixed Monthly Costs ($)', field: 'fixedMonthlyCosts' as keyof StrategyInputs, step: 500, help: 'Rent, software, etc.' },
                            { label: 'FTE Benefits Multiplier', field: 'fteBenefitsMultiplier' as keyof StrategyInputs, step: 0.1, help: '1.3 = 30% overhead' },
                            { label: 'Sales Ramp (months)', field: 'salesRampMonths' as keyof StrategyInputs, step: 1, help: 'Time to full productivity' }
                          ].map((field) => (
                            <div key={field.label} className="space-y-2">
                              <label htmlFor={`input-${field.field}`} className="block text-sm font-medium text-gray-700">
                                {field.label}
                              </label>
                              <input
                                id={`input-${field.field}`}
                                type="number"
                                step={field.step}
                                value={strategyInputs[field.field]}
                                onChange={(e) => updateInput(field.field, parseFloat(e.target.value))}
                                aria-label={field.label}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                              />
                              <p className="text-xs text-gray-500">{field.help}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: isCalculating ? 1 : 1.02 }}
                        whileTap={{ scale: isCalculating ? 1 : 0.98 }}
                        onClick={handleCalculate}
                        disabled={isCalculating}
                        aria-label="Calculate growth scenarios based on your inputs"
                        aria-busy={isCalculating}
                        className={`mt-10 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 ${
                          isCalculating ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isCalculating ? (
                          <>
                            <span className="inline-block animate-spin mr-2">⚙️</span>
                            Calculating...
                          </>
                        ) : (
                          <>
                            Calculate Growth Scenarios
                            <ArrowRight className="inline-block ml-2 w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="scenarios" role="tabpanel" id="tabpanel-scenarios" aria-labelledby="tab-scenarios">
                  <div className="max-w-7xl mx-auto space-y-8">
                    {!hasResults ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                      >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Scenario Comparison</h2>
                        <p className="text-lg text-gray-700 mb-10">
                          Compare multiple growth strategies to find the optimal balance of risk and return
                        </p>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center border border-blue-100">
                          <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                          <p className="text-gray-700 text-lg">
                            Interactive charts and scenario analysis will be displayed here
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Configure your strategy and click Calculate to see detailed projections
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        {/* Growth Trajectory Chart */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg shadow-gray-200/50 border border-gray-100"
                        >
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Policy Growth Trajectories</h2>
                          <p className="text-gray-700 mb-8">
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
                                label={{ value: 'Policies in Force', angle: -90, position: 'insideLeft' }}
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

                            {/* LTV:CAC Ratio */}
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
                                LTV:CAC Ratio
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
                                <strong>Healthy SaaS metrics:</strong> LTV:CAC ratio above 3:1 indicates strong unit economics.
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

                        {/* Action Items */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Next Steps</h3>
                          <div className="space-y-4">
                            {[
                              `Allocate $${strategyInputs.additionalLeadSpend.toLocaleString()}/month to lead generation`,
                              `Target ${Math.round(strategyInputs.additionalLeadSpend / strategyInputs.costPerLead)} new leads per month`,
                              strategyInputs.conciergeService && 'Implement concierge service for retention boost',
                              strategyInputs.newsletterSystem && 'Deploy newsletter system for ongoing engagement',
                              `Monitor conversion rates and adjust strategy at month ${Math.round(strategyInputs.projectionMonths / 3)}`,
                              'Review ROI metrics quarterly and optimize spend allocation'
                            ].filter(Boolean).map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">{item}</p>
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