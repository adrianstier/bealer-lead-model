/**
 * Customer Lookup Dashboard
 * Search for customers to do deep-dive analysis for cross-sell, upsell, and retention opportunities
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
  DollarSign,
  Target,
  ChevronRight,
  Award,
  Heart,
  Zap,
  Info,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lightbulb,
  Users,
  Calendar
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
  talkingPoints: string[];
  objectionHandlers: string[];
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
      action: 'Call to discuss home insurance needs',
      talkingPoints: [
        `"I noticed you have your auto with us but not your home. Did you know bundling saves you ${customer.totalPremium >= 2000 ? '15-20%' : '10-15%'} on both?"`,
        '"Our bundled customers have a 95% retention rate because the value is so strong."',
        '"When was your home policy last reviewed? I can do a quick comparison."'
      ],
      objectionHandlers: [
        '"I\'m happy with my current provider" → "I completely understand loyalty. Would you be open to a quick comparison? Many customers are surprised to find they\'re overpaying by $300-500/year."',
        '"It\'s too much hassle to switch" → "We handle all the paperwork and timing. Most customers say it was much easier than expected."'
      ]
    });
  }

  if (hasHome && !hasAuto) {
    opportunities.push({
      type: 'bundle',
      title: 'Add Auto Policy',
      description: 'Complete the bundle for maximum retention',
      potentialPremium: 1400,
      priority: 'high' as const,
      action: 'Review current auto coverage',
      talkingPoints: [
        '"You\'re already getting great coverage on your home. Let me show you how much you could save by bundling your auto."',
        '"When does your current auto policy renew? Let\'s get a quote ready so you can compare."',
        '"With bundling, you get one deductible for claims that affect both - like a tree falling on your car in the driveway."'
      ],
      objectionHandlers: [
        '"My auto rate is really good" → "Let me run a quick quote - you might be surprised. Even if rates are similar, the bundle benefits like combined deductibles add up."',
        '"I\'ve been with them forever" → "I get it. But rates change a lot. It\'s worth checking every few years - no obligation to switch."'
      ]
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
      action: 'Explain umbrella benefits and coverage gaps',
      talkingPoints: [
        `"With your ${customer.policyCount} policies totaling $${customer.totalPremium.toLocaleString()}, you clearly have assets worth protecting. An umbrella policy gives you an extra $1M+ in liability for about $200-300/year."`,
        '"If someone gets injured on your property or in an accident with your car and sues for more than your policy limit, you could lose your savings, home equity, and future wages."',
        '"It also covers things your other policies don\'t - like if your dog bites someone or you\'re sued for something you posted online."'
      ],
      objectionHandlers: [
        '"I don\'t have that many assets" → "It\'s not just about current assets. A lawsuit can garnish your wages for years. It\'s about protecting your future."',
        '"That won\'t happen to me" → "Nobody expects it, but we see it all the time. At $200/year, it\'s the cheapest peace of mind you can buy."'
      ]
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
      action: 'Schedule life insurance needs analysis',
      talkingPoints: [
        '"I see you\'re married. Have you thought about what would happen to your spouse\'s lifestyle if something happened to you?"',
        '"Term life is very affordable - a healthy 35-year-old can get $500K coverage for about $30/month."',
        '"Do you have kids? Most parents want to make sure college and living expenses are covered."'
      ],
      objectionHandlers: [
        '"I have it through work" → "That\'s great as a base, but it usually only covers 1-2x salary and disappears if you change jobs. Own your own policy so it stays with you."',
        '"I\'m too young to worry about that" → "That\'s actually the best time to get it - rates are lowest when you\'re young and healthy. Lock in those rates now."'
      ]
    });
  }

  // EZPay enrollment
  if (!customer.ezpay) {
    opportunities.push({
      type: 'retention',
      title: 'Enroll in EZPay',
      description: 'Automatic payments reduce lapse risk by 60%',
      potentialPremium: 0,
      priority: customer.policyCount === 1 ? 'high' as const : 'medium' as const,
      action: 'Explain EZPay benefits and set up',
      talkingPoints: [
        '"I want to make sure you never accidentally miss a payment and lose coverage. Can we set up EZPay?"',
        '"It\'s the most convenient option - you\'ll never have to remember to mail a check or log in to pay."',
        '"Many customers save money too because they avoid late fees and policy reinstatement charges."'
      ],
      objectionHandlers: [
        '"I like to control when I pay" → "You\'re still in control - you can choose your payment date, and we always send reminders before we charge."',
        '"What if I need to cancel?" → "You can cancel or change anytime with a quick call. Most people never want to go back once they try it."'
      ]
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
      action: 'Ask about homeownership plans',
      talkingPoints: [
        `"You've been a great customer for ${customer.tenure} years. Any plans to buy a home? I'd love to help you get pre-approved quotes."`,
        '"First-time buyer? I can explain the insurance side and connect you with mortgage contacts if helpful."',
        '"When you\'re ready, remember your tenure with us can help with your homeowner\'s rate."'
      ],
      objectionHandlers: [
        '"The market is too expensive" → "I hear you. Let me know when you\'re ready - market conditions change. I\'ll be here to help with the insurance piece."'
      ]
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
      action: 'Ask for friends/family referrals',
      talkingPoints: [
        `"You've been with us ${customer.tenure} years and we really appreciate your loyalty. Do you know anyone who might benefit from the same great coverage?"`,
        '"We offer referral rewards - $50 for each friend who gets a quote. There\'s no limit."',
        '"Who do you know that recently bought a home, had a baby, or just turned 16 with a new driver?"'
      ],
      objectionHandlers: [
        '"I can\'t think of anyone" → "No pressure! If anyone mentions insurance, keep us in mind. I can send you some referral cards to share."'
      ]
    });
  }

  // Claim follow-up
  if (customer.claimCount > 0 && customer.policyCount === 1) {
    opportunities.push({
      type: 'retention',
      title: 'Post-Claim Check-in',
      description: 'Single-policy claimant at HIGH risk - needs immediate attention',
      potentialPremium: 0,
      priority: 'high' as const,
      action: 'Call to review coverage and offer bundle discount',
      talkingPoints: [
        '"I wanted to follow up on your recent claim and make sure everything was resolved to your satisfaction."',
        '"Claims can sometimes make people shop around. I\'d love to show you how bundling could offset any rate increase."',
        '"Is there anything we could have done better? Your feedback helps us improve."'
      ],
      objectionHandlers: [
        '"My rate went up" → "I understand that\'s frustrating. Let me review your policy - there may be discounts we haven\'t applied. Also, bundling often saves more than the increase."',
        '"I\'m thinking of switching" → "Before you do, let me make sure you\'re comparing apples to apples. Some carriers have hidden exclusions or lower limits."'
      ]
    });
  }

  // Coverage review for long-tenured customers
  if (customer.tenure >= 5 && customer.policyCount >= 2) {
    opportunities.push({
      type: 'review',
      title: 'Coverage Review',
      description: 'Long-tenured customer due for comprehensive review',
      potentialPremium: 300,
      priority: 'low' as const,
      action: 'Schedule annual coverage review',
      talkingPoints: [
        `"It's been a while since we reviewed your coverage. A lot can change in ${customer.tenure} years - home value, assets, life events."`,
        '"Let me make sure you have the right limits and aren\'t overpaying for coverage you don\'t need."',
        '"This is also a great time to check for new discounts you might qualify for."'
      ],
      objectionHandlers: [
        '"I don\'t have time" → "It only takes 15 minutes and could save you hundreds. When works best for a quick call?"'
      ]
    });
  }

  return opportunities.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Score display component
function ScoreGauge({ label, score, color, description }: { label: string; score: number; color: string; description: string }) {
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
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

// Example customer to demonstrate the tool
const EXAMPLE_CUSTOMER: Customer = {
  name: "Example: Sarah Johnson",
  totalPremium: 2400,
  policyCount: 1,
  zipCode: "93101",
  email: "sarah.johnson@example.com",
  phone: "(805) 555-0123",
  tenure: 3,
  ezpay: false,
  products: ["Auto - Full Coverage"],
  gender: "Female",
  maritalStatus: "Married",
  claimCount: 0
};

export default function CustomerLookupDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(EXAMPLE_CUSTOMER);
  const [showInstructions, setShowInstructions] = useState(true);
  const [expandedOpportunity, setExpandedOpportunity] = useState<number | null>(null);

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

  // Calculate customer lifetime value estimate
  const customerLTV = selectedCustomer ? {
    annual: selectedCustomer.totalPremium * 0.12, // 12% commission
    projected: selectedCustomer.totalPremium * 0.12 * (scores ? (scores.retention / 100) * 10 : 5), // 10 year horizon adjusted for retention
    withOpportunities: (selectedCustomer.totalPremium + opportunities.reduce((sum, o) => sum + o.potentialPremium, 0)) * 0.12 * 10
  } : null;

  return (
    <div className="space-y-6">
      {/* Header with Purpose */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Customer Deep-Dive Tool</h2>
        <p className="text-indigo-100">Find opportunities to grow revenue, improve retention, and increase customer lifetime value</p>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to Use This Tool</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span><strong>Search</strong> for a customer by name, phone, or ZIP code</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span><strong>Review their scores</strong> - Retention (churn risk), Growth (upsell potential), Referral (advocacy likelihood), and Risk</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <span><strong>Use the opportunities</strong> - Each includes talking points and objection handlers to help close the sale</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                    <span><strong>Take action</strong> - Call customers with HIGH priority items first, especially single-policy or at-risk customers</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white/60 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Why This Matters
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• <strong>Single-policy customers</strong> have 40% churn rate vs 5% for bundled</li>
                    <li>• <strong>EZPay customers</strong> are 60% less likely to lapse</li>
                    <li>• <strong>Every policy added</strong> increases retention by 15-20%</li>
                    <li>• <strong>Referred customers</strong> have 2x higher lifetime value</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-blue-400 hover:text-primary-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {!showInstructions && (
        <button
          onClick={() => setShowInstructions(true)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <Info className="w-4 h-4" />
          Show instructions
        </button>
      )}

      {/* Search Box */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or ZIP code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
        </div>

        {/* Search Results */}
        {filteredCustomers.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-xl divide-y max-h-80 overflow-y-auto">
            {filteredCustomers.map((customer, i) => {
              const customerScores = calculateCustomerScore(customer);
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setSearchQuery('');
                    setExpandedOpportunity(null);
                  }}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      {customer.policyCount === 1 && (
                        <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">Single Policy</span>
                      )}
                      {!customer.ezpay && (
                        <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">No EZPay</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {customer.policyCount} policies • ${customer.totalPremium.toLocaleString()} • {customer.tenure}yr tenure
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        customerScores.overall >= 70 ? 'text-green-600' :
                        customerScores.overall >= 50 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {customerScores.overall}
                      </span>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {searchQuery && filteredCustomers.length === 0 && (
          <p className="mt-4 text-center text-gray-500">No customers found matching "{searchQuery}"</p>
        )}
      </div>

      {/* Selected Customer Details */}
      {selectedCustomer && scores && (
        <div className="space-y-6">
          {/* Example Customer Banner */}
          {selectedCustomer.name.startsWith('Example:') && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">This is an example customer</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Sarah represents a typical <strong>high-risk, high-opportunity</strong> customer: single policy, no EZPay,
                      married but no home or life insurance. Use the search above to find your real customers.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Customer Header with Key Indicators */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  {scores.risk >= 60 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      At Risk
                    </span>
                  )}
                  {selectedCustomer.policyCount === 1 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      Single Policy
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  {selectedCustomer.phone && (
                    <a href={`tel:${selectedCustomer.phone}`} className="flex items-center hover:text-indigo-600">
                      <Phone className="w-4 h-4 mr-1" />
                      {selectedCustomer.phone}
                    </a>
                  )}
                  {selectedCustomer.email && (
                    <a href={`mailto:${selectedCustomer.email}`} className="flex items-center hover:text-indigo-600">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedCustomer.email}
                    </a>
                  )}
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedCustomer.zipCode}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  scores.overall >= 70 ? 'text-green-600' :
                  scores.overall >= 50 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {scores.overall}
                </div>
                <p className="text-sm text-gray-500">Overall Score</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">${selectedCustomer.totalPremium.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Premium</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{selectedCustomer.policyCount}</p>
                <p className="text-xs text-gray-500">Policies</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{selectedCustomer.tenure} yr</p>
                <p className="text-xs text-gray-500">Tenure</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{selectedCustomer.claimCount}</p>
                <p className="text-xs text-gray-500">Claims</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${selectedCustomer.ezpay ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-xl font-bold ${selectedCustomer.ezpay ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedCustomer.ezpay ? <CheckCircle className="w-6 h-6 mx-auto" /> : <XCircle className="w-6 h-6 mx-auto" />}
                </p>
                <p className="text-xs text-gray-500">EZPay</p>
              </div>
            </div>

            {/* Customer Value Metrics */}
            {customerLTV && (
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Customer Value Analysis
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-indigo-700">${customerLTV.annual.toLocaleString()}</p>
                    <p className="text-xs text-indigo-600">Annual Commission</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-indigo-700">${Math.round(customerLTV.projected).toLocaleString()}</p>
                    <p className="text-xs text-indigo-600">Projected 10yr LTV</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">${Math.round(customerLTV.withOpportunities).toLocaleString()}</p>
                    <p className="text-xs text-green-700">Potential 10yr LTV</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scores Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Customer Scores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ScoreGauge
                label="Retention"
                score={scores.retention}
                color="#10b981"
                description="Likelihood to stay"
              />
              <ScoreGauge
                label="Growth"
                score={scores.growth}
                color="#6366f1"
                description="Upsell potential"
              />
              <ScoreGauge
                label="Referral"
                score={scores.referral}
                color="#ec4899"
                description="Advocacy likelihood"
              />
              <ScoreGauge
                label="Risk"
                score={scores.risk}
                color="#ef4444"
                description="Churn probability"
              />
            </div>

            {/* Score Interpretation */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              {scores.retention >= 70 && (
                <div className="flex items-start space-x-2 text-sm bg-green-50 p-3 rounded-xl">
                  <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-green-800">Strong retention profile</span>
                    <p className="text-xs text-green-700 mt-0.5">Protect this relationship - focus on growth and referrals</p>
                  </div>
                </div>
              )}
              {scores.growth >= 60 && (
                <div className="flex items-start space-x-2 text-sm bg-indigo-50 p-3 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-indigo-800">High growth potential</span>
                    <p className="text-xs text-indigo-700 mt-0.5">Missing products they likely need - prioritize upsell calls</p>
                  </div>
                </div>
              )}
              {scores.referral >= 70 && (
                <div className="flex items-start space-x-2 text-sm bg-pink-50 p-3 rounded-xl">
                  <Heart className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-pink-800">Ideal referral candidate</span>
                    <p className="text-xs text-pink-700 mt-0.5">Loyal customer - ask for introductions to friends/family</p>
                  </div>
                </div>
              )}
              {scores.risk >= 60 && (
                <div className="flex items-start space-x-2 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-red-800">Elevated churn risk</span>
                    <p className="text-xs text-red-700 mt-0.5">Take immediate action - add policies or EZPay to reduce risk</p>
                  </div>
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

            {/* What they're missing */}
            {scores.growth >= 40 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                <p className="text-sm font-medium text-amber-800 mb-2">Missing Products:</p>
                <div className="flex flex-wrap gap-2">
                  {!selectedCustomer.products.some(p => p.toLowerCase().includes('auto')) && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Auto</span>
                  )}
                  {!selectedCustomer.products.some(p => p.toLowerCase().includes('home')) &&
                   !selectedCustomer.products.some(p => p.toLowerCase().includes('renter')) && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Home/Renters</span>
                  )}
                  {!selectedCustomer.products.some(p => p.toLowerCase().includes('umbrella')) && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Umbrella</span>
                  )}
                  {!selectedCustomer.products.some(p => p.toLowerCase().includes('life')) && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Life</span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className={`flex items-center ${selectedCustomer.ezpay ? 'text-green-600' : 'text-red-600'}`}>
                <Zap className="w-4 h-4 mr-1" />
                {selectedCustomer.ezpay ? 'EZPay Active' : 'No EZPay - HIGH PRIORITY'}
              </span>
              {selectedCustomer.maritalStatus && (
                <span className="text-gray-600">
                  {selectedCustomer.maritalStatus}
                </span>
              )}
            </div>
          </div>

          {/* Sales Opportunities with Expanded Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Action Items & Opportunities
              </h4>
              <span className="text-sm text-gray-500">
                {opportunities.filter(o => o.priority === 'high').length} high priority
              </span>
            </div>

            {opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opp, i) => (
                  <div
                    key={i}
                    className={`border-l-4 rounded-xl overflow-hidden ${
                      opp.priority === 'high'
                        ? 'border-red-500 bg-red-50'
                        : opp.priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-green-500 bg-green-50'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-opacity-80"
                      onClick={() => setExpandedOpportunity(expandedOpportunity === i ? null : i)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            opp.priority === 'high'
                              ? 'bg-red-200 text-red-800'
                              : opp.priority === 'medium'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-green-200 text-green-800'
                          }`}>
                            {opp.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">{opp.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {opp.potentialPremium > 0 && (
                            <span className="text-sm font-bold text-green-600">
                              +${opp.potentialPremium.toLocaleString()}/yr
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${expandedOpportunity === i ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-900">{opp.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                    </div>

                    {/* Expanded Content */}
                    {expandedOpportunity === i && (
                      <div className="px-4 pb-4 space-y-4">
                        {/* Action */}
                        <div className="flex items-center text-sm bg-white p-3 rounded-xl">
                          <Award className="w-4 h-4 mr-2 text-indigo-600" />
                          <span><strong>Action:</strong> {opp.action}</span>
                        </div>

                        {/* Talking Points */}
                        <div className="bg-white p-3 rounded-xl">
                          <h6 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1 text-primary-600" />
                            Talking Points
                          </h6>
                          <ul className="space-y-2">
                            {opp.talkingPoints.map((point, j) => (
                              <li key={j} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-200">
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Objection Handlers */}
                        {opp.objectionHandlers.length > 0 && (
                          <div className="bg-white p-3 rounded-xl">
                            <h6 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                              <Shield className="w-4 h-4 mr-1 text-amber-600" />
                              Objection Handlers
                            </h6>
                            <ul className="space-y-2">
                              {opp.objectionHandlers.map((handler, j) => (
                                <li key={j} className="text-sm text-gray-700 pl-4 border-l-2 border-amber-200">
                                  {handler}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Total Potential */}
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-indigo-900">Total Potential Premium</span>
                      <p className="text-xs text-indigo-700">Estimated annual increase if all opportunities converted</p>
                    </div>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${opportunities.reduce((sum, o) => sum + o.potentialPremium, 0).toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">This customer has all recommended products.</p>
                <p className="text-sm mt-1">Focus on retention, coverage reviews, and asking for referrals.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-500" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href={`tel:${selectedCustomer.phone}`}
                className="flex flex-col items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-green-600 mb-1" />
                <span className="text-xs text-green-700">Call Now</span>
              </a>
              <a
                href={`mailto:${selectedCustomer.email}`}
                className="flex flex-col items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs text-blue-700">Send Email</span>
              </a>
              <button className="flex flex-col items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <Calendar className="w-5 h-5 text-purple-600 mb-1" />
                <span className="text-xs text-purple-700">Schedule</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                <Users className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-xs text-amber-700">Add Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCustomer && !searchQuery && (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Search for a Customer</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Enter a customer's name, phone number, or ZIP code to view their profile,
            scores, and personalized sales opportunities.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Target className="w-4 h-4 text-indigo-500" />
              Find cross-sell opportunities
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              Identify retention risks
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Heart className="w-4 h-4 text-pink-500" />
              Spot referral candidates
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
