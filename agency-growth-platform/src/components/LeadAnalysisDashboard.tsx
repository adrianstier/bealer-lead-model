import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Phone, Target, AlertTriangle, CheckCircle, Info, Lightbulb, Database, Code, FileText, Download } from 'lucide-react';
import { generateLeadAnalysisPDF } from '../utils/generateLeadAnalysisPDF';
import { generateDataDocumentationPDF } from '../utils/generateDataDocumentationPDF';

interface LeadAnalysisData {
  summary: {
    total_records: number;
    date_range: { start: string; end: string };
    overall_sale_rate: number;
    overall_contact_rate: number;
    overall_quote_rate: number;
    generated_at: string;
  };
  vendors: Array<{
    vendor: string;
    total_leads: number;
    sales: number;
    sale_rate: number;
    hot_prospects: number;
    hot_rate: number;
    quoted: number;
    quote_rate: number;
    contacted: number;
    contact_rate: number;
    avg_call_duration: number;
  }>;
  agents: Array<{
    agent: string;
    total_calls: number;
    sales: number;
    sale_rate: number;
    hot_prospects: number;
    hot_rate: number;
    quoted: number;
    quote_rate: number;
    contacted: number;
    contact_rate: number;
    avg_call_duration: number;
    total_talk_hours: number;
  }>;
  timing: {
    hourly: Array<{
      hour: number;
      total_calls: number;
      sales: number;
      sale_rate: number;
      hot_rate: number;
      contact_rate: number;
    }>;
    daily: Array<{
      day: string;
      total_calls: number;
      sales: number;
      sale_rate: number;
      hot_rate: number;
      contact_rate: number;
    }>;
  };
  call_types: Array<{
    call_type: string;
    total_calls: number;
    sales: number;
    sale_rate: number;
    hot_prospects: number;
    hot_rate: number;
    quoted: number;
    quote_rate: number;
    contacted: number;
    contact_rate: number;
    avg_call_duration: number;
  }>;
  funnel: {
    total_leads: number;
    contacted: number;
    contacted_rate: number;
    quoted: number;
    quoted_rate: number;
    quoted_of_contacted: number;
    hot_prospects: number;
    hot_rate: number;
    hot_of_quoted: number;
    sold: number;
    sold_rate: number;
    sold_of_hot: number;
  };
  outcomes: Array<{
    outcome: string;
    count: number;
    percentage: number;
  }>;
  recommendations: Array<{
    category: string;
    priority: string;
    action: string;
    reason: string;
    impact: string;
  }>;
  diagnostics?: {
    lead_quality: {
      overall: {
        total_leads: number;
        unreachable_rate: number;
        bad_phone_rate: number;
        never_requested_rate: number;
        not_interested_rate: number;
        bad_lead_rate: number;
      };
      by_vendor: Array<{
        vendor: string;
        total_leads: number;
        bad_phone_rate: number;
        no_contact_rate: number;
        never_requested_rate: number;
        bad_lead_rate: number;
        not_interested_rate: number;
        total_issue_rate: number;
      }>;
    };
    roi_metrics: {
      vendor_costs: Record<string, number>;
      avg_cpl: number;
      total_spend: number;
      assumed_avg_premium: number;
      by_vendor: Array<{
        vendor: string;
        total_leads: number;
        total_spend: number;
        sales: number;
        cpl: number;
        cpq: number | null;
        cpb: number | null;
        leads_per_sale: number | null;
        estimated_revenue: number;
        roi_percent: number;
      }>;
    };
    funnel_bottlenecks: {
      loss_reasons: {
        before_contact: {
          total_lost: number;
          percentage: number;
          breakdown: Record<string, number>;
        };
        after_contact: {
          total_lost: number;
          percentage: number;
          breakdown: Record<string, number>;
        };
        after_quote: {
          total_lost: number;
          percentage: number;
          breakdown: Record<string, number>;
        };
      };
      conversion_rates: {
        lead_to_contact: number;
        contact_to_quote: number;
        quote_to_hot: number;
        hot_to_sale: number;
        overall_conversion: number;
      };
    };
    call_attempts: {
      average_attempts: number;
      max_attempts: number;
      single_attempt_leads: number;
      multiple_attempt_leads: number;
      persistence_rate: number;
      by_attempt_count: Array<{
        attempts: number;
        lead_count: number;
        sale_rate: number;
        contact_rate: number;
      }>;
    };
    agent_vendor_match: {
      top_combinations: Array<{
        agent: string;
        vendor: string;
        total_calls: number;
        sales: number;
        sale_rate: number;
        contact_rate: number;
        quote_rate: number;
      }>;
      worst_combinations: Array<{
        agent: string;
        vendor: string;
        total_calls: number;
        sales: number;
        sale_rate: number;
        contact_rate: number;
        quote_rate: number;
      }>;
      total_combinations: number;
    };
    call_duration_outcomes?: {
      duration_brackets: Array<{
        bracket: string;
        total_calls: number;
        sales: number;
        sale_rate: number;
        quote_rate: number;
        contact_rate: number;
      }>;
      optimal_duration: string | null;
      optimal_sale_rate: number | null;
      avg_duration_by_outcome: Record<string, number>;
    };
    weekly_trends?: {
      weekly_data: Array<{
        week: number;
        total_leads: number;
        sales: number;
        sale_rate: number;
        contact_rate: number;
        quote_rate: number;
        avg_duration: number;
        sale_rate_change: number;
      }>;
      trend: string;
      trend_change_pct: number;
      total_weeks: number;
    };
  };
  action_plan?: {
    current_state: {
      total_leads: number;
      total_sales: number;
      overall_sale_rate: number;
    };
    immediate_actions: string[];
    short_term_actions: string[];
    ongoing_actions: string[];
    improvement_potential: number | null;
    best_hours: number[];
    best_days: string[];
  };
  data_overview?: {
    columns: Record<string, {
      description: string;
      sample_values: (string | number)[];
      interpretation: string;
      data_type: string;
    }>;
    status_classification: Record<string, {
      example_statuses: string[];
      meaning: string;
      funnel_stage: string;
    }>;
    calculated_metrics: Array<{
      metric: string;
      formula: string;
      purpose: string;
    }>;
    data_notes: string[];
    methodology_summary: string;
  };
  industry_benchmarks?: Record<string, {
    poor?: number;
    average?: number;
    good?: number;
    excellent?: number;
    min?: number;
    optimal?: number;
    max?: number;
    description: string;
  }>;
}

