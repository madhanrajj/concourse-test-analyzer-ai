import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, AlertTriangle, Lightbulb, Code, Target } from 'lucide-react';

const AnalysisDetail = ({ failure, analysis, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Failures List</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Error Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Error Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Scenario</label>
                <p className="text-gray-900 mt-1">{failure.scenario}</p>
              </div>

              {failure.feature && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Feature File</label>
                  <p className="text-gray-900 mt-1 font-mono text-xs bg-blue-50 p-2 rounded border border-blue-200">
                    {failure.feature}
                  </p>
                </div>
              )}

              {failure.tags && failure.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {failure.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded border border-purple-200"
                      >
                        @{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Error Type</label>
                <p className="text-gray-900 mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                  {failure.errorType}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-900 mt-1 font-mono text-sm">
                  {failure.location}:{failure.line}:{failure.column}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Error Message</label>
                <p className="text-gray-900 mt-1 font-mono text-sm bg-red-50 p-3 rounded border border-red-200">
                  {failure.errorMessage}
                </p>
              </div>

              {failure.expected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="mb-3">
                    <label className="text-sm font-semibold text-yellow-900">Expected</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm break-words">
                      {failure.expected}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-yellow-900">Received</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm break-words">
                      {failure.received}
                    </p>
                  </div>
                </div>
              )}

              {failure.stackTrace && failure.stackTrace.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Stack Trace</label>
                  <pre className="text-xs text-gray-700 mt-1 bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                    {failure.stackTrace.join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex -mb-px">
                {['overview', 'solutions', 'quickfix'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'overview' && 'Overview'}
                    {tab === 'solutions' && 'Solutions'}
                    {tab === 'quickfix' && 'Quick Fix'}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Root Cause</h3>
                    </div>
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      {analysis.rootCause}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Severity</label>
                      <span className={`mt-2 inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getSeverityColor(analysis.severity)}`}>
                        {analysis.severity}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Category</label>
                      <p className="mt-2 text-gray-900 font-medium">{analysis.category}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Issue Type</label>
                    <p className="mt-2">
                      {analysis.isTestIssue ? (
                        <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Test Issue - Not an Application Bug
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Potential Application Bug
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Impact</h3>
                    </div>
                    <p className="text-gray-700 bg-orange-50 p-4 rounded-lg border border-orange-200">
                      {analysis.impact}
                    </p>
                  </div>
                </div>
              )}

              {/* Solutions Tab */}
              {activeTab === 'solutions' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Recommended Solutions</h3>
                  </div>

                  {analysis.solutions.map((solution, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-4 ${getPriorityColor(solution.priority)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm uppercase">{solution.priority} Priority</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(solution.code, `solution-${index}`)}
                          className="p-1 hover:bg-white rounded transition"
                        >
                          {copiedCode === `solution-${index}` ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-2">{solution.title}</h4>
                      <p className="text-sm text-gray-700 mb-3">{solution.explanation}</p>

                      <div className="bg-white bg-opacity-50 rounded p-3">
                        <pre className="text-xs font-mono overflow-x-auto">{solution.code}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Fix Tab */}
              {activeTab === 'quickfix' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Code className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Quick Fix</h3>
                  </div>

                  {analysis.quickFix && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Confidence Score</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {analysis.quickFix.confidence}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${analysis.quickFix.confidence}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">File</label>
                        <p className="text-gray-900 mt-1 font-mono text-sm">
                          {analysis.quickFix.file}:{analysis.quickFix.line}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-red-600">Current Code</label>
                          <button
                            onClick={() => handleCopyCode(analysis.quickFix.currentCode, 'current')}
                            className="p-1 hover:bg-gray-100 rounded transition"
                          >
                            {copiedCode === 'current' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                        <pre className="text-sm font-mono bg-red-50 p-4 rounded border border-red-200 overflow-x-auto">
                          {analysis.quickFix.currentCode}
                        </pre>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="bg-gray-200 rounded-full p-2">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-green-600">Fixed Code</label>
                          <button
                            onClick={() => handleCopyCode(analysis.quickFix.fixedCode, 'fixed')}
                            className="p-1 hover:bg-gray-100 rounded transition"
                          >
                            {copiedCode === 'fixed' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                        <pre className="text-sm font-mono bg-green-50 p-4 rounded border border-green-200 overflow-x-auto">
                          {analysis.quickFix.fixedCode}
                        </pre>
                      </div>
                    </>
                  )}

                  {analysis.aiError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm text-yellow-800">
                        AI analysis unavailable. Please review manually.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;
