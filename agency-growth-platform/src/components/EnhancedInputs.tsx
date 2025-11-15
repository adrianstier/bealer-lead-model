/**
 * Enhanced Inputs Component
 * Comprehensive input controls for all simulation parameters
 */

import * as Tabs from '@radix-ui/react-tabs';
import { DollarSign, Users, Settings, TrendingUp, Package } from 'lucide-react';

export interface MarketingChannel {
  referral: number;
  digital: number;
  traditional: number;
  partnerships: number;
}

export interface StaffingConfig {
  producers: number;
  serviceStaff: number;
  adminStaff: number;
  producerAvgComp: number;
  serviceStaffAvgComp: number;
  adminStaffAvgComp: number;
}

export interface ProductMix {
  autoPolicies: number;
  homePolicies: number;
  umbrellaPolicies: number;
  cyberPolicies: number;
  commercialPolicies: number;
}

export interface EnhancedInputsProps {
  // Marketing
  marketingChannels: MarketingChannel;
  onMarketingChange: (channels: MarketingChannel) => void;

  // Staffing
  staffing: StaffingConfig;
  onStaffingChange: (staffing: StaffingConfig) => void;

  // Products
  productMix: ProductMix;
  onProductMixChange: (mix: ProductMix) => void;

  // Financial
  avgPremium: number;
  onAvgPremiumChange: (value: number) => void;

  commissionStructure: 'independent' | 'captive' | 'hybrid';
  onCommissionStructureChange: (value: 'independent' | 'captive' | 'hybrid') => void;

  growthStage: 'mature' | 'growth';
  onGrowthStageChange: (value: 'mature' | 'growth') => void;

  // Technology toggles
  eoAutomation: boolean;
  renewalProgram: boolean;
  crossSellProgram: boolean;
  onTechnologyChange: (tech: { eoAutomation: boolean; renewalProgram: boolean; crossSellProgram: boolean }) => void;
}

