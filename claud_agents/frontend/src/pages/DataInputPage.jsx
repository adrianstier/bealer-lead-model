import React from 'react'
import { FileText, Database, Calendar, Hash, Table } from 'lucide-react'
import { inputData } from '../data/agentData'

function DataInputPage() {
  const { leadData, compensationConfig, analysisFiles } = inputData

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> This data is from Derrick's in-law's agency, not Derrick Bealer's Allstate Santa Barbara agency.
          </p>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Input Summary</h2>
        <p className="text-gray-600">
          Complete overview of the data processed by the agent system from the in-law's agency.
        </p>
      </div>

      {/* Lead Data Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Database className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Lead Data</h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">{leadData.totalRecords.toLocaleString()}</div>
            <div className="text-sm text-blue-600">Total Records</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">{leadData.filesLoaded}</div>
            <div className="text-sm text-green-600">Files Loaded</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700">{leadData.columns.length}</div>
            <div className="text-sm text-purple-600">Data Columns</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-700">56</div>
            <div className="text-sm text-orange-600">Days of Data</div>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Date Range: <strong>{leadData.dateRange.start}</strong> to <strong>{leadData.dateRange.end}</strong></span>
        </div>

        {/* Files Table */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Source Files</h4>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leadData.files.map((file, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900 font-mono">{file.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{file.records.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column Schema */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Schema</h4>
          <div className="flex flex-wrap gap-2">
            {leadData.columns.map((col, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 font-mono"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Records */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Table className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Sample Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leadData.sampleRecords.map((record, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-sm text-gray-900">{record.date}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{record.fullName}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{record.user}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{record.duration}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      record.currentStatus.includes('QUOTED') ? 'bg-green-100 text-green-700' :
                      record.currentStatus.includes('CALLED') ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {record.currentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{record.vendorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compensation Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Hash className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Compensation Configuration</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Position</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-red-700">Policy Bundle Rate</span>
                <span className="text-lg font-bold text-red-700">{(compensationConfig.current.pbr * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-red-700">Portfolio Growth</span>
                <span className="text-lg font-bold text-red-700">{compensationConfig.current.pgItems} items</span>
              </div>
            </div>
          </div>

          {/* Targets */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Targets</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">PBR Target</span>
                <span className="text-lg font-bold text-green-700">{(compensationConfig.targets.pbr * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">PG Target</span>
                <span className="text-lg font-bold text-green-700">+{compensationConfig.targets.pgItems} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* PG Tiers */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Portfolio Growth Tiers</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tier</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Items Range</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {compensationConfig.pgTiers.map((tier, index) => (
                  <tr key={index} className={tier.name === "Below Minimum" ? "bg-red-50" : ""}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{tier.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{tier.itemsMin} to {tier.itemsMax}</td>
                    <td className="px-3 py-2 text-sm text-right font-medium text-green-600">${tier.payout.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NB Variable Comp */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">New Business Variable Comp Rates</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(compensationConfig.nbVariableComp).map(([product, rate]) => (
              <div key={product} className="px-4 py-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 uppercase">{product}</div>
                <div className="text-lg font-bold text-blue-700">{(rate * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Files */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Analysis-Ready Data Files</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Pre-processed CSVs in <code className="bg-gray-100 px-1 rounded">data/05_analysis_ready/</code></p>
        <div className="grid md:grid-cols-2 gap-3">
          {analysisFiles.map((file, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-mono text-sm text-gray-900">{file.name}</div>
              <div className="text-xs text-gray-500 mt-1">{file.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DataInputPage
