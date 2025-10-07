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

    // Parse scenario summary (handle multiple formats)
    // Format 1: "25 scenarios (1 failed, 24 passed)"
    // Format 2: "1 failed\n24 passed\n25 executed"
    
    const scenarioMatch = logContent.match(/(\d+)\s+scenarios?\s*\(([^)]+)\)/i);
    if (scenarioMatch) {
      metrics.totalScenarios = parseInt(scenarioMatch[1]);
      const details = scenarioMatch[2];
      
      const failedMatch = details.match(/(\d+)\s+failed/);
      const passedMatch = details.match(/(\d+)\s+passed/);
      
      if (failedMatch) metrics.failedScenarios = parseInt(failedMatch[1]);
      if (passedMatch) metrics.passedScenarios = parseInt(passedMatch[1]);
    } else {
      // Try alternative format with separate lines
      const failedMatch = logContent.match(/(\d+)\s+failed/i);
      const passedMatch = logContent.match(/(\d+)\s+passed/i);
      const executedMatch = logContent.match(/(\d+)\s+executed/i);
      
      if (executedMatch) metrics.totalScenarios = parseInt(executedMatch[1]);
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

    // Parse duration (handle multiple formats)
    // Format 1: "0m54.214s"
    // Format 2: "duration\n54 seconds"
    
    const durationMatch = logContent.match(/(\d+m[\d.]+s)/);
    if (durationMatch) {
      metrics.duration = durationMatch[1];
      metrics.durationSeconds = this.parseDuration(durationMatch[1]);
    } else {
      // Try alternative format
      const secondsMatch = logContent.match(/duration[:\s]+(\d+)\s+seconds?/i);
      if (secondsMatch) {
        const seconds = parseInt(secondsMatch[1]);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        metrics.duration = minutes > 0 ? `${minutes}m${remainingSeconds}s` : `${seconds}s`;
        metrics.durationSeconds = seconds;
      }
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
    let currentFeature = '';
    let currentTags = [];
    let collectingError = false;
    let collectingStackTrace = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Feature file path (features/ama_incident.feature)
      if (line.match(/^features?\/[\w_-]+\.feature/i)) {
        currentFeature = line;
      }

      // Tags (@product_ama, @TMTC0005119, etc.)
      if (line.startsWith('@')) {
        currentTags = line.split('@').filter(t => t.trim()).map(t => t.trim());
      }

      // Start of a scenario (handle both "Scenario:" and variations)
      if (line.match(/^Scenario:/i)) {
        currentFailure = {
          scenario: line.replace(/^Scenario:/i, '').trim(),
          feature: currentFeature,
          tags: [...currentTags],
          errorType: '',
          expected: '',
          received: '',
          errorMessage: '',
          location: '',
          stackTrace: []
        };
        collectingError = false;
        collectingStackTrace = false;
        currentTags = []; // Reset tags after scenario
      }

      // Error line (handle both "Error:" and "Error expect(received).toBe(expected)")
      if (line.startsWith('Error') && currentFailure) {
        collectingError = true;
        
        // Handle "Error expect(received).toBe(expected) // Object.is equality"
        if (line.includes('expect(')) {
          currentFailure.errorMessage = line.replace(/^Error\s*/, '').trim();
        } else {
          // Handle "Error: message"
          currentFailure.errorMessage = line.replace('Error:', '').trim();
        }
        
        // Determine error type
        if (currentFailure.errorMessage.includes('expect') || currentFailure.errorMessage.includes('toBe') || 
            currentFailure.errorMessage.includes('toEqual') || currentFailure.errorMessage.includes('toMatch')) {
          currentFailure.errorType = 'Assertion Error';
        } else if (currentFailure.errorMessage.includes('timeout')) {
          currentFailure.errorType = 'Timeout';
        } else if (currentFailure.errorMessage.includes('ECONNREFUSED') || currentFailure.errorMessage.includes('ENOTFOUND')) {
          currentFailure.errorType = 'API Error';
        } else if (currentFailure.errorMessage.includes('403') || currentFailure.errorMessage.includes('Forbidden') || 
                   currentFailure.errorMessage.includes('401') || currentFailure.errorMessage.includes('Unauthorized')) {
          currentFailure.errorType = 'Authorization Error';
        } else {
          currentFailure.errorType = 'Runtime Error';
        }
      }

      // Expected value (handle multi-line format)
      if (line.startsWith('Expected:') && currentFailure) {
        const expectedValue = line.replace('Expected:', '').trim().replace(/^["']|["']$/g, '');
        currentFailure.expected = expectedValue;
      }

      // Received value (handle multi-line format)
      if (line.startsWith('Received:') && currentFailure) {
        const receivedValue = line.replace('Received:', '').trim().replace(/^["']|["']$/g, '');
        currentFailure.received = receivedValue;
      }

      // File location with line number (handle multiple formats)
      // Format 1: "at /tmp/build/edac63b5/ama-incident-api-lower-env/features/stepDefinitions/incident_validation.js:513:25"
      // Format 2: "at features/stepDefinitions/incident_validation.js:513:25"
      // Format 3: "at CustomWorld.<anonymous> (/path/file.js:513:25)"
      if (line.includes('at ') && currentFailure && !currentFailure.location) {
        // Try format with full path in parentheses
        let locationMatch = line.match(/at\s+.*?\(([^\s]+):(\d+):(\d+)\)/);
        if (!locationMatch) {
          // Try simple format
          locationMatch = line.match(/at\s+([^\s(]+):(\d+):(\d+)/);
        }
        
        if (locationMatch) {
          let fullPath = locationMatch[1];
          // Extract just the relevant part of the path (after build directory or features/)
          const pathParts = fullPath.split('/');
          const featuresIndex = pathParts.findIndex(p => p === 'features' || p === 'stepDefinitions');
          if (featuresIndex !== -1) {
            fullPath = pathParts.slice(featuresIndex).join('/');
          }
          
          currentFailure.location = fullPath;
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