export function EnhancedInputs(props: EnhancedInputsProps) {
  return (
    <Tabs.Root defaultValue="marketing" className="w-full">
      <Tabs.List className="flex border-b border-gray-200 mb-4">
        <Tabs.Trigger
          value="marketing"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Marketing
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="staffing"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Staffing
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="products"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="financial"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="technology"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Technology
          </div>
        </Tabs.Trigger>
      </Tabs.List>

      {/* Marketing Channels */}
      <Tabs.Content value="marketing" className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <strong>Benchmarks:</strong> Referrals convert at 60% vs 15% traditional (4x better).
          Digital channels reduce CAC by 30%.
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Referral Program ($/month) - 60% conversion, $50/lead
            </label>
            <input
              type="number"
              value={props.marketingChannels.referral}
              onChange={(e) => props.onMarketingChange({
                ...props.marketingChannels,
                referral: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Digital Marketing ($/month) - 18% conversion, $25/lead
            </label>
            <input
              type="number"
              value={props.marketingChannels.digital}
              onChange={(e) => props.onMarketingChange({
                ...props.marketingChannels,
                digital: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Traditional Marketing ($/month) - 15% conversion, $35/lead
            </label>
            <input
              type="number"
              value={props.marketingChannels.traditional}
              onChange={(e) => props.onMarketingChange({
                ...props.marketingChannels,
                traditional: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Strategic Partnerships ($/month) - 25% conversion, $40/lead
            </label>
            <input
              type="number"
              value={props.marketingChannels.partnerships}
              onChange={(e) => props.onMarketingChange({
                ...props.marketingChannels,
                partnerships: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="100"
            />
          </div>

          <div className="pt-2 border-t">
            <div className="text-sm font-medium">
              Total Marketing: ${(
                props.marketingChannels.referral +
                props.marketingChannels.digital +
                props.marketingChannels.traditional +
                props.marketingChannels.partnerships
              ).toLocaleString()}/month
            </div>
          </div>
        </div>
      </Tabs.Content>

      {/* Staffing */}
      <Tabs.Content value="staffing" className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <strong>Optimal Ratio:</strong> 2.8 service staff per producer.
          Target RPE: $150k-$200k (good), $300k+ (excellent).
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Producers (FTE)</label>
              <input
                type="number"
                value={props.staffing.producers}
                onChange={(e) => props.onStaffingChange({
                  ...props.staffing,
                  producers: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Staff (FTE)</label>
              <input
                type="number"
                value={props.staffing.serviceStaff}
                onChange={(e) => props.onStaffingChange({
                  ...props.staffing,
                  serviceStaff: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Staff (FTE)</label>
            <input
              type="number"
              value={props.staffing.adminStaff}
              onChange={(e) => props.onStaffingChange({
                ...props.staffing,
                adminStaff: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="0.5"
            />
          </div>

          <div className="pt-2 border-t space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Producer Avg Comp (Annual)</label>
              <input
                type="number"
                value={props.staffing.producerAvgComp}
                onChange={(e) => props.onStaffingChange({
                  ...props.staffing,
                  producerAvgComp: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded"
                min="0"
                step="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Staff Avg Comp (Annual)</label>
              <input
                type="number"
                value={props.staffing.serviceStaffAvgComp}
                onChange={(e) => props.onStaffingChange({
                  ...props.staffing,
                  serviceStaffAvgComp: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded"
                min="0"
                step="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Admin Staff Avg Comp (Annual)</label>
              <input
                type="number"
                value={props.staffing.adminStaffAvgComp}
                onChange={(e) => props.onStaffingChange({
                  ...props.staffing,
                  adminStaffAvgComp: Number(e.target.value)
                })}
                className="w-full px-3 py-2 border rounded"
                min="0"
                step="5000"
              />
            </div>
          </div>

          <div className="pt-2 border-t text-sm">
            <div className="font-medium">
              Total FTE: {(props.staffing.producers + props.staffing.serviceStaff + props.staffing.adminStaff).toFixed(1)}
            </div>
            <div className="text-gray-600">
              Service:Producer Ratio: {props.staffing.producers > 0 ? (props.staffing.serviceStaff / props.staffing.producers).toFixed(1) : '0'}:1
              {props.staffing.producers > 0 && Math.abs((props.staffing.serviceStaff / props.staffing.producers) - 2.8) <= 0.3 && (
                <span className="text-green-600 ml-2">✓ Near optimal 2.8:1</span>
              )}
            </div>
          </div>
        </div>
      </Tabs.Content>

      {/* Product Mix */}
      <Tabs.Content value="products" className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <strong>Critical Threshold:</strong> 1.8 policies per customer = 95% retention rate.
          Bundled customers show 91-95% retention vs 67% monoline.
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Auto Policies</label>
            <input
              type="number"
              value={props.productMix.autoPolicies}
              onChange={(e) => props.onProductMixChange({
                ...props.productMix,
                autoPolicies: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Home Policies</label>
            <input
              type="number"
              value={props.productMix.homePolicies}
              onChange={(e) => props.onProductMixChange({
                ...props.productMix,
                homePolicies: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Umbrella Policies (High Margin - 15% commission)
            </label>
            <input
              type="number"
              value={props.productMix.umbrellaPolicies}
              onChange={(e) => props.onProductMixChange({
                ...props.productMix,
                umbrellaPolicies: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cyber Policies (15-25% commission)
            </label>
            <input
              type="number"
              value={props.productMix.cyberPolicies}
              onChange={(e) => props.onProductMixChange({
                ...props.productMix,
                cyberPolicies: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Commercial Policies</label>
            <input
              type="number"
              value={props.productMix.commercialPolicies}
              onChange={(e) => props.onProductMixChange({
                ...props.productMix,
                commercialPolicies: Number(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded"
              min="0"
            />
          </div>

          <div className="pt-2 border-t text-sm">
            <div className="font-medium">
              Total Policies: {
                props.productMix.autoPolicies +
                props.productMix.homePolicies +
                props.productMix.umbrellaPolicies +
                props.productMix.cyberPolicies +
                props.productMix.commercialPolicies
              }
            </div>
          </div>
        </div>
      </Tabs.Content>

      {/* Financial */}
      <Tabs.Content value="financial" className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <strong>Commission Structures:</strong> Independent (12-15% new, 10-12% renewal) vs
          Captive (20-40% new, 7% renewal). Total comp should not exceed 30-35% of revenue.
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Average Annual Premium</label>
            <input
              type="number"
              value={props.avgPremium}
              onChange={(e) => props.onAvgPremiumChange(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded"
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Commission Structure</label>
            <select
              value={props.commissionStructure}
              onChange={(e) => props.onCommissionStructureChange(e.target.value as any)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="independent">Independent (12-15% new, 10-12% renewal)</option>
              <option value="captive">Captive (20-40% new, 7% renewal)</option>
              <option value="hybrid">Hybrid Model</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Growth Stage</label>
            <select
              value={props.growthStage}
              onChange={(e) => props.onGrowthStageChange(e.target.value as any)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="mature">Mature (3-7% marketing spend)</option>
              <option value="growth">Growth (10-25% marketing spend)</option>
            </select>
          </div>
        </div>
      </Tabs.Content>

      {/* Technology */}
      <Tabs.Content value="technology" className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <strong>Target:</strong> 2.5-3.5% of revenue on technology.
          High-ROI investments shown below.
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={props.eoAutomation}
              onChange={(e) => props.onTechnologyChange({
                eoAutomation: e.target.checked,
                renewalProgram: props.renewalProgram,
                crossSellProgram: props.crossSellProgram
              })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">E&O Certificate Automation ($150/mo)</div>
              <div className="text-sm text-gray-600">
                Prevents 40% of E&O claims | ROI: 700%+
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={props.renewalProgram}
              onChange={(e) => props.onTechnologyChange({
                eoAutomation: props.eoAutomation,
                renewalProgram: e.target.checked,
                crossSellProgram: props.crossSellProgram
              })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">Proactive Renewal Program (Staff Time)</div>
              <div className="text-sm text-gray-600">
                Contact 30-60 days before renewal | 1.5-2% retention improvement
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={props.crossSellProgram}
              onChange={(e) => props.onTechnologyChange({
                eoAutomation: props.eoAutomation,
                renewalProgram: props.renewalProgram,
                crossSellProgram: e.target.checked
              })}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-medium">Cross-Sell Program ($500/mo)</div>
              <div className="text-sm text-gray-600">
                Umbrella & Cyber focus | High margin | Drives 1.8+ policies per customer
              </div>
            </div>
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
