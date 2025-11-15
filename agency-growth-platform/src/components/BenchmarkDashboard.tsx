/**
 * Benchmark Dashboard Component
 * Displays industry benchmarks and compares agency performance
 */

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface BenchmarkMetric {
  name: string;
  value: number;
  unit: string;
  target: { min: number; max: number };
  status: 'excellent' | 'good' | 'warning' | 'critical';
  benchmark: string;
}

interface BenchmarkDashboardProps {
  // Financial Performance
  annualRevenue: number;
  ebitdaMargin: number;
  organicGrowthPercent: number;

  // Unit Economics
  ltv: number;
  cac: number;
  ltvCacRatio: number;

  // Operational Metrics
  marketingSpendPercent: number;
  technologySpendPercent: number;
  revenuePerEmployee: number;
  compensationRatioPercent: number;

  // Retention & Bundling
  retentionRate: number;
  policiesPerCustomer: number;

  // Staffing
  producerToServiceRatio: number;
  totalFTE: number;

  // Growth Stage
  growthStage: 'mature' | 'growth';
}

export function BenchmarkDashboard(props: BenchmarkDashboardProps) {

  // Calculate Rule of 20
  const ruleOf20Score = props.organicGrowthPercent + (0.5 * props.ebitdaMargin * 100);

  // Evaluate metrics against benchmarks
  const metrics: BenchmarkMetric[] = [
    {
      name: 'EBITDA Margin',
      value: props.ebitdaMargin * 100,
      unit: '%',
      target: { min: 25, max: 30 },
      status: props.ebitdaMargin >= 0.30 ? 'excellent' :
              props.ebitdaMargin >= 0.25 ? 'good' :
              props.ebitdaMargin >= 0.20 ? 'warning' : 'critical',
      benchmark: '25-30% for $1-5M agencies'
    },
    {
      name: 'LTV:CAC Ratio',
      value: props.ltvCacRatio,
      unit: ':1',
      target: { min: 3, max: 5 },
      status: props.ltvCacRatio >= 5 ? 'warning' :  // Over-invested
              props.ltvCacRatio >= 4 ? 'excellent' :
              props.ltvCacRatio >= 3 ? 'good' : 'critical',
      benchmark: '3:1 good, 4:1 great'
    },
    {
      name: 'Revenue Per Employee',
      value: props.revenuePerEmployee,
      unit: '$',
      target: { min: 150000, max: 300000 },
      status: props.revenuePerEmployee >= 300000 ? 'excellent' :
              props.revenuePerEmployee >= 200000 ? 'good' :
              props.revenuePerEmployee >= 150000 ? 'warning' : 'critical',
      benchmark: '$150k-$200k target, $300k+ excellent'
    },
    {
      name: 'Marketing Spend',
      value: props.marketingSpendPercent,
      unit: '%',
      target: props.growthStage === 'mature' ? { min: 3, max: 7 } : { min: 10, max: 25 },
      status: (() => {
        const { min, max } = props.growthStage === 'mature' ? { min: 3, max: 7 } : { min: 10, max: 25 };
        if (props.marketingSpendPercent < min) return 'warning';
        if (props.marketingSpendPercent > max) return 'warning';
        return 'good';
      })(),
      benchmark: props.growthStage === 'mature' ? '3-7% for mature' : '10-25% for growth'
    },
    {
      name: 'Technology Investment',
      value: props.technologySpendPercent,
      unit: '%',
      target: { min: 2.5, max: 3.5 },
      status: props.technologySpendPercent < 2.5 ? 'warning' :
              props.technologySpendPercent > 3.5 ? 'warning' : 'good',
      benchmark: '2.5-3.5% of revenue'
    },
    {
      name: 'Policies Per Customer',
      value: props.policiesPerCustomer,
      unit: '',
      target: { min: 1.8, max: 3.0 },
      status: props.policiesPerCustomer >= 1.8 ? 'excellent' :
              props.policiesPerCustomer >= 1.5 ? 'good' :
              props.policiesPerCustomer >= 1.2 ? 'warning' : 'critical',
      benchmark: '1.8+ = 95% retention (critical threshold)'
    },
    {
      name: 'Retention Rate',
      value: props.retentionRate * 100,
      unit: '%',
      target: { min: 85, max: 95 },
      status: props.retentionRate >= 0.95 ? 'excellent' :
              props.retentionRate >= 0.91 ? 'good' :
              props.retentionRate >= 0.85 ? 'warning' : 'critical',
      benchmark: '85% base, 91% bundled, 95% optimal'
    },
    {
      name: 'Service:Producer Ratio',
      value: props.producerToServiceRatio,
      unit: ':1',
      target: { min: 2.5, max: 3.0 },
      status: Math.abs(props.producerToServiceRatio - 2.8) <= 0.3 ? 'excellent' :
              Math.abs(props.producerToServiceRatio - 2.8) <= 0.5 ? 'good' : 'warning',
      benchmark: '2.8 service staff per producer (optimal)'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5" />;
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getRuleOf20Status = () => {
    if (ruleOf20Score >= 25) return { status: 'excellent', label: 'Top Performer', color: 'green' };
    if (ruleOf20Score >= 20) return { status: 'good', label: 'Healthy Agency', color: 'blue' };
    if (ruleOf20Score >= 15) return { status: 'warning', label: 'Needs Improvement', color: 'yellow' };
    return { status: 'critical', label: 'Critical', color: 'red' };
  };

  const rule20Status = getRuleOf20Status();

  return (
    <div className="space-y-6">

      {/* Rule of 20 Highlight */}
      <div className={`p-6 rounded-lg border-2 ${
        rule20Status.color === 'green' ? 'bg-green-50 border-green-200' :
        rule20Status.color === 'blue' ? 'bg-blue-50 border-blue-200' :
        rule20Status.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Rule of 20 Score</h3>
            <p className="text-sm text-gray-600">
              Organic Growth % + (50% × EBITDA %) = {ruleOf20Score.toFixed(1)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{ruleOf20Score.toFixed(1)}</div>
            <div className={`text-sm font-medium ${
              rule20Status.color === 'green' ? 'text-green-600' :
              rule20Status.color === 'blue' ? 'text-blue-600' :
              rule20Status.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {rule20Status.label}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm">
          <div className="font-medium">Target: 20+ (Healthy) | 25+ (Top Performer)</div>
          <div className="text-gray-600">
            Current: {props.organicGrowthPercent.toFixed(1)}% growth + (50% × {(props.ebitdaMargin * 100).toFixed(1)}% EBITDA)
          </div>
        </div>
      </div>

      {/* Benchmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(metric.status)}
                  <h4 className="font-semibold">{metric.name}</h4>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {metric.unit === '$' ? '$' : ''}
                  {metric.value.toLocaleString(undefined, { maximumFractionDigits: metric.unit === '$' ? 0 : 1 })}
                  {metric.unit !== '$' ? metric.unit : ''}
                </div>
                <div className="text-xs mb-2">
                  Target: {metric.unit === '$' ? '$' : ''}{metric.target.min.toLocaleString()}-{metric.target.max.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                </div>
                <div className="text-xs opacity-75">
                  {metric.benchmark}
                </div>
              </div>
              <div className="text-right">
                {metric.value >= metric.target.min && metric.value <= metric.target.max ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Key Insights
        </h4>
        <ul className="space-y-1 text-sm">
          {props.policiesPerCustomer >= 1.8 && (
            <li className="text-green-700">
              ✓ Exceeding 1.8 policies per customer - unlocking 95% retention rate
            </li>
          )}
          {props.policiesPerCustomer < 1.8 && (
            <li className="text-yellow-700">
              ⚠ Below 1.8 policies per customer threshold - focus on bundling to improve retention
            </li>
          )}
          {props.ltvCacRatio >= 4 && props.ltvCacRatio < 5 && (
            <li className="text-green-700">
              ✓ Excellent LTV:CAC ratio - strong unit economics
            </li>
          )}
          {props.ltvCacRatio >= 5 && (
            <li className="text-yellow-700">
              ⚠ Very high LTV:CAC may indicate under-investment in growth
            </li>
          )}
          {props.ebitdaMargin >= 0.25 && (
            <li className="text-green-700">
              ✓ EBITDA margins within or exceeding industry benchmark
            </li>
          )}
          {props.ebitdaMargin < 0.20 && (
            <li className="text-red-700">
              ⚠ EBITDA margins below 20% - review cost structure
            </li>
          )}
          {Math.abs(props.producerToServiceRatio - 2.8) <= 0.3 && (
            <li className="text-green-700">
              ✓ Staffing ratio near optimal 2.8:1 service-to-producer benchmark
            </li>
          )}
        </ul>
      </div>

      {/* High-ROI Investment Recommendations */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold mb-3">High-ROI Investment Opportunities</h4>
        <div className="space-y-3 text-sm">
          <div className="bg-white p-3 rounded border border-purple-100">
            <div className="font-medium">1. E&O Certificate Automation</div>
            <div className="text-gray-600 mt-1">
              Cost: $150/month | Prevents 40% of E&O claims (~$50k-$100k savings per claim avoided)
            </div>
            <div className="text-purple-600 font-medium mt-1">ROI: 700%+ (Highest impact)</div>
          </div>
          <div className="bg-white p-3 rounded border border-purple-100">
            <div className="font-medium">2. Proactive Renewal Review Program</div>
            <div className="text-gray-600 mt-1">
              Contact clients 30-60 days before renewal | Improves retention 1.5-2% within 6 months
            </div>
            <div className="text-purple-600 font-medium mt-1">
              5% retention improvement can double profits in 5 years
            </div>
          </div>
          <div className="bg-white p-3 rounded border border-purple-100">
            <div className="font-medium">3. Cross-Sell Umbrella & Cyber Policies</div>
            <div className="text-gray-600 mt-1">
              15-25% commission rates | Significant retention benefits | High margins
            </div>
            <div className="text-purple-600 font-medium mt-1">
              Drives policies per customer above 1.8 threshold
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
