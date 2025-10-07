const express = require('express');
const router = express.Router();
const S3Client = require('../utils/s3Client');
const LogParser = require('../utils/logParser');
const AIAnalyzer = require('../utils/aiAnalyzer');

/**
 * POST /api/s3/fetch
 * Fetch test results from S3 and analyze
 */
router.post('/fetch', async (req, res) => {
  try {
    const { bucket, key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'S3 key is required' });
    }

    const s3Client = new S3Client();

    if (!s3Client.isConfigured()) {
      return res.status(503).json({ 
        error: 'S3 is not configured',
        details: 'AWS credentials are missing in environment variables'
      });
    }

    // Fetch file from S3
    const logContent = await s3Client.fetchFile(bucket, key);

    // Parse the log
    const parsedData = LogParser.parse(logContent);

    // Analyze failures with AI
    const aiAnalyzer = new AIAnalyzer();
    const analyses = await aiAnalyzer.analyzeFailures(parsedData.failures);

    // Return result
    const result = {
      source: 's3',
      bucket: bucket || process.env.S3_BUCKET,
      key: key,
      timestamp: new Date().toISOString(),
      metrics: parsedData.metrics,
      failures: parsedData.failures,
      analyses: analyses,
      summary: {
        totalIssues: parsedData.failures.length,
        criticalIssues: analyses.filter(a => a.analysis.severity === 'Critical').length,
        highIssues: analyses.filter(a => a.analysis.severity === 'High').length,
        testIssues: analyses.filter(a => a.analysis.isTestIssue).length,
        appIssues: analyses.filter(a => !a.analysis.isTestIssue).length
      }
    };

    res.json(result);
  } catch (error) {
    console.error('S3 fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch and analyze from S3',
      details: error.message 
    });
  }
});

/**
 * POST /api/s3/list
 * List files in S3 bucket
 */
router.post('/list', async (req, res) => {
  try {
    const { bucket, prefix } = req.body;

    const s3Client = new S3Client();

    if (!s3Client.isConfigured()) {
      return res.status(503).json({ 
        error: 'S3 is not configured',
        details: 'AWS credentials are missing in environment variables'
      });
    }

    const files = await s3Client.listFiles(bucket, prefix);

    res.json({
      bucket: bucket || process.env.S3_BUCKET,
      prefix: prefix || '',
      files: files
    });
  } catch (error) {
    console.error('S3 list error:', error);
    res.status(500).json({ 
      error: 'Failed to list S3 files',
      details: error.message 
    });
  }
});

/**
 * GET /api/s3/status
 * Check S3 configuration status
 */
router.get('/status', (req, res) => {
  const s3Client = new S3Client();
  
  res.json({
    configured: s3Client.isConfigured(),
    bucket: process.env.S3_BUCKET || null,
    region: process.env.AWS_REGION || 'us-east-1'
  });
});

module.exports = router;
