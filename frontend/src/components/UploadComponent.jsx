import React, { useState, useRef } from 'react';
import { Upload, FileText, Cloud, AlertCircle, Eye, Trash2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const UploadComponent = ({ onAnalysisComplete, loading, setLoading }) => {
  const [activeTab, setActiveTab] = useState('paste');
  const [logContent, setLogContent] = useState('');
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Key, setS3Key] = useState('');
  const [s3Content, setS3Content] = useState('');
  const [showS3Preview, setShowS3Preview] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileLoad = async (selectedFile) => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setError('');
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setFileContent(content);
      setShowPreview(true);
      setLogContent(content); // Also set in logContent for analysis
    };
    reader.onerror = () => {
      setError('Failed to read file');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeFromPreview = () => {
    if (fileContent) {
      handlePasteAnalysis();
    }
  };

  const handleS3Load = async () => {
    if (!s3Key.trim()) {
      setError('Please enter S3 key');
      return;
    }

    setError('');
    setProgress('Loading from S3...');

    try {
      // Fetch the file content from S3 without analysis
      const response = await axios.post('/api/s3/load', {
        bucket: s3Bucket || undefined,
        key: s3Key
      });
      
      setS3Content(response.data.content);
      setShowS3Preview(true);
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load from S3');
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

  const handleClearS3 = () => {
    setS3Content('');
    setShowS3Preview(false);
    setS3Key('');
    setS3Bucket('');
  };

  const handleAnalyzeFromS3Preview = () => {
    if (s3Content) {
      setLogContent(s3Content);
      handlePasteAnalysis();
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
              {!showPreview ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Test Log File
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
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
                            <>Click to upload or drag and drop</>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          TXT or LOG files • Max 10MB
                        </p>
                      </label>
                    </div>
                  </div>
                  {file && !showPreview && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{file.name}</span>
                      </div>
                      <button
                        onClick={handleClearFile}
                        className="p-1 hover:bg-blue-100 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        File Loaded: {file?.name}
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
                      <label className="text-sm font-medium text-gray-700">
                        File Preview
                      </label>
                      <span className="text-xs text-gray-500">
                        {fileContent.length} characters • {fileContent.split('\n').length} lines
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
                        placeholder="File content will appear here..."
                      />
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Preview Mode</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAnalyzeFromPreview}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
                    >
                      Analyze File Content
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 's3' && (
            <div className="space-y-4">
              {!showS3Preview ? (
                <>
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
                  
                  {progress && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">{progress}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleS3Load}
                      disabled={!s3Key}
                      className="flex-1 py-3 px-4 bg-white border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load & Preview
                    </button>
                    <button
                      onClick={handleS3Fetch}
                      disabled={!s3Key}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Fetch & Analyze
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Loaded from S3: {s3Key}
                      </span>
                    </div>
                    <button
                      onClick={handleClearS3}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        S3 Content Preview
                      </label>
                      <span className="text-xs text-gray-500">
                        {s3Content.length} characters • {s3Content.split('\n').length} lines
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={s3Content}
                        onChange={(e) => setS3Content(e.target.value)}
                        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50"
                        placeholder="S3 content will appear here..."
                      />
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                          <Cloud className="w-3 h-3" />
                          <span>S3 Preview</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAnalyzeFromS3Preview}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
                    >
                      Analyze S3 Content
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
