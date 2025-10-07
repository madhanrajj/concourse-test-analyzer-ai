import React, { useState } from 'react';
import { AlertCircle, ChevronRight, Filter } from 'lucide-react';
import ExportReport from './ExportReport';

const FailuresList = ({ data, onFailureSelect }) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Assertion Error':
        return 'bg-purple-100 text-purple-800';
      case 'Timeout':
        return 'bg-yellow-100 text-yellow-800';
      case 'API Error':
        return 'bg-red-100 text-red-800';
      case 'Infrastructure':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter analyses
  const filteredAnalyses = data.analyses.filter(item => {
    const matchesSeverity = severityFilter === 'all' || item.analysis.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || item.analysis.category === categoryFilter;
    return matchesSeverity && matchesCategory;
  });

  // Get unique values for filters
  const severities = ['all', ...new Set(data.analyses.map(a => a.analysis.severity))];
  const categories = ['all', ...new Set(data.analyses.map(a => a.analysis.category))];

  if (data.analyses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Failures Detected</h3>
        <p className="text-gray-600">All tests passed successfully! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters and Export */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Failure Analysis ({filteredAnalyses.length})
          </h2>
          <ExportReport data={data} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {severities.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Failures List */}
      <div className="space-y-3">
        {filteredAnalyses.map((item, index) => (
          <div
            key={index}
            onClick={() => onFailureSelect(item.failure, item.analysis)}
            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition cursor-pointer border-l-4 border-red-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(item.analysis.severity)}`}>
                    {item.analysis.severity}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.analysis.category)}`}>
                    {item.analysis.category}
                  </span>
                  {item.analysis.isTestIssue ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Test Issue
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      App Bug
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.failure.scenario}
                </h3>

                {item.failure.feature && (
                  <p className="text-xs text-gray-500 mb-2 font-mono">
                    📂 {item.failure.feature}
                  </p>
                )}

                {item.failure.tags && item.failure.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.failure.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200"
                      >
                        @{tag}
                      </span>
                    ))}
                    {item.failure.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{item.failure.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Root Cause:</span> {item.analysis.rootCause}
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>📁 {item.failure.location}:{item.failure.line}</span>
                  <span>🎯 Confidence: {item.analysis.quickFix?.confidence || 0}%</span>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {filteredAnalyses.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No failures match the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default FailuresList;
