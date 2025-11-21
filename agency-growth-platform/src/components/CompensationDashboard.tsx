import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Zap,
  BarChart3,
  Users,
  Shield
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  activeCompensation,
  ACTIVE_YEAR
} from '../config/compensationConfig';
import {
  findCurrentTier,
  findNextTier,
  calculateBonus
} from '../config/compensation2025';

interface CompensationDashboardProps {
  // Current agency metrics
  currentPBR?: number; // Policy Bundle Rate %
  currentPG?: number; // Portfolio Growth items
  writtenPremium?: number; // Monthly written premium
  isElite?: boolean;

  // Projection integration
  onTargetUpdate?: (targets: ProjectionTargets) => void;
}

interface ProjectionTargets {
  pbrTarget: number;
  pgTarget: number;
  monthlyNBTarget: number;
  biggerBundleTarget: number;
}

export default function CompensationDashboard({
  currentPBR = 38.5,
  currentPG = -200,
  writtenPremium = 4072346,
  isElite = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTargetUpdate: _onTargetUpdate
}: CompensationDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tiers' | 'targets' | 'kpis'>('overview');
  const [projectedPBR, setProjectedPBR] = useState(currentPBR);
  const [projectedPG, setProjectedPG] = useState(currentPG);

  const config = activeCompensation;

  // Calculate current and projected bonuses
  const currentBonus = useMemo(() =>
    calculateBonus(writtenPremium, currentPBR, currentPG, config),
    [writtenPremium, currentPBR, currentPG, config]
  );

  const projectedBonus = useMemo(() =>
    calculateBonus(writtenPremium, projectedPBR, projectedPG, config),
    [writtenPremium, projectedPBR, projectedPG, config]
  );

  // Find current tiers
  const currentPBRTier = findCurrentTier(config.agencyBonus.policyBundleRate, currentPBR);
  const currentPGTier = findCurrentTier(config.agencyBonus.portfolioGrowth, currentPG);
  const nextPBRTier = findNextTier(config.agencyBonus.policyBundleRate, currentPBR);
  const nextPGTier = findNextTier(config.agencyBonus.portfolioGrowth, currentPG);

  // Prepare chart data for PBR tiers
  const pbrChartData = config.agencyBonus.policyBundleRate.tiers.map(tier => ({
    name: tier.label,
    bonus: tier.bonusPercent,
    threshold: typeof tier.threshold === 'number' ? tier.threshold : parseFloat(tier.threshold),
    isCurrent: tier.id === currentPBRTier?.id
  }));

  // Prepare chart data for PG tiers
  const pgChartData = config.agencyBonus.portfolioGrowth.tiers.map(tier => ({
    name: tier.label,
    bonus: tier.bonusPercent,
    threshold: typeof tier.threshold === 'number' ? tier.threshold : parseFloat(tier.threshold),
    isCurrent: tier.id === currentPGTier?.id
  }));

  // Calculate gap to next tier
  const pbrGap = nextPBRTier
    ? (typeof nextPBRTier.threshold === 'number' ? nextPBRTier.threshold : parseFloat(nextPBRTier.threshold)) - currentPBR
    : 0;

  const pgGap = nextPGTier
    ? (typeof nextPGTier.threshold === 'number' ? nextPGTier.threshold : parseFloat(nextPGTier.threshold)) - currentPG
    : 0;

  // Monthly targets total
  const totalMonthlyTarget = config.monthlyTargets.reduce((sum, t) => sum + t.target, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            {ACTIVE_YEAR} Compensation Structure
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Version {config.version} • Last updated: {config.lastUpdated}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isElite && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
              <Award className="w-4 h-4" />
              Elite Status
            </span>
          )}
        </div>
      </div>

      {/* Executive Summary & Glossary */}
      <div className="mb-6 space-y-4">
        {/* Key Goal */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" />
            The Goal: Maximize Your Compensation
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Your compensation is driven by two main factors: <strong>Policy Bundle Rate (PBR)</strong> and <strong>Portfolio Growth (PG)</strong>.
            Higher tiers in each = higher bonus percentage applied to your written premium.
            The key strategy is to <strong>bundle every household</strong> (Auto + Home/Condo), <strong>add 3rd lines</strong> (umbrella, renters),
            and <strong>protect bundles at renewal</strong>. Hit your monthly baseline by the 20th, and aim for Elite status for maximum renewal rates.
          </p>
        </div>

        {/* Glossary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            Key Terms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-900">PBR</span>
              <span className="text-gray-600"> - Policy Bundle Rate. % of policies that are bundled (Auto + HO/Condo together).</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">PG</span>
              <span className="text-gray-600"> - Portfolio Growth. Net new items (policies added minus policies lost).</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">NB</span>
              <span className="text-gray-600"> - New Business. First-time policy sales to new customers.</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Baseline</span>
              <span className="text-gray-600"> - Monthly minimum NB items (Auto + HO + Condo) to unlock variable comp.</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Preferred Bundle</span>
              <span className="text-gray-600"> - Household with both Auto AND Home/Condo policies.</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">3rd Line</span>
              <span className="text-gray-600"> - Additional policy beyond Auto + HO (umbrella, renters, toys, etc.).</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Variable Comp</span>
              <span className="text-gray-600"> - Commission percentage on premiums (varies by line and Elite status).</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Elite Status</span>
              <span className="text-gray-600"> - Top agent tier with highest renewal rates (3.5% vs 2.5%).</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Written Premium</span>
              <span className="text-gray-600"> - Total premium dollars written in a period (base for bonus calculation).</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'tiers', label: 'Bonus Tiers', icon: TrendingUp },
          { id: 'targets', label: 'Monthly Targets', icon: Target },
          { id: 'kpis', label: 'KPIs', icon: CheckCircle2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PBR Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Policy Bundle Rate</span>
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">{currentPBR.toFixed(1)}%</div>
              <div className="text-sm text-blue-600 mt-1">
                {currentPBRTier?.label} • {formatPercent(currentPBRTier?.bonusPercent || 0)} bonus
              </div>
              {nextPBRTier && (
                <div className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  {pbrGap.toFixed(1)}% to {nextPBRTier.label}
                </div>
              )}
            </motion.div>

            {/* PG Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Portfolio Growth</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {currentPG >= 0 ? '+' : ''}{currentPG} items
              </div>
              <div className="text-sm text-green-600 mt-1">
                {currentPGTier?.label} • {formatPercent(currentPGTier?.bonusPercent || 0)} bonus
              </div>
              {nextPGTier && (
                <div className="text-xs text-green-500 mt-2 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  {pgGap} items to {nextPGTier.label}
                </div>
              )}
            </motion.div>

            {/* Current Bonus Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Current Bonus</span>
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(currentBonus.totalBonus)}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                PBR: {formatCurrency(currentBonus.pbrBonus)}
              </div>
              <div className="text-xs text-purple-600">
                PG: {formatCurrency(currentBonus.pgBonus)}
              </div>
            </motion.div>

            {/* Written Premium Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Written Premium</span>
                <BarChart3 className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(writtenPremium)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Monthly</div>
            </motion.div>
          </div>

          {/* The Big Five */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              The Big Five for Max Payout
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { num: 1, title: "Hit Monthly Baseline", desc: "By the 20th each month" },
                { num: 2, title: "Preferred Bundle", desc: "Auto + HO every household" },
                { num: 3, title: "Bigger Bundle Bonus", desc: "$50/$25 per 3rd+ line" },
                { num: 4, title: "Maintain Bundles", desc: "Protect at renewal" },
                { num: 5, title: "Achieve Elite", desc: "Higher renewal rates" }
              ].map(item => (
                <div key={item.num} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {item.num}
                    </span>
                    <span className="font-medium text-sm text-gray-900">{item.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NB Variable Comp Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">New Business Variable Compensation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium">Line</th>
                    <th className="text-right p-3 font-medium">NB Rate</th>
                    <th className="text-right p-3 font-medium">Renewal</th>
                    <th className="text-right p-3 font-medium">Elite Renewal</th>
                    <th className="text-left p-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {config.nbVariableComp.map((item, idx) => (
                    <tr key={item.line} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium">{item.line}</td>
                      <td className="p-3 text-right text-green-600 font-semibold">{item.newBusinessRate}%</td>
                      <td className="p-3 text-right">{item.renewalRate}%</td>
                      <td className="p-3 text-right text-yellow-600 font-semibold">{item.renewalRateElite}%</td>
                      <td className="p-3 text-gray-500 text-xs">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tiers Tab */}
      {selectedTab === 'tiers' && (
        <div className="space-y-6">
          {/* PBR Tiers Chart */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Policy Bundle Rate Tiers</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pbrChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1.2]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Bonus']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="bonus" radius={[0, 4, 4, 0]}>
                    {pbrChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCurrent ? '#3b82f6' : '#93c5fd'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {config.agencyBonus.policyBundleRate.tiers.map(tier => (
                <div
                  key={tier.id}
                  className={`p-3 rounded-lg text-sm ${
                    tier.id === currentPBRTier?.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{tier.label}</div>
                  <div className="text-xs text-gray-500">
                    {typeof tier.threshold === 'number' ? `≥${tier.threshold}%` : tier.threshold}
                  </div>
                  <div className="text-lg font-bold text-blue-600">{tier.bonusPercent}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* PG Tiers Chart */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Portfolio Growth Tiers</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pgChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Bonus']}
                  />
                  <ReferenceLine x={0} stroke="#000" />
                  <Bar dataKey="bonus" radius={[0, 4, 4, 0]}>
                    {pgChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCurrent ? '#10b981' : '#6ee7b7'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {config.agencyBonus.portfolioGrowth.tiers.map(tier => (
                <div
                  key={tier.id}
                  className={`p-3 rounded-lg text-sm ${
                    tier.id === currentPGTier?.id
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{tier.label}</div>
                  <div className="text-xs text-gray-500">
                    {typeof tier.threshold === 'number'
                      ? `${tier.threshold >= 0 ? '≥' : ''}${tier.threshold} items`
                      : tier.threshold}
                  </div>
                  <div className="text-lg font-bold text-green-600">{tier.bonusPercent}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus Calculator */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Bonus Projection Calculator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projected PBR (%)
                </label>
                <input
                  type="number"
                  value={projectedPBR}
                  onChange={(e) => setProjectedPBR(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projected PG (items)
                </label>
                <input
                  type="number"
                  value={projectedPG}
                  onChange={(e) => setProjectedPG(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="text-sm text-gray-500">Projected Total Bonus</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(projectedBonus.totalBonus)}
                </div>
                <div className="text-xs text-gray-500">
                  vs Current: {formatCurrency(projectedBonus.totalBonus - currentBonus.totalBonus)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Targets Tab */}
      {selectedTab === 'targets' && (
        <div className="space-y-6">
          {/* Monthly Baseline Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Monthly NB Baseline</h4>
                <p className="text-sm text-blue-700 mt-1">{config.monthlyBaseline.description}</p>
                <p className="text-sm text-blue-600 mt-1">
                  Eligible lines: {config.monthlyBaseline.eligibleLines.join(', ')}
                </p>
                <p className="text-sm text-blue-600">
                  Target date: {config.monthlyBaseline.targetDate}th of each month
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Targets Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Recommended Monthly Targets (Total: {totalMonthlyTarget} items)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium">Line</th>
                    <th className="text-right p-3 font-medium">Monthly Target</th>
                    <th className="text-right p-3 font-medium">Weekly</th>
                    <th className="text-left p-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {config.monthlyTargets.map((target, idx) => (
                    <tr key={target.line} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-medium">{target.line}</td>
                      <td className="p-3 text-right font-bold text-blue-600">{target.target}</td>
                      <td className="p-3 text-right text-gray-600">{(target.target / 4).toFixed(1)}</td>
                      <td className="p-3 text-gray-500 text-xs">{target.role}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-bold">
                    <td className="p-3">Total</td>
                    <td className="p-3 text-right text-blue-600">{totalMonthlyTarget}</td>
                    <td className="p-3 text-right text-blue-600">{(totalMonthlyTarget / 4).toFixed(1)}</td>
                    <td className="p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bigger Bundle Bonus */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Bigger Bundle Bonus
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700">
                  <span className="font-bold text-2xl text-green-600">${config.biggerBundleBonus.amount}</span> per 3rd+ line
                </p>
                <p className="text-xs text-green-600 mt-1">
                  (${config.biggerBundleBonus.amount - 25} if no Auto/HO)
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Starts: {config.biggerBundleBonus.startDate}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 mb-2">Eligible Lines:</p>
                <div className="flex flex-wrap gap-1">
                  {config.biggerBundleBonus.eligibleLines.map(line => (
                    <span
                      key={line}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-green-700 mt-3">
              <strong>Target:</strong> 15-20 Bigger Bundle Bonuses per month = ${15 * config.biggerBundleBonus.amount} - ${20 * config.biggerBundleBonus.amount}
            </p>
          </div>

          {/* Elite Qualification */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Elite Qualification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-2">Criteria:</p>
                <ul className="space-y-1">
                  {config.eliteQualification.criteria.map((criterion, idx) => (
                    <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-2">Benefits:</p>
                <ul className="space-y-1">
                  {config.eliteQualification.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                      <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Tab */}
      {selectedTab === 'kpis' && (
        <div className="space-y-6">
          {/* Daily KPIs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Daily KPIs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {config.kpis.daily.map((kpi, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm">{kpi}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly KPIs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Weekly KPIs (Monday Review)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {config.kpis.weekly.map((kpi, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                  <span className="text-sm">{kpi}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching Focus */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Weekly Coaching Focus
            </h3>
            <ul className="space-y-2">
              {[
                "Are we on NB baseline pace?",
                "How many preferred bundles this week? (Target: 40-50%)",
                "How many 3rd+ line sales? (Target: 4-5/week)",
                "What renewals might break bundles?",
                "Which staff needs script reinforcement?",
                "Pipeline for HO with Auto quotes?"
              ].map((item, idx) => (
                <li key={idx} className="text-sm text-purple-700 flex items-start gap-2">
                  <span className="font-bold">{idx + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Footer with integration info */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            <Info className="w-3 h-3 inline mr-1" />
            Compensation data sourced from Allstate {ACTIVE_YEAR} guidelines
          </span>
          <span>
            To update for {ACTIVE_YEAR + 1}, modify config/compensation{ACTIVE_YEAR + 1}.ts
          </span>
        </div>
      </div>
    </div>
  );
}
