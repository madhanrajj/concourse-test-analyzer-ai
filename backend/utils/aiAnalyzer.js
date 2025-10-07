const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

/**
 * AI-powered test failure analyzer
 * Supports both OpenAI and Claude (Anthropic)
 */
class AIAnalyzer {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'anthropic';
    
    if (this.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else if (this.provider === 'anthropic') {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
  }

  /**
   * Analyze a single test failure
   * @param {Object} failure - Failure details from parser
   * @returns {Promise<Object>} AI analysis result
   */
  async analyzeFailure(failure) {
    try {
      const prompt = this.buildPrompt(failure);
      const analysis = await this.callAI(prompt);
      
      return {
        ...analysis,
        analyzedAt: new Date().toISOString(),
        confidence: analysis.quickFix?.confidence || 0
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return this.getFallbackAnalysis(failure);
    }
  }

  /**
   * Analyze multiple failures in batch
   */
  async analyzeFailures(failures) {
    const analyses = [];
    
    for (const failure of failures) {
      const analysis = await this.analyzeFailure(failure);
      analyses.push({
        failure,
        analysis
      });
    }

    return analyses;
  }

  /**
   * Build analysis prompt for AI
   */
  buildPrompt(failure) {
    return `Analyze this test failure and provide detailed recommendations:

TEST: ${failure.scenario}
FILE: ${failure.location}:${failure.line || 'unknown'}
ERROR TYPE: ${failure.errorType}
ERROR MESSAGE: ${failure.errorMessage}
EXPECTED: ${failure.expected || 'N/A'}
RECEIVED: ${failure.received || 'N/A'}
STACK TRACE: ${failure.stackTrace.slice(0, 3).join('\n')}

Respond in JSON format with this exact structure:
{
  "rootCause": "single sentence explanation of what went wrong",
  "severity": "Critical|High|Medium|Low",
  "category": "Assertion Error|Timeout|API Error|Infrastructure|Data Issue",
  "isTestIssue": true or false,
  "impact": "description of impact on system/users",
  "solutions": [
    {
      "priority": "High|Medium|Low",
      "title": "short title of solution",
      "code": "example code fix",
      "explanation": "why this works"
    }
  ],
  "quickFix": {
    "file": "${failure.location}",
    "line": ${failure.line || 0},
    "currentCode": "existing code that's failing",
    "fixedCode": "corrected code",
    "confidence": 0-100
  }
}

Provide at least 3 solutions with different priorities. Be specific and actionable.`;
  }

  /**
   * Call AI provider
   */
  async callAI(prompt) {
    if (this.provider === 'openai') {
      return await this.callOpenAI(prompt);
    } else if (this.provider === 'anthropic') {
      return await this.callAnthropic(prompt);
    } else {
      throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert test automation engineer. Analyze test failures and provide actionable solutions in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Call Anthropic (Claude) API
   */
  async callAnthropic(prompt) {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0].text;
    
    // Extract JSON from response (Claude might wrap it in markdown)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // Try to find JSON object in the response
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonContent = objectMatch[0];
      }
    }

    return JSON.parse(jsonContent);
  }

  /**
   * Fallback analysis when AI fails
   */
  getFallbackAnalysis(failure) {
    return {
      rootCause: `Test failed with ${failure.errorType}: ${failure.errorMessage}`,
      severity: this.estimateSeverity(failure),
      category: failure.errorType || 'Unknown',
      isTestIssue: this.isLikelyTestIssue(failure),
      impact: 'Unable to determine impact - AI analysis unavailable',
      solutions: [
        {
          priority: 'High',
          title: 'Review test assertion',
          code: '// Check expected vs received values',
          explanation: 'Manual review required'
        }
      ],
      quickFix: {
        file: failure.location,
        line: failure.line || 0,
        currentCode: '// AI analysis unavailable',
        fixedCode: '// Please review manually',
        confidence: 0
      },
      aiError: true
    };
  }

  /**
   * Estimate severity based on error type
   */
  estimateSeverity(failure) {
    if (failure.errorType === 'API Error' || failure.errorType === 'Infrastructure') {
      return 'High';
    } else if (failure.errorType === 'Timeout') {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  /**
   * Determine if likely a test issue vs application bug
   */
  isLikelyTestIssue(failure) {
    // If expected and received are very similar, likely test issue
    if (failure.expected && failure.received) {
      const similarity = this.calculateSimilarity(failure.expected, failure.received);
      return similarity > 0.8; // 80% similar = probably test assertion issue
    }
    return false;
  }

  /**
   * Calculate string similarity (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshtein(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshtein(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

module.exports = AIAnalyzer;
