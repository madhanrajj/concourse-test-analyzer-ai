# Cucumber Report Format Support

## Overview
The Test Automation AI Analyzer now supports multiple Cucumber report formats, including structured HTML/text reports with tags, feature files, and various error formats.

## Supported Formats

### Format 1: Simple Cucumber Output (Original)
```
25 scenarios (1 failed, 24 passed)
70 steps (1 failed, 69 passed)
0m54.214s

Scenario: Validate error response
  Error: expect(received).toBe(expected)
  Expected: "User is not authorized"
  Received: "User is not authorized to access"
  at test.js:513:25
```

### Format 2: Structured Cucumber Report (NEW ✨)
```
1 failed
24 passed
25 executed
96% passed
duration
54 seconds

features/ama_incident.feature
@product_ama@persona_general@interface_api@Regression_AMA_API
Feature: AMA Incident Flow Testing

@TMTC0005119@Regression_AMA_Forbidden_Error
Scenario: AMA - INC API - Negative Scenario - Validate Forbidden error response
Given Incident creation payload with no scope
When Verify the response code is "403"
Then The incident creation fails with forbidden error message
Error expect(received).toBe(expected) // Object.is equality

Expected: "User is not authorized to access this resource with an explicit deny"
Received: "User is not authorized to access this resource with an explicit deny in an identity-based policy"
    at CustomWorld.<anonymous> (/tmp/build/edac63b5/ama-incident-api-lower-env/features/stepDefinitions/incident_validation.js:513:25)
```

## New Features

### 1. Feature File Tracking
- **Extracts**: `features/ama_incident.feature`
- **Displays**: In failure details and analysis view
- **Format**: Shows as badge in UI with folder icon

### 2. Tag Support
- **Extracts**: Multiple tags like `@TMTC0005119`, `@Regression_AMA_Forbidden_Error`
- **Displays**: As purple badges in failure list and detail view
- **Format**: Shows up to 3 tags inline, with "+X more" indicator

### 3. Enhanced Error Detection
Now detects additional error types:
- **Assertion Error**: `expect()`, `toBe()`, `toEqual()`, `toMatch()`
- **Authorization Error**: 403, Forbidden, 401, Unauthorized
- **API Error**: ECONNREFUSED, ENOTFOUND
- **Timeout**: timeout keywords
- **Runtime Error**: Everything else

### 4. Multiple Duration Formats
- **Format 1**: `0m54.214s` (original)
- **Format 2**: `duration\n54 seconds` (new)

### 5. Multiple Metrics Formats
- **Format 1**: `25 scenarios (1 failed, 24 passed)` (original)
- **Format 2**: 
  ```
  1 failed
  24 passed
  25 executed
  ```

### 6. Enhanced Path Parsing
Handles multiple file path formats:
- `at /tmp/build/edac63b5/project/features/stepDefinitions/file.js:513:25`
- `at features/stepDefinitions/file.js:513:25`
- `at CustomWorld.<anonymous> (/path/to/file.js:513:25)`

Automatically extracts the relevant portion starting from `features/` or `stepDefinitions/`.

## UI Enhancements

### Failure List View
```
┌─────────────────────────────────────────────────────────┐
│ 🔴 High  🟣 Assertion Error  🔵 Test Issue             │
│                                                         │
│ AMA - INC API - Validate Forbidden error response      │
│ 📂 features/ama_negative_validation.feature            │
│ @TMTC0005119 @Regression_AMA_Forbidden_Error +1 more   │
│                                                         │
│ Root Cause: Assertion checking exact string match...   │
│ 📁 features/stepDefinitions/incident_validation.js:513 │
│ 🎯 Confidence: 95%                                     │
└─────────────────────────────────────────────────────────┘
```

