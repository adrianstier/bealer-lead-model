/**
 * Customer Lookup Dashboard
 * Search for customers and view their score and sales opportunities
 */

import { useState, useMemo } from 'react';
import {
  Search,
  User,
  Star,
  TrendingUp,
  AlertTriangle,
  Shield,
  Home,
  Car,
  Umbrella,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  ChevronRight,
  Award,
  Heart,
  Zap
} from 'lucide-react';

// Import customer data
import customersData from '../data/customers.json';

// Types
interface Customer {
  name: string;
  totalPremium: number;
  policyCount: number;
  zipCode: string;
  email: string;
  phone: string;
  tenure: number;
  ezpay: boolean;
  products: string[];
  gender: string;
  maritalStatus: string;
  claimCount: number;
}

// Scoring algorithm
function calculateCustomerScore(customer: Customer): {
  overall: number;
  retention: number;
  growth: number;
  referral: number;
  risk: number;
} {
  // Retention Score (0-100)
  let retention = 50;
  if (customer.policyCount >= 3) retention += 20;
  else if (customer.policyCount >= 2) retention += 10;
  else retention -= 15; // Single policy = higher churn risk

  if (customer.ezpay) retention += 15;
  if (customer.tenure >= 10) retention += 15;
  else if (customer.tenure >= 5) retention += 10;
  else if (customer.tenure < 2) retention -= 10;

  if (customer.claimCount === 0) retention += 5;
  else if (customer.claimCount >= 3) retention -= 10;

  retention = Math.max(0, Math.min(100, retention));

  // Growth Score (0-100) - potential for upsell
  let growth = 30;

  // Check what products they're missing
  const hasAuto = customer.products.some(p => p.toLowerCase().includes('auto'));
  const hasHome = customer.products.some(p => p.toLowerCase().includes('home'));
  const hasUmbrella = customer.products.some(p => p.toLowerCase().includes('umbrella'));
  const hasLife = customer.products.some(p => p.toLowerCase().includes('life'));

  if (hasAuto && !hasHome) growth += 25;
  if (hasHome && !hasAuto) growth += 25;
  if ((hasAuto || hasHome) && !hasUmbrella) growth += 20;
  if (!hasLife) growth += 10;

  // High premium customers have more upsell potential
  if (customer.totalPremium >= 5000) growth += 10;
  if (customer.totalPremium >= 10000) growth += 5;

  growth = Math.max(0, Math.min(100, growth));

  // Referral Score (0-100)
  let referral = 20;
  if (customer.tenure >= 10) referral += 30;
  else if (customer.tenure >= 5) referral += 15;

  if (customer.policyCount >= 2) referral += 20;
  if (customer.totalPremium >= 3000) referral += 15;
  if (customer.claimCount === 0) referral += 10;
  if (customer.ezpay) referral += 5;

  referral = Math.max(0, Math.min(100, referral));

  // Risk Score (0-100) - higher = more at risk
  let risk = 20;
  if (customer.policyCount === 1) risk += 30;
  if (!customer.ezpay) risk += 20;
  if (customer.tenure < 2) risk += 15;
  if (customer.claimCount >= 2) risk += 15;

  risk = Math.max(0, Math.min(100, risk));

  // Overall Score
  const overall = Math.round(
    (retention * 0.3) +
    (growth * 0.25) +
    (referral * 0.25) +
    ((100 - risk) * 0.2)
  );

  return { overall, retention, growth, referral, risk };
}

