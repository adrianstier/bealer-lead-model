import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Database, BarChart3, PieChart } from 'lucide-react'
import DataInputPage from './pages/DataInputPage'
import AnalysisPage from './pages/AnalysisPage'
import SummaryPage from './pages/SummaryPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Analysis Dashboard</h1>
                <p className="text-sm text-gray-500">In-Law's Agency Data Analysis</p>
              </div>
              <nav className="flex space-x-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <Database className="w-4 h-4 mr-2" />
                  Data Input
                </NavLink>
                <NavLink
                  to="/analysis"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analysis
                </NavLink>
                <NavLink
                  to="/summary"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  Summary
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<DataInputPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/summary" element={<SummaryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