### Detail View
```
┌─────────────────────────────────────────────────────────┐
│ Error Details                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Scenario: AMA - INC API - Validate Forbidden error...  │
│                                                         │
│ Feature File:                                           │
│ ┌─────────────────────────────────────────────────┐   │
│ │ features/ama_negative_validation.feature        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Tags:                                                   │
│ @TMTC0005119  @Regression_AMA_Forbidden_Error         │
│ @product_ama                                           │
│                                                         │
│ Error Type: Authorization Error                        │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

## Parser Logic

### Feature File Detection
```javascript
if (line.match(/^features?\/[\w_-]+\.feature/i)) {
  currentFeature = line;
}
```

### Tag Extraction
```javascript
if (line.startsWith('@')) {
  currentTags = line.split('@')
    .filter(t => t.trim())
    .map(t => t.trim());
}
```

### Enhanced Error Detection
```javascript
if (line.startsWith('Error')) {
  // Handle "Error expect(received).toBe(expected)"
  if (line.includes('expect(')) {
    errorMessage = line.replace(/^Error\s*/, '').trim();
  }
  
  // Detect authorization errors
  if (line.includes('403') || line.includes('Forbidden')) {
    errorType = 'Authorization Error';
  }
}
```

### Path Cleaning
```javascript
let fullPath = '/tmp/build/edac63b5/project/features/stepDefinitions/file.js';
const pathParts = fullPath.split('/');
const featuresIndex = pathParts.findIndex(p => p === 'features');
if (featuresIndex !== -1) {
  fullPath = pathParts.slice(featuresIndex).join('/');
  // Result: 'features/stepDefinitions/file.js'
}
```

## Testing

### Sample Files Provided
1. `sample-test-log.txt` - Original format
2. `sample-cucumber-report.txt` - New structured format

### How to Test

**Test with your format:**
```bash
# Start backend and frontend
cd backend && npm start
cd frontend && npm run dev

# Go to http://localhost:3000
# Upload sample-cucumber-report.txt
# Or paste your actual test output
```

**Expected Results:**
- ✅ Metrics extracted correctly (1 failed, 24 passed, 25 total)
- ✅ Duration parsed (54 seconds)
- ✅ Feature files displayed
- ✅ Tags shown as purple badges
- ✅ Error type detected as "Authorization Error"
- ✅ File path cleaned to "features/stepDefinitions/..."

## API Response Format

### Failure Object (Enhanced)
```json
{
  "scenario": "AMA - INC API - Validate Forbidden error response",
  "feature": "features/ama_negative_validation.feature",
  "tags": [
    "TMTC0005119",
    "Regression_AMA_Forbidden_Error",
    "product_ama"
  ],
  "errorType": "Authorization Error",
  "expected": "User is not authorized to access this resource with an explicit deny",
  "received": "User is not authorized to access this resource with an explicit deny in an identity-based policy",
  "errorMessage": "expect(received).toBe(expected) // Object.is equality",
  "location": "features/stepDefinitions/incident_validation.js",
  "line": 513,
  "column": 25,
  "stackTrace": [
    "at CustomWorld.<anonymous> (/tmp/build/edac63b5/ama-incident-api-lower-env/features/stepDefinitions/incident_validation.js:513:25)"
  ]
}
```

## Backwards Compatibility

✅ **Fully Compatible** with all previous formats:
- Simple Cucumber output still works
- No breaking changes to API
- All existing features preserved
- Tags and features are optional fields (won't break if missing)

## AI Analysis Enhancement

The AI now receives additional context:
- **Feature file** - Helps understand the test context
- **Tags** - Helps categorize the issue
- **Error type** - Better classification (Authorization Error vs Assertion Error)

This leads to **more accurate AI recommendations** based on the full context!

## Color Coding

- **Feature Files**: Blue background, blue border
- **Tags**: Purple background, purple border
- **Error Types**: 
  - Authorization Error: Orange
  - Assertion Error: Purple
  - API Error: Red
  - Timeout: Yellow

## Future Enhancements

Potential improvements:
- 🔍 **Filter by tags** - Show only failures with specific tags
- 📊 **Group by feature** - Organize failures by feature file
- 🏷️ **Tag statistics** - Show which tags have most failures
- 🔗 **Clickable tags** - Filter/search by clicking tags
- 📁 **Feature file links** - Open in IDE/GitHub
- 🎨 **Custom tag colors** - Color-code by tag type

## Migration Guide

### For Existing Users

**No migration needed!** Just update your code:

```bash
cd backend && git pull && npm install
cd frontend && git pull && npm install
```

**Your old logs will still work**, but now you can also use:
- Structured Cucumber reports
- Reports with tags
- Reports with feature files

### For New Users

Just paste your Cucumber output - the parser will automatically detect the format!

---

**Version**: 1.2.0  
**Added**: 2024-10-07  
**Type**: Feature Enhancement  
**Breaking Changes**: None
