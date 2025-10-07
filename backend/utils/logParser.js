/**
 * Parses Cucumber test logs and extracts structured data
 */

class LogParser {
  /**
   * Main parsing function
   * @param {string} logContent - Raw log content
   * @returns {Object} Parsed test data
   */
  static parse(logContent) {
    if (!logContent || typeof logContent !== 'string') {
      throw new Error('Invalid log content');
    }

    const lines = logContent.split('\n');
    const metrics = this.extractMetrics(logContent);
    const failures = this.extractFailures(lines);
    const scenarios = this.extractScenarios(lines);

    return {
      metrics,
      failures,
      scenarios,
      parsedAt: new Date().toISOString()
    };
  }

  /**
   * Extract overall test metrics
   */
  static extractMetrics(logContent) {
    const metrics = {
      totalScenarios: 0,
      passedScenarios: 0,
      failedScenarios: 0,
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      duration: '0s',
      successRate: 0
    };

    // Parse scenario summary: "25 scenarios (1 failed, 24 passed)"
    const scenarioMatch = logContent.match(/(\d+)\s+scenarios?\s*\(([^)]+)\)/i);
    if (scenarioMatch) {
      metrics.totalScenarios = parseInt(scenarioMatch[1]);
      const details = scenarioMatch[2];
      
      const failedMatch = details.match(/(\d+)\s+failed/);
      const passedMatch = details.match(/(\d+)\s+passed/);
      
      if (failedMatch) metrics.failedScenarios = parseInt(failedMatch[1]);
      if (passedMatch) metrics.passedScenarios = parseInt(passedMatch[1]);
    }

    // Parse step summary: "70 steps (1 failed, 69 passed)"
    const stepMatch = logContent.match(/(\d+)\s+steps?\s*\(([^)]+)\)/i);
    if (stepMatch) {
      metrics.totalSteps = parseInt(stepMatch[1]);
      const details = stepMatch[2];
      
      const failedMatch = details.match(/(\d+)\s+failed/);
      const passedMatch = details.match(/(\d+)\s+passed/);
      
      if (failedMatch) metrics.failedSteps = parseInt(failedMatch[1]);
      if (passedMatch) metrics.passedSteps = parseInt(passedMatch[1]);
    }

    // Parse duration: "0m54.214s"
    const durationMatch = logContent.match(/(\d+m[\d.]+s)/);
    if (durationMatch) {
      metrics.duration = durationMatch[1];
      metrics.durationSeconds = this.parseDuration(durationMatch[1]);
    }

    // Calculate success rate
    if (metrics.totalScenarios > 0) {
      metrics.successRate = Math.round((metrics.passedScenarios / metrics.totalScenarios) * 100);
    }

    return metrics;
  }

  /**
   * Extract failure details
   */
  static extractFailures(lines) {
    const failures = [];
    let currentFailure = null;
    let collectingError = false;
    let collectingStackTrace = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Start of a scenario
      if (line.startsWith('Scenario:')) {
        currentFailure = {
          scenario: line.replace('Scenario:', '').trim(),
          errorType: '',
          expected: '',
          received: '',
          errorMessage: '',
          location: '',
          stackTrace: []
        };
        collectingError = false;
        collectingStackTrace = false;
      }

      // Error line
      if (line.startsWith('Error:') && currentFailure) {
        collectingError = true;
        currentFailure.errorMessage = line.replace('Error:', '').trim();
        
        // Determine error type
        if (currentFailure.errorMessage.includes('expect')) {
          currentFailure.errorType = 'Assertion Error';
        } else if (currentFailure.errorMessage.includes('timeout')) {
          currentFailure.errorType = 'Timeout';
        } else if (currentFailure.errorMessage.includes('ECONNREFUSED') || currentFailure.errorMessage.includes('ENOTFOUND')) {
          currentFailure.errorType = 'API Error';
        } else {
          currentFailure.errorType = 'Runtime Error';
        }
      }

      // Expected value
      if (line.startsWith('Expected:') && currentFailure) {
        currentFailure.expected = line.replace('Expected:', '').trim().replace(/^["']|["']$/g, '');
      }

      // Received value
      if (line.startsWith('Received:') && currentFailure) {
        currentFailure.received = line.replace('Received:', '').trim().replace(/^["']|["']$/g, '');
      }

      // File location with line number
      if (line.match(/at\s+[\w/.]+:\d+:\d+/) && currentFailure) {
        const locationMatch = line.match(/at\s+([\w/.]+):(\d+):(\d+)/);
        if (locationMatch) {
          currentFailure.location = locationMatch[1];
          currentFailure.line = parseInt(locationMatch[2]);
          currentFailure.column = parseInt(locationMatch[3]);
          collectingStackTrace = true;
        }
      }

      // Collect stack trace
      if (collectingStackTrace && line.startsWith('at ')) {
        currentFailure.stackTrace.push(line);
      }

      // End of failure block - check if we found a complete failure
      if (currentFailure && currentFailure.location && (line === '' || i === lines.length - 1)) {
        if (currentFailure.errorMessage) {
          failures.push(currentFailure);
        }
        currentFailure = null;
        collectingError = false;
        collectingStackTrace = false;
      }
    }

    return failures;
  }

  /**
   * Extract all scenarios (passed and failed)
   */
  static extractScenarios(lines) {
    const scenarios = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('Scenario:')) {
        scenarios.push({
          name: line.replace('Scenario:', '').trim(),
          status: 'passed' // Will be updated if failure found
        });
      }
    }

    return scenarios;
  }

  /**
   * Convert duration string to seconds
   */
  static parseDuration(durationStr) {
    const match = durationStr.match(/(\d+)m([\d.]+)s/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      return minutes * 60 + seconds;
    }
    return 0;
  }
}

module.exports = LogParser;
