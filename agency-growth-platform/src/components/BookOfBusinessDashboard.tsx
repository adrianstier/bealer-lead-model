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
  ChevronRight
} from 'lucide-react';

// Book of Business Data based on actual analysis
export const bookOfBusinessData = {
  overview: {
    totalPolicies: 498,
    uniqueCustomers: 414,
    totalPremium: 857458.14,
    avgPremiumPerPolicy: 1721.80,
    avgPremiumPerCustomer: 2071.15,
    writtenPremium: 4072346, // From bonus dashboard
    portfolioGrowthRate: 0.2987
  },
  productMix: {
    "Auto": {
      count: 266,
      percentage: 53.4,
      premium: 489608.44,
      icon: Car,
      color: "bg-blue-500"
    },
    "Homeowners": {
      count: 121,
      percentage: 24.3,
      premium: 299190.19,
      icon: Home,
      color: "bg-green-500"
    },
    "Renters": {
      count: 36,
      percentage: 7.2,
      premium: 6306.00,
      icon: Home,
      color: "bg-yellow-500"
    },
    "Condominiums": {
      count: 28,
      percentage: 5.6,
      premium: 20886.68,
      icon: Home,
      color: "bg-purple-500"
    },
    "Landlords": {
      count: 19,
      percentage: 3.8,
      premium: 22796.00,
      icon: Home,
      color: "bg-indigo-500"
    },
    "Personal Umbrella": {
      count: 19,
      percentage: 3.8,
      premium: 14060.71,
      icon: Umbrella,
      color: "bg-cyan-500"
    },
    "Specialty Auto": {
      count: 8,
      percentage: 1.6,
      premium: 4452.12,
      icon: Car,
      color: "bg-orange-500"
    },
    "Boat": {
      count: 1,
      percentage: 0.2,
      premium: 158.00,
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
    ageDistribution: {
      "Under 30": { count: 163, percentage: 57.4 },
      "30-39": { count: 65, percentage: 22.9 },
      "40-49": { count: 36, percentage: 12.7 },
      "50-59": { count: 19, percentage: 6.7 },
      "60+": { count: 1, percentage: 0.4 }
    },
    avgAge: 30.6,
    medianAge: 28.0,
    avgTenure: 6.6
  },
  bundling: {
    singlePolicy: 103,
    twoPolicy: 75,
    threePolicy: 37,
    fourPlus: 18,
    bundleRate: 31.4,
    policiesPerCustomer: 1.20
  },
  crossSellOpportunities: {
    autoOnlyNeedHome: 230,
    homeOnlyNeedAuto: 49,
    needUmbrella: 13,
    rentersToHome: 34,
    totalOpportunities: 326
  },
  customerSegments: {
    entry: { count: 184, percentage: 44.4, label: "Entry (<$1.5K)" },
    standard: { count: 152, percentage: 36.7, label: "Standard ($1.5-3K)" },
    premium: { count: 52, percentage: 12.6, label: "Premium ($3-5K)" },
    highValue: { count: 23, percentage: 5.6, label: "High Value ($5-10K)" },
    elite: { count: 3, percentage: 0.7, label: "Elite ($10K+)" }
  },
  retention: {
    renewalTaken: 245,
    renewalNotTaken: 253,
    renewalRate: 49.2,
    singlePolicyChurnRisk: 103,
    highPremiumIncrease: 309
  },
  marketContext: {
    medianHomeValue: 750000,
    medianHouseholdIncome: 85000,
    premiumCostVsAvg: "+50%",
    competitionLevel: "High",
    totalHouseholds: 170000
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
  const [activeSection, setActiveSection] = useState<'overview' | 'products' | 'crosssell' | 'retention'>('overview');
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
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'products', label: 'Product Mix', icon: Package },
          { id: 'crosssell', label: 'Cross-Sell', icon: Target },
          { id: 'retention', label: 'Retention', icon: RefreshCw }
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
                    max={60}
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

          {/* Product Mix Analysis */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Product Mix Analysis</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900">Core Business</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Auto (53.4%) and Homeowners (24.3%) make up 77.7% of your book,
                  generating ${((489608 + 299190) / 1000).toFixed(0)}K in premium.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-medium text-yellow-900">Growth Opportunity</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Umbrella penetration at 3.8% is below the 40% target attachment rate.
                  This represents significant cross-sell opportunity.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-green-900">Emerging Segments</h4>
                <p className="text-sm text-green-700 mt-1">
                  Renters (7.2%) are prime candidates for home conversion as they become first-time buyers
                  in this high-value market.
                </p>
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
                <p className="text-sm text-green-700">Based on current book analysis</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">$36,000 - $63,000</p>
                <p className="text-sm text-green-600">Potential Annual Revenue</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">{data.crossSellOpportunities.totalOpportunities}</p>
                <p className="text-xs text-green-700">Total Opportunities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">100-350</p>
                <p className="text-xs text-green-700">Expected Conversions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">15-25%</p>
                <p className="text-xs text-green-700">Avg Conversion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">$1,200</p>
                <p className="text-xs text-green-700">Avg Additional Premium</p>
              </div>
            </div>
          </div>

          {/* Opportunity Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <OpportunityCard
              title="Auto-Only → Add Home"
              count={data.crossSellOpportunities.autoOnlyNeedHome}
              action="Bundle with homeowners insurance"
              potentialPremium={276000}
              conversionRate="15-25%"
              priority="high"
            />
            <OpportunityCard
              title="Home-Only → Add Auto"
              count={data.crossSellOpportunities.homeOnlyNeedAuto}
              action="Bundle with auto insurance"
              potentialPremium={68600}
              conversionRate="20-30%"
              priority="high"
            />
            <OpportunityCard
              title="Bundled → Add Umbrella"
              count={data.crossSellOpportunities.needUmbrella}
              action="Add personal umbrella coverage"
              potentialPremium={3250}
              conversionRate="25-40%"
              priority="medium"
            />
            <OpportunityCard
              title="Renters → First Home"
              count={data.crossSellOpportunities.rentersToHome}
              action="Future homeowner conversion"
              potentialPremium={40800}
              conversionRate="10-15%"
              priority="low"
            />
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
                  <h4 className="font-medium text-gray-900">High Priority: Auto-Only Customers (230)</h4>
                  <p className="text-sm text-gray-600">Contact for home insurance quote. Santa Barbara's high home values mean higher premiums and commissions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h4 className="font-medium text-gray-900">Medium Priority: Home-Only Customers (49)</h4>
                  <p className="text-sm text-gray-600">Cross-sell auto policies. These customers are already loyal and have higher conversion rates.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h4 className="font-medium text-gray-900">Protect & Grow: Bundled Customers (13)</h4>
                  <p className="text-sm text-gray-600">Add umbrella coverage to maximize retention (95%+) and lifetime value.</p>
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
          <div className="grid md:grid-cols-3 gap-4">
            <MetricCard
              title="Current Renewal Rate"
              value={`${data.retention.renewalRate}%`}
              subtitle="Below 85% target"
              icon={RefreshCw}
              trend="down"
              trendValue="-35.8%"
            />
            <MetricCard
              title="High Churn Risk"
              value={data.retention.singlePolicyChurnRisk}
              subtitle="Single policy customers"
              icon={AlertTriangle}
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
                  <li>• Contact 103 single-policy customers for bundle offers</li>
                  <li>• Review 309 policies with premium increases &gt;10%</li>
                  <li>• Implement proactive renewal outreach program</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900">Best Practices</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Call customers 45 days before renewal</li>
                  <li>• Offer multi-policy discount to single-line</li>
                  <li>• Review coverage annually for life changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookOfBusinessDashboard;
