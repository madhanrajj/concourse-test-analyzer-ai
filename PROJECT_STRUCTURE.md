# Project Structure

Complete file organization for the Test Automation AI Analyzer.

```
test-automation-ai-analyzer/
│
├── backend/                          # Node.js/Express Backend
│   ├── routes/
│   │   ├── analysis.js              # Analysis endpoints
│   │   └── s3.js                    # S3 integration endpoints
│   │
│   ├── utils/
│   │   ├── logParser.js             # Cucumber log parser
│   │   ├── aiAnalyzer.js            # AI integration (OpenAI/Claude)
│   │   └── s3Client.js              # AWS S3 client
│   │
│   ├── server.js                    # Express server entry point
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore rules
│   ├── Dockerfile                   # Docker configuration
│   └── README.md                    # Backend documentation
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadComponent.jsx  # Upload/paste/S3 fetch UI
│   │   │   ├── Dashboard.jsx        # Metrics dashboard
│   │   │   ├── FailuresList.jsx     # Failures table with filters
│   │   │   ├── AnalysisDetail.jsx   # Detailed AI analysis view
│   │   │   └── ExportReport.jsx     # Report export functionality
│   │   │
│   │   ├── App.jsx                  # Main application component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles with Tailwind
│   │
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # TailwindCSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── package.json                 # Frontend dependencies
│   ├── .gitignore                   # Git ignore rules
│   ├── Dockerfile                   # Docker configuration
│   ├── nginx.conf                   # Nginx configuration for Docker
│   └── README.md                    # Frontend documentation
│
├── docker-compose.yml               # Docker Compose orchestration
├── .dockerignore                    # Docker ignore rules
├── README.md                        # Main project documentation
├── QUICKSTART.md                    # Quick start guide
├── PROJECT_STRUCTURE.md             # This file
└── sample-test-log.txt              # Sample test log for testing
```

## Component Relationships

```
App.jsx
├── UploadComponent.jsx (when no results)
│   └── API calls to /api/analyze, /api/analyze/file, /api/s3/fetch
│
├── Dashboard.jsx (when results available)
│   └── Displays metrics and summary
│
├── FailuresList.jsx (when results available)
│   ├── ExportReport.jsx (export button)
│   └── Filters and failure items
│
└── AnalysisDetail.jsx (when failure selected)
    └── Tabs: Overview, Solutions, Quick Fix
```

## Data Flow

```
1. User Input
   ├── Paste text
   ├── Upload file
   └── Fetch from S3
        ↓
2. Backend Processing
   ├── LogParser extracts data
   ├── AIAnalyzer calls AI API
   └── Returns structured analysis
        ↓
3. Frontend Display
   ├── Dashboard shows metrics
   ├── FailuresList shows all issues
   └── AnalysisDetail shows AI recommendations
        ↓
4. Export
   └── Generate JSON/HTML reports
```

## API Routes

```
Backend (port 3001)
├── POST /api/analyze          → Analyze pasted content
├── POST /api/analyze/file     → Analyze uploaded file
├── GET  /api/analyze/:id      → Get specific analysis
├── GET  /api/analyze          → List all analyses
├── POST /api/s3/fetch         → Fetch and analyze from S3
├── POST /api/s3/list          → List S3 files
├── GET  /api/s3/status        → Check S3 configuration
└── GET  /health               → Health check

Frontend (port 3000)
└── /                          → React SPA (all routes)
    └── /api/*                 → Proxied to backend
```

## File Sizes (Approximate)

Backend:
- server.js: ~50 lines
- routes/analysis.js: ~150 lines
- routes/s3.js: ~100 lines
- utils/logParser.js: ~200 lines
- utils/aiAnalyzer.js: ~250 lines
- utils/s3Client.js: ~80 lines

Frontend:
- App.jsx: ~80 lines
- UploadComponent.jsx: ~250 lines
- Dashboard.jsx: ~200 lines
- FailuresList.jsx: ~180 lines
- AnalysisDetail.jsx: ~350 lines
- ExportReport.jsx: ~200 lines

## Technologies Used

### Backend
- **Express.js** 4.18.2 - Web framework
- **OpenAI** 4.20.0 - AI integration
- **@anthropic-ai/sdk** 0.20.0 - Claude AI integration
- **AWS SDK** 2.1400.0 - S3 integration
- **Multer** 1.4.5-lts.1 - File uploads
- **dotenv** 16.0.3 - Environment variables
- **cors** 2.8.5 - CORS handling

### Frontend
- **React** 18.2.0 - UI framework
- **Vite** 4.3.9 - Build tool
- **TailwindCSS** 3.4.0 - Styling
- **Axios** 1.6.0 - HTTP client
- **Lucide React** 0.263.1 - Icons
- **Recharts** 2.10.0 - Charts (for future use)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **Node.js** 18 Alpine - Runtime

## Key Features by File

### backend/utils/logParser.js
- Extract test metrics (pass/fail counts, duration)
- Parse scenario details
- Extract error messages and stack traces
- Calculate success rates

### backend/utils/aiAnalyzer.js
- Multi-provider support (OpenAI/Claude)
- Structured AI prompts
- JSON response parsing
- Fallback analysis when AI fails
- String similarity calculations

### backend/utils/s3Client.js
- S3 file fetching
- Bucket listing
- Configuration validation

### frontend/components/Dashboard.jsx
- Metric cards with icons
- Visual progress bars
- Color-coded status indicators
- Summary statistics

### frontend/components/AnalysisDetail.jsx
- Tabbed interface (Overview/Solutions/Quick Fix)
- Code diff display
- Copy-to-clipboard functionality
- Confidence score visualization

### frontend/components/ExportReport.jsx
- JSON export with full data
- HTML report generation
- Executive summary formatting
- Download functionality

## Environment Variables

### Backend (.env)
```
PORT=3001
AI_PROVIDER=anthropic|openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET=bucket-name
```

### Frontend
No environment variables needed (uses proxy to backend)

## Build Commands

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
```

### Docker
```bash
# All services
docker-compose up -d

# Individual services
docker-compose up backend
docker-compose up frontend
```

## Port Mapping

- **3000**: Frontend (development or nginx in production)
- **3001**: Backend API
- **80**: Frontend (nginx in Docker)

## Future Enhancements

Potential additions:
- Database integration (PostgreSQL/MongoDB)
- User authentication
- WebSocket for real-time updates
- Test history tracking
- Trend analysis
- Email notifications
- Slack/Teams integration
- Custom AI prompts
- Batch processing
- CI/CD integration plugins
