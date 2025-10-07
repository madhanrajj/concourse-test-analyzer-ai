# Test Automation AI Analyzer - Phase 1

A full-stack application that uses AI to analyze failed tests and provide intelligent solutions. Built with React, Node.js, Express, and integrated with OpenAI/Claude AI.

## 🚀 Features

- **Intelligent Test Analysis**: Automatically parse Cucumber test logs and extract failure details
- **AI-Powered Insights**: Get root cause analysis, impact assessment, and solutions from OpenAI or Claude
- **Multiple Input Methods**: 
  - Paste log content directly
  - Upload test log files with **drag-and-drop** support
  - **Load & preview** files before analysis
  - Fetch results from AWS S3 with preview option
- **Comprehensive Dashboard**: Visual metrics showing pass/fail rates, duration, and success rates
- **Detailed Failure Analysis**: 
  - Categorized by severity (Critical, High, Medium, Low)
  - Categorized by type (Assertion Error, Timeout, API Error, Infrastructure)
  - Distinguishes between test issues and application bugs
- **Quick Fix Recommendations**: 
  - AI-generated code fixes with confidence scores
  - Multiple solution options ranked by priority
  - Copy-to-clipboard functionality
- **Export Reports**: Generate executive summaries in JSON or HTML format for leadership

## 📋 Prerequisites

- Node.js 16+ and npm
- OpenAI API key OR Anthropic (Claude) API key
- (Optional) AWS credentials for S3 integration

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```env
PORT=3001

# AI Provider Configuration
# Choose 'openai' or 'anthropic'
AI_PROVIDER=anthropic

# OpenAI Configuration (if using OpenAI)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic Configuration (if using Claude)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# AWS S3 Configuration (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET=comcast-iop-test-automation
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎯 Usage

### 1. Start Both Servers

Make sure both backend and frontend are running:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

### 2. Choose Input Method

**Option A: Paste Content**
- Copy your test log output
- Paste it into the text area
- Click "Analyze Logs"

**Option B: Upload File**
- **Drag and drop** your test log file onto the upload zone, OR
- Click the upload area to browse and select a file
- **Preview** the file content (edit if needed)
- Click "Analyze File Content"

**Option C: Fetch from S3**
- Enter your S3 bucket name (optional, uses default)
- Enter the object key (path to the file)
- Choose:
  - **"Load & Preview"** - Review content before analysis
  - **"Fetch & Analyze"** - Direct analysis
- Click "Analyze S3 Content" (if previewing)

### 3. View Results

The dashboard will show:
- **Overall Metrics**: Total tests, pass/fail counts, success rate, duration
- **Failure List**: All failures with severity badges and categories
- **Click on any failure** to see detailed AI analysis

### 4. Explore AI Analysis

For each failure, you'll see:
- **Overview**: Root cause, severity, impact assessment
- **Solutions**: Multiple fix options ranked by priority with code examples
- **Quick Fix**: Specific code changes with confidence scores

### 5. Export Reports

Click "Export JSON" or "Export Report" to generate:
- **JSON**: Machine-readable format with full analysis
- **HTML Report**: Executive summary that can be printed to PDF

## 📊 Example Test Log Format

The analyzer expects Cucumber-style test output:

```
25 scenarios (1 failed, 24 passed)
70 steps (1 failed, 69 passed)
0m54.214s

Scenario: AMA - INC API - Negative Scenario - Validate Forbidden error response
  Error: expect(received).toBe(expected)
  Expected: "User is not authorized to access this resource with an explicit deny"
  Received: "User is not authorized to access this resource with an explicit deny in an identity-based policy"
  at features/stepDefinitions/incident_validation.js:513:25
```

## 🔧 API Endpoints

### Backend API

- `POST /api/analyze` - Analyze pasted log content
  ```json
  {
    "logContent": "test log text..."
  }
  ```

- `POST /api/analyze/file` - Analyze uploaded file
  - Content-Type: `multipart/form-data`
  - Field: `file`

- `GET /api/analyze/:id` - Get analysis by ID

- `GET /api/analyze` - List all analyses

- `POST /api/s3/load` - Load S3 content for preview (no analysis)
  ```json
  {
    "bucket": "my-bucket",
    "key": "path/to/file.txt"
  }
  ```

- `POST /api/s3/fetch` - Fetch and analyze from S3
  ```json
  {
    "bucket": "my-bucket",
    "key": "path/to/file.txt"
  }
  ```

- `POST /api/s3/list` - List files in S3 bucket

- `GET /api/s3/status` - Check S3 configuration status

- `GET /health` - Health check endpoint

## 🏗️ Architecture

### Backend Stack
- **Express.js**: REST API server
- **OpenAI/Anthropic SDK**: AI analysis integration
- **AWS SDK**: S3 file fetching
- **Multer**: File upload handling

### Frontend Stack
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling
- **Axios**: HTTP client
- **Lucide React**: Icons
- **Recharts**: Charts (for future enhancements)

### Project Structure
```
.
├── backend/
│   ├── routes/
│   │   ├── analysis.js      # Analysis endpoints
│   │   └── s3.js            # S3 endpoints
│   ├── utils/
│   │   ├── logParser.js     # Test log parser
│   │   ├── aiAnalyzer.js    # AI integration
│   │   └── s3Client.js      # S3 client
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadComponent.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FailuresList.jsx
│   │   │   ├── AnalysisDetail.jsx
│   │   │   └── ExportReport.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🐳 Docker Support (Optional)

### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
Create `docker-compose.yml` in the root:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up -d
```

## 🔒 Security Considerations

- Never commit `.env` files to version control
- Rotate API keys regularly
- Use environment-specific configurations
- Implement rate limiting for production
- Add authentication for production deployments
- Validate and sanitize all user inputs

## 🚦 Error Handling

The application includes comprehensive error handling:

- **Invalid log format**: User-friendly error messages
- **AI API failures**: Fallback analysis with basic categorization
- **S3 connection issues**: Clear error messages with troubleshooting hints
- **Missing credentials**: Configuration status checks

## 📈 Future Enhancements (Phase 2+)

- **Database Integration**: PostgreSQL/MongoDB for persistent storage
- **User Authentication**: Multi-user support with role-based access
- **Test History**: Track trends over time
- **Real-time Updates**: WebSocket integration for live analysis
- **Slack/Teams Integration**: Notifications for critical failures
- **Custom AI Prompts**: Configurable analysis templates
- **Batch Processing**: Analyze multiple test runs simultaneously
- **CI/CD Integration**: GitHub Actions, Jenkins plugins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is MIT licensed.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- The React and Node.js communities

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing documentation
- Review API provider documentation (OpenAI/Anthropic)

---

**Built with ❤️ for better test automation**
