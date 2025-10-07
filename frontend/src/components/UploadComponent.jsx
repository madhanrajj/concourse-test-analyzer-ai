import React, { useState } from 'react';
import { Upload, FileText, Cloud, AlertCircle } from 'lucide-react';
import axios from 'axios';

const UploadComponent = ({ onAnalysisComplete, loading, setLoading }) => {
  const [activeTab, setActiveTab] = useState('paste');
  const [logContent, setLogContent] = useState('');
  const [file, setFile] = useState(null);
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Key, setS3Key] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handlePasteAnalysis = async () => {
    if (!logContent.trim()) {
      setError('Please paste test log content');
      return;
    }

    setError('');
    setLoading(true);
    setProgress('Parsing test logs...');

    try {
      const response = await axios.post('/api/analyze', { logContent });
      setProgress('Analyzing failures with AI...');
      
      setTimeout(() => {
        onAnalysisComplete(response.data);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze logs');
      setLoading(false);
      setProgress('');
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setError('');
    setLoading(true);
    setProgress('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/analyze/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProgress('Analyzing failures with AI...');
      
      setTimeout(() => {
        onAnalysisComplete(response.data);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze file');
      setLoading(false);
      setProgress('');
    }
  };

  const handleS3Fetch = async () => {
    if (!s3Key.trim()) {
      setError('Please enter S3 key');
      return;
    }

    setError('');
    setLoading(true);
    setProgress('Fetching from S3...');

    try {
      const response = await axios.post('/api/s3/fetch', {
        bucket: s3Bucket || undefined,
        key: s3Key
      });
      setProgress('Analyzing failures with AI...');
      
      setTimeout(() => {
        onAnalysisComplete(response.data);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch from S3');
      setLoading(false);
      setProgress('');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Tests</h3>
          <p className="text-gray-600">{progress}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'paste'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline-block w-4 h-4 mr-2" />
              Paste Content
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="inline-block w-4 h-4 mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('s3')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 's3'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cloud className="inline-block w-4 h-4 mr-2" />
              Fetch from S3
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Log Content
                </label>
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Paste your Cucumber test logs here...&#10;&#10;Example:&#10;25 scenarios (1 failed, 24 passed)&#10;70 steps (1 failed, 69 passed)&#10;0m54.214s&#10;&#10;Scenario: Validate error response&#10;  Error: expect(received).toBe(expected)&#10;  Expected: 'User is not authorized'&#10;  Received: 'User is not authorized to access'"
                />
              </div>
              <button
                onClick={handlePasteAnalysis}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
              >
                Analyze Logs
              </button>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Test Log File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    accept=".txt,.log"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      {file ? (
                        <span className="font-medium text-blue-600">{file.name}</span>
                      ) : (
                        <>Click to upload or drag and drop<br />TXT or LOG files</>
                      )}
                    </p>
                  </label>
                </div>
              </div>
              <button
                onClick={handleFileUpload}
                disabled={!file}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze File
              </button>
            </div>
          )}

          {activeTab === 's3' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S3 Bucket (optional)
                </label>
                <input
                  type="text"
                  value={s3Bucket}
                  onChange={(e) => setS3Bucket(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty to use default bucket"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S3 Key *
                </label>
                <input
                  type="text"
                  value={s3Key}
                  onChange={(e) => setS3Key(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="path/to/test-results.txt"
                />
              </div>
              <button
                onClick={handleS3Fetch}
                disabled={!s3Key}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fetch and Analyze
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