export default function LeadAnalysisDashboard() {
  const [data, setData] = useState<LeadAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'diagnostics' | 'vendors' | 'agents' | 'timing' | 'data'>('overview');

  useEffect(() => {
    fetch('/data/lead_analysis.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load analysis data');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-gray-600">Loading analysis...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span>Error: {error || 'No data available'}</span>
        </div>
        <p className="mt-2 text-sm text-red-600">
          Run <code className="bg-red-100 px-1 rounded">python src/lead_analysis_api.py</code> to generate the analysis data.
        </p>
      </div>
    );
  }

  const viewTabs = [
    { id: 'data', label: 'Data' },
    { id: 'overview', label: 'Overview' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'agents', label: 'Agents' },
    { id: 'timing', label: 'Timing' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Lead Performance Analysis</h2>
              <button
                onClick={() => generateLeadAnalysisPDF(data)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {data.summary.date_range.start} to {data.summary.date_range.end} • {data.summary.total_records.toLocaleString()} records
            </p>
            <p className="text-xs text-primary-600 mt-1">
              Use these insights to optimize vendor spend, agent performance, and call timing
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeView === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeView === 'overview' && (
        <>
          {/* Context Box - What is this data? */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-primary-200 p-5">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">What am I looking at?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  This analysis shows <strong>call-by-call lead performance data</strong> tracking how different lead sources
                  and agents convert. Use this to understand which vendors are worth investing in, identify training needs,
                  and optimize your call schedule.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-blue-900">Lead</span>
                    <p className="text-blue-700">A potential customer who requested an insurance quote</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-blue-900">Vendor</span>
                    <p className="text-blue-700">Company that sells leads (e.g., QuoteWizard, EverQuote)</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-blue-900">Sale Rate</span>
                    <p className="text-blue-700">% of leads that became paying customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Leads"
              value={data.summary.total_records.toLocaleString()}
              icon={Users}
              color="blue"
              tooltip="Number of potential customers in this dataset"
            />
            <StatCard
              label="Contact Rate"
              value={`${data.summary.overall_contact_rate}%`}
              icon={Phone}
              color="emerald"
              tooltip="% of leads that answered the phone"
            />
            <StatCard
              label="Quote Rate"
              value={`${data.summary.overall_quote_rate}%`}
              icon={Target}
              color="amber"
              tooltip="% of leads that received a quote"
            />
            <StatCard
              label="Sale Rate"
              value={`${data.summary.overall_sale_rate}%`}
              icon={TrendingUp}
              color="purple"
              tooltip="% of leads that bought a policy"
            />
          </div>

          {/* Key Insight Box */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900">Key Insight</h4>
                <p className="text-sm text-amber-800">
                  A <strong>{data.summary.overall_sale_rate}% sale rate</strong> means for every 100 leads purchased,
                  about {Math.round(data.summary.overall_sale_rate)} become customers. If leads cost $25 each,
                  that's roughly <strong>${Math.round(2500 / data.summary.overall_sale_rate)} to acquire one customer</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Sales Funnel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales Funnel</h3>
              <p className="text-sm text-gray-500 mt-1">
                How leads progress from initial contact to sale. Each step shows where leads drop off.
              </p>
            </div>
            <div className="space-y-4">
              <FunnelBar
                label="Total Leads"
                value={data.funnel.total_leads}
                percentage={100}
                color="bg-gray-200"
              />
              <FunnelBar
                label="Contacted"
                value={data.funnel.contacted}
                percentage={data.funnel.contacted_rate}
                color="bg-primary-500"
              />
              <FunnelBar
                label="Quoted"
                value={data.funnel.quoted}
                percentage={data.funnel.quoted_rate}
                color="bg-amber-500"
              />
              <FunnelBar
                label="Hot Prospects"
                value={data.funnel.hot_prospects}
                percentage={data.funnel.hot_rate}
                color="bg-orange-500"
              />
              <FunnelBar
                label="Sold"
                value={data.funnel.sold}
                percentage={data.funnel.sold_rate}
                color="bg-emerald-1000"
              />
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    rec.priority === 'high'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-primary-50 border-primary-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {rec.priority === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{rec.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                          {rec.category}
                        </span>
                        <span className="text-xs text-gray-500">{rec.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          {data.action_plan && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Action Plan</h3>

              {/* Improvement Potential */}
              {data.action_plan.improvement_potential && (
                <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">
                      Potential Improvement: {data.action_plan.improvement_potential}%
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 mt-1">
                    If all agents performed at top agent level, conversion rates could improve by this amount.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                {/* Immediate Actions */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Immediate (This Week)
                  </h4>
                  <ul className="space-y-2">
                    {data.action_plan.immediate_actions.map((action, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Short-term Actions */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Short-term (This Month)
                  </h4>
                  <ul className="space-y-2">
                    {data.action_plan.short_term_actions.map((action, i) => (
                      <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ongoing Actions */}
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Ongoing
                  </h4>
                  <ul className="space-y-2">
                    {data.action_plan.ongoing_actions.map((action, i) => (
                      <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best Times Summary */}
              {(data.action_plan.best_hours.length > 0 || data.action_plan.best_days.length > 0) && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Optimal Calling Times</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {data.action_plan.best_hours.length > 0 && (
                      <div>
                        <span className="text-gray-600">Best Hours: </span>
                        <span className="font-medium text-gray-800">
                          {data.action_plan.best_hours.map(h => `${h}:00`).join(', ')}
                        </span>
                      </div>
                    )}
                    {data.action_plan.best_days.length > 0 && (
                      <div>
                        <span className="text-gray-600">Best Days: </span>
                        <span className="font-medium text-gray-800">
                          {data.action_plan.best_days.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeView === 'diagnostics' && data.diagnostics && (
        <>
          {/* Lead Investment Analysis */}
          {(() => {
            const paidVendors = data.diagnostics.roi_metrics.by_vendor.filter(v => v.total_spend > 0);
            const totalSpend = paidVendors.reduce((sum, v) => sum + v.total_spend, 0);
            const totalSales = paidVendors.reduce((sum, v) => sum + v.sales, 0);
            const costPerSale = totalSales > 0 ? Math.round(totalSpend / totalSales) : 0;

            // LTV calculation: avg premium $1,000 × 5 year retention × (9% new + 2.5% renewal avg)
            const avgPremium = 1000;
            const avgRetentionYears = 5;
            const firstYearCommission = 0.09;
            const renewalCommission = 0.025;
            const estimatedLTV = Math.round(avgPremium * (firstYearCommission + (renewalCommission * (avgRetentionYears - 1))));
            const ltvToCac = costPerSale > 0 ? (estimatedLTV / costPerSale).toFixed(2) : 0;

            // Best and worst vendors by cost per sale
            const vendorsWithSales = paidVendors.filter(v => v.sales > 0).sort((a, b) => (a.cpb || 999999) - (b.cpb || 999999));
            const bestVendor = vendorsWithSales[0];
            const worstVendor = vendorsWithSales[vendorsWithSales.length - 1];

            return (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-200 rounded-full">
                    <TrendingUp className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">Lead Investment Analysis</h3>
                    <p className="text-sm text-blue-700">Measuring efficiency of lead spend for book growth</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase font-medium">Total Investment</p>
                    <p className="text-2xl font-bold text-blue-700">${totalSpend.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Lead acquisition cost</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase font-medium">New Customers</p>
                    <p className="text-2xl font-bold text-emerald-600">{totalSales}</p>
                    <p className="text-xs text-gray-500">Policies written</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase font-medium">Cost per Customer</p>
                    <p className="text-2xl font-bold text-amber-600">${costPerSale}</p>
                    <p className="text-xs text-gray-500">Customer acquisition cost</p>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-4 border border-blue-300">
                    <p className="text-xs text-blue-700 uppercase font-medium">Est. LTV:CAC Ratio</p>
                    <p className="text-3xl font-bold text-blue-800">{ltvToCac}:1</p>
                    <p className="text-xs text-blue-600 font-medium">{Number(ltvToCac) >= 3 ? 'Healthy' : Number(ltvToCac) >= 1 ? 'Break-even' : 'Below target'}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Understanding the Investment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-2">
                        <strong>First-year commission:</strong> ~$90/policy (9% on $1,000 avg premium)
                      </p>
                      <p className="text-gray-600">
                        <strong>Estimated lifetime value:</strong> ~${estimatedLTV}/customer over {avgRetentionYears} years
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">LTV includes:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Renewal commissions (2-3%/year)</li>
                        <li>• Cross-sell opportunities (home, umbrella, life)</li>
                        <li>• Book value growth (1.5-2x annual revenue)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="text-xs text-emerald-800">
                        <strong>Most efficient:</strong> {bestVendor?.vendor} @ ${bestVendor?.cpb}/customer
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2">
                      <p className="text-xs text-amber-800">
                        <strong>Least efficient:</strong> {worstVendor?.vendor} @ ${worstVendor?.cpb}/customer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Diagnostics Header */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Deep Dive Diagnostics</h3>
                <p className="text-sm text-red-800">
                  This section answers the critical questions: Where is money being wasted? Where are leads being lost?
                  Which vendors should be cut? Use this to make data-driven budget decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Lead Quality Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lead Quality Issues</h3>
              <p className="text-sm text-gray-500 mt-1">
                What % of leads have fundamental problems before you even try to sell?
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-red-700">{data.diagnostics.lead_quality.overall.unreachable_rate}%</p>
                <p className="text-xs text-red-600">Unreachable</p>
                <p className="text-xs text-gray-500 mt-1">No contact, bad phone, left message</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-orange-700">{data.diagnostics.lead_quality.overall.bad_phone_rate}%</p>
                <p className="text-xs text-orange-600">Bad Phone #</p>
                <p className="text-xs text-gray-500 mt-1">Invalid or disconnected</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-yellow-700">{data.diagnostics.lead_quality.overall.never_requested_rate}%</p>
                <p className="text-xs text-yellow-600">Never Requested</p>
                <p className="text-xs text-gray-500 mt-1">Didn't ask for quote</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-gray-700">{data.diagnostics.lead_quality.overall.not_interested_rate}%</p>
                <p className="text-xs text-gray-600">Not Interested</p>
                <p className="text-xs text-gray-500 mt-1">Changed their mind</p>
              </div>
            </div>

            {/* Vendor Quality Table */}
            <h4 className="font-medium text-gray-900 mb-2">Quality Issues by Vendor</h4>
            <p className="text-xs text-gray-500 mb-3">Vendors with highest issue rates should be reviewed or cut</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Vendor</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Leads</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Bad Phone</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Never Req'd</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Bad Lead</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-red-500 font-bold">Total Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.diagnostics.lead_quality.by_vendor.slice(0, 8).map((v, i) => (
                    <tr key={i} className={v.total_issue_rate > 5 ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 font-medium">{v.vendor}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.total_leads.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.bad_phone_rate}%</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.never_requested_rate}%</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.bad_lead_rate}%</td>
                      <td className={`px-3 py-2 text-right font-bold ${v.total_issue_rate > 5 ? 'text-red-600' : 'text-gray-900'}`}>
                        {v.total_issue_rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ROI by Vendor</h3>
              <p className="text-sm text-gray-500 mt-1">
                Cost per Quote (CPQ) and Cost per Bind (CPB) tell you the real cost of each vendor.
                <span className="text-xs ml-1">(Avg ${data.diagnostics.roi_metrics.avg_cpl}/lead • Total spend: ${data.diagnostics.roi_metrics.total_spend.toLocaleString()})</span>
              </p>
            </div>

            {/* Vendor Costs Reference */}
            <div className="mb-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Actual Lead Costs Used:</p>
              <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(data.diagnostics.roi_metrics.vendor_costs).map(([vendor, cost]) => (
                  <span key={vendor} className="bg-white px-2 py-1 rounded border border-gray-200">
                    {vendor}: <strong>${cost}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Vendor</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">CPL</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Spend</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Sales</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Cost/Quote</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Cost/Bind</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Leads/Sale</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-emerald-500 font-bold">ROI %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.diagnostics.roi_metrics.by_vendor.map((v, i) => (
                    <tr key={i} className={v.roi_percent > 0 ? 'bg-emerald-100' : v.roi_percent < -50 ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 font-medium">{v.vendor}</td>
                      <td className="px-3 py-2 text-right text-gray-600">${v.cpl}</td>
                      <td className="px-3 py-2 text-right text-gray-600">${v.total_spend.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.sales}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.cpq ? `$${v.cpq}` : '-'}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.cpb ? `$${v.cpb}` : '-'}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{v.leads_per_sale || '-'}</td>
                      <td className={`px-3 py-2 text-right font-bold ${v.roi_percent > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {v.roi_percent > 0 ? '+' : ''}{v.roi_percent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-amber-50 rounded-xl p-3">
              <div className="flex gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Interpretation:</strong> Negative ROI vendors are losing money. A vendor needs
                  ROI above 0% to be profitable. Consider cutting vendors with ROI below -50%.
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Efficiency Rankings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vendor Efficiency Rankings</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ranked by cost-per-customer - lower is better for growing your book efficiently
              </p>
            </div>

            {(() => {
              const paidVendors = data.diagnostics.roi_metrics.by_vendor.filter(v => v.total_spend > 0 && v.sales > 0);
              const sortedByCPB = [...paidVendors].sort((a, b) => (a.cpb || 999999) - (b.cpb || 999999));

              // Categorize vendors by cost efficiency
              const tier1 = sortedByCPB.filter(v => (v.cpb || 0) <= 300); // Best: under $300/customer
              const tier2 = sortedByCPB.filter(v => (v.cpb || 0) > 300 && (v.cpb || 0) <= 700); // Good: $300-700
              const tier3 = sortedByCPB.filter(v => (v.cpb || 0) > 700); // Expensive: over $700

              return (
                <div className="space-y-4">
                  {/* Tier 1 - Most Efficient */}
                  {tier1.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold text-emerald-800">Most Efficient (under $300/customer)</h4>
                      </div>
                      <div className="space-y-2">
                        {tier1.map((v, i) => (
                          <div key={i} className="flex justify-between items-center text-sm bg-white rounded p-2">
                            <span className="font-medium text-gray-900">{v.vendor}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">{v.sales} customers</span>
                              <span className="text-emerald-600 font-bold">${v.cpb}/customer</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-emerald-700">
                        Best return on investment. Consider increasing budget if volume can scale without quality drop.
                      </p>
                    </div>
                  )}

                  {/* Tier 2 - Moderate */}
                  {tier2.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">Moderate Efficiency ($300-700/customer)</h4>
                      </div>
                      <div className="space-y-2">
                        {tier2.map((v, i) => (
                          <div key={i} className="flex justify-between items-center text-sm bg-white rounded p-2">
                            <span className="font-medium text-gray-900">{v.vendor}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">{v.sales} customers</span>
                              <span className="text-blue-600 font-bold">${v.cpb}/customer</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-blue-700">
                        Reasonable acquisition cost. Focus on improving conversion rates to move into Tier 1.
                      </p>
                    </div>
                  )}

                  {/* Tier 3 - Expensive */}
                  {tier3.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-800">High Cost (over $700/customer)</h4>
                      </div>
                      <div className="space-y-2">
                        {tier3.map((v, i) => (
                          <div key={i} className="flex justify-between items-center text-sm bg-white rounded p-2">
                            <span className="font-medium text-gray-900">{v.vendor}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">{v.sales} customers</span>
                              <span className="text-amber-600 font-bold">${v.cpb}/customer</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-amber-700">
                        Expensive for book growth. Negotiate better CPL or shift budget to more efficient vendors.
                      </p>
                    </div>
                  )}

                  {/* Optimization Opportunity Box */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Budget Optimization Opportunity</h4>
                    <p className="text-sm text-purple-800">
                      Shifting budget from high-cost vendors to efficient ones could acquire more customers for the same spend.
                      {tier1.length > 0 && tier3.length > 0 && (
                        <> For every ${tier3[0]?.cpb} spent on <strong>{tier3[0]?.vendor}</strong>,
                        you could get <strong>{Math.round((tier3[0]?.cpb || 0) / (tier1[0]?.cpb || 1))} customers</strong> from <strong>{tier1[0]?.vendor}</strong>.</>
                      )}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 90-Day Efficiency Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">90-Day Book Growth Plan</h3>
              <p className="text-sm text-gray-500 mt-1">
                Maximize new customer acquisition with the same or lower budget
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Phase 1: Immediate */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded">PHASE 1</span>
                  <span className="text-sm font-semibold text-blue-900">Days 1-7</span>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">Optimize Vendor Mix</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    Shift budget toward lowest cost-per-customer vendors
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    Negotiate volume discounts with efficient vendors
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    Route leads to best-performing agents first
                  </li>
                </ul>
              </div>

              {/* Phase 2: Optimize */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded">PHASE 2</span>
                  <span className="text-sm font-semibold text-purple-900">Days 8-30</span>
                </div>
                <h4 className="font-semibold text-purple-800 mb-2">Improve Conversions</h4>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    Match agents to vendors they convert best
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    Train team on successful call techniques
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    Prioritize calling during peak hours (7AM, 5PM)
                  </li>
                </ul>
              </div>

              {/* Phase 3: Scale */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded">PHASE 3</span>
                  <span className="text-sm font-semibold text-emerald-900">Days 31-90</span>
                </div>
                <h4 className="font-semibold text-emerald-800 mb-2">Scale for Growth</h4>
                <ul className="space-y-2 text-sm text-emerald-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    Increase budget with most efficient vendors
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    Test new vendors with small pilot budgets
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    Focus on cross-selling for customer LTV
                  </li>
                </ul>
              </div>
            </div>

            {/* Target Metrics */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Growth Metrics to Track</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <p className="font-bold text-gray-900">{'>'} 1.5%</p>
                  <p className="text-xs text-gray-600">Target Sale Rate</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{'<'} $500</p>
                  <p className="text-xs text-gray-600">Target Cost/Customer</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{'>'} 40%</p>
                  <p className="text-xs text-gray-600">Target Contact Rate</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{'>'} 3:1</p>
                  <p className="text-xs text-gray-600">Target LTV:CAC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel Bottlenecks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Where Are Leads Lost?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Conversion rates at each stage show where the biggest problems are.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-primary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{data.diagnostics.funnel_bottlenecks.conversion_rates.lead_to_contact}%</p>
                <p className="text-xs text-primary-600 font-medium">Lead → Contact</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{data.diagnostics.funnel_bottlenecks.conversion_rates.contact_to_quote}%</p>
                <p className="text-xs text-amber-600 font-medium">Contact → Quote</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-700">{data.diagnostics.funnel_bottlenecks.conversion_rates.quote_to_hot}%</p>
                <p className="text-xs text-orange-600 font-medium">Quote → Hot</p>
              </div>
              <div className="bg-emerald-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{data.diagnostics.funnel_bottlenecks.conversion_rates.hot_to_sale}%</p>
                <p className="text-xs text-emerald-600 font-medium">Hot → Sale</p>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-3">Biggest Loss Points</h4>
            <div className="space-y-3">
              <div className="bg-red-50 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-red-900">Before Contact</span>
                  <span className="text-red-700 font-bold">{data.diagnostics.funnel_bottlenecks.loss_reasons.before_contact.percentage}% lost</span>
                </div>
                <p className="text-xs text-red-700">
                  No Contact: {data.diagnostics.funnel_bottlenecks.loss_reasons.before_contact.breakdown.no_contact?.toLocaleString() || 0} •
                  Bad Phone: {data.diagnostics.funnel_bottlenecks.loss_reasons.before_contact.breakdown.bad_phone?.toLocaleString() || 0} •
                  Left Message: {data.diagnostics.funnel_bottlenecks.loss_reasons.before_contact.breakdown.left_message?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-orange-900">After Contact (No Quote)</span>
                  <span className="text-orange-700 font-bold">{data.diagnostics.funnel_bottlenecks.loss_reasons.after_contact.percentage}% lost</span>
                </div>
                <p className="text-xs text-orange-700">
                  Not Interested: {data.diagnostics.funnel_bottlenecks.loss_reasons.after_contact.breakdown.not_interested?.toLocaleString() || 0} •
                  Not Eligible: {data.diagnostics.funnel_bottlenecks.loss_reasons.after_contact.breakdown.not_eligible?.toLocaleString() || 0} •
                  Hung Up: {data.diagnostics.funnel_bottlenecks.loss_reasons.after_contact.breakdown.hung_up?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Call Persistence */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Call Persistence</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are we calling leads enough times? Industry best practice is 6-8 attempts over 14 days.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-gray-900">{data.diagnostics.call_attempts.average_attempts}</p>
                <p className="text-xs text-gray-600">Avg Attempts/Lead</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-gray-900">{data.diagnostics.call_attempts.persistence_rate}%</p>
                <p className="text-xs text-gray-600">Multi-Attempt Rate</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-red-700">{data.diagnostics.call_attempts.single_attempt_leads.toLocaleString()}</p>
                <p className="text-xs text-red-600">One & Done Leads</p>
              </div>
              <div className="bg-emerald-100 rounded-xl p-3">
                <p className="text-2xl font-bold text-emerald-700">{data.diagnostics.call_attempts.multiple_attempt_leads.toLocaleString()}</p>
                <p className="text-xs text-emerald-600">Worked Multiple Times</p>
              </div>
            </div>

            {data.diagnostics.call_attempts.average_attempts < 3 && (
              <div className="bg-red-50 rounded-xl p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-800">
                    <strong>Low persistence detected!</strong> Average of {data.diagnostics.call_attempts.average_attempts} attempts
                    is well below the industry standard of 6-8. Many leads may be abandoned too early.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Best Agent-Vendor Combinations */}
          {data.diagnostics.agent_vendor_match.top_combinations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Best Agent-Vendor Matches</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Route specific vendors to agents who convert them best.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Agent</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Vendor</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Calls</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Sales</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-emerald-500 font-bold">Sale %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.diagnostics.agent_vendor_match.top_combinations.slice(0, 5).map((combo, i) => (
                      <tr key={i} className="bg-emerald-100">
                        <td className="px-3 py-2 font-medium">{combo.agent}</td>
                        <td className="px-3 py-2">{combo.vendor}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{combo.total_calls}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{combo.sales}</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600">{combo.sale_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Call Duration vs Outcome */}
          {data.diagnostics.call_duration_outcomes && data.diagnostics.call_duration_outcomes.duration_brackets.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Call Duration Impact</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Longer calls typically mean better engagement. Find the sweet spot for your team.
                </p>
              </div>

              {data.diagnostics.call_duration_outcomes.optimal_duration && (
                <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">
                      Optimal Duration: {data.diagnostics.call_duration_outcomes.optimal_duration}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 mt-1">
                    Calls in this range have a {data.diagnostics.call_duration_outcomes.optimal_sale_rate}% sale rate
                  </p>
                </div>
              )}

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.diagnostics.call_duration_outcomes.duration_brackets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bracket" fontSize={12} />
                    <YAxis fontSize={12} unit="%" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name === 'sale_rate' ? 'Sale Rate' : name === 'contact_rate' ? 'Contact Rate' : name
                      ]}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Bar dataKey="sale_rate" fill="#10B981" name="sale_rate" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Duration by Outcome */}
              {Object.keys(data.diagnostics.call_duration_outcomes.avg_duration_by_outcome).length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(data.diagnostics.call_duration_outcomes.avg_duration_by_outcome).map(([outcome, duration]) => (
                    <div key={outcome} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">{Math.round(duration / 60)}:{String(Math.round(duration % 60)).padStart(2, '0')}</p>
                      <p className="text-xs text-gray-600">{outcome.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weekly Trends */}
          {data.diagnostics.weekly_trends && data.diagnostics.weekly_trends.weekly_data.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Performance Trends</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Track how performance is changing over time
                </p>
              </div>

              {/* Trend Summary */}
              <div className={`rounded-xl p-4 mb-4 ${
                data.diagnostics.weekly_trends.trend === 'improving' ? 'bg-emerald-100 border border-emerald-200' :
                data.diagnostics.weekly_trends.trend === 'declining' ? 'bg-red-50 border border-red-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${
                    data.diagnostics.weekly_trends.trend === 'improving' ? 'text-emerald-600' :
                    data.diagnostics.weekly_trends.trend === 'declining' ? 'text-red-600 rotate-180' :
                    'text-gray-600'
                  }`} />
                  <span className={`font-medium ${
                    data.diagnostics.weekly_trends.trend === 'improving' ? 'text-emerald-800' :
                    data.diagnostics.weekly_trends.trend === 'declining' ? 'text-red-800' :
                    'text-gray-800'
                  }`}>
                    Trend: {data.diagnostics.weekly_trends.trend.charAt(0).toUpperCase() + data.diagnostics.weekly_trends.trend.slice(1)}
                    {data.diagnostics.weekly_trends.trend_change_pct !== 0 && (
                      <span className="ml-2">
                        ({data.diagnostics.weekly_trends.trend_change_pct > 0 ? '+' : ''}{data.diagnostics.weekly_trends.trend_change_pct}% change)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.diagnostics.weekly_trends.weekly_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" fontSize={12} tickFormatter={(w) => `Wk ${w}`} />
                    <YAxis fontSize={12} unit="%" />
                    <Tooltip
                      labelFormatter={(w) => `Week ${w}`}
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name === 'sale_rate' ? 'Sale Rate' : name === 'contact_rate' ? 'Contact Rate' : name
                      ]}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="sale_rate" stroke="#10B981" strokeWidth={2} name="sale_rate" />
                    <Line type="monotone" dataKey="contact_rate" stroke="#3B82F6" strokeWidth={2} name="contact_rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Industry Benchmarks */}
          {data.industry_benchmarks && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Industry Benchmarks</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Compare your performance against industry standards
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sale Rate Benchmark */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Sale Rate</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">{data.summary.overall_sale_rate}%</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      data.summary.overall_sale_rate >= (data.industry_benchmarks.sale_rate?.excellent || 2) ? 'bg-emerald-100 text-emerald-700' :
                      data.summary.overall_sale_rate >= (data.industry_benchmarks.sale_rate?.good || 1.5) ? 'bg-primary-100 text-blue-700' :
                      data.summary.overall_sale_rate >= (data.industry_benchmarks.sale_rate?.average || 1) ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.summary.overall_sale_rate >= (data.industry_benchmarks.sale_rate?.excellent || 2) ? 'Excellent' :
                       data.summary.overall_sale_rate >= (data.industry_benchmarks.sale_rate?.good || 1.5) ? 'Good' :
                       data.summary.overall_sale_rate >= (data.industry_benchmarks.sale_rate?.average || 1) ? 'Average' :
                       'Below Average'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between"><span>Excellent:</span><span>≥{data.industry_benchmarks.sale_rate?.excellent}%</span></div>
                    <div className="flex justify-between"><span>Good:</span><span>≥{data.industry_benchmarks.sale_rate?.good}%</span></div>
                    <div className="flex justify-between"><span>Average:</span><span>≥{data.industry_benchmarks.sale_rate?.average}%</span></div>
                  </div>
                </div>

                {/* Contact Rate Benchmark */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Rate</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">{data.summary.overall_contact_rate}%</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      data.summary.overall_contact_rate >= (data.industry_benchmarks.contact_rate?.excellent || 80) ? 'bg-emerald-100 text-emerald-700' :
                      data.summary.overall_contact_rate >= (data.industry_benchmarks.contact_rate?.good || 65) ? 'bg-primary-100 text-blue-700' :
                      data.summary.overall_contact_rate >= (data.industry_benchmarks.contact_rate?.average || 50) ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.summary.overall_contact_rate >= (data.industry_benchmarks.contact_rate?.excellent || 80) ? 'Excellent' :
                       data.summary.overall_contact_rate >= (data.industry_benchmarks.contact_rate?.good || 65) ? 'Good' :
                       data.summary.overall_contact_rate >= (data.industry_benchmarks.contact_rate?.average || 50) ? 'Average' :
                       'Below Average'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between"><span>Excellent:</span><span>≥{data.industry_benchmarks.contact_rate?.excellent}%</span></div>
                    <div className="flex justify-between"><span>Good:</span><span>≥{data.industry_benchmarks.contact_rate?.good}%</span></div>
                    <div className="flex justify-between"><span>Average:</span><span>≥{data.industry_benchmarks.contact_rate?.average}%</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'vendors' && (
        <>
          {/* Vendor Explanation */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-5">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-900 mb-2">Understanding Lead Vendors</h3>
                <p className="text-sm text-emerald-800 mb-3">
                  Lead vendors are companies that sell contact information of people looking for insurance.
                  Each vendor has different quality levels and prices. <strong>Higher sale rate = better quality leads</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-emerald-900">What to look for</span>
                    <p className="text-emerald-700">Sale rate above 1% is good, above 2% is excellent</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-emerald-900">Contact Rate matters</span>
                    <p className="text-emerald-700">Low contact rate means bad phone numbers (wasted money)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top/Bottom Vendor Summary */}
          {data.vendors.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-100 rounded-xl border border-emerald-200 p-4">
                <h4 className="font-medium text-emerald-900 mb-2">Best Performer</h4>
                <p className="text-2xl font-bold text-emerald-700">{data.vendors[0].vendor}</p>
                <p className="text-sm text-emerald-600">
                  {data.vendors[0].sale_rate}% sale rate • {data.vendors[0].total_leads.toLocaleString()} leads
                </p>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <h4 className="font-medium text-red-900 mb-2">Needs Review</h4>
                <p className="text-2xl font-bold text-red-700">{data.vendors[data.vendors.length - 1].vendor}</p>
                <p className="text-sm text-red-600">
                  {data.vendors[data.vendors.length - 1].sale_rate}% sale rate • {data.vendors[data.vendors.length - 1].total_leads.toLocaleString()} leads
                </p>
              </div>
            </div>
          )}

          {/* Vendor Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vendor Sale Rates</h3>
              <p className="text-sm text-gray-500 mt-1">
                Percentage of leads from each vendor that resulted in a sale
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vendors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit="%" />
                  <YAxis dataKey="vendor" type="category" width={120} fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Sale Rate']}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="sale_rate" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vendor Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Leads</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sales</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sale %</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact %</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Quote %</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.vendors.map((vendor, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor.vendor}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{vendor.total_leads.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{vendor.sales}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-medium ${vendor.sale_rate >= 1 ? 'text-emerald-600' : 'text-gray-600'}`}>
                          {vendor.sale_rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{vendor.contact_rate}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{vendor.quote_rate}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{vendor.avg_call_duration}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeView === 'agents' && (
        <>
          {/* Agent Explanation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-primary-200 p-5">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Understanding Agent Performance</h3>
                <p className="text-sm text-blue-800 mb-3">
                  This shows how each sales agent converts leads into customers. Use this to identify
                  <strong> top performers to learn from</strong> and agents who may need additional training.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-blue-900">Sale Rate</span>
                    <p className="text-blue-700">% of their calls that resulted in a policy sale</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-blue-900">Talk Time</span>
                    <p className="text-blue-700">Total hours spent on calls (more isn't always better)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Summary */}
          {data.agents.length > 1 && (() => {
            const significantAgents = data.agents.filter(a => a.total_calls >= 100);
            if (significantAgents.length < 2) return null;
            const best = significantAgents[0];
            const avgRate = significantAgents.reduce((sum, a) => sum + a.sale_rate, 0) / significantAgents.length;
            return (
              <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Performance Gap</h4>
                    <p className="text-sm text-blue-800">
                      Top agent <strong>{best.agent}</strong> has a {best.sale_rate}% sale rate vs team average of {avgRate.toFixed(2)}%.
                      If all agents performed at the top level, sales could increase by <strong>{Math.round((best.sale_rate / avgRate - 1) * 100)}%</strong>.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Agent Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Agent Sale Rates</h3>
              <p className="text-sm text-gray-500 mt-1">
                Conversion rate for each agent (top 10 shown)
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.agents.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit="%" />
                  <YAxis dataKey="agent" type="category" width={120} fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Sale Rate']}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="sale_rate" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Calls</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sales</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sale %</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact %</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Talk Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.agents.map((agent, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{agent.agent}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{agent.total_calls.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{agent.sales}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-medium ${agent.sale_rate >= 1 ? 'text-emerald-600' : 'text-gray-600'}`}>
                          {agent.sale_rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{agent.contact_rate}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{agent.total_talk_hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeView === 'timing' && (
        <>
          {/* Timing Explanation */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-5">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Why Timing Matters</h3>
                <p className="text-sm text-purple-800 mb-3">
                  When you call leads significantly impacts your success rate. People are more likely to
                  <strong> answer and buy at certain times</strong>. Schedule your best agents during peak hours.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-purple-900">Best Hours</span>
                    <p className="text-purple-700">Look for peaks in the green "Sale Rate" line</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2">
                    <span className="font-medium text-purple-900">Contact vs Sale</span>
                    <p className="text-purple-700">High contact but low sale = people answer but don't buy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Times Summary */}
          {data.timing.hourly.length > 0 && (() => {
            const bestHours = [...data.timing.hourly].sort((a, b) => b.sale_rate - a.sale_rate).slice(0, 3);
            const bestDays = [...data.timing.daily].sort((a, b) => b.sale_rate - a.sale_rate).slice(0, 2);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Best Hours to Call</h4>
                  <div className="space-y-1">
                    {bestHours.map((h, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-purple-700">{h.hour}:00</span>
                        <span className="font-medium text-purple-900">{h.sale_rate}% sale rate</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Best Days to Call</h4>
                  <div className="space-y-1">
                    {bestDays.map((d, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-purple-700">{d.day}</span>
                        <span className="font-medium text-purple-900">{d.sale_rate}% sale rate</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Hourly Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance by Hour</h3>
              <p className="text-sm text-gray-500 mt-1">
                Green = Sale Rate, Blue = Contact Rate. Look for hours where both are high.
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timing.hourly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    fontSize={12}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis fontSize={12} unit="%" />
                  <Tooltip
                    labelFormatter={(h) => `${h}:00`}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === 'sale_rate' ? 'Sale Rate' : name === 'contact_rate' ? 'Contact Rate' : name
                    ]}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="sale_rate" stroke="#10B981" strokeWidth={2} name="sale_rate" />
                  <Line type="monotone" dataKey="contact_rate" stroke="#3B82F6" strokeWidth={2} name="contact_rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance by Day</h3>
              <p className="text-sm text-gray-500 mt-1">
                Which days of the week have the highest conversion rates
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.timing.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} unit="%" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name === 'sale_rate' ? 'Sale Rate' : name === 'contact_rate' ? 'Contact Rate' : name
                    ]}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="sale_rate" fill="#10B981" name="sale_rate" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Call Type Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance by Call Type</h3>
              <p className="text-sm text-gray-500 mt-1">
                Live transfers = warm leads transferred directly. Inbound = customer called you. Telemarketing = cold calls.
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.call_types} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit="%" />
                  <YAxis dataKey="call_type" type="category" width={120} fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Sale Rate']}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="sale_rate" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeView === 'data' && data.data_overview && (
        <>
          {/* Data Overview Header */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-5">
            <div className="flex gap-3">
              <Database className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Data Transparency</h3>
                  <button
                    onClick={() => generateDataDocumentationPDF(data)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Documentation
                  </button>
                </div>
                <p className="text-sm text-gray-700">
                  {data.data_overview.methodology_summary}
                </p>
              </div>
            </div>
          </div>

          {/* Data Summary Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.data_overview.data_notes.map((note, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                  {note}
                </div>
              ))}
            </div>
          </div>

          {/* Column Definitions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Raw Data Columns
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Each row in the source data represents one call to a potential customer
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(data.data_overview.columns).map(([columnName, info]) => (
                <div key={columnName} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{columnName}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {info.data_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{info.description}</p>

                  <div className="bg-gray-50 rounded p-2 mb-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Sample Values:</p>
                    <div className="flex flex-wrap gap-1">
                      {info.sample_values.slice(0, 5).map((val, i) => (
                        <code key={i} className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                          {String(val).length > 40 ? String(val).substring(0, 40) + '...' : String(val)}
                        </code>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">How we use it:</span> {info.interpretation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Classification */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-gray-600" />
                Status Classification Logic
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                How raw &quot;Current Status&quot; values are interpreted and classified
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Category</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Example Raw Values</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Meaning</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Funnel Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(data.data_overview.status_classification).map(([category, info]) => (
                    <tr key={category}>
                      <td className="px-3 py-2 font-medium text-gray-900">{category}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {info.example_statuses.slice(0, 2).map((status, i) => (
                            <code key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {status}
                            </code>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{info.meaning}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          info.funnel_stage === 'Sale' ? 'bg-emerald-100 text-emerald-700' :
                          info.funnel_stage === 'Hot' ? 'bg-orange-100 text-orange-700' :
                          info.funnel_stage === 'Quoted' ? 'bg-amber-100 text-amber-700' :
                          info.funnel_stage.includes('Lost') ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {info.funnel_stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculated Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Calculated Metrics</h3>
              <p className="text-sm text-gray-500 mt-1">
                How key performance indicators are derived from raw data
              </p>
            </div>

            <div className="space-y-3">
              {data.data_overview.calculated_metrics.map((metric, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">{metric.metric}</h4>
                  </div>
                  <div className="mt-2 bg-gray-50 rounded p-2">
                    <code className="text-xs text-gray-700">{metric.formula}</code>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Purpose:</span> {metric.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  tooltip,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  tooltip?: string;
}) {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {tooltip && (
            <p className="text-xs text-gray-400 mt-1">{tooltip}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FunnelBar({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {value.toLocaleString()} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
