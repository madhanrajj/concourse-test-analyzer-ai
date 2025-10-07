const express = require('express');
const router = express.Router();
const LogParser = require('../utils/logParser');
const AIAnalyzer = require('../utils/aiAnalyzer');

// In-memory storage for analyses (in production, use a database)
const analyses = new Map();
let analysisIdCounter = 1;

/**
 * POST /api/analyze
 * Analyze test log content
 */
router.post('/', async (req, res) => {
  try {
    const { logContent } = req.body;

    if (!logContent) {
      return res.status(400).json({ error: 'logContent is required' });
    }

    // Parse the log
    const parsedData = LogParser.parse(logContent);

    // Analyze failures with AI
    const aiAnalyzer = new AIAnalyzer();
    const analyses = await aiAnalyzer.analyzeFailures(parsedData.failures);

    // Create analysis record
    const analysisId = analysisIdCounter++;
    const result = {
      id: analysisId,
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

    // Store for later retrieval
    analyses.set(analysisId, result);

    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze test log',
      details: error.message 
    });
  }
});

/**
 * POST /api/analyze/file
 * Analyze uploaded test log file
 */
router.post('/file', (req, res) => {
  const upload = req.app.locals.upload;
  
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed', details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const logContent = req.file.buffer.toString('utf-8');
      
      // Parse the log
      const parsedData = LogParser.parse(logContent);

      // Analyze failures with AI
      const aiAnalyzer = new AIAnalyzer();
      const failureAnalyses = await aiAnalyzer.analyzeFailures(parsedData.failures);

      // Create analysis record
      const analysisId = analysisIdCounter++;
      const result = {
        id: analysisId,
        timestamp: new Date().toISOString(),
        filename: req.file.originalname,
        metrics: parsedData.metrics,
        failures: parsedData.failures,
        analyses: failureAnalyses,
        summary: {
          totalIssues: parsedData.failures.length,
          criticalIssues: failureAnalyses.filter(a => a.analysis.severity === 'Critical').length,
          highIssues: failureAnalyses.filter(a => a.analysis.severity === 'High').length,
          testIssues: failureAnalyses.filter(a => a.analysis.isTestIssue).length,
          appIssues: failureAnalyses.filter(a => !a.analysis.isTestIssue).length
        }
      };

      // Store for later retrieval
      analyses.set(analysisId, result);

      res.json(result);
    } catch (error) {
      console.error('File analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze file',
        details: error.message 
      });
    }
  });
});

/**
 * GET /api/analyze/:id
 * Get analysis result by ID
 */
router.get('/:id', (req, res) => {
  const analysisId = parseInt(req.params.id);
  const result = analyses.get(analysisId);

  if (!result) {
    return res.status(404).json({ error: 'Analysis not found' });
  }

  res.json(result);
});

/**
 * GET /api/analyze
 * List all analyses
 */
router.get('/', (req, res) => {
  const allAnalyses = Array.from(analyses.values()).map(a => ({
    id: a.id,
    timestamp: a.timestamp,
    filename: a.filename,
    totalIssues: a.summary.totalIssues,
    criticalIssues: a.summary.criticalIssues,
    successRate: a.metrics.successRate
  }));

  res.json(allAnalyses);
});

module.exports = router;
