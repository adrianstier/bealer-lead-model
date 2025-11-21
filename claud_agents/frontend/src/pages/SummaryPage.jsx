import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import { summaryMetrics, analysisResults } from '../data/agentData'

// D3 Donut Chart Component
function DonutChart({ data, title, colors }) {
  const ref = useRef()

  useEffect(() => {
    const width = 200
    const height = 200
    const radius = Math.min(width, height) / 2

    d3.select(ref.current).selectAll("*").remove()

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.9)

    const arcs = svg.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colors[i])
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8)
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1)
      })

    // Center text
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text(data.reduce((a, b) => a + b.value, 0).toLocaleString())

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text("Total")

  }, [data, colors])

  return (
    <div className="text-center">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div ref={ref}></div>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center text-xs">
            <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: colors[i] }}></div>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// D3 Bar Chart Component
function BarChart({ data, title, xKey, yKey, color }) {
  const ref = useRef()

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const width = 400 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom

    d3.select(ref.current).selectAll("*").remove()

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d[xKey]))
      .padding(0.3)

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => d[yKey]) * 1.1])

    // X axis
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("font-size", "10px")

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toLocaleString()))
      .selectAll("text")
      .attr("font-size", "10px")

    // Bars
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d[xKey]))
      .attr("y", d => y(d[yKey]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d[yKey]))
      .attr("fill", color)
      .attr("rx", 4)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8)
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1)
      })

    // Value labels
    svg.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d[xKey]) + x.bandwidth() / 2)
      .attr("y", d => y(d[yKey]) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#374151")
      .text(d => d[yKey].toLocaleString())

  }, [data, xKey, yKey, color])

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div ref={ref}></div>
    </div>
  )
}

// D3 Line Chart Component
function LineChart({ data, title }) {
  const ref = useRef()

  useEffect(() => {
    const margin = { top: 20, right: 80, bottom: 40, left: 50 }
    const width = 500 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom

    d3.select(ref.current).selectAll("*").remove()

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const x = d3.scalePoint()
      .range([0, width])
      .domain(data.map(d => d.week))

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, d => Math.max(d.leads, d.quotes * 50, d.conversions * 200))])

    // X axis
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5))

    // Lines
    const metrics = [
      { key: 'leads', color: '#3b82f6', label: 'Leads' },
      { key: 'quotes', color: '#10b981', label: 'Quotes', scale: 50 },
      { key: 'conversions', color: '#8b5cf6', label: 'Conv', scale: 200 }
    ]

    metrics.forEach(metric => {
      const line = d3.line()
        .x(d => x(d.week))
        .y(d => y(d[metric.key] * (metric.scale || 1)))
        .curve(d3.curveMonotoneX)

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", metric.color)
        .attr("stroke-width", 2)
        .attr("d", line)

      // Dots
      svg.selectAll(`.dot-${metric.key}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.week))
        .attr("cy", d => y(d[metric.key] * (metric.scale || 1)))
        .attr("r", 4)
        .attr("fill", metric.color)
    })

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 0)`)

    metrics.forEach((metric, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`)

      g.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", metric.color)
        .attr("rx", 2)

      g.append("text")
        .attr("x", 16)
        .attr("y", 10)
        .attr("font-size", "10px")
        .text(metric.label)
    })

  }, [data])

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div ref={ref}></div>
    </div>
  )
}

// Gauge Chart Component
function GaugeChart({ value, max, label, color }) {
  const ref = useRef()

  useEffect(() => {
    const width = 150
    const height = 100

    d3.select(ref.current).selectAll("*").remove()

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)

    const arc = d3.arc()
      .innerRadius(40)
      .outerRadius(60)
      .startAngle(-Math.PI / 2)

    // Background arc
    svg.append("path")
      .attr("d", arc.endAngle(Math.PI / 2)())
      .attr("fill", "#e5e7eb")

    // Value arc
    const percentage = Math.min(value / max, 1)
    svg.append("path")
      .attr("d", arc.endAngle(-Math.PI / 2 + Math.PI * percentage)())
      .attr("fill", color)

    // Value text
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -20)
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", color)
      .text(typeof value === 'number' && value < 1 ? `${(value * 100).toFixed(1)}%` : value)

  }, [value, max, color])

  return (
    <div className="text-center">
      <div ref={ref}></div>
      <div className="text-xs text-gray-600 -mt-2">{label}</div>
    </div>
  )
}

function SummaryPage() {
  const { kpis, prdTargets, weeklyTrends } = summaryMetrics
  const { vendorPerformance, funnelMetrics } = analysisResults

  // Prepare donut chart data
  const vendorData = Object.entries(vendorPerformance).map(([name, stats]) => ({
    label: name.split('-')[0],
    value: stats.totalLeads
  }))

  const statusData = [
    { label: 'Called', value: funnelMetrics.called },
    { label: 'Contacted', value: funnelMetrics.contacted },
    { label: 'Quoted', value: funnelMetrics.quoted },
    { label: 'Sold', value: funnelMetrics.sold }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Executive Summary</h2>
        <p className="text-gray-600">
          Interactive dashboard visualizing agent analysis results and key performance indicators.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 mb-1">{kpi.name}</div>
            <div className="text-xl font-bold text-gray-900">
              {typeof kpi.value === 'number' && kpi.value < 1 && kpi.unit === '%'
                ? `${(kpi.value * 100).toFixed(1)}%`
                : `${kpi.value.toLocaleString()}${kpi.unit}`}
            </div>
            {kpi.change !== null && (
              <div className={`flex items-center text-xs mt-1 ${
                kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {kpi.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> :
                 kpi.change < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> :
                 <Minus className="w-3 h-3 mr-1" />}
                {kpi.change > 0 ? '+' : ''}{kpi.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <LineChart data={weeklyTrends} title="Weekly Trends (6 Weeks)" />
        </div>

        {/* Vendor Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <BarChart
            data={Object.entries(vendorPerformance).map(([name, stats]) => ({
              vendor: name.split('-')[0],
              leads: stats.totalLeads
            }))}
            title="Leads by Vendor"
            xKey="vendor"
            yKey="leads"
            color="#3b82f6"
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Vendor Donut */}
        <div className="bg-white rounded-lg shadow p-6">
          <DonutChart
            data={vendorData}
            title="Lead Distribution"
            colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']}
          />
        </div>

        {/* Status Donut */}
        <div className="bg-white rounded-lg shadow p-6">
          <DonutChart
            data={statusData}
            title="Funnel Status"
            colors={['#6b7280', '#f59e0b', '#10b981', '#8b5cf6']}
          />
        </div>

        {/* Gauges */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Key Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <GaugeChart value={0.385} max={0.5} label="PBR" color="#ef4444" />
            <GaugeChart value={0.026} max={0.05} label="Conv Rate" color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* PRD Targets */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Target className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">PRD Success Metrics Progress</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(prdTargets).map(([key, data]) => {
            const label = key.replace(/([A-Z])/g, ' $1').trim()
            const progress = (data.current / data.target) * 100
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 capitalize">{label}</span>
                  <span className="text-gray-500">
                    {data.current}{data.unit} / {data.target}{data.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {progress.toFixed(0)}% complete
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quote Rate by Vendor */}
      <div className="bg-white rounded-lg shadow p-6">
        <BarChart
          data={Object.entries(vendorPerformance).map(([name, stats]) => ({
            vendor: name.split('-')[0],
            rate: stats.quoteRate * 100
          }))}
          title="Quote Rate by Vendor (%)"
          xKey="vendor"
          yKey="rate"
          color="#10b981"
        />
      </div>
    </div>
  )
}

export default SummaryPage