// Get sales opportunities for a customer
function getSalesOpportunities(customer: Customer): Array<{
  type: string;
  title: string;
  description: string;
  potentialPremium: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
}> {
  const opportunities = [];

  const hasAuto = customer.products.some(p => p.toLowerCase().includes('auto'));
  const hasHome = customer.products.some(p => p.toLowerCase().includes('home'));
  const hasUmbrella = customer.products.some(p => p.toLowerCase().includes('umbrella'));
  const hasLife = customer.products.some(p => p.toLowerCase().includes('life'));
  const hasRenters = customer.products.some(p => p.toLowerCase().includes('renter'));
  const hasCondo = customer.products.some(p => p.toLowerCase().includes('condo'));

  // Auto + Home bundle
  if (hasAuto && !hasHome && !hasRenters && !hasCondo) {
    opportunities.push({
      type: 'bundle',
      title: 'Add Homeowners Policy',
      description: 'Bundle with auto for 95% retention and multi-policy discount',
      potentialPremium: 1800,
      priority: 'high' as const,
      action: 'Call to discuss home insurance needs'
    });
  }

  if (hasHome && !hasAuto) {
    opportunities.push({
      type: 'bundle',
      title: 'Add Auto Policy',
      description: 'Complete the bundle for maximum retention',
      potentialPremium: 1400,
      priority: 'high' as const,
      action: 'Review current auto coverage'
    });
  }

  // Umbrella upsell
  if ((hasAuto || hasHome) && !hasUmbrella && customer.totalPremium >= 2000) {
    opportunities.push({
      type: 'upsell',
      title: 'Personal Umbrella Policy',
      description: 'Extra liability protection - great for customers with assets',
      potentialPremium: 250,
      priority: customer.totalPremium >= 5000 ? 'high' as const : 'medium' as const,
      action: 'Explain umbrella benefits and coverage gaps'
    });
  }

  // Life insurance
  if (!hasLife && (customer.maritalStatus === 'Married' || customer.gender === 'Couple')) {
    opportunities.push({
      type: 'cross-sell',
      title: 'Life Insurance',
      description: 'Protect family with term or whole life coverage',
      potentialPremium: 1200,
      priority: 'medium' as const,
      action: 'Schedule life insurance needs analysis'
    });
  }

  // EZPay enrollment
  if (!customer.ezpay) {
    opportunities.push({
      type: 'retention',
      title: 'Enroll in EZPay',
      description: 'Automatic payments reduce lapse risk significantly',
      potentialPremium: 0,
      priority: customer.policyCount === 1 ? 'high' as const : 'medium' as const,
      action: 'Explain EZPay benefits and set up'
    });
  }

  // Renters to homeowners pathway
  if (hasRenters && customer.tenure >= 2) {
    opportunities.push({
      type: 'upgrade',
      title: 'Homeowners Upgrade',
      description: 'Long-term renter may be ready for home purchase',
      potentialPremium: 1500,
      priority: 'medium' as const,
      action: 'Ask about homeownership plans'
    });
  }

  // Referral ask for ideal customers
  if (customer.tenure >= 10 && customer.policyCount >= 2 && customer.claimCount === 0) {
    opportunities.push({
      type: 'referral',
      title: 'Request Referrals',
      description: 'Loyal customer - ideal for referral program',
      potentialPremium: 2500,
      priority: 'medium' as const,
      action: 'Ask for friends/family referrals'
    });
  }

  // Claim follow-up
  if (customer.claimCount > 0 && customer.policyCount === 1) {
    opportunities.push({
      type: 'retention',
      title: 'Post-Claim Check-in',
      description: 'Single-policy claimant at high risk - needs attention',
      potentialPremium: 0,
      priority: 'high' as const,
      action: 'Call to review coverage and offer bundle discount'
    });
  }

  return opportunities.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Score display component
function ScoreGauge({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${(score / 100) * 176} 176`}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
          {score}
        </span>
      </div>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

export default function CustomerLookupDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const customers = customersData as Customer[];

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return customers
      .filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.zipCode.includes(query) ||
        c.phone.includes(query)
      )
      .slice(0, 10);
  }, [searchQuery, customers]);

  // Calculate scores for selected customer
  const scores = selectedCustomer ? calculateCustomerScore(selectedCustomer) : null;
  const opportunities = selectedCustomer ? getSalesOpportunities(selectedCustomer) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Customer Lookup</h2>
        <p className="text-indigo-100">Search for a customer to view their score and sales opportunities</p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or ZIP code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
        </div>

        {/* Search Results */}
        {filteredCustomers.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg divide-y max-h-80 overflow-y-auto">
            {filteredCustomers.map((customer, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setSearchQuery('');
                }}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">
                    {customer.policyCount} policies • ${customer.totalPremium.toLocaleString()} • {customer.zipCode}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}

        {searchQuery && filteredCustomers.length === 0 && (
          <p className="mt-4 text-center text-gray-500">No customers found matching "{searchQuery}"</p>
        )}
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer && scores && (
        <div className="space-y-6">
          {/* Customer Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  {selectedCustomer.phone && (
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.email && (
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedCustomer.email}
                    </span>
                  )}
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedCustomer.zipCode}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">{scores.overall}</div>
                <p className="text-sm text-gray-500">Overall Score</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">${selectedCustomer.totalPremium.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Premium</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedCustomer.policyCount}</p>
                <p className="text-xs text-gray-500">Policies</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedCustomer.tenure} yr</p>
                <p className="text-xs text-gray-500">Tenure</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{selectedCustomer.claimCount}</p>
                <p className="text-xs text-gray-500">Claims</p>
              </div>
            </div>
          </div>

          {/* Scores Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Customer Scores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ScoreGauge label="Retention" score={scores.retention} color="#10b981" />
              <ScoreGauge label="Growth" score={scores.growth} color="#6366f1" />
              <ScoreGauge label="Referral" score={scores.referral} color="#ec4899" />
              <ScoreGauge label="Risk" score={scores.risk} color="#ef4444" />
            </div>

            {/* Score Interpretation */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              {scores.retention >= 70 && (
                <div className="flex items-start space-x-2 text-sm bg-green-50 p-3 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-green-800">Strong retention profile - protect this relationship</span>
                </div>
              )}
              {scores.growth >= 60 && (
                <div className="flex items-start space-x-2 text-sm bg-indigo-50 p-3 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-indigo-800">High growth potential - focus on upsell opportunities</span>
                </div>
              )}
              {scores.referral >= 70 && (
                <div className="flex items-start space-x-2 text-sm bg-pink-50 p-3 rounded-lg">
                  <Heart className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span className="text-pink-800">Ideal referral candidate - ask for introductions</span>
                </div>
              )}
              {scores.risk >= 60 && (
                <div className="flex items-start space-x-2 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800">Elevated risk - prioritize retention outreach</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Products */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Current Products</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCustomer.products.map((product, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {product.toLowerCase().includes('auto') && <Car className="w-4 h-4 mr-1" />}
                  {product.toLowerCase().includes('home') && <Home className="w-4 h-4 mr-1" />}
                  {product.toLowerCase().includes('umbrella') && <Umbrella className="w-4 h-4 mr-1" />}
                  {product}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className={`flex items-center ${selectedCustomer.ezpay ? 'text-green-600' : 'text-red-600'}`}>
                <Zap className="w-4 h-4 mr-1" />
                {selectedCustomer.ezpay ? 'EZPay Active' : 'No EZPay'}
              </span>
              {selectedCustomer.maritalStatus && (
                <span className="text-gray-600">
                  {selectedCustomer.maritalStatus}
                </span>
              )}
            </div>
          </div>

          {/* Sales Opportunities */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-600" />
              Sales Opportunities
            </h4>

            {opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opp, i) => (
                  <div
                    key={i}
                    className={`border-l-4 rounded-lg p-4 ${
                      opp.priority === 'high'
                        ? 'border-red-500 bg-red-50'
                        : opp.priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          opp.priority === 'high'
                            ? 'bg-red-200 text-red-800'
                            : opp.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                        }`}>
                          {opp.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{opp.type}</span>
                      </div>
                      {opp.potentialPremium > 0 && (
                        <span className="text-sm font-bold text-green-600">
                          +${opp.potentialPremium.toLocaleString()}/yr
                        </span>
                      )}
                    </div>
                    <h5 className="font-medium text-gray-900">{opp.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                    <div className="mt-3 flex items-center text-sm text-indigo-600">
                      <Award className="w-4 h-4 mr-1" />
                      <span className="font-medium">Action:</span>
                      <span className="ml-1">{opp.action}</span>
                    </div>
                  </div>
                ))}

                {/* Total Potential */}
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-indigo-900">Total Potential Premium</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${opportunities.reduce((sum, o) => sum + o.potentialPremium, 0).toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>This customer has all recommended products!</p>
                <p className="text-sm">Focus on retention and referral opportunities.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCustomer && !searchQuery && (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Search for a Customer</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a customer's name, phone number, or ZIP code to view their profile,
            scores, and personalized sales opportunities.
          </p>
        </div>
      )}
    </div>
  );
}
