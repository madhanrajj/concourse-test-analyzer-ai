import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';

const ExportReport = ({ data }) => {
  const [isExporting, setIsExporting] = useState(false);

  const generateExecutiveSummary = () => {
    const { metrics, summary, analyses } = data;

    const criticalIssues = analyses
      .filter(a => a.analysis.severity === 'Critical')
      .map(a => `- ${a.failure.scenario}: ${a.analysis.rootCause}`);

    const recommendations = analyses
      .slice(0, 5)
      .map(a => a.analysis.solutions[0])
      .filter(Boolean)
      .map((sol, idx) => `${idx + 1}. ${sol.title}: ${sol.explanation}`);

    return {
      timestamp: new Date().toISOString(),
      overallHealth: {
        successRate: metrics.successRate,
        status: metrics.successRate >= 90 ? 'Healthy' : metrics.successRate >= 70 ? 'Warning' : 'Critical',
        totalTests: metrics.totalScenarios,
        passed: metrics.passedScenarios,
        failed: metrics.failedScenarios,
        duration: metrics.duration
      },
      issues: {
        total: summary.totalIssues,
        critical: summary.criticalIssues,
        high: summary.highIssues,
        testIssues: summary.testIssues,
        applicationBugs: summary.appIssues
      },
      criticalIssues: criticalIssues,
      topRecommendations: recommendations,
      fullAnalysis: analyses.map(a => ({
        scenario: a.failure.scenario,
        severity: a.analysis.severity,
        category: a.analysis.category,
        rootCause: a.analysis.rootCause,
        isTestIssue: a.analysis.isTestIssue,
        impact: a.analysis.impact,
        quickFix: {
          file: a.analysis.quickFix?.file,
          line: a.analysis.quickFix?.line,
          confidence: a.analysis.quickFix?.confidence
        }
      }))
    };
  };

  const exportAsJSON = () => {
    setIsExporting(true);
    
    try {
      const summary = generateExecutiveSummary();
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-analysis-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = () => {
    setIsExporting(true);
    
    try {
      const summary = generateExecutiveSummary();
      
      // Generate HTML content for PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Analysis Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1d4ed8; margin-top: 30px; }
    h3 { color: #475569; }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 5px;
      font-weight: bold;
      margin: 10px 0;
    }
    .status-healthy { background-color: #dcfce7; color: #166534; }
    .status-warning { background-color: #fef3c7; color: #92400e; }
    .status-critical { background-color: #fee2e2; color: #991b1b; }
    .metric-box {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
    .metric-label { font-weight: bold; }
    .issue-item {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 10px;
      margin: 10px 0;
    }
    .recommendation {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 10px;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Test Automation Analysis Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  
  <div class="status-badge status-${summary.overallHealth.status.toLowerCase()}">
    ${summary.overallHealth.status.toUpperCase()}
  </div>

  <h2>Executive Summary</h2>
  <div class="metric-box">
    <div class="metric-row">
      <span class="metric-label">Success Rate:</span>
      <span>${summary.overallHealth.successRate}%</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Total Tests:</span>
      <span>${summary.overallHealth.totalTests}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Passed:</span>
      <span>${summary.overallHealth.passed}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Failed:</span>
      <span>${summary.overallHealth.failed}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Duration:</span>
      <span>${summary.overallHealth.duration}</span>
    </div>
  </div>

  <h2>Issues Breakdown</h2>
  <div class="metric-box">
    <div class="metric-row">
      <span class="metric-label">Critical Issues:</span>
      <span>${summary.issues.critical}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">High Priority:</span>
      <span>${summary.issues.high}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Test Issues:</span>
      <span>${summary.issues.testIssues}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">Application Bugs:</span>
      <span>${summary.issues.applicationBugs}</span>
    </div>
  </div>

  ${summary.criticalIssues.length > 0 ? `
  <h2>Critical Issues</h2>
  ${summary.criticalIssues.map(issue => `<div class="issue-item">${issue}</div>`).join('')}
  ` : ''}

  <h2>Top Recommendations</h2>
  ${summary.topRecommendations.map((rec, idx) => `<div class="recommendation">${rec}</div>`).join('')}

  <h2>Detailed Analysis</h2>
  <table>
    <thead>
      <tr>
        <th>Scenario</th>
        <th>Severity</th>
        <th>Category</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      ${summary.fullAnalysis.map(a => `
        <tr>
          <td>${a.scenario}</td>
          <td>${a.severity}</td>
          <td>${a.category}</td>
          <td>${a.isTestIssue ? 'Test Issue' : 'App Bug'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Test Automation AI Analyzer - Phase 1</p>
    <p>This report was automatically generated using AI analysis</p>
  </div>
</body>
</html>
      `;

      // Create downloadable HTML file (can be printed to PDF)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-analysis-report-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Note: For true PDF generation, you'd need a library like jsPDF or a backend service
      alert('HTML report downloaded. Open it in your browser and use Print > Save as PDF to generate a PDF.');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={exportAsJSON}
        disabled={isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        <FileText className="w-4 h-4" />
        <span>Export JSON</span>
      </button>
      <button
        onClick={exportAsPDF}
        disabled={isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>Export Report</span>
      </button>
    </div>
  );
};

export default ExportReport;
