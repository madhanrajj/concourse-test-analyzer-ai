import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, AlertCircle, CheckCircle, XCircle, Clock, 
  TrendingUp, Eye, Trash2, Code, Lightbulb, Target, Copy, Check,
  Download, ChevronDown, ChevronUp, Play, RefreshCw
} from 'lucide-react';
import axios from 'axios';

const SinglePageAnalyzer = () => {
  // State Management
  const [logContent, setLogContent] = useState('');
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [expandedFailures, setExpandedFailures] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);
  
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  // File Handling
  const handleFileLoad = (selectedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
      setLogContent(content);
      setShowPreview(true);
    };
    reader.readAsText(selectedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleFileLoad(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.txt') || droppedFile.name.endsWith('.log'))) {
      setFile(droppedFile);
      handleFileLoad(droppedFile);
    } else {
      setError('Please drop a .txt or .log file');
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFileContent('');
    setShowPreview(false);
    setLogContent('');
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Analysis
  const handleAnalyze = async () => {
    if (!logContent.trim()) {
      setError('Please paste or upload test log content');
      return;
    }

    setError('');
    setLoading(true);
    setProgress('Parsing test logs...');

    try {
      const response = await axios.post('/api/analyze', { logContent });
      setProgress('Analyzing failures with AI...');
      
      setTimeout(() => {
        setAnalysisResult(response.data);
        setLoading(false);
        setProgress('');
        
        // Scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze logs');
      setLoading(false);
      setProgress('');
    }
  };

  // Helper Functions
  const toggleFailure = (index) => {
    setExpandedFailures(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800 border-red-300',
      'High': 'bg-orange-100 text-orange-800 border-orange-300',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Low': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: analysisResult.metrics,
      summary: analysisResult.summary,
      analyses: analysisResult.analyses.map(a => ({
        scenario: a.failure.scenario,
        feature: a.failure.feature,
        tags: a.failure.tags,
        severity: a.analysis.severity,
        rootCause: a.analysis.rootCause,
        solutions: a.analysis.solutions,
        quickFix: a.analysis.quickFix
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Test Analyzer</h1>
                <p className="text-sm text-gray-600">Complete Analysis in One Page</p>
              </div>
            </div>
            {analysisResult && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleClearFile}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section 1: Input Area */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">1. Upload Test Logs</h2>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!showPreview ? (
            <>
              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all mb-4 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".txt,.log"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                    isDragging ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className="text-sm text-gray-600 mb-2">
                    {isDragging ? (
                      <span className="font-medium text-blue-600">Drop file here</span>
                    ) : (
                      <>Drag & drop or click to upload</>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">TXT or LOG files • Max 10MB</p>
                </label>
              </div>

              {/* Paste Area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Paste Your Test Logs
                </label>
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your Cucumber test logs here...&#10;&#10;Example:&#10;1 failed&#10;24 passed&#10;25 executed&#10;&#10;Scenario: Validate error response&#10;  Error: expect(received).toBe(expected)&#10;  Expected: 'User is not authorized'&#10;  Received: 'User is not authorized to access'"
                />
              </div>
            </>
          ) : (
            /* Preview Area */
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    File Loaded: {file?.name || 'Content Ready'}
                  </span>
                </div>
                <button
                  onClick={handleClearFile}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Content Preview</label>
                  <span className="text-xs text-gray-500">
                    {fileContent.length || logContent.length} characters • {(fileContent || logContent).split('\n').length} lines
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={fileContent || logContent}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFileContent(val);
                      setLogContent(val);
                    }}
                    className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
                  />
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !logContent.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{progress}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        </section>

        {/* Section 2: Analysis Results */}
        {analysisResult && (
          <div ref={resultsRef} className="space-y-8">
            
            {/* Metrics Overview */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">2. Test Metrics</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">Total</span>
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analysisResult.metrics.totalScenarios}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">Passed</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analysisResult.metrics.passedScenarios}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-600">Failed</span>
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analysisResult.metrics.failedScenarios}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-600">Success</span>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analysisResult.metrics.successRate}%</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Test Execution</span>
                  <span className="text-gray-600">
                    {analysisResult.metrics.passedScenarios} passed, {analysisResult.metrics.failedScenarios} failed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div className="flex h-full">
                    <div
                      className="bg-green-500"
                      style={{ width: `${(analysisResult.metrics.passedScenarios / analysisResult.metrics.totalScenarios) * 100}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{ width: `${(analysisResult.metrics.failedScenarios / analysisResult.metrics.totalScenarios) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Failures Analysis */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">3. Failure Analysis & AI Solutions</h2>
                </div>
                <span className="text-sm text-gray-600">
                  {analysisResult.analyses.length} failure{analysisResult.analyses.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {analysisResult.analyses.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">All Tests Passed!</h3>
                  <p className="text-gray-600">No failures to analyze 🎉</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysisResult.analyses.map((item, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      {/* Failure Header */}
                      <div
                        onClick={() => toggleFailure(index)}
                        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(item.analysis.severity)}`}>
                                {item.analysis.severity}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.failure.scenario}
                            </h3>
                            {item.failure.feature && (
                              <p className="text-xs text-gray-500 font-mono mb-1">
                                📂 {item.failure.feature}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Root Cause:</span> {item.analysis.rootCause}
                            </p>
                          </div>
                          <button className="ml-4">
                            {expandedFailures[index] ? (
                              <ChevronUp className="w-6 h-6 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedFailures[index] && (
                        <div className="p-6 bg-white border-t-2 border-gray-200">
                          <div className="grid md:grid-cols-2 gap-6">
                            
                            {/* Left: Error Details */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                <Code className="w-5 h-5 text-blue-600" />
                                <span>Error Details</span>
                              </h4>

                              {item.failure.tags && item.failure.tags.length > 0 && (
                                <div>
                                  <label className="text-xs font-medium text-gray-600 mb-1 block">Tags</label>
                                  <div className="flex flex-wrap gap-1">
                                    {item.failure.tags.map((tag, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200">
                                        @{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-xs font-medium text-gray-600">Location</label>
                                <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded mt-1">
                                  {item.failure.location}:{item.failure.line}
                                </p>
                              </div>

                              {item.failure.expected && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                  <div className="mb-2">
                                    <label className="text-xs font-semibold text-yellow-900">Expected</label>
                                    <p className="text-sm text-gray-900 mt-1 break-words">{item.failure.expected}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-yellow-900">Received</label>
                                    <p className="text-sm text-gray-900 mt-1 break-words">{item.failure.received}</p>
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-xs font-medium text-gray-600">Impact</label>
                                <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded mt-1 border border-orange-200">
                                  {item.analysis.impact}
                                </p>
                              </div>
                            </div>

                            {/* Right: AI Solutions */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                <span>AI Solutions</span>
                              </h4>

                              {item.analysis.solutions.map((solution, sIdx) => (
                                <div key={sIdx} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        solution.priority === 'High' ? 'bg-red-100 text-red-800' :
                                        solution.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {solution.priority}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleCopyCode(solution.code, `sol-${index}-${sIdx}`)}
                                      className="p-1 hover:bg-white rounded transition"
                                    >
                                      {copiedCode === `sol-${index}-${sIdx}` ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-gray-600" />
                                      )}
                                    </button>
                                  </div>
                                  <h5 className="font-semibold text-sm text-gray-900 mb-1">{solution.title}</h5>
                                  <p className="text-xs text-gray-700 mb-2">{solution.explanation}</p>
                                  <pre className="text-xs font-mono bg-white p-2 rounded border overflow-x-auto">
                                    {solution.code}
                                  </pre>
                                </div>
                              ))}

                              {/* Quick Fix */}
                              {item.analysis.quickFix && (
                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold text-green-900 flex items-center space-x-2">
                                      <Target className="w-4 h-4" />
                                      <span>Quick Fix</span>
                                    </h5>
                                    <span className="text-sm font-bold text-green-600">
                                      {item.analysis.quickFix.confidence}% Confidence
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium text-red-600">Current Code</label>
                                        <button
                                          onClick={() => handleCopyCode(item.analysis.quickFix.currentCode, `curr-${index}`)}
                                          className="text-xs text-gray-600 hover:text-gray-900"
                                        >
                                          {copiedCode === `curr-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                      </div>
                                      <pre className="text-xs font-mono bg-red-50 p-2 rounded border border-red-200 overflow-x-auto">
                                        {item.analysis.quickFix.currentCode}
                                      </pre>
                                    </div>

                                    <div className="text-center">
                                      <span className="text-gray-400">↓</span>
                                    </div>

                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-medium text-green-600">Fixed Code</label>
                                        <button
                                          onClick={() => handleCopyCode(item.analysis.quickFix.fixedCode, `fix-${index}`)}
                                          className="text-xs text-gray-600 hover:text-gray-900"
                                        >
                                          {copiedCode === `fix-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                      </div>
                                      <pre className="text-xs font-mono bg-green-100 p-2 rounded border border-green-200 overflow-x-auto">
                                        {item.analysis.quickFix.fixedCode}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            AI-Powered Test Analysis • Single Page Application • Built with React & AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SinglePageAnalyzer;