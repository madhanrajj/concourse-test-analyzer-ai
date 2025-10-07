# Backend API Documentation

## Overview

The backend is a Node.js/Express REST API that parses test logs, integrates with AI providers, and manages test analysis.

## API Endpoints

### Analysis Endpoints

#### `POST /api/analyze`
Analyze test log content.

**Request Body:**
```json
{
  "logContent": "25 scenarios (1 failed, 24 passed)..."
}
```

**Response:**
```json
{
  "id": 1,
  "timestamp": "2024-10-07T...",
  "metrics": {
    "totalScenarios": 25,
    "passedScenarios": 24,
    "failedScenarios": 1,
    "successRate": 96
  },
  "failures": [...],
  "analyses": [...],
  "summary": {...}
}
```

#### `POST /api/analyze/file`
Upload and analyze a test log file.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file`

**Response:** Same as POST /api/analyze

#### `GET /api/analyze/:id`
Retrieve a specific analysis by ID.

#### `GET /api/analyze`
List all analyses.

### S3 Endpoints

#### `POST /api/s3/fetch`
Fetch test results from S3 and analyze.

**Request Body:**
```json
{
  "bucket": "my-bucket",
  "key": "path/to/test-results.txt"
}
```

#### `POST /api/s3/list`
List files in S3 bucket.

**Request Body:**
```json
{
  "bucket": "my-bucket",
  "prefix": "test-results/"
}
```

#### `GET /api/s3/status`
Check S3 configuration status.

### Health Check

#### `GET /health`
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-10-07T..."
}
```

## Environment Variables

Required:
- `PORT`: Server port (default: 3001)
- `AI_PROVIDER`: 'openai' or 'anthropic'
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: Your AI provider API key

Optional (for S3):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`

## AI Integration

### Supported Providers

1. **OpenAI (GPT-4)**
   - Model: `gpt-4-turbo-preview`
   - JSON response format
   - Temperature: 0.3

2. **Anthropic (Claude)**
   - Model: `claude-3-5-sonnet-20241022`
   - Max tokens: 2048
   - Temperature: 0.3

### AI Response Format

```json
{
  "rootCause": "string",
  "severity": "Critical|High|Medium|Low",
  "category": "Assertion Error|Timeout|API Error|Infrastructure|Data Issue",
  "isTestIssue": true,
  "impact": "string",
  "solutions": [
    {
      "priority": "High|Medium|Low",
      "title": "string",
      "code": "string",
      "explanation": "string"
    }
  ],
  "quickFix": {
    "file": "string",
    "line": 0,
    "currentCode": "string",
    "fixedCode": "string",
    "confidence": 95
  }
}
```

## Log Parser

The log parser extracts:
- Overall metrics (scenarios, steps, duration)
- Failure details (scenario name, error type, expected/received values)
- Stack traces
- File locations and line numbers

### Supported Format

Cucumber-style test output:
```
X scenarios (Y failed, Z passed)
X steps (Y failed, Z passed)
XmY.Zs

Scenario: Test name
  Error: error message
  Expected: "expected value"
  Received: "received value"
  at file.js:line:column
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## Testing

```bash
# Test the API
curl http://localhost:3001/health

# Test analysis endpoint
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"logContent": "your test log here"}'
```

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message",
  "details": "Additional details (dev only)"
}
```

Common status codes:
- `200`: Success
- `400`: Bad request (missing parameters, invalid format)
- `404`: Resource not found
- `500`: Server error (AI API failure, parsing error)
- `503`: Service unavailable (S3 not configured)
