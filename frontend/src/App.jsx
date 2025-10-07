import React, { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import Dashboard from './components/Dashboard';
import FailuresList from './components/FailuresList';
import AnalysisDetail from './components/AnalysisDetail';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFailure, setSelectedFailure] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setSelectedFailure(null);
    setLoading(false);
  };

  const handleFailureSelect = (failure, analysis) => {
    setSelectedFailure({ failure, analysis });
  };

  const handleBack = () => {
    setSelectedFailure(null);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSelectedFailure(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Automation AI Analyzer</h1>
                <p className="text-sm text-gray-600">Intelligent test failure analysis powered by AI</p>
              </div>
            </div>
            {analysisResult && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!analysisResult && (
          <UploadComponent 
            onAnalysisComplete={handleAnalysisComplete}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {analysisResult && !selectedFailure && (
          <div className="space-y-6">
            <Dashboard data={analysisResult} />
            <FailuresList 
              data={analysisResult} 
              onFailureSelect={handleFailureSelect}
            />
          </div>
        )}

        {selectedFailure && (
          <AnalysisDetail 
            failure={selectedFailure.failure}
            analysis={selectedFailure.analysis}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Phase 1: Quick Test Analysis Using AI • Built with React, Node.js, and AI
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
