import React from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle, Bug } from 'lucide-react';

const Dashboard = ({ data }) => {
  const { metrics, summary } = data;

  const cards = [
    {
      title: 'Total Tests',
      value: metrics.totalScenarios,
      icon: CheckCircle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Passed',
      value: metrics.passedScenarios,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Failed',
      value: metrics.failedScenarios,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRate}%`,
      icon: TrendingUp,
      color: metrics.successRate >= 90 ? 'green' : metrics.successRate >= 70 ? 'yellow' : 'red',
      bgColor: metrics.successRate >= 90 ? 'bg-green-50' : metrics.successRate >= 70 ? 'bg-yellow-50' : 'bg-red-50',
      iconColor: metrics.successRate >= 90 ? 'text-green-600' : metrics.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      title: 'Duration',
      value: metrics.duration,
      icon: Clock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Critical Issues',
      value: summary.criticalIssues,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Summary</h2>
          {metrics.successRate >= 90 ? (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Healthy
            </span>
          ) : (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              ⚠ Needs Attention
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Bug className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">Test Issues:</span>
            <span className="font-semibold">{summary.testIssues}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Bug className="w-4 h-4 text-orange-600" />
            <span className="text-gray-600">Application Issues:</span>
            <span className="font-semibold">{summary.appIssues}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">High Priority:</span>
            <span className="font-semibold">{summary.highIssues}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600">Total Steps:</span>
            <span className="font-semibold">{metrics.totalSteps}</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`w-8 h-8 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Scenarios</span>
              <span className="font-medium">
                {metrics.passedScenarios} passed, {metrics.failedScenarios} failed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-green-500"
                  style={{ width: `${(metrics.passedScenarios / metrics.totalScenarios) * 100}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${(metrics.failedScenarios / metrics.totalScenarios) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Steps</span>
              <span className="font-medium">
                {metrics.passedSteps} passed, {metrics.failedSteps} failed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-green-500"
                  style={{ width: `${(metrics.passedSteps / metrics.totalSteps) * 100}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${(metrics.failedSteps / metrics.totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
