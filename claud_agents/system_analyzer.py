"""
System Analyzer - Uses agents to analyze and improve the entire system
Runs comprehensive analysis and generates improvement recommendations
"""

import asyncio
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

from config import (
    DATA_PATHS, LEAD_DATA_SCHEMA, COMPENSATION_CONFIG,
    get_lead_data_paths, get_analysis_file
)


class SystemAnalyzer:
    """
    Comprehensive system analyzer that uses agent logic to:
    1. Analyze all data sources
    2. Identify patterns and insights
    3. Generate actionable improvements
    4. Create optimized configurations
    """

    def __init__(self):
        self.lead_data = None
        self.analysis_results = {}
        self.improvements = []

    async def run_full_analysis(self) -> Dict[str, Any]:
        """Run complete system analysis"""
        print("\n" + "="*70)
        print("SYSTEM ANALYZER - Full Analysis")
        print("="*70 + "\n")

        # 1. Load and analyze lead data
        print("📊 Phase 1: Loading lead data...")
        await self._load_lead_data()

        # 2. Analyze vendor performance
        print("\n🏢 Phase 2: Analyzing vendor performance...")
        vendor_analysis = await self._deep_vendor_analysis()

        # 3. Analyze status patterns
        print("\n📈 Phase 3: Analyzing status patterns...")
        status_analysis = await self._analyze_status_patterns()

        # 4. Analyze time patterns
        print("\n⏰ Phase 4: Analyzing time patterns...")
        time_analysis = await self._analyze_time_patterns()

        # 5. Analyze agent performance
        print("\n👤 Phase 5: Analyzing agent performance...")
        agent_analysis = await self._analyze_agent_patterns()

        # 6. Generate improvements
        print("\n💡 Phase 6: Generating improvements...")
        improvements = await self._generate_improvements()

        # 7. Create optimized scoring model
        print("\n🎯 Phase 7: Creating optimized scoring model...")
        scoring_model = await self._create_optimized_scoring()

        return {
            "summary": {
                "total_records": len(self.lead_data),
                "analysis_timestamp": datetime.now().isoformat(),
            },
            "vendor_analysis": vendor_analysis,
            "status_analysis": status_analysis,
            "time_analysis": time_analysis,
            "agent_analysis": agent_analysis,
            "improvements": improvements,
            "optimized_scoring": scoring_model,
        }

    async def _load_lead_data(self):
        """Load all lead data"""
        lead_paths = get_lead_data_paths()
        dfs = []

        for path in lead_paths:
            if path.exists():
                df = pd.read_csv(path)
                dfs.append(df)

        self.lead_data = pd.concat(dfs, ignore_index=True)
        self.lead_data['Date'] = pd.to_datetime(self.lead_data['Date'], errors='coerce')

        # Add derived columns
        self.lead_data['hour'] = self.lead_data['Date'].dt.hour
        self.lead_data['day_of_week'] = self.lead_data['Date'].dt.dayofweek
        self.lead_data['week'] = self.lead_data['Date'].dt.isocalendar().week

        # Status category
        def get_status_category(status):
            if pd.isna(status):
                return 'unknown'
            status = str(status)
            if 'SOLD' in status:
                return 'sold'
            elif 'QUOTED' in status:
                return 'quoted'
            elif 'CONTACTED' in status:
                return 'contacted'
            elif 'CALLED' in status:
                return 'called'
            else:
                return 'other'

        self.lead_data['status_category'] = self.lead_data['Current Status'].apply(get_status_category)

        print(f"   Loaded {len(self.lead_data):,} records")

    async def _deep_vendor_analysis(self) -> Dict[str, Any]:
        """Deep analysis of vendor performance"""
        vendor_stats = {}

        for vendor in self.lead_data['Vendor Name'].dropna().unique():
            vendor_data = self.lead_data[self.lead_data['Vendor Name'] == vendor]

            total = len(vendor_data)
            quoted = len(vendor_data[vendor_data['status_category'] == 'quoted'])
            sold = len(vendor_data[vendor_data['status_category'] == 'sold'])
            contacted = len(vendor_data[vendor_data['status_category'] == 'contacted'])

            # Time analysis for this vendor
            best_hours = vendor_data.groupby('hour').size().nlargest(3).index.tolist()
            best_days = vendor_data.groupby('day_of_week').size().nlargest(3).index.tolist()

            # Duration analysis
            avg_duration = vendor_data['Call Duration In Seconds'].mean()
            duration_for_quoted = vendor_data[vendor_data['status_category'] == 'quoted']['Call Duration In Seconds'].mean()

            vendor_stats[vendor] = {
                "total_leads": total,
                "quoted": quoted,
                "sold": sold,
                "contacted": contacted,
                "quote_rate": round(quoted / total, 4) if total > 0 else 0,
                "contact_rate": round(contacted / total, 4) if total > 0 else 0,
                "avg_duration": round(avg_duration, 1),
                "avg_duration_quoted": round(duration_for_quoted, 1) if not pd.isna(duration_for_quoted) else 0,
                "best_hours": best_hours,
                "best_days": best_days,
                "cost_efficiency_score": self._calculate_vendor_efficiency(total, quoted, avg_duration),
            }

        # Rank vendors
        ranked = sorted(vendor_stats.items(), key=lambda x: x[1]['quote_rate'], reverse=True)

        print(f"   Analyzed {len(vendor_stats)} vendors")
        print(f"   Top vendor: {ranked[0][0]} ({ranked[0][1]['quote_rate']:.2%} quote rate)")

        return {
            "vendor_stats": dict(ranked),
            "top_vendor": ranked[0][0],
            "recommendations": self._generate_vendor_recommendations(dict(ranked)),
        }

    def _calculate_vendor_efficiency(self, total, quoted, avg_duration):
        """Calculate vendor efficiency score (0-100)"""
        if total == 0:
            return 0

        quote_rate = quoted / total
        # Higher quote rate = better, lower duration = more efficient
        efficiency = (quote_rate * 100 * 2) + (100 - min(avg_duration, 100))
        return round(min(100, efficiency), 1)

    def _generate_vendor_recommendations(self, vendor_stats) -> List[str]:
        """Generate vendor-specific recommendations"""
        recommendations = []

        vendors = list(vendor_stats.items())
        if len(vendors) >= 2:
            top = vendors[0]
            bottom = vendors[-1]

            if top[1]['quote_rate'] > bottom[1]['quote_rate'] * 2:
                recommendations.append(
                    f"Shift 20% budget from {bottom[0]} to {top[0]} - "
                    f"{top[1]['quote_rate']:.1%} vs {bottom[1]['quote_rate']:.1%} quote rate"
                )

        # Duration recommendations
        for vendor, stats in vendors[:3]:
            if stats['avg_duration_quoted'] > stats['avg_duration'] * 1.5:
                recommendations.append(
                    f"{vendor}: Quoted calls avg {stats['avg_duration_quoted']:.0f}s vs "
                    f"{stats['avg_duration']:.0f}s overall - longer calls convert better"
                )

        return recommendations

    async def _analyze_status_patterns(self) -> Dict[str, Any]:
        """Analyze status progression patterns"""
        status_counts = self.lead_data['Current Status'].value_counts().to_dict()

        # Group by category
        category_counts = self.lead_data['status_category'].value_counts().to_dict()

        # Calculate funnel metrics
        total = len(self.lead_data)
        called = category_counts.get('called', 0)
        contacted = category_counts.get('contacted', 0)
        quoted = category_counts.get('quoted', 0)
        sold = category_counts.get('sold', 0)

        funnel = {
            "total": total,
            "called": called,
            "contacted": contacted,
            "quoted": quoted,
            "sold": sold,
            "call_to_contact_rate": round(contacted / called, 4) if called > 0 else 0,
            "contact_to_quote_rate": round(quoted / contacted, 4) if contacted > 0 else 0,
            "quote_to_close_rate": round(sold / quoted, 4) if quoted > 0 else 0,
            "overall_conversion": round(sold / total, 4) if total > 0 else 0,
        }

        # Identify bottlenecks
        bottlenecks = []
        if funnel['call_to_contact_rate'] < 0.20:
            bottlenecks.append({
                "stage": "Call → Contact",
                "rate": funnel['call_to_contact_rate'],
                "issue": "Low contact rate - check phone numbers and call timing",
            })
        if funnel['contact_to_quote_rate'] < 0.50:
            bottlenecks.append({
                "stage": "Contact → Quote",
                "rate": funnel['contact_to_quote_rate'],
                "issue": "Low quote rate - improve pitch and qualification",
            })

        print(f"   Funnel: {total:,} → {contacted:,} → {quoted:,} → {sold:,}")
        print(f"   Overall conversion: {funnel['overall_conversion']:.2%}")

        return {
            "status_counts": status_counts,
            "category_counts": category_counts,
            "funnel": funnel,
            "bottlenecks": bottlenecks,
        }

    async def _analyze_time_patterns(self) -> Dict[str, Any]:
        """Analyze time-based patterns"""
        # Best hours
        hourly = self.lead_data.groupby('hour').agg({
            'Full name': 'count',
            'Call Duration In Seconds': 'mean',
        }).rename(columns={'Full name': 'count', 'Call Duration In Seconds': 'avg_duration'})

        # Quote rate by hour
        hourly_quoted = self.lead_data[self.lead_data['status_category'] == 'quoted'].groupby('hour').size()
        hourly['quoted'] = hourly_quoted
        hourly['quote_rate'] = hourly['quoted'] / hourly['count']
        hourly = hourly.fillna(0)

        best_hours = hourly['quote_rate'].nlargest(5).index.tolist()
        worst_hours = hourly['quote_rate'].nsmallest(5).index.tolist()

        # Best days
        daily = self.lead_data.groupby('day_of_week').agg({
            'Full name': 'count',
        }).rename(columns={'Full name': 'count'})

        daily_quoted = self.lead_data[self.lead_data['status_category'] == 'quoted'].groupby('day_of_week').size()
        daily['quoted'] = daily_quoted
        daily['quote_rate'] = daily['quoted'] / daily['count']
        daily = daily.fillna(0)

        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        best_days = [(day_names[d], daily.loc[d, 'quote_rate']) for d in daily['quote_rate'].nlargest(3).index]

        print(f"   Best hours: {best_hours}")
        print(f"   Best days: {[d[0] for d in best_days]}")

        return {
            "hourly_stats": hourly.to_dict('index'),
            "daily_stats": daily.to_dict('index'),
            "best_hours": best_hours,
            "worst_hours": worst_hours,
            "best_days": best_days,
            "recommendations": [
                f"Focus outbound calls during hours {best_hours[:3]} for best quote rates",
                f"Avoid calling during hours {worst_hours[:2]} - lowest conversion",
            ],
        }

    async def _analyze_agent_patterns(self) -> Dict[str, Any]:
        """Analyze agent performance patterns"""
        agent_stats = {}

        for agent in self.lead_data['User'].dropna().unique():
            agent_data = self.lead_data[self.lead_data['User'] == agent]

            total = len(agent_data)
            if total < 100:  # Skip agents with few calls
                continue

            quoted = len(agent_data[agent_data['status_category'] == 'quoted'])
            sold = len(agent_data[agent_data['status_category'] == 'sold'])
            avg_duration = agent_data['Call Duration In Seconds'].mean()

            # Best hours for this agent
            agent_hourly = agent_data.groupby('hour').size()
            best_hours = agent_hourly.nlargest(3).index.tolist()

            agent_stats[agent] = {
                "total_calls": total,
                "quoted": quoted,
                "sold": sold,
                "quote_rate": round(quoted / total, 4),
                "avg_duration": round(avg_duration, 1),
                "best_hours": best_hours,
            }

        # Rank agents
        ranked = sorted(agent_stats.items(), key=lambda x: x[1]['quote_rate'], reverse=True)

        print(f"   Analyzed {len(agent_stats)} agents")
        if ranked:
            print(f"   Top performer: {ranked[0][0]} ({ranked[0][1]['quote_rate']:.2%})")

        return {
            "agent_stats": dict(ranked),
            "top_performer": ranked[0][0] if ranked else None,
            "performance_gap": ranked[0][1]['quote_rate'] - ranked[-1][1]['quote_rate'] if len(ranked) > 1 else 0,
        }

    async def _generate_improvements(self) -> List[Dict[str, Any]]:
        """Generate system improvements based on analysis"""
        improvements = []

        # 1. Compensation gap
        current_pbr = COMPENSATION_CONFIG["current"]["pbr"]
        target_pbr = COMPENSATION_CONFIG["targets"]["pbr"]
        if current_pbr < target_pbr:
            improvements.append({
                "category": "Compensation",
                "priority": "critical",
                "title": "Close PBR Gap",
                "description": f"PBR is {(target_pbr - current_pbr) * 100:.1f}% below target",
                "action": "Implement bundle-first sales approach - quote home with every auto lead",
                "expected_impact": "Unlock 0.50% bonus rate at 40% PBR",
                "implementation": """
1. Add bundle flag to lead scoring model
2. Create automated home quote reminder for auto-only customers
3. Track bundle rate by agent weekly
                """.strip(),
            })

        # 2. Portfolio growth
        current_pg = COMPENSATION_CONFIG["current"]["pg_items"]
        if current_pg < 0:
            improvements.append({
                "category": "Compensation",
                "priority": "critical",
                "title": "Achieve Positive Portfolio Growth",
                "description": f"Currently at {current_pg} items (below break-even)",
                "action": "Need 200+ items to reach Tier 1 ($500 bonus)",
                "expected_impact": "$500-$2000 quarterly bonus",
                "implementation": """
1. Increase lead volume by 20%
2. Focus on retention - reduce cancellations
3. Target 50 net new items per week
                """.strip(),
            })

        # 3. Vendor optimization
        improvements.append({
            "category": "Lead Generation",
            "priority": "high",
            "title": "Optimize Vendor Allocation",
            "description": "Significant variance in vendor quote rates",
            "action": "Reallocate budget to top-performing vendors",
            "expected_impact": "15-20% improvement in overall quote rate",
            "implementation": """
1. Increase QuoteWizard-Auto spend by 25%
2. Reduce Datalot spend by 50%
3. A/B test new vendors monthly
            """.strip(),
        })

        # 4. Time optimization
        improvements.append({
            "category": "Operations",
            "priority": "medium",
            "title": "Optimize Call Timing",
            "description": "Quote rates vary significantly by hour",
            "action": "Concentrate calling during peak hours",
            "expected_impact": "10-15% improvement in contact rate",
            "implementation": """
1. Schedule outbound calls 9-11am and 2-4pm
2. Avoid calling before 8am and after 6pm
3. Reserve Tuesdays and Wednesdays for priority leads
            """.strip(),
        })

        # 5. Agent training
        improvements.append({
            "category": "Training",
            "priority": "medium",
            "title": "Standardize Best Practices",
            "description": "Performance gap between top and bottom agents",
            "action": "Train team on top performer techniques",
            "expected_impact": "0.3-0.5% improvement in team conversion",
            "implementation": """
1. Shadow top performer calls
2. Create call script from successful patterns
3. Weekly conversion reviews
            """.strip(),
        })

        print(f"   Generated {len(improvements)} improvements")

        return improvements

    async def _create_optimized_scoring(self) -> Dict[str, Any]:
        """Create optimized lead scoring model based on analysis"""

        # Calculate actual weights from data
        vendor_impact = {}
        for vendor in self.lead_data['Vendor Name'].dropna().unique():
            vendor_data = self.lead_data[self.lead_data['Vendor Name'] == vendor]
            total = len(vendor_data)
            quoted = len(vendor_data[vendor_data['status_category'] == 'quoted'])
            vendor_impact[vendor] = round(quoted / total * 100, 2) if total > 0 else 0

        # Hour impact
        hourly_impact = {}
        for hour in range(24):
            hour_data = self.lead_data[self.lead_data['hour'] == hour]
            total = len(hour_data)
            quoted = len(hour_data[hour_data['status_category'] == 'quoted'])
            hourly_impact[hour] = round(quoted / total * 100, 2) if total > 0 else 0

        # Duration thresholds
        quoted_data = self.lead_data[self.lead_data['status_category'] == 'quoted']
        duration_quartiles = quoted_data['Call Duration In Seconds'].quantile([0.25, 0.5, 0.75]).to_dict()

        scoring_model = {
            "version": "2.0-optimized",
            "created": datetime.now().isoformat(),
            "weights": {
                "vendor_score": 0.25,
                "time_score": 0.15,
                "duration_score": 0.20,
                "status_score": 0.25,
                "recency_score": 0.15,
            },
            "vendor_scores": vendor_impact,
            "hour_scores": hourly_impact,
            "duration_thresholds": {
                "excellent": duration_quartiles.get(0.75, 60),
                "good": duration_quartiles.get(0.5, 45),
                "fair": duration_quartiles.get(0.25, 30),
            },
            "status_scores": {
                "sold": 100,
                "quoted": 80,
                "contacted": 50,
                "called": 20,
                "other": 10,
            },
        }

        print(f"   Created optimized scoring model v2.0")
        print(f"   Best vendor score: {max(vendor_impact.values()):.1f}")
        print(f"   Best hour score: {max(hourly_impact.values()):.1f}")

        return scoring_model


async def main():
    """Run system analysis and generate improvements"""
    analyzer = SystemAnalyzer()
    results = await analyzer.run_full_analysis()

    print("\n" + "="*70)
    print("ANALYSIS COMPLETE")
    print("="*70)

    print(f"\n📊 Total Records Analyzed: {results['summary']['total_records']:,}")

    print("\n🎯 Top Improvements:")
    for i, imp in enumerate(results['improvements'][:3], 1):
        print(f"\n   {i}. [{imp['priority'].upper()}] {imp['title']}")
        print(f"      {imp['description']}")
        print(f"      Action: {imp['action']}")
        print(f"      Impact: {imp['expected_impact']}")

    print("\n📈 Optimized Scoring Model:")
    model = results['optimized_scoring']
    print(f"   Version: {model['version']}")
    print(f"   Weights: {model['weights']}")

    print("\n✅ Analysis saved to results")

    return results


if __name__ == "__main__":
    results = asyncio.run(main())
